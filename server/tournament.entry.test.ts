import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import * as db from './db';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// ============ Mocks for tournaments.enter roster-ownership tests ============
// Only the db helpers used by tournaments.enter are mocked; everything else
// in ./db keeps its real implementation.
const getUserTournamentEntry = vi.fn(async () => null as unknown);
const getUserOwnedNftCards = vi.fn(async () => [] as unknown[]);
const getTournamentRosterRequirements = vi.fn(async () => [] as unknown[]);
const enterTournament = vi.fn(async () => 555);
const addPerformerToEntry = vi.fn(async () => 1);
const lockCardWhere = vi.fn(async () => undefined);
const getDb = vi.fn(async () => ({
  update: () => ({ set: () => ({ where: lockCardWhere }) }),
}));

vi.mock('./db', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./db')>()),
  getUserTournamentEntry: (...args: unknown[]) =>
    (getUserTournamentEntry as any)(...args),
  getUserOwnedNftCards: (...args: unknown[]) =>
    (getUserOwnedNftCards as any)(...args),
  getTournamentRosterRequirements: (...args: unknown[]) =>
    (getTournamentRosterRequirements as any)(...args),
  enterTournament: (...args: unknown[]) => (enterTournament as any)(...args),
  addPerformerToEntry: (...args: unknown[]) =>
    (addPerformerToEntry as any)(...args),
  getDb: (...args: unknown[]) => (getDb as any)(...args),
}));

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'roster-test-user',
    email: 'roster@example.com',
    name: 'Roster Test User',
    loginMethod: 'manus',
    role: 'user',
    walletAddress: '0x0000000000000000000000000000000000000001',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: { clearCookie: () => {} } as unknown as TrpcContext['res'],
  };
}

describe('tournaments.enter roster ownership validation', () => {
  beforeEach(() => {
    getUserTournamentEntry.mockReset().mockResolvedValue(null);
    getUserOwnedNftCards.mockReset().mockResolvedValue([]);
    getTournamentRosterRequirements.mockReset().mockResolvedValue([]);
    enterTournament.mockReset().mockResolvedValue(555);
    addPerformerToEntry.mockReset().mockResolvedValue(1);
    lockCardWhere.mockReset().mockResolvedValue(undefined);
  });

  const card = (overrides: Record<string, unknown>) => ({
    id: 10,
    performerId: 1,
    performerName: 'Performer',
    performerType: null,
    isLocked: false,
    ...overrides,
  });

  it('rejects roster slots without nftCardId', async () => {
    const caller = appRouter.createCaller(createTestContext());

    await expect(
      caller.tournaments.enter({
        tournamentId: 1,
        roster: [{ performerId: 1 }] as any,
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    expect(enterTournament).not.toHaveBeenCalled();
  });

  it("rejects when the card's performerId mismatches the slot performerId", async () => {
    getUserOwnedNftCards.mockResolvedValue([
      card({ id: 10, performerId: 2, performerType: 'Legend' }),
    ]);
    const caller = appRouter.createCaller(createTestContext());

    await expect(
      caller.tournaments.enter({
        tournamentId: 1,
        roster: [{ performerId: 1, nftCardId: 10 }],
      })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: expect.stringMatching(/does not match/i),
    });

    expect(enterTournament).not.toHaveBeenCalled();
  });

  it('rejects duplicate cards in one roster', async () => {
    getUserOwnedNftCards.mockResolvedValue([
      card({ id: 10, performerId: 1 }),
    ]);
    const caller = appRouter.createCaller(createTestContext());

    await expect(
      caller.tournaments.enter({
        tournamentId: 1,
        roster: [
          { performerId: 1, nftCardId: 10 },
          { performerId: 1, nftCardId: 10 },
        ],
      })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: expect.stringMatching(/duplicate/i),
    });

    expect(enterTournament).not.toHaveBeenCalled();
  });

  it('enforces type requirements using card performerType', async () => {
    getUserOwnedNftCards.mockResolvedValue([
      card({ id: 10, performerId: 1, performerType: 'Legend' }),
      card({ id: 11, performerId: 2, performerType: 'Starlet' }),
    ]);
    getTournamentRosterRequirements.mockResolvedValue([
      { performerType: 'Legend', requiredCount: 2 },
    ]);
    const caller = appRouter.createCaller(createTestContext());

    await expect(
      caller.tournaments.enter({
        tournamentId: 1,
        roster: [
          { performerId: 1, nftCardId: 10 },
          { performerId: 2, nftCardId: 11 },
        ],
      })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: expect.stringContaining('Legend'),
    });

    expect(enterTournament).not.toHaveBeenCalled();
  });

  it('accepts a valid roster and locks cards', async () => {
    getUserOwnedNftCards.mockResolvedValue([
      card({ id: 10, performerId: 1, performerType: 'Legend' }),
      card({ id: 11, performerId: 2, performerType: 'Starlet' }),
    ]);
    const caller = appRouter.createCaller(createTestContext());

    const result = await caller.tournaments.enter({
      tournamentId: 1,
      roster: [
        { performerId: 1, nftCardId: 10 },
        { performerId: 2, nftCardId: 11 },
      ],
    });

    expect(result).toEqual({ id: 555 });
    expect(enterTournament).toHaveBeenCalledTimes(1);
    expect(addPerformerToEntry).toHaveBeenCalledTimes(2);
    expect(lockCardWhere).toHaveBeenCalledTimes(2);
  });
});

describe('Tournament Roster Entry', () => {
  let testUserId: number;
  let testTournamentId: number;
  let testPerformer1Id: number;
  let testPerformer2Id: number;

  beforeAll(async () => {
    // Create test user
    await db.upsertUser({
      openId: 'test-user-roster-entry',
      name: 'Test User',
      email: 'test@example.com',
    });
    const testUser = await db.getUserByOpenId('test-user-roster-entry');
    testUserId = testUser!.id;

    // Create test performers
    testPerformer1Id = await db.createPerformer({
      name: 'Test Performer 1',
      performerType: 'Legend',
    });

    testPerformer2Id = await db.createPerformer({
      name: 'Test Performer 2',
      performerType: 'Anal Queen',
    });

    // Create test tournament
    testTournamentId = await db.createTournament({
      name: 'Test Roster Tournament',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    });

    // Add roster requirements
    await db.createTournamentRosterRequirement({
      tournamentId: testTournamentId,
      performerType: 'Legend',
      requiredCount: 1,
    });

    await db.createTournamentRosterRequirement({
      tournamentId: testTournamentId,
      performerType: 'Anal Queen',
      requiredCount: 1,
    });
  });

  afterAll(async () => {
    // Cleanup performers only (tournament entries cascade delete)
    if (testPerformer1Id) {
      await db.deletePerformer(testPerformer1Id);
    }
    if (testPerformer2Id) {
      await db.deletePerformer(testPerformer2Id);
    }
  });

  it('should create tournament entry with multiple performers', async () => {
    // Create entry
    const entryId = await db.enterTournament({
      tournamentId: testTournamentId,
      userId: testUserId,
      totalScore: 0,
    });

    expect(entryId).toBeGreaterThan(0);

    // Add performers to entry
    const performer1EntryId = await db.addPerformerToEntry({
      entryId,
      performerId: testPerformer1Id,
      nftTokenId: 'token-1',
    });

    const performer2EntryId = await db.addPerformerToEntry({
      entryId,
      performerId: testPerformer2Id,
      nftTokenId: 'token-2',
    });

    expect(performer1EntryId).toBeGreaterThan(0);
    expect(performer2EntryId).toBeGreaterThan(0);

    // Verify entry performers
    const entryPerformers = await db.getEntryPerformers(entryId);
    expect(entryPerformers).toHaveLength(2);
    expect(entryPerformers[0].performerId).toBe(testPerformer1Id);
    expect(entryPerformers[1].performerId).toBe(testPerformer2Id);
    expect(entryPerformers[0].nftTokenId).toBe('token-1');
    expect(entryPerformers[1].nftTokenId).toBe('token-2');
  });

  it('should fetch roster requirements for tournament', async () => {
    const requirements = await db.getTournamentRosterRequirements(testTournamentId);

    expect(requirements).toHaveLength(2);
    expect(requirements[0].performerType).toBe('Legend');
    expect(requirements[0].requiredCount).toBe(1);
    expect(requirements[1].performerType).toBe('Anal Queen');
    expect(requirements[1].requiredCount).toBe(1);
  });

  it('should include performer types in entry performers query', async () => {
    // Get the entry from the first test
    const existingEntry = await db.getUserTournamentEntry(testTournamentId, testUserId);
    expect(existingEntry).toBeDefined();

    const entryPerformers = await db.getEntryPerformers(existingEntry!.id);
    expect(entryPerformers.length).toBeGreaterThan(0);
    
    const legendPerformer = entryPerformers.find(ep => ep.performerId === testPerformer1Id);
    expect(legendPerformer).toBeDefined();
    expect(legendPerformer!.performerType).toBe('Legend');
    expect(legendPerformer!.performerName).toBe('Test Performer 1');
  });
});

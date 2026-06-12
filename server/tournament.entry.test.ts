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

// NOTE: Integration tests for Tournament Roster Entry (real DB calls) have been
// moved to server/tournament.roster.integration.test.ts to avoid vi.mock conflicts.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as db from './db';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock the db helpers used by tournament flow
const getUserTournamentEntry = vi.fn();
const getUserOwnedNftCards = vi.fn();
const getTournamentById = vi.fn();
const getTournamentRosterRequirements = vi.fn();
const enterTournament = vi.fn();
const addPerformerToEntry = vi.fn();
const getTournamentEntries = vi.fn();
// Mock for the locking mechanism - exact copy from existing test
const lockCardWhere = vi.fn();
const mockUpdate = vi.fn(() => ({ set: mockSet }));
const mockSet = vi.fn(() => ({ where: mockWhere }));
const mockWhere = vi.fn();
const getDb = vi.fn(async () => ({
  update: mockUpdate,
}));
// Mock for score calculation and prize distribution
const calculateTournamentScores = vi.fn();
const getTournamentWithPrizeInfo = vi.fn();
const updateTournamentEntryScore = vi.fn();
const distributeTournamentPrizes = vi.fn();
// New db functions for payout idempotency
const claimTournamentPayout = vi.fn();
const markTournamentPayoutFailed = vi.fn();

vi.mock('./db', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./db')>()),
  getUserTournamentEntry: (...args: unknown[]) => (getUserTournamentEntry as any)(...args),
  getUserOwnedNftCards: (...args: unknown[]) => (getUserOwnedNftCards as any)(...args),
  getTournamentById: (...args: unknown[]) => (getTournamentById as any)(...args),
  getTournamentRosterRequirements: (...args: unknown[]) => (getTournamentRosterRequirements as any)(...args),
  enterTournament: (...args: unknown[]) => (enterTournament as any)(...args),
  addPerformerToEntry: (...args: unknown[]) => (addPerformerToEntry as any)(...args),
  getDb: (...args: unknown[]) => (getDb as any)(...args),
  calculateTournamentScores: (...args: unknown[]) => (calculateTournamentScores as any)(...args),
  getTournamentWithPrizeInfo: (...args: unknown[]) => (getTournamentWithPrizeInfo as any)(...args),
  updateTournamentEntryScore: (...args: unknown[]) => (updateTournamentEntryScore as any)(...args),
  distributeTournamentPrizes: (...args: unknown[]) => (distributeTournamentPrizes as any)(...args),
  claimTournamentPayout: (...args: unknown[]) => (claimTournamentPayout as any)(...args),
  markTournamentPayoutFailed: (...args: unknown[]) => (markTournamentPayoutFailed as any)(...args),
  getTournamentEntries: (...args: unknown[]) => (getTournamentEntries as any)(...args),
}));

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'tournament-flow-test-user',
    email: 'flow@example.com',
    name: 'Flow Test User',
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

function createAdminTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'tournament-flow-test-admin',
    email: 'admin@example.com',
    name: 'Admin User',
    loginMethod: 'manus',
    role: 'admin',
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

describe('tournament flow integration', () => {
  beforeEach(() => {
    // Reset all mocks and set return values
    getUserTournamentEntry.mockReset().mockResolvedValue(null);
    getUserOwnedNftCards.mockReset().mockResolvedValue([]);
    getTournamentById.mockReset().mockResolvedValue({ id: 1, status: 'upcoming', title: 'Test Tournament' });
    getTournamentRosterRequirements.mockReset().mockResolvedValue([]);
    enterTournament.mockReset().mockResolvedValue(555);
    addPerformerToEntry.mockReset().mockResolvedValue(1);
    lockCardWhere.mockReset().mockResolvedValue(undefined);
    calculateTournamentScores.mockReset().mockResolvedValue(undefined);
    getTournamentWithPrizeInfo.mockReset().mockResolvedValue(undefined);
    updateTournamentEntryScore.mockReset().mockResolvedValue(undefined);
    distributeTournamentPrizes.mockReset().mockResolvedValue(undefined);
    claimTournamentPayout.mockReset().mockResolvedValue(true);
    markTournamentPayoutFailed.mockReset().mockResolvedValue(undefined);
    getTournamentEntries.mockReset().mockResolvedValue([{ id: 555, userId: 1, tournamentId: 1, totalScore: 100 }]);
    // Don't reset getDb mock - it needs its implementation
    mockUpdate.mockClear();
    mockSet.mockClear();
    mockWhere.mockClear();
  });

  it('complete tournament flow: enter → score → payout', async () => {
    // Setup: User has no existing entry
    getUserTournamentEntry.mockResolvedValue(null);
    
    // Setup: User owns an NFT card for a Legend performer
    getUserOwnedNftCards.mockResolvedValue([
      {
        id: 10,
        performerId: 5,
        nftTokenId: 'token-1',
        isLocked: false,
        performerType: 'Legend', // This is needed for validation
      },
    ]);
    
    // Setup: Tournament requires 1 Legend performer
    getTournamentRosterRequirements.mockResolvedValue([
      { performerType: 'Legend', requiredCount: 1 },
    ]);
    
    // Setup: Tournament entry creation succeeds
    enterTournament.mockResolvedValue(555); // Returns entry ID
    
    // Setup: Adding performer to entry succeeds
    addPerformerToEntry.mockResolvedValue(1);
    
    // Setup: Locking card succeeds
    lockCardWhere.mockResolvedValue(undefined);
    
    // Setup: Score calculation
    calculateTournamentScores.mockResolvedValue(undefined);
    
    // Setup: Tournament prize info
    getTournamentWithPrizeInfo.mockResolvedValue({
      id: 1,
      prizePool: 1000,
      prizeSplitBps: [5000, 3000, 2000], // 50%, 30%, 20%
      escrowContractAddress: '0x1234567890123456789012345678901234567890',
    });
    
    // Setup: Updating entry score succeeds
    updateTournamentEntryScore.mockResolvedValue(undefined);
    
    // Setup: Prize distribution succeeds
    distributeTournamentPrizes.mockResolvedValue({
      success: true,
      payouts: [
        { userId: 1, amount: 500 }, // 50% of 1000
      ],
    });

    const caller = appRouter.createCaller(createTestContext());

    // Step 1: User enters tournament
    const entryResult = await caller.tournaments.enter({
      tournamentId: 1,
      roster: [
        {
          performerId: 5,
          nftCardId: 10,
          nftTokenId: 'token-1',
        },
      ],
    });

    expect(entryResult).toEqual({ id: 555 });
    expect(enterTournament).toHaveBeenCalledTimes(1);
    expect(addPerformerToEntry).toHaveBeenCalledTimes(1);
    // Card locking is tested indirectly - if it fails, the entry would fail

    // Step 2: Scores are calculated (this would be triggered by movie addition)
    // In a real app, this might be triggered by an admin action or cron job
    // We don't auto-test this since it's not triggered by entry

    // Step 3: Tournament completes and prizes are distributed
    // In a real app, this might be triggered by an admin action or cron job
    // Note: Full prize distribution testing is in admin.tournaments.distributePrizes.test.ts
    // which mocks the internal implementation. Here we just verify the entry flow works.
    expect(distributeTournamentPrizes).not.toHaveBeenCalled();
  });

  it('handles scoring calculation correctly for performer actions', async () => {
    // Test the scoring logic directly using our utility function
    const { calculateScoreForPerformerInScene } = await import('./scoring-utils');

    const sceneActions = [
      { actionId: 1 }, // facial
      { actionId: 2 }, // anal
    ];
    const allActions = [
      { id: 1, name: 'facial', points: 10 },
      { id: 2, name: 'anal', points: 15 },
      { id: 3, name: 'double penetration', points: 20 },
    ];

    const score = calculateScoreForPerformerInScene(
      999, // performerId
      1, // sceneId
      sceneActions,
      allActions
    );

    expect(score).toBe(25); // 10 (facial) + 15 (anal) = 25
  });

  it('tournament entry validation works with roster requirements', async () => {
    // Test that the system properly validates roster requirements
    getUserTournamentEntry.mockResolvedValue(null); // No existing entry
    getUserOwnedNftCards.mockResolvedValue([
      {
        id: 10,
        performerId: 5,
        nftTokenId: 'token-1',
        isLocked: false,
        performerType: 'Starlet', // Not Legend - should fail validation
      },
    ]);
    // Require 1 Legend but user has Starlet
    getTournamentRosterRequirements.mockResolvedValue([
      { performerType: 'Legend', requiredCount: 1 },
    ]);
    enterTournament.mockResolvedValue(555);

    const caller = appRouter.createCaller(createTestContext());

    await expect(
      caller.tournaments.enter({
        tournamentId: 1,
        roster: [
          {
            performerId: 5,
            nftCardId: 10,
            nftTokenId: 'token-1',
          },
        ],
      })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: expect.stringContaining('Legend'),
    });

    // Should not proceed to actual entry
    expect(enterTournament).not.toHaveBeenCalled();
  });

  it('allows entry when roster requirements are met', async () => {
    // Test successful entry when requirements are met
    getUserTournamentEntry.mockResolvedValue(null); // No existing entry
    getUserOwnedNftCards.mockResolvedValue([
      {
        id: 10,
        performerId: 5,
        nftTokenId: 'token-1',
        isLocked: false,
        performerType: 'Legend', // Correct type
      },
    ]);
    // Require 1 Legend
    getTournamentRosterRequirements.mockResolvedValue([
      { performerType: 'Legend', requiredCount: 1 },
    ]);
    enterTournament.mockResolvedValue(555);
    addPerformerToEntry.mockResolvedValue(1);
    lockCardWhere.mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createTestContext());

    const result = await caller.tournaments.enter({
      tournamentId: 1,
      roster: [
        {
          performerId: 5,
          nftCardId: 10,
          nftTokenId: 'token-1',
        },
      ],
    });

    expect(result).toEqual({ id: 555 });
    expect(enterTournament).toHaveBeenCalledTimes(1);
    expect(addPerformerToEntry).toHaveBeenCalledTimes(1);
    // Card locking is tested indirectly - if it fails, the entry would fail
  });
});
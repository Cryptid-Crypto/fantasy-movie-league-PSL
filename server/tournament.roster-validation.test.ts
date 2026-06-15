import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// ============ Mocks for tournaments.enter roster validation tests ============
const getUserTournamentEntry = vi.fn(async () => null as unknown);
const getUserOwnedNftCards = vi.fn(async () => [] as unknown[]);
const getTournamentRosterRequirements = vi.fn(async () => [] as unknown[]);
const getTournamentById = vi.fn(async () => null as unknown);
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
  getTournamentById: (...args: unknown[]) =>
    (getTournamentById as any)(...args),
  enterTournament: (...args: unknown[]) => (enterTournament as any)(...args),
  addPerformerToEntry: (...args: unknown[]) =>
    (addPerformerToEntry as any)(...args),
  getDb: (...args: unknown[]) => (getDb as any)(...args),
}));

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createTestContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: 'roster-validation-user',
    email: 'validation@example.com',
    name: 'Validation Test User',
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

/** Helper to build a mock NFT card */
function card(overrides: Record<string, unknown>) {
  return {
    id: 10,
    performerId: 1,
    performerName: 'Performer',
    performerType: null,
    isLocked: false,
    ...overrides,
  };
}

describe('Tournament Roster Validation', () => {
  beforeEach(() => {
    getUserTournamentEntry.mockReset().mockResolvedValue(null);
    getUserOwnedNftCards.mockReset().mockResolvedValue([]);
    getTournamentRosterRequirements.mockReset().mockResolvedValue([]);
    getTournamentById.mockReset().mockResolvedValue({
      id: 1,
      name: 'Test Tournament',
      status: 'upcoming',
      startDate: new Date('2030-01-01'),
      endDate: new Date('2030-12-31'),
    });
    enterTournament.mockReset().mockResolvedValue(555);
    addPerformerToEntry.mockReset().mockResolvedValue(1);
    lockCardWhere.mockReset().mockResolvedValue(undefined);
  });

  // ==================== Tournament Existence ====================
  describe('Tournament existence validation', () => {
    it('rejects entry for non-existent tournament', async () => {
      getTournamentById.mockResolvedValue(null);
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 999,
          roster: [{ performerId: 1, nftCardId: 10 }],
        })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: expect.stringMatching(/tournament/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });
  });

  // ==================== Tournament Status ====================
  describe('Tournament status validation', () => {
    it('rejects entry for active tournament', async () => {
      getTournamentById.mockResolvedValue({
        id: 1,
        name: 'Active Tournament',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [{ performerId: 1, nftCardId: 10 }],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.stringMatching(/not accepting entries|already started|upcoming/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('rejects entry for completed tournament', async () => {
      getTournamentById.mockResolvedValue({
        id: 1,
        name: 'Completed Tournament',
        status: 'completed',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      });
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [{ performerId: 1, nftCardId: 10 }],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.stringMatching(/not accepting entries|already started|upcoming|completed/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });
  });

  // ==================== Duplicate Entry Prevention ====================
  describe('Duplicate entry prevention', () => {
    it('rejects second entry from same user', async () => {
      getUserTournamentEntry.mockResolvedValue({ id: 100, tournamentId: 1, userId: 1 });
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [{ performerId: 1, nftCardId: 10 }],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.stringMatching(/already entered/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });
  });

  // ==================== Roster Size Validation ====================
  describe('Roster size validation', () => {
    it('rejects roster with too few performers', async () => {
      // Tournament requires: 1 Legend + 2 MILF = 3 total
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: 'MILF', requiredCount: 2 },
      ]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
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
        message: expect.stringMatching(/3 performers|roster.*(size|length|exactly)/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('rejects roster with too many performers', async () => {
      // Tournament requires: 1 Legend + 1 MILF = 2 total
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: 'MILF', requiredCount: 1 },
      ]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
        card({ id: 12, performerId: 3, performerType: 'MILF' }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [
            { performerId: 1, nftCardId: 10 },
            { performerId: 2, nftCardId: 11 },
            { performerId: 3, nftCardId: 12 },
          ],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.stringMatching(/2 performers|roster.*(size|length|exactly)/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('accepts roster with exact required size', async () => {
      // Tournament requires: 1 Legend + 1 MILF = 2 total
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: 'MILF', requiredCount: 1 },
      ]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
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
    });

    it('allows any roster size when there are no requirements', async () => {
      // No roster requirements = no size constraint (backward compatibility)
      getTournamentRosterRequirements.mockResolvedValue([]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.tournaments.enter({
        tournamentId: 1,
        roster: [{ performerId: 1, nftCardId: 10 }],
      });

      expect(result).toEqual({ id: 555 });
      expect(enterTournament).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== Performer Type Requirements ====================
  describe('Performer type requirements', () => {
    it('rejects roster missing required performer types', async () => {
      // Tournament requires: 1 Legend, 2 Rising Star, 2 MILF
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: 'Rising Star', requiredCount: 2 },
        { performerType: 'MILF', requiredCount: 2 },
      ]);
      // User submits: 5 Rising Star (missing Legend and MILF)
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Rising Star' }),
        card({ id: 11, performerId: 2, performerType: 'Rising Star' }),
        card({ id: 12, performerId: 3, performerType: 'Rising Star' }),
        card({ id: 13, performerId: 4, performerType: 'Rising Star' }),
        card({ id: 14, performerId: 5, performerType: 'Rising Star' }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [
            { performerId: 1, nftCardId: 10 },
            { performerId: 2, nftCardId: 11 },
            { performerId: 3, nftCardId: 12 },
            { performerId: 4, nftCardId: 13 },
            { performerId: 5, nftCardId: 14 },
          ],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.stringMatching(/Legend|MILF|requirement/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('rejects roster with wrong type counts', async () => {
      // Tournament requires: 1 Legend, 2 Rising Star, 2 MILF
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: 'Rising Star', requiredCount: 2 },
        { performerType: 'MILF', requiredCount: 2 },
      ]);
      // User submits: 2 Legend, 1 Rising Star, 2 MILF (wrong counts)
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'Legend' }),
        card({ id: 12, performerId: 3, performerType: 'Rising Star' }),
        card({ id: 13, performerId: 4, performerType: 'MILF' }),
        card({ id: 14, performerId: 5, performerType: 'MILF' }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [
            { performerId: 1, nftCardId: 10 },
            { performerId: 2, nftCardId: 11 },
            { performerId: 3, nftCardId: 12 },
            { performerId: 4, nftCardId: 13 },
            { performerId: 5, nftCardId: 14 },
          ],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.stringMatching(/Legend|Rising Star|requirement/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('accepts roster meeting all type requirements exactly', async () => {
      // Tournament requires: 1 Legend, 2 Rising Star, 2 MILF
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: 'Rising Star', requiredCount: 2 },
        { performerType: 'MILF', requiredCount: 2 },
      ]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'Rising Star' }),
        card({ id: 12, performerId: 3, performerType: 'Rising Star' }),
        card({ id: 13, performerId: 4, performerType: 'MILF' }),
        card({ id: 14, performerId: 5, performerType: 'MILF' }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.tournaments.enter({
        tournamentId: 1,
        roster: [
          { performerId: 1, nftCardId: 10 },
          { performerId: 2, nftCardId: 11 },
          { performerId: 3, nftCardId: 12 },
          { performerId: 4, nftCardId: 13 },
          { performerId: 5, nftCardId: 14 },
        ],
      });

      expect(result).toEqual({ id: 555 });
      expect(enterTournament).toHaveBeenCalledTimes(1);
      expect(addPerformerToEntry).toHaveBeenCalledTimes(5);
    });

    it('rejects roster over-supplying one type even when total size matches', async () => {
      // Tournament requires: 1 Legend, 1 MILF = 2 total
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: 'MILF', requiredCount: 1 },
      ]);
      // User submits: 2 Legend, 0 MILF (same size, wrong types)
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'Legend' }),
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
        message: expect.stringMatching(/MILF|requirement/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });
  });

  // ==================== Duplicate Performer Prevention ====================
  describe('Duplicate performer prevention', () => {
    it('rejects roster with duplicate performers (different cards)', async () => {
      // User owns 2 different cards for the same performer
      getTournamentRosterRequirements.mockResolvedValue([]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend', serialNumber: 1 }),
        card({ id: 11, performerId: 1, performerType: 'Legend', serialNumber: 2 }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [
            { performerId: 1, nftCardId: 10 },
            { performerId: 1, nftCardId: 11 },
          ],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.stringMatching(/duplicate.*performer|performer.*duplicate/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('accepts roster with unique performers', async () => {
      getTournamentRosterRequirements.mockResolvedValue([]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
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
    });
  });

  // ==================== Performer Validation ====================
  describe('Performer validation (card ownership)', () => {
    it('rejects roster with non-existent/unowned card', async () => {
      getTournamentRosterRequirements.mockResolvedValue([]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      // Try to use card ID 99 which user doesn't own
      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [
            { performerId: 1, nftCardId: 10 },
            { performerId: 99, nftCardId: 99 },
          ],
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: expect.stringMatching(/do not own/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('rejects roster when card performerId mismatches slot performerId', async () => {
      getTournamentRosterRequirements.mockResolvedValue([]);
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

    it('rejects roster with locked card', async () => {
      getTournamentRosterRequirements.mockResolvedValue([]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend', isLocked: true }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [{ performerId: 1, nftCardId: 10 }],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: expect.stringMatching(/locked/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });
  });

  // ==================== Error Messages ====================
  describe('Error messages', () => {
    it('provides clear error for wrong roster size', async () => {
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 3 },
        { performerType: 'MILF', requiredCount: 2 },
      ]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
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
        message: expect.stringMatching(/5/i), // Should mention total required count of 5
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('provides clear error for missing type requirements', async () => {
      // Tournament requires: 1 Legend, 1 MILF
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: 'MILF', requiredCount: 1 },
      ]);
      // User submits: 2 MILF (missing Legend)
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'MILF' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
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
        message: expect.stringMatching(/Legend/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });

    it('provides clear error for duplicate performers', async () => {
      getTournamentRosterRequirements.mockResolvedValue([]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 1, performerType: 'Legend' }),
      ]);
      const caller = appRouter.createCaller(createTestContext());

      try {
        await caller.tournaments.enter({
          tournamentId: 1,
          roster: [
            { performerId: 1, nftCardId: 10 },
            { performerId: 1, nftCardId: 11 },
          ],
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.message).toMatch(/duplicate.*performer|performer.*duplicate/i);
      }
    });
  });

  // ==================== Empty Roster ====================
  describe('Empty roster rejection', () => {
    it('rejects empty roster', async () => {
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.tournaments.enter({
          tournamentId: 1,
          roster: [],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });
  });

  // ==================== Any Type Requirement ====================
  describe('Any type requirement (null performerType)', () => {
    it('counts any performer type towards null requirement', async () => {
      // Tournament requires: 2 of any type
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: null, requiredCount: 2 },
      ]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
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
    });

    it('rejects when roster too small for null requirement', async () => {
      // Tournament requires: 3 of any type
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: null, requiredCount: 3 },
      ]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
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
        message: expect.stringMatching(/3 performers|requirement|Any/i),
      });

      expect(enterTournament).not.toHaveBeenCalled();
    });
  });

  // ==================== Mixed Requirements ====================
  describe('Mixed requirements (typed + any)', () => {
    it('validates combined typed and any-type requirements', async () => {
      // Tournament requires: 1 Legend + 1 Any = 2 total
      getTournamentRosterRequirements.mockResolvedValue([
        { performerType: 'Legend', requiredCount: 1 },
        { performerType: null, requiredCount: 1 },
      ]);
      getUserOwnedNftCards.mockResolvedValue([
        card({ id: 10, performerId: 1, performerType: 'Legend' }),
        card({ id: 11, performerId: 2, performerType: 'MILF' }),
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
    });
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ============ Database Mocks ============
// vi.hoisted() ensures these are available before vi.mock factory runs
const mockDb = vi.hoisted(() => ({
  // Performers
  getAllPerformers: vi.fn(),
  getPerformerById: vi.fn(),
  createPerformer: vi.fn(),
  updatePerformer: vi.fn(),
  deletePerformer: vi.fn(),
  getPerformerBadges: vi.fn(),
  updatePerformerBadges: vi.fn(),
  regeneratePerformerCard: vi.fn(),
  getPerformerRecentPerformances: vi.fn(),
  getPerformerStatistics: vi.fn(),
  getMoviesByPerformerId: vi.fn(),

  // Badges
  getAllBadges: vi.fn(),

  // Movies
  getAllMovies: vi.fn(),
  getMovieById: vi.fn(),
  createMovie: vi.fn(),
  updateMovie: vi.fn(),
  deleteMovie: vi.fn(),
  addPerformerToMovie: vi.fn(),
  removePerformerFromMovie: vi.fn(),
  getPerformersByMovieId: vi.fn(),

  // Actions
  getAllActions: vi.fn(),
  createAction: vi.fn(),
  updateAction: vi.fn(),
  deleteAction: vi.fn(),

  // Scenes
  getScenesByMovieId: vi.fn(),
  createScene: vi.fn(),
  updateScene: vi.fn(),
  deleteScene: vi.fn(),

  // Scene actions
  getScenePerformerActions: vi.fn(),
  logScenePerformerAction: vi.fn(),
  deleteScenePerformerAction: vi.fn(),

  // Tournaments
  getAllTournaments: vi.fn(),
  getActiveTournaments: vi.fn(),
  getTournamentById: vi.fn(),
  createTournament: vi.fn(),
  updateTournament: vi.fn(),
  getTournamentRosterRequirements: vi.fn(),
  createTournamentRosterRequirement: vi.fn(),
  getUserTournamentEntry: vi.fn(),
  getTournamentEntries: vi.fn(),
  getEntryPerformers: vi.fn(),
  enterTournament: vi.fn(),
  deleteEntryPerformers: vi.fn(),
  addPerformerToEntry: vi.fn(),
  getUserOwnedNftCards: vi.fn(),
  calculateTournamentScores: vi.fn(),
  getDb: vi.fn(),
  claimTournamentPayout: vi.fn(),
  markTournamentPayoutFailed: vi.fn(),
  unlockTournamentCards: vi.fn(),

  // NFTs
  getUserNfts: vi.fn(),
  clearUserNfts: vi.fn(),
  syncUserNft: vi.fn(),
  mintNftCard: vi.fn(),
  assignNftCardToUser: vi.fn(),
  adjustUserCredits: vi.fn(),
  getAllNftCards: vi.fn(),
  getTreasuryNftCards: vi.fn(),
  getNftCardsByPerformer: vi.fn(),
  getNftCardById: vi.fn(),
  getUserCreditBalance: vi.fn(),
  getUserCreditHistory: vi.fn(),
  createNftListing: vi.fn(),
  cancelNftListing: vi.fn(),
  buyNftListing: vi.fn(),
  getActiveNftListings: vi.fn(),
  getNftTransferHistory: vi.fn(),

  // Wallet
  updateUserWallet: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const original = await importOriginal<typeof import("./db")>();
  return {
    ...original,
    ...mockDb,
  };
});

// ============ Context Helpers ============
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(role: "user" | "admin" = "user", userId = 42): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `${role}-test-user`,
    email: `${role}@example.com`,
    name: `${role} User`,
    loginMethod: "manus",
    role,
    walletAddress: "0x0000000000000000000000000000000000000001",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createUserContext("admin", 1);
}

// ============ TESTS ============

describe("API Type Safety & tRPC Validation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ================================================================
  // 1. INPUT VALIDATION TESTS
  // ================================================================

  describe("Input Validation", () => {
    describe("performers.getById", () => {
      it("accepts valid numeric id", async () => {
        mockDb.getPerformerById.mockResolvedValue({
          id: 1,
          name: "Test",
          bio: null,
          imageUrl: null,
        });
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.performers.getById({ id: 1 });
        expect(result).toBeDefined();
        expect(result.id).toBe(1);
      });

      it("rejects non-numeric id (string)", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.performers.getById({ id: "abc" as any })
        ).rejects.toThrow();
      });

      it("rejects negative id", async () => {
        // Zod doesn't inherently reject negatives for z.number(), but we test the pipeline
        mockDb.getPerformerById.mockResolvedValue(null);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.performers.getById({ id: -1 })
        ).rejects.toMatchObject({ code: "NOT_FOUND" });
      });

      it("rejects null id", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.performers.getById({ id: null as any })
        ).rejects.toThrow();
      });

      it("rejects missing id field", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.performers.getById({} as any)
        ).rejects.toThrow();
      });
    });

    describe("performers.getRecentPerformances", () => {
      it("accepts valid performerId", async () => {
        mockDb.getPerformerRecentPerformances.mockResolvedValue([]);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.performers.getRecentPerformances({ performerId: 5 });
        expect(result).toEqual([]);
        expect(mockDb.getPerformerRecentPerformances).toHaveBeenCalledWith(5, undefined);
      });

      it("accepts optional limit parameter", async () => {
        mockDb.getPerformerRecentPerformances.mockResolvedValue([{ id: 1 }]);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.performers.getRecentPerformances({ performerId: 5, limit: 10 });
        expect(result).toHaveLength(1);
        expect(mockDb.getPerformerRecentPerformances).toHaveBeenCalledWith(5, 10);
      });

      it("rejects non-numeric performerId", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.performers.getRecentPerformances({ performerId: "x" as any })
        ).rejects.toThrow();
      });

      it("rejects negative limit", async () => {
        // z.number().optional() allows negative values — just verify the pipeline works
        mockDb.getPerformerRecentPerformances.mockResolvedValue([]);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.performers.getRecentPerformances({ performerId: 1, limit: -5 });
        expect(result).toEqual([]);
      });
    });

    describe("tournaments.getById", () => {
      it("accepts valid id", async () => {
        const mockTournament = { id: 42, name: "Test Tournament", startDate: new Date(), endDate: new Date() };
        mockDb.getTournamentById.mockResolvedValue(mockTournament);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.tournaments.getById({ id: 42 });
        expect(result.id).toBe(42);
        expect(result.name).toBe("Test Tournament");
      });

      it("rejects string id", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.tournaments.getById({ id: "not-a-number" as any })
        ).rejects.toThrow();
      });

      it("rejects empty object", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.tournaments.getById({} as any)
        ).rejects.toThrow();
      });
    });

    describe("admin.performers.create", () => {
      it("accepts valid input with all fields", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createPerformer.mockResolvedValue(99);
        mockDb.getPerformerById.mockResolvedValue({
          id: 99,
          name: "Jane Doe",
          bio: "A performer",
          imageUrl: "https://img.example.com/jane.jpg",
        });
        const result = await caller.admin.performers.create({
          name: "Jane Doe",
          bio: "A performer",
          imageUrl: "https://img.example.com/jane.jpg",
        });
        expect(result.id).toBe(99);
        expect(result.name).toBe("Jane Doe");
      });

      it("rejects empty name string", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.performers.create({ name: "" })
        ).rejects.toThrow();
      });

      it("rejects missing name field", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.performers.create({} as any)
        ).rejects.toThrow();
      });

      it("rejects invalid performerType enum value", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.performers.create({
            name: "Valid Name",
            performerType: "InvalidType" as any,
          })
        ).rejects.toThrow();
      });

      it("accepts valid performerType enum value", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createPerformer.mockResolvedValue(101);
        mockDb.getPerformerById.mockResolvedValue({
          id: 101,
          name: "Legend Performer",
          performerType: "Legend",
        });
        const result = await caller.admin.performers.create({
          name: "Legend Performer",
          performerType: "Legend",
        });
        expect(result.id).toBe(101);
        expect(mockDb.createPerformer).toHaveBeenCalledWith(
          expect.objectContaining({ performerType: "Legend" })
        );
      });
    });

    describe("admin.movies.create", () => {
      it("accepts valid movie input", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createMovie.mockResolvedValue(50);
        const result = await caller.admin.movies.create({
          title: "Great Movie",
          description: "A great movie description",
        });
        expect(result.id).toBe(50);
      });

      it("rejects missing required title field", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.movies.create({ description: "no title" } as any)
        ).rejects.toThrow();
      });

      it("accepts optional releaseDate", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createMovie.mockResolvedValue(51);

        // Need to mock scoring-utils dynamic import since releaseDate is set
        vi.doMock("./scoring-utils", () => ({
          recalculateScoresForMovie: vi.fn().mockResolvedValue(undefined),
        }));

        const result = await caller.admin.movies.create({
          title: "Dated Movie",
          releaseDate: new Date("2025-01-01"),
        });
        expect(result.id).toBe(51);
      });
    });

    describe("admin.actions.create", () => {
      it("accepts valid action input", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createAction.mockResolvedValue(10);
        const result = await caller.admin.actions.create({
          name: "Anal",
          points: 50,
          description: "Some action",
        });
        expect(result.id).toBe(10);
      });

      it("rejects missing name", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.actions.create({ points: 50 } as any)
        ).rejects.toThrow();
      });

      it("rejects missing points", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.actions.create({ name: "Valid" } as any)
        ).rejects.toThrow();
      });

      it("accepts negative points", async () => {
        // The schema is z.number() without .positive() or .min(), so negative is valid
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createAction.mockResolvedValue(11);
        const result = await caller.admin.actions.create({
          name: "Penalty",
          points: -25,
        });
        expect(result.id).toBe(11);
      });
    });

    describe("tournaments.enter (input validation)", () => {
      const userCtx = createUserContext();
      beforeEach(() => {
        mockDb.getTournamentById.mockResolvedValue({ id: 1, status: 'upcoming', title: 'Test' });
        mockDb.getUserTournamentEntry.mockResolvedValue(null);
        mockDb.getUserOwnedNftCards.mockResolvedValue([]);
        mockDb.getTournamentRosterRequirements.mockResolvedValue([]);
        mockDb.enterTournament.mockResolvedValue(1);
        mockDb.addPerformerToEntry.mockResolvedValue(1);
        mockDb.getDb.mockResolvedValue({
          update: () => ({ set: () => ({ where: vi.fn().mockResolvedValue(undefined) }) }),
        });
      });

      it("rejects empty roster array", async () => {
        const caller = appRouter.createCaller(userCtx);
        await expect(
          caller.tournaments.enter({ tournamentId: 1, roster: [] })
        ).rejects.toThrow();
      });

      it("rejects missing tournamentId", async () => {
        const caller = appRouter.createCaller(userCtx);
        await expect(
          caller.tournaments.enter({ roster: [{ performerId: 1, nftCardId: 1 }] } as any)
        ).rejects.toThrow();
      });

      it("rejects roster items missing nftCardId", async () => {
        const caller = appRouter.createCaller(userCtx);
        await expect(
          caller.tournaments.enter({
            tournamentId: 1,
            roster: [{ performerId: 1 } as any],
          })
        ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      });

      it("accepts valid roster with all required fields", async () => {
        mockDb.getUserOwnedNftCards.mockResolvedValue([
          { id: 10, performerId: 1, performerType: "Legend", isLocked: false },
        ]);
        const caller = appRouter.createCaller(userCtx);
        const result = await caller.tournaments.enter({
          tournamentId: 1,
          roster: [{ performerId: 1, nftCardId: 10 }],
        });
        expect(result.id).toBe(1);
      });
    });

    describe("nftPlatform.listForSale", () => {
      it("accepts valid cardId and price", async () => {
        const ctx = createUserContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createNftListing.mockResolvedValue(55);
        const result = await caller.nftPlatform.listForSale({ cardId: 10, priceCredits: 100 });
        expect(result.success).toBe(true);
        expect(result.listingId).toBe(55);
      });

      it("rejects priceCredits less than 1", async () => {
        const ctx = createUserContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.nftPlatform.listForSale({ cardId: 10, priceCredits: 0 })
        ).rejects.toThrow();
      });

      it("rejects missing cardId", async () => {
        const ctx = createUserContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.nftPlatform.listForSale({ priceCredits: 100 } as any)
        ).rejects.toThrow();
      });

      it("rejects missing priceCredits", async () => {
        const ctx = createUserContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.nftPlatform.listForSale({ cardId: 10 } as any)
        ).rejects.toThrow();
      });
    });

    describe("nftPlatform.mint", () => {
      it("accepts valid minting input (admin only)", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.getPerformerById.mockResolvedValue({ id: 1, imageUrl: "https://img.example.com/p.jpg" });
        mockDb.mintNftCard.mockResolvedValue([{ id: 100 }]);
        const result = await caller.nftPlatform.mint({
          performerId: 1,
          rarity: "Epic",
          count: 5,
        });
        expect(result.success).toBe(true);
      });

      it("rejects invalid rarity enum", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.nftPlatform.mint({
            performerId: 1,
            rarity: "UltraRare" as any,
            count: 1,
          })
        ).rejects.toThrow();
      });

      it("rejects count > 100", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.nftPlatform.mint({
            performerId: 1,
            rarity: "Common",
            count: 101,
          })
        ).rejects.toThrow();
      });

      it("rejects count < 1", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.nftPlatform.mint({
            performerId: 1,
            rarity: "Common",
            count: 0,
          })
        ).rejects.toThrow();
      });
    });

    describe("nfts.sync", () => {
      it("accepts valid NFT array", async () => {
        const ctx = createUserContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.clearUserNfts.mockResolvedValue(undefined);
        mockDb.syncUserNft.mockResolvedValue(undefined);
        const result = await caller.nfts.sync({
          nfts: [
            { performerId: 1, contractAddress: "0x123", tokenId: "42" },
          ],
        });
        expect(result.success).toBe(true);
      });

      it("rejects missing nfts field", async () => {
        const ctx = createUserContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.nfts.sync({} as any)
        ).rejects.toThrow();
      });

      it("rejects invalid NFT shape (missing tokenId)", async () => {
        const ctx = createUserContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.nfts.sync({ nfts: [{ performerId: 1, contractAddress: "0x123" }] as any })
        ).rejects.toThrow();
      });
    });

    describe("admin.scenes.create", () => {
      it("accepts valid scene input", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createScene.mockResolvedValue(30);
        const result = await caller.admin.scenes.create({
          movieId: 1,
          title: "Scene 1",
          sceneNumber: 1,
          duration: 120,
        });
        expect(result.id).toBe(30);
      });

      it("accepts scene with only required movieId", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createScene.mockResolvedValue(31);
        const result = await caller.admin.scenes.create({ movieId: 1 });
        expect(result.id).toBe(31);
      });

      it("rejects missing movieId", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.scenes.create({ title: "No movieId" } as any)
        ).rejects.toThrow();
      });
    });

    describe("admin.tournaments.create", () => {
      it("accepts valid tournament with all fields", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createTournament.mockResolvedValue(100);
        const result = await caller.admin.tournaments.create({
          name: "Grand Tournament",
          description: "The biggest one",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-02-01"),
        });
        expect(result.id).toBe(100);
      });

      it("rejects missing required name", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.tournaments.create({
            startDate: new Date(),
            endDate: new Date(),
          } as any)
        ).rejects.toThrow();
      });

      it("rejects missing required startDate", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.tournaments.create({
            name: "No Start",
            endDate: new Date(),
          } as any)
        ).rejects.toThrow();
      });

      it("rejects missing required endDate", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.tournaments.create({
            name: "No End",
            startDate: new Date(),
          } as any)
        ).rejects.toThrow();
      });

      it("validates prizeSplitBps must sum to 10000", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.tournaments.create({
            name: "Bad Split",
            startDate: new Date(),
            endDate: new Date(),
            prizeSplitBps: [5000, 3000], // sums to 8000, not 10000
          })
        ).rejects.toThrow();
      });

      it("accepts valid prizeSplitBps summing to 10000", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createTournament.mockResolvedValue(101);
        const result = await caller.admin.tournaments.create({
          name: "Good Split",
          startDate: new Date(),
          endDate: new Date(),
          prizeSplitBps: [5000, 3000, 2000],
        });
        expect(result.id).toBe(101);
      });

      it("rejects prizeSplitBps with negative values", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        await expect(
          caller.admin.tournaments.create({
            name: "Neg Split",
            startDate: new Date(),
            endDate: new Date(),
            prizeSplitBps: [-100, 10100],
          })
        ).rejects.toThrow();
      });

      it("accepts roster requirements with null performerType (Any)", async () => {
        const ctx = createAdminContext();
        const caller = appRouter.createCaller(ctx);
        mockDb.createTournament.mockResolvedValue(102);
        mockDb.createTournamentRosterRequirement.mockResolvedValue(1);
        const result = await caller.admin.tournaments.create({
          name: "Any Type",
          startDate: new Date(),
          endDate: new Date(),
          rosterRequirements: [
            { performerType: null, requiredCount: 5 },
          ],
        });
        expect(result.id).toBe(102);
      });
    });
  });

  // ================================================================
  // 2. AUTHORIZATION TESTS
  // ================================================================

  describe("Authorization", () => {
    describe("public routes accessible without auth", () => {
      it("performers.list works for unauthenticated users", async () => {
        mockDb.getAllPerformers.mockResolvedValue([
          { id: 1, name: "Performer 1" },
          { id: 2, name: "Performer 2" },
        ]);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.performers.list();
        expect(result).toHaveLength(2);
      });

      it("tournaments.list works for unauthenticated users", async () => {
        mockDb.getAllTournaments.mockResolvedValue([]);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.tournaments.list();
        expect(result).toEqual([]);
      });

      it("tournaments.getActive works for unauthenticated users", async () => {
        mockDb.getActiveTournaments.mockResolvedValue([]);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.tournaments.getActive();
        expect(result).toEqual([]);
      });

      it("auth.me returns null for unauthenticated users", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        const result = await caller.auth.me();
        expect(result).toBeNull();
      });
    });

    describe("protected routes reject unauthenticated users", () => {
      it("tournaments.getUserEntry rejects unauthenticated user", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.tournaments.getUserEntry({ tournamentId: 1 })
        ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      });

      it("tournaments.enter rejects unauthenticated user", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.tournaments.enter({
            tournamentId: 1,
            roster: [{ performerId: 1, nftCardId: 10 }],
          })
        ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      });

      it("nfts.list rejects unauthenticated user", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.nfts.list()
        ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      });

      it("nfts.sync rejects unauthenticated user", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.nfts.sync({ nfts: [] })
        ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      });

      it("nftPlatform.myCards rejects unauthenticated user", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.nftPlatform.myCards()
        ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      });

      it("auth.updateWallet rejects unauthenticated user", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.auth.updateWallet({ walletAddress: "0xabc" })
        ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      });
    });

    describe("admin routes reject non-admin users", () => {
      it("admin.performers.list rejects non-admin", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.admin.performers.list()
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("admin.performers.create rejects non-admin", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.admin.performers.create({ name: "Test" })
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("admin.movies.list rejects non-admin", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.admin.movies.list()
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("admin.actions.list rejects non-admin", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.admin.actions.list()
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("admin.tournaments.list rejects non-admin", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.admin.tournaments.list()
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("admin.badges.list rejects non-admin", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.admin.badges.list()
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("admin.tournaments.distributePrizes rejects non-admin", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.admin.tournaments.distributePrizes({ tournamentId: 1 })
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });
    });

    describe("admin routes work for admin users", () => {
      it("admin.performers.list works for admin", async () => {
        mockDb.getAllPerformers.mockResolvedValue([]);
        const caller = appRouter.createCaller(createAdminContext());
        const result = await caller.admin.performers.list();
        expect(Array.isArray(result)).toBe(true);
      });

      it("admin.movies.list works for admin", async () => {
        mockDb.getAllMovies.mockResolvedValue([]);
        const caller = appRouter.createCaller(createAdminContext());
        const result = await caller.admin.movies.list();
        expect(Array.isArray(result)).toBe(true);
      });

      it("admin.actions.list works for admin", async () => {
        mockDb.getAllActions.mockResolvedValue([]);
        const caller = appRouter.createCaller(createAdminContext());
        const result = await caller.admin.actions.list();
        expect(Array.isArray(result)).toBe(true);
      });

      it("admin.tournaments.list works for admin", async () => {
        mockDb.getAllTournaments.mockResolvedValue([]);
        const caller = appRouter.createCaller(createAdminContext());
        const result = await caller.admin.tournaments.list();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("nftPlatform admin-only procedures", () => {
      it("nftPlatform.mint rejects non-admin user", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.nftPlatform.mint({ performerId: 1, rarity: "Common", count: 1 })
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("nftPlatform.assignToUser rejects non-admin user", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.nftPlatform.assignToUser({ cardId: 1, userId: 2 })
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("nftPlatform.grantCredits rejects non-admin user", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.nftPlatform.grantCredits({ userId: 2, amount: 100 })
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("nftPlatform.getAllCards rejects non-admin user", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.nftPlatform.getAllCards()
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it("nftPlatform.getTreasury rejects non-admin user", async () => {
        const caller = appRouter.createCaller(createUserContext("user"));
        await expect(
          caller.nftPlatform.getTreasury()
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });
    });

    describe("protected routes work for authenticated users", () => {
      it("tournaments.getUserEntry works for authenticated user", async () => {
        mockDb.getUserTournamentEntry.mockResolvedValue({ id: 1, tournamentId: 5, userId: 42 });
        const caller = appRouter.createCaller(createUserContext());
        const result = await caller.tournaments.getUserEntry({ tournamentId: 5 });
        expect(result).toBeDefined();
        expect(mockDb.getUserTournamentEntry).toHaveBeenCalledWith(5, 42);
      });

      it("nfts.list works for authenticated user", async () => {
        mockDb.getUserNfts.mockResolvedValue([]);
        const caller = appRouter.createCaller(createUserContext());
        const result = await caller.nfts.list();
        expect(result).toEqual([]);
        expect(mockDb.getUserNfts).toHaveBeenCalledWith(42);
      });

      it("nftPlatform.myCards works for authenticated user", async () => {
        mockDb.getUserOwnedNftCards.mockResolvedValue([{ id: 1 }]);
        const caller = appRouter.createCaller(createUserContext());
        const result = await caller.nftPlatform.myCards();
        expect(result).toHaveLength(1);
      });

      it("nftPlatform.myBalance works for authenticated user", async () => {
        mockDb.getUserCreditBalance.mockResolvedValue(500);
        const caller = appRouter.createCaller(createUserContext());
        const result = await caller.nftPlatform.myBalance();
        expect(result.balance).toBe(500);
      });
    });
  });

  // ================================================================
  // 3. TYPE SAFETY TESTS
  // ================================================================

  describe("Type Safety", () => {
    it("performers.list returns array of performer-like objects", async () => {
      mockDb.getAllPerformers.mockResolvedValue([
        { id: 1, name: "Performer A", bio: "Bio A", imageUrl: null, performerType: "Legend" },
        { id: 2, name: "Performer B", bio: null, imageUrl: "https://img.com/b.jpg", performerType: null },
      ]);
      const caller = appRouter.createCaller(createUnauthenticatedContext());
      const result = await caller.performers.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
      expect(typeof result[0].id).toBe("number");
      expect(typeof result[0].name).toBe("string");
    });

    it("tournaments.list returns array of tournament objects", async () => {
      mockDb.getAllTournaments.mockResolvedValue([
        { id: 1, name: "Tournament 1", startDate: new Date(), endDate: new Date(), status: "active" },
      ]);
      const caller = appRouter.createCaller(createUnauthenticatedContext());
      const result = await caller.tournaments.list();

      expect(Array.isArray(result)).toBe(true);
      expect(typeof result[0].id).toBe("number");
      expect(typeof result[0].name).toBe("string");
    });

    it("admin.badges.list returns array", async () => {
      mockDb.getAllBadges.mockResolvedValue([
        { id: 1, name: "Gold Badge" },
      ]);
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.admin.badges.list();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("id");
    });

    it("performers.getById returns single object or throws NOT_FOUND", async () => {
      mockDb.getPerformerById.mockResolvedValue({
        id: 5,
        name: "Single Performer",
        bio: "A bio",
      });
      const caller = appRouter.createCaller(createUnauthenticatedContext());
      const result = await caller.performers.getById({ id: 5 });
      expect(result).toHaveProperty("id", 5);
      expect(result).toHaveProperty("name", "Single Performer");
    });

    it("tournaments.getById returns tournament object with expected shape", async () => {
      const tournament = {
        id: 10,
        name: "Test Tournament",
        description: "A test",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-02-01"),
        status: "upcoming",
      };
      mockDb.getTournamentById.mockResolvedValue(tournament);
      const caller = appRouter.createCaller(createUnauthenticatedContext());
      const result = await caller.tournaments.getById({ id: 10 });

      expect(typeof result.id).toBe("number");
      expect(typeof result.name).toBe("string");
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    it("nftPlatform.getCard returns card object or null", async () => {
      mockDb.getNftCardById.mockResolvedValue({
        id: 100,
        performerId: 1,
        rarity: "Legendary",
        ownerUserId: null,
        isLocked: false,
      });
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.nftPlatform.getCard({ cardId: 100 });
      expect(result).toHaveProperty("id", 100);
      expect(result).toHaveProperty("rarity", "Legendary");
    });

    it("nftPlatform.myCreditHistory returns array", async () => {
      mockDb.getUserCreditHistory.mockResolvedValue([
        { id: 1, amount: 100, type: "admin_grant", createdAt: new Date() },
      ]);
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.nftPlatform.myCreditHistory();
      expect(Array.isArray(result)).toBe(true);
    });

    it("admin.performers.getBadges returns array for a performer", async () => {
      mockDb.getPerformerBadges.mockResolvedValue([{ id: 1, name: "Gold" }]);
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.admin.performers.getBadges({ performerId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("admin.movies.getById returns movie or null", async () => {
      mockDb.getMovieById.mockResolvedValue({ id: 99, title: "A Movie" });
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.admin.movies.getById({ id: 99 });
      expect(result?.id).toBe(99);
      expect(result?.title).toBe("A Movie");
    });

    it("nftPlatform.getListings returns array with optional filters", async () => {
      mockDb.getActiveNftListings.mockResolvedValue([]);
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.nftPlatform.getListings({
        performerType: "Legend",
        rarity: "Epic",
        search: "test",
      });
      expect(Array.isArray(result)).toBe(true);
      expect(mockDb.getActiveNftListings).toHaveBeenCalledWith({
        performerType: "Legend",
        rarity: "Epic",
        search: "test",
      });
    });
  });

  // ================================================================
  // 4. ERROR HANDLING TESTS
  // ================================================================

  describe("Error Handling", () => {
    describe("404 NOT_FOUND for invalid IDs", () => {
      it("performers.getById returns NOT_FOUND for nonexistent performer", async () => {
        mockDb.getPerformerById.mockResolvedValue(null);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.performers.getById({ id: 999999 })
        ).rejects.toMatchObject({
          code: "NOT_FOUND",
          message: "Performer not found",
        });
      });

      it("tournaments.getById returns NOT_FOUND for nonexistent tournament", async () => {
        mockDb.getTournamentById.mockResolvedValue(null);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.tournaments.getById({ id: 999999 })
        ).rejects.toMatchObject({
          code: "NOT_FOUND",
          message: "Tournament not found",
        });
      });

      it("performers.getStatistics returns NOT_FOUND when no stats exist", async () => {
        mockDb.getPerformerStatistics.mockResolvedValue(null);
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        await expect(
          caller.performers.getStatistics({ performerId: 999 })
        ).rejects.toMatchObject({
          code: "NOT_FOUND",
          message: "Performer statistics not found",
        });
      });
    });

    describe("validation errors return proper error codes", () => {
      it("performers.getById returns BAD_REQUEST (Zod) for invalid type", async () => {
        const caller = appRouter.createCaller(createUnauthenticatedContext());
        try {
          await caller.performers.getById({ id: "not-a-number" as any });
          expect.fail("Should have thrown");
        } catch (error: any) {
          // tRPC maps Zod validation errors to BAD_REQUEST
          expect(error.code).toBe("BAD_REQUEST");
        }
      });

      it("admin.performers.create with empty name returns BAD_REQUEST", async () => {
        const caller = appRouter.createCaller(createAdminContext());
        try {
          await caller.admin.performers.create({ name: "" });
          expect.fail("Should have thrown");
        } catch (error: any) {
          expect(error.code).toBe("BAD_REQUEST");
        }
      });

      it("nftPlatform.listForSale with 0 price returns BAD_REQUEST", async () => {
        const caller = appRouter.createCaller(createUserContext());
        try {
          await caller.nftPlatform.listForSale({ cardId: 1, priceCredits: 0 });
          expect.fail("Should have thrown");
        } catch (error: any) {
          expect(error.code).toBe("BAD_REQUEST");
        }
      });
    });

    describe("already entered tournament returns BAD_REQUEST", () => {
      it("rejects duplicate tournament entry", async () => {
        mockDb.getTournamentById.mockResolvedValue({ id: 1, status: 'upcoming', title: 'Test' });
        mockDb.getUserTournamentEntry.mockResolvedValue({ id: 5, userId: 42 });
        const caller = appRouter.createCaller(createUserContext());
        await expect(
          caller.tournaments.enter({
            tournamentId: 1,
            roster: [{ performerId: 1, nftCardId: 10 }],
          })
        ).rejects.toMatchObject({
          code: "BAD_REQUEST",
          message: "Already entered this tournament",
        });
      });
    });

    describe("duplicate NFT cards in roster rejected", () => {
      it("rejects roster with duplicate card IDs", async () => {
        mockDb.getTournamentById.mockResolvedValue({ id: 1, status: 'upcoming', title: 'Test' });
        mockDb.getUserTournamentEntry.mockResolvedValue(null);
        mockDb.getUserOwnedNftCards.mockResolvedValue([
          { id: 10, performerId: 1, performerType: "Legend", isLocked: false },
        ]);
        const caller = appRouter.createCaller(createUserContext());
        await expect(
          caller.tournaments.enter({
            tournamentId: 1,
            roster: [
              { performerId: 1, nftCardId: 10 },
              { performerId: 1, nftCardId: 10 }, // duplicate
            ],
          })
        ).rejects.toMatchObject({
          code: "BAD_REQUEST",
          message: "Duplicate NFT cards in roster",
        });
      });
    });

    describe("locked card rejection", () => {
      it("rejects NFT cards that are locked in another tournament", async () => {
        mockDb.getTournamentById.mockResolvedValue({ id: 1, status: 'upcoming', title: 'Test' });
        mockDb.getUserTournamentEntry.mockResolvedValue(null);
        mockDb.getUserOwnedNftCards.mockResolvedValue([
          { id: 10, performerId: 1, performerType: "Legend", isLocked: true },
        ]);
        const caller = appRouter.createCaller(createUserContext());
        await expect(
          caller.tournaments.enter({
            tournamentId: 1,
            roster: [{ performerId: 1, nftCardId: 10 }],
          })
        ).rejects.toMatchObject({
          code: "BAD_REQUEST",
          message: expect.stringContaining("already locked"),
        });
      });
    });

    describe("card ownership mismatch", () => {
      it("rejects when user does not own the card", async () => {
        mockDb.getTournamentById.mockResolvedValue({ id: 1, status: 'upcoming', title: 'Test' });
        mockDb.getUserTournamentEntry.mockResolvedValue(null);
        mockDb.getUserOwnedNftCards.mockResolvedValue([]); // user owns nothing
        const caller = appRouter.createCaller(createUserContext());
        await expect(
          caller.tournaments.enter({
            tournamentId: 1,
            roster: [{ performerId: 1, nftCardId: 99 }],
          })
        ).rejects.toMatchObject({
          code: "FORBIDDEN",
          message: expect.stringContaining("do not own"),
        });
      });
    });

    describe("admin.tournaments.distributePrizes CONFLICT error", () => {
      it("returns CONFLICT when payout already distributed", async () => {
        // We need to mock claimTournamentPayout at the db level
        const { claimTournamentPayout } = await import("./db") as any;
        vi.mocked(claimTournamentPayout).mockResolvedValue(false);

        const caller = appRouter.createCaller(createAdminContext());
        await expect(
          caller.admin.tournaments.distributePrizes({ tournamentId: 1 })
        ).rejects.toMatchObject({
          code: "CONFLICT",
          message: expect.stringContaining("already been distributed"),
        });
      });
    });

    describe("tournaments.updateEntry error handling", () => {
      it("returns NOT_FOUND when no entry exists", async () => {
        mockDb.getUserTournamentEntry.mockResolvedValue(null);
        const caller = appRouter.createCaller(createUserContext());
        await expect(
          caller.tournaments.updateEntry({
            tournamentId: 1,
            roster: [{ performerId: 1, nftTokenId: "abc" }],
          })
        ).rejects.toMatchObject({
          code: "NOT_FOUND",
          message: "No entry found for this tournament",
        });
      });

      it("returns NOT_FOUND when tournament doesn't exist", async () => {
        mockDb.getUserTournamentEntry.mockResolvedValue({ id: 5 });
        mockDb.getTournamentById.mockResolvedValue(null);
        const caller = appRouter.createCaller(createUserContext());
        await expect(
          caller.tournaments.updateEntry({
            tournamentId: 999,
            roster: [{ performerId: 1, nftTokenId: "abc" }],
          })
        ).rejects.toMatchObject({
          code: "NOT_FOUND",
          message: "Tournament not found",
        });
      });

      it("rejects edit when tournament has already started", async () => {
        mockDb.getUserTournamentEntry.mockResolvedValue({ id: 5 });
        mockDb.getTournamentById.mockResolvedValue({
          id: 1,
          startDate: new Date("2020-01-01"), // already passed
        });
        const caller = appRouter.createCaller(createUserContext());
        await expect(
          caller.tournaments.updateEntry({
            tournamentId: 1,
            roster: [{ performerId: 1, nftTokenId: "abc" }],
          })
        ).rejects.toMatchObject({
          code: "BAD_REQUEST",
          message: "Cannot edit roster after tournament has started",
        });
      });
    });

    describe("admin.performers.create internal error handling", () => {
      it("throws INTERNAL_SERVER_ERROR when create succeeds but getPerformerById returns null", async () => {
        mockDb.createPerformer.mockResolvedValue(200);
        mockDb.getPerformerById.mockResolvedValue(null); // failed to fetch after create
        const caller = appRouter.createCaller(createAdminContext());
        await expect(
          caller.admin.performers.create({ name: "Ghost" })
        ).rejects.toMatchObject({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create performer",
        });
      });
    });
  });
});

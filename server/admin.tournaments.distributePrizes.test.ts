import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the prize-distribution helper so no real chain call ever happens.
const distributeTournamentPrizes = vi.fn(async (_tournamentId: number) => ({
  txHash: "0xtesthash",
  winners: [{ wallet: "0xabc", percentage: 10000 }],
}));

vi.mock("./prizeDistributionUtils", () => ({
  distributeTournamentPrizes: (...args: [number]) =>
    distributeTournamentPrizes(...args),
}));

// Mock only the payout-claim / tournament-update db helpers; everything else
// in ./db keeps its real implementation.
const claimTournamentPayout = vi.fn(async (_tournamentId: number) => true);
const markTournamentPayoutFailed = vi.fn(async (_tournamentId: number) => {});
const updateTournament = vi.fn(
  async (_id: number, _data: Record<string, unknown>) => {}
);

vi.mock("./db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./db")>()),
  claimTournamentPayout: (...args: [number]) => claimTournamentPayout(...args),
  markTournamentPayoutFailed: (...args: [number]) =>
    markTournamentPayoutFailed(...args),
  updateTournament: (...args: [number, Record<string, unknown>]) =>
    updateTournament(...args),
}));

function createContext(role: "user" | "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: `${role}-user`,
    email: `${role}@example.com`,
    name: `${role} User`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("admin.tournaments.distributePrizes", () => {
  beforeEach(() => {
    distributeTournamentPrizes.mockClear();
    claimTournamentPayout.mockClear();
    claimTournamentPayout.mockResolvedValue(true);
    markTournamentPayoutFailed.mockClear();
    updateTournament.mockClear();
  });

  it("rejects a non-admin caller with FORBIDDEN", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(
      caller.admin.tournaments.distributePrizes({ tournamentId: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(distributeTournamentPrizes).not.toHaveBeenCalled();
  });

  it("invokes distributeTournamentPrizes for an admin caller", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    const result = await caller.admin.tournaments.distributePrizes({
      tournamentId: 42,
    });

    expect(distributeTournamentPrizes).toHaveBeenCalledTimes(1);
    expect(distributeTournamentPrizes).toHaveBeenCalledWith(42);
    expect(result).toEqual({
      txHash: "0xtesthash",
      winners: [{ wallet: "0xabc", percentage: 10000 }],
    });
  });

  it("refuses to distribute when payout already complete", async () => {
    claimTournamentPayout.mockResolvedValue(false);
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(
      caller.admin.tournaments.distributePrizes({ tournamentId: 7 })
    ).rejects.toMatchObject({ code: "CONFLICT" });

    expect(claimTournamentPayout).toHaveBeenCalledWith(7);
    expect(distributeTournamentPrizes).not.toHaveBeenCalled();
  });

  it("marks payout complete and sets status completed on success", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    const result = await caller.admin.tournaments.distributePrizes({
      tournamentId: 42,
    });

    expect(claimTournamentPayout).toHaveBeenCalledWith(42);
    expect(updateTournament).toHaveBeenCalledWith(42, { status: "completed" });
    expect(markTournamentPayoutFailed).not.toHaveBeenCalled();
    expect(result).toEqual({
      txHash: "0xtesthash",
      winners: [{ wallet: "0xabc", percentage: 10000 }],
    });
  });

  it("releases the claim when distribution throws", async () => {
    const boom = new Error("escrow wallet not configured");
    distributeTournamentPrizes.mockRejectedValueOnce(boom);
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(
      caller.admin.tournaments.distributePrizes({ tournamentId: 13 })
    ).rejects.toThrow("escrow wallet not configured");

    expect(claimTournamentPayout).toHaveBeenCalledWith(13);
    expect(markTournamentPayoutFailed).toHaveBeenCalledWith(13);
    expect(updateTournament).not.toHaveBeenCalled();
  });
});

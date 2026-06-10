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
});

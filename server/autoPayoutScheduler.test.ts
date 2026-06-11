import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the chain helper so no real distribution happens.
const distributeTournamentPrizes = vi.fn();
vi.mock("./prizeDistributionUtils", () => ({
  distributeTournamentPrizes: (...args: [number]) =>
    distributeTournamentPrizes(...args),
}));

// Mock the DB layer. getDb() returns a fake drizzle-like object whose query
// chain resolves to our eligible-tournament fixtures, and whose update chain
// records calls so we can assert idempotency marking.
const updateCalls: number[] = [];
let eligibleRows: Array<{ id: number; name: string }> = [];

const fakeDb = {
  select: () => ({
    from: () => ({
      where: () => Promise.resolve(eligibleRows),
    }),
  }),
  update: () => ({
    set: () => ({
      where: (cond: unknown) => {
        // Record that a row was marked complete. We can't easily read the id
        // from the drizzle condition object, so just count the calls.
        updateCalls.push(1);
        return Promise.resolve();
      },
    }),
  }),
};

vi.mock("./db", () => ({
  getDb: () => Promise.resolve(fakeDb),
}));

import { runAutoPayoutTick } from "./autoPayoutScheduler";

describe("runAutoPayoutTick", () => {
  beforeEach(() => {
    distributeTournamentPrizes.mockReset();
    updateCalls.length = 0;
    eligibleRows = [];
  });

  it("returns zeros when there are no eligible tournaments", async () => {
    eligibleRows = [];
    const summary = await runAutoPayoutTick(new Date());
    expect(summary).toEqual({ attempted: 0, succeeded: 0, failed: 0 });
    expect(distributeTournamentPrizes).not.toHaveBeenCalled();
  });

  it("distributes each eligible tournament and marks it complete", async () => {
    eligibleRows = [
      { id: 1, name: "Alpha" },
      { id: 2, name: "Beta" },
    ];
    distributeTournamentPrizes.mockResolvedValue({
      txHash: "0xhash",
      winners: [{ wallet: "0xabc", percentage: 10000 }],
    });

    const summary = await runAutoPayoutTick(new Date());

    expect(distributeTournamentPrizes).toHaveBeenCalledTimes(2);
    expect(distributeTournamentPrizes).toHaveBeenCalledWith(1);
    expect(distributeTournamentPrizes).toHaveBeenCalledWith(2);
    expect(updateCalls.length).toBe(2); // both marked complete
    expect(summary).toEqual({ attempted: 2, succeeded: 2, failed: 0 });
  });

  it("skips a failing tournament without blocking the others", async () => {
    eligibleRows = [
      { id: 1, name: "Alpha" },
      { id: 2, name: "Beta" },
    ];
    distributeTournamentPrizes
      .mockRejectedValueOnce(new Error("No entries found"))
      .mockResolvedValueOnce({
        txHash: "0xhash",
        winners: [{ wallet: "0xabc", percentage: 10000 }],
      });

    const summary = await runAutoPayoutTick(new Date());

    expect(distributeTournamentPrizes).toHaveBeenCalledTimes(2);
    // Only the successful one is marked complete; the failed one stays open for retry.
    expect(updateCalls.length).toBe(1);
    expect(summary).toEqual({ attempted: 2, succeeded: 1, failed: 1 });
  });
});

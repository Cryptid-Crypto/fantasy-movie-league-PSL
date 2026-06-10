import { describe, expect, it } from "vitest";
import { computePrizeSplitBps } from "./prizeDistributionUtils";

describe("computePrizeSplitBps", () => {
  it("returns the default 50/30/20 split for 3 winners", () => {
    expect(computePrizeSplitBps(3)).toEqual([5000, 3000, 2000]);
  });

  it("normalizes to exactly 10000 when fewer than 3 winners exist", () => {
    const two = computePrizeSplitBps(2);
    expect(two.reduce((a, b) => a + b, 0)).toBe(10000);
    // 5000:3000 rescaled to fill the pool, remainder absorbed by the top.
    expect(two).toEqual([6250, 3750]);

    const one = computePrizeSplitBps(1);
    expect(one).toEqual([10000]);
  });

  it("honours a custom base split and still sums to exactly 10000", () => {
    const custom = computePrizeSplitBps(3, [6000, 3000, 1000]);
    expect(custom.reduce((a, b) => a + b, 0)).toBe(10000);
    expect(custom).toEqual([6000, 3000, 1000]);
  });

  it("rescales a custom split that does not itself sum to 10000", () => {
    const custom = computePrizeSplitBps(2, [70, 30]);
    expect(custom.reduce((a, b) => a + b, 0)).toBe(10000);
    expect(custom).toEqual([7000, 3000]);
  });

  it("returns an empty array for zero winners", () => {
    expect(computePrizeSplitBps(0)).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { normalizeWalletAddress } from "./walletUtils";

describe("normalizeWalletAddress", () => {
  it("accepts a valid checksummed address and returns it checksummed", () => {
    const addr = "0xab5801a7d398351b8be11c439e05c5b3259aec9b";
    expect(normalizeWalletAddress(addr)).toBe(
      "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
    );
  });

  it("rejects a non-hex string", () => {
    expect(() => normalizeWalletAddress("not-a-wallet")).toThrow();
  });

  it("rejects an address with a bad checksum", () => {
    expect(() =>
      normalizeWalletAddress("0xAB5801a7D398351b8bE11C439e05C5B3259aec9b")
    ).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => normalizeWalletAddress("")).toThrow();
  });
});

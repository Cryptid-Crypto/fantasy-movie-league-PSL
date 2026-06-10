import { describe, it, expect, afterEach } from 'vitest';
import { distributePrizes } from './prizeDistribution';

describe('distributePrizes', () => {
  afterEach(() => {
    // Clean up any injected provider stubs between tests.
    delete (globalThis as { ethereum?: unknown }).ethereum;
    if (typeof window !== 'undefined') {
      delete (window as { ethereum?: unknown }).ethereum;
    }
  });

  it("throws 'Wallet not connected' when no injected wallet is available", async () => {
    // Ensure there is no injected provider available.
    delete (globalThis as { ethereum?: unknown }).ethereum;
    if (typeof window !== 'undefined') {
      delete (window as { ethereum?: unknown }).ethereum;
    }

    await expect(
      distributePrizes(1, [{ wallet: '0xabc', percentage: 100 }])
    ).rejects.toThrow('Wallet not connected');
  });
});

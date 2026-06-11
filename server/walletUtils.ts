import { getAddress } from "ethers";

/**
 * Validates an EVM wallet address (EIP-55 checksum when mixed-case)
 * and returns its checksummed form. Throws on anything invalid.
 * Kept in its own module so importing it doesn't pull the full ethers
 * runtime into paths that don't need a provider.
 */
export function normalizeWalletAddress(address: string): string {
  return getAddress(address.trim());
}

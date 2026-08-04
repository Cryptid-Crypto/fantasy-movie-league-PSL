/**
 * SIWE (Sign-In With Ethereum) authentication utilities.
 * Uses ethers v6 for signature verification.
 */
import { randomBytes } from "node:crypto";

const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const nonceStore = new Map<string, { nonce: string; expires: number }>();

/** Generate a random nonce for SIWE and store it */
export function generateNonce(): string {
  const nonce = randomBytes(32).toString("hex");
  // Store temporarily keyed by the nonce itself (stateless-ish)
  nonceStore.set(nonce, { nonce, expires: Date.now() + NONCE_EXPIRY_MS });
  return nonce;
}

/** Validate a nonce hasn't expired and hasn't been used */
export function validateNonce(nonce: string): boolean {
  const entry = nonceStore.get(nonce);
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    nonceStore.delete(nonce);
    return false;
  }
  // Consume the nonce (one-time use)
  nonceStore.delete(nonce);
  return true;
}

/** Periodically clean expired nonces */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of nonceStore) {
    if (now > entry.expires) nonceStore.delete(key);
  }
}, 60_000);

/** Result of SIWE verification */
export type SiweResult = {
  address: string; // checksummed Ethereum address
};

/**
 * Build a SIWE message string that the user will sign.
 * Follows EIP-4361 format.
 */
export function buildSiweMessage(params: {
  domain: string;
  address: string;
  uri: string;
  chainId: number;
  nonce: string;
  issuedAt?: string;
}): string {
  const issuedAt = params.issuedAt ?? new Date().toISOString();

  return [
    `${params.domain} wants you to sign in with your Ethereum account:`,
    params.address,
    "",
    "Sign in to Porn Star League",
    "",
    `URI: ${params.uri}`,
    `Version: 1`,
    `Chain ID: ${params.chainId}`,
    `Nonce: ${params.nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

/**
 * Verify a SIWE signature and recover the signer address.
 * Returns null if verification fails.
 */
export async function verifySiweSignature(
  message: string,
  signature: string,
): Promise<SiweResult | null> {
  try {
    // Dynamic import so ethers isn't loaded until actually needed
    const { ethers } = await import("ethers");
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return { address: recoveredAddress };
  } catch (error) {
    console.warn("[SIWE] Signature verification failed:", error);
    return null;
  }
}
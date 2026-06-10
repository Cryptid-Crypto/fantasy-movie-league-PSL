import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
// ABI is loaded statically (cheap JSON). ethers is loaded lazily inside the
// function so importing this module never pulls ethers into the server boot path.
import TournamentEscrowAbi from "../client/src/abis/TournamentEscrow.json";
// type-only import: erased at compile time, does NOT pull ethers into the boot path.
import type { InterfaceAbi } from "ethers";

/**
 * Default prize split for the top finishers, expressed in basis points.
 * TournamentEscrow.distributePrizes reverts unless the winner percentages
 * sum to exactly 10000 (= 100%).
 */
const DEFAULT_PRIZE_SPLIT_BPS = [5000, 3000, 2000] as const;

export interface PrizeWinner {
  wallet: string;
  percentage: number; // basis points (10000 = 100%)
}

/**
 * Environment variable names used for on-chain prize distribution.
 * These are consistent with the names already used by hardhat.config.ts
 * (POLYGON_RPC) and the contract deploy script (DEPLOYER_PRIVATE_KEY).
 *
 *  - POLYGON_RPC                -> JSON-RPC endpoint for the Polygon network
 *  - ADMIN_PRIVATE_KEY          -> private key of the escrow contract owner
 *                                  (falls back to DEPLOYER_PRIVATE_KEY)
 *  - TOURNAMENT_ESCROW_ADDRESS  -> deployed TournamentEscrow contract address
 */
function readBlockchainEnv() {
  const rpcUrl = process.env.POLYGON_RPC || process.env.POLYGON_RPC_URL;
  const privateKey =
    process.env.ADMIN_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  const escrowAddress = process.env.TOURNAMENT_ESCROW_ADDRESS;

  const missing: string[] = [];
  if (!rpcUrl) missing.push("POLYGON_RPC");
  if (!privateKey) missing.push("ADMIN_PRIVATE_KEY");
  if (!escrowAddress) missing.push("TOURNAMENT_ESCROW_ADDRESS");

  if (missing.length > 0) {
    throw new Error(
      `Cannot distribute prizes: missing required environment variable(s): ${missing.join(
        ", "
      )}`
    );
  }

  return {
    rpcUrl: rpcUrl as string,
    privateKey: privateKey as string,
    escrowAddress: escrowAddress as string,
  };
}

/**
 * Computes integer basis-point percentages for the top `count` finishers,
 * guaranteeing the result sums to EXACTLY 10000.
 *
 * `baseSplit` is the desired per-rank weighting (defaults to [50,30,20] →
 * [5000,3000,2000]). It does NOT need to sum to 10000 — the function scales
 * whatever weighting is supplied across however many finishers exist and
 * absorbs any rounding remainder into the top finisher(s) so the on-chain
 * `totalPercentage == 10000` invariant always holds.
 */
export function computePrizeSplitBps(
  count: number,
  baseSplit: readonly number[] = DEFAULT_PRIZE_SPLIT_BPS
): number[] {
  if (count <= 0) return [];

  // Use as many of the supplied weights as we have finishers for.
  const base = baseSplit.slice(0, count);
  const baseSum = base.reduce((acc, v) => acc + v, 0);
  if (baseSum <= 0) {
    throw new Error("Prize split weights must sum to a positive value");
  }

  // Scale each slice proportionally to fill the full 10000 bps pool.
  const scaled = base.map((v) => Math.floor((v * 10000) / baseSum));

  // Distribute the rounding remainder onto the top finisher(s).
  let remainder = 10000 - scaled.reduce((acc, v) => acc + v, 0);
  let i = 0;
  while (remainder > 0) {
    scaled[i % scaled.length] += 1;
    remainder -= 1;
    i += 1;
  }

  return scaled;
}

async function getWalletAddressForUser(userId: number): Promise<string | null> {
  const database = await db.getDb();
  if (!database) throw new Error("Database not available");

  const rows = await database
    .select({ walletAddress: users.walletAddress })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return rows[0]?.walletAddress ?? null;
}

/**
 * Reads a tournament's finalized leaderboard, computes the winning wallets and
 * their prize percentages, and triggers TournamentEscrow.distributePrizes
 * on-chain.
 *
 * @returns the on-chain transaction hash and the winners that were paid.
 */
export async function distributeTournamentPrizes(
  tournamentId: number
): Promise<{ txHash: string; winners: PrizeWinner[] }> {
  // 1. Fetch the tournament's entries WITH their final scores.
  //    db.getTournamentEntries already returns rows ordered by totalScore desc.
  const entries = await db.getTournamentEntries(tournamentId);
  if (entries.length === 0) {
    throw new Error(`No entries found for tournament ${tournamentId}`);
  }

  // 1b. Load the tournament so we can honour its configured prize split
  //     (falls back to the default 50/30/20 when none is set).
  const tournament = await db.getTournamentById(tournamentId);
  const configuredSplit = tournament?.prizeSplitBps;
  const baseSplit =
    Array.isArray(configuredSplit) && configuredSplit.length > 0
      ? configuredSplit
      : DEFAULT_PRIZE_SPLIT_BPS;

  // 2. Take the top finishers (one per configured rank) and compute prize
  //    percentages that sum to exactly 10000 basis points.
  const ranked = [...entries].sort(
    (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
  );
  const topCount = Math.min(baseSplit.length, ranked.length);
  const splitBps = computePrizeSplitBps(topCount, baseSplit);
  const topEntries = ranked.slice(0, topCount);

  // 3. Resolve each winner's wallet address.
  const winners: PrizeWinner[] = [];
  for (let i = 0; i < topEntries.length; i++) {
    const entry = topEntries[i];
    const wallet = await getWalletAddressForUser(entry.userId);
    if (!wallet) {
      throw new Error(
        `Winner (entry ${entry.id}, user ${entry.userId}) has no wallet address on file; cannot distribute prizes`
      );
    }
    winners.push({ wallet, percentage: splitBps[i] });
  }

  // Defensive check mirroring the on-chain require(totalPercentage == 10000).
  const totalBps = winners.reduce((acc, w) => acc + w.percentage, 0);
  if (totalBps !== 10000) {
    throw new Error(
      `Computed prize percentages sum to ${totalBps} basis points; expected exactly 10000`
    );
  }

  // 4. Call the TournamentEscrow contract. ethers is loaded lazily so this
  //    module can be imported without the chain libs being initialized.
  const { rpcUrl, privateKey, escrowAddress } = readBlockchainEnv();
  const { ethers } = await import("ethers");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(
    escrowAddress,
    TournamentEscrowAbi as InterfaceAbi,
    signer
  );

  const tx = await contract.distributePrizes(tournamentId, winners);
  const receipt = await tx.wait();

  return { txHash: receipt?.hash ?? tx.hash, winners };
}

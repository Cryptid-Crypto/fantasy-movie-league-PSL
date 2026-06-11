import { and, eq, lte } from "drizzle-orm";
import { getDb } from "./db";
import { tournaments } from "../drizzle/schema";
import { distributeTournamentPrizes } from "./prizeDistributionUtils";
import { unlockTournamentCards } from "./db";

/**
 * Auto-distribute prizes for tournaments whose end date has passed.
 *
 * This is an opt-in background job: it only runs when ENABLE_AUTO_PAYOUT=true
 * AND the blockchain env vars required by distributeTournamentPrizes are set
 * (POLYGON_RPC, ADMIN_PRIVATE_KEY/DEPLOYER_PRIVATE_KEY, TOURNAMENT_ESCROW_ADDRESS).
 *
 * Idempotency: tournaments are marked payoutComplete=true after a successful
 * distribution, and the query only selects rows where payoutComplete=false, so
 * a tournament is never paid out twice even across restarts or overlapping ticks.
 */

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let timer: NodeJS.Timeout | null = null;
let running = false; // guards against overlapping ticks

function autoPayoutEnabled(): boolean {
  return process.env.ENABLE_AUTO_PAYOUT === "true";
}

function blockchainConfigured(): boolean {
  const hasRpc = !!(process.env.POLYGON_RPC || process.env.POLYGON_RPC_URL);
  const hasKey = !!(process.env.ADMIN_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY);
  const hasEscrow = !!process.env.TOURNAMENT_ESCROW_ADDRESS;
  return hasRpc && hasKey && hasEscrow;
}

/**
 * Find tournaments that have ended but have not been paid out yet, and trigger
 * distribution for each. Returns a summary of what happened (useful for tests
 * and logging). Never throws — per-tournament failures are logged and skipped
 * so one bad tournament can't block the rest.
 */
export async function runAutoPayoutTick(now: Date = new Date()): Promise<{
  attempted: number;
  succeeded: number;
  failed: number;
}> {
  const db = await getDb();
  if (!db) {
    return { attempted: 0, succeeded: 0, failed: 0 };
  }

  // Eligible: ended (endDate <= now) and not yet paid out.
  const eligible = await db
    .select({ id: tournaments.id, name: tournaments.name })
    .from(tournaments)
    .where(and(lte(tournaments.endDate, now), eq(tournaments.payoutComplete, false)));

  let succeeded = 0;
  let failed = 0;

  for (const t of eligible) {
    try {
      const result = await distributeTournamentPrizes(t.id);
      // Mark as complete so we never pay out twice.
      await db
        .update(tournaments)
        .set({ payoutComplete: true, status: "completed" })
        .where(eq(tournaments.id, t.id));
      // Unlock all cards locked by this tournament's entries
      await unlockTournamentCards(t.id);
      succeeded += 1;
      console.log(
        `[auto-payout] Tournament ${t.id} ("${t.name}") paid out. Tx: ${result.txHash}, winners: ${result.winners.length}`
      );
    } catch (err) {
      failed += 1;
      // Common, non-fatal reasons: no entries yet, a winner has no wallet on
      // file, or the prize pool is empty. Leave payoutComplete=false so it can
      // be retried on a later tick (or distributed manually by an admin).
      console.warn(
        `[auto-payout] Skipped tournament ${t.id} ("${t.name}"): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  return { attempted: eligible.length, succeeded, failed };
}

/**
 * Start the recurring auto-payout scheduler. No-op (with a log line) unless
 * ENABLE_AUTO_PAYOUT=true and the blockchain env vars are present. Safe to call
 * once at server startup.
 */
export function startAutoPayoutScheduler(): void {
  if (timer) return; // already started

  if (!autoPayoutEnabled()) {
    console.log("[auto-payout] Disabled (set ENABLE_AUTO_PAYOUT=true to enable).");
    return;
  }
  if (!blockchainConfigured()) {
    console.warn(
      "[auto-payout] ENABLE_AUTO_PAYOUT=true but blockchain env vars are missing " +
        "(need POLYGON_RPC, ADMIN_PRIVATE_KEY, TOURNAMENT_ESCROW_ADDRESS). Scheduler not started."
    );
    return;
  }

  const intervalMs = Number(process.env.AUTO_PAYOUT_INTERVAL_MS) || DEFAULT_INTERVAL_MS;

  const tick = async () => {
    if (running) return; // skip if the previous tick is still in flight
    running = true;
    try {
      const summary = await runAutoPayoutTick();
      if (summary.attempted > 0) {
        console.log(
          `[auto-payout] Tick complete: ${summary.succeeded} paid, ${summary.failed} skipped of ${summary.attempted} eligible.`
        );
      }
    } catch (err) {
      console.error("[auto-payout] Tick error:", err);
    } finally {
      running = false;
    }
  };

  timer = setInterval(tick, intervalMs);
  // Don't keep the event loop alive solely for this timer.
  if (typeof timer.unref === "function") timer.unref();

  console.log(`[auto-payout] Scheduler started (every ${Math.round(intervalMs / 1000)}s).`);
  // Run an initial tick shortly after startup.
  setTimeout(tick, 10_000).unref?.();
}

/** Stop the scheduler (used in tests and graceful shutdown). */
export function stopAutoPayoutScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

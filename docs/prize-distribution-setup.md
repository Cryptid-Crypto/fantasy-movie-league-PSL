# Prize Distribution — Setup & Verification Guide

This document describes how to configure, deploy, and verify the automated
prize-distribution feature added by the prize-distribution implementation plan
(`docs/plans/2026-06-10_prize-distribution-automation.md`).

## What was built

| Layer | File | Purpose |
|-------|------|---------|
| Contract config | `client/src/lib/web3Config.ts` | Exports `TOURNAMENT_ESCROW_ABI` and `TOURNAMENT_ESCROW_ADDRESSES` |
| Contract ABI | `client/src/abis/TournamentEscrow.json` | Hand-written ABI matching `contracts/TournamentEscrow.sol` |
| Frontend util | `client/src/lib/prizeDistribution.ts` | Client-side ethers helper (browser wallet) |
| Server helper | `server/prizeDistributionUtils.ts` | Computes winners from final scores, calls the escrow contract server-side |
| API endpoint | `server/routers.ts` → `admin.tournaments.distributePrizes` | Admin-only tRPC mutation |
| UI | `client/src/pages/TournamentLeaderboard.tsx` | Admin-only "Distribute Prizes" button |

## How prizes are computed

- Entries are read via `db.getTournamentEntries(tournamentId)` (already ordered
  by `totalScore` descending).
- Each tournament can define its own **prize split** via the `prizeSplitBps`
  column (a JSON array of basis points, e.g. `[5000, 3000, 2000]`). Admins set
  this on the create-tournament page as a comma-separated percentage list
  (e.g. `50, 30, 20`) that must sum to 100%. When no split is configured the
  default **50% / 30% / 20%** is used.
- `TournamentEscrow.distributePrizes` reverts unless the percentages sum to
  **exactly 10000 bps**. When fewer finishers exist than configured ranks, the
  helper (`computePrizeSplitBps`) proportionally rescales the split and absorbs
  any rounding remainder into the top finisher so the total is always 10000.
- Each winner's payout wallet is resolved from `users.walletAddress`. If a
  winner has no wallet on file, distribution aborts with a clear error before
  any on-chain call is made.

## Required environment variables (server)

Set these in the server environment before invoking distribution. The helper
throws a descriptive error (and makes **no** chain call) if any are missing:

```env
# JSON-RPC endpoint for the Polygon network
POLYGON_RPC=https://polygon-rpc.com          # (POLYGON_RPC_URL also accepted)

# Private key of the TournamentEscrow contract OWNER
# (distributePrizes is onlyOwner). Falls back to DEPLOYER_PRIVATE_KEY.
ADMIN_PRIVATE_KEY=0x...

# Address of the deployed TournamentEscrow contract
TOURNAMENT_ESCROW_ADDRESS=0x...

# --- Optional: automatic payout scheduler ---
# When true, the server runs a background job that auto-distributes prizes for
# tournaments whose endDate has passed (and that aren't already paid out).
# Requires the three vars above to also be set. Default: disabled.
ENABLE_AUTO_PAYOUT=false
# How often the scheduler checks for ended tournaments (ms). Default: 300000 (5 min).
AUTO_PAYOUT_INTERVAL_MS=300000
```

> Security: `ADMIN_PRIVATE_KEY` controls real funds in the escrow. Store it only
> in the server's secret store / `.env` (never commit it, never expose it to the
> client bundle). It is read exclusively in `server/prizeDistributionUtils.ts`.

## Deployment steps

1. **Deploy the escrow contract** to the target network (Amoy testnet first):
   ```bash
   # See contracts/deploy.ts and hardhat.config.ts
   npx hardhat run contracts/deploy.ts --network amoy
   ```
   Note the deployed address.

2. **Wire the address into the frontend** — replace the placeholder zero
   addresses in `client/src/lib/web3Config.ts`:
   ```ts
   export const TOURNAMENT_ESCROW_ADDRESSES = {
     [POLYGON_MAINNET_CHAIN_ID]: '0x...real mainnet...',
     [POLYGON_TESTNET_CHAIN_ID]: '0x...real amoy...',
   };
   ```

3. **Set the server env vars** (`POLYGON_RPC`, `ADMIN_PRIVATE_KEY`,
   `TOURNAMENT_ESCROW_ADDRESS`) as above.

4. **Fund the escrow** — entry fees accumulate in the escrow via `payEntry`,
   so the prize pool must be funded by tournament entries before distribution.

## End-to-end verification (Amoy testnet)

1. Sign in as an **admin** user.
2. Create a tournament with an entry fee; have ≥1 test wallet enter and pay.
3. Log scene actions and run **Calculate Scores** (`admin.tournaments.calculateScores`)
   so entries have final `totalScore` values.
4. Open the tournament leaderboard at `/tournaments/:id`.
5. Confirm the **Distribute Prizes** button is visible (admins only) and that
   non-admin accounts do **not** see it.
6. Click **Distribute Prizes**, confirm the dialog. On success a toast shows the
   winner count and truncated tx hash.
7. Verify on the Amoy block explorer (Polygonscan Amoy) that
   `PrizesDistributed` fired and winner wallets received funds.
8. **Negative check:** call `admin.tournaments.distributePrizes` as a non-admin
   (e.g. via a crafted request) and confirm it returns `FORBIDDEN`.

## Automated test coverage

- `server/admin.tournaments.distributePrizes.test.ts`
  - rejects a non-admin caller with `FORBIDDEN`
  - invokes the (mocked) chain helper for an admin caller — no real chain call
- `server/prizeDistributionUtils.test.ts`
  - `computePrizeSplitBps` returns the default 50/30/20 split, normalizes to
    exactly 10000 bps for fewer finishers, and honours/​rescales custom splits
- `client/src/lib/prizeDistribution.test.ts`
  - throws `'Wallet not connected'` when no injected wallet is present

> The `vitest.config.ts` `include` glob now covers both `server/**/*.test.ts`
> and `client/**/*.test.{ts,tsx}` (with a `jsdom` environment for client code,
> via the `jsdom` dev dependency), so `pnpm test` runs server and client tests
> together.

## Automatic payout scheduler

`server/autoPayoutScheduler.ts` runs an opt-in background job (started from
`server/_core/index.ts` on server boot). On each tick it:

1. Selects tournaments where `endDate <= now` AND `payoutComplete = false`.
2. Calls `distributeTournamentPrizes(id)` for each.
3. On success, marks the tournament `payoutComplete = true, status = 'completed'`
   so it's never paid out twice (idempotent across restarts and overlapping ticks).
4. On failure (no entries, missing wallet, empty pool), logs a warning and leaves
   the tournament open so it can be retried on a later tick or distributed manually.

It is **disabled by default**. Enable with `ENABLE_AUTO_PAYOUT=true` plus the
three blockchain env vars; tune the cadence with `AUTO_PAYOUT_INTERVAL_MS`. An
overlap guard prevents a slow tick from starting a second concurrent run, and
the timer is `unref()`-ed so it never keeps the process alive on its own.

Tested in `server/autoPayoutScheduler.test.ts` (no eligible rows, multi-payout
+ completion marking, skip-on-failure isolation).

## Follow-up enhancements (not yet implemented)

- Friendlier error surfacing of on-chain revert reasons.
- Per-tournament override of the auto-payout cadence / a manual "pay out now
  that it's ended" shortcut in the admin UI.

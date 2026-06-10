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
- The top 3 finishers receive a **50% / 30% / 20%** split, expressed in
  basis points (`5000 / 3000 / 2000`).
- `TournamentEscrow.distributePrizes` reverts unless the percentages sum to
  **exactly 10000 bps**. When fewer than 3 entries exist, the helper
  (`computePrizeSplitBps`) proportionally rescales the split and absorbs any
  rounding remainder into the top finisher so the total is always 10000.
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
- `client/src/lib/prizeDistribution.test.ts`
  - throws `'Wallet not connected'` when no injected wallet is present

> Note: the project's `vitest.config.ts` `include` glob currently only covers
> `server/**/*.test.ts`, so the **client** test is not picked up by the default
> `pnpm test` run. To include client tests in CI, broaden the glob (and add a
> jsdom environment for client code):
> ```ts
> // vitest.config.ts
> test: {
>   include: ['server/**/*.test.ts', 'client/**/*.test.{ts,tsx}'],
>   environment: 'node', // or per-file jsdom for client
> }
> ```

## Follow-up enhancements (not yet implemented)

- Make the prize split configurable per tournament (admin setting) instead of
  the hard-coded 50/30/20.
- Optional backend cron to auto-trigger distribution when a tournament ends.
- Friendlier error surfacing of on-chain revert reasons.

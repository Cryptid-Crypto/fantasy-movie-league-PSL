# P0 Security & Correctness Fixes — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Eliminate the money-correctness and security holes found in the 2026-06-11 platform review: non-atomic marketplace purchases, double-payable prizes, bypassable roster ownership checks, unvalidated payout wallets, permanently-locked NFT cards, dead duplicate admin router, and missing age gate.

**Architecture:** All fixes are surgical changes to the existing tRPC + Drizzle (MySQL/TiDB) server layer plus one small client component (age gate). No schema migrations except none — every fix uses existing columns. TDD with vitest throughout (tests colocated in `server/*.test.ts`, matching existing convention).

**Tech Stack:** tRPC 11, Drizzle ORM (`drizzle-orm/mysql2`), zod, ethers v6, vitest, React + wouter.

**Repo:** `/home/sherman3/fantasy-movie-league-PSL` (branch `main`, work on a feature branch).

---

## Pre-flight

```bash
cd /home/sherman3/fantasy-movie-league-PSL
git checkout -b fix/p0-security-correctness
pnpm test          # expected: all existing tests pass (baseline)
pnpm check         # expected: tsc clean
```

If baseline tests fail, STOP and report — do not build on a broken baseline.

---

### Task 1: Delete the dead duplicate admin router

**Objective:** Remove `server/routers/admin.ts`, which is never imported (verified: no references outside the file itself) and defines schemas that diverge from the live admin router in `server/routers.ts`.

**Files:**
- Delete: `server/routers/admin.ts`

**Step 1: Verify it really is dead**

Run: `grep -rn "routers/admin" server/ client/ --include="*.ts" --include="*.tsx" | grep -v "server/routers/admin.ts"`
Expected: no output.

**Step 2: Delete the file**

```bash
git rm server/routers/admin.ts
```

Note: `server/db.ts` may export functions only this file used (`addScenePerformer`, `removeScenePerformer`, `addScenePerformerAction`, `removeScenePerformerAction`, `getScenePerformers`, `getScenePerformerActionsList`). Leave them — removing db functions is out of scope and they may be used elsewhere.

**Step 3: Verify build**

Run: `pnpm check && pnpm test`
Expected: clean compile, all tests pass.

**Step 4: Commit**

```bash
git commit -m "chore: remove dead duplicate admin router (server/routers/admin.ts)"
```

---

### Task 2: Validate wallet addresses in `auth.updateWallet`

**Objective:** Reject malformed payout addresses at the API boundary using ethers checksum validation. This address receives on-chain prize money.

**Files:**
- Modify: `server/routers.ts:37-42` (`auth.updateWallet`)
- Test: `server/auth.updateWallet.test.ts` (create)

**Step 1: Write failing test**

Create `server/auth.updateWallet.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normalizeWalletAddress } from "./walletUtils";

describe("normalizeWalletAddress", () => {
  it("accepts a valid checksummed address and returns it checksummed", () => {
    const addr = "0xab5801a7d398351b8be11c439e05c5b3259aec9b"; // vitalik test addr, lowercase
    expect(normalizeWalletAddress(addr)).toBe(
      "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
    );
  });

  it("rejects a non-hex string", () => {
    expect(() => normalizeWalletAddress("not-a-wallet")).toThrow();
  });

  it("rejects an address with a bad checksum", () => {
    // valid hex, deliberately broken EIP-55 casing
    expect(() =>
      normalizeWalletAddress("0xAB5801a7D398351b8bE11C439e05C5B3259aec9b")
    ).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => normalizeWalletAddress("")).toThrow();
  });
});
```

**Step 2: Run test to verify failure**

Run: `pnpm vitest run server/auth.updateWallet.test.ts`
Expected: FAIL — module `./walletUtils` not found.

**Step 3: Implement `server/walletUtils.ts`**

```ts
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
```

**Step 4: Run test to verify pass**

Run: `pnpm vitest run server/auth.updateWallet.test.ts`
Expected: PASS (4 tests).

**Step 5: Wire into the router**

In `server/routers.ts`, replace the `updateWallet` procedure (lines ~37-42):

```ts
    updateWallet: protectedProcedure
      .input(z.object({ walletAddress: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const { normalizeWalletAddress } = await import("./walletUtils");
        let checksummed: string;
        try {
          checksummed = normalizeWalletAddress(input.walletAddress);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid wallet address. Provide a valid EVM (0x…) address.",
          });
        }
        await db.updateUserWallet(ctx.user.id, checksummed);
        return { success: true };
      }),
```

**Step 6: Verify**

Run: `pnpm check && pnpm test`
Expected: clean.

**Step 7: Commit**

```bash
git add server/walletUtils.ts server/auth.updateWallet.test.ts server/routers.ts
git commit -m "fix: validate and checksum wallet addresses before saving (payout safety)"
```

---

### Task 3: Make marketplace purchase atomic and race-safe

**Objective:** Rewrite `buyNftListing` (`server/db.ts:1244`) to run inside a single DB transaction with an atomic claim on the listing, so concurrent buyers can't double-buy and a crash can't leave half-applied money movement.

**Files:**
- Modify: `server/db.ts:1244-1305` (`buyNftListing`)
- Test: `server/marketplace.buy.test.ts` (create)

**Key design:**
1. Wrap everything in `db.transaction(async (tx) => { ... })`.
2. Claim the listing FIRST with `UPDATE nftListings SET status='sold', buyerId=?, soldAt=? WHERE id=? AND status='active'` and check affected rows — this is the mutex. Only one concurrent buyer can win.
3. Re-check buyer balance *inside* the transaction before inserting ledger rows.
4. All ledger inserts, card ownership transfer, and history insert use `tx`, not `db`.

**Step 1: Write failing test**

Create `server/marketplace.buy.test.ts`. Follow the mocking style used in `server/tournament.entry.test.ts` (read it first; mock `getDb` / module functions with `vi.mock`). The tests to write:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock strategy: mock ./db's getDb to return a fake drizzle object whose
// .transaction(cb) invokes cb with a fake tx recording calls. The fake tx's
// update().set().where() for nftListings returns a result with affectedRows
// controlled per-test (drizzle mysql2 update returns [ResultSetHeader, ...] —
// match whatever shape the implementation reads).

describe("buyNftListing", () => {
  it("throws when the listing claim affects 0 rows (already sold / concurrent buyer)", async () => {
    // arrange fake tx: claim update returns affectedRows: 0
    // assert: rejects with /no longer available/i
    // assert: NO ledger inserts were attempted
  });

  it("debits buyer, credits seller minus 5% fee, transfers card, records history — all on the same tx", async () => {
    // arrange: listing active, price 100, buyer balance 500
    // assert ledger insert amounts: buyer -100, seller +95
    // assert nftCards ownerId update called with buyerId via tx
    // assert nftTransferHistory insert via tx
  });

  it("throws and aborts when buyer balance is insufficient (checked inside tx)", async () => {
    // arrange balance 10 < price 100
    // assert rejects with /insufficient/i and no ownership transfer happened
  });

  it("rejects self-purchase", async () => {
    // sellerId === buyerId → /own listing/i
  });
});
```

Write real assertions — the skeleton above defines required behavior; flesh out the fake-tx plumbing. Look at `drizzle-orm/mysql2`'s update return type: `const [result] = await tx.update(...)...; result.affectedRows`.

**Step 2: Run to verify failure**

Run: `pnpm vitest run server/marketplace.buy.test.ts`
Expected: FAIL.

**Step 3: Implement the rewrite in `server/db.ts`**

Replace the body of `buyNftListing`:

```ts
export async function buyNftListing(listingId: number, buyerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.transaction(async (tx) => {
    // Load listing for price/seller info (claim happens below).
    const listing = await tx
      .select()
      .from(nftListings)
      .where(eq(nftListings.id, listingId))
      .limit(1);
    if (!listing[0]) throw new Error("Listing not found");
    if (listing[0].sellerId === buyerId)
      throw new Error("You cannot buy your own listing");

    const price = listing[0].priceCredits;
    const sellerId = listing[0].sellerId;
    const cardId = listing[0].nftCardId;

    // ATOMIC CLAIM — the WHERE status='active' guard is the mutex.
    // Exactly one concurrent buyer can flip active→sold.
    const [claim] = await tx
      .update(nftListings)
      .set({ status: "sold", buyerId, soldAt: new Date() })
      .where(and(eq(nftListings.id, listingId), eq(nftListings.status, "active")));
    if (!claim || claim.affectedRows === 0)
      throw new Error("Listing is no longer available");

    // Balance check INSIDE the transaction.
    const balRows = await tx
      .select({ total: sql<number>`COALESCE(SUM(${creditLedger.amount}), 0)` })
      .from(creditLedger)
      .where(eq(creditLedger.userId, buyerId));
    const buyerBalance = Number(balRows[0]?.total ?? 0);
    if (buyerBalance < price) throw new Error("Insufficient PSL credits");

    // Debit buyer.
    await tx.insert(creditLedger).values({
      userId: buyerId,
      amount: -price,
      type: "nft_purchase",
      description: `Purchased NFT card #${cardId}`,
      relatedNftCardId: cardId,
      relatedListingId: listingId,
    });

    // Credit seller (5% platform fee).
    const sellerAmount = Math.floor(price * 0.95);
    await tx.insert(creditLedger).values({
      userId: sellerId,
      amount: sellerAmount,
      type: "nft_sale",
      description: `Sold NFT card #${cardId} (5% platform fee deducted)`,
      relatedNftCardId: cardId,
      relatedListingId: listingId,
    });

    // Transfer ownership.
    await tx.update(nftCards).set({ ownerId: buyerId }).where(eq(nftCards.id, cardId));

    // History.
    await tx.insert(nftTransferHistory).values({
      nftCardId: cardId,
      fromUserId: sellerId,
      toUserId: buyerId,
      transferType: "marketplace_sale",
      priceCredits: price,
      listingId,
    });
  });
}
```

Throwing inside `tx` rolls back everything, including the claim — correct behavior for the insufficient-balance path.

**Step 4: Run tests**

Run: `pnpm vitest run server/marketplace.buy.test.ts && pnpm check`
Expected: PASS, tsc clean. (If TiDB/MySQL driver typing for the update result differs, adapt — check how drizzle types `.update()` returns for mysql2: `MySqlRawQueryResult`.)

**Step 5: Run full suite**

Run: `pnpm test`
Expected: all pass.

**Step 6: Commit**

```bash
git add server/db.ts server/marketplace.buy.test.ts
git commit -m "fix: make marketplace purchase atomic with race-safe listing claim"
```

---

### Task 4: Idempotency guard on manual prize distribution

**Objective:** Prevent the admin `distributePrizes` mutation from paying a tournament twice (double on-chain transactions). Mirror the auto-scheduler's `payoutComplete` guard and set the flag on success.

**Files:**
- Modify: `server/routers.ts:346-353` (`admin.tournaments.distributePrizes`)
- Modify: `server/db.ts` — add `claimTournamentPayout` + `markTournamentPayoutFailed` helpers
- Test: `server/admin.tournaments.distributePrizes.test.ts` (extend existing file)

**Key design:** check-then-call is still racy (admin double-click fires two parallel requests). Use the same atomic-claim pattern as Task 3: flip `payoutComplete` false→true FIRST with a conditional UPDATE, then distribute; on failure, flip it back so retry is possible.

**Step 1: Add db helpers in `server/db.ts`** (near the other tournament functions):

```ts
/**
 * Atomically claims a tournament for payout by flipping payoutComplete
 * false→true. Returns true if this caller won the claim. The flag is the
 * mutex: concurrent calls (double-click, scheduler overlap) get false.
 */
export async function claimTournamentPayout(tournamentId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .update(tournaments)
    .set({ payoutComplete: true })
    .where(and(eq(tournaments.id, tournamentId), eq(tournaments.payoutComplete, false)));
  return (result?.affectedRows ?? 0) > 0;
}

/** Releases a payout claim after a failed distribution so it can be retried. */
export async function markTournamentPayoutFailed(tournamentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(tournaments)
    .set({ payoutComplete: false })
    .where(eq(tournaments.id, tournamentId));
}
```

**Step 2: Write failing tests** (add to `server/admin.tournaments.distributePrizes.test.ts` — read the existing file first and follow its mock style):

```ts
// New cases:
// 1. "refuses to distribute when payout already complete":
//    claimTournamentPayout returns false → mutation throws CONFLICT,
//    distributeTournamentPrizes is NOT called.
// 2. "marks payout complete and completes status on success":
//    claim true → distribute called once → updateTournament/status side effect.
// 3. "releases the claim when distribution throws":
//    distribute rejects → markTournamentPayoutFailed called → error propagates.
```

**Step 3: Run to verify failure**

Run: `pnpm vitest run server/admin.tournaments.distributePrizes.test.ts`
Expected: new cases FAIL.

**Step 4: Rewrite the mutation in `server/routers.ts`:**

```ts
      distributePrizes: adminProcedure
        .input(z.object({ tournamentId: z.number() }))
        .mutation(async ({ input }) => {
          // Atomic claim — same guard the auto-payout scheduler relies on.
          const claimed = await db.claimTournamentPayout(input.tournamentId);
          if (!claimed) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Prizes for this tournament have already been distributed (or distribution is in progress).",
            });
          }
          try {
            const { distributeTournamentPrizes } = await import("./prizeDistributionUtils");
            const result = await distributeTournamentPrizes(input.tournamentId);
            await db.updateTournament(input.tournamentId, { status: "completed" });
            return result;
          } catch (err) {
            // Release the claim so a fixable failure (e.g. missing wallet)
            // can be retried after correction.
            await db.markTournamentPayoutFailed(input.tournamentId);
            throw err;
          }
        }),
```

**Step 5: Verify**

Run: `pnpm vitest run server/admin.tournaments.distributePrizes.test.ts && pnpm test && pnpm check`
Expected: all pass.

**Step 6: Commit**

```bash
git add server/db.ts server/routers.ts server/admin.tournaments.distributePrizes.test.ts
git commit -m "fix: atomic payout claim prevents double prize distribution"
```

---

### Task 5: Close the roster ownership bypass in `tournaments.enter`

**Objective:** Every roster slot must reference an owned, unlocked platform NFT card. Today validation only runs `if (performer.nftCardId)` — a slot with only `performerId` (or legacy `nftTokenId`) skips ownership checks AND escapes type-requirement counting.

**Files:**
- Modify: `server/routers.ts:447-552` (`tournaments.enter`)
- Test: `server/tournament.entry.test.ts` (extend existing)

**Design decision (confirmed by review):** the platform has moved to platform-native cards (`nftCardId`); `enter` already locks platform cards. Make `nftCardId` REQUIRED. Keep `nftTokenId` only as a stored legacy display field, never as an ownership proof. Additionally verify the card's `performerId` matches the claimed `performerId` (currently unchecked — you could enter performer X using a card for performer Y).

**Step 1: Write failing tests** (add to `server/tournament.entry.test.ts`, following its existing mock style):

```ts
// New cases:
// 1. "rejects roster slots without nftCardId" — roster [{performerId: 1}]
//    → BAD_REQUEST /card/i, db.enterTournament never called.
// 2. "rejects when card.performerId mismatches the slot's performerId"
//    → BAD_REQUEST /does not match/i.
// 3. "counts type requirements across ALL slots" — with requirements
//    [{performerType: 'Legend', requiredCount: 2}] and only 1 Legend card
//    → BAD_REQUEST listing the unmet requirement.
```

**Step 2: Run to verify failure**

Run: `pnpm vitest run server/tournament.entry.test.ts`
Expected: new cases FAIL.

**Step 3: Modify the input schema** in `tournaments.enter`:

```ts
        roster: z.array(z.object({
          performerId: z.number(),
          nftCardId: z.number(),            // REQUIRED — platform card is the ownership proof
          nftTokenId: z.string().optional(), // legacy display only
        })).min(1),
```

**Step 4: Tighten the validation loop.** Replace the `if (performer.nftCardId)` block so it runs unconditionally for every slot, and add the performer-match check:

```ts
        for (const slot of input.roster) {
          const card = platformCardMap.get(slot.nftCardId);
          if (!card) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `You do not own NFT card #${slot.nftCardId}`,
            });
          }
          if (card.isLocked) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `NFT card #${slot.nftCardId} is already locked in another tournament`,
            });
          }
          if (card.performerId !== slot.performerId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `NFT card #${slot.nftCardId} does not match performer ${slot.performerId}`,
            });
          }
          const performerType = (card as any).performerType ?? null;
          rosterPerformerTypes.set(performerType, (rosterPerformerTypes.get(performerType) || 0) + 1);
        }
```

Also reject duplicate cards in one roster:

```ts
        const cardIds = input.roster.map((s) => s.nftCardId);
        if (new Set(cardIds).size !== cardIds.length) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Duplicate NFT cards in roster" });
        }
```

Check first: `getUserOwnedNftCards` must return `performerId` in its select — verify at `server/db.ts:~1050` and add the column to the select if missing.

**Step 5: Check the client still complies**

Run: `grep -n "nftCardId\|enter.useMutation\|enter.mutate" client/src/pages/TournamentEntry.tsx | head -20`
Read the surrounding code. If `TournamentEntry.tsx` can submit slots without `nftCardId`, fix the client to always pass it (it selects from `nftPlatform.myCards`, so the id is available). If the page still uses the legacy NFT flow, update its submit payload accordingly.

**Step 6: Verify**

Run: `pnpm vitest run server/tournament.entry.test.ts && pnpm test && pnpm check`
Expected: all pass.

**Step 7: Commit**

```bash
git add server/routers.ts server/tournament.entry.test.ts client/src/pages/TournamentEntry.tsx
git commit -m "fix: enforce card ownership + performer match for every roster slot"
```

---

### Task 6: Unlock NFT cards when tournaments complete

**Objective:** Cards locked at entry are never unlocked anywhere, becoming permanently untradeable. Unlock all cards belonging to a tournament's entries when it completes (auto-payout scheduler AND manual distribution AND status set to completed via admin update).

**Files:**
- Modify: `server/db.ts` — add `unlockTournamentCards(tournamentId)`
- Modify: `server/autoPayoutScheduler.ts` (~line 65, after marking complete)
- Modify: `server/routers.ts` — call it in `distributePrizes` success path (Task 4 code) and in `admin.tournaments.update` when `status` transitions to `'completed'`
- Test: `server/unlockTournamentCards.test.ts` (create)

**Step 1: Write failing test**

```ts
// server/unlockTournamentCards.test.ts
// Cases:
// 1. "unlocks every card referenced by the tournament's entry performers"
//    — entries → entryPerformers with nftTokenId values that are numeric
//    platform-card ids → expects update(nftCards).set({isLocked:false})
//    for those ids.
// 2. "is a no-op for a tournament with no entries".
```

Note the data model wart: `entryPerformers.nftTokenId` stores the platform `nftCardId` as a string (`performer.nftCardId?.toString()` at `routers.ts:541`). The unlock function must parse those back to numbers and ignore non-numeric legacy values.

**Step 2: Run to verify failure** — `pnpm vitest run server/unlockTournamentCards.test.ts` → FAIL.

**Step 3: Implement in `server/db.ts`:**

```ts
/**
 * Unlocks all platform NFT cards locked by entries of the given tournament.
 * entryPerformers.nftTokenId stores the platform card id as a string for
 * platform-native entries; legacy blockchain token ids are ignored.
 */
export async function unlockTournamentCards(tournamentId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const entries = await getTournamentEntries(tournamentId);
  if (entries.length === 0) return 0;

  const cardIds: number[] = [];
  for (const entry of entries) {
    const roster = await getEntryPerformers(entry.id);
    for (const slot of roster) {
      const id = Number(slot.nftTokenId);
      if (Number.isInteger(id) && id > 0) cardIds.push(id);
    }
  }
  if (cardIds.length === 0) return 0;

  const { inArray } = await import("drizzle-orm");
  await db.update(nftCards).set({ isLocked: false }).where(inArray(nftCards.id, cardIds));
  return cardIds.length;
}
```

(Adapt to the actual shapes returned by `getTournamentEntries` / `getEntryPerformers` — read them first.)

**Step 4: Wire the three call sites**

1. `server/autoPayoutScheduler.ts` — after the `.set({ payoutComplete: true, status: "completed" })` update: `await db.unlockTournamentCards(t.id);` (match the variable naming in that file; it imports from `./db`).
2. `server/routers.ts` `distributePrizes` success path (from Task 4): after `updateTournament(..., { status: "completed" })` add `await db.unlockTournamentCards(input.tournamentId);`
3. `server/routers.ts` `admin.tournaments.update`: after `db.updateTournament(id, data)` add:
```ts
          if (data.status === "completed") {
            await db.unlockTournamentCards(id);
          }
```

**Step 5: Verify** — `pnpm test && pnpm check` → all pass.

**Step 6: Commit**

```bash
git add server/db.ts server/autoPayoutScheduler.ts server/routers.ts server/unlockTournamentCards.test.ts
git commit -m "fix: unlock NFT cards when tournament completes (cards were locked forever)"
```

---

### Task 7: Age verification gate (compliance)

**Objective:** Block the UI behind an 18+ confirmation modal on first visit (localStorage-persisted), shown before ANY content renders. This is the minimum compliance bar for an adult site; document that real age verification (per UK OSA / US state laws) needs a vendor decision.

**Files:**
- Create: `client/src/components/AgeGate.tsx`
- Modify: `client/src/App.tsx` (wrap `<Router />`)
- Test: `client/src/components/AgeGate.test.tsx` (create; vitest jsdom env is already configured per commit 802a7fb)

**Step 1: Write failing test**

```tsx
// client/src/components/AgeGate.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgeGate } from "./AgeGate";

describe("AgeGate", () => {
  beforeEach(() => localStorage.clear());

  it("blocks children until confirmed", () => {
    render(<AgeGate><div data-testid="content">site</div></AgeGate>);
    expect(screen.queryByTestId("content")).toBeNull();
    expect(screen.getByText(/18/)).toBeTruthy();
  });

  it("reveals children after confirmation and persists", () => {
    render(<AgeGate><div data-testid="content">site</div></AgeGate>);
    fireEvent.click(screen.getByRole("button", { name: /i am 18/i }));
    expect(screen.getByTestId("content")).toBeTruthy();
    expect(localStorage.getItem("psl-age-verified")).toBeTruthy();
  });

  it("skips the gate when previously confirmed", () => {
    localStorage.setItem("psl-age-verified", new Date().toISOString());
    render(<AgeGate><div data-testid="content">site</div></AgeGate>);
    expect(screen.getByTestId("content")).toBeTruthy();
  });

  it("redirects away on exit", () => {
    render(<AgeGate><div data-testid="content">site</div></AgeGate>);
    expect(screen.getByRole("button", { name: /leave/i })).toBeTruthy();
  });
});
```

Check `@testing-library/react` is installed: `grep testing-library package.json` — if missing, `pnpm add -D @testing-library/react`.

**Step 2: Run to verify failure** — FAIL (component missing).

**Step 3: Implement `client/src/components/AgeGate.tsx`:**

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "psl-age-verified";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean>(
    () => !!localStorage.getItem(STORAGE_KEY)
  );

  if (verified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="max-w-md mx-4 rounded-lg border border-border bg-card p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold">Adults Only — 18+</h1>
        <p className="text-muted-foreground text-sm">
          This website contains adult-oriented content. By entering you confirm
          that you are at least 18 years old (or the age of majority in your
          jurisdiction) and that viewing adult content is legal where you live.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, new Date().toISOString());
              setVerified(true);
            }}
          >
            I am 18 or older — Enter
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
          >
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Wire into `client/src/App.tsx`** — wrap the router:

```tsx
import { AgeGate } from "@/components/AgeGate";
// ...
          <TooltipProvider>
            <Toaster />
            <InstallPrompt />
            <AgeGate>
              <Router />
            </AgeGate>
          </TooltipProvider>
```

**Step 5: Verify** — `pnpm test && pnpm check` → pass. Optionally `pnpm dev` and eyeball.

**Step 6: Commit**

```bash
git add client/src/components/AgeGate.tsx client/src/components/AgeGate.test.tsx client/src/App.tsx
git commit -m "feat: 18+ age gate shown before any content (compliance baseline)"
```

---

### Task 8: Client-side admin route guards

**Objective:** Stop rendering `/admin/*` and `/nft-studio` pages to non-admins (APIs are protected; pages aren't — a non-admin sees a broken admin shell and we ship admin UI to everyone).

**Files:**
- Create: `client/src/components/RequireAdmin.tsx`
- Modify: `client/src/App.tsx:58-63` (admin routes)

**Step 1: Implement `client/src/components/RequireAdmin.tsx`:**

```tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "admin") return <Redirect to="/" />;
  return <>{children}</>;
}
```

Check first: read `client/src/_core/hooks/useAuth.ts` to confirm the `user.role` field name, and confirm `wouter` exports `Redirect` in the installed version (`grep -rn "Redirect" node_modules/wouter/types/index.d.ts | head -3`; if absent use `useLocation()[1]("/")` in an effect).

**Step 2: Wrap routes in `App.tsx`:**

```tsx
      {/* Admin */}
      <Route path="/admin">
        <RequireAdmin><AdminDashboard /></RequireAdmin>
      </Route>
      <Route path="/admin/movies">
        <RequireAdmin><AdminMovies /></RequireAdmin>
      </Route>
      <Route path="/admin/performers">
        <RequireAdmin><AdminPerformers /></RequireAdmin>
      </Route>
      <Route path="/admin/tournaments/create">
        <RequireAdmin><AdminCreateTournament /></RequireAdmin>
      </Route>
      <Route path="/nft-studio">
        <RequireAdmin><NFTStudio /></RequireAdmin>
      </Route>
```

⚠️ wouter `Switch` matching: nested `/admin/movies` must stay ABOVE bare `/admin`? No — wouter matches exact paths by default (no prefix matching), so order is fine as-is. Keep the existing order.

**Step 3: Verify** — `pnpm check && pnpm test`; then `pnpm dev`, log out, visit `/admin` → expect redirect to `/`.

**Step 4: Commit**

```bash
git add client/src/components/RequireAdmin.tsx client/src/App.tsx
git commit -m "fix: guard admin routes client-side (redirect non-admins)"
```

---

### Task 9: Final verification & push

**Step 1:** `pnpm test` — full suite green.
**Step 2:** `pnpm check` — tsc clean.
**Step 3:** `pnpm build` — production build succeeds.
**Step 4:**

```bash
git push -u origin fix/p0-security-correctness
```

Then open a PR to `main` titled **"P0: money-correctness, payout idempotency, roster ownership, age gate"** summarizing the eight fixes.

---

## Out of scope (deliberately deferred — needs product decisions)

1. **Entry-fee enforcement** — `tournaments.enter` never verifies the on-chain `payEntry` happened. Fix requires deciding: credits-based fees (debit ledger at entry) vs on-chain verification (read escrow state/events). Recommend a separate plan once decided.
2. **`updateEntry` legacy-path rewrite** — roster editing still uses the old blockchain-NFT ownership model and doesn't lock/unlock cards. Should be rebuilt on platform cards (mirror Task 5), including unlock-old/lock-new card handling. Medium-size; separate plan.
3. **Real age verification vendor** (Yoti/AgeChecked etc.) for UK OSA/state-law compliance; Task 7 is the baseline self-attestation only. Also missing: 2257 notice, ToS, privacy pages.
4. **Admin audit log, user management UI, bulk scene-action logging** — P1s from the review.

## Risks

- **Drizzle mysql2 update result shape**: Tasks 3/4 read `affectedRows`; verify the destructured shape against the installed drizzle version before relying on tests-by-mock.
- **Task 5 breaks legacy entrants**: any client flow still submitting `nftTokenId`-only rosters will now 400. Verified `TournamentEntry.tsx` must be checked/updated in the same task.
- **TiDB transaction support**: TiDB supports transactions (optimistic by default); `db.transaction()` works, but retry-on-write-conflict may be worth adding later if marketplace volume grows.

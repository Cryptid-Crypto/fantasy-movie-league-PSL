import { beforeEach, describe, expect, it, vi } from "vitest";

// buyNftListing calls getDb() internally (same-module call), so mocking the
// "./db" export wouldn't intercept it. Instead we mock the drizzle() factory
// that getDb() uses, and set DATABASE_URL so getDb() builds (and caches) our
// fake db.
process.env.DATABASE_URL = "mysql://fake:fake@localhost/fake";

// ---- Configurable fixtures (reset per test) ----
let listingRow: Record<string, unknown> | undefined;
let claimAffectedRows = 1;
let buyerBalance = 0;

// ---- Call recorders ----
const insertCalls: Array<{ table: unknown; values: Record<string, unknown> }> = [];
const updateCalls: Array<{ table: unknown; values: Record<string, unknown> }> = [];

// Fake tx supporting the chains buyNftListing uses. `from(table)` /
// `update(table)` / `insert(table)` receive the actual drizzle table objects,
// so we can branch/assert by identity.
function makeTx() {
  return {
    select: (_fields?: unknown) => ({
      from: (table: unknown) => ({
        where: (_cond: unknown) => {
          // Balance query: select({ total }).from(creditLedger).where(...)
          // resolves directly; listing query adds .limit(1). Support both.
          const rows =
            table === schema.creditLedger
              ? [{ total: buyerBalance }]
              : listingRow
                ? [listingRow]
                : [];
          const p = Promise.resolve(rows) as Promise<unknown[]> & {
            limit: (n: number) => Promise<unknown[]>;
          };
          p.limit = () => Promise.resolve(rows);
          return p;
        },
      }),
    }),
    update: (table: unknown) => ({
      set: (values: Record<string, unknown>) => ({
        where: (_cond: unknown) => {
          updateCalls.push({ table, values });
          const affectedRows =
            table === schema.nftListings ? claimAffectedRows : 1;
          // drizzle mysql2: MySqlRawQueryResult = [ResultSetHeader, FieldPacket[]]
          return Promise.resolve([{ affectedRows }, []]);
        },
      }),
    }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => {
        insertCalls.push({ table, values });
        return Promise.resolve([{ affectedRows: 1, insertId: 1 }, []]);
      },
    }),
  };
}

const fakeDb = {
  transaction: async (cb: (tx: ReturnType<typeof makeTx>) => Promise<void>) => {
    // Propagates throws; nothing "commits" on throw — assertions inspect
    // which calls were attempted before the error.
    return cb(makeTx());
  },
};

vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: () => fakeDb,
}));

import * as schema from "../drizzle/schema";
import { buyNftListing } from "./db";

const activeListing = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 7,
  nftCardId: 42,
  sellerId: 1,
  priceCredits: 100,
  status: "active",
  buyerId: null,
  soldAt: null,
  ...overrides,
});

describe("buyNftListing (atomic marketplace purchase)", () => {
  beforeEach(() => {
    listingRow = undefined;
    claimAffectedRows = 1;
    buyerBalance = 0;
    insertCalls.length = 0;
    updateCalls.length = 0;
  });

  it("throws when the listing claim affects 0 rows (already sold / concurrent buyer)", async () => {
    listingRow = activeListing();
    buyerBalance = 500;
    claimAffectedRows = 0; // another buyer flipped active→sold first

    await expect(buyNftListing(7, 2)).rejects.toThrow(/no longer available/i);

    const ledgerInserts = insertCalls.filter(
      (c) => c.table === schema.creditLedger,
    );
    expect(ledgerInserts).toHaveLength(0);
  });

  it("debits buyer, credits seller minus 5% fee, transfers card, records history — all on the same tx", async () => {
    listingRow = activeListing({ priceCredits: 100, sellerId: 1 });
    buyerBalance = 500;

    await buyNftListing(7, 2);

    const ledgerInserts = insertCalls.filter(
      (c) => c.table === schema.creditLedger,
    );
    expect(ledgerInserts).toHaveLength(2);
    expect(ledgerInserts[0].values).toMatchObject({
      userId: 2,
      amount: -100,
      type: "nft_purchase",
      relatedNftCardId: 42,
      relatedListingId: 7,
    });
    expect(ledgerInserts[1].values).toMatchObject({
      userId: 1,
      amount: 95, // 100 minus 5% platform fee
      type: "nft_sale",
      relatedNftCardId: 42,
      relatedListingId: 7,
    });

    // Listing claimed atomically (active→sold) on the tx
    const listingUpdates = updateCalls.filter(
      (c) => c.table === schema.nftListings,
    );
    expect(listingUpdates).toHaveLength(1);
    expect(listingUpdates[0].values).toMatchObject({ status: "sold", buyerId: 2 });

    // Card ownership transferred to buyer on the tx
    const cardUpdates = updateCalls.filter((c) => c.table === schema.nftCards);
    expect(cardUpdates).toHaveLength(1);
    expect(cardUpdates[0].values).toMatchObject({ ownerId: 2 });

    // Transfer history recorded on the tx
    const historyInserts = insertCalls.filter(
      (c) => c.table === schema.nftTransferHistory,
    );
    expect(historyInserts).toHaveLength(1);
    expect(historyInserts[0].values).toMatchObject({
      nftCardId: 42,
      fromUserId: 1,
      toUserId: 2,
      transferType: "marketplace_sale",
      priceCredits: 100,
      listingId: 7,
    });
  });

  it("throws when buyer balance insufficient (checked inside tx)", async () => {
    listingRow = activeListing({ priceCredits: 100 });
    buyerBalance = 10;

    await expect(buyNftListing(7, 2)).rejects.toThrow(/insufficient/i);

    // No ownership transfer attempted
    const cardUpdates = updateCalls.filter((c) => c.table === schema.nftCards);
    expect(cardUpdates).toHaveLength(0);
  });

  it("rejects self-purchase", async () => {
    listingRow = activeListing({ sellerId: 2 });
    buyerBalance = 500;

    await expect(buyNftListing(7, 2)).rejects.toThrow(/own listing/i);

    expect(insertCalls).toHaveLength(0);
    expect(updateCalls).toHaveLength(0);
  });
});

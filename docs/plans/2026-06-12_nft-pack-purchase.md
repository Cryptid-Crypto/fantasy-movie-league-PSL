# NFT Pack Purchase Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Allow players to purchase packs of 8 randomly-selected Performer NFTs (1 Rare, 2 Uncommon, 5 Common) for $5 USDC, with pack opening animation.

**Architecture:** Extend existing NFT card system to support randomized pack generation, add payment flow via Polygon USDC, and create reveal animation using existing card assets.

**Tech Stack:** React 19, wagmi 2, viem 2, existing tRPC 11 backend, Drizzle ORM, Tailwind CSS 4.

---

## Phase 1: Backend - Pack Configuration & Randomness

### Task 1: Add Pack Configuration Table to Database Schema

**Objective:** Create table to track pack types and rarity distributions.

**Files:**
- Create: `new_table` in `/tmp/fantasy-movie-league-PSL/drizzle/schema.ts`
- Modify: `schema.ts` (add after `creditLedger` table)

**Step 1: Add packTypes table**

```typescript
export const packTypes = mysqlTable("packTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  priceUsdCents: int("priceUsdCents").notNull(), // $5 = 500 cents
  cardCount: int("cardCount").notNull().default(8),
  rareCount: int("rareCount").notNull().default(1),
  uncommonCount: int("uncommonCount").notNull().default(2),
  commonCount: int("commonCount").notNull().default(5),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PackType = typeof packTypes.$inferSelect;
export type InsertPackType = typeof packTypes.$inferInsert;
```

**Step 2: Create and apply migration**

Run: `pnpm db:push`
Expected: Migration file created in `/tmp/fantasy-movie-league-PSL/drizzle/migrations/`

**Step 3: Seed default pack type**

```typescript
// Add to seed-db.mjs or create seed-packs.mjs
const starterPack = {
  name: "Starter Pack",
  description: "8 Performer NFTs: 1 Rare, 2 Uncommon, 5 Common",
  priceUsdCents: 500,
  cardCount: 8,
  rareCount: 1,
  uncommonCount: 2,
  commonCount: 5,
  isActive: true,
};
```

---

### Task 2: Create Pack Purchase Endpoint in tRPC

**Objective:** Add `admin.packs.*` and user-facing `packs.purchase` procedures.

**Files:**
- Create: `/tmp/fantasy-movie-league-PSL/server/routers/packs.ts`
- Modify: `/tmp/fantasy-movie-league-PSL/server/routers.ts`

**Step 1: Create packs router**

```typescript
// server/routers/packs.ts
import { router, publicProcedure, adminProcedure } from "./_core";
import { z } from "zod";
import { randomInt } from "crypto";

export const packsRouter = router({
  // Get available pack types
  getAvailable: publicProcedure.query(async () => {
    return db.select().from(schema.packTypes).where(eq(schema.packTypes.isActive, true));
  }),

  // Admin: Create pack type
  createPackType: adminProcedure.input(/* ... */).mutation(/* ... */),

  // Initialize available performers by rarity
  getAvailablePerformers: publicProcedure.input(
    z.object({ rarity: z.enum(["Common", "Rare", "Epic", "Legendary"]) })
  ).query(async ({ input }) => {
    // Count NFT cards by rarity that haven't been minted on-chain
    // Return performers with available cards in that rarity
  }),

  // Purchase endpoint (called after payment)
  purchase: publicProcedure.input(
    z.object({
      packTypeId: z.number().int(),
      paymentTxHash: z.string(), // For verification
      walletAddress: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    // Verify payment
    // Random select cards per rarity weights
    // Create pending NFT cards (ownerId set after mint)
    // Lock cards until minted (isLocked = true)
    // Return pack of card IDs for reveal animation
  }),
});
```

---

## Phase 2: Frontend - Pack Purchase UI

### Task 3: Create Pack Selection Page

**Objective:** Build `/marketplace/packs` page for pack browsing and purchase.

**Files:**
- Create: `/tmp/fantasy-movie-league-PSL/client/src/pages/PackShop.tsx`
- Modify: `/tmp/fantasy-movie-league-PSL/client/src/App.tsx` (add route)

**Step 1: Create pack card component**

```tsx
// client/src/components/PackCard.tsx
export function PackCard({ packType }: { packType: PackType }) {
  const purchaseMutation = trpc.packs.purchase.useMutation();
  const { data: availableCount } = trpc.packs.getAvailableCount.useQuery({ 
    packTypeId: packType.id 
  });
  
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-xl font-bold">{packType.name}</h3>
      <p className="text-sm text-muted-foreground">{packType.description}</p>
      <div className="my-4">
        <span className="text-2xl font-bold">${packType.priceUsdCents / 100}</span>
      </div>
      <Button 
        onClick={() => purchaseMutation.mutate({ packTypeId: packType.id })}
        disabled={availableCount?.totalAvailable < packType.cardCount}
      >
        Purchase Pack
      </Button>
    </div>
  );
}
```

---

### Task 4: Create Pack Opening Animation Component

**Objective:** Fun card reveal animation showing 8 cards in sequence.

**Files:**
- Create: `/tmp/fantasy-movie-league-PSL/client/src/components/PackOpeningAnimation.tsx`

**Step 1: Create animation with Framer Motion**

```tsx
// PackOpeningAnimation.tsx
import { motion, AnimatePresence } from "framer-motion";

const packRevealVariants = {
  closed: { rotateY: 0, scale: 1 },
  open: (i: number) => ({
    rotateY: 180,
    scale: 1.1,
    transition: { delay: i * 0.3, duration: 0.6 },
  }),
  revealed: { 
    y: -100, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300 }
  }
};

export function PackOpeningAnimation({ 
  cardIds, 
  onComplete 
}: { 
  cardIds: number[]; 
  onComplete: () => void;
}) {
  const [stage, setStage] = useState<"pack" | "revealing" | "complete">("pack");
  const [revealed, setRevealed] = useState<number[]>([]);
  
  useEffect(() => {
    // Trigger reveal after pack "opens"
    const timer = setTimeout(() => {
      cardIds.forEach((id, i) => {
        setTimeout(() => {
          setRevealed(prev => [...prev, id]);
        }, i * 300);
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Animation implementation...
}
```

---

## Phase 3: Web3 Payment Integration

### Task 5: Add USDC Contract Integration

**Objective:** Support USDC payments on Polygon for pack purchases.

**Files:**
- Create: `/tmp/fantasy-movie-league-PSL/shared/contracts/usdc.ts`
- Modify: `/tmp/fantasy-movie-league-PSL/client/src/lib/web3.ts`

**Step 1: Add USDC ABI and contract address**

```typescript
// shared/contracts/usdc.ts
export const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
] as const;

// Polygon mainnet - verify correct address
export const USDC_POLYGON_ADDRESS = "0x3c499c54429d6fdea5ed2121d3a1eb9f9cdb5086";
// Mumbai testnet
export const USDC_MUMBAI_ADDRESS = "0x0FA8555068e9e886662532574453443731E8e264";
```

**Step 2: Create payment hook**

```tsx
// client/src/hooks/usePackPurchase.ts
export function usePackPurchase() {
  const { address, chain } = useAccount();
  const { data: usdcContract } = useContract({
    address: chain?.id === 137 ? USDC_POLYGON_ADDRESS : USDC_MUMBAI_ADDRESS,
    abi: USDC_ABI,
  });
  
  const purchaseWithUSDC = async (amount: bigint, packTypeId: number) => {
    // Approve USDC spend
    // Call purchase endpoint with tx hash
    // Handle success/error states
  };
}
```

---

## Phase 4: NFT Card Creation After Payment

### Task 6: Generate NFT Cards During Purchase

**Objective:** Create platform-native NFT cards with proper rarities upon successful payment.

**Files:**
- Modify: `/tmp/fantasy-movie-league-PSL/server/routers/packs.ts` (purchase procedure)
- Create: `/tmp/fantasy-movie-league-PSL/server/_core/card-generator.ts`

**Step 1: Add card generation logic**

```typescript
// In packs router purchase mutation
const generatePackCards = async (packTypeId: number, userId: number) => {
  const pack = /* get pack type */;
  const cardIds = [];
  
  // 1 Rare
  for (let i = 0; i < pack.rareCount; i++) {
    const performer = getRandomPerformerByRarity("Rare");
    const serial = await getNextSerial(performer.id);
    const card = await db.insert(schema.nftCards).values({
      performerId: performer.id,
      ownerId: userId,
      serialNumber: serial,
      rarity: "Rare",
      isLocked: true, // Locked until on-chain mint
    }).returning();
    cardIds.push(card[0].id);
  }
  
  // 2 Uncommon
  // 5 Common - similar logic
  
  return cardIds;
};
```

---

## Phase 5: Testing & Verification

### Task 7: Write Tests for Pack Purchase Flow

**Objective:** Vitest tests for randomness, rarity distribution, and minting.

**Files:**
- Create: `/tmp/fantasy-movie-league-PSL/tests/packs.test.ts`

**Step 1: Test rarity distribution**

```typescript
// tests/packs.test.ts
import { expect, test, describe } from "vitest";

describe("Pack Purchase", () => {
  test("generates correct rarity distribution", () => {
    const pack = generatePackCards();
    const rarities = countByRarity(pack);
    expect(rarities.Rare).toBe(1);
    expect(rarities.Uncommon).toBe(2);
    expect(rarities.Common).toBe(5);
  });
  
  test("cards are locked until minted", async () => {
    const card = await createPackCard();
    expect(card.isLocked).toBe(true);
  });
});
```

---

## Phase 6: Integration with Existing Systems

### Task 8: Integrate with Marketplace Page

**Objective:** Add "Packs" tab to existing `/marketplace` route.

**Files:**
- Modify: `/tmp/fantasy-movie-league-PSL/client/src/pages/Marketplace.tsx`

### Task 9: Add Transaction Recording

**Objective:** Record pack purchases in `transactions` table for history.

**Files:**
- Modify: `/tmp/fantasy-movie-league-PSL/server/routers/packs.ts`

---

## Verification Checklist

- [ ] PackTypes table created and seeded
- [ ] `/marketplace/packs` route works
- [ ] "Starter Pack" shows $5 price and 8-card description
- [ ] Purchase button triggers USDC payment flow
- [ ] Pack opening animation shows 8 cards sequentially
- [ ] Cards are created in database with correct rarities
- [ ] Transaction recorded in `transactions` table
- [ ] Tests pass: `pnpm test tests/packs.test.ts`

---

## Dependencies to Install

```bash
pnpm add @stripe/stripe-js  # If using Credit Card via Stripe
pnpm add @rainbow-me/rainbowkit  # Better wallet connection UX
```

Or use existing wagmi setup for direct USDC transfer.
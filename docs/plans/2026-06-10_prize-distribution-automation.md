# Prize Distribution Automation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Implement automated prize distribution for tournaments after scores are finalized, allowing admins to trigger payouts via the TournamentEscrow smart contract.

**Architecture:** 
- Extend admin API with a new `distributePrizes` procedure that reads the tournament leaderboard, determines winners based on configurable prize splits, and calls the existing TournamentEscrow contract via ethers.js.
- Add a frontend button in the Tournament Leaderboard page for admins to trigger distribution after scores are calculated.
- Ensure only admins can trigger the action, with proper validation and transaction handling.

**Tech Stack:**
- Node.js/TRPC (server)
- TypeScript, React, Wagmi (client)
- Ethers.js for contract interaction
- Polygon network (Mumbai testnet for development)
- Existing TournamentEscrow.sol contract

---

### Task 1: Add TournamentEscrow contract ABI and address to web3 configuration

**Objective:** Make the TournamentEscrow contract interactable from the frontend.

**Files:**
- Create: `client/src/lib/web3Contracts.ts` (optional) or extend `web3Config.ts`
- Modify: `client/src/lib/web3Config.ts`

**Step 1: Write failing test** (Not applicable – configuration change)

**Step 2: Run test to verify failure** (Skip)

**Step 3: Write minimal implementation**

Add contract ABI (import from artifacts) and address mapping.

```typescript
// client/src/lib/web3Config.ts
import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import tournamentEscrowAbi from '@/abis/TournamentEscrow.json'; // Ensure ABI is copied to abis folder

export const config = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [injected()],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

// Polygon network constants
export const POLYGON_MAINNET_CHAIN_ID = polygon.id;
export const POLYGON_TESTNET_CHAIN_ID = polygonAmoy.id;

// Default to testnet for development
export const DEFAULT_CHAIN_ID = POLYGON_TESTNET_CHAIN_ID;

// Contract addresses (replace with actual deployed addresses)
export const TOURNAMENT_ESCROW_ADDRESSES = {
  [POLYGON_MAINNET_CHAIN_ID]: '0xYourMainnetEscrowAddress', // TODO: replace after deployment
  [POLYGON_TESTNET_CHAIN_ID]: '0xYourTestnetEscrowAddress', // TODO: replace after deployment
};

// Export ABI for use in hooks
export const TOURNAMENT_ESCROW_ABI = tournamentEscrowAbi;
```

**Step 4: Run test to verify pass** (Ensure dev server starts without errors)

Run: `pnpm dev` (client) – should compile successfully.

**Step 5: Commit**

```bash
git add client/src/lib/web3Config.ts
git commit -m "feat: add TournamentEscrow contract config"
```

---

### Task 2: Create a utility function to distribute prizes via contract

**Objective:** Encapsulate ethers.js contract call for prize distribution.

**Files:**
- Create: `client/src/lib/prizeDistribution.ts`

**Step 1: Write failing test**

Create a simple test that expects the function to throw when not connected.

```typescript
// client/src/lib/prizeDistribution.test.ts
import { distributePrizes } from './prizeDistribution';

describe('distributePrizes', () => {
  it('should throw if wallet not connected', async () => {
    await expect(distributePrizes(1, [])).rejects.toThrow('Wallet not connected');
  });
});
```

Run: `pnpm test -- src/lib/prizeDistribution.test.ts` – expect failure.

**Step 2: Run test to verify failure** (see above)

**Step 3: Write minimal implementation**

```typescript
// client/src/lib/prizeDistribution.ts
import { config } from './web3Config';
import { configureChains, createClient, wagmiConfig } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { TOURNAMENT_ESCROW_ABI, TOURNAMENT_ESCROW_ADDRESSES } from './web3Config';

// Initialize wagmi (already done in web3Config, but we need a client for read/write)
const { chains, provider, wsProvider } = configureChains(
  [polygon],
  [publicProvider()]
);
const wagmiClient = createClient({
  autoConnect: true,
  provider,
  wsProvider,
});

export async function distributePrizes(
  tournamentId: number,
  winners: { wallet: string; percentage: number }[]
): Promise<void> {
  const { data: walletClient } = useWalletClient();
  if (!walletClient) {
    throw new Error('Wallet not connected');
  }

  const signer = await walletClient.getSigner();
  const address = TOURNAMENT_ESCROW_ADDRESSES[wagmiConfig.chains[0].id];
  if (!address) {
    throw new Error('TournamentEscrow address not configured for current chain');
  }

  const contract = new ethers.Contract(address, TOURNAMENT_ESCROW_ABI, signer);
  const tx = await contract.distributePrizes(tournamentId, winners);
  await tx.wait();
}
```

**Step 4: Run test to verify pass**

Run: `pnpm test -- src/lib/prizeDistribution.test.ts` – expect pass.

**Step 5: Commit**

```bash
git add client/src/lib/prizeDistribution.ts client/src/lib/prizeDistribution.test.ts
git commit -m "feat: add prize distribution utility"
```

---

### Task 3: Add admin API endpoint to trigger prize distribution

**Objective:** Enable admins to call a backend function that calculates winners and calls the contract.

**Files:**
- Modify: `server/routers.ts` (add procedure under admin.tournaments)
- Create: `server/prizeDistributionUtils.ts` (helper to compute winners and call contract)

**Step 1: Write failing test**

Add a test that expects the procedure to return 403 for non-admin.

```typescript
// server/admin.tournaments.distributePrizes.test.ts
import { createCallerFactory } from '@/server/routers';
import { createContext } from '@/server/trpc';
import { distributePrizes as distributePrizesFn } from '@/server/prizeDistributionUtils';

jest.mock('@/server/prizeDistributionUtils');

describe('admin.tournaments.distributePrizes', () => {
  const createCaller = createCallerFactory(appRouter);

  it('should return FORBIDDEN for non-admin', async () => {
    const ctx = createContext({
      user: { id: '1', role: 'user' },
      req: {} as any,
      res: {} as any,
    });
    const caller = createCaller(ctx);
    await expect(
      caller.admin.tournaments.distributePrizes({ tournamentId: 1 })
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
```

Run: `pnpm test -- server/admin.tournaments.distributePrizes.test.ts` – expect failure.

**Step 2: Run test to verify failure** (see above)

**Step 3: Write minimal implementation**

First, create the helper:

```typescript
// server/prizeDistributionUtils.ts
import { ethers } from 'ethers';
import * as db from './db';
import { getTournamentEscrowAddress, getTournamentEscrowAbi } from './blockchainConfig'; // TODO: create blockchainConfig.ts

export async function distributeTournamentPrizes(
  tournamentId: number
): Promise<void> {
  // 1. Fetch leaderboard entries with scores
  const entries = await db.getTournamentEntriesWithScores(tournamentId);
  if (entries.length === 0) {
    throw new Error('No entries found for tournament');
  }

  // 2. Determine winners (example: top 3 get 50%, 30%, 20%)
  const prizeDistribution = [50, 30, 20]; // basis points will be handled later
  const winners = entries
    .sort((a, b) => b.score - a.score)
    .slice(0, prizeDistribution.length)
    .map((entry, idx) => ({
      wallet: entry.user.walletAddress,
      percentage: prizeDistribution[idx] * 100, // convert to basis points (e.g., 50 -> 5000)
    }));

  // 3. Call TournamentEscrow contract
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  const address = getTournamentEscrowAddress();
  const abi = getTournamentEscrowAbi();
  const contract = new ethers.Contract(address, abi, signer);

  const tx = await contract.distributePrizes(tournamentId, winners);
  await tx.wait();
}
```

Now add the procedure to routers.ts:

```typescript
// Inside admin.tournaments router
distributePrizes: adminProcedure
  .input(z.object({ tournamentId: z.number() }))
  .mutation(async ({ input }) => {
    await distributeTournamentPrizes(input.tournamentId);
    return { success: true };
  }),
```

**Step 4: Run test to verify pass**

Run the test again – should pass.

**Step 5: Commit**

```bash
git add server/prizeDistributionUtils.ts server/routers.ts
git commit -m "feat: add admin prize distribution API endpoint"
```

---

### Task 4: Add frontend button to trigger prize distribution

**Objective:** Provide UI for admins to distribute prizes after scores are calculated.

**Files:**
- Modify: `client/src/pages/TournamentLeaderboard.tsx`
- Create: `client/src/components/AdminPrizeDistributeButton.tsx` (optional)

**Step 1: Write failing test** (Not applicable for UI)

**Step 2: Run test to verify failure** (Skip)

**Step 3: Write minimal implementation**

Add a button that shows only for admins, calls the API, and shows loading/status.

```typescript
// client/src/pages/TournamentLeaderboard.tsx
import { useMutation } from '@trpc/client';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

export default function TournamentLeaderboard() {
  const { data: tournament } = useRouter().query;
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  const distributeMutation = useMutation(
    api.admin.tournaments.distributePrizes.mutate,
    {
      onSuccess: () => {
        toast.success('Prizes distributed successfully!');
        // Optionally refetch leaderboard
      },
      onError: (error) => {
        toast.error(`Failed to distribute prizes: ${error.message}`);
      },
    }
  );

  return (
    <div>
      {/* Existing leaderboard content */}
      {isAdmin && (
        <button
          onClick={() => distributeMutation.mutate({ tournamentId: Number(tournament.id) })}
          disabled={distributeMutation.isLoading}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {distributeMutation.isLoading ? 'Distributing...' : 'Distribute Prizes'}
        </button>
      )}
    </div>
  );
}
```

**Step 4: Run test to verify pass**

Start dev server and verify button appears for admin and calls API without errors.

**Step 5: Commit**

```bash
git add client/src/pages/TournamentLeaderboard.tsx
git commit -m "feat: add distribute prizes button to leaderboard"
```

---

### Task 5: Write end-to-end test (manual) and document verification steps

**Objective:** Ensure the flow works in a test environment.

**Files:** None new (use existing testnet)

**Step 1: Write failing test** (N/A)

**Step 2: Run test to verify failure** (N/A)

**Step 3: Write minimal implementation**

**Verification Steps:**
1. Deploy TournamentEscrow contract to Mumbai testnet (use existing deploy.ts or create new).
2. Update `TOURNAMENT_ESCROW_ADDRESSES` in `web3Config.ts` with the deployed address.
3. Create a tournament via admin panel, set entry fee, and have users enter.
4. Simulate scene logs and run `admin.tournaments.calculateScores` to finalize scores.
5. As admin, visit the tournament leaderboard page and click "Distribute Prizes".
6. Confirm transaction succeeds on Polygonscan and winners receive funds.
7. Ensure non-admin users cannot see the button and receive FORBIDDEN if they attempt to call the API directly.

**Step 4: Run test to verify pass** – Perform the steps above.

**Step 5: Commit** (no code changes needed for verification)

```bash
git commit --allow-empty -m "test: verify prize distribution flow on Mumbai testnet"
```

---

## Summary

After completing these tasks, admins will be able to automatically distribute prizes to tournament winners based on on‑chain scores, completing the prize‑distribution feature outlined in the Future Enhancements section of the platform guide.

**Next Steps:**
- Consider making prize splits configurable per tournament (admin setting).
- Add event listening to auto‑trigger distribution when a tournament ends (optional backend cron).
- Write unit tests for the new API and utility functions.

---
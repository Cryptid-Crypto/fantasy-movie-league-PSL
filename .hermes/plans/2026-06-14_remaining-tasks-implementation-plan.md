# Fantasy Movie League Remaining Tasks Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Complete all remaining unchecked tasks from the TODO.md file to make the Fantasy Movie League (Porn Star League) platform production-ready.

**Architecture:** Phase-based approach grouping related tasks into logical workflows. Each phase focuses on a specific domain (Testing, Payments, Admin Features, etc.) with bite-sized tasks that can be completed in 2-5 minutes each. Uses TDD methodology throughout with frequent commits.

**Tech Stack:** React + Vite + Wouter + tRPC 11 + wagmi v2 + ethers v6 + Drizzle ORM (MySQL/TiDB) + Hardhat; pnpm + vitest; Node.js/TypeScript

---

## Phase 1: Testing Foundation (Estimated: 2-3 hours)

**Goal:** Establish test coverage for core functionality before adding new features.

### Task 1: Add unit tests for scoring logic

**Objective:** Create unit tests for the scoring-utils.ts module to ensure scoring calculations are correct.

**Files:**
- Create: `server/scoring-utils.test.ts`

**Step 1: Write failing test**

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { calculateScoreForPerformerInScene } from "./scoring-utils";

// Mock data
const mockActions = [
  { id: 1, name: "facial", points: 10 },
  { id: 2, name: "double penetration", points: 20 },
  { id: 3, name: "anal", points: 15 }
];

describe("calculateScoreForPerformerInScene", () => {
  it("returns 0 for performer with no actions in scene", () => {
    const sceneActions = []; // No actions
    const result = calculateScoreForPerformerInScene(sceneActions, mockActions);
    expect(result).toBe(0);
  });

  it("sums points for performer with multiple actions", () => {
    const sceneActions = [
      { actionId: 1 }, // facial = 10 points
      { actionId: 2 }, // double penetration = 20 points
      { actionId: 1 }  // facial again = 10 points
    ];
    const result = calculateScoreForPerformerInScene(sceneActions, mockActions);
    expect(result).toBe(40); // 10 + 20 + 10
  });
});
```

**Step 2: Run test to verify failure**
Run: `pnpm vitest run server/scoring-utils.test.ts`
Expected: FAIL - "cannot find module './scoring-utils'" or function not exported

**Step 3: Write minimal implementation**
Add export to scoring-utils.ts if needed, then implement the function.

**Step 4: Run test to verify pass**
Run: `pnpm vitest run server/scoring-utils.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add server/scoring-utils.test.ts server/scoring-utils.ts
git commit -m "feat: add unit tests for scoring logic"
```

### Task 2: Add integration tests for tournament flow

**Objective:** Create integration tests that test the complete tournament entry → scoring → payout flow.

**Files:**
- Create: `server/tournament.flow.test.ts`

(Continue with similar TDD pattern...)

## Phase 2: Payments & Crypto System (Estimated: 4-6 hours)

**Goal:** Implement the complete PSL token payment system and crypto payouts.

### Task 3: Create ERC-20 PSL token contract on Polygon

**Objective:** Write and deploy the ERC-20 PSL token contract for platform transactions.

**Files:**
- Create: `contracts/PSLToken.sol`
- Create: `scripts/deployPSLToken.ts`

**Step 1: Write failing test**
Create test that checks token supply, name, symbol, decimals.

**Step 2: Run test to verify failure**
Run: `pnpm test contracts/PSLToken.test.ts`
Expected: FAIL

**Step 3: Write contract implementation**
Implement ERC-20 standard with OpenZeppelin.

**Step 4: Run test to verify pass**
Run: `pnpm test contracts/PSLToken.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add contracts/PSLToken.sol scripts/deployPSLToken.ts
git commit -m "feat: create ERC-20 PSL token contract"
```

## Phase 3: Admin Features & Dashboard (Estimated: 3-4 hours)

**Goal:** Complete admin dashboard and management interfaces.

### Task 4: Build admin dashboard layout with navigation

**Objective:** Create the main admin dashboard with navigation cards to all sub-modules.

**Files:**
- Create: `client/src/pages/AdminDashboard.tsx` (update existing)
- Create: `client/src/components/AdminDashboard/StatsCards.tsx`
- Create: `client/src/components/AdminDashboard/NavigationGrid.tsx`

**Step 1: Write failing test**
Create React component test checking for expected elements.

**Step 2: Run test to verify failure**
Run: `pnpm vitest run client/src/pages/AdminDashboard.test.tsx`
Expected: FAIL

**Step 3: Implement dashboard layout**
Create responsive grid with navigation cards.

**Step 4: Run test to verify pass**
Run: `pnpm vitest run client/src/pages/AdminDashboard.test.tsx`
Expected: PASS

**Step 5: Commit**
```bash
git add client/src/pages/AdminDashboard.tsx client/src/components/AdminDashboard/
git commit -m "feat: build admin dashboard layout with navigation"
```

## Phase 4: NFTs & Badges System (Estimated: 5-7 hours)

**Goal:** Complete all NFT card generation, badge integration, and portrait updates.

### Task 5: Create Python script to add official PSL bunny logo to portraits

**Objective:** Automate the process of adding the PSL logo to performer portraits.

**Files:**
- Create: `scripts/addPSLLogoToPortraits.py`
- Create: `assets/psl-bunny-logo.png` (if not exists)

**Step 1: Write failing test**
Create test that checks if logo is correctly composited.

**Step 2: Run test to verify failure**
Run: `python scripts/addPSLLogoToPortraits.py --test`
Expected: FAIL

**Step 3: Implement script**
Use PIL/Pillow to composite logo onto portraits.

**Step 4: Run test to verify pass**
Run: `python scripts/addPSLLogoToPortraits.py --test`
Expected: PASS

**Step 5: Commit**
```bash
git add scripts/addPSLLogoToPortraits.py assets/psl-bunny-logo.png
git commit -m "feat: create script to add PSL logo to portraits"
```

## Phase 5: Mobile & PWA Optimization (Estimated: 2-3 hours)

**Goal:** Optimize for mobile devices and add PWA capabilities.

### Task 6: Test on various mobile screen sizes

**Objective:** Verify responsive design works on common mobile breakpoints.

**Files:**
- Create: `tests/mobile/responsive.test.ts` (using playwright or similar)

**Step 1: Write failing test**
Create test that checks layout at 320px, 768px, 1024px widths.

**Step 2: Run test to verify failure**
Run: `pnpm test tests/mobile/responsive.test.ts`
Expected: FAIL

**Step 3: Implement responsive fixes**
Use TailwindCSS responsive classes and media queries.

**Step 4: Run test to verify pass**
Run: `pnpm test tests/mobile/responsive.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add tests/mobile/responsive.test.ts
git commit -m "feat: test and fix responsive design for mobile screens"
```

## Phase 6: Tournament System Enhancements (Estimated: 3-4 hours)

**Goal:** Complete tournament roster requirements, scoring updates, and leaderboard.

### Task 7: Update tournament entry validation to check roster requirements

**Objective:** Ensure tournament entry validates that user's selected performers meet roster type requirements.

**Files:**
- Modify: `server/routers.ts:447-552` (tournaments.enter)
- Modify: `server/db.ts` - helper functions if needed

**Step 1: Write failing test**
Create test that tries to enter tournament with insufficient performer types.

**Step 2: Run test to verify failure**
Run: `pnpm vitest run server/tournament.entry.test.ts`
Expected: FAIL (should allow invalid entry)

**Step 3: Implement validation**
Add logic to count performer types in roster and compare against requirements.

**Step 4: Run test to verify pass**
Run: `pnpm vitest run server/tournament.entry.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add server/routers.ts server/db.ts
git commit -m "feat: update tournament entry validation for roster requirements"
```

## Phase 7: Multi-Type Performer System (Estimated: 4-5 hours)

**Goal:** Implement support for performers having multiple types.

### Task 8: Add MILF to performer type enum in schema

**Objective:** Add MILF performer type to database schema and update related code.

**Files:**
- Modify: `drizzle/schema.ts` - performers table performerType enum
- Modify: `server/routers.ts` - wherever performerType is used
- Modify: `client/src/lib/types.ts` - if TypeScript types exist

**Step 1: Write failing test**
Create test that tries to insert performer with MILF type.

**Step 2: Run test to verify failure**
Run: `pnpm test drizzle/schema.test.ts` (or similar)
Expected: FAIL - MILF not in enum

**Step 3: Update schema**
Add "MILF" to the mysqlEnum values.

**Step 4: Run test to verify pass**
Run: `pnpm test drizzle/schema.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add drizzle/schema.ts
git commit -m "feat: add MILF to performer type enum"
```

## Phase 8: Final Polish & Deployment (Estimated: 2-3 hours)

**Goal:** Final verification, documentation, and deployment preparation.

### Task 9: Fix OAuth callback handler to properly handle redirects

**Objective:** Resolve OAuth callback issues preventing proper authentication flow.

**Files:**
- Modify: `server/routers.ts` - auth callbacks
- Create: `server/oauth.callback.test.ts`

**Step 1: Write failing test**
Create test that simulates OAuth callback with state validation.

**Step 2: Run test to verify failure**
Run: `pnpm vitest run server/oauth.callback.test.ts`
Expected: FAIL

**Step 3: Implement fix**
Ensure proper redirect handling and state validation.

**Step 4: Run test to verify pass**
Run: `pnpm vitest run server/oauth.callback.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add server/routers.ts server/oauth.callback.test.ts
git commit -m "fix: oauth callback handler redirect issues"
```

### Task 10: Save checkpoint and publish

**Objective:** Create final deployment-ready build and document the release.

**Files:**
- Modify: `package.json` - version bump if needed
- Create: `RELEASE_v0.14.0.md`

**Step 1: Run full test suite**
Run: `pnpm test`
Expected: ALL PASS

**Step 2: Create production build**
Run: `pnpm build`
Expected: Clean build output

**Step 3: Write release notes**
Document all completed features and fixes.

**Step 4: Commit**
```bash
git add -A
git commit -m "chore: release v0.14.0 - all remaining tasks completed"
```

## Execution Instructions

To execute this plan using Hermes:

1. **Verify prerequisites:**
   ```bash
   cd /home/sherman3/fantasy-movie-league-PSL
   pnpm install  # if not already installed
   pnpm check    # TypeScript check
   pnpm test     # Ensure baseline passes
   ```

2. **Execute phase by phase:**
   For each task in each phase:
   - Use the subagent-driven-development skill
   - Each subagent gets one task with full context
   - Two-stage review: spec compliance then code quality
   - Proceed only when both reviews approve

3. **Alternative execution:**
   If preferred, I can use the `delegate_task` tool directly for specific tasks instead of creating subagents for each.

4. **Commit frequently:**
   As shown in each task, commit after each bite-sized task completion.

## Success Criteria

- All 153 previously unchecked tasks from TODO.md are completed
- All tests pass (unit, integration, end-to-end where applicable)
- TypeScript checks pass with no errors
- Application builds successfully for production
- Manual verification of key user flows works correctly
- No regression in existing functionality

**Ready to begin execution. Shall I proceed with Phase 1 using subagent-driven-development?**
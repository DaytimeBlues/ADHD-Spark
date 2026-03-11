# Post-Merge Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the next release-readiness pass after PR #19 by closing the remaining operational gaps, reducing known code hotspots, and leaving a clean handoff path for future sessions.

**Architecture:** The app is already buildable and testable on `main`. The next pass should avoid broad rewrites and instead work in three layers: confirm production signals stay green, close the remaining configuration gap for Google sync, and reduce the highest-risk maintenance hotspots without changing user-visible behavior unless tests drive it.

**Tech Stack:** React Native, React Native Web, TypeScript, Jest, Playwright, GitHub Actions, webpack, GitHub Pages.

---

### Task 1: Confirm the post-merge `main` workflows fully settle

**Files:**
- Modify: `C:\dev\ADHD-CADDI-V1\docs\plans\2026-03-10-post-merge-readiness-plan.md`
- Reference: `C:\dev\ADHD-CADDI-V1\.github\workflows\android.yml`
- Reference: `C:\dev\ADHD-CADDI-V1\.github\workflows\pages.yml`

**Step 1: Check workflow state**

Run: `gh run list --branch main --limit 10 --json workflowName,status,conclusion,url,headSha`
Expected: the runs for merge commit `9171cf51f14c4aa5a5234dcd06f0a7ad84aae415` are visible.

**Step 2: Open failing logs only if something is red**

Run: `gh run view <run-id> --log-failed`
Expected: either no failed jobs or one clear root cause.

**Step 3: Record the final result in the plan file**

Add a short note under this task:
- `Android CI: pass/fail`
- `Deploy to GitHub Pages: pass/fail`
- link any failing run URL

**Step 4: Commit if this task produced repo changes**

```bash
git add docs/plans/2026-03-10-post-merge-readiness-plan.md
git commit -m "docs: record post-merge workflow state"
```

### Task 2: Close the Google sync configuration gap

**Files:**
- Reference: `C:\dev\ADHD-CADDI-V1\docs\GOOGLE_SETUP_GUIDE.md`
- Reference: `C:\dev\ADHD-CADDI-V1\.env.example`
- Reference: `C:\dev\ADHD-CADDI-V1\src\config\caddi.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\scripts\admin\check-config.js`
- Test: `C:\dev\ADHD-CADDI-V1\__tests__\caddi.config.test.ts`

**Step 1: Verify which variables are still required**

Run: `npm run admin:config-check`
Expected: only the Google client ID warning remains.

**Step 2: Cross-check docs against the actual config keys**

Read:
- `docs/GOOGLE_SETUP_GUIDE.md`
- `.env.example`
- `src/config/caddi.ts`

Expected: the documented variable names match the runtime config exactly.

**Step 3: If docs drift exists, update the docs and example env file**

Typical keys to verify:
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- any Android-related IDs if they are read by config

**Step 4: Re-run config verification**

Run: `npm run admin:config-check`
Expected: same warning if secrets are still intentionally unset, but no documentation mismatch remains.

**Step 5: Commit**

```bash
git add docs/GOOGLE_SETUP_GUIDE.md .env.example src/config/caddi.ts scripts/admin/check-config.js __tests__/caddi.config.test.ts
git commit -m "docs: align google setup guidance with runtime config"
```

### Task 3: Remove the recurring React `act(...)` warnings in tests

**Files:**
- Modify: `C:\dev\ADHD-CADDI-V1\__tests__\AppNavigator.routes.test.tsx`
- Modify: `C:\dev\ADHD-CADDI-V1\__tests__\CaptureBubble.test.tsx`
- Modify: `C:\dev\ADHD-CADDI-V1\src\components\capture\CaptureBubbleFab.tsx` if tests reveal animation timing assumptions
- Modify: `C:\dev\ADHD-CADDI-V1\jest.config.js` only if shared test setup is the real fix

**Step 1: Reproduce the warnings in isolation**

Run: `npm test -- --runInBand __tests__/AppNavigator.routes.test.tsx __tests__/CaptureBubble.test.tsx`
Expected: tests pass but console shows `act(...)` warnings.

**Step 2: Fix the tests before touching production code**

Likely approaches:
- wrap navigation-triggering events in `act`
- await animation flushes with `waitFor`
- replace real timers with fake timers only where the test controls the animation lifecycle

**Step 3: Re-run the isolated suites**

Run: `npm test -- --runInBand __tests__/AppNavigator.routes.test.tsx __tests__/CaptureBubble.test.tsx`
Expected: pass with no `act(...)` warnings.

**Step 4: Re-run the full suite**

Run: `npm test -- --runInBand`
Expected: full pass with the warning count materially reduced or eliminated.

**Step 5: Commit**

```bash
git add __tests__/AppNavigator.routes.test.tsx __tests__/CaptureBubble.test.tsx src/components/capture/CaptureBubbleFab.tsx jest.config.js
git commit -m "test: remove flaky act warnings from navigation and capture suites"
```

### Task 4: Do the second web bundle reduction pass

**Files:**
- Reference: `C:\dev\ADHD-CADDI-V1\webpack.config.js`
- Reference: `C:\dev\ADHD-CADDI-V1\src\navigation\AppNavigator.tsx`
- Reference: `C:\dev\ADHD-CADDI-V1\src\screens\BrainDumpScreen.tsx`
- Reference: `C:\dev\ADHD-CADDI-V1\src\components\brain-dump\IntegrationPanel.tsx`
- Reference: `C:\dev\ADHD-CADDI-V1\src\ui\cosmic\RuneButton.tsx`

**Step 1: Rebuild and capture the current baseline**

Run: `npm run build:web`
Expected: production build passes and entrypoint warning remains around the current `main` size.

**Step 2: Identify the top remaining web modules**

Run: `npx webpack --mode production --json > .tmp-webpack-stats.json`
Expected: stats file is generated locally.

**Step 3: Inspect the top app-owned modules**

Use the stats to confirm whether the biggest remaining app modules are still:
- `src/ui/cosmic/RuneButton.tsx`
- `src/components/brain-dump/IntegrationPanel.tsx`
- navigation stack code

**Step 4: Prefer lazy boundaries over micro-optimizing shared core**

Likely candidates:
- defer heavy diagnostics or brain-dump-only panels
- avoid importing optional integration UI into initial navigation shell

**Step 5: Verify impact**

Run:
- `npm run build:web`
- `npm test -- --runInBand`

Expected: build still passes and entrypoint size drops again or at least shifts weight into lazy chunks.

**Step 6: Commit**

```bash
git add webpack.config.js src/navigation/AppNavigator.tsx src/screens/BrainDumpScreen.tsx src/components/brain-dump/IntegrationPanel.tsx
git commit -m "perf: reduce initial web bundle cost"
```

### Task 5: Split the highest-risk oversized files

**Files:**
- Modify: `C:\dev\ADHD-CADDI-V1\src\ui\cosmic\RuneButton.tsx`
- Modify: `C:\dev\ADHD-CADDI-V1\src\services\ChatService.ts`
- Modify: `C:\dev\ADHD-CADDI-V1\src\screens\calendar\calendarStyles.ts`
- Modify: `C:\dev\ADHD-CADDI-V1\src\components\brain-dump\IntegrationPanel.tsx`
- Modify: `C:\dev\ADHD-CADDI-V1\src\screens\diagnostics\hooks\useBackupManager.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\scripts\quality\file-size-check.js`

**Step 1: Work from the current measured hotspots, not the old audit**

Run: `npm run quality:report`
Expected: the same seven soft-cap violations appear unless earlier tasks already changed them.

**Step 2: Split one file at a time**

Recommended order:
1. `src/components/brain-dump/IntegrationPanel.tsx`
2. `src/services/ChatService.ts`
3. `src/ui/cosmic/RuneButton.tsx`
4. `src/screens/diagnostics/hooks/useBackupManager.ts`

**Step 3: For each file, extract by responsibility**

Examples:
- `IntegrationPanel.tsx`: connection row component, alert handlers, style factory
- `ChatService.ts`: retry policy, error classification, provider-specific request functions
- `RuneButton.tsx`: state model, style helpers, press/focus accessibility logic

**Step 4: Verify after each extraction**

Run:
- targeted Jest suites for the touched area
- `npx tsc --noEmit`
- `npm run quality:report`

Expected: behavior stays the same and the file drops below the soft cap where practical.

**Step 5: Commit in small batches**

```bash
git add <touched files>
git commit -m "refactor: split <component-or-service> by responsibility"
```

### Task 6: Reconcile remaining dead-code and false-positive debt using the real import graph

**Files:**
- Reference: `C:\dev\ADHD-CADDI-V1\docs\audit-reconciliation-next-pass.md`
- Reference: `C:\dev\ADHD-CADDI-V1\src\services\OAuthService.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\src\services\OAuthService.web.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\src\navigation\AppNavigator.tsx`

**Step 1: Re-run the health tooling only after the current queue is done**

Run:
- `desloppify scan --path .` if the local install is fixed
- otherwise use the environment where it actually runs

Expected: a fresh report that reflects the merged code, not the stale pre-fix snapshot.

**Step 2: Separate scanner noise from real debt**

Categories:
- definite cleanup: unused imports, tiny dead barrels, stale comments
- needs judgment: file-size soft caps, state shape warnings
- ignore/tool bug: files proven reachable from `App.tsx` or route entrypoints

**Step 3: Document tool limitations**

If the same false positives return, append a short note to:
- `docs/audit-reconciliation-next-pass.md`

**Step 4: Commit**

```bash
git add docs/audit-reconciliation-next-pass.md
git commit -m "docs: record validated desloppify follow-up scope"
```

### Task 7: Cut a release-candidate readiness checkpoint

**Files:**
- Reference: `C:\dev\ADHD-CADDI-V1\docs\RELEASE_PROCESS.md`
- Reference: `C:\dev\ADHD-CADDI-V1\docs\TEST_MATRIX.md`
- Modify: `C:\dev\ADHD-CADDI-V1\docs\plans\2026-03-10-post-merge-readiness-plan.md`

**Step 1: Run the final readiness command bundle**

Run:
- `npm run verify`
- `npm run build:web`
- `npm run admin:check`

Expected: all pass, with only intentional warnings called out explicitly.

**Step 2: Check release docs against reality**

Read:
- `docs/RELEASE_PROCESS.md`
- `docs/TEST_MATRIX.md`

Expected: the steps still match the current scripts and workflows.

**Step 3: Add a checkpoint note**

Append:
- date
- current merge commit
- latest workflow outcome
- open blockers still preventing a release candidate

**Step 4: Commit**

```bash
git add docs/RELEASE_PROCESS.md docs/TEST_MATRIX.md docs/plans/2026-03-10-post-merge-readiness-plan.md
git commit -m "docs: capture release candidate readiness checkpoint"
```

## Session Resume Prompt

Use this exact kind of prompt next time:

`Continue from docs/plans/2026-03-10-post-merge-readiness-plan.md. First check the post-merge main workflows and current git status, then execute Task 1 and Task 2 only. Do not redo already-verified work.`

That prompt works well because it tells the next session:
- the source of truth document
- what to verify first
- which slice to execute
- not to repeat finished work


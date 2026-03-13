# Honest Firebase Friend Beta Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the smallest honest web beta candidate on Firebase Hosting by removing GitHub Pages assumptions, limiting the web surface to supported flows, and proving the built app works under static hosting and Firebase refresh/deep-link conditions.

**Architecture:** Firebase Hosting is already set to rewrite all paths to `/index.html`, so the web app should behave like a root-hosted SPA with no repository subpath and no GitHub Pages redirect shim. Keep the beta surface narrow: only expose flows that already work honestly on web, and gate or remove web-incomplete Google/Calendar behaviors instead of pretending parity with mobile.

**Tech Stack:** React Native Web, React Navigation, TypeScript, Jest, Playwright, webpack, Firebase Hosting, Sentry

---

### Task 1: Lock the shipping snapshot before changing behavior

**Files:**
- Modify: `C:\dev\ADHD-CADDI-V1\docs\plans\2026-03-13-honest-firebase-friend-beta-plan.md`
- Reference: `C:\dev\ADHD-CADDI-V1\package.json`
- Reference: `C:\dev\ADHD-CADDI-V1\src\screens\HomeScreen.tsx`
- Reference: `C:\dev\ADHD-CADDI-V1\src\screens\BrainDumpScreen.tsx`

**Step 1: Capture the current repo state**

Run:
- `git status --short`
- `git rev-parse --short HEAD`

Expected:
- commit is `ba4b009`
- local edits are visible, including current `Home` and `BrainDump` work

**Step 2: Record what friends would actually test**

Append a short note in this plan file with:
- commit hash
- whether the existing uncommitted `Home` and `BrainDump` changes are intended to ship
- whether `package.json` / `package-lock.json` changes are intended to ship

Expected:
- one plain-English sentence that describes the exact snapshot under test

Snapshot note: At commit `ba4b009`, the beta snapshot under test includes the uncommitted edits in `src/screens/HomeScreen.tsx`, `src/screens/BrainDumpScreen.tsx`, `package.json`, and `package-lock.json`, together with the new uncommitted Home and BrainDump support files now visible in `src/screens/home/*`, `src/screens/brain-dump/*`, and `__tests__/*`, and all of those changes are being treated as intended to ship for friend testing.

**Step 3: Stop/go gate**

Stop if:
- you cannot explain which current local changes are part of the beta

Go if:
- you can state the tested snapshot honestly in one sentence

**Step 4: Commit the planning note only if you changed this plan file**

```bash
git add docs/plans/2026-03-13-honest-firebase-friend-beta-plan.md
git commit -m "docs: record friend beta starting snapshot"
```

### Task 2: Remove GitHub Pages routing and hosting assumptions

**Files:**
- Modify: `C:\dev\ADHD-CADDI-V1\src\config\paths.ts`
- Modify: `C:\dev\ADHD-CADDI-V1\src\navigation\linking.ts`
- Modify: `C:\dev\ADHD-CADDI-V1\App.tsx`
- Modify: `C:\dev\ADHD-CADDI-V1\public\index.html`
- Modify: `C:\dev\ADHD-CADDI-V1\public\404.html`
- Test: `C:\dev\ADHD-CADDI-V1\__tests__\linking.test.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\firebase.json`

**Step 1: Rewrite web path constants for Firebase root hosting**

In `src/config/paths.ts`:
- remove `https://daytimeblues.github.io`
- remove `/ADHD-CADDI`
- make web prefixes root-based for Firebase hosting

Target result:
- no constant in this file references `github.io`
- no constant in this file references `/ADHD-CADDI`
- redirect URI and linking prefixes resolve from the current origin at `/`

**Step 2: Simplify linking to root-hosted SPA behavior**

In `src/navigation/linking.ts`:
- remove base-path trimming/prepending logic that exists only for GitHub Pages subpath hosting
- keep route names the same
- make `getStateFromPath` and `getPathFromState` produce `/check-in`, `/cbt-guide`, `/diagnostics`, `/tasks`, `/chat`

Expected:
- direct path parsing works from `/check-in` instead of `/ADHD-CADDI/check-in`
- navigation path building returns root-relative paths

**Step 3: Remove leftover runtime checks that only exist for subpath hosting**

In `App.tsx`:
- delete the `WEB_APP_BASE_PATH` import if it becomes unused
- simplify `syncWebUrlFromNavigation` so it compares current path to target path directly
- do not keep any conditional `replaceState` logic that depends on the old base path

Expected:
- no runtime branch refers to the old base path

**Step 4: Delete the GitHub Pages redirect shims from static HTML**

In `public/index.html`:
- remove the `spa-github-pages` recovery script
- keep the `process` polyfill

In `public/404.html`:
- replace the old redirect page with one of these honest choices:
- either a minimal static “Page not found” page
- or a tiny document that immediately loads `/index.html` without GitHub Pages query rewriting

Expected:
- no HTML file contains `spa-github-pages`
- no HTML file contains `/ADHD-CADDI`

**Step 5: Update the routing test to assert Firebase root paths**

In `__tests__/linking.test.ts`:
- replace every `'/ADHD-CADDI/...` expectation with `'/'` root-hosted equivalents
- add one assertion for the home route resolving from `/`

Expected:
- test names still describe web linking
- assertions now reflect Firebase root hosting

**Step 6: Run the explicit assumption scan**

Run:
- `Select-String -Path src\config\paths.ts,src\navigation\linking.ts,App.tsx,public\index.html,public\404.html,__tests__\linking.test.ts,e2e\bubble-features.spec.ts -Pattern 'ADHD-CADDI|github.io|GitHub Pages'`

Expected:
- no relevant result in the files you just changed

**Step 7: Commit**

```bash
git add src/config/paths.ts src/navigation/linking.ts App.tsx public/index.html public/404.html __tests__/linking.test.ts
git commit -m "fix: remove github pages routing assumptions"
```

### Task 3: Align Playwright smoke assumptions with Firebase-root web hosting

**Files:**
- Modify: `C:\dev\ADHD-CADDI-V1\e2e\bubble-features.spec.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\e2e\helpers\navigation.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\playwright.config.ts`

**Step 1: Remove the hard-coded GitHub Pages smoke detection**

In `e2e/bubble-features.spec.ts`:
- delete logic that checks for `github.io/ADHD-CADDI/`
- if a live-hosting exception is still needed, base it on an explicit env flag, not a URL substring tied to GitHub Pages

Expected:
- no Playwright spec knows about `github.io` or `/ADHD-CADDI`

**Step 2: Re-run the string scan just for E2E**

Run:
- `Select-String -Path e2e\**\*.ts -Pattern 'ADHD-CADDI|github.io|GitHub Pages'`

Expected:
- no result tied to old hosting assumptions

**Step 3: Commit**

```bash
git add e2e/bubble-features.spec.ts
git commit -m "test: remove github pages assumptions from web smoke tests"
```

### Task 4: Decide and implement the honest web beta scope

**Files:**
- Modify: `C:\dev\ADHD-CADDI-V1\src\navigation\AppNavigator.tsx`
- Modify: `C:\dev\ADHD-CADDI-V1\src\navigation\WebNavBar.tsx` only if the visible tab list needs explicit labels or ordering changes
- Modify: `C:\dev\ADHD-CADDI-V1\src\screens\HomeScreen.tsx` only if Home still routes users into unsupported web areas
- Modify: `C:\dev\ADHD-CADDI-V1\src\screens\home\useHomeModes.ts`
- Modify: `C:\dev\ADHD-CADDI-V1\src\screens\home\useHomeNavigation.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\src\screens\calendar\useCalendarConnection.ts`
- Reference: `C:\dev\ADHD-CADDI-V1\src\screens\CalendarScreen.tsx`
- Reference: `C:\dev\ADHD-CADDI-V1\src\screens\BrainDumpScreen.tsx`
- Reference: `C:\dev\ADHD-CADDI-V1\src\hooks\useBrainDumpSorting.ts`

**Step 1: Keep the beta surface to supported flows**

Beta-in scope:
- Home
- Focus
- Tasks
- Brain Dump local flow
- Check In
- Chat

Beta-out unless deliberately justified:
- Calendar web sync
- Google sign-in driven sync on web

Expected:
- the product surface matches what the app can honestly do today

**Step 2: Hide or gate Calendar from top-level web navigation**

Preferred implementation:
- on web, do not show the `Calendar` tab in `AppNavigator.tsx`
- keep the screen code available only if there is a deliberate secondary route or future rollout need

Alternative only if you keep Calendar:
- the web UI must clearly say it is limited beta / unsupported for sync
- it must not feel like a broken main feature

Expected:
- the top-level web nav no longer leads friends into an unsupported dead end

**Step 3: Check Home-mode shortcuts for unsupported routes**

In `useHomeModes.ts` and `useHomeNavigation.ts`:
- confirm Home cards only lead to supported flows for the web beta
- do not introduce a Calendar or Google sync shortcut unless it is intentionally gated

Expected:
- Home does not undermine the narrowed beta scope

**Step 4: Keep Brain Dump honest on web**

From `BrainDumpScreen.tsx` and `useBrainDumpSorting.ts`:
- keep local item capture and task creation behavior
- keep Google sync messaging explicit on web
- verify the error text remains honest: no fake promise of web sync

Expected:
- Brain Dump works locally on web even when Google sync is unavailable

**Step 5: Run a targeted manual check in dev or build output**

Verify:
- Home is reachable
- top nav shows only honest beta choices
- Brain Dump local capture still works
- no top-level route advertises unsupported Google/Calendar sync as working

**Step 6: Commit**

```bash
git add src/navigation/AppNavigator.tsx src/navigation/WebNavBar.tsx src/screens/HomeScreen.tsx src/screens/home/useHomeModes.ts src/screens/home/useHomeNavigation.ts src/screens/CalendarScreen.tsx src/screens/calendar/useCalendarConnection.ts src/hooks/useBrainDumpSorting.ts src/screens/BrainDumpScreen.tsx
git commit -m "feat: narrow web beta scope to supported flows"
```

### Task 5: Add minimum beta observability and accept intentional warnings

**Files:**
- Reference: `C:\dev\ADHD-CADDI-V1\src\config\runtimeConfig.ts`
- Modify: `C:\dev\ADHD-CADDI-V1\App.tsx` only if Sentry initialization behavior is misleading
- Reference: `C:\dev\ADHD-CADDI-V1\scripts\admin\check-config.js`
- Reference: `C:\dev\ADHD-CADDI-V1\.env.example`

**Step 1: Decide whether this beta gets crash reporting**

If yes:
- set `EXPO_PUBLIC_SENTRY_DSN` in the environment used for the beta build

If no:
- accept that production crashes will only be visible in browser console and local debugging

Expected:
- there is a deliberate choice, not an accidental omission

**Step 2: Run the config diagnostic**

Run:
- `npm run admin:config-check`

Expected:
- no errors
- warnings are limited to intentionally accepted items such as missing Google client IDs or public direct AI keys

**Step 3: Record accepted warnings in this plan file**

Add a short note listing:
- warnings seen
- whether each warning is acceptable for the friend beta

Expected:
- you can explain why the beta is still honest despite remaining warnings

**Step 4: Commit documentation only if you changed this plan file or config docs**

```bash
git add docs/plans/2026-03-13-honest-firebase-friend-beta-plan.md .env.example App.tsx
git commit -m "docs: record accepted friend beta config warnings"
```

### Task 6: Prove the static quality bar before manual testing

**Files:**
- Reference: `C:\dev\ADHD-CADDI-V1\tsconfig.json`
- Reference: `C:\dev\ADHD-CADDI-V1\jest.config.js`
- Reference: `C:\dev\ADHD-CADDI-V1\webpack.config.js`
- Reference: `C:\dev\ADHD-CADDI-V1\scripts\admin\web-health.js`

**Step 1: Run type-check**

Run:
- `npx tsc --noEmit`

Expected:
- exit code `0`

**Step 2: Run Jest serially**

Run:
- `npm test -- --runInBand`

Expected:
- exit code `0`
- routing tests pass with root-hosted expectations

**Step 3: Build the production web bundle**

Run:
- `npm run build:web`

Expected:
- `dist` is produced
- no bundle path points at `/ADHD-CADDI`

**Step 4: Run the web admin health check**

Run:
- `npm run admin:web-health`

Expected:
- `PASS: web health entrypoints are present.`

**Step 5: Stop/go gate**

Stop if:
- any of the four commands fails

Go if:
- all four commands succeed without hidden routing regressions

**Step 6: Commit only if test or build-support files needed edits**

```bash
git add __tests__/linking.test.ts e2e/bubble-features.spec.ts webpack.config.js scripts/admin/web-health.js
git commit -m "test: verify firebase-root web build quality"
```

### Task 7: Serve the production build and prove deep-link refresh behavior locally

**Files:**
- Reference: `C:\dev\ADHD-CADDI-V1\dist`

**Step 1: Serve the built static bundle**

Run:
- `npx serve -s dist -l 4173`

Expected:
- static server starts on `http://127.0.0.1:4173/`

**Step 2: Direct-load and refresh the critical routes**

Check each URL directly:
- `http://127.0.0.1:4173/`
- `http://127.0.0.1:4173/tasks`
- `http://127.0.0.1:4173/chat`
- `http://127.0.0.1:4173/check-in`
- `http://127.0.0.1:4173/diagnostics`

For each URL:
- load directly
- refresh once

Expected:
- route loads
- refresh stays on the same route
- no redirect to `/ADHD-CADDI`
- no missing JS bundle or blank page

**Step 3: Run the friend smoke flow against the built app**

Manual flow:
1. Open Home.
2. Open Focus.
3. Open Tasks.
4. Create one simple task if available.
5. Open Brain Dump.
6. Add one item.
7. Reload and confirm persistence.
8. Open Check In and complete one pass.
9. Open Chat and send one simple message.
10. Open Calendar only if you intentionally kept it in beta.

Expected:
- no crash screen
- no major console errors
- unsupported features are clearly limited, not just broken

**Step 4: Commit nothing for this task unless you found and fixed a real issue**

```bash
git add <only files fixed from the local static smoke run>
git commit -m "fix: resolve static-hosted web beta regression"
```

### Task 8: Verify Firebase Hosting matches local static behavior

**Files:**
- Reference: `C:\dev\ADHD-CADDI-V1\firebase.json`
- Reference: `C:\dev\ADHD-CADDI-V1\.firebaserc`

**Step 1: Deploy to preview or beta hosting**

Run:
- `npm run deploy:firebase`

Expected:
- deployment completes successfully against Firebase Hosting

**Step 2: Re-run the direct-load route checks on the Firebase URL**

Check:
- `/`
- `/tasks`
- `/chat`
- `/check-in`
- `/diagnostics`

Expected:
- Firebase behaves the same as the local static server
- refresh works on nested routes because Firebase rewrites to `/index.html`

**Step 3: Stop/go gate**

Stop if:
- Firebase behavior differs from the local static build

Go if:
- Firebase matches local static behavior closely enough for a small friend beta

**Step 4: Commit nothing unless deployment validation required code changes**

```bash
git add <only files changed to fix Firebase parity issues>
git commit -m "fix: align firebase hosting behavior with local static build"
```

### Task 9: Make the release story honest before sharing the link

**Files:**
- Modify: `C:\dev\ADHD-CADDI-V1\README.md`
- Modify: `C:\dev\ADHD-CADDI-V1\docs\plans\2026-03-13-honest-firebase-friend-beta-plan.md`

**Step 1: Update README to match the actual web beta**

Change the release messaging so it reflects reality:
- web is now a limited Firebase-hosted beta surface
- Android may still be the broader/native target
- unsupported web areas are explicitly named as limited or unavailable

Expected:
- README no longer says web is only a local development surface if you are about to send testers a real web URL

**Step 2: Write the friend-facing note**

Create a short note in this plan file or release notes scratch section with:
- what works
- what is intentionally limited
- where testers should send bugs

Suggested structure:
- “Please test Home, Focus, Tasks, Brain Dump, Check In, and Chat.”
- “Calendar sync and Google web sync are not part of this beta.”
- “Send bugs with the page you were on and what you clicked.”

**Step 3: Final release truth gate**

Only share the link if all are true:
- `npx tsc --noEmit` passed
- `npm test -- --runInBand` passed
- `npm run build:web` passed
- built `dist` worked under static hosting
- nested routes survived refresh
- no GitHub Pages path assumptions remain
- unsupported web features are gated or removed
- Firebase matched local static behavior
- you can name the exact deployed repo state

**Step 4: Commit**

```bash
git add README.md docs/plans/2026-03-13-honest-firebase-friend-beta-plan.md
git commit -m "docs: describe honest firebase friend beta scope"
```

## Session Resume Prompt

Use this next time:

`Continue from docs/plans/2026-03-13-honest-firebase-friend-beta-plan.md. First confirm the current git snapshot and remove GitHub Pages routing assumptions, then stop after Task 2 and report any blockers before touching beta-scope gating.`

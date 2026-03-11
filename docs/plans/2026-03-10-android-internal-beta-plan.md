# Android Internal Beta Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the Android-first internal beta by hardening Google/Firebase readiness, replacing one-off Brain Dump onboarding with a reusable tour system, promoting the Android overlay bubble into the primary persistent launcher, and documenting the tester/install path for phone-first release plus Firebase App Distribution.

**Architecture:** Keep the existing React Native app structure and native Android overlay service as the base. Expand the current tutorial store into a small flow registry, extend the overlay bridge/service with an explicit state model and action routes, and keep Google sync Android-native with diagnostics that clearly separate local app config from external Google Console/Firebase setup requirements.

**Tech Stack:** React Native 0.74, TypeScript, Zustand, Jest, Playwright, Android Java native modules/services, Firebase App Distribution, Google Sign-In / Tasks / Calendar APIs.

---

## Todo List

- [ ] Replace single Brain Dump onboarding state with a reusable tutorial flow registry.
- [ ] Add a full-screen first-run onboarding flow plus replayable feature tours for Brain Dump, Tasks/Inbox, Chat, and Fog Cutter.
- [ ] Expand Android diagnostics so beta testers can tell what is locally configured versus what still needs Google Console/Firebase setup.
- [ ] Promote the Android overlay into a persistent launcher with explicit states: disabled, enabled/collapsed, expanded menu, dismissed, blocked by permission.
- [ ] Add deep links from the overlay into Brain Dump, Inbox, Chat, Fog Cutter, and Check-In.
- [ ] Ensure onboarding explains the overlay without causing first-run interruptions or race conditions.
- [ ] Add Android internal beta documentation for phone install, overlay permission, Google sign-in, tester checklist, bug reporting, and Firebase App Distribution.
- [ ] Run targeted tests first, then `npm run verify`, `npm run build:web`, and Android release/build checks before calling the work complete.

### Task 1: Google Readiness And Beta Diagnostics

**Files:**
- Modify: `src/screens/diagnostics/hooks/useDiagnosticsData.ts`
- Modify: `src/screens/diagnostics/components/SetupInstructionsSection.tsx`
- Modify: `src/screens/diagnostics/components/DiagnosticsStatusSection.tsx`
- Modify: `src/screens/DiagnosticsScreen.tsx`
- Modify: `src/services/GoogleAuthService.ts`
- Modify: `src/screens/calendar/useCalendarConnection.ts`
- Modify: `src/screens/calendar/GoogleCalendarConnection.tsx`
- Modify: `docs/GOOGLE_SETUP_GUIDE.md`
- Create: `__tests__/GoogleAuthService.test.ts`
- Modify: `src/screens/diagnostics/hooks/__tests__/useDiagnosticsData.test.tsx`
- Modify: `src/screens/__tests__/DiagnosticsScreen.test.tsx`

**Step 1: Write the failing tests**

- Add a diagnostics test that expects separate rows for:
  - Web client ID present/missing
  - Android-only auth readiness
  - Tasks scope granted/missing
  - Calendar scope granted/missing
  - External setup checklist items that cannot be auto-verified in-app
- Add a Google auth service test that expects sign-in configuration to request Tasks + Calendar scopes and to report a clear false/empty result when the native module is unavailable.

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- --runInBand src/screens/diagnostics/hooks/__tests__/useDiagnosticsData.test.tsx src/screens/__tests__/DiagnosticsScreen.test.tsx __tests__/GoogleAuthService.test.ts
```

Expected: FAIL because the diagnostics entries and Google auth helpers do not yet expose the richer beta-readiness information.

**Step 3: Write minimal implementation**

- In `useDiagnosticsData.ts`, split diagnostics into:
  - local app config
  - current signed-in/scope state
  - external setup items that must still be confirmed manually
- Add rows such as:
  - `Google Android Beta Ready`
  - `Manual Check: Tasks API Enabled`
  - `Manual Check: Calendar API Enabled`
  - `Manual Check: SHA-1 Registered`
  - `Manual Check: SHA-256 Registered`
  - `Manual Check: OAuth Consent Scopes`
- In `GoogleAuthService.ts`, expose the configured scopes as a stable source of truth used by diagnostics and calendar-connection logic.
- In `useCalendarConnection.ts` and `GoogleCalendarConnection.tsx`, change wording from generic connected/not connected to scope-aware status so users understand whether Calendar access is fully granted.
- In `docs/GOOGLE_SETUP_GUIDE.md`, narrow the guide to the missing operational items and add Firebase App Distribution prerequisites for internal testers.

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- --runInBand src/screens/diagnostics/hooks/__tests__/useDiagnosticsData.test.tsx src/screens/__tests__/DiagnosticsScreen.test.tsx __tests__/GoogleAuthService.test.ts
```

Expected: PASS with diagnostics showing explicit beta-readiness messaging instead of generic setup hints.

**Step 5: Commit**

```bash
git add src/screens/diagnostics/hooks/useDiagnosticsData.ts src/screens/diagnostics/components/SetupInstructionsSection.tsx src/screens/diagnostics/components/DiagnosticsStatusSection.tsx src/screens/DiagnosticsScreen.tsx src/services/GoogleAuthService.ts src/screens/calendar/useCalendarConnection.ts src/screens/calendar/GoogleCalendarConnection.tsx docs/GOOGLE_SETUP_GUIDE.md __tests__/GoogleAuthService.test.ts src/screens/diagnostics/hooks/__tests__/useDiagnosticsData.test.tsx src/screens/__tests__/DiagnosticsScreen.test.tsx
git commit -m "feat: harden android google beta diagnostics"
```

### Task 2: Tutorial Flow Registry And Persistent Tutorial State

**Files:**
- Modify: `src/store/useTutorialStore.ts`
- Modify: `src/screens/brain-dump/useBrainDumpTutorial.ts`
- Modify: `docs/TUTORIAL_GUIDE.md`
- Create: `src/tutorial/flows.ts`
- Create: `src/tutorial/types.ts`
- Create: `__tests__/useTutorialStore.test.ts`

**Step 1: Write the failing tests**

- Add store tests that expect:
  - one global onboarding flow id
  - replayable feature flow ids for Brain Dump, Inbox, Chat, and Fog Cutter
  - per-flow completion metadata
  - explicit replay request metadata
  - first-run completion separate from feature-tour completion

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- --runInBand __tests__/useTutorialStore.test.ts
```

Expected: FAIL because the current store only tracks a single Brain Dump onboarding flow.

**Step 3: Write minimal implementation**

- Move static flow definitions into `src/tutorial/flows.ts`.
- Add a small typed registry in `src/tutorial/types.ts` and `useTutorialStore.ts`:
  - `global-onboarding`
  - `brain-dump-tour`
  - `inbox-tour`
  - `chat-tour`
  - `fog-cutter-tour`
- Replace `onboardingCompleted` with explicit persisted state:
  - `hasCompletedGlobalOnboarding`
  - `completedFlowIds`
  - `lastStartedFlowId`
  - `lastCompletedFlowId`
  - `requestedReplayFlowId`
- Keep transient UI state separate from persisted completion state.
- Update `useBrainDumpTutorial.ts` to consume the registry instead of a screen-local hard-coded flow object.
- Update `docs/TUTORIAL_GUIDE.md` to describe the new registry and replay behavior.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- --runInBand __tests__/useTutorialStore.test.ts
```

Expected: PASS with persisted state supporting multiple tours and explicit replay.

**Step 5: Commit**

```bash
git add src/store/useTutorialStore.ts src/screens/brain-dump/useBrainDumpTutorial.ts docs/TUTORIAL_GUIDE.md src/tutorial/flows.ts src/tutorial/types.ts __tests__/useTutorialStore.test.ts
git commit -m "feat: add tutorial flow registry"
```

### Task 3: Full-Screen First-Run Onboarding And Replay Entry Points

**Files:**
- Modify: `App.tsx`
- Modify: `src/screens/BrainDumpScreen.tsx`
- Modify: `src/screens/ChatScreen.tsx`
- Modify: `src/screens/FogCutterScreen.tsx`
- Modify: `src/screens/InboxScreen.tsx`
- Modify: `src/screens/DiagnosticsScreen.tsx`
- Modify: `src/components/tutorial/TutorialBubble.tsx`
- Create: `src/components/tutorial/GlobalOnboardingModal.tsx`
- Create: `src/components/tutorial/FeatureTourButton.tsx`
- Create: `src/hooks/useTutorialController.ts`
- Create: `__tests__/GlobalOnboardingModal.test.tsx`
- Modify: `e2e/tutorial-bubble-smoke.spec.ts`

**Step 1: Write the failing tests**

- Add a component test for the first-run onboarding modal that expects it to render once on first launch and not auto-open after completion.
- Extend the existing tutorial smoke test to expect:
  - first-run global onboarding
  - replay from a settings/help entry point
  - replay from local `TOUR` buttons inside feature screens

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- --runInBand __tests__/GlobalOnboardingModal.test.tsx
npx playwright test e2e/tutorial-bubble-smoke.spec.ts --project=chromium
```

Expected: FAIL because only the Brain Dump overlay tutorial currently exists.

**Step 3: Write minimal implementation**

- Create `GlobalOnboardingModal.tsx` as a full-screen animated onboarding entry flow that introduces:
  - app purpose
  - Brain Dump capture
  - Inbox/Tasks triage
  - Chat support
  - Fog Cutter breakdown
  - Android overlay bubble
- Create `useTutorialController.ts` to centralize when to auto-start the global flow and when feature tours may replay.
- Render the global onboarding host from `App.tsx` so it is app-wide, not screen-scoped.
- Keep `TutorialBubble.tsx` for local feature tours, but make it registry-driven rather than Brain Dump-specific.
- Add replay entry points:
  - settings/help entry point in `DiagnosticsScreen.tsx` for global replay
  - local `TOUR` buttons in `BrainDumpScreen.tsx`, `InboxScreen.tsx`, `ChatScreen.tsx`, and `FogCutterScreen.tsx`

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- --runInBand __tests__/GlobalOnboardingModal.test.tsx
npx playwright test e2e/tutorial-bubble-smoke.spec.ts --project=chromium
```

Expected: PASS with a single first-run global tour and replayable local tours.

**Step 5: Commit**

```bash
git add App.tsx src/screens/BrainDumpScreen.tsx src/screens/ChatScreen.tsx src/screens/FogCutterScreen.tsx src/screens/InboxScreen.tsx src/screens/DiagnosticsScreen.tsx src/components/tutorial/TutorialBubble.tsx src/components/tutorial/GlobalOnboardingModal.tsx src/components/tutorial/FeatureTourButton.tsx src/hooks/useTutorialController.ts __tests__/GlobalOnboardingModal.test.tsx e2e/tutorial-bubble-smoke.spec.ts
git commit -m "feat: add global onboarding and feature tour replay"
```

### Task 4: Android Overlay State Model, Persistence, And Route Launching

**Files:**
- Modify: `src/services/OverlayService.ts`
- Modify: `src/hooks/useOverlayEvents.ts`
- Modify: `src/navigation/navigationRef.ts`
- Modify: `src/screens/home/HomeOverlayCard.tsx`
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `android/app/src/main/java/com/adhdcaddi/OverlayModule.java`
- Modify: `android/app/src/main/java/com/adhdcaddi/OverlayService.java`
- Modify: `android/app/src/main/java/com/adhdcaddi/MainActivity.java`
- Modify: `__tests__/OverlayService.test.ts`
- Create: `__tests__/useOverlayEvents.test.tsx`

**Step 1: Write the failing tests**

- Add a hook/service test that expects overlay state values:
  - `disabled`
  - `enabled_collapsed`
  - `expanded_menu`
  - `dismissed`
  - `permission_blocked`
- Extend overlay service tests to expect route aliases for:
  - Brain Dump
  - Inbox
  - Chat
  - Fog Cutter
  - Check-In
- Add tests for dismiss/recover behavior so stopping the service and dismissing the bubble are not treated as the same user action.

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- --runInBand __tests__/OverlayService.test.ts __tests__/useOverlayEvents.test.tsx
```

Expected: FAIL because the current overlay bridge only exposes a partial running/expanded model and the native menu does not include Inbox or Chat.

**Step 3: Write minimal implementation**

- In JS, add a typed overlay state model instead of plain booleans.
- In `OverlayModule.java`, expose native helpers/events for dismiss/recover state and current expansion state.
- In `OverlayService.java`:
  - keep the bubble alive in foreground or background until explicit dismiss
  - add a clear `X` dismiss affordance
  - keep a recoverable dismissed state persisted in `SharedPreferences`
  - expand menu actions to launch `BrainDump`, `Inbox`, `Chat`, `FogCutter`, and `CheckIn`
- In `navigationRef.ts`, add aliases and allowed overlay routes for `Inbox` and `Chat`.
- Update `HomeOverlayCard.tsx` and `HomeScreen.tsx` so the app can:
  - request permission
  - enable/disable overlay
  - recover a dismissed bubble without conflating it with full disable

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- --runInBand __tests__/OverlayService.test.ts __tests__/useOverlayEvents.test.tsx
```

Expected: PASS with stable overlay states and deep links matching the beta requirement.

**Step 5: Commit**

```bash
git add src/services/OverlayService.ts src/hooks/useOverlayEvents.ts src/navigation/navigationRef.ts src/screens/home/HomeOverlayCard.tsx src/screens/HomeScreen.tsx android/app/src/main/java/com/adhdcaddi/OverlayModule.java android/app/src/main/java/com/adhdcaddi/OverlayService.java android/app/src/main/java/com/adhdcaddi/MainActivity.java __tests__/OverlayService.test.ts __tests__/useOverlayEvents.test.tsx
git commit -m "feat: promote android overlay bubble to persistent launcher"
```

### Task 5: Onboarding And Overlay Coordination

**Files:**
- Modify: `App.tsx`
- Modify: `src/hooks/useOverlayEvents.ts`
- Modify: `src/hooks/useTutorialController.ts`
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/screens/BrainDumpScreen.tsx`
- Modify: `src/components/tutorial/GlobalOnboardingModal.tsx`
- Create: `__tests__/App.onboarding-overlay.test.tsx`

**Step 1: Write the failing test**

- Add an app-level test that expects onboarding to explain overlay availability without auto-opening or interrupting the first-run flow before the user reaches the relevant step.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- --runInBand __tests__/App.onboarding-overlay.test.tsx
```

Expected: FAIL because onboarding and overlay enablement are currently independent.

**Step 3: Write minimal implementation**

- Gate overlay prompts during the first-run tour.
- Explain the overlay in the onboarding flow before prompting for permission from Home.
- Ensure returning from overlay permission settings does not auto-dismiss or restart the onboarding flow.
- Keep Brain Dump `autoRecord` handling intact when launched from the overlay.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- --runInBand __tests__/App.onboarding-overlay.test.tsx
```

Expected: PASS with deterministic first-run behavior.

**Step 5: Commit**

```bash
git add App.tsx src/hooks/useOverlayEvents.ts src/hooks/useTutorialController.ts src/screens/HomeScreen.tsx src/screens/BrainDumpScreen.tsx src/components/tutorial/GlobalOnboardingModal.tsx __tests__/App.onboarding-overlay.test.tsx
git commit -m "fix: coordinate onboarding and overlay behavior"
```

### Task 6: Android Beta Distribution And Tester Documentation

**Files:**
- Modify: `docs/GOOGLE_SETUP_GUIDE.md`
- Modify: `docs/OVERLAY_PERMISSION_VALIDATION.md`
- Modify: `docs/OVERLAY_SERVICE_STABILITY.md`
- Create: `docs/ANDROID_INTERNAL_BETA.md`
- Create: `docs/FIREBASE_APP_DISTRIBUTION.md`

**Step 1: Write the failing doc checklist**

- Create a checklist section that is incomplete until it covers:
  - release APK install on your own phone
  - Firebase App Distribution upload for family/friends
  - tester install steps
  - overlay permission steps
  - Google sign-in steps
  - features to try first
  - how to report bugs

**Step 2: Review docs to verify the gaps exist**

Run:

```bash
Get-Content docs/GOOGLE_SETUP_GUIDE.md
Get-Content docs/OVERLAY_PERMISSION_VALIDATION.md
Get-Content docs/OVERLAY_SERVICE_STABILITY.md
```

Expected: Existing docs cover setup and overlay validation, but not the end-to-end internal beta tester path or Firebase App Distribution workflow.

**Step 3: Write minimal documentation**

- Add `docs/ANDROID_INTERNAL_BETA.md` as the tester-facing guide.
- Add `docs/FIREBASE_APP_DISTRIBUTION.md` for maintainer upload/invite steps.
- Update `docs/GOOGLE_SETUP_GUIDE.md` to call out the exact remaining Google Console inputs.
- Update overlay docs where wording still assumes pure validation rather than beta rollout readiness.

**Step 4: Verify docs read cleanly**

Run:

```bash
Get-Content docs/ANDROID_INTERNAL_BETA.md
Get-Content docs/FIREBASE_APP_DISTRIBUTION.md
```

Expected: The docs give a phone-first install path and a simple tester flow without mentioning Play Store release work.

**Step 5: Commit**

```bash
git add docs/GOOGLE_SETUP_GUIDE.md docs/OVERLAY_PERMISSION_VALIDATION.md docs/OVERLAY_SERVICE_STABILITY.md docs/ANDROID_INTERNAL_BETA.md docs/FIREBASE_APP_DISTRIBUTION.md
git commit -m "docs: add android internal beta rollout guides"
```

### Task 7: Regression, Warning Cleanup, And Final Verification

**Files:**
- Modify: `e2e/tutorial-bubble-smoke.spec.ts`
- Modify: `__tests__/OverlayService.test.ts`
- Modify: `src/screens/__tests__/DiagnosticsScreen.test.tsx`
- Modify: any test helpers or affected test files needed to remove recurring `act(...)` warnings discovered during the run

**Step 1: Reproduce the current warning/test issues**

Run:

```bash
npm test -- --runInBand
```

Expected: Existing warnings, especially navigation/capture `act(...)` warnings, are visible and reproducible before cleanup.

**Step 2: Write minimal fixes**

- Wrap async state transitions in the affected tests with proper `act`, `waitFor`, or explicit timer flushing.
- Keep the production behavior unchanged; only fix tests or test harnesses unless a real lifecycle bug is found.

**Step 3: Run focused regression commands**

Run:

```bash
npm test -- --runInBand __tests__/OverlayService.test.ts src/screens/__tests__/DiagnosticsScreen.test.tsx
npx playwright test e2e/tutorial-bubble-smoke.spec.ts --project=chromium
```

Expected: PASS with reduced warning noise.

**Step 4: Run full verification**

Run:

```bash
npm run verify
npm run build:web
npm run build:android:prod
```

Expected:
- `npm run verify`: PASS
- `npm run build:web`: PASS
- `npm run build:android:prod`: PASS or yields a concrete Android signing/config blocker that must be documented before inviting testers

**Step 5: Commit**

```bash
git add e2e/tutorial-bubble-smoke.spec.ts __tests__/OverlayService.test.ts src/screens/__tests__/DiagnosticsScreen.test.tsx
git commit -m "test: stabilize android beta regression coverage"
```

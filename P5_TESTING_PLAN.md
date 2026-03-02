# Persona 5 UI — Testing & Refactoring Plan

This document outlines the testing strategy for the `new-ui-v2` branch of Spark ADHD. The goal is to ensure the new Persona 5 ("Phantom Thief") aesthetic is fully functional, performant, and doesn't break existing app logic.

The LLM implementing the UI must also execute these testing steps.

---

## 1. Testing Strategy Overview

React Native UI overhauls require a multi-layered testing approach:

1. **Static Analysis & Types**: Ensuring TypeScript constraints are perfectly matched (e.g., `PhantomTokens` === `CosmicTokens`).
2. **Component Rendering (Unit Testing)**: Testing individual jagged cards and primitives.
3. **Visual Regression (Snapshot Testing)**: Freezing the new P5 UI state.
4. **E2E Smoke Tests**: Clicking through the app flow systematically.

---

## 2. Refactoring Standards

During the UI overhaul, adhere to these refactoring rules carefully:

- **No Logic Changes**: Do not modify state, reducers (`useThemeStore`), or API calls unless absolutely required for the UI to render.
- **Hook Additions**: You may add `const { isPhantom } = useTheme();` to any screen.
- **Component Extraction**: If a P5 screen gets too large (>800 lines), extract the P5-specific layout into a separate file (e.g., `src/screens/phantom/P5HomeScreenLayout.tsx`).

---

## 3. Unit & Component Testing (Jest + React Native Testing Library)

### 3.1. Theme Provider Tests

Ensure the theme toggle logic perfectly handles the new variant.

- **Test**: When `setVariant('phantom')` is called, `isPhantom` becomes `true` and the active tokens (`t`) equal `PhantomTokens`.
- **Command**: `npm run test -- ThemeProvider.test.tsx`

### 3.2. P5 Primitives Testing

Create a test suite for `src/ui/phantom/`.

- **Test `JaggedCard.tsx`**: Renders children correctly. Does not crash when passed extreme `rotate` or `skewX` values.
- **Test `StarburstTimer.tsx`**: Renders the exact custom fonts and handles dynamic time strings correctly.
- **Test `CallingCard.tsx`**: the entrance and exit animations fire correctly.

---

## 4. Visual Snapshot Testing

Since this is a drastic visual change, snapshot capture is vital.
The target LLM must either create or update snapshot tests for the 3 main variants of the app (`linear`, `cosmic`, `phantom`).

- **Script addition**: Add a script to run snapshots specifically for Phantom UI.
- **Test Coverage**: `HomeScreen`, `BrainDumpScreen`, `PomodoroScreen`.

---

## 5. End-to-End (E2E) Smoke Testing Plan

To confirm the new Phantom UI is totally functional, we need to run an automated or manual smoke test clicking through the primary user journeys. If the repo doesn't already have Detox or Maestro set up, we will define a rigorous **Manual QA Script** combined with standard build tests.

### 5.1 Automated Build Smoke Test

Before committing, the LLM MUST ensure the app can compile for both iOS and Android.

- `npx tsc --noEmit` (Must be 0 errors)
- `cd android && ./gradlew assembleDebug`
- *(If on Mac)* `cd ios && xcodebuild -workspace spark.xcworkspace -scheme spark -sdk iphonesimulator`

### 5.2 The "Phantom" Smoke Test Matrix (User Journey)

The LLM / QA must verify these exact flows in the emulator with the Phantom theme activated:

**Flow 1: Theme Switch & Dashboard**

1. Open App. Navigate to Settings/Diagnostics.
2. Toggle Theme to `Phantom`.
3. Verify: Background turns pure black with halftone pattern.
4. Verify: Navigation bar switches to angled `PhantomNavBar`.
5. Verify: `HomeScreen` renders `JaggedCard` tiles and large impact fonts.

**Flow 2: Brain Dump Chaos**

1. Tap Brain Dump tab.
2. Verify: Screen looks like a scattered ransom note collage.
3. Type "Test Mission 1" and tap the red starburst SEND button.
4. Verify: Mission is added to the screen using the custom red stamp category badge.

**Flow 3: Action & Timer (Focus Battle)**

1. Navigate to Fog Cutter.
2. Verify: High-contrast red/black scheme blocks out distractions.
3. Start the timer for a task.
4. Verify: Automatically navigates to Pomodoro screen.
5. Verify: Timer digits are massive `Impact` font and pulsing.
6. Verify: Pressing the white "ABANDON" button correctly pauses the timer.

**Flow 4: Notifications (Calling Cards)**

1. Trigger a local notification (or wait for task completion).
2. Verify: The `CallingCard` slams down from the top edge with overshoot animation.

---

## 6. Execution Command for LLMs

When the implementation LLM reaches `Phase E: Polish & Device Testing`, provide this prompt to it:

```text
Phase E: Testing & QA. Code implementation is done. Please run the following verifications:

1. Run `npx tsc --noEmit` and fix any lingering Type errors across all 12 screens.
2. Write a Jest test file for `src/ui/phantom/JaggedCard.tsx` and run it to ensure the P5 primitives render correctly without crashing.
3. Review the `spark-adhd` build scripts in `package.json`. If no E2E framework exists, outline the exact manual test script from `P5_TESTING_PLAN.md` you would execute if you had emulator access.
4. Confirm no imports for `cosmic` tokens bled into the `phantom` layouts.
```

# The 5-Phase Master Gameplan

Instead of 100 individual prompts, your audit boils down to five distinct architectural phases.

## Phase 1: Critical Accessibility & UI Safety (High UX Risk)

- [ ] **Touch Targets:** Wrap all interactive elements (like the back buttons in `DiagnosticsScreen` and close buttons in `InboxScreen`) to meet the 44px minimum required by Fitts' Law.
- [ ] **Contrast Ratios:** Update `ModeCard` text colors to pass WCAG AA 4.5:1 minimums (e.g., boosting alpha from 0.65 to 0.80).
- [ ] **Screen Readers:** Add `accessibilityLabel` and `accessibilityRole` to the 10 screens that are currently missing them (like `BrainDumpScreen` and `PomodoroScreen`).

## Phase 2: Deconstructing the Monoliths (High Architecture Risk)

- [ ] **Break up `DiagnosticsScreen`:** This 965-line monolith needs to be split. Extract the backup/restore logic, theme switching, and setup instructions into separate custom hooks or components.
- [ ] **Fix Broken Imports:** Correct the critical error where `GoogleTasksSyncService` is being imported from the unrelated `PlaudService` file.
- [ ] **Consolidate Fetching:** Remove the duplicated data fetching logic in `InboxScreen.tsx`.

## Phase 3: Standardizing State & Error Handling (High Reliability Risk)

- [ ] **Global Logger:** Replace the 18 instances of bare `console.error` scattered across your files with your structured `LoggerService.error()`.
- [ ] **Fix Silent Failures:** Update `StorageService.set()` and `remove()` so they actually return standard error contexts instead of silently swallowing errors on the web path.
- [ ] **Offline Resilience:** Add a retry mechanism and offline queuing to `GoogleTasksSyncService` so it doesn't fail silently if the user has no signal.

## Phase 4: Cleaning AI-Generated Debt (Medium Maintenance Risk)

- [ ] **Eradicate Magic Numbers:** Remove hardcoded hex colors (e.g., `#1a1a2e`, `#ff6b6b`) in `ErrorBoundary.tsx` and replace them with `Tokens.colors`.
- [ ] **Extract Layout Numbers:** Move hardcoded padding values (like `paddingBottom: 120` in `BrainDumpScreen`) into named constants.
- [ ] **Clean Up CI/CD:** Add a `.github/workflows` file to actually run tests and enforce your 60% coverage threshold automatically.

## Phase 5: Platform Abstraction (Medium Maintenance Risk)

- [ ] **Consolidate OS Checks:** Refactor the 50+ inline `Platform.OS` checks scattered across your codebase.
- [ ] **Standardize Helpers:** Move these checks into a centralized `PlatformUtils.ts` file or use `.web.ts` / `.native.ts` file extensions for services that diverge heavily.

# Comprehensive Codebase Review: Spark ADHD

_Verified against source: 2026-02-27_

---

## Overall Health Scorecard

| Area                        | Score | Status                                                                         |
| --------------------------- | :---: | ------------------------------------------------------------------------------ |
| **Test Suite (pass rate)**  | 10/10 | ✅ 234/234 pass, 40 suites                                                     |
| **Test Coverage (breadth)** | 4/10  | ⚠️ 6 of 12 screens and 7+ services untested                                    |
| **Architecture / SRP**      | 5/10  | ⚠️ Side-effects in stores, oversized components                                |
| **Error Handling**          | 3/10  | 🔴 18 files with bare `console.error`, no centralized logging                  |
| **Platform Abstraction**    | 3/10  | 🔴 50+ inline `Platform.OS` checks, inconsistent `.web.ts` pattern             |
| **Repo Hygiene**            | 4/10  | ⚠️ 21MB binary docs tracked, stale log files, debug scripts committed          |
| **Documentation**           | 6/10  | ⚠️ Key docs exist but planning folder has stale specs                          |
| **CI / Tooling**            | 5/10  | ⚠️ ESLint minimal (3 rules), no global coverage threshold, no CI config        |
| **Build & Dev Environment** | 4/10  | ⚠️ Webpack `process` polyfill dual-source, CDN dependency, Windows instability |

---

## 1. Test Suite Analysis

### Current State: All Tests Pass ✅

- **234 tests** across **40 suites**, all passing.
- Jest warns: _"Have you considered using `--detectOpenHandles` to detect async operations that kept running after all tests finished?"_ — this means timers, intervals, or promises aren't being cleaned up in tests (likely from `TimerService.start()` or `GoogleTasksSyncService` polling).

### Untested Services (7)

| Service                         | Size  | Risk                                                  |
| ------------------------------- | ----- | ----------------------------------------------------- |
| `AgentEventBus.ts`              | 2KB   | Low                                                   |
| `CheckInInsightService.ts`      | 4KB   | Medium                                                |
| `FogCutterAIService.ts`         | 2.5KB | Medium                                                |
| `SoundService.web.ts`           | 456B  | Low                                                   |
| `GoogleTasksSyncService.web.ts` | 1.6KB | Medium                                                |
| `TranscriptionService.ts`       | 3.3KB | High                                                  |
| `DriftService.ts`               | 1.5KB | Low (has partial coverage via `DriftService.test.ts`) |

### Untested Screens (6 of 12)

| Screen                | Size | Risk   |
| --------------------- | ---- | ------ |
| `AnchorScreen.tsx`    | 14KB | Medium |
| `BrainDumpScreen.tsx` | 26KB | High   |
| `ChatScreen.tsx`      | 6KB  | Medium |
| `IgniteScreen.tsx`    | 18KB | High   |
| `InboxScreen.tsx`     | 21KB | High   |
| `PomodoroScreen.tsx`  | 13KB | Medium |

### Open Handles Fix

**Root cause:** `TimerService.start()` and `CheckInService.start()` launch intervals in `App.tsx` bootstrap that aren't stopped during tests.
**Fix:** Add cleanup to `__tests__/setup.ts`:

```typescript
afterEach(() => {
  jest.clearAllTimers();
});
afterAll(() => {
  jest.useRealTimers();
});
```

And ensure services that start intervals expose a `stop()` method called in test teardown.

### Coverage Threshold Gaps

Currently only 3 files have coverage thresholds (`helpers.ts`, `StorageService.ts`, `useTimer.ts` at 90%).
**To reach 10/10:** Add a global threshold of 70% and per-file thresholds for all services and hooks.

---

## 2. Architecture & State Management (5/10)

### Issues

- `useTimerStore.ts` calls `NotificationService` directly inside 5 actions (`start`, `pause`, `resume`, `reset`, `tick`, `completePhase`).
- `useTimer.ts` bypasses store actions via `useTimerStore.setState()` in 3 places.
- Empty `useEffect(() => {}, [])` at line 56 of `useTimer.ts`.
- `GoogleTasksSyncService.ts` is 24KB/~850 lines — a monolith service.

### To Reach 10/10

1. Extract notification side-effects from `useTimerStore` into `TimerService.ts` (which already exists but only manages the tick interval).
2. Remove all direct `useTimerStore.setState()` calls from hooks — add proper store actions instead.
3. Delete the empty useEffect in `useTimer.ts`.
4. Split `GoogleTasksSyncService.ts` into `GoogleAuthService`, `GoogleTasksApiService`, and `GoogleTasksSyncService` (orchestrator).

---

## 3. Error Handling (3/10)

### Issue

18 files use bare `console.error`. Sentry is gated behind `config.environment === 'production'` and only catches unhandled exceptions. No structured logging. No error context (service name, operation, user state).

### Files with `console.error`

`AgentEventBus`, `bootstrap.ts`, `BrainDumpScreen`, `ErrorBoundary`, `CaptureDrawer`, `useChat`, `ChatService`, `useNotifications`, `FogCutterScreen`, `HomeScreen`, `IgniteScreen`, `InboxScreen`, `GoogleTasksSyncService`, `RecordingService`, `SoundService`, `StorageService`, `TranscriptionService`, `App.tsx`

### To Reach 10/10

1. Create `LoggerService` with methods: `.info()`, `.warn()`, `.error()`, `.fatal()`.
2. Each method accepts `{ service, operation, error, context }`.
3. In dev: pretty-print to console. In prod: dispatch to Sentry with tags.
4. Replace all 18 `console.error` sites with `LoggerService.error()`.

---

## 4. Platform Abstraction (3/10)

### Issue

50+ `Platform.OS` checks across the codebase. Worst offenders:

- `OverlayService.ts`: 10 `Platform.OS !== 'android'` guards
- `HapticsService.ts`: 6 `Platform.OS === 'web'` no-ops
- `StorageService.ts`: 4 `Platform.OS === 'web' || isJestRuntime` guards
- `GoogleTasksSyncService.ts`: 6 platform guards

Only `GoogleTasksSyncService` and `SoundService` use the `.web.ts` file variant pattern. Everything else uses inline branching.

### To Reach 10/10

1. Standardize on `.web.ts` / `.native.ts` file variants for services with significant platform divergence (`HapticsService`, `OverlayService`, `StorageService`).
2. Create a `PlatformUtils` module for shared platform-conditional helpers (e.g., `isWeb()`, `isAndroid()`).
3. For UI components, create a `PlatformInteractive` wrapper to consolidate gesture/touchable branching.

---

## 5. Repo Hygiene (4/10)

### Git-Tracked Files to Remove

| File                  | Size   | Action                                                     |
| --------------------- | ------ | ---------------------------------------------------------- |
| `jest_full_log.txt`   | 312KB  | `git rm` — add to `.gitignore`                             |
| `dump_console.cjs`    | 2.4KB  | `git rm` — debug utility, not app code                     |
| `test_run_output.txt` | ~300KB | `git rm` (if tracked) — add `*_output.txt` to `.gitignore` |
| `pw_log.txt`          | 7.8KB  | Already gitignored by pattern — verify not tracked         |
| `pw_log_utf8.txt`     | 4.9KB  | Already gitignored by pattern — verify not tracked         |

### Binary Files in `docs/` (~21MB tracked in git)

| File                                         | Size  | Action                                           |
| -------------------------------------------- | ----- | ------------------------------------------------ |
| `ADHD Study Framework Development_.docx`     | 6.3MB | Move to external storage (Google Drive / Notion) |
| `Building ADHD App with CADDI Protocol.docx` | 6.2MB | Move to external storage                         |
| `ADHD_Adults_1.pdf`                          | 988KB | Move to external storage                         |
| `cbtadhd.pdf`                                | 2MB   | Move to external storage                         |
| `fpsyt-16-1564506.pdf`                       | 2MB   | Move to external storage                         |
| `1303)The Adult ADHD Tool Kit...md`          | 862KB | Move to external storage                         |

These inflate clone size and have no code dependency. Add `docs/*.pdf`, `docs/*.docx` to `.gitignore` after removal.

### Stale Planning Docs in `docs/planning/`

| File                                   | Action                                      |
| -------------------------------------- | ------------------------------------------- |
| `COSMIC_IMPLEMENTATION_PLAN.md` (26KB) | Review — likely stale from theme transition |
| `FIGMA_MCP_SETUP.md` (1.2KB)           | Review — may be obsolete                    |
| `CONSOLIDATION_PLAN.md` (1.7KB)        | Review — purpose unclear                    |
| `comic-ui-home.png` (3.9KB)            | Remove — leftover asset                     |

### `.gitignore` Additions Needed

```gitignore
# Debug / output artifacts
dump_console.cjs
jest_full_log.txt
*_output.txt

# Research / binary docs (store externally)
docs/*.pdf
docs/*.docx
```

---

## 6. Documentation (6/10)

### Retained Key Docs (Good)

- `PRD.md` — Product requirements
- `TECH_SPEC.md` — Technical specification
- `DESIGN_RULES.md` — UI/UX constraints
- `SECURITY_CHECKLIST.md` — Security controls
- `RELEASE_PROCESS.md` — Release workflow
- `GOOGLE_SETUP_GUIDE.md` — Auth configuration

### Issues

- Two `PRD.md` files exist: `docs/PRD.md` (4.4KB) and `docs/planning/PRD.md` (6.6KB) — which is canonical?
- Two `AGENTS.md` files: `src/AGENTS.md` (1.5KB) and `__tests__/AGENTS.md` (865B) — unclear purpose.
- `VIBE_CODING.md` (4.4KB) — non-technical philosophy doc, consider moving out of docs.
- `UI_UX_WORKFLOW.md` has potential overlap with `DESIGN_RULES.md`.

### To Reach 10/10

1. Resolve duplicate `PRD.md` — keep one canonical version at `docs/PRD.md`.
2. Resolve or remove duplicate `AGENTS.md` files.
3. Add a `docs/README.md` index that explains what each doc covers.
4. Move research materials (PDFs, docx) to external storage.

---

## 7. CI / Tooling (5/10)

### ESLint Config

Only 3 rules configured beyond the `@react-native` preset:

- `@typescript-eslint/no-unused-vars: error`
- `@typescript-eslint/no-explicit-any: warn`
- `prettier/prettier: error`

Missing: `no-console` rule, `react-hooks/exhaustive-deps`, strict TypeScript checks.

### Jest Config

- Coverage thresholds exist for only 3 files.
- No global coverage floor.
- `testEnvironment: 'node'` — potentially inaccurate for React Native renderer tests.
- `testPathIgnorePatterns` has a malformed entry: `'/android.e2e.test.ts/'` — this is a literal string match, not a pattern, so it may not work as intended.

### No CI Configuration

No `.github/workflows/` CI files found. No automated test or lint runs on push/PR.

### To Reach 10/10

1. Add `no-console: warn` ESLint rule (encourages `LoggerService` adoption).
2. Add `react-hooks/exhaustive-deps: warn`.
3. Add global coverage threshold: `{ branches: 60, functions: 60, lines: 60, statements: 60 }`.
4. Fix `testPathIgnorePatterns` entry for Android E2E.
5. Add a GitHub Actions workflow for lint + test on push.

---

## 8. Build & Dev Environment (4/10)

### Issues

1. **Dual `process` polyfill** — `public/index.html` hardcodes `NODE_ENV: 'development'` while `webpack.config.js` `DefinePlugin` sets it dynamically. They can conflict.
2. **CDN dependency** — `@webmcp/polyfill` loaded from `unpkg.com` at runtime. App initialization depends on CDN availability.
3. **Windows Webpack crashes** — `Exit Code: -1073741510` crashes persist, blocking local web E2E testing.
4. **E2E globals leak** — `__SPARK_E2E_TIMER_CONTROLS__` and `__SPARK_E2E_TEST_MODE__` on `globalThis` aren't gated behind `__DEV__`.

### To Reach 10/10

1. Remove the `index.html` `process` polyfill. Use `webpack.ProvidePlugin` with `process/browser` package instead.
2. Bundle `@webmcp/polyfill` locally via npm install.
3. Gate E2E globals behind `if (__DEV__)`.
4. Investigate the Windows crash — likely a memory or file-watch limit. Try `CHOKIDAR_USEPOLLING=true` or increase `--max-old-space-size`.

---

## Quick Wins Executed (Completed)

During this review, the following quick wins were executed to immediately improve the codebase. The test suite was re-run and confirmed 100% green (234/234 passing) after these modifications.

| #   | Action Completed                                                                                             | Area         |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------ |
| 1   | `git rm` stale tracked files (`jest_full_log.txt`, `dump_console.cjs`) + deduplicated & updated `.gitignore` | Repo Hygiene |
| 2   | Deleted the dead/empty `useEffect` in `useTimer.ts` L56-60                                                   | Architecture |
| 3   | Added `afterEach(jest.clearAllTimers)` to `setup.ts` (Fixed Jest open handles warning)                       | Tests        |
| 4   | Fixed `testPathIgnorePatterns` malformed regex entry for Android E2E in `jest.config.js`                     | Tooling      |
| 5   | **Action Required:** Move binary docs (`*.pdf`, `*.docx`) to Google Drive or Notion                          | Repo Hygiene |
| 6   | Gated E2E globals inside `useTimer.ts` behind `__DEV__` guard to prevent release leakage                     | Build        |
| 7   | Added global coverage threshold (60%) to `jest.config.js`                                                    | Tooling      |
| 8   | Added `no-console` and `react-hooks/exhaustive-deps` ESLint rules to `.eslintrc.js`                          | Tooling      |

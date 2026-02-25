# SPARK ADHD: UX Implementation & E2E Rollout Plan (UX50)

## 1. Categorized Summary of UX Cards (50 Concepts)

The 50 UX concepts from `50 UX.txt` are categorized into five strategic pillars for the `spark-adhd` implementation:

### I. Systematization & Constraints (Cards 1-10)
*   **Core Principle:** Define the "rules of the universe" (tokens, scales, grids) before building components.
*   **Key Tactics:** Feature-first design, constrained spacing/type scales, HSL color variables, systematic shadows (Z-axis), and standard nomenclature.

### II. Visual Hierarchy & Clarity (Cards 11-20)
*   **Core Principle:** Manage contrast and weight to guide attention, rather than just increasing size.
*   **Key Tactics:** De-emphasis of secondary elements, removing redundant labels, semantic-independent styling (e.g., not all deletes are red), and baseline alignment for mixed text sizes.

### III. Psychology & User Interaction (Cards 21-30)
*   **Core Principle:** Apply "Laws of UX" (Jakob’s, Fitts’, Hick’s, Miller’s, Postel’s, Peak-End, Doherty, Tesler’s, Zeigarnik) to reduce cognitive load.
*   **Key Tactics:** 44x44px touch targets, info chunking, optimistic UI updates, skeleton screens, and progress visualization.

### IV. Code Cleanliness & Structure (Cards 31-40)
*   **Core Principle:** Output maintainable, "clean" code that future agents and developers can easily parse.
*   **Key Tactics:** Step-down rule for functions, intention-revealing names, avoiding magic numbers, SRP (Single Responsibility Principle), and Dependency Injection.

### V. Advanced UI Tactics (Cards 41-50)
*   **Core Principle:** Use sophisticated visual treatments to add depth and "flare" without bloating the app.
*   **Key Tactics:** Multi-layer glows, overlapping elements for depth, custom bullets (SVGs), brand accent borders, and intentional empty states.

---

## 2. Card-to-Codebase Mapping

Concrete mapping of UX card groups to existing modules in `spark-adhd`:

| Card Group | Target Module/Component | Current Status | Action Required |
| :--- | :--- | :--- | :--- |
| **I. Systematization** | `src/theme/tokens.ts`, `src/theme/cosmicTokens.ts` | Partially Complete | Audit all components to ensure they ONLY use tokens. No hardcoded hex/px. |
| **II. Visual Hierarchy** | `src/ui/cosmic/GlowCard.tsx`, `src/components/metro/*` | Partially Complete | Update secondary text in `GlowCard` to use `mist` color instead of just smaller size. |
| **III. Psychology** | `src/components/capture/CaptureDrawer.tsx`, `src/hooks/useTimer.ts` | In Progress | Implement "Optimistic UI" in `CaptureService` and "Skeleton Screens" in `InboxScreen`. |
| **IV. Clean Code** | `src/services/*`, `src/screens/*` | High Quality | Refactor `FogCutterScreen.tsx` using the "Step-Down Rule" (Card 31). |
| **V. Advanced UI** | `src/ui/cosmic/HaloRing.tsx`, `src/components/ui/EmptyState.tsx` | Partially Complete | Add `:active` shadow reduction to `RuneButton` and `MetroButton` (Card 50). |

---

## 3. Phased Rollout Plan

Prioritized implementation sequence to avoid regressions and maximize UX impact.

### Phase 1: Foundation & "Rules of the Universe" (Immediate)
*   **Goal:** Enforce strict token usage and systematic spacing.
*   **Acceptance Criteria:** `npx tsc` passes; no hardcoded hex codes found in `src/` via grep.
*   **Risks:** Breaking existing layouts that rely on specific (non-token) pixel values.

### Phase 2: Core Interaction Audit (Capture & Timers)
*   **Goal:** Apply Fitts' Law and Doherty Threshold to core flows.
*   **Acceptance Criteria:** All buttons meet 44x44px hit areas; Capture save feels instantaneous (optimistic update).
*   **Risks:** UI clutter if hit areas are increased without adjusting layout.

### Phase 3: Visual Polish & "Cosmic Flare"
*   **Goal:** Implement multi-layer glows, overlapping depth, and custom bullets.
*   **Acceptance Criteria:** `GlowCard` and `HaloRing` match the multi-layer shadow spec in `cosmicTokens.ts`.
*   **Risks:** Performance overhead on lower-end Android devices due to complex shadows.

### Phase 4: Cognitive Load & Psychology
*   **Goal:** Apply Hick's Law and Miller's Law to Inbox and Fog Cutter.
*   **Acceptance Criteria:** Long forms/lists are chunked; "Recommended" actions highlighted in AI triage.
*   **Risks:** Over-simplification might hide necessary advanced features.

---

## 4. Edge-Case Matrix

Critical flows and their boundary conditions:

| Flow | Edge Case | Expected Behavior |
| :--- | :--- | :--- |
| **Capture** | Offline during voice recording | Cache transcript locally; show "Sync Pending" badge; retry on reconnection. |
| **Timers** | App backgrounded/killed during Ignite | Persist end-time in `StorageService`; resume or show "Completed" notification on re-entry. |
| **Check-In** | User ignores notification for >24h | Clear pending state; do not stack multiple check-in prompts. |
| **Inbox Triage** | AI sorting service returns 500 error | Fallback to manual list; show `AiSortError` with "Items saved locally" message. |
| **Nav Handoff** | Navigating to `Pomodoro` while `Ignite` is active | Prompt user to stop current timer or auto-pause with re-entry option. |
| **Persistence** | `AsyncStorage` is full/corrupted | Fail gracefully; use `ErrorBoundary` to prompt for data reset; prioritize critical settings. |

---

## 5. E2E Test Plan (Playwright)

Scenarios to verify implementation against the UX50 plan. Existing E2E test coverage is documented below.

### Existing Coverage (Current `e2e/` Tests)

#### `home.spec.ts` — Home Screen Smoke Tests
*   ✅ App loads without crash
*   ✅ Streak summary displays (`STREAK.001` format)
*   ✅ All 6 mode cards visible (Ignite, FogCutter, Pomodoro, Anchor, CheckIn, CBTGuide)
*   ✅ Bottom tab navigation renders (HOME, FOCUS, TASKS, CALENDAR)
*   ✅ FogCutter navigation from home card works

#### `cosmic-theme.spec.ts` — Cosmic Theme Comprehensive Tests
*   **Theme Toggle:** Verifies theme persistence across reloads via `localStorage`
*   **Home Screen Rendering:** All mode cards, navigation, system status, weekly metrics visible
*   **Screen Smoke Tests:** All 6 screens (Ignite, FogCutter, Pomodoro, Anchor, CheckIn, CBTGuide) render without crash
*   **Timer Interactions:** Pomodoro timer starts/decrements, phase transition (FOCUS→REST), Anchor breathing patterns start
*   **Interactive Features:** FogCutter micro-steps, CheckIn mood recommendations, BrainDump persistence, FogCutter ACTIVE_OPERATIONS

#### `capture-teacher.spec.ts` — Capture Flow & Inbox Triage (25+ tests)
*   **Bubble Visibility:** Badge count when unreviewed items exist
*   **Drawer Modes:** All 5 capture modes visible (voice, text, photo, paste, meeting)
*   **Text Capture:** Teacher captures note in ≤3 taps (UX efficiency verified)
*   **Inbox Triage:** Promote to task, discard, filter tabs (All/Unreviewed/Promoted)
*   **Bubble Hide Behavior:** Bubble not visible on Pomodoro modal (fullscreen isolation verified)

### New Test Scenarios (UX50 Implementation)

#### Scenario A: Capture Resilience (Cards 27, 40, 49)
*   **Preconditions:** Network throttled/offline.
*   **Steps:** Trigger voice capture → Save → Verify local UI updates immediately (Optimistic).
*   **Assertions:** 
    *   Item exists in `Inbox` with "local-only" indicator.
    *   No error modal shown.
    *   Drawer shows success flash.
    *   **Extends:** `capture-teacher.spec.ts` — Add offline network intercept variant.

#### Scenario B: Timer Continuity (Cards 29, 43)
*   **Preconditions:** `IgniteScreen` active.
*   **Steps:** Start timer → Simulate app background (reload) → Verify timer progress.
*   **Assertions:** Timer displays correct remaining time based on wall-clock delta.
*   **Extends:** `cosmic-theme.spec.ts` Timer Interactions — Add persistence/resume test.

#### Scenario C: Theme Token Integrity (Cards 2, 4, 8)
*   **Preconditions:** Cosmic theme active.
*   **Steps:** Scan computed styles of `GlowCard`, `RuneButton`, `HaloRing`.
*   **Assertions:** 
    *   Shadows match `webBoxShadows.strong` from `cosmicTokens.ts`.
    *   Background matches `backgroundStyles.nebula`.
    *   No hardcoded hex values found in inline styles.
*   **New Test File:** `e2e/token-audit.spec.ts`

#### Scenario D: Inbox "Zero" Empty State (Card 49)
*   **Preconditions:** Empty `CaptureService` storage.
*   **Steps:** Navigate to `InboxScreen`.
*   **Assertions:** 
    *   `EmptyState` component visible with illustration and CTA.
    *   Message reads "No captures yet. Tap the bubble to start."
*   **Extends:** `capture-teacher.spec.ts` — Add empty inbox test.

#### Scenario E: Touch Target Compliance (Card 22 — Fitts' Law)
*   **Preconditions:** All screens loaded.
*   **Steps:** Use Playwright accessibility API to scan all buttons/interactive elements.
*   **Assertions:** All touch targets ≥44x44px (web) or padded equivalent.
*   **New Test File:** `e2e/accessibility-fitts.spec.ts`

#### Scenario F: Visual Hierarchy Verification (Cards 11-20)
*   **Preconditions:** Cosmic theme; `CheckInScreen` loaded.
*   **Steps:** Compare computed styles of primary vs. secondary text.
*   **Assertions:**
    *   Secondary text uses `mist` color (`#B9C2D9`) not just smaller font size.
    *   Primary action button has `strong` glow; secondary action has `soft` glow.
*   **New Test File:** `e2e/visual-hierarchy.spec.ts`

---

## 6. Current Quality Baseline & Remaining Work

### Already Complete Today:
*   ✅ **Lint/Typecheck:** Clean and passing.
*   ✅ **Jest Baseline:** All unit tests passing for services (`CaptureService`, `StorageService`).
*   ✅ **E2E Baseline:** full suite green (`65 passed`, `1 skipped`, `0 failed`).
*   ✅ **Token System:** `cosmicTokens.ts` and `linearTokens.ts` defined and exported via `Tokens`.

### Remaining Work (To be executed by agents):
*   [ ] **Audit:** Replace all hardcoded spacing/colors in `src/screens` with `Tokens`.
*   [ ] **Feature:** Implement optimistic updates in `CaptureBubble` and `CaptureDrawer`.
*   [ ] **UI:** Add `:active` state shadow reduction to all `Cosmic` buttons.
*   [ ] **Polish:** Implement skeleton screens for `InboxScreen` loading state.
*   [ ] **Docs:** Keep `UX50_ROLLOUT_AND_EDGE_E2E_PLAN.md` updated as cards are implemented.

---
*Generated by Technical Writer Agent | 2026-02-23*

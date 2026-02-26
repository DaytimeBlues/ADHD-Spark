# Comprehensive Codebase Review: Spark ADHD

*This report was generated via an end-to-end audit for the purposes of identifying tech debt, architectural inefficiencies, UX/UI edge cases, and known bugs to serve as a roadmap for future LLM execution.*

## 1. Architecture & State Management

**Current State:**
The application utilizes `zustand` for global state management split across logical domains (`useCaptureStore`, `useDriftStore`, `useThemeStore`, `useTimerStore`). It relies heavily on a robust Service Layer (`src/services/`) for external APIs, notifications, audio, and device management.

**Refactoring Opportunities:**

* **Decouple Business Logic from State:** `useTimerStore.ts` contains extensive business logic (running ticks, calculating deltas, and triggering `NotificationService`). This violates the single responsibility principle. Move the side-effects to a dedicated `TimerController` or custom hooks that watch the store.
* **Centralized Error Handling:** A codebase search revealed over 30 instances of unstructured `console.error` logs scattered across services (`StorageService`, `GoogleTasksSyncService`, `ChatService`). While Sentry is configured in `App.tsx`, it only catches unhandled exceptions.
  * *Action:* Create a centralized `LoggerService` to ingest errors gracefully and dispatch them to Sentry with proper tag context, rather than relying on `console.error`.

## 2. Code Inefficiencies

* **Large Component Files:** Files like `HomeScreen.tsx`, `DiagnosticsScreen.tsx`, and `FogCutterScreen.tsx` have grown considerably large (> 25KB+). They handle layout, raw data fetching, and local state simultaneously.
  * *Action:* Adopt a true Container/Presenter pattern to extract logic from the visual components, making the views purely declarative.
* **Platform Branching Complexity:** There is significant inline checking of `Platform.OS === 'web'` to toggle interactive styles, animations, or gesture wrapping (seen in `App.tsx` and `ModeCard.tsx`).
  * *Action:* Abstract platform-specific rendering wrappers into a generic `PlatformView.tsx` or `PlatformInteractive.tsx` component to reduce component clutter.

## 3. UX & UI Issues

* **Cognitive Ergonomics:** The application recently transitioned from high-contrast hyper-brutalism to a "Matte Frost" aesthetic designed to reduce ADHD sensory friction.
  * *Edge Case:* Future feature additions must adhere to the soft navy/frost palette (`#1E2336`) to avoid regressing the user's cognitive comfort.
* **Transitions:** The transition interpolators for React Navigation were recently set to quick cross-fades (`CardStyleInterpolators.forFadeFromCenter`).
  * *Edge Case:* Deeply nested modals or custom Overlays (like `DriftCheckOverlay`) might still exhibit harsh instantaneous popping if their animation configurations do not inherit from the root navigator.

## 4. Known Bugs & Environmental Constraints

* **Local Web-Server Instability (Windows):** Running the Webpack development server (`npm run web`) frequently suffers from fatal crashes (`Exit Code: -1073741510`) on local Windows environments. This restricts comprehensive automated E2E Browser Subagent testing.
* **React Native Web Compilations:** The `process` environment variable inherently lacks a polyfill in some Webpack configurations, which previously caused blank screens. A manual patch in `public/index.html` mitigates this, but the underlying Webpack configuration should be hardened to inject native environments explicitly.
* **Google Auth Config Branching:** `GoogleTasksSyncService` warns on missing iOS/Web client IDs. If environment variables are malformed natively or during CI build, silent failures occur without explicit UI feedback to the user.

## 5. Documentation State

* **Status:** *Cleaned.*
* The `docs/planning` repository was severely cluttered with obsolete `DEBUG_REPORT.md`, `ANDROID_COMPATIBILITY.md`, and dated `UX_ROLLOUT` charts. These have been removed to establish a clean environment. Key architectural documents (`PRD.md`, `TECH_SPEC.md`, `DESIGN_RULES.md`) have been retained.

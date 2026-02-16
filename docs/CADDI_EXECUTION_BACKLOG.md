# CADDI Execution Backlog

**Purpose:** Actionable checklist mapped to concrete files so work can proceed without re-deciding scope.

## Priority 0 - Evidence and Governance

- [ ] Add canonical CADDI config module with source metadata and claim-strength labels.
  - Files: `src/config/caddi.ts`, `src/config/index.ts`
- [ ] Replace hardcoded CADDI links in CBT guide with config references.
  - Files: `src/screens/CBTGuideScreen.tsx`
- [ ] Add tests for CADDI config integrity.
  - Files: `__tests__/caddi.config.test.ts`

## Priority 1 - Activation Reliability (Ignite)

- [ ] Define activation session event contract.
  - Files: `src/types/*` or `src/services/*`
- [ ] Persist event snapshots locally.
  - Files: `src/services/StorageService.ts`, `src/services/*Activation*.ts`
- [ ] Prevent duplicate active sessions on resume.
  - Files: `src/screens/IgniteScreen.tsx`, `src/hooks/useTimer.ts`

## Priority 2 - Decomposition to Action

- [ ] Introduce explicit Fog Cutter step states (`new`, `next`, `in_progress`, `done`).
  - Files: `src/screens/FogCutterScreen.tsx`, `src/types/*`
- [ ] Enforce single `next` step invariant.
  - Files: `src/screens/FogCutterScreen.tsx`
- [ ] Add handoff action from Fog Cutter step to Ignite start.
  - Files: `src/screens/FogCutterScreen.tsx`, `src/navigation/*`

## Priority 3 - Retention and Re-entry

- [ ] Add low-shame re-entry prompts after inactivity windows.
  - Files: `src/screens/HomeScreen.tsx`, `src/screens/CheckInScreen.tsx`
- [ ] Add grace-day streak recovery model.
  - Files: `src/services/*`, `src/screens/HomeScreen.tsx`
- [ ] Add local weekly retention snapshot generation.
  - Files: `src/services/*Analytics*.ts`

## Priority 4 - Validation

- [ ] Typecheck: `npx tsc --noEmit`
- [ ] Unit tests: `npm test -- --runInBand`
- [ ] Web build smoke: `npm run build:web`

## Acceptance Criteria

- Every CADDI claim shown in UI maps to a source in `src/config/caddi.ts`.
- No net-new remote data collection added.
- Existing test suite remains green.
- Work remains local-first and reversible.

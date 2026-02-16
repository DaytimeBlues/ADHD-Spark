# CADDI Implementation Spec (Execution-Focused)

**Date:** 2026-02-16  
**Scope:** Translate CADDI evidence into Spark ADHD engineering work without inflating claims.

## 1. Objective

Implement CADDI-aligned behavior scaffolding for adult ADHD inattentive presentation using existing Spark modules (`Ignite`, `Fog Cutter`, `Brain Dump`, `Anchor`, `Check-In`) while preserving local-first privacy.

## 2. Clinical-to-Product Mapping

| CADDI construct | Product behavior | Existing module | Required engineering delta |
| :--- | :--- | :--- | :--- |
| Behavioral activation | Fast initiation with minimal decision load | `IgniteScreen` | One-tap launch, recovery prompts, session continuity |
| Organization/choreography | Convert overwhelm into executable micro-steps | `FogCutterScreen` | Persist decomposition states + completion telemetry |
| Externalization | Offload working memory immediately | `BrainDumpScreen` | Faster capture path + optional conversion to task queue |
| Mindful interruption | Interrupt rumination/avoidance loops | `AnchorScreen` | Trigger from stuck states + short guided defaults |
| Self-monitoring | Detect patterns between mood/energy and activation | `CheckInScreen` | Correlation view with completed ignition sessions |

## 3. Evidence Guardrails

- Strongest local evidence: `docs/fpsyt-16-1564506.pdf` (CADDI RCT, N=108, NCT04090983, primary outcome p=.045, d=0.49).
- Secondary sources (manuals/reviews/internal docs) guide mechanism design, not efficacy marketing.
- In-app claims must be tagged by strength: `trial-supported`, `practice-informed`, `hypothesis`.

## 4. Engineering Workstreams

### Workstream A: Evidence Plumbing

**Goal:** Centralize CADDI evidence metadata and references in code.

- Add `src/config/caddi.ts`:
  - evidence tier types
  - source registry
  - requirement registry
  - approved UI claim strings
- Replace hardcoded CADDI links/text in screens with config-driven values.
- Add unit tests for source integrity (IDs, tier, URL shape, required claim labels).

### Workstream B: Activation Loop Reliability

**Goal:** Reduce initiation friction and improve return-to-task behavior.

- Track Ignite session lifecycle events locally:
  - started
  - completed
  - abandoned
  - resumed
- Add resume-safe state transitions (no duplicate active sessions).
- Add recovery entry points from Home and Check-In when user reports low energy/stuck state.

### Workstream C: Decomposition to Execution

**Goal:** Ensure decomposition outputs become immediate action, not dead lists.

- Fog Cutter step states: `new`, `next`, `in_progress`, `done`.
- Enforce one `next` step at a time.
- Add quick handoff from Fog Cutter `next` step to Ignite timer start.

### Workstream D: Retention/Re-entry

**Goal:** Address known engagement decay.

- Add non-judgmental re-entry messaging after inactivity windows.
- Add local streak resilience model (grace day, restart path).
- Instrument weekly retention in local analytics snapshots (no remote by default).

## 5. Data Contracts

### `CaddiEvidenceSource`

```ts
type EvidenceTier = 'A' | 'B' | 'C';

type CaddiEvidenceSource = {
  id: string;
  title: string;
  tier: EvidenceTier;
  url: string;
  sourceType: 'rct' | 'qualitative' | 'registry' | 'review' | 'manual' | 'internal';
  claimStrength: 'trial-supported' | 'practice-informed' | 'hypothesis';
};
```

### `ActivationSession`

```ts
type ActivationSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: 'started' | 'completed' | 'abandoned' | 'resumed';
  source: 'ignite' | 'checkin_prompt' | 'fogcutter_handoff';
};
```

## 6. Quality Gates

- `npx tsc --noEmit` must pass.
- `npm test -- --runInBand` must pass.
- New config module must have tests.
- Any new claim in UI must map to a source entry in `src/config/caddi.ts`.

## 7. Risk Register

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Evidence inflation in product copy | Clinical credibility damage | Config-based claim labeling + review gate |
| Feature creep via broad ADHD scope | Slower delivery | Lock to inattentive-first path for CADDI stream |
| Over-instrumentation harms UX | User friction | Keep telemetry local and event-minimal |
| Regression in timer/task flows | User trust loss | Add focused tests for session transitions |

## 8. Immediate Execution Order

1. Centralize CADDI references (`src/config/caddi.ts`).
2. Wire CBT guide to config-driven sources.
3. Add config integrity tests.
4. Implement activation telemetry contract.
5. Implement fog-to-ignite handoff.

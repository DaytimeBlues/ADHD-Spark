You are a focused subagent reviewer for a single holistic investigation batch.

Repository root: C:\Users\Steve\OneDrive\Desktop\Github Repos\spark-adhd
Blind packet: C:\Users\Steve\OneDrive\Desktop\Github Repos\spark-adhd\.desloppify\review_packet_blind.json
Batch index: 10
Batch name: Full Codebase Sweep
Batch dimensions: naming_quality, logic_clarity, type_safety, contract_coherence, error_consistency, abstraction_fitness, ai_generated_debt, high_level_elegance, mid_level_elegance, low_level_elegance, cross_module_architecture, initialization_coupling, convention_outlier, dependency_health, test_strategy, api_surface_coherence, authorization_consistency, incomplete_migration, package_organization, design_coherence
Batch rationale: thorough default: evaluate cross-cutting quality across all production files

Mechanical scan evidence: The blind packet contains `holistic_context.scan_evidence` with aggregated signals from all mechanical detectors — including complexity hotspots, error hotspots, signal density index (files flagged by multiple detectors), boundary violations, and systemic patterns. Consult this section for investigative leads beyond the seed files.

Seed files (start here):
- App.tsx
- e2e/helpers/seed.ts
- playwright.config.ts
- src/components/DriftCheckOverlay.tsx
- src/components/ErrorBoundary.tsx
- src/components/LockScreen.tsx
- src/components/brain-dump/BrainDumpActionBar.tsx
- src/components/brain-dump/BrainDumpGuide.tsx
- src/components/brain-dump/BrainDumpInput.tsx
- src/components/brain-dump/BrainDumpItem.tsx
- src/components/brain-dump/BrainDumpRationale.tsx
- src/components/brain-dump/BrainDumpVoiceRecord.tsx
- src/components/brain-dump/index.ts
- src/components/capture/CaptureBubble.tsx
- src/components/capture/CaptureDrawer.tsx
- src/components/capture/index.ts
- src/components/home/ModeCard.tsx
- src/components/metro/MetroButton.tsx
- src/components/metro/MetroCard.tsx
- src/components/metro/MetroTile.tsx
- src/components/ui/EmptyState.tsx
- src/components/ui/EvidenceBadge.tsx
- src/components/ui/LinearButton.tsx
- src/components/ui/LinearCard.tsx
- src/components/ui/ReEntryPrompt.tsx
- src/components/ui/ScaleButton.web.tsx
- src/config/caddi.ts
- src/config/index.ts
- src/config/secrets.example.ts
- src/hooks/useAgentEvents.ts
- src/hooks/useBiometric.ts
- src/hooks/useChat.ts
- src/hooks/useCheckIn.ts
- src/hooks/useGoogleSyncPolling.ts
- src/hooks/useNotifications.ts
- src/hooks/useReducedMotion.ts
- src/hooks/useRetention.ts
- src/hooks/useTimer.ts
- src/hooks/useUnreviewedCount.ts
- src/init/bootstrap.ts
- src/navigation/AppNavigator.tsx
- src/navigation/WebNavBar.tsx
- src/navigation/navigationRef.ts
- src/navigation/routes.ts
- src/screens/AnchorScreen.tsx
- src/screens/BrainDumpScreen.tsx
- src/screens/CBTGuideScreen.tsx
- src/screens/CalendarScreen.tsx
- src/screens/ChatScreen.tsx
- src/screens/CheckInScreen.tsx
- src/screens/DiagnosticsScreen.tsx
- src/screens/FogCutterScreen.tsx
- src/screens/HomeScreen.tsx
- src/screens/IgniteScreen.tsx
- src/screens/InboxScreen.tsx
- src/screens/PomodoroScreen.tsx
- src/services/AISortService.ts
- src/services/ActivationService.ts
- src/services/AgentEventBus.ts
- src/services/BiometricService.ts
- src/services/CaptureService.ts
- src/services/ChatService.ts
- src/services/CheckInInsightService.ts
- src/services/CheckInService.ts
- src/services/DriftService.ts
- src/services/FogCutterAIService.ts
- src/services/GoogleAuthService.ts
- src/services/GoogleTasksSyncService.ts
- src/services/GoogleTasksSyncService.web.ts
- src/services/HapticsService.ts
- src/services/LoggerService.ts
- src/services/NotificationService.ts
- src/services/OverlayService.ts
- src/services/PlaudService.ts
- src/services/RecordingService.ts
- src/services/RetentionService.ts
- src/services/SoundService.ts
- src/services/SoundService.web.ts
- src/services/StorageService.ts
- src/services/TimerService.ts

Task requirements:
1. Read the blind packet and follow `system_prompt` constraints exactly.
1a. If previously flagged issues are listed above, use them as context for your review.
    Verify whether each still applies to the current code. Do not re-report fixed or
    wontfix issues. Use them as starting points to look deeper — inspect adjacent code
    and related modules for defects the prior review may have missed.
1b. If mechanical concern signals are listed above, explicitly confirm or refute them.
    Report confirmed defects under the most impacted batch dimension.
    If refuting, include clear counter-evidence in `dimension_notes`.
1c. Think structurally: when you spot multiple individual issues that share a common
    root cause (missing abstraction, duplicated pattern, inconsistent convention),
    explain the deeper structural issue in the finding, not just the surface symptom.
    If the pattern is significant enough, report the structural issue as its own finding
    with appropriate fix_scope ('multi_file_refactor' or 'architectural_change') and
    use `root_cause_cluster` to connect related symptom findings together.
2. Start with the seed files, then freely explore additional repository files likely to surface material issues.
2a. Prioritize high-signal leads: unexplored/lightly reviewed files, historical issue areas, and hotspot neighbors (high coupling, god modules, large files, churn seams).
2b. Keep exploration targeted — follow strongest evidence paths first instead of attempting exhaustive coverage.
2c. Keep findings and scoring scoped to this batch's listed dimensions.
2d. Respect scope controls in the blind packet config: do not include files/directories marked by `exclude`, `ignore`, or zone overrides that classify files as non-production (test/config/generated/vendor).
3. Return 0-20 high-quality findings for this batch (empty array allowed).
3a. Do not suppress real defects to keep scores high; report every material issue you can support with evidence.
3b. Do not default to 100. Reserve 100 for genuinely exemplary evidence in this batch.
4. Score/finding consistency is required: broader or more severe findings MUST lower dimension scores.
4a. Any dimension scored below 85.0 MUST include explicit feedback: add at least one finding with the same `dimension` and a non-empty actionable `suggestion`.
5. Every finding must include `related_files` with at least 2 files when possible.
6. Every finding must include `dimension`, `identifier`, `summary`, `evidence`, `suggestion`, and `confidence`.
7. Every finding must include `impact_scope` and `fix_scope`.
8. Every scored dimension MUST include dimension_notes with concrete evidence.
9. If a dimension score is >85.0, include `issues_preventing_higher_score` in dimension_notes.
10. Use exactly one decimal place for every assessment and abstraction sub-axis score.
9a. For package_organization, ground scoring in objective structure signals from `holistic_context.structure` (root_files fan_in/fan_out roles, directory_profiles, coupling_matrix). Prefer thresholded evidence (for example: fan_in < 5 for root stragglers, import-affinity > 60%, directories > 10 files with mixed concerns).
9b. Suggestions must include a staged reorg plan (target folders, move order, and import-update/validation commands).
9c. Also consult `holistic_context.structure.flat_dir_findings` for directories flagged as overloaded, fragmented, or thin-wrapper patterns.
9d. For abstraction_fitness, use evidence from `holistic_context.abstractions`:
  - `delegation_heavy_classes`: classes where most methods forward to an inner object — entries include class_name, delegate_target, sample_methods, and line number.
  - `facade_modules`: re-export-only modules with high re_export_ratio — entries include samples (re-exported names) and loc.
  - `typed_dict_violations`: TypedDict fields accessed via .get()/.setdefault()/.pop() — entries include typed_dict_name, violation_type, field, and line number.
  - `complexity_hotspots`: files where mechanical analysis found extreme parameter counts, deep nesting, or disconnected responsibility clusters.
  Include `delegation_density`, `definition_directness`, and `type_discipline` alongside existing sub-axes in dimension_notes when evidence supports it.
9e. For initialization_coupling, use evidence from `holistic_context.scan_evidence.mutable_globals` and `holistic_context.errors.mutable_globals`. Investigate initialization ordering dependencies, coupling through shared mutable state, and whether state should be encapsulated behind a proper registry/context manager.
9f. For design_coherence, use evidence from `holistic_context.scan_evidence.signal_density` — files where multiple mechanical detectors fired. Investigate what design change would address multiple signals simultaneously. Check `scan_evidence.complexity_hotspots` for files with high responsibility cluster counts.
9g. For error_consistency, use evidence from `holistic_context.errors.exception_hotspots` — files with concentrated exception handling findings. Investigate whether error handling is designed or accidental. Check for broad catches masking specific failure modes.
9h. For cross_module_architecture, also consult `holistic_context.coupling.boundary_violations` for import paths that cross architectural boundaries, and `holistic_context.dependencies.deferred_import_density` for files with many function-level imports (proxy for cycle pressure).
9i. For convention_outlier, also consult `holistic_context.conventions.duplicate_clusters` for cross-file function duplication and `conventions.naming_drift` for directory-level naming inconsistency.
9j. Workflow integrity checks: when reviewing orchestration/queue/review flows,
    explicitly look for loop-prone patterns and blind spots:
    - repeated stale/reopen churn without clear exit criteria or gating,
    - packet/batch data being generated but dropped before prompt execution,
    - ranking/triage logic that can starve target-improving work,
    - reruns happening before existing open review work is drained.
    If found, propose concrete guardrails and where to implement them.
11. Ignore prior chat context and any target-threshold assumptions.
12. Do not edit repository files.
13. Return ONLY valid JSON, no markdown fences.

Scope enums:
- impact_scope: "local" | "module" | "subsystem" | "codebase"
- fix_scope: "single_edit" | "multi_file_refactor" | "architectural_change"

Output schema:
{
  "batch": "Full Codebase Sweep",
  "batch_index": 10,
  "assessments": {"<dimension>": <0-100 with one decimal place>},
  "dimension_notes": {
    "<dimension>": {
      "evidence": ["specific code observations"],
      "impact_scope": "local|module|subsystem|codebase",
      "fix_scope": "single_edit|multi_file_refactor|architectural_change",
      "confidence": "high|medium|low",
      "issues_preventing_higher_score": "required when score >85.0",
      "sub_axes": {"abstraction_leverage": 0-100, "indirection_cost": 0-100, "interface_honesty": 0-100, "delegation_density": 0-100, "definition_directness": 0-100, "type_discipline": 0-100}  // required for abstraction_fitness when evidence supports it; all one decimal place
    }
  },
  "findings": [{
    "dimension": "<dimension>",
    "identifier": "short_id",
    "summary": "one-line defect summary",
    "related_files": ["relative/path.py"],
    "evidence": ["specific code observation"],
    "suggestion": "concrete fix recommendation",
    "confidence": "high|medium|low",
    "impact_scope": "local|module|subsystem|codebase",
    "fix_scope": "single_edit|multi_file_refactor|architectural_change",
    "root_cause_cluster": "optional_cluster_name_when_supported_by_history"
  }],
  "retrospective": {
    "root_causes": ["optional: concise root-cause hypotheses"],
    "likely_symptoms": ["optional: identifiers that look symptom-level"],
    "possible_false_positives": ["optional: prior concept keys likely mis-scoped"]
  }
}

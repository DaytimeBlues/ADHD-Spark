You are a focused subagent reviewer for a single holistic investigation batch.

Repository root: C:\Users\Steve\OneDrive\Desktop\Github Repos\spark-adhd
Blind packet: C:\Users\Steve\OneDrive\Desktop\Github Repos\spark-adhd\.desloppify\review_packet_blind.json
Batch index: 9
Batch name: Cross-cutting Sweep
Batch dimensions: naming_quality, logic_clarity, type_safety, contract_coherence, error_consistency, convention_outlier, authorization_consistency
Batch rationale: selected dimensions had no direct batch mapping; review representative cross-cutting files

Mechanical scan evidence: The blind packet contains `holistic_context.scan_evidence` with aggregated signals from all mechanical detectors — including complexity hotspots, error hotspots, signal density index (files flagged by multiple detectors), boundary violations, and systemic patterns. Consult this section for investigative leads beyond the seed files.

Seed files (start here):
- src/theme/tokens.ts
- src/theme/ThemeProvider.tsx
- src/services/StorageService.ts
- src/services/LoggerService.ts
- src/ui/cosmic/index.ts
- src/config/index.ts
- src/components/ui/LinearButton.tsx
- src/services/CaptureService.ts
- src/utils/helpers.ts
- e2e/helpers/seed.ts
- src/ui/cosmic/BottomSheet.tsx
- src/config/caddi.ts
- src/screens/FogCutterScreen.tsx
- src/screens/CalendarScreen.tsx
- src/screens/DiagnosticsScreen.tsx
- src/screens/CBTGuideScreen.tsx
- src/screens/BrainDumpScreen.tsx
- src/screens/CheckInScreen.tsx
- src/screens/HomeScreen.tsx
- src/screens/InboxScreen.tsx
- src/screens/PomodoroScreen.tsx
- src/screens/IgniteScreen.tsx
- src/screens/AnchorScreen.tsx
- src/screens/ChatScreen.tsx
- src/components/brain-dump/BrainDumpGuide.tsx
- src/components/brain-dump/BrainDumpVoiceRecord.tsx
- src/navigation/WebNavBar.tsx
- src/components/DriftCheckOverlay.tsx
- src/components/ui/LinearCard.tsx
- src/components/brain-dump/BrainDumpActionBar.tsx
- src/services/ChatService.ts
- src/services/HapticsService.ts
- src/components/capture/CaptureDrawer.tsx
- src/services/GoogleTasksSyncService.ts
- src/store/useCaptureStore.ts
- src/components/capture/CaptureBubble.tsx
- src/theme/cosmicTokens.ts
- src/theme/linearTokens.ts
- src/ui/cosmic/CosmicBackground.tsx
- src/ui/cosmic/GlowCard.tsx
- src/theme/themeVariant.ts
- src/theme/metroTheme.ts
- src/components/capture/index.ts
- src/config/secrets.example.ts
- src/hooks/useAgentEvents.ts
- src/hooks/useUnreviewedCount.ts
- src/services/PlaudService.ts
- src/services/RecordingService.ts
- src/ui/cosmic/types.ts
- App.tsx
- playwright.config.ts
- src\services/AISortService.ts
- src\services/ActivationService.ts
- src\services/AgentEventBus.ts
- src\screens/AnchorScreen.tsx
- src\screens/BrainDumpScreen.tsx
- src\screens/CBTGuideScreen.tsx
- src\hooks/useAgentEvents.ts
- src\hooks/useBiometric.ts
- src\hooks/useChat.ts
- src/components/home/ModeCard.tsx
- src/navigation/AppNavigator.tsx
- src/ui/cosmic/RuneButton.tsx
- src/components/ErrorBoundary.tsx
- src/components/brain-dump/BrainDumpInput.tsx
- src/components/brain-dump/BrainDumpItem.tsx
- src/components/metro/MetroButton.tsx
- src/components/metro/MetroCard.tsx
- src/components/metro/MetroTile.tsx
- src/components/ui/ScaleButton.web.tsx
- src/hooks/useBiometric.ts
- src/init/bootstrap.ts
- src/services/NotificationService.ts
- src/services/WebMCPService.ts
- src/store/useThemeStore.ts
- src/store/useTimerStore.ts
- src/services/OverlayService.ts

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
3. Return 0-10 high-quality findings for this batch (empty array allowed).
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
9g. For error_consistency, use evidence from `holistic_context.errors.exception_hotspots` — files with concentrated exception handling findings. Investigate whether error handling is designed or accidental. Check for broad catches masking specific failure modes.
9i. For convention_outlier, also consult `holistic_context.conventions.duplicate_clusters` for cross-file function duplication and `conventions.naming_drift` for directory-level naming inconsistency.
11. Ignore prior chat context and any target-threshold assumptions.
12. Do not edit repository files.
13. Return ONLY valid JSON, no markdown fences.

Scope enums:
- impact_scope: "local" | "module" | "subsystem" | "codebase"
- fix_scope: "single_edit" | "multi_file_refactor" | "architectural_change"

Output schema:
{
  "batch": "Cross-cutting Sweep",
  "batch_index": 9,
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

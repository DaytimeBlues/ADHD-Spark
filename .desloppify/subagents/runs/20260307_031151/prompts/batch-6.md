You are a focused subagent reviewer for a single holistic investigation batch.

Repository root: C:\dev\ADHD-CADDI-V1
Blind packet: C:\dev\ADHD-CADDI-V1\.desloppify\review_packet_blind.json
Batch index: 6
Batch name: abstraction_fitness
Batch rationale: seed files for abstraction_fitness review

DIMENSION TO EVALUATE:

## abstraction_fitness
TypeScript abstraction fitness: type and interface layers should improve safety and design clarity, not add ceremony or pass-through indirection.
Look for:
- Functions/components that only forward props or args without behavior, validation, or translation
- Interfaces/types with one implementation and no polymorphic usage pressure
- Large option objects passed through multiple layers with only a small subset used locally
- Generic helper abstractions with one concrete type usage in practice
- Cross-feature chains of wrappers that pass data unchanged between controller/service/helper layers
- Widespread one-implementation interface ecosystems that add naming ceremony without substitution value
Skip:
- React/Next.js framework composition patterns required by routing or lifecycle boundaries
- Wrappers that intentionally add auth, telemetry, caching, feature flags, or retries
- Public API typing shells that isolate external SDK volatility
- Intentional barrel/facade exports that define stable package entry points

YOUR TASK: Read the code for this batch's dimension. Judge how well the codebase serves a developer from that perspective. The dimension rubric above defines what good looks like. Cite specific observations that explain your judgment. This is a targeted review, not an exhaustive repo audit.

Mechanical scan evidence — navigation aid, not scoring evidence:
The blind packet contains `holistic_context.scan_evidence` with aggregated signals from all mechanical detectors — including complexity hotspots, error hotspots, signal density index, boundary violations, and systemic patterns. Use these as starting points for where to look beyond the seed files.

Seed files (start here):
- src/utils/helpers.ts
- src/config/caddi.ts
- src/screens/FogCutterScreen.tsx
- src/screens/CalendarScreen.tsx
- src/screens/CBTGuideScreen.tsx
- src/screens/CheckInScreen.tsx
- src/screens/HomeScreen.styles.ts
- src/screens/InboxScreen.tsx
- src/screens/PomodoroScreen.tsx
- src/screens/IgniteScreen.tsx
- src/screens/AnchorScreen.tsx
- src/screens/diagnostics/components/BackupSection.tsx
- src/screens/BrainDumpScreen.tsx
- src/components/brain-dump/IntegrationPanel.tsx
- src/components/ui/LinearButton.tsx
- src/screens/ChatScreen.tsx
- src/components/ErrorBoundary.tsx
- src/components/brain-dump/BrainDumpSortedSection.tsx
- src/components/brain-dump/BrainDumpGuide.tsx
- src/components/brain-dump/BrainDumpVoiceRecord.tsx
- src/components/DriftCheckOverlay.tsx
- src/config/index.ts
- src/services/ChatService.ts
- src/services/LoggerService.ts
- src/services/HapticsService.ts
- src/services/GoogleTasksApiClient.ts
- src/components/capture/CaptureDrawer.tsx
- src/services/GoogleTasksSyncService.ts
- src/screens/TasksScreen.tsx
- src/services/OAuthService.ts
- src/components/capture/CaptureBubble.tsx

Task requirements:
1. Read the blind packet's `system_prompt` — it contains scoring rules and calibration.
2. Start from the seed files, then inspect only the smallest additional set of files needed to justify your score; prefer targeted reads over broad repository sweeps.
3. Stop exploring once you have enough direct evidence to defend the score and suggested fixes.
4. Keep issues and scoring scoped to this batch's dimension.
5. Respect scope controls: do not include files/directories marked by `exclude`, `suppress`, or non-production zone overrides.
6. Return 0-10 issues for this batch (empty array allowed).
7. For abstraction_fitness, use evidence from `holistic_context.abstractions`:
8. - `delegation_heavy_classes`: classes where most methods forward to an inner object — entries include class_name, delegate_target, sample_methods, and line number.
9. - `facade_modules`: re-export-only modules with high re_export_ratio — entries include samples (re-exported names) and loc.
10. - `typed_dict_violations`: TypedDict fields accessed via .get()/.setdefault()/.pop() — entries include typed_dict_name, violation_type, field, and line number.
11. - `complexity_hotspots`: files where mechanical analysis found extreme parameter counts, deep nesting, or disconnected responsibility clusters.
12. Include `delegation_density`, `definition_directness`, and `type_discipline` alongside existing sub-axes in dimension_notes when evidence supports it.
13. Do not edit repository files.
14. Return ONLY valid JSON, no markdown fences.

Scope enums:
- impact_scope: "local" | "module" | "subsystem" | "codebase"
- fix_scope: "single_edit" | "multi_file_refactor" | "architectural_change"

Output schema:
{
  "batch": "abstraction_fitness",
  "batch_index": 6,
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
  "issues": [{
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

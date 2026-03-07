You are a focused subagent reviewer for a single holistic investigation batch.

Repository root: C:\dev\ADHD-CADDI-V1
Blind packet: C:\dev\ADHD-CADDI-V1\.desloppify\review_packet_blind.json
Batch index: 11
Batch name: api_surface_coherence
Batch rationale: seed files for api_surface_coherence review

DIMENSION TO EVALUATE:

## api_surface_coherence
Inconsistent API shapes, mixed sync/async, overloaded interfaces
Look for:
- Inconsistent API shapes: similar functions with different parameter ordering or naming
- Mixed sync/async in the same module's public API
- Overloaded interfaces: one function doing too many things based on argument types
- Missing error contracts: no documentation or types indicating what can fail
- Public functions with >5 parameters (API boundary may be wrong)
Skip:
- Internal/private APIs where flexibility is acceptable
- Framework-imposed patterns (React hooks must follow rules of hooks)

YOUR TASK: Read the code for this batch's dimension. Judge how well the codebase serves a developer from that perspective. The dimension rubric above defines what good looks like. Cite specific observations that explain your judgment. This is a targeted review, not an exhaustive repo audit.

Mechanical scan evidence — navigation aid, not scoring evidence:
The blind packet contains `holistic_context.scan_evidence` with aggregated signals from all mechanical detectors — including complexity hotspots, error hotspots, signal density index, boundary violations, and systemic patterns. Use these as starting points for where to look beyond the seed files.

Seed files (start here):
- src/theme/useTheme.ts
- src/components/ui/LinearButton.tsx
- src/screens/BrainDumpScreen.tsx
- src/theme/metroTheme.ts
- src/store/useTaskStore.ts
- src/ui/cosmic/GlowCard.tsx
- src/theme/linearTokens.ts
- src/screens/IgniteScreen.tsx
- src/ui/cosmic/CosmicBackground.tsx
- src/ui/cosmic/RuneButton.tsx

Task requirements:
1. Read the blind packet's `system_prompt` — it contains scoring rules and calibration.
2. Start from the seed files, then inspect only the smallest additional set of files needed to justify your score; prefer targeted reads over broad repository sweeps.
3. Stop exploring once you have enough direct evidence to defend the score and suggested fixes.
4. Keep issues and scoring scoped to this batch's dimension.
5. Respect scope controls: do not include files/directories marked by `exclude`, `suppress`, or non-production zone overrides.
6. Return 0-10 issues for this batch (empty array allowed).
7. Do not edit repository files.
8. Return ONLY valid JSON, no markdown fences.

Scope enums:
- impact_scope: "local" | "module" | "subsystem" | "codebase"
- fix_scope: "single_edit" | "multi_file_refactor" | "architectural_change"

Output schema:
{
  "batch": "api_surface_coherence",
  "batch_index": 11,
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

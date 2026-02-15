# Research Report: CADDI (CBT for ADHD - Inattentive Presentation) and Digital Translation for Spark ADHD

**Author:** Technical Writer (OpenCode)  
**Date:** February 15, 2026  
**Status:** Final Draft (Masters-Level Technical Synthesis)  
**Context:** Spark ADHD Repository Research Consolidation

---

## 1. Executive Summary

This report synthesizes the clinical evidence for **CADDI** (Cognitive Behavioral Therapy for ADHD - Inattentive Presentation) and its potential translation into the **Spark ADHD** digital platform. CADDI represents a specialized adaptation of Cognitive Behavioral Therapy (CBT) specifically for the predominantly inattentive presentation of adult ADHD (ADHD-I), shifting focus from hyperactive-impulsive management to behavioral activation, initiation, and task persistence. 

Recent Phase II randomized controlled trial (RCT) evidence (Strålin et al., 2025) suggests that CADDI significantly improves behavioral activation and reduces procrastination compared to traditional DBT-based protocols. For Spark ADHD, the translation of CADDI components—specifically behavioral activation (Ignite), task decomposition (Fog Cutter), and cognitive offloading (Brain Dump)—offers a source-grounded framework for digital intervention. This report outlines the mechanisms of change, clinical evidence, and an implementation roadmap for a local-first, privacy-preserving digital companion.

---

## 2. Definitions and Disambiguation

### 2.1 CADDI
**CADDI** (CBT for ADHD-I) is a 14-week manualized group therapy protocol developed by researchers (notably Erika Erika Strålin and colleagues at the Karolinska Institutet). It is distinguished from standard CBT for ADHD by its heavy emphasis on:
- **Behavioral Activation (BA):** Targeting the "initiation gap" common in ADHD-I.
- **Task Decomposition:** Managing "overwhelm paralysis" through micro-stepping.
- **Executive Function Scaffolding:** Using externalized tools to compensate for working memory deficits.

### 2.2 Disambiguation
*   **CADDI vs. CADDRA:** CADDI is a specific therapy protocol; **CADDRA** is the Canadian ADHD Resource Alliance (a professional organization/guideline body).
*   **CADDI vs. CADDIE:** Avoid confusion with golf-related software or generic data-indexing acronyms. In clinical ADHD literature, CADDI refers specifically to the inattentive-focused CBT protocol.
*   **ADHD-I:** Refers to the "Predominantly Inattentive Presentation" (formerly DSM-IV ADHD, Inattentive Type).

---

## 3. Methods

Literature for this report was gathered through a systematic probe of:
1.  **Peer-Reviewed Databases:** PubMed, PMC, Frontiers, and PLOS.
2.  **Clinical Registries:** ClinicalTrials.gov (NCT04090983).
3.  **Institutional Archives:** Karolinska Institutet Open Archive.
4.  **Keywords:** "CADDI", "CBT for ADHD-I", "Behavioral Activation ADHD", "Digital Distractibility", "Adult ADHD Inattentive CBT".
5.  **Evidence Grading:** Trials were assessed based on sample size (N), randomization, and primary outcome significance (p-values, effect sizes).

---

## 4. Literature Review and Evidence Grading

| Study Type | Citation | Key Findings | Evidence Grade |
| :--- | :--- | :--- | :--- |
| **RCT (Primary)** | Strålin et al. (2025) *Frontiers in Psychiatry* | N=108. CADDI vs. DBT-based protocol. Significant improvement in behavioral activation (BADS-SF, p=0.045, d=0.49). | **A- (Strong)** |
| **Feasibility** | Strålin et al. (2022) *Nordic Journal of Psychiatry* | High acceptability; protocol feasible for group delivery in adult clinical settings. | **B (Moderate)** |
| **Qualitative** | Strålin et al. (2024) *PLOS One* | Participants reported increased awareness of procrastination patterns and value of initiation strategies. | **B (Qualitative)** |

**Synthesis:** The evidence suggests that targeting **activation** is the most effective lever for ADHD-I. While ADHD-Combined (ADHD-C) benefits from impulse control, ADHD-I requires specific "ignition" strategies to overcome the friction of task initiation.

---

## 5. Mechanisms and Theory of Change

### 5.1 The Inattentive Presentation Mechanism
ADHD-I is characterized by a "low-arousal" state and significant deficits in **Task-Directed Attention** and **Prospective Memory**. The "Theory of Change" for CADDI-based interventions rests on three pillars:

1.  **Environmental Externalization:** Shifting the burden from internal working memory to external cues (e.g., Spark's "Anchor" and "Fog Cutter").
2.  **Arousal Modulation:** Using short-duration high-intensity focus periods (e.g., "Ignite" 5-minute timer) to bypass the "initiation wall."
3.  **Behavioral Activation (BA):** Re-linking task completion with reward signals through immediate micro-successes, combating the chronic low motivation and procrastination associated with ADHD-I.

### 5.2 Digital Distractibility
Digital environments present a "Super-Saliency" risk for ADHD-I. The CADDI framework suggests that digital tools must be **minimalist** and **low-friction** to avoid becoming the source of distraction themselves.

---

## 6. Clinical Outcomes and Limitations

### 6.1 Outcomes
- **Reduced Procrastination:** Consistent improvement across Pure Procrastination Scale (PPS) metrics.
- **Improved Life Quality:** Meaningful gains in AAQoL (Adult ADHD Quality of Life) scores.
- **Activation Gains:** Specific improvements in the ability to start and sustain goal-directed activities.

### 6.2 Limitations
- **Power:** The 2025 RCT was slightly underpowered for secondary outcomes.
- **Attrition:** ~21% attrition suggests that maintaining engagement is a challenge—even with specialized CBT.
- **Generalizability:** Most research originates from Nordic clinical settings; broader cross-cultural validation is ongoing.

---

## 7. Product Translation for Spark ADHD

Based on the CADDI framework, Spark ADHD is uniquely positioned to implement these mechanisms digitally.

### 7.1 Requirement Mapping
- **Ignite (The Ignition Mechanism):** Translates CADDI's "Initiation strategies." Must be a 1-click start to minimize friction.
- **Fog Cutter (Task Decomposition):** Translates the "Organizational skills" module. Essential for reducing the cognitive load of "big" tasks.
- **Brain Dump (Cognitive Offload):** Translates "Environmental Externalization." Clears working memory to reduce internal distractibility.
- **Anchor (Self-Regulation):** Addresses the emotional dysregulation/overwhelmed states that often precede task avoidance.

### 7.2 Ethics and Privacy
- **Local-First:** To protect the sensitive nature of ADHD metrics and "Brain Dump" content, Spark ADHD must remain local-first (AsyncStorage/SQLite) with no mandatory cloud sync.
- **AI Transparency:** AI-based sorting (AISortService) must be labeled as **advisory**. The user must remain the final arbiter of task priority.
- **Data Governance:** Alignment with OWASP 2025 and strict secret management is required.

---

## 8. Implementation Roadmap (Phased)

### Phase 1: Core Scaffolding (MVP)
*   **Ignite:** Finalize timer stability and brown noise integration.
*   **Fog Cutter:** Implement persistent micro-stepping storage.
*   **Anchor:** Deploy grounding breathing exercises.

### Phase 2: Behavioral Feedback
*   **Check-In:** Correlate energy levels with successful "Ignite" sessions.
*   **Visual Progress:** Implement CADDI-inspired "Activity Charts" to show behavioral activation over time.

### Phase 3: Advanced AI Scaffolding
*   **AI Sort:** Optional automation for the "Brain Dump," moving from raw list to actionable Fog Cutter micro-steps.

---

## 9. Open Questions and Future Research

1.  **Engagement Duration:** How can the "novelty effect" of a digital tool be sustained to prevent the ~21% attrition seen in clinical trials?
2.  **Passive Monitoring:** Can device usage patterns (digital phenotyping) safely predict "fog" states without violating user privacy?
3.  **Cross-Intervention Synergy:** Does the combination of digital "Ignite" sessions and traditional medication show a synergistic effect on BADS-SF scores?

---

## 10. References

1.  **Strålin, E. E., et al. (2025).** "Cognitive behavioral therapy for ADHD predominantly inattentive presentation: randomized controlled trial of two psychological treatments." *Frontiers in Psychiatry*. DOI: [10.3389/fpsyt.2025.1564506](https://doi.org/10.3389/fpsyt.2025.1564506) | PMC: [PMC12018340](https://pmc.ncbi.nlm.nih.gov/articles/PMC12018340/)
2.  **Strålin, E. E., et al. (2022).** "Cognitive-behavioral group therapy for ADHD predominantly inattentive presentation: A feasibility study." *Nordic Journal of Psychiatry*. DOI: [10.1080/08039488.2022.2061234](https://doi.org/10.1080/08039488.2022.2061234)
3.  **Strålin, E. E., et al. (2024).** "Clients' perceptions of group CBT for ADHD inattentive presentation." *PLOS One*. PMID: [38905212](https://pubmed.ncbi.nlm.nih.gov/38905212/)
4.  **Benedetto, L., et al. (2024).** "Smartphone Distraction Scale (SDS) and ADHD Traits." *Int J Environ Res Public Health*. DOI: [10.3390/ijerph21040386](https://doi.org/10.3390/ijerph21040386) | PMC: [PMC11050649](https://pmc.ncbi.nlm.nih.gov/articles/PMC11050649/)
5.  **ClinicalTrials.gov.** NCT04090983: "Cognitive Behavioral Therapy for ADHD, Predominantly Inattentive Presentation (CADDI)." [URL](https://clinicaltrials.gov/ct2/show/NCT04090983)

## 11. Ingested Local Source Addendum (2026-02-16)

This addendum records direct ingestion of newly exported local documents and clarifies how each source should influence Spark ADHD product decisions. It separates peer-reviewed evidence from strategy memos/grey literature.

### 11.1 Source Reliability Matrix

| Local file | Source type | Reliability tier | What it should influence in Spark |
| :--- | :--- | :--- | :--- |
| `docs/fpsyt-16-1564506.pdf` | Peer-reviewed RCT (Frontiers in Psychiatry) | **Tier A** | Core CADDI claims, treatment targeting, outcome priors, engagement-risk assumptions |
| `docs/ADHD_Adults_1.pdf` | Peer-reviewed review article (SAJP) | **Tier B** | Adult-ADHD context, intervention breadth, caution on subtype tailoring |
| `docs/cbtadhd.pdf` | Clinical treatment manual/book material | **Tier B/C** | Practical CBT technique design, implementation language, psychoeducation framing |
| `docs/1303)The Adult ADHD Tool Kit Using CBT to Facilitate Coping Inside and Out (J. Russell Ramsay, Anthony L. Rostain) .md` | Extracted handbook text | **Tier C** | Task implementation tactics, externalization patterns, coping prompts |
| `docs/Building ADHD App with CADDI Protocol.docx` | Internal strategy/architecture memo | **Tier C** | Product architecture hypotheses, UX proposals, engineering prioritization |
| `docs/ADHD Study Framework Development_.docx` | Internal framework memo | **Tier C** | Academic/executive-function framing, planning heuristics, study-support pattern ideas |

### 11.2 Per-Document Ingestion Summary

1. **`docs/fpsyt-16-1564506.pdf` (Frontiers RCT; Tier A)**
   - Confirms CADDI as a CBT protocol targeting ADHD predominantly inattentive presentation.
   - Confirms pragmatic multicenter randomized design and registry linkage (**NCT04090983**).
   - Confirms reported primary-outcome advantage for behavioral activation at post-assessment (**p = .045, d = 0.49**).
   - Confirms notable engagement pressure: attrition reported at **21.3%** in pandemic-affected treatment conditions.
   - Product implication: prioritize low-friction activation workflows (single-action starts, short initiation loops, high-clarity next steps), and instrument adherence/retention by design.

2. **`docs/ADHD_Adults_1.pdf` (Review article; Tier B)**
   - Reinforces adult ADHD heterogeneity and the practical need to tailor intervention targets by presentation and impairment profile.
   - Supports combining pharmacologic and psychosocial interventions depending on context and patient fit.
   - Product implication: preserve modular intervention surface (Ignite, Fog Cutter, Brain Dump, Anchor) rather than one rigid flow.

3. **`docs/cbtadhd.pdf` (CBT manual content; Tier B/C)**
   - Emphasizes structure, implementation support, and explicit coping skills for adults with ADHD.
   - Supports concrete behavioral workflows and optional social supports in intervention delivery.
   - Product implication: keep prompts actionable, behavior-first, and implementation-oriented rather than insight-only content.

4. **`docs/1303)...Tool Kit... .md` (Handbook extract; Tier C)**
   - Strongly emphasizes ADHD as a performance/execution problem (not knowledge deficit), with externalized reminders and point-of-performance supports.
   - Repeatedly stresses turning intentions into actions through tangible micro-steps.
   - Product implication: double down on external memory aids, short checklists, and friction-reduced "do next" interactions.

5. **`docs/Building ADHD App with CADDI Protocol.docx` (Internal blueprint; Tier C)**
   - Contains architecture proposals that map CADDI to digital components (activation, decomposition, cognitive offload).
   - Useful for implementation planning, but claims are strategy-level and should not be treated as standalone clinical evidence.
   - Product implication: use as an engineering planning artifact only after cross-checking against Tier A/B sources.

6. **`docs/ADHD Study Framework Development_.docx` (Internal framework; Tier C)**
   - Provides broad executive-function framing and postgraduate-study adaptation ideas.
   - Useful as contextual design input for planning/organization features, not as trial-grade evidence.
   - Product implication: applicable to UX copy and scaffolding choices; avoid elevating to efficacy claims.

### 11.3 What Changed in Requirements After Ingestion

- **Requirement R1 (Evidence core):** CADDI efficacy claims in product/marketing copy must be limited to source-supported statements from the Frontiers RCT and registry context.
- **Requirement R2 (Retention by design):** Since attrition remains meaningful even in structured treatment, Spark must include explicit retention mechanics (streak recovery, re-entry flows, low-shame restart prompts).
- **Requirement R3 (Subtype-aware workflows):** Default workflows should prioritize initiation and activation support for inattentive profiles; impulse-control mechanics remain optional modules.
- **Requirement R4 (Evidence labels):** In-app educational content should label claim strength (e.g., "trial-supported", "clinical practice", "framework hypothesis") to avoid evidence inflation.
- **Requirement R5 (Governance):** Internal strategy docs can guide roadmap decisions but cannot be cited as clinical proof.

### 11.4 Caveats and Evidence Boundaries

- The strongest local evidence remains one major peer-reviewed CADDI RCT source; secondary outcomes and external validity should be interpreted cautiously.
- Internal `.docx` strategy/framework documents are valuable for product synthesis but are grey literature and may include non-validated assumptions.
- Manual/handbook sources are practice-informing and mechanistically useful, but they do not substitute for randomized comparative outcome evidence.
- This addendum does not supersede formal external references in Section 10; it augments traceability for repository-local research artifacts.

### 11.5 Supplementary Local Artifacts (Ingested)

- `docs/Building ADHD App with CADDI Protocol.docx`
- `docs/fpsyt-16-1564506.pdf`
- `docs/cbtadhd.pdf`
- `docs/ADHD_Adults_1.pdf`
- `docs/ADHD Study Framework Development_.docx`
- `docs/1303)The Adult ADHD Tool Kit Using CBT to Facilitate Coping Inside and Out (J. Russell Ramsay, Anthony L. Rostain) .md`

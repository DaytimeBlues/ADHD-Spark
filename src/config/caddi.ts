export type CaddiEvidenceTier = 'A' | 'B' | 'C';

export type CaddiClaimStrength =
  | 'trial-supported'
  | 'practice-informed'
  | 'hypothesis';

export type CaddiSourceType =
  | 'rct'
  | 'qualitative'
  | 'registry'
  | 'review'
  | 'manual'
  | 'internal';

export type CaddiEvidenceSource = {
  id: string;
  label: string;
  title: string;
  tier: CaddiEvidenceTier;
  sourceType: CaddiSourceType;
  claimStrength: CaddiClaimStrength;
  url: string;
};

export type CaddiRequirement = {
  id: string;
  title: string;
  rationale: string;
  sourceIds: string[];
};

export const CADDI_OVERVIEW = {
  title: 'WHAT IS CADDI?',
  badge: 'EVIDENCE-BASED',
  description:
    'CBT for ADHD-Inattentive (CADDI) is a specialized protocol targeting initiation paralysis and focus. It shifts from impulse control to behavioral activation.',
  bullets: ['RCT PROVEN (2025)', 'INATTENTIVE FOCUSED', 'ACTIVATION BASED'],
} as const;

export const CADDI_SOURCES: CaddiEvidenceSource[] = [
  {
    id: 'caddi-rct-2025',
    label: 'RCT STUDY',
    title:
      'Cognitive behavioral therapy for ADHD predominantly inattentive presentation: randomized controlled trial of two psychological treatments',
    tier: 'A',
    sourceType: 'rct',
    claimStrength: 'trial-supported',
    url: 'https://doi.org/10.3389/fpsyt.2025.1564506',
  },
  {
    id: 'caddi-qual-2024',
    label: 'QUALITATIVE',
    title: "Clients' perceptions of group CBT for ADHD inattentive presentation",
    tier: 'B',
    sourceType: 'qualitative',
    claimStrength: 'practice-informed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38905212/',
  },
  {
    id: 'caddi-registry',
    label: 'REGISTRY',
    title: 'ClinicalTrials.gov registry record for CADDI trial (NCT04090983)',
    tier: 'A',
    sourceType: 'registry',
    claimStrength: 'trial-supported',
    url: 'https://clinicaltrials.gov/ct2/show/NCT04090983',
  },
];

export const CADDI_REQUIREMENTS: CaddiRequirement[] = [
  {
    id: 'R1',
    title: 'Evidence-bounded claims',
    rationale:
      'Any user-facing CADDI claim must map to a source and claim-strength label.',
    sourceIds: ['caddi-rct-2025', 'caddi-registry'],
  },
  {
    id: 'R2',
    title: 'Activation-first interaction model',
    rationale:
      'Prioritize initiation support for inattentive presentation over impulse-control-first designs.',
    sourceIds: ['caddi-rct-2025', 'caddi-qual-2024'],
  },
  {
    id: 'R3',
    title: 'Retention-aware workflows',
    rationale:
      'Design re-entry and low-friction restart pathways due to observed treatment attrition risk.',
    sourceIds: ['caddi-rct-2025'],
  },
];

export const getCaddiSourceById = (
  id: string,
): CaddiEvidenceSource | undefined => {
  return CADDI_SOURCES.find((source) => source.id === id);
};

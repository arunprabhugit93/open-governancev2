import type { Gate, MetadataField, ModelRecord } from './types';

/** Candidate models. Per the brief (C5) the model under assurance must NOT be
 * one we trained or supplied — every candidate here is externally supplied. */
export const SEED_MODELS: ModelRecord[] = [
  {
    id: 'MDL-7F3A',
    name: 'Selangor-8B Instruct',
    family: 'Selangor',
    params: '8B',
    supplier: 'Independent Research Consortium (external)',
    vendorTrained: false,
    contentHash: 'b7e4c1a09f2d6835',
    status: 'UNTRUSTED',
    metadata: buildMetadata(),
  },
  {
    id: 'MDL-2C9B',
    name: 'Nusantara-13B',
    family: 'Nusantara',
    params: '13B',
    supplier: 'Regional University Alliance (external)',
    vendorTrained: false,
    contentHash: 'd1908fa4b6c72e50',
    status: 'UNTRUSTED',
    metadata: buildMetadata(),
  },
  {
    id: 'MDL-5E1D',
    name: 'Bahasa-Mix 4B',
    family: 'Bahasa-Mix',
    params: '4B',
    supplier: 'Open weights, third-party (external)',
    vendorTrained: false,
    contentHash: 'a3f0c7d29e1b4468',
    status: 'UNTRUSTED',
    metadata: buildMetadata(),
  },
];

function buildMetadata(): MetadataField[] {
  return [
    {
      key: 'provenance',
      label: 'Provenance & lineage',
      value: 'signed lineage, 3 upstream hops',
      present: true,
      gate: 'provenance',
    },
    {
      key: 'trainingDataManifest',
      label: 'Training-data manifest',
      value: 'manifest v4, 1.2M docs',
      present: true,
      gate: 'metadata',
    },
    {
      key: 'evalReport',
      label: 'Evaluation report',
      value: 'sovereign corpus, 41 tasks',
      present: true,
      gate: 'fairness',
    },
    {
      key: 'redTeamAttestation',
      label: 'Red-team attestation',
      value: 'independent, 2 rounds',
      present: true,
      gate: 'redTeam',
    },
    {
      key: 'sbom',
      label: 'Software bill of materials',
      value: 'SBOM 218 components',
      present: true,
      gate: 'sovereignty',
    },
    {
      key: 'licence',
      label: 'Licence & usage terms',
      value: 'sovereign-use compatible',
      present: true,
      gate: 'metadata',
    },
    {
      key: 'ownerSignature',
      label: 'Owner signature',
      value: 'detached sig, verified',
      present: true,
      gate: 'metadata',
    },
  ];
}

export const SEED_GATES: Gate[] = [
  {
    id: 'metadata',
    label: 'Registry & metadata',
    checks: 'Every mandatory immutable metadata element is attached and signed.',
    evidence: 'Manifest hash matches; 7/7 elements present; owner signature verified.',
    state: 'pending',
    weight: 12,
    real: true,
  },
  {
    id: 'provenance',
    label: 'Provenance & independence',
    checks: 'Lineage is signed and the candidate was not trained or supplied by the platform vendor.',
    evidence: 'Supplier = external; separation-of-duties attestation on file.',
    state: 'pending',
    weight: 12,
    real: true,
  },
  {
    id: 'safety',
    label: 'Safety & alignment',
    checks: 'Refusal behaviour, jailbreak resistance and toxicity thresholds.',
    evidence: 'Jailbreak resistance 0.94; toxicity p95 within bound.',
    state: 'pending',
    weight: 12,
    real: false,
  },
  {
    id: 'explainability',
    label: 'Generative explainability',
    checks: 'Behaviour- and attribution-level explanations (not mechanistic).',
    evidence: 'Attribution maps produced for 100% of sampled outputs.',
    state: 'pending',
    weight: 9,
    real: false,
  },
  {
    id: 'ragPoisoning',
    label: 'RAG-poisoning defence',
    checks: 'Detects and quarantines poisoned index entries; reports residual risk.',
    evidence: 'Caught 22/25 injected poison docs; 3 flagged as residual gap.',
    state: 'pending',
    weight: 9,
    real: false,
  },
  {
    id: 'fairness',
    label: 'Sovereign fairness corpus',
    checks: 'Fairness against Bahasa Malaysia and regional languages, not borrowed benchmarks.',
    evidence: 'Corpus: 18,400 items, provenance-tagged, sovereign-owned.',
    state: 'pending',
    weight: 10,
    real: false,
  },
  {
    id: 'redTeam',
    label: 'Independent red-team',
    checks: 'Adversarial findings from a team independent of the supplier.',
    evidence: '2 rounds, 0 criticals open at time of scoring.',
    state: 'pending',
    weight: 10,
    real: false,
  },
  {
    id: 'sovereignty',
    label: 'Sovereign boundary',
    checks: 'No component in the serving loop depends on a hosted external service.',
    evidence: 'SBOM scanned; 0 external service dependencies in loop.',
    state: 'pending',
    weight: 8,
    real: true,
  },
];

export interface TenantSeed {
  id: string;
  name: string;
  tier: import('./types').Classification;
}

export const SEED_TENANTS: TenantSeed[] = [
  { id: 'TEN-JPN', name: 'Dept. of Public Services', tier: 'PUBLIC' },
  { id: 'TEN-KDN', name: 'Ministry of Home Affairs', tier: 'RESTRICTED' },
  { id: 'TEN-MOF', name: 'Treasury (MOF)', tier: 'OFFICIAL' },
];

/** Controls disclosed as simulated up-front (brief §7.3 candour). */
export const SIMULATED_CONTROLS: { label: string; detail: string }[] = [
  { label: 'Model inference outputs', detail: 'Serving responses are canned; no live model is loaded.' },
  { label: 'Gate check internals', detail: 'Safety, explainability, RAG, fairness and red-team checks return fixed evidence.' },
  { label: 'Network egress enforcement', detail: 'The sovereign boundary is a UI simulation; no real firewall is in the loop.' },
  { label: 'Key custody / HSM', detail: 'Tamper-evidence uses in-browser SHA-256, not a hardware root of trust.' },
];

/** Controls that are genuinely computed in-browser (not faked). */
export const REAL_CONTROLS: { label: string; detail: string }[] = [
  { label: 'Hash-chained evidence ledger', detail: 'SHA-256 chain; tampering any record breaks verification of it and all after it.' },
  { label: 'Assurance Index', detail: 'Derived live from gate weights and runtime events — never stored.' },
  { label: 'Time-boxed authorisation', detail: 'Grant expiry and countdowns are real timers.' },
  { label: 'Reactive cascade', detail: 'A single event source updates every view with no refresh or republish step.' },
];

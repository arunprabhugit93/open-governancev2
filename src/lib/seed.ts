import type {
  ComplianceClause,
  Gate,
  MetadataField,
  ModelRecord,
  ScopeLineItem,
  SocAlert,
  SovereignZone,
  TelemetryCategory,
} from './types';

/** Candidate models. Per the brief (C5) the model under assurance must NOT be
 * one we trained or supplied — every candidate here is externally supplied.
 * MDL-9A2F is Family F (Agentic AI): per §3.1, a control loop wrapping a
 * Family-A model, so its metadata additionally carries the agent-specific
 * red-team attestation (§3.1 Family F row) rather than the plain LLM one. */
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
    modelFamily: 'A',
    metadata: buildMetadata('A'),
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
    modelFamily: 'A',
    metadata: buildMetadata('A'),
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
    modelFamily: 'A',
    metadata: buildMetadata('A'),
  },
  {
    id: 'MDL-9A2F',
    name: 'Perbendaharaan-Agent v2',
    family: 'Agentic (Family F)',
    params: '8B loop, 6 tools',
    supplier: 'Independent Research Consortium (external)',
    vendorTrained: false,
    contentHash: 'f2c8091ab7d3e654',
    status: 'UNTRUSTED',
    modelFamily: 'F',
    metadata: buildMetadata('F'),
  },
];

function buildMetadata(family: 'A' | 'F'): MetadataField[] {
  return [
    {
      key: 'provenance',
      label: 'Provenance & lineage',
      value: 'signed lineage, 3 upstream hops',
      present: true,
      gate: 'provenanceSupplyChain',
    },
    {
      key: 'trainingDataManifest',
      label: 'Training-data manifest',
      value: 'manifest v4, 1.2M docs, residency-tagged',
      present: true,
      gate: 'dataSovereignty',
    },
    {
      key: 'evalReport',
      label: 'Evaluation report',
      value: 'sovereign corpus, 41 tasks',
      present: true,
      gate: 'fairnessBias',
    },
    {
      key: 'redTeamAttestation',
      label:
        family === 'F' ? 'Agentic red-team attestation (tool-abuse, confused-deputy, sandbox-escape)' : 'Red-team attestation',
      value: family === 'F' ? 'independent, 3 rounds, heaviest weighting per §3.1 Family F' : 'independent, 2 rounds',
      present: true,
      gate: 'robustnessAdversarial',
    },
    {
      key: 'sbom',
      label: 'Software bill of materials',
      value: 'SBOM 218 components, signed & scanned',
      present: true,
      gate: 'provenanceSupplyChain',
    },
    {
      key: 'licence',
      label: 'Licence & usage terms',
      value: 'sovereign-use compatible',
      present: true,
      gate: 'governanceOversight',
    },
    {
      key: 'ownerSignature',
      label: 'Owner signature',
      value: 'detached sig, verified',
      present: true,
      gate: 'governanceOversight',
    },
  ];
}

/** The eight weighted domains of the Sovereign AI Assurance Scorecard
 * (§5.3), reproduced as eight independent gates whose weights sum to 100 —
 * the base weights are the proposal's own, before the family-specific
 * overlays §5.3 describes (robustness raised for LLMs, governance and
 * robustness raised highest for agents). Three gates are marked `real: true`
 * because what they assert is genuinely checkable from state already in this
 * browser (metadata completeness, supplier independence, zero external
 * dependencies observed this session) — the other five stand in for control
 * classes (adversarial testing, fairness corpora, explainability tooling)
 * that need real infrastructure to execute for real, and are disclosed as
 * simulated under Environment Disclosure. */
export const SEED_GATES: Gate[] = [
  {
    id: 'provenanceSupplyChain',
    label: 'Provenance & Supply Chain',
    checks: 'Signed artefact, lineage, SBOM/MBOM, safe-format-only loading; backdoor vetting of third-party foundation models.',
    evidence: 'Lineage verified 3 hops; SBOM 218 components signed; safe-format load policy enforced; no unsigned dependency.',
    state: 'pending',
    weight: 10,
    real: true,
  },
  {
    id: 'functionalSla',
    label: 'Functional & SLA',
    checks: 'Task accuracy and the §12 latency/throughput SLAs — Time to First Token, Inter-Token Latency, Tokens-Per-Second — under load.',
    evidence: 'TTFT 180ms, ITL p95 42ms, 68 TPS — within the bid commitment for this accelerator configuration.',
    state: 'pending',
    weight: 10,
    real: false,
  },
  {
    id: 'fairnessBias',
    label: 'Fairness & Bias',
    checks: 'Demographic fairness and disparate-impact across Bahasa Malaysia, ethnicity and dialect, on a sovereign evaluation corpus.',
    evidence: 'Sovereign corpus: 18,400 items, provenance-tagged. Disparate-impact ratio within bound across all measured groups.',
    state: 'pending',
    weight: 15,
    real: false,
  },
  {
    id: 'robustnessAdversarial',
    label: 'Robustness & Adversarial',
    checks: 'Resistance to jailbreak, prompt-injection, poisoning, extraction, tool-abuse and sandbox-escape — mapped to MITRE ATLAS.',
    evidence: 'Standing red-team: 3 rounds, 0 open Critical/High findings at time of scoring.',
    state: 'pending',
    weight: 20,
    real: false,
  },
  {
    id: 'explainability',
    label: 'Explainability',
    checks: 'Model card, lineage transparency and behaviour-/attribution-level decision explainability (not mechanistic).',
    evidence: 'Attribution maps produced for 100% of sampled outputs; model card complete.',
    state: 'pending',
    weight: 10,
    real: false,
  },
  {
    id: 'securityIp',
    label: 'Security & IP',
    checks: 'Weights HSM-wrapped at rest and signed at load; anti-extraction rate-limiting; per-model RBAC and immutable usage logging.',
    evidence: 'Weights encrypted under HSM-wrapped keys; anti-extraction throttling active; RBAC enforced at the registry.',
    state: 'pending',
    weight: 12,
    real: false,
  },
  {
    id: 'dataSovereignty',
    label: 'Data Sovereignty & Privacy',
    checks: 'Malaysia residency of all data and embeddings; per-tenant government-held keys; conformance to domestic classification policy.',
    evidence: 'SBOM/dependency scan: 0 external service dependencies in the serving loop. Residency verified for training data manifest.',
    state: 'pending',
    weight: 13,
    real: true,
  },
  {
    id: 'governanceOversight',
    label: 'Governance & Oversight',
    checks: 'Registry approval record, immutable audit, ISO/IEC 42001 attestation, human oversight and assurance independence.',
    evidence: 'Manifest hash matches; 7/7 elements present; owner signature verified; supplier independent of platform operator.',
    state: 'pending',
    weight: 10,
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
  { id: 'TEN-MOF', name: 'Treasury (MOF)', tier: 'CONFIDENTIAL' },
];

/** Controls disclosed as simulated up-front — Section 15 "Calibration of
 * Claims" verbatim positions, reproduced so the console's candour matches the
 * proposal's own, rather than a separate and possibly looser POC-only list. */
export const SIMULATED_CONTROLS: { label: string; detail: string }[] = [
  { label: 'Model inference outputs', detail: 'Serving responses are canned; no live model is loaded.' },
  { label: 'Gate check internals', detail: 'Functional/SLA, fairness, robustness, explainability and security/IP gates return fixed evidence, not a live test run.' },
  { label: 'Network egress enforcement', detail: 'The sovereign boundary is a UI simulation; no real firewall is in the loop.' },
  { label: 'Key custody / HSM', detail: 'Tamper-evidence uses in-browser SHA-256, not a hardware root of trust.' },
  { label: 'Generative explainability (§15)', detail: 'Behaviour- and attribution-level only, not mechanistic — advanced interpretability is an optional capability for curated models, never a platform-wide gate.' },
  { label: 'RAG-poisoning defence (§15)', detail: 'A defence-in-depth assembly of emerging open-source tooling and research-backed signals — the literature is unsettled, and the claim is calibrated accordingly.' },
  { label: 'Autonomous SOC investigation (§10.2)', detail: 'Agent reasoning steps in the Investigation view are scripted for the demonstration; the real platform runs 40+ agents on a local cybersecurity model.' },
];

/** Controls that are genuinely computed in-browser (not faked). */
export const REAL_CONTROLS: { label: string; detail: string }[] = [
  { label: 'Hash-chained evidence ledger', detail: 'SHA-256 chain; tampering any record breaks verification of it and all after it.' },
  { label: 'Sovereign AI Assurance Index', detail: 'Derived live from the eight scorecard domain weights and runtime events — never stored.' },
  { label: 'Time-boxed authorisation', detail: 'Grant expiry and countdowns are real timers.' },
  { label: 'Reactive cascade', detail: 'A single event source updates every view with no refresh or republish step.' },
];

/* ------------------------------------------------------------------ *
 * Security Operations Centre seed data (§10)
 * ------------------------------------------------------------------ */

export const SEED_ZONES: SovereignZone[] = [
  { id: 'ZONE-A', name: 'Central Ministries Zone', agencyExample: 'e.g. Dept. of Public Services', telemetrySources: 86 },
  { id: 'ZONE-B', name: 'State Agencies Zone', agencyExample: 'e.g. state statutory bodies', telemetrySources: 64 },
  { id: 'ZONE-C', name: 'Critical Infrastructure Zone', agencyExample: 'e.g. utilities & transport', telemetrySources: 58 },
  { id: 'ZONE-D', name: 'Healthcare & Statutory Bodies Zone', agencyExample: 'e.g. public healthcare network', telemetrySources: 47 },
];

/** §10.4's own list of what the telemetry fabric collects, condensed to the
 * categories that read well as a chart without losing the source language:
 * "platform and management control planes, network fabric and security
 * devices, compute, storage and Kubernetes, power and cooling telemetry, the
 * AI platform and data lake, applications and APIs, identity systems and
 * edge clouds". */
export const SEED_TELEMETRY: TelemetryCategory[] = [
  { label: 'Platform & control planes', sources: 58 },
  { label: 'Network fabric & security devices', sources: 47 },
  { label: 'Compute, storage & Kubernetes', sources: 41 },
  { label: 'AI platform & data lake', sources: 36 },
  { label: 'Applications & APIs', sources: 29 },
  { label: 'Identity systems', sources: 24 },
  { label: 'Power, cooling & edge clouds', sources: 20 },
];

export const HEADLINE_STATS = {
  soc: '24×7×365',
  telemetrySources: '250+',
  investigationAgents: '40+',
  investigationCycle: '60–120s',
  retentionMonths: '12-month immutable',
  monitoringAvailability: '99.99%',
};

export const FEATURED_ALERT_ID = 'ALR-6631';

export const SEED_ALERTS: SocAlert[] = [
  {
    id: FEATURED_ALERT_ID,
    ts: Date.now() - 1000 * 60 * 6,
    zoneId: 'ZONE-C',
    severity: 'high',
    detectionType: 'UEBA — anomalous access pattern, correlated with call-home indicator',
    title: 'Off-hours bulk export from a treasury-tier service account',
    detail:
      'A service account with treasury-tier access initiated a bulk data export outside its established access baseline, 03:14 local time. Outbound traffic to an unregistered external endpoint was observed in the same window.',
    status: 'new',
    sovereigntyCritical: true,
  },
  {
    id: 'ALR-6598',
    ts: Date.now() - 1000 * 60 * 41,
    zoneId: 'ZONE-A',
    severity: 'medium',
    detectionType: 'Signature match — known C2 beacon',
    title: 'Outbound beacon pattern matched to a known C2 signature',
    detail: 'Endpoint telemetry from a ministry workstation matched a known command-and-control beacon signature on watch-list update 2026-07-27.',
    status: 'resolved',
  },
  {
    id: 'ALR-6544',
    ts: Date.now() - 1000 * 60 * 130,
    zoneId: 'ZONE-D',
    severity: 'low',
    detectionType: 'Policy — unsanctioned model endpoint',
    title: 'Unsanctioned third-party model endpoint observed in egress logs',
    detail: 'A clinical workstation attempted to reach an unregistered external inference endpoint. Blocked at the sovereign boundary.',
    status: 'resolved',
  },
];

/** The six contractual scope line items (§2.2) plus the SOC (§2.2 adds it as
 * a seventh row) — the solution map, stated word-for-word as the agreement's
 * own section headings so an evaluator can check it against their own copy. */
export const SCOPE_LINE_ITEMS: ScopeLineItem[] = [
  { id: 'security', index: 1, label: 'AI Security', detail: 'IP & system protection, runtime guardrails, agentic tool-use security, RAG integrity, LLM–DB containment.', route: '/gates' },
  { id: 'testing', index: 2, label: 'AI Testing', detail: 'Automated validation battery, drift monitoring, the Sovereign AI Assurance Scorecard.', route: '/gates' },
  { id: 'governance', index: 3, label: 'AI Governance', detail: 'Registry-gated lifecycle, nine-step onboarding, ISO/IEC 42001 AIMS.', route: '/registry' },
  { id: 'compliance', index: 4, label: 'Regulatory Compliance', detail: 'ISO/IEC & NIST alignment, independent certification, audit independence.', route: '/compliance' },
  { id: 'observability', index: 5, label: 'AI Observability', detail: 'TTFT / ITL / TPS / RPS monitoring, per model, accelerator and tenant.', route: '/overview' },
  { id: 'dashboards', index: 6, label: 'AI Governance Dashboards', detail: 'Live read-out of the same machinery that produces every verdict — no separate reporting layer.', route: '/overview' },
  { id: 'soc', index: 7, label: 'Security Operations Centre (SIEM)', detail: '24×7×365 sovereign SOC, autonomous investigation, governed SOAR response.', route: '/investigation' },
];

/** §7.1 (standards & domestic instruments) and §10.9 (Tab 17 §8 coverage),
 * reproduced with the proposal's own coverage language. `evidenceActions` is
 * what the Compliance view checks against the live ledger — a clause is
 * shown as evidenced THIS SESSION only if a matching action has actually
 * been recorded, never as a static claim. */
export const COMPLIANCE_CLAUSES: ComplianceClause[] = [
  {
    id: 'ISO/IEC 42001',
    title: 'AI Management System',
    requirement: 'A documented, audited AI management system.',
    delivered: 'Sovereign model registry + approval workflows + immutable audit as the AIMS system of record.',
    evidenceActions: ['GATE_PASSED', 'MODEL_SCORED'],
  },
  {
    id: 'ISO/IEC 23894',
    title: 'AI risk management',
    requirement: 'A documented model-risk register with sign-off gates.',
    delivered: 'Red-team findings and drift signals feed the risk register live.',
    evidenceActions: ['RUNTIME_EVENT', 'ATO_REVOKED'],
  },
  {
    id: 'ISO/IEC 5338',
    title: 'AI system lifecycle',
    requirement: 'A defined lifecycle process from intake to retirement.',
    delivered: 'The eight-stage registry-gated lifecycle is the lifecycle process.',
    evidenceActions: ['MODEL_ARRIVED', 'GATE_PASSED', 'ATO_ISSUED'],
  },
  {
    id: 'NIST AI RMF',
    title: 'Govern – Map – Measure – Manage',
    requirement: 'Coverage of all four RMF functions.',
    delivered: 'Governance wrapper (Govern), registry lineage (Map), test battery & SLAs (Measure), red-team & quarantine (Manage).',
    evidenceActions: ['GATE_PASSED', 'ATO_REVOKED', 'PROMOTION_REFUSED'],
  },
  {
    id: '§7.4',
    title: 'AI model governance',
    requirement: 'Assessment and approval before deployment; certification.',
    delivered: 'No model is authorised to serve a tenant until every mandatory gate has passed and an ATO has been issued.',
    evidenceActions: ['MODEL_SCORED', 'ATO_ISSUED'],
  },
  {
    id: '§11.1',
    title: 'Security testing & validation',
    requirement: 'Continuous testing, SLAs, tamper-evident evidence.',
    delivered: 'Independent red-team findings recompute live authorisation; the ledger is SHA-256 hash-chained and tamper-evident.',
    evidenceActions: ['RUNTIME_EVENT', 'ATO_REVOKED', 'RECORD_TAMPERED'],
  },
  {
    id: 'Tab 19 §6/§13',
    title: 'Compliance reporting',
    requirement: 'Posture dashboards and structured governance reporting.',
    delivered: 'The Overview and Command Centre dashboards are live read-outs of the same engine — not a separate reporting layer.',
    evidenceActions: ['EVIDENCE_EXPORTED'],
  },
  {
    id: 'Tab 17 §8.1',
    title: '24×7 SOC',
    requirement: 'Continuous monitoring, detection and response.',
    delivered: 'Sovereign 24×7×365 SOC on the AI-driven SIEM, independent of the platform NOC.',
    evidenceActions: ['ALERT_RAISED', 'DETECTION_FIRED'],
  },
  {
    id: 'Tab 17 §8.2',
    title: 'SIEM with SOAR & UEBA',
    requirement: 'Correlation, behavioural analytics and automated incident response.',
    delivered: 'Alerts are raised from behavioural correlation and walked to a governed SOAR response — auto for low risk, approval-gated for high impact.',
    evidenceActions: ['DETECTION_FIRED', 'SOAR_ACTION_APPROVED', 'SOAR_ACTION_AUTO'],
  },
  {
    id: 'Tab 17 §8.4',
    title: 'Centralised log management',
    requirement: 'Redundant storage across the telemetry fabric.',
    delivered: '250+ source types, 12-month immutable online retention.',
    evidenceActions: ['ALERT_RAISED'],
  },
  {
    id: 'Tab 17 §8.5–8.6',
    title: 'Incident response',
    requirement: 'Severity-classified response against documented SLAs.',
    delivered: 'Every investigation step and response decision for an alert is recorded in the same tamper-evident ledger used for model governance.',
    evidenceActions: ['INVESTIGATION_STEP', 'VERDICT_ISSUED'],
  },
];

/* Domain model for the NSAIC Assurance Console.
 *
 * Terminology, weights and thresholds below are drawn directly from the
 * technical proposal ("The AI Assurance Stack") for Tender
 * MCMC/NSAICO(01)/CLOUD/TC/05/2026 — specifically the Sovereign AI Assurance
 * Scorecard (§5.3), the registry-gated model lifecycle (§6.1), the nine-step
 * onboarding workflow (§6.2), and the autonomous SOC investigation loop
 * (§10.2, §10.9). Where a number or label appears in that document, it is
 * reproduced exactly rather than approximated — an evaluator who has read
 * their own tender should never see this console disagree with it.
 */

export type Phase =
  | 'arrival'
  | 'refusal'
  | 'passage'
  | 'authorisation'
  | 'service'
  | 'turn'
  | 'loss'
  | 'evidence';

/** The tender's four classification tiers (§5.3). "Public / Internal" and
 * "Secret / Top-Secret" are compound in the source; kept single-word here so
 * every existing generic call-site (tables, buttons, matrix headers) still
 * renders a correct, if shorter, label. CLASSIFICATION_LABEL below carries
 * the full compound name for headers that want it. */
export type Classification = 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED' | 'SECRET';

export const CLASSIFICATIONS: Classification[] = ['PUBLIC', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET'];

export const CLASSIFICATION_LABEL: Record<Classification, string> = {
  PUBLIC: 'Public / Internal',
  CONFIDENTIAL: 'Confidential',
  RESTRICTED: 'Restricted',
  SECRET: 'Secret / Top-Secret',
};

/** Minimum Sovereign AI Assurance Index required to APPROVE at each tier.
 * Exact values from the proposal's decision table (§5.3):
 *   Public/Internal ≥60 · Confidential ≥70 · Restricted ≥80 · Secret ≥90 */
export const TIER_THRESHOLD: Record<Classification, number> = {
  PUBLIC: 60,
  CONFIDENTIAL: 70,
  RESTRICTED: 80,
  SECRET: 90,
};

/** Floor of the "approve with conditions" band — below this, reject outright.
 * From the same decision table: Public 45–59 · Confidential 55–69 ·
 * Restricted 70–79 · Secret 85–89. A score in [CONDITIONAL_FLOOR, TIER_THRESHOLD)
 * is a conditional pass (restricted scope + remediation plan), not a refusal. */
export const CONDITIONAL_FLOOR: Record<Classification, number> = {
  PUBLIC: 45,
  CONFIDENTIAL: 55,
  RESTRICTED: 70,
  SECRET: 85,
};

export type MetadataKey =
  | 'provenance'
  | 'trainingDataManifest'
  | 'evalReport'
  | 'redTeamAttestation'
  | 'sbom'
  | 'licence'
  | 'ownerSignature';

export interface MetadataField {
  key: MetadataKey;
  label: string;
  value: string;
  /** Present = the immutable metadata element is attached to the model. */
  present: boolean;
  /** Which mandatory gate refuses promotion when this element is missing (C2). */
  gate: GateId;
}

export interface ModelRecord {
  id: string;
  name: string;
  family: string;
  params: string;
  /** Who supplied it. Independence (C5): must NOT be vendor-trained. */
  supplier: string;
  vendorTrained: boolean;
  contentHash: string;
  status: 'UNTRUSTED' | 'IN_ASSURANCE' | 'REFUSED' | 'SCORED' | 'AUTHORISED' | 'REVOKED';
  metadata: MetadataField[];
  /** Which of the six governed model families (§3.1) this candidate belongs
   * to. Every family in this POC is Family A (Generative LLM) or Family F
   * (Agentic AI) — the two families the tender's own worked examples centre
   * on — but the field exists so a real deployment's other four families
   * (B Diffusion, C Perception, D Classical/Predictive, E Embedding) slot in
   * without a model shape change. */
  modelFamily: ModelFamily;
}

export type ModelFamily = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const MODEL_FAMILY_LABEL: Record<ModelFamily, string> = {
  A: 'Generative LLM',
  B: 'Generative Diffusion',
  C: 'Discriminative Perception',
  D: 'Classical & Predictive ML',
  E: 'Embedding & Retrieval',
  F: 'Agentic AI',
};

/** The eight weighted domains of the Sovereign AI Assurance Scorecard
 * (§5.3), each now its own gate — a direct 1:1 reproduction of the proposal's
 * scoring table rather than an earlier four-bucket simplification. Weights
 * sum to 100. */
export type GateId =
  | 'provenanceSupplyChain'
  | 'functionalSla'
  | 'fairnessBias'
  | 'robustnessAdversarial'
  | 'explainability'
  | 'securityIp'
  | 'dataSovereignty'
  | 'governanceOversight';

export type GateState = 'pending' | 'running' | 'pass' | 'fail' | 'blocked';

export interface Gate {
  id: GateId;
  label: string;
  /** One-line description of what the gate checks. */
  checks: string;
  /** Human-readable evidence the gate produced when it ran. */
  evidence: string;
  state: GateState;
  /** Contribution to the Assurance Index when passing — the scorecard's own
   * base weight for this domain (§5.3), not an arbitrary POC number. */
  weight: number;
  /** If false, the gate is a simulated control (disclosed up-front). */
  real: boolean;
}

export type GrantStatus = 'AUTHORISED' | 'CONDITIONAL' | 'REFUSED' | 'REVOKED' | 'EXPIRED';

export interface Grant {
  id: string;
  tenantId: string;
  tenantName: string;
  tier: Classification;
  status: GrantStatus;
  issuedAt: number;
  /** Time-boxed ATO — epoch ms when authorisation lapses. */
  expiresAt: number;
  indexAtIssue: number;
  reason?: string;
}

export type EgressVerdict = 'INTERNAL' | 'BLOCKED';

export interface EgressEvent {
  id: string;
  ts: number;
  source: string;
  target: string;
  verdict: EgressVerdict;
  note: string;
}

export type LedgerAction =
  | 'SESSION_OPENED'
  | 'MODEL_ARRIVED'
  | 'METADATA_REMOVED'
  | 'PROMOTION_REFUSED'
  | 'BYPASS_ATTEMPT_BLOCKED'
  | 'GATE_PASSED'
  | 'MODEL_SCORED'
  | 'ATO_ISSUED'
  | 'ATO_REFUSED'
  | 'PROMPT_INJECTION_BLOCKED'
  | 'CONTROL_PLANE_BLOCKED'
  | 'RUNTIME_EVENT'
  | 'ATO_REVOKED'
  | 'EGRESS_BLOCKED'
  | 'EVIDENCE_EXPORTED'
  | 'RECORD_TAMPERED'
  // --- Security Operations Centre (§10) — same ledger, same chain. An
  // incident's evidence sits beside a model's assurance evidence because the
  // proposal treats both as one AI Assurance Stack, not two products.
  | 'ALERT_RAISED'
  | 'DETECTION_FIRED'
  | 'INVESTIGATION_STEP'
  | 'VERDICT_ISSUED'
  | 'SOAR_ACTION_AUTO'
  | 'SOAR_ACTION_APPROVED'
  | 'SOAR_ACTION_DENIED';

export interface LedgerEntry {
  seq: number;
  ts: number;
  actor: string;
  action: LedgerAction;
  summary: string;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
  /** Set true when a record has been altered after being written (C7 demo). */
  tampered?: boolean;
}

export type RuntimeEventKind = 'redTeamFinding' | 'drift' | 'expiry';

export interface RuntimeEvent {
  id: string;
  ts: number;
  kind: RuntimeEventKind;
  label: string;
  /** How much the event knocks off the Assurance Index. */
  indexDelta: number;
}

export interface AssuranceIndex {
  score: number;
  subscores: { label: string; value: number }[];
  computedAt: number;
}

/* ------------------------------------------------------------------ *
 * Security Operations Centre — §10. "Two witnessed demonstrations"
 * close the stand-up phase (§12.1): a model taken through onboarding to
 * authorisation (the console's original eight phases), and a simulated
 * security incident driven through detection, investigation, approval and
 * response. Everything below exists for the second demonstration.
 * ------------------------------------------------------------------ */

export type ZonePosture = 'green' | 'amber' | 'red';

export interface SovereignZone {
  id: string;
  name: string;
  agencyExample: string;
  /** Contributing source count toward the platform-wide 250+ headline. */
  telemetrySources: number;
}

export interface TelemetryCategory {
  label: string;
  sources: number;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'new' | 'investigating' | 'verdict' | 'resolved';

export interface SocAlert {
  id: string;
  ts: number;
  zoneId: string;
  severity: AlertSeverity;
  /** The correlation/UEBA content that fired (§10.3). */
  detectionType: string;
  title: string;
  detail: string;
  status: AlertStatus;
  /** True for the standing sovereignty use-case (§10.3): call-home traffic,
   * backdoor connections to foreign endpoints, unencrypted log egress — any
   * such signal is escalated as a critical incident regardless of the
   * detector's own severity. */
  sovereigntyCritical?: boolean;
}

/** The six-stage closed loop, reproduced exactly from §10.2:
 * ingest → detect → investigate → enrich → decide → respond. */
export type InvestigationStage = 'ingest' | 'detect' | 'investigate' | 'enrich' | 'decide' | 'respond';

export interface InvestigationStep {
  stage: InvestigationStage;
  label: string;
  detail: string;
  ts: number;
}

/** §10.2: "a verdict of threat, suspicious, or benign" — the proposal's own
 * three-way outcome, not a numeric risk tier. */
export type VerdictOutcome = 'threat' | 'suspicious' | 'benign';

export interface Verdict {
  alertId: string;
  outcome: VerdictOutcome;
  /** 0-100 integer. Never a float — see canonical() in hash.ts. */
  confidence: number;
  rationale: string[];
  attackPatterns: string[];
}

/** §4.5's blast-radius dimensions, evaluated before a state-changing response
 * commits: scope, value, system reach, irreversibility, velocity, privilege. */
export interface BlastRadius {
  scope: string;
  value: string;
  systemReach: string;
  irreversibility: 'reversible' | 'compensable' | 'irreversible';
  velocity: string;
  privilege: string;
}

export type SoarDecision = 'auto' | 'require_approval' | 'approved' | 'denied';

export interface SoarAction {
  alertId: string;
  action: string;
  decision: SoarDecision;
  approvedBy?: string;
  blastRadius?: BlastRadius;
}

/* ------------------------------------------------------------------ *
 * Compliance mapping — §7.1 (standards & domestic instruments) and §10.9
 * (Tab 17 §8 coverage). Status is DELIBERATELY not stored here: the
 * Compliance view derives it live from whether the ledger actually contains
 * the evidence action(s) a clause depends on, the same "derived, not
 * asserted" discipline the rest of the console holds itself to (C6).
 * ------------------------------------------------------------------ */

export interface ComplianceClause {
  id: string;
  title: string;
  requirement: string;
  delivered: string;
  /** Ledger actions whose presence in THIS session is the live evidence. */
  evidenceActions: LedgerAction[];
}

/** The six contractual scope line items (§2.2) plus the SOC, stated
 * word-for-word as the agreement's own section headings — the solution map
 * an evaluator can check against their own copy of the tender. */
export interface ScopeLineItem {
  id: string;
  index: number;
  label: string;
  detail: string;
  route: string;
}

/* Domain model for the NSAIC Assurance Console. */

export type Phase =
  | 'arrival'
  | 'refusal'
  | 'passage'
  | 'authorisation'
  | 'service'
  | 'turn'
  | 'loss'
  | 'evidence';

export type Classification = 'PUBLIC' | 'OFFICIAL' | 'RESTRICTED' | 'SECRET';

export const CLASSIFICATIONS: Classification[] = ['PUBLIC', 'OFFICIAL', 'RESTRICTED', 'SECRET'];

/** Minimum Assurance Index required to authorise a model at each tier (C4). */
export const TIER_THRESHOLD: Record<Classification, number> = {
  PUBLIC: 62,
  OFFICIAL: 74,
  RESTRICTED: 86,
  SECRET: 94,
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
}

export type GateId =
  | 'metadata'
  | 'provenance'
  | 'safety'
  | 'explainability'
  | 'ragPoisoning'
  | 'fairness'
  | 'redTeam'
  | 'sovereignty';

export type GateState = 'pending' | 'running' | 'pass' | 'fail' | 'blocked';

export interface Gate {
  id: GateId;
  label: string;
  /** One-line description of what the gate checks. */
  checks: string;
  /** Human-readable evidence the gate produced when it ran. */
  evidence: string;
  state: GateState;
  /** Contribution to the Assurance Index when passing. */
  weight: number;
  /** If false, the gate is a simulated control (disclosed up-front). */
  real: boolean;
}

export type GrantStatus = 'AUTHORISED' | 'REFUSED' | 'REVOKED' | 'EXPIRED';

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
  | 'RECORD_TAMPERED';

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

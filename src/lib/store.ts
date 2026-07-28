import { create } from 'zustand';
import { chainHash, GENESIS_HASH } from './hash';
import { computeIndex, RUNTIME_EVENT_META } from './engine';
import {
  SEED_GATES,
  SEED_MODELS,
  SEED_TENANTS,
} from './seed';
import {
  CLASSIFICATIONS,
  TIER_THRESHOLD,
  type Classification,
  type EgressEvent,
  type Gate,
  type Grant,
  type LedgerAction,
  type LedgerEntry,
  type MetadataKey,
  type ModelRecord,
  type Phase,
  type RuntimeEvent,
  type RuntimeEventKind,
} from './types';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

/** Derives the active model from state. Kept as a plain function (not a state
 * getter) so it always reflects the current models array — a getter would be
 * flattened to a stale value the first time set() spreads state. */
export function activeModelOf(s: {
  models: ModelRecord[];
  activeModelId: string | null;
}): ModelRecord | null {
  return s.models.find((m) => m.id === s.activeModelId) ?? null;
}

/** Serialises async ledger appends so the hash chain is never raced. */
let chainLock: Promise<unknown> = Promise.resolve();

interface AppendArgs {
  actor: string;
  action: LedgerAction;
  summary: string;
  payload?: Record<string, unknown>;
}

export interface EngineState {
  session: { id: string; startedAt: number };
  phase: Phase;
  models: ModelRecord[];
  activeModelId: string | null;
  gates: Gate[];
  grants: Grant[];
  egress: EgressEvent[];
  ledger: LedgerEntry[];
  events: RuntimeEvent[];
  /** True once a revocation has happened with no operator action (C3 proof). */
  lastRevocationUnassisted: boolean;
  booted: boolean;

  // lifecycle
  boot: () => Promise<void>;
  resetSession: () => Promise<void>;
  setPhase: (p: Phase) => void;
  selectModel: (id: string) => void;

  // refusal / passage
  removeMetadata: (key: MetadataKey) => Promise<void>;
  restoreMetadata: (key: MetadataKey) => void;
  completeModel: () => void;
  attemptBypass: (route: string) => Promise<void>;
  runGates: () => Promise<void>;

  // authorisation
  issueGrant: (tenantId: string, tier: Classification) => Promise<Grant>;

  // service
  attemptControlPlane: () => Promise<void>;
  attemptPromptInjection: () => Promise<void>;
  testEgress: (target: string) => Promise<void>;

  // the turn / loss
  injectRuntimeEvent: (kind: RuntimeEventKind) => Promise<void>;
  tick: () => void;

  // evidence
  appendLedger: (a: AppendArgs) => Promise<void>;
  tamperRecord: (seq: number, newSummary: string) => void;
  verifyLedger: () => Promise<number[]>;
  exportEvidence: () => Promise<string>;
}

function freshGates(): Gate[] {
  return clone(SEED_GATES);
}
function freshModels(): ModelRecord[] {
  return clone(SEED_MODELS);
}

export const useEngine = create<EngineState>((set, get) => ({
  session: { id: `SES-${uid()}`, startedAt: Date.now() },
  phase: 'arrival',
  models: freshModels(),
  activeModelId: null,
  gates: freshGates(),
  grants: [],
  egress: [],
  ledger: [],
  events: [],
  lastRevocationUnassisted: false,
  booted: false,

  boot: async () => {
    if (get().booted) return;
    set({ booted: true });
    // Seed a few internal, in-boundary flows so the egress monitor is alive.
    const now = Date.now();
    set({
      egress: [
        { id: uid(), ts: now - 4200, source: 'serving-node-a', target: 'registry.internal', verdict: 'INTERNAL', note: 'model artefact pull' },
        { id: uid(), ts: now - 2600, source: 'gatekeeper', target: 'evidence-ledger.internal', verdict: 'INTERNAL', note: 'audit append' },
        { id: uid(), ts: now - 900, source: 'tenant-gw', target: 'inference.internal', verdict: 'INTERNAL', note: 'inference request' },
      ],
    });
    await get().appendLedger({
      actor: 'system',
      action: 'SESSION_OPENED',
      summary: `Assurance session ${get().session.id} opened`,
      payload: { tenants: SEED_TENANTS.map((t) => t.id) },
    });
  },

  resetSession: async () => {
    chainLock = Promise.resolve();
    set({
      session: { id: `SES-${uid()}`, startedAt: Date.now() },
      phase: 'arrival',
      models: freshModels(),
      activeModelId: null,
      gates: freshGates(),
      grants: [],
      egress: [],
      ledger: [],
      events: [],
      lastRevocationUnassisted: false,
      booted: false,
    });
    await get().boot();
  },

  setPhase: (p) => set({ phase: p }),

  selectModel: (id) => {
    set((s) => ({
      activeModelId: id,
      models: s.models.map((m) =>
        m.id === id ? { ...m, status: 'IN_ASSURANCE' } : m
      ),
    }));
    const m = get().models.find((x) => x.id === id);
    void get().appendLedger({
      actor: 'evaluator',
      action: 'MODEL_ARRIVED',
      summary: `Model ${m?.name} nominated for assurance — not yet trusted`,
      payload: { modelId: id, supplier: m?.supplier, vendorTrained: m?.vendorTrained },
    });
  },

  removeMetadata: async (key) => {
    const model = activeModelOf(get());
    if (!model) return;
    const field = model.metadata.find((f) => f.key === key);
    set((s) => ({
      models: s.models.map((m) =>
        m.id === model.id
          ? {
              ...m,
              status: 'REFUSED',
              metadata: m.metadata.map((f) =>
                f.key === key ? { ...f, present: false } : f
              ),
            }
          : m
      ),
      gates: s.gates.map((g) =>
        g.id === field?.gate ? { ...g, state: 'fail' } : g
      ),
      phase: 'refusal',
    }));
    await get().appendLedger({
      actor: 'evaluator',
      action: 'METADATA_REMOVED',
      summary: `Evaluator removed "${field?.label}" from ${model.name}`,
      payload: { modelId: model.id, element: key },
    });
    await get().appendLedger({
      actor: 'gatekeeper',
      action: 'PROMOTION_REFUSED',
      summary: `Promotion refused — mandatory element "${field?.label}" is missing`,
      payload: { modelId: model.id, failedGate: field?.gate, element: key },
    });
  },

  restoreMetadata: (key) => {
    const model = activeModelOf(get());
    if (!model) return;
    const field = model.metadata.find((f) => f.key === key);
    set((s) => ({
      models: s.models.map((m) =>
        m.id === model.id
          ? {
              ...m,
              metadata: m.metadata.map((f) =>
                f.key === key ? { ...f, present: true } : f
              ),
            }
          : m
      ),
      gates: s.gates.map((g) =>
        g.id === field?.gate ? { ...g, state: 'pending' } : g
      ),
    }));
  },

  completeModel: () => {
    const model = activeModelOf(get());
    if (!model) return;
    set((s) => ({
      models: s.models.map((m) =>
        m.id === model.id
          ? {
              ...m,
              status: 'IN_ASSURANCE',
              metadata: m.metadata.map((f) => ({ ...f, present: true })),
            }
          : m
      ),
      gates: freshGates(),
    }));
  },

  attemptBypass: async (route) => {
    await get().appendLedger({
      actor: 'evaluator',
      action: 'BYPASS_ATTEMPT_BLOCKED',
      summary: `Bypass attempt blocked — "${route}" does not pass the registry gate`,
      payload: { route, result: 'BLOCKED' },
    });
  },

  runGates: async () => {
    const model = activeModelOf(get());
    if (!model) return;
    const anyMissing = model.metadata.some((f) => !f.present);
    if (anyMissing) return;

    // Run gates sequentially so the board visibly fills in.
    const gates = get().gates;
    for (const g of gates) {
      set((s) => ({
        gates: s.gates.map((x) => (x.id === g.id ? { ...x, state: 'running' } : x)),
      }));
      await delay(180);
      set((s) => ({
        gates: s.gates.map((x) => (x.id === g.id ? { ...x, state: 'pass' } : x)),
      }));
      await get().appendLedger({
        actor: 'gatekeeper',
        action: 'GATE_PASSED',
        summary: `Gate passed — ${g.label}`,
        payload: { gate: g.id, evidence: g.evidence, real: g.real },
      });
    }
    const idx = computeIndex(get().gates, get().events);
    set((s) => ({
      models: s.models.map((m) =>
        m.id === model.id ? { ...m, status: 'SCORED' } : m
      ),
      phase: 'passage',
    }));
    await get().appendLedger({
      actor: 'gatekeeper',
      action: 'MODEL_SCORED',
      summary: `${model.name} scored — Assurance Index ${idx.score}`,
      payload: { modelId: model.id, index: idx.score },
    });
  },

  issueGrant: async (tenantId, tier) => {
    const model = activeModelOf(get());
    const tenant = SEED_TENANTS.find((t) => t.id === tenantId)!;
    const idx = computeIndex(get().gates, get().events);
    const threshold = TIER_THRESHOLD[tier];
    const authorised = idx.score >= threshold && model?.status === 'SCORED';

    const grant: Grant = {
      id: `ATO-${uid()}`,
      tenantId,
      tenantName: tenant.name,
      tier,
      status: authorised ? 'AUTHORISED' : 'REFUSED',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 120, // 2-minute time-box for demo visibility
      indexAtIssue: idx.score,
      reason: authorised
        ? undefined
        : `Index ${idx.score} below ${tier} threshold ${threshold}`,
    };
    set((s) => ({ grants: [grant, ...s.grants] }));
    await get().appendLedger({
      actor: 'gatekeeper',
      action: authorised ? 'ATO_ISSUED' : 'ATO_REFUSED',
      summary: authorised
        ? `ATO issued — ${tenant.name} @ ${tier} (expires in 120s)`
        : `ATO refused — ${tenant.name} @ ${tier}: index ${idx.score} < ${threshold}`,
      payload: { grantId: grant.id, tenantId, tier, index: idx.score, threshold },
    });
    if (authorised) set({ phase: 'authorisation' });
    return grant;
  },

  attemptControlPlane: async () => {
    await get().appendLedger({
      actor: 'tenant',
      action: 'CONTROL_PLANE_BLOCKED',
      summary: 'Tenant-side attempt to reach the control plane was blocked',
      payload: { from: 'tenant-gw', to: 'control-plane', result: 'BLOCKED' },
    });
  },

  attemptPromptInjection: async () => {
    await get().appendLedger({
      actor: 'tenant',
      action: 'PROMPT_INJECTION_BLOCKED',
      summary: 'Prompt-injection attempt detected and neutralised at the serving guard',
      payload: { pattern: 'ignore-previous-instructions', result: 'BLOCKED' },
    });
  },

  testEgress: async (target) => {
    const ev: EgressEvent = {
      id: uid(),
      ts: Date.now(),
      source: 'inference.internal',
      target,
      verdict: 'BLOCKED',
      note: 'external destination — refused at sovereign boundary',
    };
    set((s) => ({ egress: [ev, ...s.egress] }));
    await get().appendLedger({
      actor: 'boundary',
      action: 'EGRESS_BLOCKED',
      summary: `Egress to ${target} blocked at the sovereign boundary`,
      payload: { target, result: 'BLOCKED' },
    });
  },

  injectRuntimeEvent: async (kind) => {
    const meta = RUNTIME_EVENT_META[kind];
    const event: RuntimeEvent = {
      id: uid(),
      ts: Date.now(),
      kind,
      label: meta.label,
      indexDelta: meta.indexDelta,
    };
    set((s) => ({ events: [...s.events, event], phase: 'turn' }));
    await get().appendLedger({
      actor: 'runtime',
      action: 'RUNTIME_EVENT',
      summary: `Runtime event introduced — ${meta.label}`,
      payload: { kind, indexDelta: meta.indexDelta },
    });

    // THE CASCADE. No operator action beyond introducing the event: the engine
    // recomputes the index and revokes any grant whose tier can no longer be
    // supported. This is claim C3 (unassisted, live) + C6 (dashboard follows).
    const idx = computeIndex(get().gates, get().events);
    const revoked: Grant[] = [];
    set((s) => ({
      grants: s.grants.map((g) => {
        if (g.status !== 'AUTHORISED') return g;
        const expired = kind === 'expiry';
        const belowThreshold = idx.score < TIER_THRESHOLD[g.tier];
        if (expired || belowThreshold) {
          const next: Grant = {
            ...g,
            status: expired ? 'EXPIRED' : 'REVOKED',
            reason: meta.label,
          };
          revoked.push(next);
          return next;
        }
        return g;
      }),
    }));

    for (const g of revoked) {
      await get().appendLedger({
        actor: 'gatekeeper',
        action: 'ATO_REVOKED',
        summary: `Authorisation ${g.status.toLowerCase()} — ${g.tenantName} @ ${g.tier} (trigger: ${meta.label})`,
        payload: { grantId: g.id, tenantId: g.tenantId, tier: g.tier, trigger: kind, unassisted: true },
      });
    }
    set({ lastRevocationUnassisted: revoked.length > 0, phase: 'loss' });
  },

  tick: () => {
    const now = Date.now();
    const expiring = get().grants.filter(
      (g) => g.status === 'AUTHORISED' && g.expiresAt <= now
    );
    if (expiring.length === 0) return;
    set((s) => ({
      grants: s.grants.map((g) =>
        g.status === 'AUTHORISED' && g.expiresAt <= now
          ? { ...g, status: 'EXPIRED', reason: 'time-box lapsed' }
          : g
      ),
      lastRevocationUnassisted: true,
    }));
    for (const g of expiring) {
      void get().appendLedger({
        actor: 'gatekeeper',
        action: 'ATO_REVOKED',
        summary: `Authorisation expired — ${g.tenantName} @ ${g.tier} (time-box lapsed)`,
        payload: { grantId: g.id, tenantId: g.tenantId, unassisted: true },
      });
    }
  },

  appendLedger: async ({ actor, action, summary, payload = {} }) => {
    chainLock = chainLock.then(async () => {
      const ledger = get().ledger;
      const prev = ledger.length ? ledger[ledger.length - 1] : null;
      const prevHash = prev ? prev.hash : GENESIS_HASH;
      const seq = ledger.length;
      const ts = Date.now();
      const body = { seq, ts, actor, action, summary, payload };
      const hash = await chainHash(prevHash, body);
      const entry: LedgerEntry = { ...body, prevHash, hash };
      set((s) => ({ ledger: [...s.ledger, entry] }));
    });
    await chainLock;
  },

  tamperRecord: (seq, newSummary) => {
    // Deliberately mutate content WITHOUT recomputing the hash. Verification
    // will now detect the mismatch — the record's stored hash no longer matches
    // its content, and every subsequent record's chain is broken too (C7).
    set((s) => ({
      ledger: s.ledger.map((e) =>
        e.seq === seq
          ? { ...e, summary: newSummary, tampered: true, payload: { ...e.payload, tamperedField: 'summary' } }
          : e
      ),
    }));
  },

  verifyLedger: async () => {
    const ledger = get().ledger;
    const broken: number[] = [];
    let prevHash = GENESIS_HASH;
    for (const e of ledger) {
      const body = {
        seq: e.seq,
        ts: e.ts,
        actor: e.actor,
        action: e.action,
        summary: e.summary,
        payload: e.payload,
      };
      const recomputed = await chainHash(prevHash, body);
      if (recomputed !== e.hash) broken.push(e.seq);
      // Propagate the RECOMPUTED hash (not the stored one) so a single altered
      // record cascades: every record sealed after it also fails verification.
      prevHash = recomputed;
    }
    return broken;
  },

  exportEvidence: async () => {
    const s = get();
    const idx = computeIndex(s.gates, s.events);
    const bundle = {
      session: s.session,
      exportedAt: Date.now(),
      model: activeModelOf(s),
      assuranceIndex: idx,
      gates: s.gates,
      grants: s.grants,
      runtimeEvents: s.events,
      egress: s.egress,
      ledger: s.ledger,
    };
    await get().appendLedger({
      actor: 'evaluator',
      action: 'EVIDENCE_EXPORTED',
      summary: 'Full session evidence bundle exported and sealed',
      payload: { records: s.ledger.length + 1 },
    });
    set({ phase: 'evidence' });
    return JSON.stringify(bundle, null, 2);
  },
}));

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export { CLASSIFICATIONS, TIER_THRESHOLD, SEED_TENANTS };

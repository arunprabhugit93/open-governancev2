import type { AssuranceIndex, Gate, RuntimeEvent } from './types';

/**
 * The Sovereign AI Assurance Index (§5.3) is DERIVED, never stored. Every view
 * computes it from the same gate state + runtime events, which is exactly the
 * property claim C6 asks us to prove: the dashboard is a read-out of the
 * machinery, not a separate reporting layer that can drift.
 *
 * Each of the eight gates IS a scorecard domain now (§5.3's own table), so
 * the subscore for a domain is simply that gate's own pass/fail read as a
 * percentage of its weight — there is no grouping step left to get wrong.
 * A gate that has not yet run reports 0, not blank: an un-run domain has no
 * evidence, and "no evidence" and "0%" should look the same, not different.
 */
export function computeIndex(gates: Gate[], events: RuntimeEvent[]): AssuranceIndex {
  const totalWeight = gates.reduce((sum, g) => sum + g.weight, 0) || 1;
  const base = gates
    .filter((g) => g.state === 'pass')
    .reduce((sum, g) => sum + g.weight, 0);
  const penalty = events.reduce((sum, e) => sum + e.indexDelta, 0);
  // Score is the weighted pass-rate scaled to 0-100 against the FULL scorecard
  // weight (100 across the eight domains), then reduced by runtime penalties —
  // matching §5.3's own "0-100 Sovereign AI Assurance Index" framing exactly.
  const score = clamp(Math.round((base / totalWeight) * 100) - penalty, 0, 100);

  const subscores = gates.map((g) => ({
    label: g.label,
    value: g.state === 'pass' ? 100 : 0,
  }));

  return { score, subscores, computedAt: Date.now() };
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const RUNTIME_EVENT_META: Record<
  RuntimeEvent['kind'],
  { label: string; indexDelta: number; blurb: string }
> = {
  redTeamFinding: {
    label: 'New red-team finding lands',
    indexDelta: 26,
    blurb: 'An independent red-team files a critical finding against the live model.',
  },
  drift: {
    label: 'Model drift detected',
    indexDelta: 24,
    blurb: 'Live monitoring detects behavioural drift beyond the authorised envelope.',
  },
  expiry: {
    label: 'Authorisation time-box expires',
    indexDelta: 0,
    blurb: 'The ATO reaches the end of its time-box. Renewal is not automatic.',
  },
};

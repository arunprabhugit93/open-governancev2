import type { AssuranceIndex, Gate, RuntimeEvent } from './types';

/**
 * The Assurance Index is DERIVED, never stored. Every view computes it from the
 * same gate state + runtime events, which is exactly the property claim C6 asks
 * us to prove: the dashboard is a read-out of the machinery, not a separate
 * reporting layer that can drift.
 */
export function computeIndex(gates: Gate[], events: RuntimeEvent[]): AssuranceIndex {
  const base = gates
    .filter((g) => g.state === 'pass')
    .reduce((sum, g) => sum + g.weight, 0);
  const penalty = events.reduce((sum, e) => sum + e.indexDelta, 0);
  const score = clamp(base - penalty, 0, 100);

  const domains: { label: string; ids: Gate['id'][] }[] = [
    { label: 'Enforcement', ids: ['metadata', 'provenance'] },
    { label: 'Safety', ids: ['safety', 'explainability', 'redTeam'] },
    { label: 'Robustness', ids: ['ragPoisoning', 'fairness'] },
    { label: 'Sovereignty', ids: ['sovereignty'] },
  ];

  const subscores = domains.map((d) => {
    const inDomain = gates.filter((g) => d.ids.includes(g.id));
    const max = inDomain.reduce((s, g) => s + g.weight, 0) || 1;
    const got = inDomain
      .filter((g) => g.state === 'pass')
      .reduce((s, g) => s + g.weight, 0);
    return { label: d.label, value: Math.round((got / max) * 100) };
  });

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

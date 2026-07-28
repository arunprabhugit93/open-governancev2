import type { Phase } from './types';

export interface PhaseMeta {
  id: Phase;
  index: number;
  label: string;
  /** What the buyer does during this phase (from the brief's sequence table). */
  evaluatorDoes: string;
  /** Which console view is most relevant. */
  route: string;
}

export const PHASES: PhaseMeta[] = [
  { id: 'arrival', index: 1, label: 'Arrival', evaluatorDoes: 'Choose the model from a list, or supply one. It is not yet trusted.', route: '/registry' },
  { id: 'refusal', index: 2, label: 'Refusal', evaluatorDoes: 'Choose what to remove. Then attempt promotion by other routes.', route: '/gates' },
  { id: 'passage', index: 3, label: 'Passage', evaluatorDoes: 'Ask what each gate checked and what evidence it produced.', route: '/gates' },
  { id: 'authorisation', index: 4, label: 'Authorisation', evaluatorDoes: 'Request the same model at a higher classification tier — expect refusal.', route: '/authorisation' },
  { id: 'service', index: 5, label: 'Service', evaluatorDoes: 'Attempt the control plane from the tenant side. Attempt a prompt injection.', route: '/serving' },
  { id: 'turn', index: 6, label: 'The Turn', evaluatorDoes: 'Introduce an event — a finding, drift, or expiry. Do not say which in advance.', route: '/authorisation' },
  { id: 'loss', index: 7, label: 'Loss', evaluatorDoes: "Watch the governance view and our team's hands. No keyboard may be touched.", route: '/authorisation' },
  { id: 'evidence', index: 8, label: 'Evidence', evaluatorDoes: 'Select a record to be tampered with, and confirm the tamper is detected.', route: '/ledger' },
];

export function phaseMeta(p: Phase): PhaseMeta {
  return PHASES.find((x) => x.id === p) ?? PHASES[0];
}

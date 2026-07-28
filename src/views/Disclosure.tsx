import { CheckCircle2, FlaskConical, Scale } from 'lucide-react';
import { SIMULATED_CONTROLS, REAL_CONTROLS } from '@/lib/seed';
import { Card, CardHeader, Badge, Mono } from '@/components/ui/primitives';
import { PageHeader, ClaimRef } from '@/components/ui/status';

const CLAIMS: { id: string; claim: string; proof: string }[] = [
  { id: 'C1', claim: 'Assurance is a gate, not a report — no bypass route to serving.', proof: 'Gate Board blocks an incomplete model; every bypass attempt is refused.' },
  { id: 'C2', claim: 'Immutable metadata; the gate refuses promotion if any is missing.', proof: 'Remove any element → the matching gate fails naming it; records are append-only.' },
  { id: 'C3', claim: 'Authorisation is live and renewable; recomputed on drift/data/finding; time-boxed.', proof: 'A runtime event revokes a live grant unassisted; every grant counts down.' },
  { id: 'C4', claim: 'Thresholds rise with sensitivity — safe for Public, refused for Restricted.', proof: 'Same evidence, two tiers, two outcomes on the authorisation matrix.' },
  { id: 'C5', claim: 'The assurance function is independent — a vendor cannot score its own model.', proof: 'Every candidate is externally supplied; provenance badge makes it explicit.' },
  { id: 'C6', claim: 'Dashboards are a live read-out — no separate reporting layer.', proof: 'Every dashboard figure is derived from the same engine, updating with no refresh.' },
  { id: 'C7', claim: 'The audit log is tamper-evident.', proof: 'Real SHA-256 chain; tampering any record breaks its verification and all after it.' },
  { id: 'C8', claim: 'Everything stays inside the sovereign boundary.', proof: 'Egress monitor shows all flows internal; external calls refused at the boundary.' },
];

const SCORING: { criterion: string; weight: string; verified: string }[] = [
  { criterion: 'Authorisation changes in response to a runtime event, unassisted', weight: '30%', verified: 'C3 · turn + loss' },
  { criterion: 'Enforcement holds against attempts we choose', weight: '25%', verified: 'C1, C2 · refusal + unscripted' },
  { criterion: 'Evidence chain is continuous and tamper-evident', weight: '20%', verified: 'C7 · evidence' },
  { criterion: 'Authorisation is scoped, not binary', weight: '10%', verified: 'C4 · authorisation' },
  { criterion: 'Sovereignty holds under observation', weight: '10%', verified: 'C8 · throughout' },
  { criterion: 'Candour about limitations', weight: '5%', verified: 'this page' },
];

export function Disclosure() {
  return (
    <div>
      <PageHeader
        title="Environment Disclosure"
        subtitle="Stated before the session, not when challenged. What is genuinely computed, what is simulated, and how each proposal claim maps to an observable behaviour in this console."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Genuinely computed in-browser"
            subtitle="not faked — you can inspect the behaviour"
            right={<Badge tone="pass"><CheckCircle2 className="mr-1 h-3 w-3" />real</Badge>}
          />
          <div className="divide-y divide-border">
            {REAL_CONTROLS.map((c) => (
              <div key={c.label} className="flex gap-3 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pass" />
                <div>
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="text-xs text-muted">{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Simulated in this POC"
            subtitle="unavailable pre-award, or out of scope for a UI build"
            right={<Badge tone="warn"><FlaskConical className="mr-1 h-3 w-3" />simulated</Badge>}
          />
          <div className="divide-y divide-border">
            {SIMULATED_CONTROLS.map((c) => (
              <div key={c.label} className="flex gap-3 px-4 py-3">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                <div>
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="text-xs text-muted">{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Claims → observable behaviour" subtitle="each claim from the proposal, and where you can watch it happen" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint">
                <th className="px-4 py-2">Claim</th>
                <th className="px-4 py-2">Property</th>
                <th className="px-4 py-2">Where it is proven</th>
              </tr>
            </thead>
            <tbody>
              {CLAIMS.map((c) => (
                <tr key={c.id} className="border-b border-border/60 align-top">
                  <td className="px-4 py-2.5"><ClaimRef id={c.id} /></td>
                  <td className="px-4 py-2.5 text-xs">{c.claim}</td>
                  <td className="px-4 py-2.5 text-xs text-muted">{c.proof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader
          title="How this is scored"
          subtitle="the buyer's weighting — the console leads with the heaviest behaviours"
          right={<Scale className="h-4 w-4 text-primary" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint">
                <th className="px-4 py-2">Criterion</th>
                <th className="px-4 py-2">Weight</th>
                <th className="px-4 py-2">Verified by</th>
              </tr>
            </thead>
            <tbody>
              {SCORING.map((s) => (
                <tr key={s.criterion} className="border-b border-border/60">
                  <td className="px-4 py-2.5 text-xs">{s.criterion}</td>
                  <td className="px-4 py-2.5"><Mono className="font-semibold text-primary">{s.weight}</Mono></td>
                  <td className="px-4 py-2.5 text-xs text-muted">{s.verified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

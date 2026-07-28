import { useMemo, useState } from 'react';
import { CheckCircle2, CircleDashed, ClipboardCheck, ExternalLink } from 'lucide-react';
import { useEngine } from '@/lib/store';
import { COMPLIANCE_CLAUSES } from '@/lib/seed';
import { Card, CardHeader, Badge, Mono, StatTile } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';
import type { LedgerEntry } from '@/lib/types';
import { cn } from '@/lib/cn';

/** A clause is "evidenced this session" only if the ledger genuinely
 * contains a matching action — never asserted statically. This is the same
 * discipline the Assurance Index holds itself to (C6): a dashboard is a
 * read-out of the machinery, not a separate claim layered on top of it. */
function evidenceFor(ledger: LedgerEntry[], actions: string[]): LedgerEntry[] {
  return ledger.filter((e) => actions.includes(e.action));
}

export function Compliance() {
  const ledger = useEngine((s) => s.ledger);
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      COMPLIANCE_CLAUSES.map((c) => ({
        clause: c,
        evidence: evidenceFor(ledger, c.evidenceActions),
      })),
    [ledger]
  );
  const evidencedCount = rows.filter((r) => r.evidence.length > 0).length;

  return (
    <div>
      <PageHeader
        title="Compliance Evidence & Dashboards"
        subtitle="§7.1 standards & domestic alignment, §10.9 Tab 17 §8 coverage. Status below is DERIVED from this session's ledger, not asserted — a clause with no matching entry says so, and coverage is reported as a count, never a percentage."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Clauses tracked" value={rows.length} tone="primary" />
        <StatTile label="Evidenced this session" value={evidencedCount} tone={evidencedCount ? 'pass' : 'neutral'} />
        <StatTile
          label="Awaiting evidence"
          value={rows.length - evidencedCount}
          tone={rows.length - evidencedCount ? 'warn' : 'pass'}
          sub="run the demonstration to populate"
        />
      </div>

      <Card>
        <CardHeader
          title="Clause-by-clause coverage"
          subtitle="click a row to see the exact ledger entries that evidence it"
          right={<ClipboardCheck className="h-4 w-4 text-primary" />}
        />
        <div className="divide-y divide-border">
          {rows.map(({ clause, evidence }) => {
            const evidenced = evidence.length > 0;
            const isOpen = open === clause.id;
            return (
              <div key={clause.id}>
                <button
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2"
                  onClick={() => setOpen(isOpen ? null : clause.id)}
                >
                  {evidenced ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pass" />
                  ) : (
                    <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Mono className="text-[11px] text-primary">{clause.id}</Mono>
                      <span className="text-sm font-medium">{clause.title}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{clause.requirement}</div>
                  </div>
                  <Badge tone={evidenced ? 'pass' : 'neutral'}>
                    {evidenced ? `${evidence.length} record${evidence.length === 1 ? '' : 's'}` : 'not yet evidenced'}
                  </Badge>
                </button>
                {isOpen && (
                  <div className="border-t border-border bg-surface-2/40 px-4 py-3">
                    <div className="mb-2 text-[11px] uppercase tracking-wide text-faint">Delivered by</div>
                    <p className="mb-3 text-xs">{clause.delivered}</p>
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-faint">
                      Live evidence ({evidence.length})
                    </div>
                    {evidence.length === 0 ? (
                      <p className="text-xs text-muted">
                        No matching ledger entry yet this session — this is an honest gap, not a hidden one.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {evidence.slice(-6).reverse().map((e) => (
                          <div key={e.seq} className={cn('flex items-center gap-2 rounded-md px-2 py-1', 'bg-surface')}>
                            <ExternalLink className="h-3 w-3 shrink-0 text-faint" />
                            <span className="flex-1 truncate text-[11px]">{e.summary}</span>
                            <Mono className="text-[10px] text-faint">#{e.seq}</Mono>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <p className="mt-3 text-xs text-muted">
        Every report on this page is generated from the immutable log and reproducible on demand (§9) — open the Evidence Ledger to verify the chain directly.
      </p>
    </div>
  );
}

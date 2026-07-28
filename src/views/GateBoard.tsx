import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ShieldCheck, Ban, ArrowRight } from 'lucide-react';
import { useEngine, activeModelOf } from '@/lib/store';
import { Card, CardHeader, Badge, Button, Mono } from '@/components/ui/primitives';
import { PageHeader, GateStateIcon } from '@/components/ui/status';
import { cn } from '@/lib/cn';

export function GateBoard() {
  const gates = useEngine((s) => s.gates);
  const model = useEngine((s) => activeModelOf(s));
  const runGates = useEngine((s) => s.runGates);
  const completeModel = useEngine((s) => s.completeModel);
  const ledger = useEngine((s) => s.ledger);
  const [open, setOpen] = useState<string | null>(null);

  const failed = gates.find((g) => g.state === 'fail');
  const allPass = model && gates.every((g) => g.state === 'pass');
  const bypassLog = ledger.filter(
    (e) => e.action === 'BYPASS_ATTEMPT_BLOCKED' || e.action === 'PROMOTION_REFUSED'
  );

  return (
    <div>
      <PageHeader
        title="Assurance Gate Battery"
        subtitle="Assurance is enforced as a gate, not a report. No model reaches a government tenant until every mandatory gate has passed. There is no second route."
        claims={['C1', 'C2']}
      />

      {/* Status banner */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            {failed ? (
              <Badge tone="fail" icon={<Ban className="h-3 w-3" />}>PROMOTION REFUSED</Badge>
            ) : allPass ? (
              <Badge tone="pass" icon={<ShieldCheck className="h-3 w-3" />}>ALL GATES PASSED · SCORED</Badge>
            ) : (
              <Badge tone="neutral">AWAITING RUN</Badge>
            )}
            <span className="text-sm text-muted">
              {failed
                ? `Blocked at "${failed.label}" — a mandatory element is missing.`
                : model
                  ? `${model.name} in assurance`
                  : 'No model nominated'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" tone="neutral" onClick={completeModel} disabled={!model}>
              Restore all metadata
            </Button>
            <Button size="sm" tone="primary" onClick={() => void runGates()} disabled={!model}>
              Run gates
            </Button>
          </div>
        </div>
      </Card>

      {/* Gate grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {gates.map((g) => (
          <motion.div key={g.id} layout>
            <Card
              className={cn(
                g.state === 'fail' && 'ring-1 ring-fail/40',
                g.state === 'pass' && 'ring-1 ring-pass/25'
              )}
            >
              <button
                className="flex w-full items-center gap-3 p-3.5 text-left"
                onClick={() => setOpen(open === g.id ? null : g.id)}
              >
                <GateStateIcon state={g.state} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{g.label}</span>
                    {!g.real && <Badge tone="warn">simulated</Badge>}
                  </div>
                  <div className="truncate text-xs text-muted">{g.checks}</div>
                </div>
                <span className="font-mono text-[11px] text-faint">w{g.weight}</span>
                <ChevronDown
                  className={cn('h-4 w-4 text-faint transition-transform', open === g.id && 'rotate-180')}
                />
              </button>
              {open === g.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="overflow-hidden border-t border-border px-3.5 py-3"
                >
                  <div className="text-[11px] uppercase tracking-wide text-faint">Evidence produced</div>
                  <div className="mt-1 rounded-md border border-border bg-surface-2 px-2.5 py-2 text-xs">
                    {g.state === 'pass' ? g.evidence : g.state === 'fail' ? 'Gate failed — no passing evidence. Promotion refused.' : 'Not yet run.'}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bypass / refusal log */}
      <Card className="mt-4">
        <CardHeader
          title="Enforcement log"
          subtitle="every refusal and bypass attempt — the registry is the only route to serving"
        />
        <div className="p-2">
          {bypassLog.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted">
              No refusals yet. Remove a metadata element or attempt a bypass from Evaluator Control.
            </div>
          ) : (
            [...bypassLog].reverse().map((e) => (
              <div key={e.seq} className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-surface-2">
                <Ban className="h-3.5 w-3.5 shrink-0 text-fail" />
                <span className="flex-1 text-xs">{e.summary}</span>
                <ArrowRight className="h-3 w-3 text-faint" />
                <Mono className="text-[10px] text-faint">#{e.seq}</Mono>
              </div>
            ))
          )}
        </div>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        Bypass routes attempted from Evaluator Control are refused here — a second route would mean the registry is neither the single gate nor the evidence spine.
      </p>
    </div>
  );
}

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldCheck, KeyRound, ScrollText, Network } from 'lucide-react';
import { useEngine, activeModelOf } from '@/lib/store';
import { computeIndex } from '@/lib/engine';
import { AssuranceGauge } from '@/components/AssuranceGauge';
import { AuthMatrix } from '@/components/AuthMatrix';
import { Card, CardHeader, LivePill, StatTile, Mono, Badge } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';

export function Dashboard() {
  const gates = useEngine((s) => s.gates);
  const events = useEngine((s) => s.events);
  const grants = useEngine((s) => s.grants);
  const ledger = useEngine((s) => s.ledger);
  const egress = useEngine((s) => s.egress);
  const model = useEngine((s) => activeModelOf(s));

  // Everything on this page is DERIVED from the same store the rest of the
  // console mutates. There is no separate reporting layer to fall out of sync.
  const index = useMemo(() => computeIndex(gates, events), [gates, events]);

  const authorised = grants.filter((g) => g.status === 'AUTHORISED').length;
  const revoked = grants.filter((g) => g.status === 'REVOKED' || g.status === 'EXPIRED').length;
  const blocked = egress.filter((e) => e.verdict === 'BLOCKED').length;

  return (
    <div>
      <PageHeader
        title="Assurance Overview"
        subtitle="Demonstration 1 of 2 (§12.1): a candidate model taken end-to-end through onboarding, validation, scoring and authorisation. Every figure here is derived from the same engine that gates models — no republish step, no separate reporting layer."
        claims={['C6']}
        right={<LivePill />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Assurance Index" subtitle="derived · recomputed on every event" right={<LivePill />} />
          <div className="flex flex-col items-center gap-4 p-5">
            <AssuranceGauge score={index.score} />
            <div className="grid w-full grid-cols-2 gap-2">
              {index.subscores.map((s) => (
                <div key={s.label} className="rounded-md border border-border bg-surface-2 px-2.5 py-1.5">
                  <div className="text-[10px] uppercase tracking-wide text-faint">{s.label}</div>
                  <div className="text-sm font-semibold tabular">{s.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Active ATOs" value={authorised} tone="pass" sub="scoped & time-boxed" />
            <StatTile label="Revoked / expired" value={revoked} tone={revoked ? 'fail' : 'neutral'} sub="this session" />
            <StatTile label="Evidence records" value={ledger.length} tone="primary" sub="hash-chained" />
            <StatTile label="Egress blocked" value={blocked} tone={blocked ? 'warn' : 'neutral'} sub="at boundary" />
          </div>

          <Card>
            <CardHeader
              title="Authorisation map"
              subtitle="tenant × classification — scoped, not global"
              right={<Badge tone="primary" icon={<KeyRound className="h-3 w-3" />}>C4</Badge>}
            />
            <div className="p-3">
              <AuthMatrix compact />
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent evidence events"
            subtitle="live tail of the tamper-evident ledger"
            right={<Badge tone="primary" icon={<ScrollText className="h-3 w-3" />}>C7</Badge>}
          />
          <div className="max-h-72 overflow-y-auto p-2">
            <AnimatePresence initial={false}>
              {[...ledger].slice(-9).reverse().map((e) => (
                <motion.div
                  key={e.seq}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-surface-2"
                >
                  <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs">{e.summary}</div>
                    <Mono className="text-[10px] text-faint">
                      #{e.seq} · {e.actor} · {new Date(e.ts).toLocaleTimeString()}
                    </Mono>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        <Card>
          <CardHeader title="Model under assurance" right={<ShieldCheck className="h-4 w-4 text-primary" />} />
          <div className="space-y-3 p-4">
            {model ? (
              <>
                <div>
                  <div className="text-sm font-semibold">{model.name}</div>
                  <Mono className="text-[11px] text-muted">{model.id} · {model.params}</Mono>
                </div>
                <div className="text-xs text-muted">Supplier</div>
                <div className="text-sm">{model.supplier}</div>
                <Badge tone={model.vendorTrained ? 'fail' : 'pass'}>
                  {model.vendorTrained ? 'vendor-trained — fails C5' : 'externally supplied · independent'}
                </Badge>
              </>
            ) : (
              <p className="text-sm text-muted">No model nominated yet. Open Evaluator Control to begin.</p>
            )}
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-2">
              <Network className="h-4 w-4 text-pass" />
              <span className="text-xs text-muted">
                Sovereign boundary <span className="font-medium text-pass">sealed</span> — {blocked} external attempt{blocked === 1 ? '' : 's'} refused
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

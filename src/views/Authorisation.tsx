import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, HandMetal, KeyRound, TriangleAlert } from 'lucide-react';
import { useEngine, activeModelOf } from '@/lib/store';
import { computeIndex, formatCountdown, RUNTIME_EVENT_META } from '@/lib/engine';
import { CLASSIFICATIONS, TIER_THRESHOLD } from '@/lib/types';
import { AuthMatrix } from '@/components/AuthMatrix';
import { Card, CardHeader, Badge, Mono, LivePill } from '@/components/ui/primitives';
import { PageHeader, GrantStatusBadge } from '@/components/ui/status';
import { useTick } from '@/hooks/useTick';
import { cn } from '@/lib/cn';

export function Authorisation() {
  const grants = useEngine((s) => s.grants);
  const gates = useEngine((s) => s.gates);
  const events = useEngine((s) => s.events);
  const model = useEngine((s) => activeModelOf(s));
  const injectRuntimeEvent = useEngine((s) => s.injectRuntimeEvent);
  const unassisted = useEngine((s) => s.lastRevocationUnassisted);
  const now = useTick();

  const index = useMemo(() => computeIndex(gates, events), [gates, events]);
  const kinds = Object.keys(RUNTIME_EVENT_META) as (keyof typeof RUNTIME_EVENT_META)[];
  const revokedRecently = grants.some((g) => g.status === 'REVOKED' || g.status === 'EXPIRED');

  return (
    <div>
      <PageHeader
        title="Authorisation (ATO)"
        subtitle="Adoption is not a one-time event. Authorisation is scoped to a tenant and tier, time-boxed, and recomputed whenever the model drifts, the data changes, or a red-team finding lands."
        claims={['C3', 'C4']}
        right={<LivePill />}
      />

      {/* Unassisted revocation banner */}
      <AnimatePresence>
        {unassisted && revokedRecently && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-3 rounded-lg border border-fail/40 bg-fail/10 px-4 py-3"
          >
            <HandMetal className="h-5 w-5 text-fail" />
            <div>
              <div className="text-sm font-semibold text-fail">
                Authorisation withdrawn with no operator action
              </div>
              <div className="text-xs text-muted">
                Triggered by the runtime event you introduced. No member of the team touched a keyboard — this is the recomputation, not a manual revocation.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Authorisation map"
            subtitle="scoped to tenant × tier · live time-box countdowns"
            right={<Badge tone="primary"><KeyRound className="mr-1 h-3 w-3" />scoped, not global</Badge>}
          />
          <div className="p-3">
            <AuthMatrix />
          </div>
        </Card>

        {/* The Turn */}
        <Card>
          <CardHeader
            title="The turn"
            subtitle="introduce a runtime event — you pick"
            right={<Zap className="h-4 w-4 text-warn" />}
          />
          <div className="space-y-2 p-3">
            {kinds.map((k) => (
              <button
                key={k}
                onClick={() => void injectRuntimeEvent(k)}
                className="w-full rounded-md border border-warn/30 bg-warn/8 px-3 py-2.5 text-left transition-colors hover:bg-warn/14"
              >
                <div className="flex items-center gap-1.5 text-sm font-medium text-warn">
                  <Zap className="h-3.5 w-3.5" /> {RUNTIME_EVENT_META[k].label}
                </div>
                <div className="mt-0.5 text-[11px] text-muted">{RUNTIME_EVENT_META[k].blurb}</div>
                {RUNTIME_EVENT_META[k].indexDelta > 0 && (
                  <div className="mt-1 font-mono text-[10px] text-fail">Index −{RUNTIME_EVENT_META[k].indexDelta}</div>
                )}
              </button>
            ))}
            <p className="pt-1 text-[11px] text-muted">
              Any authorised grant whose tier can no longer be supported is revoked automatically the instant the event lands.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Threshold curve */}
        <Card>
          <CardHeader
            title="Thresholds rise with sensitivity"
            subtitle={`current Assurance Index ${index.score} — same evidence, different outcomes`}
            right={<Badge tone="primary">C4</Badge>}
          />
          <div className="space-y-3 p-4">
            {CLASSIFICATIONS.map((c) => {
              const th = TIER_THRESHOLD[c];
              const meets = index.score >= th;
              return (
                <div key={c}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{c}</span>
                    <span className={cn('font-mono', meets ? 'text-pass' : 'text-fail')}>
                      threshold {th} · {meets ? 'authorisable' : 'refused'}
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn('h-full rounded-full', meets ? 'bg-pass/70' : 'bg-fail/60')}
                      style={{ width: `${Math.min(100, index.score)}%` }}
                    />
                    <div
                      className="absolute top-[-2px] h-[calc(100%+4px)] w-0.5 bg-fg/70"
                      style={{ left: `${th}%` }}
                      title={`threshold ${th}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Grant ledger */}
        <Card>
          <CardHeader title="Grants issued this session" subtitle={model ? model.name : 'no model'} />
          <div className="max-h-72 overflow-y-auto p-2">
            {grants.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted">
                No grants yet. Issue one from Evaluator Control, then request a higher tier to see refusal.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {grants.map((g) => {
                  const remaining = g.expiresAt - now;
                  return (
                    <motion.div
                      key={g.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 rounded-md border border-border px-3 py-2 mb-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-xs font-medium">{g.tenantName}</span>
                          <Badge tone="neutral">{g.tier}</Badge>
                        </div>
                        <Mono className="text-[10px] text-faint">
                          {g.id} · idx@issue {g.indexAtIssue}
                          {g.reason ? ` · ${g.reason}` : ''}
                        </Mono>
                      </div>
                      {g.status === 'AUTHORISED' && (
                        <span className="font-mono text-[11px] text-pass">{formatCountdown(remaining)}</span>
                      )}
                      <GrantStatusBadge status={g.status} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </Card>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <TriangleAlert className="h-3.5 w-3.5 text-warn" />
        A manual revocation would be "a certificate with extra steps". The withdrawal above happens on the event, not on a request.
      </p>
    </div>
  );
}

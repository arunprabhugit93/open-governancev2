import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CircleDashed,
  Fingerprint,
  Loader2,
  Radar,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Siren,
} from 'lucide-react';
import { useEngine } from '@/lib/store';
import { Card, CardHeader, Badge, Button, Mono } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';
import { cn } from '@/lib/cn';
import type { InvestigationStage, VerdictOutcome } from '@/lib/types';

const STAGES: { id: InvestigationStage; label: string }[] = [
  { id: 'ingest', label: 'Ingest' },
  { id: 'detect', label: 'Detect' },
  { id: 'investigate', label: 'Investigate' },
  { id: 'enrich', label: 'Enrich' },
  { id: 'decide', label: 'Decide' },
  { id: 'respond', label: 'Respond' },
];

const OUTCOME_TONE: Record<VerdictOutcome, { tone: 'fail' | 'warn' | 'pass'; icon: typeof ShieldAlert }> = {
  threat: { tone: 'fail', icon: ShieldAlert },
  suspicious: { tone: 'warn', icon: ShieldQuestion },
  benign: { tone: 'pass', icon: ShieldCheck },
};

export function Investigation() {
  const alerts = useEngine((s) => s.alerts);
  const selectedAlertId = useEngine((s) => s.selectedAlertId);
  const selectAlert = useEngine((s) => s.selectAlert);
  const investigationSteps = useEngine((s) => s.investigationSteps);
  const verdicts = useEngine((s) => s.verdicts);
  const soarActions = useEngine((s) => s.soarActions);
  const runInvestigation = useEngine((s) => s.runInvestigation);
  const respondToAlert = useEngine((s) => s.respondToAlert);

  const alert = alerts.find((a) => a.id === selectedAlertId) ?? alerts[0];
  const steps = alert ? investigationSteps[alert.id] ?? [] : [];
  const verdict = alert ? verdicts[alert.id] : undefined;
  const soar = alert ? soarActions[alert.id] : undefined;

  const stageReached = useMemo(() => {
    if (!alert) return -1;
    if (soar) return STAGES.length - 1;
    if (verdict) return STAGES.findIndex((s) => s.id === 'decide');
    const lastStage = steps[steps.length - 1]?.stage;
    return lastStage ? STAGES.findIndex((s) => s.id === lastStage) : alert.status === 'new' ? -1 : 0;
  }, [alert, steps, verdict, soar]);

  if (!alert) {
    return (
      <div>
        <PageHeader title="Live Investigation" subtitle="No alerts in this session." />
      </div>
    );
  }

  const canRun = alert.status === 'new';
  const requiresApproval = verdict && verdict.outcome !== 'benign';
  const OutcomeIcon = verdict ? OUTCOME_TONE[verdict.outcome].icon : ShieldQuestion;

  return (
    <div>
      <PageHeader
        title="Live Investigation"
        subtitle="§10.2 — ingest, detect, investigate, enrich, decide, respond. 40+ agents on a local cybersecurity model form and test hypotheses until confirmed or dismissed, typically in 60–120 seconds. Reasoning below is disclosed as scripted for this UI-only build (see Disclosure); the ledger entries it produces are real."
        right={<Badge tone="primary">Tab 17 §8.5–8.6</Badge>}
      />

      {/* Alert picker */}
      <div className="mb-4 flex flex-wrap gap-2">
        {alerts.map((a) => (
          <button
            key={a.id}
            onClick={() => selectAlert(a.id)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-left text-xs transition-colors',
              a.id === alert.id ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted hover:bg-surface-2'
            )}
          >
            <span className="font-mono text-[10px]">{a.id}</span> · {a.title.slice(0, 36)}…
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Case summary */}
        <Card className="lg:col-span-1">
          <CardHeader
            title={alert.id}
            subtitle={alert.detectionType}
            right={<Badge tone={alert.severity === 'high' || alert.severity === 'critical' ? 'fail' : 'warn'}>{alert.severity}</Badge>}
          />
          <div className="space-y-3 p-4">
            <p className="text-sm">{alert.detail}</p>
            {alert.sovereigntyCritical && (
              <div className="flex items-center gap-2 rounded-md border border-fail/30 bg-fail/8 px-2.5 py-2">
                <Siren className="h-3.5 w-3.5 shrink-0 text-fail" />
                <span className="text-[11px] text-fail">
                  Matches the standing sovereignty use-case (§10.3) — escalated regardless of the detector's own severity.
                </span>
              </div>
            )}
            <Button
              tone="primary"
              size="sm"
              className="w-full"
              disabled={!canRun}
              onClick={() => void runInvestigation(alert.id)}
            >
              {canRun ? 'Run investigation' : alert.status === 'resolved' ? 'Resolved this session' : 'In progress…'}
            </Button>
          </div>
        </Card>

        {/* Six-stage loop */}
        <Card className="lg:col-span-2">
          <CardHeader title="Investigation loop" subtitle="§10.2 — the closed operating loop" />
          <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-6">
            {STAGES.map((s, i) => {
              const state = i <= stageReached ? (i === stageReached && !verdict && !soar ? 'active' : 'done') : 'todo';
              return (
                <div
                  key={s.id}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-center',
                    state === 'done' && 'border-pass/30 bg-pass/8',
                    state === 'active' && 'border-primary/40 bg-primary/10',
                    state === 'todo' && 'border-border bg-surface-2'
                  )}
                >
                  {state === 'done' ? (
                    <Check className="h-4 w-4 text-pass" />
                  ) : state === 'active' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-faint" />
                  )}
                  <span className={cn('text-[10px] font-medium', state === 'todo' && 'text-faint')}>{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className="max-h-56 space-y-1.5 overflow-y-auto border-t border-border p-3">
            {steps.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted">
                {canRun ? 'Run the investigation to watch the loop step through evidence.' : 'No steps recorded for this alert.'}
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {steps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 rounded-md px-2 py-1.5"
                  >
                    <Radar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">{s.label}</div>
                      <div className="text-[11px] text-muted">{s.detail}</div>
                    </div>
                    <Mono className="text-[10px] text-faint">{s.stage}</Mono>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Card>
      </div>

      {/* Verdict + governed response */}
      {verdict && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Explainable verdict"
              subtitle="§10.2 — threat, suspicious, or benign"
              right={
                <Badge tone={OUTCOME_TONE[verdict.outcome].tone}>
                  <OutcomeIcon className="mr-1 h-3 w-3" />
                  {verdict.outcome.toUpperCase()}
                </Badge>
              }
            />
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Confidence</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${verdict.confidence}%` }} />
                </div>
                <Mono className="text-xs">{verdict.confidence}%</Mono>
              </div>
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-wide text-faint">Rationale</div>
                <ul className="space-y-1">
                  {verdict.rationale.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <Fingerprint className="mt-0.5 h-3 w-3 shrink-0 text-faint" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {verdict.attackPatterns.map((p) => (
                  <Badge key={p} tone="neutral">{p}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Governed response"
              subtitle="§10.5 — low-risk auto; high-impact held for approval"
              right={soar && <Badge tone={soar.decision === 'denied' ? 'fail' : 'pass'}>{soar.decision}</Badge>}
            />
            <div className="space-y-3 p-4">
              <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs">{soar?.action ?? '—'}</div>

              {!soar && requiresApproval && (
                <>
                  <div className="rounded-md border border-warn/30 bg-warn/8 px-3 py-2 text-[11px]">
                    <div className="mb-1 font-medium text-warn">Blast-radius evaluation (§4.5) — held for approval</div>
                    <div className="text-muted">Scope: 1 service account · Value: high · Reach: {alert.zoneId} · Irreversibility: compensable</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" tone="primary" className="flex-1" onClick={() => void respondToAlert(alert.id, 'approve', 'duty-officer')}>
                      Approve response
                    </Button>
                    <Button size="sm" variant="outline" tone="fail" className="flex-1" onClick={() => void respondToAlert(alert.id, 'deny', 'duty-officer')}>
                      Deny
                    </Button>
                  </div>
                </>
              )}

              {!soar && !requiresApproval && (
                <Button size="sm" tone="primary" className="w-full" onClick={() => void respondToAlert(alert.id, 'approve')}>
                  Execute automatically (low risk)
                </Button>
              )}

              {soar && (
                <div className="text-[11px] text-muted">
                  {soar.approvedBy ? `Decided by ${soar.approvedBy}.` : 'Executed automatically — no approval required.'} Recorded to the same tamper-evident ledger used for model governance.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

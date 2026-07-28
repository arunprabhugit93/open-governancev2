import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  HandMetal,
  CircleDot,
  ExternalLink,
} from 'lucide-react';
import { useEngine, activeModelOf, SEED_TENANTS } from '@/lib/store';
import { PHASES } from '@/lib/phases';
import { RUNTIME_EVENT_META } from '@/lib/engine';
import { Card, CardHeader, Badge, Button, Mono } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';
import { cn } from '@/lib/cn';
import type { Phase } from '@/lib/types';

export function Runner() {
  const phase = useEngine((s) => s.phase);
  const setPhase = useEngine((s) => s.setPhase);
  const currentIndex = PHASES.find((p) => p.id === phase)?.index ?? 1;
  const meta = PHASES.find((p) => p.id === phase) ?? PHASES[0];
  const navigate = useNavigate();

  const goToPhase = (p: Phase) => {
    setPhase(p);
    const route = PHASES.find((x) => x.id === p)?.route ?? '/';
    navigate(route);
  };

  return (
    <div>
      <PageHeader
        title="Demonstration Runner"
        subtitle="One model. One continuous session. The eight phases the brief expects — from arrival to loss of authorisation, then evidence. Nothing here is a recording."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Stepper */}
        <Card className="lg:col-span-1">
          <CardHeader title="Session sequence" subtitle="click any phase to jump" />
          <div className="p-2">
            {PHASES.map((p) => {
              const state = p.index < currentIndex ? 'done' : p.index === currentIndex ? 'active' : 'todo';
              return (
                <button
                  key={p.id}
                  onClick={() => goToPhase(p.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors',
                    state === 'active' ? 'bg-primary/12' : 'hover:bg-surface-2'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                      state === 'done' && 'bg-pass/20 text-pass',
                      state === 'active' && 'bg-primary text-primary-fg',
                      state === 'todo' && 'bg-surface-2 text-faint'
                    )}
                  >
                    {state === 'done' ? <Check className="h-3.5 w-3.5" /> : p.index}
                  </span>
                  <span className={cn('text-sm', state === 'active' ? 'font-semibold text-primary' : 'text-fg')}>
                    {p.label}
                  </span>
                  {state === 'active' && <CircleDot className="ml-auto h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Current phase */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                Phase {meta.index} · {meta.label}
                <Badge tone="primary">current</Badge>
              </span>
            }
            subtitle="what the evaluator does during this phase"
            right={
              <Button size="sm" variant="outline" tone="neutral" onClick={() => navigate(meta.route)}>
                Open view <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <div className="space-y-4 p-5">
            <motion.p
              key={meta.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm"
            >
              {meta.evaluatorDoes}
            </motion.p>

            <PhaseActions phase={phase} />

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="ghost"
                tone="neutral"
                size="sm"
                disabled={currentIndex <= 1}
                onClick={() => goToPhase(PHASES[currentIndex - 2].id)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={currentIndex >= PHASES.length}
                onClick={() => goToPhase(PHASES[currentIndex].id)}
              >
                Next phase <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PhaseActions({ phase }: { phase: Phase }) {
  const models = useEngine((s) => s.models);
  const model = useEngine((s) => activeModelOf(s));
  const selectModel = useEngine((s) => s.selectModel);
  const removeMetadata = useEngine((s) => s.removeMetadata);
  const completeModel = useEngine((s) => s.completeModel);
  const runGates = useEngine((s) => s.runGates);
  const issueGrant = useEngine((s) => s.issueGrant);
  const attemptControlPlane = useEngine((s) => s.attemptControlPlane);
  const attemptPromptInjection = useEngine((s) => s.attemptPromptInjection);
  const injectRuntimeEvent = useEngine((s) => s.injectRuntimeEvent);
  const exportEvidence = useEngine((s) => s.exportEvidence);
  const unassisted = useEngine((s) => s.lastRevocationUnassisted);

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-wrap gap-2">{children}</div>
  );

  switch (phase) {
    case 'arrival':
      return (
        <Wrap>
          {models.map((m) => (
            <Button key={m.id} size="sm" variant="outline" tone="neutral" onClick={() => selectModel(m.id)}>
              Nominate {m.name}
            </Button>
          ))}
        </Wrap>
      );
    case 'refusal':
      return model ? (
        <Wrap>
          {model.metadata.slice(0, 4).map((f) => (
            <Button key={f.key} size="sm" variant="outline" tone="fail" onClick={() => void removeMetadata(f.key)}>
              Remove {f.label}
            </Button>
          ))}
        </Wrap>
      ) : (
        <Hint>Nominate a model first.</Hint>
      );
    case 'passage':
      return (
        <Wrap>
          <Button size="sm" variant="outline" tone="neutral" onClick={completeModel}>Restore all metadata</Button>
          <Button size="sm" tone="primary" onClick={() => void runGates()}>Run gates & score</Button>
        </Wrap>
      );
    case 'authorisation':
      return (
        <Wrap>
          <Button size="sm" tone="primary" onClick={() => void issueGrant(SEED_TENANTS[0].id, 'PUBLIC')}>
            Authorise {SEED_TENANTS[0].name} @ PUBLIC
          </Button>
          <Button size="sm" variant="outline" tone="fail" onClick={() => void issueGrant(SEED_TENANTS[0].id, 'RESTRICTED')}>
            Request same model @ RESTRICTED (expect refusal)
          </Button>
        </Wrap>
      );
    case 'service':
      return (
        <Wrap>
          <Button size="sm" variant="outline" tone="fail" onClick={() => void attemptControlPlane()}>Reach control plane</Button>
          <Button size="sm" variant="outline" tone="fail" onClick={() => void attemptPromptInjection()}>Prompt injection</Button>
        </Wrap>
      );
    case 'turn':
      return (
        <Wrap>
          {(Object.keys(RUNTIME_EVENT_META) as (keyof typeof RUNTIME_EVENT_META)[]).map((k) => (
            <Button key={k} size="sm" variant="outline" tone="fail" onClick={() => void injectRuntimeEvent(k)}>
              {RUNTIME_EVENT_META[k].label}
            </Button>
          ))}
        </Wrap>
      );
    case 'loss':
      return (
        <div className="flex items-center gap-3 rounded-lg border border-fail/40 bg-fail/10 px-4 py-3">
          <HandMetal className="h-5 w-5 text-fail" />
          <div className="text-sm">
            {unassisted
              ? 'Authorisation was withdrawn with no operator action — watch the authorisation view and the ledger. No keyboard was touched.'
              : 'Introduce an event in the turn phase to see authorisation withdrawn unassisted.'}
          </div>
        </div>
      );
    case 'evidence':
      return (
        <Wrap>
          <Button size="sm" tone="primary" onClick={() => void exportEvidence()}>Export session evidence</Button>
          <Hint>Then open the Evidence Ledger, pick any record, and tamper it to confirm detection.</Hint>
        </Wrap>
      );
  }
}

function Hint({ children }: { children: React.ReactNode }) {
  return <Mono className="text-[11px] text-muted">{children}</Mono>;
}

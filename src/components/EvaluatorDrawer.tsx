import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Boxes,
  Scissors,
  DoorOpen,
  KeyRound,
  Bug,
  Zap,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { useEngine, activeModelOf, SEED_TENANTS } from '@/lib/store';
import { CLASSIFICATIONS, type Classification } from '@/lib/types';
import { RUNTIME_EVENT_META } from '@/lib/engine';
import { Badge, Button, Mono, SectionLabel } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';

export function EvaluatorDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[380px] flex-col border-l border-border bg-surface shadow-pop"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Radio className="h-4 w-4 text-primary" /> Evaluator Control
                </div>
                <div className="text-[11px] text-muted">
                  You drive the session. Choose within the categories below.
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close evaluator control"
                className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              <ModelSection />
              <BreakSection />
              <BypassSection />
              <AuthoriseSection />
              <ServiceSection />
              <TurnSection />
            </div>

            <div className="border-t border-border px-4 py-2.5 text-[11px] text-faint">
              Nothing here is pre-scripted. The engine reacts to your choice.
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Group({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" /> {title}
        </span>
      </SectionLabel>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ModelSection() {
  const models = useEngine((s) => s.models);
  const activeId = useEngine((s) => s.activeModelId);
  const selectModel = useEngine((s) => s.selectModel);
  return (
    <Group icon={Boxes} title="1 · Nominate a model">
      {models.map((m) => (
        <button
          key={m.id}
          onClick={() => selectModel(m.id)}
          className={cn(
            'flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left text-sm transition-colors',
            activeId === m.id
              ? 'border-primary/40 bg-primary/10'
              : 'border-border hover:bg-surface-2'
          )}
        >
          <span className="min-w-0">
            <span className="block truncate font-medium">{m.name}</span>
            <Mono className="text-[10px] text-muted">{m.id}</Mono>
          </span>
          <Badge tone={m.vendorTrained ? 'fail' : 'pass'}>
            {m.vendorTrained ? 'vendor-trained' : 'external'}
          </Badge>
        </button>
      ))}
    </Group>
  );
}

function BreakSection() {
  const model = useEngine((s) => activeModelOf(s));
  const removeMetadata = useEngine((s) => s.removeMetadata);
  const restoreMetadata = useEngine((s) => s.restoreMetadata);
  const completeModel = useEngine((s) => s.completeModel);
  const runGates = useEngine((s) => s.runGates);

  if (!model) {
    return (
      <Group icon={Scissors} title="2 · Break something">
        <p className="text-xs text-muted">Nominate a model first.</p>
      </Group>
    );
  }

  return (
    <Group icon={Scissors} title="2 · Break something (you choose)">
      <p className="text-[11px] text-muted">
        Remove any mandatory element. Promotion is refused for that element
        specifically.
      </p>
      {model.metadata.map((f) => (
        <div
          key={f.key}
          className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5"
        >
          <span className="min-w-0 truncate text-xs">{f.label}</span>
          {f.present ? (
            <Button size="sm" variant="outline" tone="fail" onClick={() => void removeMetadata(f.key)}>
              Remove
            </Button>
          ) : (
            <Button size="sm" variant="ghost" tone="neutral" onClick={() => restoreMetadata(f.key)}>
              Restore
            </Button>
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" tone="neutral" className="flex-1" onClick={completeModel}>
          Make complete
        </Button>
        <Button size="sm" tone="primary" className="flex-1" onClick={() => void runGates()}>
          Run gates
        </Button>
      </div>
    </Group>
  );
}

function BypassSection() {
  const attemptBypass = useEngine((s) => s.attemptBypass);
  const routes = ['Direct-to-serving push', 'Sideload via cache', 'Copy authorised sibling'];
  return (
    <Group icon={DoorOpen} title="3 · Attempt a bypass">
      <p className="text-[11px] text-muted">
        Try to reach serving without passing the registry. Every route is refused.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {routes.map((r) => (
          <Button key={r} size="sm" variant="outline" tone="neutral" onClick={() => void attemptBypass(r)}>
            {r}
          </Button>
        ))}
      </div>
    </Group>
  );
}

function AuthoriseSection() {
  const issueGrant = useEngine((s) => s.issueGrant);
  const [tenantId, setTenantId] = useState(SEED_TENANTS[0].id);
  const [tier, setTier] = useState<Classification>('PUBLIC');
  return (
    <Group icon={KeyRound} title="4 · Authorise for a tenant & tier">
      <select
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
        className="w-full rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-sm"
      >
        {SEED_TENANTS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-1.5">
        {CLASSIFICATIONS.map((c) => (
          <button
            key={c}
            onClick={() => setTier(c)}
            className={cn(
              'rounded-md border px-2 py-1 text-[11px] font-medium transition-colors',
              tier === c ? 'border-primary/50 bg-primary/12 text-primary' : 'border-border text-muted hover:bg-surface-2'
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <Button size="sm" tone="primary" className="w-full" onClick={() => void issueGrant(tenantId, tier)}>
        Request authorisation
      </Button>
      <p className="text-[11px] text-muted">
        The same model authorises at a lower tier and is refused at a higher one —
        thresholds rise with sensitivity.
      </p>
    </Group>
  );
}

function ServiceSection() {
  const attemptControlPlane = useEngine((s) => s.attemptControlPlane);
  const attemptPromptInjection = useEngine((s) => s.attemptPromptInjection);
  const testEgress = useEngine((s) => s.testEgress);
  return (
    <Group icon={ShieldAlert} title="5 · Press the running service">
      <div className="grid grid-cols-1 gap-1.5">
        <Button size="sm" variant="outline" tone="fail" onClick={() => void attemptControlPlane()}>
          <Bug className="h-3.5 w-3.5" /> Reach control plane from tenant
        </Button>
        <Button size="sm" variant="outline" tone="fail" onClick={() => void attemptPromptInjection()}>
          <Bug className="h-3.5 w-3.5" /> Attempt prompt injection
        </Button>
        <Button
          size="sm"
          variant="outline"
          tone="fail"
          onClick={() => void testEgress('api.external-llm.com')}
        >
          <Radio className="h-3.5 w-3.5" /> Test external egress call
        </Button>
      </div>
    </Group>
  );
}

function TurnSection() {
  const injectRuntimeEvent = useEngine((s) => s.injectRuntimeEvent);
  const kinds = Object.keys(RUNTIME_EVENT_META) as (keyof typeof RUNTIME_EVENT_META)[];
  return (
    <Group icon={Zap} title="6 · The turn (you pick — we are not told)">
      <p className="text-[11px] text-muted">
        Introduce a runtime event. Authorisation reacts on its own — no operator
        touches a keyboard.
      </p>
      <div className="space-y-1.5">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => void injectRuntimeEvent(k)}
            className="w-full rounded-md border border-warn/30 bg-warn/8 px-2.5 py-2 text-left transition-colors hover:bg-warn/14"
          >
            <div className="flex items-center gap-1.5 text-sm font-medium text-warn">
              <Zap className="h-3.5 w-3.5" /> {RUNTIME_EVENT_META[k].label}
            </div>
            <div className="mt-0.5 text-[11px] text-muted">{RUNTIME_EVENT_META[k].blurb}</div>
          </button>
        ))}
      </div>
    </Group>
  );
}

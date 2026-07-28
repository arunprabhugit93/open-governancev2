import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldX, Bug, ServerCog, Lock } from 'lucide-react';
import { useEngine, activeModelOf } from '@/lib/store';
import { Card, CardHeader, Badge, Button, Mono } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';

interface Msg {
  role: 'tenant' | 'model';
  text: string;
}

const CANNED: Record<string, string> = {
  default:
    'Response generated within the sovereign boundary. (Inference output is simulated in this POC — no live model is loaded; disclosed under Environment Disclosure.)',
};

export function Serving() {
  const model = useEngine((s) => activeModelOf(s));
  const grants = useEngine((s) => s.grants);
  const attemptControlPlane = useEngine((s) => s.attemptControlPlane);
  const attemptPromptInjection = useEngine((s) => s.attemptPromptInjection);
  const ledger = useEngine((s) => s.ledger);

  const authorised = grants.find((g) => g.status === 'AUTHORISED');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'tenant', text: 'Summarise the eligibility criteria for the housing subsidy programme.' },
    { role: 'model', text: 'Eligibility is assessed on household income, residency status, and existing property ownership. ' + CANNED.default },
  ]);
  const [input, setInput] = useState('');

  const guardLog = ledger.filter(
    (e) => e.action === 'PROMPT_INJECTION_BLOCKED' || e.action === 'CONTROL_PLANE_BLOCKED'
  );

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: 'tenant', text }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'model', text: CANNED.default }]);
    }, 350);
  };

  return (
    <div>
      <PageHeader
        title="Serving — Tenant Session"
        subtitle="The authorised model serves a tenant inside the boundary. The control plane is unreachable from the tenant side, and injection attempts are neutralised at the serving guard."
        claims={['C1', 'C8']}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chat */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <ServerCog className="h-4 w-4 text-primary" />
                {authorised ? `${authorised.tenantName} · ${authorised.tier}` : 'No active authorisation'}
              </span>
            }
            subtitle={model ? `${model.name} serving` : 'nominate & authorise a model first'}
            right={
              authorised ? (
                <Badge tone="pass">serving under ATO {authorised.id}</Badge>
              ) : (
                <Badge tone="warn">not serving</Badge>
              )
            }
          />
          <div className="flex h-[380px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'tenant' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      m.role === 'tenant'
                        ? 'max-w-[78%] rounded-lg rounded-br-sm bg-primary/15 px-3 py-2 text-sm text-fg'
                        : 'max-w-[78%] rounded-lg rounded-bl-sm border border-border bg-surface-2 px-3 py-2 text-sm'
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={authorised ? 'Message the model…' : 'Authorise a model to serve first'}
                disabled={!authorised}
                className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none disabled:opacity-50"
              />
              <Button size="md" onClick={send} disabled={!authorised}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Attacks + guard */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Unscripted attempts" subtitle="press the running service" />
            <div className="space-y-2 p-3">
              <Button variant="outline" tone="fail" size="sm" className="w-full justify-start" onClick={() => void attemptControlPlane()}>
                <Lock className="h-3.5 w-3.5" /> Reach control plane from tenant
              </Button>
              <Button variant="outline" tone="fail" size="sm" className="w-full justify-start" onClick={() => void attemptPromptInjection()}>
                <Bug className="h-3.5 w-3.5" /> Attempt prompt injection
              </Button>
              <p className="text-[11px] text-muted">
                Both are blocked and written to the evidence ledger.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Serving guard log" />
            <div className="max-h-64 overflow-y-auto p-2">
              {guardLog.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted">
                  No attempts yet.
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {[...guardLog].reverse().map((e) => (
                    <motion.div
                      key={e.seq}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 rounded-md px-2 py-1.5"
                    >
                      <ShieldX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fail" />
                      <div className="min-w-0">
                        <div className="text-xs">{e.summary}</div>
                        <Mono className="text-[10px] text-faint">BLOCKED · #{e.seq}</Mono>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

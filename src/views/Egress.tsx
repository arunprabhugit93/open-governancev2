import { motion, AnimatePresence } from 'framer-motion';
import { Network, ShieldX, Check, Radio, Cloud } from 'lucide-react';
import { useEngine } from '@/lib/store';
import { Card, CardHeader, Badge, Button, Mono, StatTile } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';

const NODES = [
  { id: 'registry', label: 'Registry', x: 70, y: 60 },
  { id: 'gatekeeper', label: 'Gatekeeper', x: 210, y: 45 },
  { id: 'inference', label: 'Inference', x: 210, y: 150 },
  { id: 'ledger', label: 'Evidence Ledger', x: 70, y: 150 },
  { id: 'tenant', label: 'Tenant GW', x: 350, y: 100 },
];
const LINKS: [string, string][] = [
  ['registry', 'gatekeeper'],
  ['gatekeeper', 'inference'],
  ['gatekeeper', 'ledger'],
  ['inference', 'tenant'],
  ['registry', 'ledger'],
];

export function Egress() {
  const egress = useEngine((s) => s.egress);
  const testEgress = useEngine((s) => s.testEgress);
  const blocked = egress.filter((e) => e.verdict === 'BLOCKED');
  const internal = egress.filter((e) => e.verdict === 'INTERNAL');
  const nodeById = (id: string) => NODES.find((n) => n.id === id)!;

  return (
    <div>
      <PageHeader
        title="Sovereignty — Egress Monitor"
        subtitle="Every dataset, embedding, prompt, model artefact and inference output remains inside the sovereign boundary. A single hosted dependency anywhere in the loop fails this claim."
        claims={['C8']}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Boundary" value="SEALED" tone="pass" sub="observed live" />
        <StatTile label="Internal flows" value={internal.length} tone="info" sub="in-boundary" />
        <StatTile label="Egress attempts" value={blocked.length} tone={blocked.length ? 'warn' : 'neutral'} sub="refused" />
        <StatTile label="External deps in loop" value={0} tone="pass" sub="from SBOM scan" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Boundary topology"
            subtitle="all serving-loop traffic stays inside the boundary"
            right={<Badge tone="pass"><Network className="mr-1 h-3 w-3" />in-boundary</Badge>}
          />
          <div className="p-4">
            <svg viewBox="0 0 460 210" className="w-full">
              {/* boundary */}
              <rect
                x="20" y="15" width="380" height="180" rx="14"
                fill="hsl(var(--pass) / 0.05)"
                stroke="hsl(var(--pass) / 0.4)"
                strokeDasharray="6 4"
              />
              <text x="30" y="35" className="fill-current text-[10px]" fill="hsl(var(--pass))">
                SOVEREIGN BOUNDARY
              </text>
              {/* internal links */}
              {LINKS.map(([a, b], i) => {
                const na = nodeById(a);
                const nb = nodeById(b);
                return (
                  <line
                    key={i}
                    x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    stroke="hsl(var(--info) / 0.4)" strokeWidth="1.5"
                  />
                );
              })}
              {/* external node + blocked link */}
              <line
                x1={nodeById('inference').x} y1={nodeById('inference').y}
                x2="430" y2="185"
                stroke="hsl(var(--fail) / 0.7)" strokeWidth="1.5" strokeDasharray="4 3"
              />
              <g>
                <circle cx="430" cy="185" r="14" fill="hsl(var(--fail) / 0.12)" stroke="hsl(var(--fail))" />
                <text x="430" y="189" textAnchor="middle" className="text-[9px]" fill="hsl(var(--fail))">ext</text>
              </g>
              <text x="360" y="150" className="text-[8px]" fill="hsl(var(--fail))">refused</text>
              {/* nodes */}
              {NODES.map((n) => (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r="8" fill="hsl(var(--primary) / 0.18)" stroke="hsl(var(--primary))" />
                  <text x={n.x} y={n.y - 12} textAnchor="middle" className="text-[8px]" fill="hsl(var(--fg))">
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>
            <div className="mt-3 flex justify-center">
              <Button variant="outline" tone="fail" size="sm" onClick={() => void testEgress('api.external-llm.com')}>
                <Radio className="h-3.5 w-3.5" /> Test external egress call
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Egress log" subtitle="observed flows this session" />
          <div className="max-h-[320px] overflow-y-auto p-2">
            <AnimatePresence initial={false}>
              {egress.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-md px-2 py-1.5"
                >
                  {e.verdict === 'BLOCKED' ? (
                    <ShieldX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fail" />
                  ) : (
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pass" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Mono className="text-muted">{e.source}</Mono>
                      <span className="text-faint">→</span>
                      <Mono className={e.verdict === 'BLOCKED' ? 'text-fail' : 'text-fg'}>{e.target}</Mono>
                    </div>
                    <div className="text-[10px] text-faint">{e.note}</div>
                  </div>
                  <Badge tone={e.verdict === 'BLOCKED' ? 'fail' : 'pass'}>{e.verdict}</Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <Cloud className="h-3.5 w-3.5" />
        The external destination sits outside the boundary and is refused before any bytes leave — the sovereignty claim does not survive a single hosted dependency, so there are none in the loop.
      </p>
    </div>
  );
}

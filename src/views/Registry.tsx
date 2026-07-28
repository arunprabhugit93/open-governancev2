import { CheckCircle2, XCircle, Fingerprint, Lock } from 'lucide-react';
import { useEngine, activeModelOf } from '@/lib/store';
import { Card, CardHeader, Badge, Button, Mono } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';
import { cn } from '@/lib/cn';

export function Registry() {
  const models = useEngine((s) => s.models);
  const activeId = useEngine((s) => s.activeModelId);
  const selectModel = useEngine((s) => s.selectModel);
  const active = useEngine((s) => activeModelOf(s));

  return (
    <div>
      <PageHeader
        title="Model Registry"
        subtitle="The single promotion gate and evidence spine. Every candidate carries immutable, signed metadata. A record already written cannot be altered."
        claims={['C2', 'C5']}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          {models.map((m) => {
            const complete = m.metadata.every((f) => f.present);
            return (
              <Card
                key={m.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  activeId === m.id ? 'ring-1 ring-primary/50' : 'hover:bg-surface-2'
                )}
              >
                <button className="w-full p-4 text-left" onClick={() => selectModel(m.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{m.name}</div>
                      <Mono className="text-[11px] text-muted">{m.id} · {m.family} · {m.params}</Mono>
                    </div>
                    <Badge tone={m.vendorTrained ? 'fail' : 'pass'}>
                      {m.vendorTrained ? 'vendor' : 'external'}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <Fingerprint className="h-3.5 w-3.5" />
                    <Mono>{m.contentHash}</Mono>
                  </div>
                  <div className="mt-2">
                    <Badge tone={complete ? 'pass' : 'warn'}>
                      {complete ? '7/7 metadata elements' : `${m.metadata.filter((f) => f.present).length}/7 elements`}
                    </Badge>
                  </div>
                </button>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {active ? (
            <Card>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    {active.name}
                    <Badge tone={active.vendorTrained ? 'fail' : 'pass'}>
                      {active.vendorTrained ? 'Supplied by vendor — C5 fails' : 'Independently supplied'}
                    </Badge>
                  </span>
                }
                subtitle={active.supplier}
                right={
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <Lock className="h-3.5 w-3.5" /> immutable
                  </span>
                }
              />
              <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-0">
                  {active.metadata.slice(0, 4).map((f) => (
                    <MetaRow key={f.key} label={f.label} value={f.value} present={f.present} />
                  ))}
                </div>
                <div className="p-0">
                  {active.metadata.slice(4).map((f) => (
                    <MetaRow key={f.key} label={f.label} value={f.value} present={f.present} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                <p className="text-xs text-muted">
                  Attempting to edit a written record is rejected — the registry is append-only.
                </p>
                <Button variant="outline" tone="fail" size="sm" onClick={() => alert('Registry is append-only. A written record cannot be altered — the edit is rejected and logged.')}>
                  Try to edit this record
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-10 text-center text-sm text-muted">
                Select a candidate model to inspect its immutable metadata.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, present }: { label: string; value: string; present: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex items-center gap-2">
        {present ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-pass" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 text-fail" />
        )}
        <div>
          <div className="text-xs font-medium">{label}</div>
          <div className={cn('text-[11px]', present ? 'text-muted' : 'text-fail line-through')}>
            {present ? value : 'removed by evaluator'}
          </div>
        </div>
      </div>
    </div>
  );
}

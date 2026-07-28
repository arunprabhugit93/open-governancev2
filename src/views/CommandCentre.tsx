import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Building2,
  Gauge,
  MapPin,
  Radar,
  Satellite,
  Siren,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEngine } from '@/lib/store';
import { HEADLINE_STATS, SCOPE_LINE_ITEMS, SEED_TELEMETRY } from '@/lib/seed';
import { Card, CardHeader, Badge, LivePill, Mono, StatTile } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';
import { cn } from '@/lib/cn';
import type { ZonePosture } from '@/lib/types';

const POSTURE_TONE: Record<ZonePosture, { dot: string; label: string; badge: 'pass' | 'warn' | 'fail' }> = {
  green: { dot: 'bg-pass', label: 'Nominal', badge: 'pass' },
  amber: { dot: 'bg-warn', label: 'Elevated', badge: 'warn' },
  red: { dot: 'bg-fail', label: 'Active incident', badge: 'fail' },
};

const SEVERITY_TONE: Record<string, 'neutral' | 'warn' | 'fail'> = {
  low: 'neutral',
  medium: 'warn',
  high: 'fail',
  critical: 'fail',
};

export function CommandCentre() {
  const zones = useEngine((s) => s.zones);
  const alerts = useEngine((s) => s.alerts);
  const zonePosture = useEngine((s) => s.zonePosture);
  const selectAlert = useEngine((s) => s.selectAlert);
  const navigate = useNavigate();

  const totalTelemetry = useMemo(() => SEED_TELEMETRY.reduce((s, t) => s + t.sources, 0), []);
  const maxCategory = Math.max(...SEED_TELEMETRY.map((t) => t.sources));
  const unresolved = alerts.filter((a) => a.status !== 'resolved').length;

  return (
    <div>
      <PageHeader
        title="Sovereign Command Centre"
        subtitle="Demonstration 2 of 2 (§12.1): a simulated security incident driven through detection, autonomous investigation, approval and response. Posture below is derived live from the same alert state Investigation resolves — nothing here is a separate reporting layer."
        right={<LivePill />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Sovereign SOC" value={HEADLINE_STATS.soc} tone="pass" sub="independent of the platform NOC" />
        <StatTile label="Telemetry sources" value={HEADLINE_STATS.telemetrySources} tone="primary" sub={`${totalTelemetry} configured this session`} />
        <StatTile label="Investigation agents" value={HEADLINE_STATS.investigationAgents} tone="info" sub={`cycle ${HEADLINE_STATS.investigationCycle}`} />
        <StatTile label="Open alerts" value={unresolved} tone={unresolved ? 'warn' : 'neutral'} sub={`retention: ${HEADLINE_STATS.retentionMonths}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Zone posture map */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sovereign zones"
            subtitle="posture derived live from unresolved alerts in each zone"
            right={<Badge tone="primary" icon={<MapPin className="h-3 w-3" />}>4 zones</Badge>}
          />
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {zones.map((z) => {
              const posture = zonePosture(z.id);
              const tone = POSTURE_TONE[posture];
              const zoneAlerts = alerts.filter((a) => a.zoneId === z.id);
              return (
                <div key={z.id} className="rounded-lg border border-border bg-surface-2 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted" />
                      <div>
                        <div className="text-sm font-medium">{z.name}</div>
                        <div className="text-[11px] text-faint">{z.agencyExample}</div>
                      </div>
                    </div>
                    <Badge tone={tone.badge}>
                      <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', tone.dot)} />
                      {tone.label}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                    <span>{z.telemetrySources} telemetry sources</span>
                    <span>{zoneAlerts.length} alert{zoneAlerts.length === 1 ? '' : 's'} this session</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Telemetry fabric breakdown */}
        <Card>
          <CardHeader
            title="Telemetry fabric"
            subtitle="§10.4 — in-country collection, 250+ source types"
            right={<Satellite className="h-4 w-4 text-primary" />}
          />
          <div className="space-y-2.5 p-3.5">
            {SEED_TELEMETRY.map((t) => (
              <div key={t.label}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-muted">{t.label}</span>
                  <Mono className="text-faint">{t.sources}</Mono>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${(t.sources / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Live alert feed */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Alert feed"
            subtitle="behavioural correlation + UEBA — click through to Live Investigation"
            right={<Badge tone="primary" icon={<Siren className="h-3 w-3" />}>Tab 17 §8.2</Badge>}
          />
          <div className="max-h-80 overflow-y-auto p-2">
            <AnimatePresence initial={false}>
              {[...alerts].sort((a, b) => b.ts - a.ts).map((a) => {
                const zone = zones.find((z) => z.id === a.zoneId);
                return (
                  <motion.button
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      selectAlert(a.id);
                      navigate('/investigation');
                    }}
                    className="flex w-full items-start gap-3 rounded-md px-2.5 py-2.5 text-left hover:bg-surface-2"
                  >
                    <Radar
                      className={cn(
                        'mt-0.5 h-4 w-4 shrink-0',
                        a.status === 'resolved' ? 'text-faint' : 'text-warn'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-medium">{a.title}</span>
                        {a.sovereigntyCritical && <Badge tone="fail">sovereignty</Badge>}
                      </div>
                      <div className="mt-0.5 text-[11px] text-faint">
                        {zone?.name} · {a.detectionType}
                      </div>
                    </div>
                    <Badge tone={SEVERITY_TONE[a.severity]}>{a.severity}</Badge>
                    <Badge tone={a.status === 'resolved' ? 'pass' : 'neutral'}>{a.status}</Badge>
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </Card>

        {/* Solution map — the six scope line items + SOC, stated word-for-word */}
        <Card>
          <CardHeader
            title="Solution map"
            subtitle="the agreement's own scope line items (§2.2)"
            right={<Gauge className="h-4 w-4 text-primary" />}
          />
          <div className="divide-y divide-border">
            {SCOPE_LINE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className="flex w-full items-start justify-between gap-2 px-3.5 py-2.5 text-left hover:bg-surface-2"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="font-mono text-[10px] text-faint">{item.index}</span>
                    {item.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-faint">{item.detail}</div>
                </div>
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <Activity className="h-3.5 w-3.5" />
        A zone's posture changes the instant an alert in it resolves — return here after running Live Investigation to watch Zone C recover with no refresh.
      </p>
    </div>
  );
}

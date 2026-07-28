import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Boxes,
  FileCheck2,
  Gauge,
  KeyRound,
  Network,
  PlayCircle,
  ScrollText,
  ServerCog,
  ShieldCheck,
  Sun,
  Moon,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';
import { useEngine } from '@/lib/store';
import { Button, Mono } from '@/components/ui/primitives';
import { EvaluatorDrawer } from './EvaluatorDrawer';
import { SessionRail } from './SessionRail';
import { useEffect, useState } from 'react';
import { useTick } from '@/hooks/useTick';

const NAV = [
  { to: '/', label: 'Overview', icon: Gauge, end: true },
  { to: '/registry', label: 'Model Registry', icon: Boxes },
  { to: '/gates', label: 'Assurance Gates', icon: ShieldCheck },
  { to: '/authorisation', label: 'Authorisation', icon: KeyRound },
  { to: '/serving', label: 'Serving', icon: ServerCog },
  { to: '/egress', label: 'Sovereignty', icon: Network },
  { to: '/ledger', label: 'Evidence Ledger', icon: ScrollText },
  { to: '/runner', label: 'Demonstration', icon: PlayCircle },
  { to: '/disclosure', label: 'Disclosure', icon: FileCheck2 },
];

export function AppShell() {
  const { theme, toggle } = useTheme();
  const [drawer, setDrawer] = useState(false);
  const resetSession = useEngine((s) => s.resetSession);
  const boot = useEngine((s) => s.boot);
  const egressBlocked = useEngine((s) => s.egress.some((e) => e.verdict === 'BLOCKED'));
  const sessionId = useEngine((s) => s.session.id);
  const location = useLocation();

  // Boot the session once, and run the app-wide time-box heartbeat so grants
  // expire even when the operator is not on the authorisation view.
  useEffect(() => {
    void boot();
  }, [boot]);
  useTick();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-fg">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">NSAIC Assurance</div>
            <div className="text-[10px] uppercase tracking-wider text-faint">
              Sovereign AI Cloud
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/12 font-medium text-primary'
                    : 'text-muted hover:bg-surface-2 hover:text-fg'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 rounded-md border border-border bg-surface-2 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wide text-faint">Session</div>
            <Mono className="text-fg">{sessionId}</Mono>
          </div>
          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            className="w-full"
            onClick={() => void resetSession()}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset session
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                egressBlocked
                  ? 'border-pass/40 bg-pass/10 text-pass'
                  : 'border-pass/30 bg-pass/8 text-pass'
              )}
              title="Sovereign boundary status"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              SOVEREIGN BOUNDARY · SEALED
            </span>
          </div>

          <div className="ml-1 hidden flex-1 lg:block">
            <SessionRail />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="default"
              tone="primary"
              size="sm"
              onClick={() => setDrawer((d) => !d)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Evaluator Control
            </Button>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted hover:bg-surface-2 hover:text-fg"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Routed content */}
        <main key={location.pathname} className="app-grid-bg flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-5">
            <Outlet />
          </div>
        </main>
      </div>

      <EvaluatorDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}

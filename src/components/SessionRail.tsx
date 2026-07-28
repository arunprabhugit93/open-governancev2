import { cn } from '@/lib/cn';
import { PHASES } from '@/lib/phases';
import { useEngine } from '@/lib/store';

export function SessionRail() {
  const phase = useEngine((s) => s.phase);
  const currentIndex = PHASES.find((p) => p.id === phase)?.index ?? 1;

  return (
    <div className="flex items-center gap-1">
      {PHASES.map((p, i) => {
        const state =
          p.index < currentIndex ? 'done' : p.index === currentIndex ? 'active' : 'todo';
        return (
          <div key={p.id} className="flex items-center gap-1">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] transition-colors',
                state === 'active' && 'bg-primary/15 font-semibold text-primary',
                state === 'done' && 'text-pass',
                state === 'todo' && 'text-faint'
              )}
              title={`Phase ${p.index}: ${p.label}`}
            >
              <span
                className={cn(
                  'grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold',
                  state === 'active' && 'bg-primary text-primary-fg',
                  state === 'done' && 'bg-pass/20 text-pass',
                  state === 'todo' && 'bg-surface-2 text-faint'
                )}
              >
                {p.index}
              </span>
              <span className="hidden xl:inline">{p.label}</span>
            </div>
            {i < PHASES.length - 1 && (
              <span
                className={cn(
                  'h-px w-2',
                  p.index < currentIndex ? 'bg-pass/40' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

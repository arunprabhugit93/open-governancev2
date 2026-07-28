import { motion } from 'framer-motion';
import { useEngine, SEED_TENANTS } from '@/lib/store';
import { CLASSIFICATIONS, TIER_THRESHOLD, type Classification, type Grant } from '@/lib/types';
import { formatCountdown } from '@/lib/engine';
import { cn } from '@/lib/cn';
import { useTick } from '@/hooks/useTick';

function latestGrant(grants: Grant[], tenantId: string, tier: Classification) {
  return grants.find((g) => g.tenantId === tenantId && g.tier === tier) ?? null;
}

const cellTone = (g: Grant | null) => {
  if (!g) return 'border-border bg-surface-2 text-faint';
  switch (g.status) {
    case 'AUTHORISED':
      return 'border-pass/40 bg-pass/12 text-pass';
    case 'REFUSED':
      return 'border-fail/30 bg-fail/8 text-fail';
    case 'REVOKED':
      return 'border-fail/50 bg-fail/14 text-fail';
    case 'EXPIRED':
      return 'border-warn/40 bg-warn/12 text-warn';
  }
};

export function AuthMatrix({ compact = false }: { compact?: boolean }) {
  const grants = useEngine((s) => s.grants);
  const now = useTick();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="w-40 px-2 py-1 text-left text-[11px] font-medium uppercase tracking-wide text-faint">
              Tenant \ Tier
            </th>
            {CLASSIFICATIONS.map((c) => (
              <th key={c} className="px-2 py-1 text-center text-[11px] font-medium uppercase tracking-wide text-faint">
                {c}
                <div className="font-mono text-[9px] font-normal text-faint/70">≥{TIER_THRESHOLD[c]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SEED_TENANTS.map((t) => (
            <tr key={t.id}>
              <td className="px-2 py-1 text-left align-middle">
                <div className="truncate text-xs font-medium">{t.name}</div>
                <div className="font-mono text-[10px] text-faint">{t.id}</div>
              </td>
              {CLASSIFICATIONS.map((c) => {
                const g = latestGrant(grants, t.id, c);
                const remaining = g && g.status === 'AUTHORISED' ? g.expiresAt - now : 0;
                return (
                  <td key={c} className="p-0">
                    <motion.div
                      layout
                      className={cn(
                        'grid place-items-center rounded-md border text-center transition-colors',
                        compact ? 'h-11' : 'h-16',
                        cellTone(g)
                      )}
                    >
                      {!g ? (
                        <span className="text-[11px]">—</span>
                      ) : (
                        <div className="leading-tight">
                          <div className="text-[10px] font-semibold">{g.status}</div>
                          {g.status === 'AUTHORISED' && !compact && (
                            <div className="mt-0.5 font-mono text-[11px]">
                              {formatCountdown(remaining)}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

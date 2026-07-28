import { motion } from 'framer-motion';

/** Radial gauge for the Assurance Index. Colour shifts with the score band. */
export function AssuranceGauge({ score, size = 168 }: { score: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const band =
    score >= 80 ? 'var(--pass)' : score >= 60 ? 'var(--warn)' : 'var(--fail)';
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`hsl(${band})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          key={score}
          initial={{ opacity: 0.4, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-semibold tabular"
          style={{ color: `hsl(${band})` }}
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-[11px] uppercase tracking-wide text-faint">
          Assurance Index
        </span>
      </div>
    </div>
  );
}

import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface shadow-card',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-border px-4 py-3',
        className
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-fg">{title}</div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-muted">{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}

type Tone = 'neutral' | 'primary' | 'pass' | 'warn' | 'fail' | 'info';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted border-border',
  primary: 'bg-primary/12 text-primary border-primary/25',
  pass: 'bg-pass/12 text-pass border-pass/25',
  warn: 'bg-warn/14 text-warn border-warn/30',
  fail: 'bg-fail/12 text-fail border-fail/25',
  info: 'bg-info/12 text-info border-info/25',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none',
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'default',
  tone = 'primary',
  size = 'md',
  disabled,
  className,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  tone?: 'primary' | 'fail' | 'neutral';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none select-none';
  const sizes = { sm: 'h-7 px-2.5 text-xs', md: 'h-9 px-3.5 text-sm' };
  const solid: Record<string, string> = {
    primary: 'bg-primary text-primary-fg hover:bg-primary/90',
    fail: 'bg-fail text-white hover:bg-fail/90',
    neutral: 'bg-elevated text-fg hover:bg-surface-2 border border-border',
  };
  const outline: Record<string, string> = {
    primary: 'border border-primary/40 text-primary hover:bg-primary/10',
    fail: 'border border-fail/40 text-fail hover:bg-fail/10',
    neutral: 'border border-border text-fg hover:bg-surface-2',
  };
  const ghost: Record<string, string> = {
    primary: 'text-primary hover:bg-primary/10',
    fail: 'text-fail hover:bg-fail/10',
    neutral: 'text-muted hover:bg-surface-2 hover:text-fg',
  };
  const look =
    variant === 'outline' ? outline[tone] : variant === 'ghost' ? ghost[tone] : solid[tone];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, sizes[size], look, className)}
    >
      {children}
    </button>
  );
}

export function Mono({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('font-mono text-[12px] tabular', className)}>
      {children}
    </span>
  );
}

export function LivePill({ label = 'LIVE' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-pass/30 bg-pass/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-pass">
      <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-pass" />
      {label}
    </span>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
}) {
  const accent: Record<Tone, string> = {
    neutral: 'text-fg',
    primary: 'text-primary',
    pass: 'text-pass',
    warn: 'text-warn',
    fail: 'text-fail',
    info: 'text-info',
  };
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-3">
      <div className="text-[11px] uppercase tracking-wide text-faint">{label}</div>
      <div className={cn('mt-1 text-2xl font-semibold tabular', accent[tone])}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
      {children}
    </div>
  );
}

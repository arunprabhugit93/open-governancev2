import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ShieldOff,
  CircleDashed,
} from 'lucide-react';
import { Badge } from './primitives';
import type { GateState, GrantStatus } from '@/lib/types';

export function GrantStatusBadge({ status }: { status: GrantStatus }) {
  switch (status) {
    case 'AUTHORISED':
      return (
        <Badge tone="pass" icon={<CheckCircle2 className="h-3 w-3" />}>
          AUTHORISED
        </Badge>
      );
    case 'REFUSED':
      return (
        <Badge tone="fail" icon={<XCircle className="h-3 w-3" />}>
          REFUSED
        </Badge>
      );
    case 'REVOKED':
      return (
        <Badge tone="fail" icon={<ShieldOff className="h-3 w-3" />}>
          REVOKED
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge tone="warn" icon={<Clock className="h-3 w-3" />}>
          EXPIRED
        </Badge>
      );
  }
}

export function GateStateIcon({ state }: { state: GateState }) {
  switch (state) {
    case 'pass':
      return <CheckCircle2 className="h-4 w-4 text-pass" />;
    case 'fail':
      return <XCircle className="h-4 w-4 text-fail" />;
    case 'blocked':
      return <ShieldOff className="h-4 w-4 text-fail" />;
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-info" />;
    default:
      return <CircleDashed className="h-4 w-4 text-faint" />;
  }
}

/** Small reference chip tying a UI element to the proposal claim it proves. */
export function ClaimRef({ id }: { id: string }) {
  return (
    <span
      title={`Proves proposal claim ${id}`}
      className="inline-flex items-center rounded border border-primary/25 bg-primary/10 px-1 py-0.5 font-mono text-[10px] font-semibold text-primary"
    >
      {id}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  claims,
  right,
}: {
  title: string;
  subtitle?: string;
  claims?: string[];
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{title}</h1>
          {claims?.map((c) => <ClaimRef key={c} id={c} />)}
        </div>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

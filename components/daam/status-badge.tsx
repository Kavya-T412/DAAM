import {
  Ban,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Clock,
  Hourglass,
  PauseCircle,
  ShieldCheck,
  Wrench,
  XCircle,
  Archive,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetStatus, CustodyStatus, IdentityStatus, Outcome } from '@/lib/daam/types'

type Tone = 'success' | 'warning' | 'error' | 'neutral' | 'pink' | 'ink'

const TONES: Record<Tone, string> = {
  success: 'bg-success/12 text-success border-success/30',
  warning: 'bg-warning/12 text-warning border-warning/30',
  error: 'bg-destructive/10 text-destructive border-destructive/30',
  neutral: 'bg-ink/5 text-muted-foreground border-ink/15',
  pink: 'bg-primary/12 text-[#c2185b] border-primary/30',
  ink: 'bg-ink text-cream border-ink',
}

export function Badge({ tone, icon: Icon, children, className }: { tone: Tone; icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap', TONES[tone], className)}>
      {Icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </span>
  )
}

const IDENTITY: Record<IdentityStatus, [Tone, LucideIcon]> = {
  Pending: ['warning', Hourglass],
  Verified: ['pink', ShieldCheck],
  Active: ['success', CheckCircle2],
  Suspended: ['error', PauseCircle],
  Revoked: ['ink', Ban],
}

export function IdentityStatusBadge({ status }: { status: IdentityStatus }) {
  const [tone, icon] = IDENTITY[status]
  return (
    <Badge tone={tone} icon={icon}>
      {status}
    </Badge>
  )
}

const ASSET: Record<AssetStatus, [Tone, LucideIcon]> = {
  Registered: ['neutral', CircleDashed],
  Active: ['success', CircleDot],
  Maintenance: ['warning', Wrench],
  Retired: ['neutral', Archive],
  Revoked: ['error', Ban],
}

export function AssetStatusBadge({ status, className }: { status: AssetStatus; className?: string }) {
  const [tone, icon] = ASSET[status]
  return (
    <Badge tone={tone} icon={icon} className={className}>
      {status}
    </Badge>
  )
}

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  if (outcome === 'Granted')
    return (
      <Badge tone="success" icon={CheckCircle2}>
        Granted
      </Badge>
    )
  if (outcome === 'Denied')
    return (
      <Badge tone="error" icon={XCircle}>
        Denied
      </Badge>
    )
  return (
    <Badge tone="warning" icon={Clock}>
      Approval required
    </Badge>
  )
}

export function CustodyStatusBadge({ status }: { status: CustodyStatus }) {
  if (status === 'Completed')
    return (
      <Badge tone="success" icon={CheckCircle2}>
        Completed
      </Badge>
    )
  if (status === 'Rejected')
    return (
      <Badge tone="error" icon={XCircle}>
        Rejected
      </Badge>
    )
  return (
    <Badge tone="warning" icon={Clock}>
      Pending approval
    </Badge>
  )
}

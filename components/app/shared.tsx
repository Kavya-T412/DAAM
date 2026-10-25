'use client'

import { Check, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useDaam } from '@/lib/daam/store'
import type { Decision, Identity } from '@/lib/daam/types'
import { VAULT_DID } from '@/lib/daam/mock-data'
import { cn } from '@/lib/utils'
import { Card, Eyebrow } from '@/components/daam/primitives'
import { OutcomeBadge } from '@/components/daam/status-badge'

export function useCaps() {
  const { me } = useDaam()
  const active = Boolean(me && me.status === 'Active' && me.credential === 'Valid')
  return {
    me,
    active,
    isAdmin: active && me?.role === 'Admin',
    canManage: active && (me?.role === 'Admin' || me?.role === 'Manager'),
    isAuditor: me?.role === 'Auditor',
  }
}

export function DidLabel({ did, className, showAlias = true }: { did: string; className?: string; showAlias?: boolean }) {
  const { identityOf } = useDaam()
  const id: Identity | undefined = identityOf(did)
  const alias = did === VAULT_DID ? 'Registry vault' : id?.alias
  return (
    <span className={cn('inline-flex min-w-0 flex-col', className)}>
      {showAlias && alias && <span className="truncate text-sm font-medium text-ink">{alias}</span>}
      <span className="truncate font-mono text-[11px] text-muted-foreground" title={did}>
        {did}
      </span>
    </span>
  )
}

export function Section({
  title,
  eyebrow,
  actions,
  children,
  className,
  ...rest
}: {
  title: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  'data-demo'?: string
}) {
  return (
    <Card className={cn('p-5 md:p-6', className)} {...rest}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="mt-1 font-serif text-2xl leading-tight text-ink">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </Card>
  )
}

export function StatCard({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: string; accent?: boolean }) {
  return (
    <Card className={cn('p-5', accent && 'border-ink bg-ink text-cream')}>
      <p className={cn('font-mono text-[11px] uppercase tracking-[0.16em]', accent ? 'text-secondary' : 'text-muted-foreground')}>{label}</p>
      <p className="mt-3 font-serif text-5xl leading-none">{value}</p>
      {hint && <p className={cn('mt-2 text-xs', accent ? 'text-cream/70' : 'text-muted-foreground')}>{hint}</p>}
    </Card>
  )
}

/** Reveals each policy check in sequence so the evaluation reads as a live process. */
export function DecisionPanel({ decision, animateKey }: { decision: Decision; animateKey: string | number }) {
  const [shown, setShown] = useState(decision.checks.length)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setShown(decision.checks.length)
      return
    }
    setShown(0)
    let i = 0
    const timer = window.setInterval(() => {
      i++
      setShown(i)
      if (i >= decision.checks.length) window.clearInterval(timer)
    }, 160)
    return () => window.clearInterval(timer)
  }, [animateKey, decision.checks.length])

  const complete = shown >= decision.checks.length

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2" aria-label="Policy decision checklist">
        {decision.checks.map((c, i) => (
          <li
            key={c.key}
            className={cn(
              'flex items-start gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-300',
              i < shown ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
              c.pass ? 'border-success/25 bg-success/5' : 'border-destructive/25 bg-destructive/5',
            )}
          >
            <span
              className={cn(
                'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-cream',
                c.pass ? 'bg-success' : 'bg-destructive',
              )}
            >
              {c.pass ? <Check className="size-3" aria-hidden="true" /> : <X className="size-3" aria-hidden="true" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">
                {c.label} <span className="sr-only">{c.pass ? '— passed' : '— failed'}</span>
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">{c.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <div
        className={cn('rounded-2xl border border-ink/15 bg-cream p-4 transition-opacity duration-300', complete ? 'opacity-100' : 'opacity-0')}
        aria-live="polite"
      >
        <OutcomeBadge outcome={decision.outcome} />
        <p className="mt-2 text-sm leading-relaxed text-ink">{decision.reason}</p>
      </div>
    </div>
  )
}

export function KeyValue({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className={cn('mt-1 truncate text-sm text-ink', mono && 'font-mono text-[12px]')}>{children}</dd>
    </div>
  )
}

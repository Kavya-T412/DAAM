'use client'

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useDaam } from '@/lib/daam/store'
import { cn } from '@/lib/utils'

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info }
const TONES = {
  success: 'border-success/40 [&_.icon]:text-success',
  error: 'border-destructive/40 [&_.icon]:text-destructive',
  warning: 'border-warning/40 [&_.icon]:text-warning',
  info: 'border-ink/20 [&_.icon]:text-primary',
}

export function Toaster() {
  const { toasts, dismissToast } = useDaam()
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed top-4 right-4 left-4 z-[80] flex flex-col items-end gap-2 sm:left-auto sm:w-96">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone]
        return (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={cn('pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-card p-3.5 shadow-xl animate-in fade-in slide-in-from-top-2', TONES[t.tone])}
          >
            <Icon className="icon mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs leading-relaxed break-words text-muted-foreground">{t.description}</p>}
            </div>
            <button type="button" onClick={() => dismissToast(t.id)} className="rounded-full p-1 text-muted-foreground hover:bg-ink/5" aria-label="Dismiss notification">
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

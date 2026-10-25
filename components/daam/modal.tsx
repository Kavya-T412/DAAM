'use client'

import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './primitives'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const node = panel.current
    const first = node?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:max-w-lg sm:rounded-3xl',
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-serif text-3xl leading-tight text-ink">
              {title}
            </h2>
            {description && (
              <div id={descId} className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="size-9 px-0" onClick={onClose} aria-label="Close dialog">
            <X />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = 'danger',
  children,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel: string
  tone?: 'danger' | 'primary'
  children?: ReactNode
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      {children}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

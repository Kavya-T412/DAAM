'use client'

import { ChevronDown, LogOut, Wallet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PERSONAS } from '@/lib/daam/mock-data'
import { useDaam } from '@/lib/daam/store'
import { useUi } from '@/lib/daam/ui'
import type { PersonaKey } from '@/lib/daam/types'
import { shortAddr } from '@/lib/daam/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/daam/primitives'
import { IdentityStatusBadge } from '@/components/daam/status-badge'

const KEYS = Object.keys(PERSONAS) as PersonaKey[]

export function PersonaSwitcher() {
  const { state, me, switchPersona, disconnectWallet } = useDaam()
  const ui = useUi()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!state.wallet) {
    return (
      <div data-demo="persona-switcher">
        <Button size="sm" onClick={() => ui.setWalletOpen(true)}>
          <Wallet /> Connect wallet
        </Button>
      </div>
    )
  }

  return (
    <div ref={root} className="relative" data-demo="persona-switcher">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full border border-ink/15 bg-cream py-1 pr-3 pl-1 text-left transition-colors hover:border-ink/40"
      >
        <span className="grid size-8 place-items-center rounded-full bg-ink font-serif text-sm text-cream">
          {(me?.role ?? '?').slice(0, 1)}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="text-xs font-medium text-ink">{me ? `${me.role} · ${me.alias}` : 'Unregistered wallet'}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{me?.did ?? shortAddr(state.wallet.address)}</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="absolute top-full right-0 z-50 mt-2 w-80 rounded-3xl border border-ink/15 bg-card p-2 shadow-2xl">
          <div className="px-3 pt-2 pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Wallet · {state.wallet.provider}</p>
            <p className="mt-1 font-mono text-xs text-ink">{shortAddr(state.wallet.address)}</p>
            <p className="text-[11px] text-muted-foreground">{state.wallet.network}</p>
          </div>
          <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Switch demo persona</p>
          {KEYS.map((k) => {
            const id = state.identities.find((i) => i.did === PERSONAS[k].did)
            const current = me?.did === PERSONAS[k].did
            return (
              <button
                key={k}
                type="button"
                role="menuitemradio"
                aria-checked={current}
                onClick={() => {
                  switchPersona(k)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-accent',
                  current && 'bg-accent',
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{k}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{PERSONAS[k].blurb}</span>
                </span>
                {id && <IdentityStatusBadge status={id.status} />}
              </button>
            )
          })}
          <div className="mt-1 border-t border-border pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                disconnectWallet()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-destructive hover:bg-destructive/5"
            >
              <LogOut className="size-4" aria-hidden="true" /> Disconnect wallet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

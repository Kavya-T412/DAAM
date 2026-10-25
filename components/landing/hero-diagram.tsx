'use client'

import { FileCheck2, Fingerprint, ScrollText, ShieldCheck, Wallet, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Node {
  key: string
  label: string
  sub: string
  icon: LucideIcon
  x: number
  y: number
}

const NODES: Node[] = [
  { key: 'wallet', label: 'Wallet', sub: '0xA82...91F signs in', icon: Wallet, x: 12, y: 18 },
  { key: 'did', label: 'DID', sub: 'did:bel:employee:1023', icon: Fingerprint, x: 50, y: 7 },
  { key: 'policy', label: 'Access Policy', sub: 'role · purpose · state', icon: ShieldCheck, x: 88, y: 24 },
  { key: 'nft', label: 'NFT Passport', sub: 'Token #0001 · Active', icon: ScrollText, x: 86, y: 76 },
  { key: 'audit', label: 'Audit Trail', sub: 'hash verified', icon: FileCheck2, x: 16, y: 82 },
]

export function HeroDiagram() {
  const [active, setActive] = useState(0)
  const [hold, setHold] = useState(false)

  useEffect(() => {
    if (hold || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setActive((a) => (a + 1) % NODES.length), 2200)
    return () => window.clearInterval(t)
  }, [hold])

  const path = NODES.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" onMouseLeave={() => setHold(false)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9292" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FEE7C8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="48" r="40" fill="url(#glow)" />
        <g className="origin-center animate-spin-slow" style={{ transformOrigin: '50px 48px' }}>
          <circle cx="50" cy="48" r="36" fill="none" stroke="#321B2A" strokeOpacity="0.18" strokeWidth="0.25" strokeDasharray="1 2" />
          <circle cx="86" cy="48" r="1.2" fill="#FF467A" />
        </g>
        <g className="animate-spin-slow" style={{ transformOrigin: '50px 48px', animationDirection: 'reverse', animationDuration: '40s' }}>
          <ellipse cx="50" cy="48" rx="44" ry="20" fill="none" stroke="#FF9292" strokeOpacity="0.6" strokeWidth="0.3" transform="rotate(-22 50 48)" />
          <circle cx="8" cy="56" r="1" fill="#321B2A" />
        </g>
        <path d={path} fill="none" stroke="#321B2A" strokeOpacity="0.25" strokeWidth="0.4" />
        <path d={path} fill="none" stroke="#FF467A" strokeWidth="0.6" strokeDasharray="2 2" className="animate-dash" />
      </svg>

      <div className="absolute top-1/2 left-1/2 w-[46%] -translate-x-1/2 -translate-y-[54%]">
        <div className="animate-card-tilt rounded-[22px] bg-ink p-4 text-cream shadow-[0_30px_60px_-20px_rgba(50,27,42,0.6)] [transform-style:preserve-3d] sm:p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-secondary">Asset passport</span>
            <span className="flex items-center gap-1 rounded-full bg-[#7ee2a8]/15 px-2 py-0.5 text-[9px] text-[#a9efc6]">
              <span className="size-1.5 rounded-full bg-[#7ee2a8]" /> Active
            </span>
          </div>
          <p className="mt-3 font-serif text-4xl leading-none sm:text-5xl">#0001</p>
          <p className="mt-1 font-mono text-[10px] text-cream/60">BEL-RM-7821</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[9px]">
            <div>
              <p className="text-cream/50">Owner</p>
              <p className="font-medium">BEL</p>
            </div>
            <div>
              <p className="text-cream/50">Custodian</p>
              <p className="truncate font-mono">emp:1023</p>
            </div>
          </div>
          <div className="relative mt-4 h-8 overflow-hidden rounded-lg bg-cream/5">
            <div className="absolute inset-x-0 h-1/2 animate-scan bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
            <p className="relative flex h-full items-center justify-center font-mono text-[9px] text-cream/70">0x08dd…46d0 ✓</p>
          </div>
        </div>
      </div>

      {NODES.map((n, i) => {
        const Icon = n.icon
        const isActive = i === active
        return (
          <div key={n.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <button
            type="button"
            onMouseEnter={() => {
              setHold(true)
              setActive(i)
            }}
            onFocus={() => {
              setHold(true)
              setActive(i)
            }}
            onBlur={() => setHold(false)}
            className="block animate-float rounded-2xl"
            style={{ animationDelay: `${i * -1.1}s` }}
            aria-label={`${n.label}: ${n.sub}`}
          >
            <span
              className={cn(
                'flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-left shadow-lg transition-all duration-300 sm:px-3',
                isActive ? 'scale-105 border-primary bg-primary text-cream' : 'border-ink/10 bg-cream text-ink',
              )}
            >
              <span className="relative grid size-7 place-items-center rounded-xl bg-ink/5">
                {isActive && <span className="absolute inset-0 rounded-xl bg-cream/40 animate-ping-soft" aria-hidden="true" />}
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="hidden sm:block">
                <span className="block text-xs font-semibold leading-tight">{n.label}</span>
                <span className={cn('block font-mono text-[9px]', isActive ? 'text-cream/80' : 'text-muted-foreground')}>{n.sub}</span>
              </span>
            </span>
          </button>
          </div>
        )
      })}

      <p className="sr-only" aria-live="polite">
        {`Step ${active + 1} of 5: ${NODES[active].label}`}
      </p>
    </div>
  )
}

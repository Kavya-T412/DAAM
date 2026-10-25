'use client'

import { ArrowDown, ArrowRight, Fingerprint, History, ShieldCheck, Wallet } from 'lucide-react'
import { btn } from '@/components/daam/primitives'
import { useUi } from '@/lib/daam/ui'
import { HeroDiagram } from './hero-diagram'

const TRUST = [
  { icon: Fingerprint, label: 'Wallet-authenticated identity' },
  { icon: ShieldCheck, label: 'Policy-driven access' },
  { icon: History, label: 'Tamper-evident asset history' },
]

export function Hero() {
  const { setWalletOpen } = useUi()
  return (
    <section className="relative overflow-hidden">
      <div className="grain pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pt-10 pb-16 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-24">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-cream/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            PS 26125 · Identity · Access · Assets
          </p>
          <h1 className="mt-6 font-serif text-[clamp(3rem,7.4vw,6.4rem)] leading-[0.92] tracking-tight text-ink text-balance">
            Identity you control.{' '}
            <em className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Assets you can verify.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            A unified trust layer for decentralized identity, intelligent access governance, and verifiable digital asset custody.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#platform" className={btn('primary', 'lg')}>
              Explore the Platform <ArrowRight />
            </a>
            <button type="button" onClick={() => setWalletOpen(true)} className={btn('outline', 'lg')}>
              <Wallet /> Connect Wallet
            </button>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-cream/60 px-3 py-2.5 text-sm text-ink">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <HeroDiagram />
      </div>
      <a
        href="#platform"
        className="relative mx-auto mb-6 flex w-fit flex-col items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
      >
        Explore the system
        <span className="grid size-8 place-items-center rounded-full border border-ink/20">
          <ArrowDown className="size-4 animate-bounce" aria-hidden="true" />
        </span>
      </a>
    </section>
  )
}

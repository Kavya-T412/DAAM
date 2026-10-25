'use client'

import { ArrowRight, EyeOff, Hash, KeyRound, Layers, Play, ShieldOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { btn } from '@/components/daam/primitives'
import { useUi } from '@/lib/daam/ui'
import { Reveal } from './reveal'

const POINTS = [
  { icon: KeyRound, title: 'Least privilege by default', body: 'Roles grant only what the job needs; every grant carries a purpose and an expiry.' },
  { icon: ShieldOff, title: 'Status beats possession', body: 'A suspended DID is blocked even if the wallet still works.' },
  { icon: EyeOff, title: 'Private data stays off-chain', body: 'Only hashes and references are anchored. Raw documents never leave the browser.' },
  { icon: Hash, title: 'Tamper-evident by construction', body: 'Records append, never overwrite. Each carries a verifiable reference.' },
  { icon: Layers, title: 'Pluggable chain layer', body: 'The blockchain adapter is isolated so real contracts can replace the simulation.' },
]

export function SecuritySection() {
  const { startDemo } = useUi()
  const router = useRouter()
  return (
    <section id="security" aria-labelledby="security-title" className="scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Security model</p>
          <h2 id="security-title" className="mt-3 font-serif text-5xl leading-[0.98] text-ink text-balance md:text-6xl">
            Trust that is <em className="text-primary">earned per request.</em>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="h-full rounded-3xl border border-border bg-cream p-6">
                <span className="grid size-11 place-items-center rounded-2xl bg-accent text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-serif text-2xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={300}>
            <div className="flex h-full flex-col justify-between rounded-3xl bg-primary p-6 text-cream">
              <div>
                <h3 className="font-serif text-3xl leading-tight">See the whole lifecycle in a few minutes.</h3>
                <p className="mt-2 text-sm text-cream/85">A guided walkthrough: verify, register, grant, transfer, suspend, deny, audit.</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btn('ink', 'md')}
                  onClick={() => {
                    startDemo()
                    router.push('/app')
                  }}
                >
                  <Play /> Start guided demo
                </button>
                <Link href="/app" className={btn('outline', 'md', 'border-cream/40 bg-transparent text-cream hover:bg-cream hover:text-ink')}>
                  Open app <ArrowRight />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

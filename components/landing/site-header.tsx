'use client'

import { ArrowUpRight, Menu, Wallet, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/daam/logo'
import { btn } from '@/components/daam/primitives'
import { shortAddr } from '@/lib/daam/format'
import { useDaam } from '@/lib/daam/store'
import { useUi } from '@/lib/daam/ui'

const LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#security', label: 'Security' },
]

export function SiteHeader() {
  const { state } = useDaam()
  const { setWalletOpen } = useUi()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {state.wallet ? (
            <Link href="/app" className={btn('ink', 'md', 'hidden sm:inline-flex')}>
              <span className="size-2 rounded-full bg-[#7ee2a8]" aria-hidden="true" />
              {shortAddr(state.wallet.address)}
              <ArrowUpRight />
            </Link>
          ) : (
            <button type="button" onClick={() => setWalletOpen(true)} className={btn('primary', 'md', 'hidden sm:inline-flex')}>
              <Wallet /> Connect Wallet
            </button>
          )}
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-ink/15 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ink/10 bg-background px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-ink hover:bg-ink/5">
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              {state.wallet ? (
                <Link href="/app" className={btn('ink', 'lg', 'w-full')}>
                  Open dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setWalletOpen(true)
                  }}
                  className={btn('primary', 'lg', 'w-full')}
                >
                  <Wallet /> Connect Wallet
                </button>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

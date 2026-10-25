'use client'

import {
  Boxes,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Menu,
  Play,
  ScrollText,
  Settings,
  SlidersHorizontal,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { useDaam } from '@/lib/daam/store'
import { useUi } from '@/lib/daam/ui'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/daam/logo'
import { Button, SimLabel } from '@/components/daam/primitives'
import { ConnectGate } from './connect-gate'
import { PersonaSwitcher } from './persona-switcher'

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/app', label: 'Overview', icon: LayoutDashboard },
  { href: '/app/identity', label: 'Identity & Credentials', icon: Fingerprint },
  { href: '/app/assets', label: 'Asset Registry', icon: Boxes },
  { href: '/app/access', label: 'Access Requests', icon: KeyRound },
  { href: '/app/custody', label: 'Chain of Custody', icon: Workflow },
  { href: '/app/audit', label: 'Audit Center', icon: ScrollText },
  { href: '/app/policies', label: 'Policy Management', icon: SlidersHorizontal },
  { href: '/app/settings', label: 'Settings', icon: Settings },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { state } = useDaam()
  const pending =
    state.access.filter((a) => a.outcome === 'Approval Required').length +
    state.custody.filter((c) => c.status === 'Pending Approval').length

  return (
    <ul className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors',
                active ? 'bg-ink text-cream' : 'text-ink/80 hover:bg-ink/5 hover:text-ink',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {href === '/app/access' && pending > 0 && (
                <span className={cn('rounded-full px-1.5 font-mono text-[10px]', active ? 'bg-primary text-cream' : 'bg-primary/15 text-[#c2185b]')}>
                  {pending}
                  <span className="sr-only"> pending approvals</span>
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const ui = useUi()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-peach/40 p-4 lg:flex">
        <div className="px-2 py-2">
          <Logo />
        </div>
        <nav aria-label="Application" className="mt-6 flex-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="rounded-3xl border border-ink/10 bg-cream p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Illustrative prototype. Wallets, NFTs, and transactions are <strong className="text-ink">simulated</strong>; document hashes use real
            SHA-256.
          </p>
          <SimLabel className="mt-3" />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
          <div className="relative flex h-full w-72 flex-col bg-cream p-4 shadow-2xl">
            <div className="flex items-center justify-between px-2 py-2">
              <Logo />
              <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close navigation">
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label="Application" className="mt-4 overflow-y-auto">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-full p-2 hover:bg-ink/5 lg:hidden" aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={ui.startDemo} className="hidden sm:inline-flex">
              <Play /> Guided demo
            </Button>
            <PersonaSwitcher />
          </div>
        </header>
        <main className="flex-1 px-4 py-8 pb-40 md:px-8">
          <div className="mx-auto max-w-6xl">
            <ConnectGate>{children}</ConnectGate>
          </div>
        </main>
      </div>
    </div>
  )
}

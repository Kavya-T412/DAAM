'use client'

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Play, X, Check } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PERSONAS } from '@/lib/daam/mock-data'
import { useDaam } from '@/lib/daam/store'
import { useUi } from '@/lib/daam/ui'
import { cn } from '@/lib/utils'
import { Button } from './primitives'

export const DEMO_ASSET = 'BEL-TX-9001'
export const DEMO_IDENTITY = 'did:bel:employee:2088'

type DaamApi = ReturnType<typeof useDaam>

interface Step {
  title: string
  body: string
  route: string | ((api: DaamApi) => string)
  target?: string
  autoLabel?: string
  auto?: (api: DaamApi) => void | Promise<unknown>
}

const STEPS: Step[] = [
  {
    title: 'Connect as Admin',
    body: 'Open the wallet dialog, choose Demo Wallet, and pick the Admin persona. The wallet resolves to did:bel:admin:0001.',
    route: '/app',
    target: 'persona-switcher',
    autoLabel: 'Connect Admin wallet',
    auto: (api) => api.connectWallet('Demo Wallet', 'Admin'),
  },
  {
    title: 'Verify a pending identity',
    body: `Find ${DEMO_IDENTITY} (Pending) in the identity registry. Verify it and assign the User role.`,
    route: '/app/identity',
    target: `identity-${DEMO_IDENTITY}`,
    autoLabel: 'Verify as User',
    auto: (api) => api.verifyIdentity(DEMO_IDENTITY, 'User'),
  },
  {
    title: 'Register an asset & mint its NFT',
    body: `Register ${DEMO_ASSET} — Transceiver Array. A simulated NFT passport is minted, then the asset is activated for service.`,
    route: '/app/assets',
    target: 'register-asset',
    autoLabel: 'Register & activate',
    auto: (api) => {
      api.registerAsset({ id: DEMO_ASSET, name: 'Transceiver Array', category: 'Communications', purpose: 'Inventory reconciliation' })
      api.changeLifecycle({ assetId: DEMO_ASSET, to: 'Active', purpose: 'Operational deployment' })
    },
  },
  {
    title: 'Assign an eligible custodian',
    body: `Transfer custody of ${DEMO_ASSET} from the registry vault to ${DEMO_IDENTITY}. The organization stays the owner.`,
    route: '/app/custody',
    target: 'transfer-form',
    autoLabel: 'Assign custodian',
    auto: (api) => api.transferCustody({ assetId: DEMO_ASSET, to: DEMO_IDENTITY, purpose: 'Operational deployment' }),
  },
  {
    title: 'Switch to the Manager persona',
    body: 'Use the persona switcher to act as did:bel:manager:0417. Available actions change with the role.',
    route: '/app',
    target: 'persona-switcher',
    autoLabel: 'Switch to Manager',
    auto: (api) => api.switchPersona('Manager'),
  },
  {
    title: 'Request purpose-bound access',
    body: `Request "View maintenance record" on ${DEMO_ASSET} for the purpose "Scheduled maintenance".`,
    route: '/app/access',
    target: 'access-form',
    autoLabel: 'Submit request',
    auto: (api) =>
      api.requestAccess({ did: PERSONAS.Manager.did, assetId: DEMO_ASSET, action: 'view_maintenance', purpose: 'Scheduled maintenance', durationDays: 7 }),
  },
  {
    title: 'See the policy engine grant access',
    body: 'Every check in the decision checklist passes, so access is granted with a clear explanation — recorded in the decision history.',
    route: '/app/access',
    target: 'access-history',
  },
  {
    title: 'Move the asset into Maintenance',
    body: 'On the asset passport, transition Active → Maintenance. The timeline, audit log, and dependent decisions update instantly.',
    route: `/app/assets/${DEMO_ASSET}`,
    target: 'lifecycle',
    autoLabel: 'Set Maintenance',
    auto: (api) => api.changeLifecycle({ assetId: DEMO_ASSET, to: 'Maintenance', purpose: 'Scheduled maintenance' }),
  },
  {
    title: 'Hand custody to the maintenance team',
    body: `Transfer ${DEMO_ASSET} to did:bel:maint:team-07 for scheduled maintenance. Prior history is preserved.`,
    route: '/app/custody',
    target: 'transfer-form',
    autoLabel: 'Transfer to team-07',
    auto: (api) => api.transferCustody({ assetId: DEMO_ASSET, to: 'did:bel:maint:team-07', purpose: 'Scheduled maintenance' }),
  },
  {
    title: 'Anchor a maintenance document hash',
    body: 'Attach a maintenance report. Its SHA-256 hash is computed in your browser; only the hash is placed on the audit trail.',
    route: `/app/assets/${DEMO_ASSET}`,
    target: 'documents',
    autoLabel: 'Anchor document',
    auto: (api) =>
      api.addDocument({
        assetId: DEMO_ASSET,
        name: 'Maintenance report — RF alignment',
        content: `Maintenance report | Asset ${DEMO_ASSET} | RF alignment performed. Output nominal. Technician: team-07.`,
        purpose: 'Scheduled maintenance',
      }),
  },
  {
    title: 'Switch to the Auditor persona',
    body: 'Auditors get read-only access: they can inspect and verify, but cannot edit assets, transfer NFTs, or change permissions.',
    route: '/app',
    target: 'persona-switcher',
    autoLabel: 'Switch to Auditor',
    auto: (api) => api.switchPersona('Auditor'),
  },
  {
    title: 'Inspect the asset passport',
    body: 'Review ownership vs. custody, the lifecycle timeline, and the complete chain of custody for the asset.',
    route: `/app/assets/${DEMO_ASSET}`,
    target: 'custody-timeline',
  },
  {
    title: 'Verify the document hash',
    body: 'In the Audit Center, re-hash the private copy with Web Crypto and compare it to the anchored reference.',
    route: (api) => {
      const doc = api.state.documents.find((d) => d.assetId === DEMO_ASSET)
      return doc ? `/app/audit?doc=${doc.id}&verify=1` : '/app/audit'
    },
    target: 'doc-verifier',
  },
  {
    title: 'Suspend the original identity',
    body: `Return to Admin and suspend ${DEMO_IDENTITY}. Suspension blocks protected operations immediately — without touching the wallet.`,
    route: '/app/identity',
    target: `identity-${DEMO_IDENTITY}`,
    autoLabel: 'Switch & suspend',
    auto: (api) => {
      api.switchPersona('Admin')
      api.suspendIdentity(DEMO_IDENTITY)
    },
  },
  {
    title: 'Attempt a protected operation',
    body: `Request access on ${DEMO_ASSET} as ${DEMO_IDENTITY}. The policy engine denies it and explains why.`,
    route: '/app/access',
    target: 'access-form',
    autoLabel: 'Attempt request',
    auto: (api) => api.requestAccess({ did: DEMO_IDENTITY, assetId: DEMO_ASSET, action: 'view_metadata', purpose: 'Scheduled maintenance' }),
  },
  {
    title: 'Inspect the audit trail',
    body: 'The Audit Center shows the identity suspension and the access denial as tamper-evident events with simulated references.',
    route: '/app/audit',
    target: 'audit-explorer',
  },
]

export function GuidedDemo() {
  const ui = useUi()
  const api = useDaam()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [done, setDone] = useState<Set<number>>(new Set())
  const step = STEPS[ui.demoStep]

  useEffect(() => {
    if (!ui.demoActive || !step?.target) return
    let el: Element | null = null
    let tries = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setInterval(() => {
      el = document.querySelector(`[data-demo="${CSS.escape(step.target!)}"]`)
      tries++
      if (el) {
        el.classList.add('demo-highlight')
        el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
        window.clearInterval(timer)
      } else if (tries > 12) window.clearInterval(timer)
    }, 250)
    return () => {
      window.clearInterval(timer)
      el?.classList.remove('demo-highlight')
    }
  }, [ui.demoActive, ui.demoStep, pathname, step?.target])

  if (!ui.demoActive || !step) return null

  const routeFor = (s: Step) => (typeof s.route === 'function' ? s.route(api) : s.route)
  const go = (index: number) => {
    const next = STEPS[index]
    if (!next) return
    ui.setDemoStep(index)
    const target = routeFor(next)
    if (target.split('?')[0] !== pathname || target.includes('?')) router.push(target)
  }

  const runAuto = async () => {
    if (!step.auto) return
    const target = routeFor(step)
    if (target.split('?')[0] !== pathname) router.push(target)
    await step.auto(api)
    setDone((prev) => new Set(prev).add(ui.demoStep))
  }

  const progress = ((ui.demoStep + 1) / STEPS.length) * 100

  return (
    <aside
      aria-label="Guided demo"
      className="fixed right-4 bottom-4 left-4 z-[60] sm:left-auto sm:w-[400px]"
    >
      <div className="overflow-hidden rounded-3xl border border-ink/15 bg-ink text-cream shadow-2xl">
        <div className="h-1 bg-cream/10">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between gap-2 px-5 pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-secondary">
            Guided demo · {ui.demoStep + 1}/{STEPS.length}
          </p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setCollapsed((c) => !c)} className="rounded-full p-1.5 hover:bg-cream/10" aria-label={collapsed ? 'Expand guided demo' : 'Collapse guided demo'} aria-expanded={!collapsed}>
              {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <button type="button" onClick={ui.stopDemo} className="rounded-full p-1.5 hover:bg-cream/10" aria-label="Exit guided demo">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="px-5 pb-5">
          <h2 className="mt-1 flex items-center gap-2 font-serif text-2xl leading-tight">
            {done.has(ui.demoStep) && <Check className="size-5 text-secondary" aria-label="Completed" />}
            {step.title}
          </h2>
          {!collapsed && (
            <>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">{step.body}</p>
              <ol className="mt-4 flex gap-1" aria-hidden="true">
                {STEPS.map((_, i) => (
                  <li key={i} className={cn('h-1 flex-1 rounded-full', i < ui.demoStep || done.has(i) ? 'bg-secondary' : i === ui.demoStep ? 'bg-primary' : 'bg-cream/15')} />
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" className="text-cream hover:bg-cream/10" onClick={() => go(ui.demoStep - 1)} disabled={ui.demoStep === 0}>
                  <ChevronLeft /> Back
                </Button>
                {step.auto && (
                  <Button size="sm" onClick={runAuto}>
                    <Play /> {step.autoLabel}
                  </Button>
                )}
                {ui.demoStep < STEPS.length - 1 ? (
                  <Button size="sm" className="ml-auto bg-cream text-ink shadow-none hover:bg-white" onClick={() => go(ui.demoStep + 1)}>
                    Next <ChevronRight />
                  </Button>
                ) : (
                  <Button size="sm" className="ml-auto bg-cream text-ink shadow-none hover:bg-white" onClick={ui.stopDemo}>
                    Finish
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

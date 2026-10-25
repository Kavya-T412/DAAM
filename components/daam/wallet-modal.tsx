'use client'

import { ArrowRight, Info, Sparkles, UserPlus, Wallet } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { PERSONAS } from '@/lib/daam/mock-data'
import { useDaam } from '@/lib/daam/store'
import { useUi } from '@/lib/daam/ui'
import type { PersonaKey } from '@/lib/daam/types'
import { cn } from '@/lib/utils'
import { Modal } from './modal'
import { Button, Mono, SimLabel } from './primitives'

const PERSONA_KEYS: PersonaKey[] = ['Admin', 'Manager', 'User', 'Auditor']

export function WalletModal() {
  const { walletOpen, setWalletOpen } = useUi()
  const { connectWallet, identityOf } = useDaam()
  const router = useRouter()
  const pathname = usePathname()
  const [stage, setStage] = useState<'providers' | 'persona'>('providers')
  const [notice, setNotice] = useState<string | null>(null)
  const [persona, setPersona] = useState<PersonaKey | 'unregistered'>('Admin')

  const close = () => {
    setWalletOpen(false)
    setStage('providers')
    setNotice(null)
  }

  const connect = () => {
    connectWallet('Demo Wallet', persona)
    close()
    if (!pathname.startsWith('/app')) router.push('/app')
  }

  return (
    <Modal
      open={walletOpen}
      onClose={close}
      title={stage === 'providers' ? 'Connect a wallet' : 'Choose a demo persona'}
      description={
        stage === 'providers'
          ? 'Your wallet is your login. It resolves to a decentralized identifier (DID) in the identity registry.'
          : 'Each persona is a separate demo wallet linked to a DID with a different role.'
      }
    >
      {stage === 'providers' ? (
        <div className="flex flex-col gap-2.5">
          {(['MetaMask', 'WalletConnect'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() =>
                setNotice(
                  `${p} is not connected in this prototype. The connection layer is isolated so a real ${p} adapter and signature verification can be added later. Use the Demo Wallet to continue.`,
                )
              }
              className="flex items-center justify-between rounded-2xl border border-border bg-cream px-4 py-3.5 text-left transition-colors hover:border-ink/40"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-muted">
                  <Wallet className="size-5 text-ink" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-medium text-ink">{p}</span>
                  <span className="text-xs text-muted-foreground">Real adapter not configured</span>
                </span>
              </span>
              <Info className="size-4 text-muted-foreground" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStage('persona')}
            className="flex items-center justify-between rounded-2xl border-2 border-primary bg-primary/8 px-4 py-3.5 text-left transition-transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-cream">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-medium text-ink">Demo Wallet</span>
                <span className="text-xs text-muted-foreground">Simulated connection — no real chain</span>
              </span>
            </span>
            <ArrowRight className="size-4 text-primary" aria-hidden="true" />
          </button>
          {notice && (
            <p role="status" className="mt-1 rounded-2xl bg-warning/10 p-3 text-xs leading-relaxed text-warning">
              {notice}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">Demo persona</legend>
            {PERSONA_KEYS.map((key) => {
              const id = identityOf(PERSONAS[key].did)
              return (
                <label
                  key={key}
                  className={cn(
                    'cursor-pointer rounded-2xl border bg-cream p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary',
                    persona === key ? 'border-primary ring-2 ring-primary/25' : 'border-border hover:border-ink/40',
                  )}
                >
                  <input type="radio" name="persona" value={key} checked={persona === key} onChange={() => setPersona(key)} className="sr-only" />
                  <span className="flex items-center justify-between">
                    <span className="font-medium text-ink">{key}</span>
                    {id && <span className="text-[10px] text-muted-foreground">{id.status}</span>}
                  </span>
                  <Mono className="mt-1 block truncate text-muted-foreground">{PERSONAS[key].did}</Mono>
                  <span className="mt-1 block text-xs text-muted-foreground">{PERSONAS[key].blurb}</span>
                </label>
              )
            })}
            <label
              className={cn(
                'cursor-pointer rounded-2xl border border-dashed bg-cream p-3 sm:col-span-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary',
                persona === 'unregistered' ? 'border-primary ring-2 ring-primary/25' : 'border-ink/25 hover:border-ink/50',
              )}
            >
              <input type="radio" name="persona" value="unregistered" checked={persona === 'unregistered'} onChange={() => setPersona('unregistered')} className="sr-only" />
              <span className="flex items-center gap-2 font-medium text-ink">
                <UserPlus className="size-4" aria-hidden="true" /> New wallet (no DID yet)
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">Walk through identity registration and administrator approval.</span>
            </label>
          </fieldset>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground">
            <span>No signature is requested and no transaction is sent.</span>
            <SimLabel />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => setStage('providers')}>
              Back
            </Button>
            <Button onClick={connect} data-demo="connect-confirm">
              Connect demo wallet <ArrowRight />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

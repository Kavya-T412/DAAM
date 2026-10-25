'use client'

import { Hourglass, ShieldCheck, Wallet } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useDaam } from '@/lib/daam/store'
import { useUi } from '@/lib/daam/ui'
import { ROLES, type Role } from '@/lib/daam/types'
import { shortAddr } from '@/lib/daam/format'
import { Button, Card, Eyebrow, Field, Input, Select, SimLabel } from '@/components/daam/primitives'

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center py-10">
      <Card className="w-full p-8">{children}</Card>
    </div>
  )
}

export function ConnectGate({ children }: { children: ReactNode }) {
  const { state, me, registerIdentity, approveRegistration } = useDaam()
  const ui = useUi()
  const [alias, setAlias] = useState('')
  const [role, setRole] = useState<Role>('User')

  if (!state.wallet) {
    return (
      <Shell>
        <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Wallet className="size-6" aria-hidden="true" />
        </span>
        <Eyebrow className="mt-6">Wallet authentication</Eyebrow>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ink text-balance">Connect a wallet to resolve your DID.</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Your wallet proves control of a key. The DID registry maps that key to a verifiable organizational identity, role, and credential status.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => ui.setWalletOpen(true)}>
            <Wallet /> Connect wallet
          </Button>
          <Button variant="outline" onClick={ui.startDemo}>
            Start guided demo
          </Button>
          <SimLabel />
        </div>
      </Shell>
    )
  }

  if (!me) {
    const submit = (e: FormEvent) => {
      e.preventDefault()
      registerIdentity({ alias: alias.trim(), requestedRole: role })
    }
    return (
      <Shell>
        <Eyebrow>No DID linked</Eyebrow>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ink">Register your identity</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Wallet <span className="font-mono text-ink">{shortAddr(state.wallet.address)}</span> is connected but not registered. Submit a
          registration request; an administrator must verify it before any protected operation is allowed.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <Field label="Display name" htmlFor="reg-alias">
            <Input id="reg-alias" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="e.g. Design Engineer" maxLength={60} />
          </Field>
          <Field label="Requested role" htmlFor="reg-role" hint="The administrator can change this during verification.">
            <Select id="reg-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.filter((r) => r !== 'Admin').map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Button type="submit" className="self-start">
            Submit registration
          </Button>
        </form>
      </Shell>
    )
  }

  if (me.status === 'Pending') {
    return (
      <Shell>
        <span className="grid size-12 place-items-center rounded-2xl bg-warning/15 text-warning">
          <Hourglass className="size-6" aria-hidden="true" />
        </span>
        <Eyebrow className="mt-6">Awaiting verification</Eyebrow>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ink">Registration pending</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-mono text-ink">{me.did}</span> has requested the <strong className="text-ink">{me.role}</strong> role. Until an
          administrator verifies it, the policy engine blocks all protected operations.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => approveRegistration(me.did)}>
            <ShieldCheck /> Simulate admin approval
          </Button>
          <SimLabel />
        </div>
      </Shell>
    )
  }

  return <>{children}</>
}

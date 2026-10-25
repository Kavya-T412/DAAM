'use client'

import {
  Code,
  Download,
  Fingerprint,
  Layers,
  Lock,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { useCaps, DidLabel, KeyValue, Section, StatCard } from '@/components/app/shared'
import {
  Button,
  Card,
  Eyebrow,
  Field,
  Input,
  Mono,
  PageHeader,
  Select,
  SimLabel,
} from '@/components/daam/primitives'
import { useDaam } from '@/lib/daam/store'
import { useUi } from '@/lib/daam/ui'
import { shortAddr } from '@/lib/daam/format'
import { PERSONAS } from '@/lib/daam/mock-data'
import type { PersonaKey } from '@/lib/daam/types'

export default function SettingsPage() {
  const { state, me, resetDemo, switchPersona, disconnectWallet } = useDaam()
  const ui = useUi()

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `daam-governance-export-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Platform Environment & Integrations"
        title="Settings & Prototype Governance"
        description="Inspect simulated environment configurations, reset demo states to seed data, export verifiable audit snapshots, and review smart contract deployment readiness."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Session & Persona Management */}
        <Section
          eyebrow="Identity Session"
          title="Connected Wallet & DID Session"
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-cream p-4 text-xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-semibold text-ink">{state.wallet?.provider ?? 'None'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Wallet Address:</span>
                <Mono className="text-ink">{state.wallet?.address ?? 'Not connected'}</Mono>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active DID:</span>
                <Mono className="text-primary">{me?.did ?? 'None'}</Mono>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-semibold text-ink">{me?.role ?? 'None'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Network:</span>
                <span className="text-muted-foreground">{state.wallet?.network ?? '—'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => ui.setWalletOpen(true)}>
                <Wallet className="size-3.5" /> Reconnect / Switch Wallet
              </Button>
              <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-destructive">
                Disconnect Session
              </Button>
            </div>
          </div>
        </Section>

        {/* Demo Controls & Data Management */}
        <Section
          eyebrow="Evaluation Controls"
          title="Demo Sandbox Management"
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-cream p-4 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-ink">Reset Demo:</strong> Restores all identities, registered assets, custody
              records, access history, and policy rules back to their pristine illustrative seed state.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={resetDemo}>
                <RotateCcw className="size-4" /> Reset Demo to Initial State
              </Button>
              <Button onClick={handleExportJson}>
                <Download className="size-4" /> Export State Snapshot (JSON)
              </Button>
            </div>
          </div>
        </Section>
      </div>

      {/* Smart Contract Readiness Specifications */}
      <Section
        eyebrow="Enterprise Architecture"
        title="Smart Contract & Web3 Integration Readiness"
        actions={<SimLabel />}
      >
        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
          The DAAM frontend has been intentionally engineered with modular adapters. In production, mock store
          dispatches map 1:1 to EVM smart contract transactions and decentralized storage endpoints.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4 bg-cream">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-ink">
              <Code className="size-4 text-primary" /> DIDRegistry.sol
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Maintains on-chain mapping between wallet addresses and organizational DIDs, role credentials, and active
              suspension flags.
            </p>
            <div className="mt-3 rounded-lg border border-border bg-card p-2 font-mono text-[10px] text-muted-foreground">
              resolveDID(address) <br />
              setIdentityStatus(did, status)
            </div>
          </Card>

          <Card className="p-4 bg-cream">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-ink">
              <Code className="size-4 text-primary" /> AssetPassportNFT.sol
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              ERC-721 token contract enforcing strict separation of organizational ownership from operational custody.
            </p>
            <div className="mt-3 rounded-lg border border-border bg-card p-2 font-mono text-[10px] text-muted-foreground">
              mintPassport(to, metadataHash) <br />
              transferCustody(tokenId, to, purpose)
            </div>
          </Card>

          <Card className="p-4 bg-cream">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-ink">
              <Code className="size-4 text-primary" /> AuditAnchor.sol
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Append-only audit event repository recording SHA-256 document fingerprints, actor signatures, and custody
              hashes.
            </p>
            <div className="mt-3 rounded-lg border border-border bg-card p-2 font-mono text-[10px] text-muted-foreground">
              anchorDocumentHash(assetId, hash) <br />
              logAccessDecision(record)
            </div>
          </Card>
        </div>
      </Section>
    </div>
  )
}

'use client'

import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  Fingerprint,
  KeyRound,
  Play,
  Plus,
  RefreshCw,
  ScrollText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Workflow,
  Wrench,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useCaps, DidLabel, KeyValue, Section, StatCard } from '@/components/app/shared'
import { Button, Card, Eyebrow, Mono, PageHeader, SimLabel } from '@/components/daam/primitives'
import {
  AssetStatusBadge,
  Badge,
  CustodyStatusBadge,
  IdentityStatusBadge,
  OutcomeBadge,
} from '@/components/daam/status-badge'
import { useDaam } from '@/lib/daam/store'
import { useUi } from '@/lib/daam/ui'
import { formatDate, shortAddr, shortHash } from '@/lib/daam/format'
import { cn } from '@/lib/utils'

export default function OverviewPage() {
  const { state, me, decideAccess, decideCustody } = useDaam()
  const { isAdmin, canManage, isAuditor } = useCaps()
  const ui = useUi()

  const registeredAssets = state.assets.length
  const activeIdentities = state.identities.filter((i) => i.status === 'Active').length
  const pendingAccess = state.access.filter((a) => a.outcome === 'Approval Required')
  const pendingCustody = state.custody.filter((c) => c.status === 'Pending Approval')
  const totalPending = pendingAccess.length + pendingCustody.length

  // Lifecycle breakdown
  const lifecycleCounts = {
    Registered: state.assets.filter((a) => a.status === 'Registered').length,
    Active: state.assets.filter((a) => a.status === 'Active').length,
    Maintenance: state.assets.filter((a) => a.status === 'Maintenance').length,
    Retired: state.assets.filter((a) => a.status === 'Retired').length,
    Revoked: state.assets.filter((a) => a.status === 'Revoked').length,
  }

  // Identity distribution
  const identityStatusCounts = {
    Active: state.identities.filter((i) => i.status === 'Active').length,
    Verified: state.identities.filter((i) => i.status === 'Verified').length,
    Pending: state.identities.filter((i) => i.status === 'Pending').length,
    Suspended: state.identities.filter((i) => i.status === 'Suspended').length,
    Revoked: state.identities.filter((i) => i.status === 'Revoked').length,
  }

  // Assets requiring attention (Maintenance or Revoked or Pending Custody)
  const attentionAssets = state.assets.filter(
    (a) => a.status === 'Maintenance' || a.status === 'Revoked' || pendingCustody.some((c) => c.assetId === a.id),
  )

  // Recent audit events
  const recentAudit = state.audit.slice(0, 6)

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Command & Governance Center"
        title="Decentralized Trust & Asset Operations"
        description="Unified operational dashboard tracking wallet-authenticated identities, purpose-governed authorizations, NFT digital asset passports, and privacy-preserving audit logs."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={ui.startDemo}>
              <Play className="size-3.5" /> Start Guided Walkthrough
            </Button>
            {isAdmin && (
              <Link href="/app/assets">
                <Button size="sm">
                  <Plus className="size-3.5" /> Mint Asset Passport
                </Button>
              </Link>
            )}
            {canManage && !isAdmin && (
              <Link href="/app/custody">
                <Button size="sm">
                  <Workflow className="size-3.5" /> Transfer Custody
                </Button>
              </Link>
            )}
            {isAuditor && (
              <Link href="/app/audit">
                <Button size="sm" variant="ink">
                  <FileCheck2 className="size-3.5" /> Verify Hashes
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Persona Context Banner */}
      <Card className="relative overflow-hidden border-ink/15 bg-gradient-to-r from-cream via-cream to-peach/30 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink font-serif text-lg text-cream shadow-sm">
              {me?.role.slice(0, 1) ?? 'U'}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-ink">{me?.alias ?? 'Active Session'}</span>
                <Badge tone="ink">{me?.role ?? 'User'}</Badge>
                {me && <IdentityStatusBadge status={me.status} />}
                <SimLabel />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                DID: <span className="text-ink">{me?.did}</span> · Wallet:{' '}
                <span className="text-ink">{shortAddr(state.wallet?.address ?? '')}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isAdmin && (
              <span className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 font-medium text-ink">
                Admin mode: full authority over policy, identity verification, and asset registry
              </span>
            )}
            {me?.role === 'Manager' && (
              <span className="rounded-xl border border-border bg-ink/5 px-3 py-1.5 font-medium text-ink">
                Manager mode: can initiate/approve custody transfers and execute state transitions
              </span>
            )}
            {me?.role === 'Auditor' && (
              <span className="rounded-xl border border-ink/20 bg-ink/10 px-3 py-1.5 font-medium text-ink">
                Auditor mode: read-only access with cryptographic hash verification capabilities
              </span>
            )}
            {me?.role === 'Engineer' && (
              <span className="rounded-xl border border-border bg-ink/5 px-3 py-1.5 font-medium text-ink">
                Operational mode: request purpose-bound access and execute scheduled maintenance
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Four Core Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/app/assets" className="group block focus:outline-none">
          <StatCard
            label="Registered Assets"
            value={
              <span className="flex items-baseline justify-between">
                <span>{registeredAssets}</span>
                <Boxes className="size-6 text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-primary" />
              </span>
            }
            hint={`${lifecycleCounts.Active} active · ${lifecycleCounts.Maintenance} in maintenance`}
          />
        </Link>
        <Link href="/app/identity" className="group block focus:outline-none">
          <StatCard
            label="Active Identities"
            value={
              <span className="flex items-baseline justify-between">
                <span>{activeIdentities}</span>
                <Fingerprint className="size-6 text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-primary" />
              </span>
            }
            hint={`${identityStatusCounts.Pending} pending verification · ${identityStatusCounts.Suspended} suspended`}
          />
        </Link>
        <Link href="/app/access" className="group block focus:outline-none">
          <StatCard
            label="Pending Approvals"
            value={
              <span className="flex items-baseline justify-between">
                <span className={cn(totalPending > 0 && 'text-primary')}>{totalPending}</span>
                <KeyRound
                  className={cn(
                    'size-6 transition-transform group-hover:scale-110',
                    totalPending > 0 ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
              </span>
            }
            hint={`${pendingAccess.length} access requests · ${pendingCustody.length} custody transfers`}
            accent={totalPending > 0}
          />
        </Link>
        <Link href="/app/custody" className="group block focus:outline-none">
          <StatCard
            label="Custody Events"
            value={
              <span className="flex items-baseline justify-between">
                <span>{state.custody.length}</span>
                <Workflow className="size-6 text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-primary" />
              </span>
            }
            hint="Tamper-evident chain of custody log"
          />
        </Link>
      </div>

      {/* Animated Trust Layer System Diagram */}
      <Section
        eyebrow="Architecture Visualization"
        title="Interactive Trust Flow: Identity → Policy → Passport → Audit"
        className="overflow-hidden"
      >
        <div className="relative rounded-2xl border border-ink/10 bg-cream/80 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-4 md:items-center">
            {/* Step 1: Wallet & DID */}
            <div className="relative rounded-2xl border border-border bg-card p-4 transition-transform hover:-translate-y-1">
              <span className="grid size-9 place-items-center rounded-xl bg-ink text-cream">
                <Fingerprint className="size-4" />
              </span>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Layer 01</p>
              <h3 className="mt-1 font-serif text-lg text-ink">Decentralized DID</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Wallet signature resolves to <Mono className="text-ink">did:bel:...</Mono> with verified role and status.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-success">
                <CheckCircle2 className="size-3" /> Status-gated entry
              </div>
            </div>

            {/* Step 2: Policy Engine */}
            <div className="relative rounded-2xl border border-border bg-card p-4 transition-transform hover:-translate-y-1">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-cream">
                <ShieldCheck className="size-4" />
              </span>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Layer 02</p>
              <h3 className="mt-1 font-serif text-lg text-ink">Dynamic RBAC</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Evaluates requester DID, target asset state, requested action, and purpose dynamically.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-primary">
                <Sparkles className="size-3" /> Purpose-bound rules
              </div>
            </div>

            {/* Step 3: NFT Passport */}
            <div className="relative rounded-2xl border border-border bg-card p-4 transition-transform hover:-translate-y-1">
              <span className="grid size-9 place-items-center rounded-xl bg-ink text-cream">
                <Boxes className="size-4" />
              </span>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Layer 03</p>
              <h3 className="mt-1 font-serif text-lg text-ink">NFT Passport</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                ERC-721 token bound to metadata hash, owner vs. operational custodian, and lifecycle state.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#c2185b]">
                <Workflow className="size-3" /> Custody decoupled
              </div>
            </div>

            {/* Step 4: Verifiable Audit */}
            <div className="relative rounded-2xl border border-border bg-card p-4 transition-transform hover:-translate-y-1">
              <span className="grid size-9 place-items-center rounded-xl bg-ink text-cream">
                <ScrollText className="size-4" />
              </span>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Layer 04</p>
              <h3 className="mt-1 font-serif text-lg text-ink">Zero-Leak Audit</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Sensitive files remain encrypted off-chain; SHA-256 integrity hashes anchored to verifiable log.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-success">
                <CheckCircle2 className="size-3" /> Web Crypto SHA-256
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Pending Approvals Queue (Actionable for Admin/Manager) */}
      {totalPending > 0 && (
        <Section
          eyebrow="Governance Queue"
          title={`Items Awaiting Approval (${totalPending})`}
          actions={
            <Link href="/app/access">
              <Button variant="ghost" size="sm">
                View all in Access Console <ArrowRight className="size-3" />
              </Button>
            </Link>
          }
        >
          <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-cream">
            {pendingAccess.map((req) => (
              <div key={req.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ink">{req.id}</span>
                    <Badge tone="warning">Access Request</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(req.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink">
                    Action: <strong className="text-primary">{req.action}</strong> on asset{' '}
                    <strong className="text-ink">{req.assetId}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requester: <DidLabel did={req.did} className="inline-flex" /> · Purpose: &ldquo;{req.purpose}&rdquo;
                  </p>
                  <p className="mt-0.5 text-xs text-warning">{req.reason}</p>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => decideAccess(req.id, false)}>
                      <XCircle className="size-3.5" /> Decline
                    </Button>
                    <Button size="sm" onClick={() => decideAccess(req.id, true)}>
                      <CheckCircle2 className="size-3.5" /> Approve
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Requires Admin or Manager review</span>
                )}
              </div>
            ))}

            {pendingCustody.map((cus) => (
              <div key={cus.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ink">{cus.id}</span>
                    <Badge tone="warning">Custody Transfer</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(cus.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink">
                    Transfer asset <strong className="text-ink">{cus.assetId}</strong> →{' '}
                    <span className="text-primary">{cus.to}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From: <span className="font-mono">{cus.from}</span> · Initiated by: <span className="font-mono">{cus.initiator}</span> · Purpose: &ldquo;{cus.purpose}&rdquo;
                  </p>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => decideCustody(cus.id, false)}>
                      <XCircle className="size-3.5" /> Reject
                    </Button>
                    <Button size="sm" onClick={() => decideCustody(cus.id, true)}>
                      <CheckCircle2 className="size-3.5" /> Approve Transfer
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Requires Admin or Manager review</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Two Column Layout: Asset Attention & Lifecycle / Identity Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets Requiring Attention */}
        <Section
          eyebrow="Asset Status & Health"
          title="Assets Requiring Attention"
          actions={
            <Link href="/app/assets">
              <Button variant="ghost" size="sm">
                All Assets <ArrowRight className="size-3" />
              </Button>
            </Link>
          }
        >
          {attentionAssets.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              All registered assets are currently Active with clear custody.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-cream">
              {attentionAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/app/assets/${asset.id}`}
                        className="font-mono text-sm font-semibold text-ink hover:text-primary hover:underline"
                      >
                        {asset.id}
                      </Link>
                      <AssetStatusBadge status={asset.status} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {asset.name} · Custodian: <DidLabel did={asset.custodian} className="inline-flex" />
                    </p>
                  </div>
                  <Link href={`/app/assets/${asset.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="size-3.5" /> Passport
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Lifecycle Overview Counts */}
          <div className="mt-5 grid grid-cols-5 gap-2 rounded-2xl border border-border bg-card p-3 text-center">
            {(['Registered', 'Active', 'Maintenance', 'Retired', 'Revoked'] as const).map((st) => (
              <div key={st} className="p-1">
                <p className="font-serif text-xl font-medium text-ink">{lifecycleCounts[st]}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{st}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Identity & RBAC Distribution */}
        <Section
          eyebrow="Identity Trust Distribution"
          title="Decentralized Identity States"
          actions={
            <Link href="/app/identity">
              <Button variant="ghost" size="sm">
                Identity Registry <ArrowRight className="size-3" />
              </Button>
            </Link>
          }
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-cream p-4">
            {(['Active', 'Verified', 'Pending', 'Suspended', 'Revoked'] as const).map((status) => {
              const count = identityStatusCounts[status]
              const total = state.identities.length
              const pct = Math.round((count / total) * 100) || 0
              return (
                <div key={status} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <IdentityStatusBadge status={status} />
                      <span className="font-mono text-[11px] text-muted-foreground">({count} identities)</span>
                    </span>
                    <span className="font-mono font-medium text-ink">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        status === 'Active' && 'bg-success',
                        status === 'Verified' && 'bg-primary',
                        status === 'Pending' && 'bg-warning',
                        status === 'Suspended' && 'bg-destructive',
                        status === 'Revoked' && 'bg-ink',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-ink/10 bg-peach/30 p-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-ink">Status Enforcement:</strong> Identities in{' '}
            <code className="rounded bg-destructive/15 px-1 py-0.5 font-mono text-destructive">Suspended</code> or{' '}
            <code className="rounded bg-ink/15 px-1 py-0.5 font-mono text-ink">Revoked</code> states are blocked by
            the policy evaluation engine from initiating any asset or credential actions.
          </div>
        </Section>
      </div>

      {/* Recent Verifiable Audit Trail */}
      <Section
        eyebrow="Tamper-Evident Ledger"
        title="Recent Verified Audit Events"
        actions={
          <Link href="/app/audit">
            <Button variant="ghost" size="sm">
              Audit Center <ArrowRight className="size-3" />
            </Button>
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="pb-2.5">Event ID & Type</th>
                <th className="pb-2.5">Actor DID</th>
                <th className="pb-2.5">Target / Subject</th>
                <th className="pb-2.5">Event Summary</th>
                <th className="pb-2.5">Tx Reference</th>
                <th className="pb-2.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentAudit.map((ev) => (
                <tr key={ev.id} className="transition-colors hover:bg-cream/60">
                  <td className="py-3">
                    <span className="font-mono text-xs font-semibold text-ink">{ev.id}</span>
                    <span className="block text-[11px] text-muted-foreground">{ev.type}</span>
                  </td>
                  <td className="py-3 font-mono text-xs text-ink">
                    <DidLabel did={ev.actor} />
                  </td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">
                    {ev.assetId ? (
                      <Link href={`/app/assets/${ev.assetId}`} className="text-primary hover:underline">
                        {ev.assetId}
                      </Link>
                    ) : ev.subject ? (
                      shortAddr(ev.subject)
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 text-xs text-ink max-w-xs truncate" title={ev.summary}>
                    {ev.summary}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-muted-foreground" title={ev.txRef}>
                    {shortHash(ev.txRef)}
                  </td>
                  <td className="py-3 text-right font-mono text-[11px] text-muted-foreground">
                    {formatDate(ev.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

'use client'

import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  History,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Workflow,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { useCaps, DidLabel, KeyValue, Section, StatCard } from '@/components/app/shared'
import { ConfirmDialog, Modal } from '@/components/daam/modal'
import {
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Field,
  Input,
  Mono,
  PageHeader,
  Select,
  SimLabel,
} from '@/components/daam/primitives'
import { CustodyStatusBadge, Badge } from '@/components/daam/status-badge'
import { useDaam } from '@/lib/daam/store'
import { formatDate, shortAddr, shortHash } from '@/lib/daam/format'
import { VAULT_DID } from '@/lib/daam/mock-data'
import { evaluate } from '@/lib/daam/policy'
import { PURPOSES, type CustodyStatus, type CustodyType, type Purpose } from '@/lib/daam/types'
import { cn } from '@/lib/utils'

export default function CustodyChainPage() {
  const { state, me, transferCustody, decideCustody } = useDaam()
  const { canManage } = useCaps()

  // Filters
  const [assetFilter, setAssetFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Transfer Form State
  const eligibleAssets = state.assets.filter((a) => a.status === 'Active' || a.status === 'Registered')
  const eligibleReceivers = state.identities.filter(
    (i) => i.status === 'Active' && state.policies.eligibleCustodianRoles.includes(i.role),
  )

  const [selectedAssetId, setSelectedAssetId] = useState(eligibleAssets[0]?.id ?? '')
  const [selectedReceiverDid, setSelectedReceiverDid] = useState(eligibleReceivers[0]?.did ?? '')
  const [transferPurpose, setTransferPurpose] = useState<Purpose>('Operational deployment')
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false)

  // Real-time Policy check on transfer
  const selectedAsset = state.assets.find((a) => a.id === selectedAssetId)
  const selectedReceiver = state.identities.find((i) => i.did === selectedReceiverDid)

  const transferDecision = useMemo(() => {
    return evaluate({
      identity: me,
      asset: selectedAsset,
      action: 'transfer_custody',
      purpose: transferPurpose,
      policies: state.policies,
      receiver: selectedReceiver,
    })
  }, [me, selectedAsset, transferPurpose, state.policies, selectedReceiver])

  const handleTransferSubmit = (e: FormEvent) => {
    e.preventDefault()
    setTransferConfirmOpen(true)
  }

  const executeTransfer = () => {
    transferCustody({
      assetId: selectedAssetId,
      to: selectedReceiverDid,
      purpose: transferPurpose,
    })
    setTransferConfirmOpen(false)
  }

  // Filtered Custody Events
  const filteredEvents = state.custody.filter((ev) => {
    if (assetFilter !== 'all' && ev.assetId !== assetFilter) return false
    if (statusFilter !== 'all' && ev.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchId = ev.id.toLowerCase().includes(q)
      const matchAsset = ev.assetId.toLowerCase().includes(q)
      const matchFrom = ev.from.toLowerCase().includes(q)
      const matchTo = ev.to.toLowerCase().includes(q)
      const matchTx = ev.txRef.toLowerCase().includes(q)
      if (!matchId && !matchAsset && !matchFrom && !matchTo && !matchTx) return false
    }
    return true
  })

  // Pending custody approvals
  const pendingApprovals = state.custody.filter((c) => c.status === 'Pending Approval')

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Decentralized Custody Ledger"
        title="Verifiable Chain of Custody"
        description="Trace every physical custody handover, initial assignment, or return to vault. All custody events are bound to organizational purpose, authorized signatures, and verifiable cryptographic transaction references."
      />

      {/* Architecture Notice */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-ink">
        <div className="flex items-start gap-3">
          <Workflow className="size-5 shrink-0 text-primary" />
          <div>
            <strong className="font-semibold text-primary">Immutable History Guarantee:</strong> Operational custody
            transfers never overwrite prior holder records. The asset’s custody log is append-only, preserving an unbroken
            chain from minting to retirement for complete compliance audits.
          </div>
        </div>
      </div>

      {/* Demo Transfer Workflow Form */}
      <div className="grid gap-6 lg:grid-cols-12" data-demo="transfer-form">
        <div className="lg:col-span-7">
          <Section
            eyebrow="Authorized Handover"
            title="Initiate Custody Transfer"
          >
            <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-cream p-3 text-xs flex justify-between items-center">
                <span>
                  Initiating DID: <DidLabel did={me?.did ?? ''} className="inline-flex font-mono" />
                </span>
                <Badge tone="ink">Role: {me?.role}</Badge>
              </div>

              <Field label="Select Asset to Transfer" htmlFor="transfer-asset">
                <Select
                  id="transfer-asset"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                >
                  {eligibleAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} — {a.name} (Current Custodian: {a.custodian === VAULT_DID ? 'Vault' : a.custodian})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Eligible Receiving Custodian"
                htmlFor="transfer-receiver"
                hint="Policy requires the receiver to hold an Active identity and an eligible custodian role (e.g. Engineer, Technician, Manager)."
              >
                <Select
                  id="transfer-receiver"
                  value={selectedReceiverDid}
                  onChange={(e) => setSelectedReceiverDid(e.target.value)}
                >
                  <option value={VAULT_DID}>Registry Vault (did:bel:vault:registry)</option>
                  {eligibleReceivers
                    .filter((r) => r.did !== selectedAsset?.custodian)
                    .map((r) => (
                      <option key={r.did} value={r.did}>
                        {r.alias} ({r.role}) — {r.did}
                      </option>
                    ))}
                </Select>
              </Field>

              <Field label="Transfer Purpose" htmlFor="transfer-purpose">
                <Select
                  id="transfer-purpose"
                  value={transferPurpose}
                  onChange={(e) => setTransferPurpose(e.target.value as Purpose)}
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="mt-2 flex items-center justify-between">
                <Button type="submit" disabled={!canManage || transferDecision.outcome === 'Denied'}>
                  <Workflow className="size-4" /> Validate & Transfer Custody
                </Button>
                <SimLabel />
              </div>
            </form>
          </Section>
        </div>

        {/* Transfer Policy Evaluation Preview */}
        <div className="lg:col-span-5">
          <Section
            eyebrow="Policy Pre-Flight Check"
            title="Transfer Policy Verdict"
          >
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-cream p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Evaluation</span>
                <span className={cn('text-xs font-semibold', transferDecision.outcome === 'Granted' ? 'text-success' : transferDecision.outcome === 'Denied' ? 'text-destructive' : 'text-warning')}>
                  {transferDecision.outcome}
                </span>
              </div>
              <p className="text-sm text-ink font-medium leading-relaxed">{transferDecision.reason}</p>

              <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-3 text-xs">
                {transferDecision.checks.map((chk) => (
                  <div key={chk.key} className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">{chk.label}</span>
                    <span className={cn('font-mono font-medium shrink-0', chk.pass ? 'text-success' : 'text-destructive')}>
                      {chk.pass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-card p-3 text-[11px] text-muted-foreground leading-relaxed">
              <strong>Transfer Rule:</strong> Both the initiating manager and receiving custodian must hold active
              credentials. If approval is required by policy, the record enters &quot;Pending Approval&quot; status.
            </div>
          </Section>
        </div>
      </div>

      {/* Pending Custody Approvals Queue */}
      {pendingApprovals.length > 0 && (
        <Section
          eyebrow="Custody Governance Queue"
          title={`Transfers Awaiting Separation-of-Duties Approval (${pendingApprovals.length})`}
        >
          <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-cream">
            {pendingApprovals.map((cus) => {
              const isInitiator = cus.initiator === me?.did
              return (
                <div key={cus.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ink">{cus.id}</span>
                      <CustodyStatusBadge status={cus.status} />
                      <span className="text-xs text-muted-foreground">{formatDate(cus.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink">
                      Transfer <strong className="text-primary">{cus.assetId}</strong> →{' '}
                      <DidLabel did={cus.to} className="inline-flex" />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: <DidLabel did={cus.from} className="inline-flex" /> · Initiator:{' '}
                      <DidLabel did={cus.initiator} className="inline-flex" /> · Purpose: &ldquo;{cus.purpose}&rdquo;
                    </p>
                    {isInitiator && (
                      <p className="mt-1 text-xs text-destructive">
                        Separation of duties: You cannot approve a transfer initiated by yourself.
                      </p>
                    )}
                  </div>

                  {canManage && !isInitiator ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => decideCustody(cus.id, false)}>
                        <XCircle className="size-3.5" /> Reject
                      </Button>
                      <Button size="sm" onClick={() => decideCustody(cus.id, true)}>
                        <CheckCircle2 className="size-3.5" /> Approve Custody Handover
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      {isInitiator ? 'Awaiting independent approver' : 'Manager/Admin review required'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Custody Timeline Explorer with Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Event ID, Asset ID, custodian, or txRef..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Asset:</span>
              <Select value={assetFilter} onChange={(e) => setAssetFilter(e.target.value)} className="w-40">
                <option value="all">All Assets</option>
                {state.assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Connected-Node Visual Custody Timeline */}
      <Section
        eyebrow="Chronological Ledger"
        title={`Custody Transition Timeline (${filteredEvents.length})`}
      >
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No custody events match your query"
            description="Clear filters or initiate a custody transfer above."
          />
        ) : (
          <div className="relative pl-6 before:absolute before:top-3 before:bottom-3 before:left-2.5 before:w-0.5 before:bg-border">
            <div className="flex flex-col gap-5">
              {filteredEvents.map((ev, index) => (
                <div
                  key={ev.id}
                  className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-cream p-5 transition-transform hover:-translate-y-0.5"
                >
                  {/* Timeline node */}
                  <span
                    className={cn(
                      'absolute -left-[27px] top-6 size-3.5 rounded-full border-2 border-background',
                      ev.status === 'Completed' ? 'bg-primary' : ev.status === 'Pending Approval' ? 'bg-warning' : 'bg-destructive',
                    )}
                  />

                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink">{ev.id}</span>
                      <Badge tone="ink">{ev.type}</Badge>
                      <CustodyStatusBadge status={ev.status} />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{formatDate(ev.timestamp)}</span>
                  </div>

                  {/* Custody transition flow */}
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">Target Asset</span>
                      <p className="mt-1 font-mono text-sm font-semibold text-ink">
                        <Link href={`/app/assets/${ev.assetId}`} className="text-primary hover:underline">
                          {ev.assetId}
                        </Link>
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">Prior Custodian</span>
                      <div className="mt-1">
                        <DidLabel did={ev.from} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">New Custodian</span>
                      <div className="mt-1">
                        <DidLabel did={ev.to} />
                      </div>
                    </div>
                  </div>

                  {/* Metadata and Tx Hash footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
                    <div>
                      <span>Initiated by: </span>
                      <DidLabel did={ev.initiator} className="inline-flex font-mono" />
                      {ev.approver && (
                        <span className="ml-2">
                          · Approved by: <DidLabel did={ev.approver} className="inline-flex font-mono" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Purpose: &ldquo;{ev.purpose}&rdquo;</span>
                      <span className="font-mono">· Tx: {shortHash(ev.txRef)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Confirmation Modal */}
      <ConfirmDialog
        open={transferConfirmOpen}
        onClose={() => setTransferConfirmOpen(false)}
        onConfirm={executeTransfer}
        title="Confirm Custody Transfer?"
        description={
          <span>
            Transfer custody of asset <strong className="text-ink">{selectedAssetId}</strong> to DID{' '}
            <strong className="text-ink">{selectedReceiverDid}</strong> for purpose &ldquo;{transferPurpose}&rdquo;?
          </span>
        }
        confirmLabel="Execute Transfer"
        tone="primary"
      />
    </div>
  )
}

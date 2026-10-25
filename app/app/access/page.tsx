'use client'

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  HelpCircle,
  KeyRound,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useId, useMemo, useState, type FormEvent } from 'react'
import { useCaps, DecisionPanel, DidLabel, KeyValue, Section, StatCard } from '@/components/app/shared'
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
import { OutcomeBadge } from '@/components/daam/status-badge'
import { useDaam } from '@/lib/daam/store'
import { formatDate, shortAddr } from '@/lib/daam/format'
import { ACTION_LABELS, evaluate } from '@/lib/daam/policy'
import {
  ASSET_STATUSES,
  IDENTITY_STATUSES,
  PURPOSES,
  ROLES,
  type ActionKey,
  type AssetStatus,
  type IdentityStatus,
  type Purpose,
  type Role,
} from '@/lib/daam/types'
import { cn } from '@/lib/utils'

export default function AccessGovernancePage() {
  const { state, me, requestAccess, decideAccess } = useDaam()
  const { canManage } = useCaps()

  // Tab state: 'request' | 'simulator'
  const [activeTab, setActiveTab] = useState<'request' | 'simulator'>('request')

  // Live Access Request form
  const [reqAssetId, setReqAssetId] = useState(state.assets[0]?.id ?? '')
  const [reqAction, setReqAction] = useState<ActionKey>('view_maintenance')
  const [reqPurpose, setReqPurpose] = useState<Purpose>('Scheduled maintenance')
  const [reqDuration, setReqDuration] = useState<number>(7)
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null)

  // Policy Simulator inputs
  const [simRole, setSimRole] = useState<Role>(me?.role ?? 'Engineer')
  const [simIdentityStatus, setSimIdentityStatus] = useState<IdentityStatus>(me?.status ?? 'Active')
  const [simAssetState, setSimAssetState] = useState<AssetStatus>('Active')
  const [simAction, setSimAction] = useState<ActionKey>('view_maintenance')
  const [simPurpose, setSimPurpose] = useState<Purpose>('Scheduled maintenance')
  const [simDuration, setSimDuration] = useState<number>(5)

  // Evaluation for live form preview
  const livePreviewDecision = useMemo(() => {
    const asset = state.assets.find((a) => a.id === reqAssetId)
    return evaluate({
      identity: me,
      asset,
      action: reqAction,
      purpose: reqPurpose,
      policies: state.policies,
      durationDays: reqDuration,
    })
  }, [me, reqAssetId, reqAction, reqPurpose, state.policies, reqDuration, state.assets])

  // Evaluation for the interactive simulator
  const simDecision = useMemo(() => {
    return evaluate({
      identity: {
        did: 'did:bel:simulated:node',
        role: simRole,
        status: simIdentityStatus,
        credential: 'Valid',
      },
      asset: {
        id: 'SIM-ASSET-01',
        status: simAssetState,
        custodian: 'did:bel:vault:registry',
      },
      action: simAction,
      purpose: simPurpose,
      policies: state.policies,
      durationDays: simDuration,
    })
  }, [simRole, simIdentityStatus, simAssetState, simAction, simPurpose, state.policies, simDuration])

  const handleRequestSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!me) return
    const res = requestAccess({
      did: me.did,
      assetId: reqAssetId,
      action: reqAction,
      purpose: reqPurpose,
      durationDays: reqDuration,
    })
    if (res.id) setLastSubmissionId(res.id)
  }

  // Pending access requests awaiting approval
  const pendingRequests = state.access.filter((r) => r.outcome === 'Approval Required')

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Dynamic Access Governance"
        title="Purpose-Bound Authorization Engine"
        description="Every access request is verified against dynamic policy rules, requester DID status, target asset state, intended action, and operational purpose — with total transparency and zero ambiguity."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('request')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'request'
              ? 'bg-ink text-cream shadow-sm'
              : 'text-muted-foreground hover:bg-ink/5 hover:text-ink',
          )}
        >
          Submit Access Request
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'simulator'
              ? 'bg-ink text-cream shadow-sm'
              : 'text-muted-foreground hover:bg-ink/5 hover:text-ink',
          )}
        >
          <Sliders className="size-3.5 inline mr-1" /> Interactive Policy Simulator
        </button>
      </div>

      {activeTab === 'request' ? (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Access Request Form */}
          <div className="lg:col-span-6" data-demo="access-form">
            <Section
              eyebrow="Live Request Evaluation"
              title="Request Purpose-Bound Access"
            >
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border bg-cream p-3 text-xs">
                  <span className="text-muted-foreground">Requesting Identity:</span>{' '}
                  <span className="font-semibold text-ink">{me?.alias}</span>{' '}
                  (<Mono className="text-ink">{me?.did}</Mono>)
                  <span className="ml-2 font-mono text-[11px] text-primary">Role: {me?.role}</span>
                </div>

                <Field label="Target Asset" htmlFor="req-asset">
                  <Select
                    id="req-asset"
                    value={reqAssetId}
                    onChange={(e) => setReqAssetId(e.target.value)}
                  >
                    {state.assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name} ({a.status})
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Requested Action" htmlFor="req-action">
                  <Select
                    id="req-action"
                    value={reqAction}
                    onChange={(e) => setReqAction(e.target.value as ActionKey)}
                  >
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Operational Purpose"
                  htmlFor="req-purpose"
                  hint="Access is strictly purpose-bound. The engine verifies if policy authorizes this purpose."
                >
                  <Select
                    id="req-purpose"
                    value={reqPurpose}
                    onChange={(e) => setReqPurpose(e.target.value as Purpose)}
                  >
                    {PURPOSES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Requested Duration (Days)"
                  htmlFor="req-duration"
                  hint={`Policy max limit: ${state.policies.maxAccessDays} days.`}
                >
                  <Input
                    id="req-duration"
                    type="number"
                    min={1}
                    max={60}
                    value={reqDuration}
                    onChange={(e) => setReqDuration(Number(e.target.value))}
                  />
                </Field>

                <Button type="submit" className="mt-2">
                  <KeyRound className="size-4" /> Evaluate & Submit Request
                </Button>
              </form>
            </Section>
          </div>

          {/* Right Column: Transparent Policy Decision Preview */}
          <div className="lg:col-span-6">
            <Section
              eyebrow="Instant Policy Audit"
              title="Transparent Policy Checklist"
            >
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                The policy engine performs deterministic checks before granting access. Real-time preview:
              </p>
              <DecisionPanel
                decision={livePreviewDecision}
                animateKey={`${reqAssetId}-${reqAction}-${reqPurpose}-${reqDuration}-${me?.status}-${me?.role}`}
              />
            </Section>
          </div>
        </div>
      ) : (
        /* Interactive Policy Simulator */
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="max-w-2xl">
              <Eyebrow>Zero-Risk Sandbox</Eyebrow>
              <h2 className="mt-1 font-serif text-3xl text-ink">Interactive Policy Simulator</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Test how the authorization engine reacts to diverse roles, identity suspensions, decommissioned assets,
                and unauthorized purposes in real time without altering production state.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-12">
              {/* Controls */}
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                <Field label="Requester Role" htmlFor="sim-role">
                  <Select id="sim-role" value={simRole} onChange={(e) => setSimRole(e.target.value as Role)}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Identity Status" htmlFor="sim-id-status">
                  <Select
                    id="sim-id-status"
                    value={simIdentityStatus}
                    onChange={(e) => setSimIdentityStatus(e.target.value as IdentityStatus)}
                  >
                    {IDENTITY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Asset State" htmlFor="sim-asset-state">
                  <Select
                    id="sim-asset-state"
                    value={simAssetState}
                    onChange={(e) => setSimAssetState(e.target.value as AssetStatus)}
                  >
                    {ASSET_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Requested Action" htmlFor="sim-action">
                  <Select
                    id="sim-action"
                    value={simAction}
                    onChange={(e) => setSimAction(e.target.value as ActionKey)}
                  >
                    {Object.entries(ACTION_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Operational Purpose" htmlFor="sim-purpose">
                  <Select
                    id="sim-purpose"
                    value={simPurpose}
                    onChange={(e) => setSimPurpose(e.target.value as Purpose)}
                  >
                    {PURPOSES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Requested Duration (Days)" htmlFor="sim-duration">
                  <Input
                    id="sim-duration"
                    type="number"
                    min={1}
                    max={60}
                    value={simDuration}
                    onChange={(e) => setSimDuration(Number(e.target.value))}
                  />
                </Field>
              </div>

              {/* Dynamic Outcome Result */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border bg-cream p-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Simulator Verdict</p>
                  <div className="mt-2">
                    <OutcomeBadge outcome={simDecision.outcome} />
                  </div>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-ink">{simDecision.reason}</p>
                </div>

                <div className="mt-6 flex flex-col gap-1.5 border-t border-border pt-4 text-xs">
                  {simDecision.checks.map((c) => (
                    <div key={c.key} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{c.label}</span>
                      <span className={cn('font-mono font-medium', c.pass ? 'text-success' : 'text-destructive')}>
                        {c.pass ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pending Access Approvals Section */}
      {pendingRequests.length > 0 && (
        <Section
          eyebrow="Governance Review"
          title={`Access Requests Requiring Additional Approval (${pendingRequests.length})`}
        >
          <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-cream">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ink">{req.id}</span>
                    <OutcomeBadge outcome={req.outcome} />
                    <span className="text-xs text-muted-foreground">{formatDate(req.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink">
                    DID <DidLabel did={req.did} className="inline-flex font-mono" /> requesting &ldquo;
                    {ACTION_LABELS[req.action]}&rdquo; on asset <strong className="text-primary">{req.assetId}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Purpose: &ldquo;{req.purpose}&rdquo; · Duration: {req.durationDays ?? 'Standard'} days
                  </p>
                  <p className="mt-0.5 text-xs text-warning">{req.reason}</p>
                </div>

                {canManage ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => decideAccess(req.id, false)}>
                      <XCircle className="size-3.5" /> Decline
                    </Button>
                    <Button size="sm" onClick={() => decideAccess(req.id, true)}>
                      <CheckCircle2 className="size-3.5" /> Grant Approval
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Manager/Admin decision required</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Access Decision History Log */}
      <Section
        eyebrow="Verifiable Authorization Trail"
        title="Access Decision History Log"
        data-demo="access-history"
      >
        {state.access.length === 0 ? (
          <EmptyState title="No access decisions recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Decision ID</th>
                  <th className="pb-3">Requester DID</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Purpose</th>
                  <th className="pb-3">Verdict</th>
                  <th className="pb-3">Explanation</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.access.map((rec) => (
                  <tr key={rec.id} className="transition-colors hover:bg-cream/60">
                    <td className="py-3 font-mono text-xs font-semibold text-ink">{rec.id}</td>
                    <td className="py-3">
                      <DidLabel did={rec.did} />
                    </td>
                    <td className="py-3 font-mono text-xs">
                      <Link href={`/app/assets/${rec.assetId}`} className="text-primary hover:underline">
                        {rec.assetId}
                      </Link>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {ACTION_LABELS[rec.action] ?? rec.action}
                    </td>
                    <td className="py-3 text-xs text-ink">&ldquo;{rec.purpose}&rdquo;</td>
                    <td className="py-3">
                      <OutcomeBadge outcome={rec.outcome} />
                    </td>
                    <td className="py-3 text-xs text-muted-foreground max-w-xs truncate" title={rec.reason}>
                      {rec.reason}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-muted-foreground">
                      {formatDate(rec.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  )
}

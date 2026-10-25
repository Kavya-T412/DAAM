'use client'

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  FilePlus2,
  FileText,
  Fingerprint,
  History,
  Lock,
  PauseCircle,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Workflow,
  Wrench,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
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
  Textarea,
} from '@/components/daam/primitives'
import {
  AssetStatusBadge,
  Badge,
  CustodyStatusBadge,
  OutcomeBadge,
} from '@/components/daam/status-badge'
import { useDaam } from '@/lib/daam/store'
import { formatDate, shortAddr, shortHash } from '@/lib/daam/format'
import { TRANSITIONS, transitionCheck } from '@/lib/daam/lifecycle'
import { PURPOSES, type AssetStatus, type Purpose } from '@/lib/daam/types'
import { cn } from '@/lib/utils'

export default function AssetPassportPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = (params.id as string)?.toUpperCase()

  const { state, changeLifecycle, addDocument, me } = useDaam()
  const { canManage } = useCaps()

  const asset = state.assets.find((a) => a.id === assetId)

  // Document modal
  const [docModalOpen, setDocModalOpen] = useState(false)
  const [docName, setDocName] = useState('')
  const [docContent, setDocContent] = useState('')
  const [docPurpose, setDocPurpose] = useState<Purpose>('Scheduled maintenance')

  // Lifecycle modal
  const [selectedTargetState, setSelectedTargetState] = useState<AssetStatus | null>(null)
  const [lifecyclePurpose, setLifecyclePurpose] = useState<Purpose>('Scheduled maintenance')

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="font-serif text-3xl text-ink">Asset not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The asset ID &quot;{assetId}&quot; does not exist in the registry.</p>
        <Link href="/app/assets" className="mt-6">
          <Button variant="outline">
            <ArrowLeft className="size-4" /> Back to Asset Registry
          </Button>
        </Link>
      </div>
    )
  }

  // Related documents
  const documents = state.documents.filter((d) => d.assetId === asset.id)

  // Related custody events
  const custodyEvents = state.custody.filter((c) => c.assetId === asset.id)

  // Related access requests
  const accessRecords = state.access.filter((r) => r.assetId === asset.id)

  // Valid next states from current status
  const validTransitions = TRANSITIONS[asset.status]

  const handleDocumentSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await addDocument({
      assetId: asset.id,
      name: docName.trim(),
      content: docContent,
      purpose: docPurpose,
    })
    setDocModalOpen(false)
    setDocName('')
    setDocContent('')
  }

  const handleExecuteLifecycle = () => {
    if (!selectedTargetState) return
    changeLifecycle({
      assetId: asset.id,
      to: selectedTargetState,
      purpose: lifecyclePurpose,
    })
    setSelectedTargetState(null)
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top breadcrumb navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/app/assets"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Asset Registry
        </Link>
      </div>

      {/* Hero Header with oversized NFT badge */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-border pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-sm font-bold text-primary">
              NFT Passport #{String(asset.tokenId).padStart(4, '0')}
            </span>
            <AssetStatusBadge status={asset.status} />
            <SimLabel />
          </div>
          <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">{asset.name}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">ID: {asset.id}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/app/custody`}>
            <Button variant="outline" size="sm">
              <Workflow className="size-3.5" /> Transfer Custody
            </Button>
          </Link>
          <Button size="sm" onClick={() => setDocModalOpen(true)}>
            <FilePlus2 className="size-3.5" /> Anchor Document
          </Button>
        </div>
      </div>

      {/* Grid: Identity Card + Dynamic Lifecycle Controls */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Asset Identity Card */}
        <Card className="p-6 lg:col-span-2">
          <Eyebrow>Token Identity & Bound Metadata</Eyebrow>
          <h2 className="mt-1 font-serif text-2xl text-ink">Verifiable Digital Twin</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-cream p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Legal Asset Owner</p>
              <p className="mt-1 font-serif text-2xl font-medium text-ink">{asset.owner}</p>
              <p className="mt-1 text-xs text-muted-foreground">Permanent institutional owner</p>
            </div>

            <div className="rounded-2xl border border-border bg-cream p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Current Operational Custodian</p>
              <div className="mt-1">
                <DidLabel did={asset.custodian} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Authorized keyholder of physical unit</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="font-medium text-muted-foreground">Category:</span>
              <span className="font-medium text-ink">{asset.category}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="font-medium text-muted-foreground">Metadata Hash (on-chain):</span>
              <Mono className="text-ink break-all">{asset.metadataHash}</Mono>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="font-medium text-muted-foreground">Metadata Storage Reference:</span>
              <Mono className="text-primary break-all">{asset.metadataUri}</Mono>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="font-medium text-muted-foreground">Mint & Registration Timestamp:</span>
              <span className="font-mono text-muted-foreground">{formatDate(asset.registeredAt)}</span>
            </div>
          </div>
        </Card>

        {/* Lifecycle State Machine Controls */}
        <Card className="p-6 flex flex-col justify-between" data-demo="lifecycle">
          <div>
            <Eyebrow>Asset State Machine</Eyebrow>
            <h2 className="mt-1 font-serif text-2xl text-ink">Lifecycle Status</h2>
            <div className="mt-4 flex items-center gap-3">
              <AssetStatusBadge status={asset.status} className="text-sm px-3 py-1" />
              <span className="text-xs text-muted-foreground">Current State</span>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Lifecycle changes are rule-checked against the state machine. Transitions automatically recalculate
              eligibility for protected operations and append an audit event.
            </p>

            {/* Transition Actions */}
            <div className="mt-6 flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Permitted Next Transitions</p>
              {validTransitions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                  This asset is in a terminal state ({asset.status}). No ordinary lifecycle transitions are permitted.
                </div>
              ) : (
                validTransitions.map((target) => (
                  <button
                    key={target}
                    type="button"
                    disabled={!canManage}
                    onClick={() => setSelectedTargetState(target)}
                    className="flex items-center justify-between rounded-xl border border-border bg-cream px-3.5 py-2.5 text-left text-xs font-medium text-ink transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    <span>Move to <strong>{target}</strong></span>
                    <ArrowRight className="size-3.5 text-primary" />
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-peach/30 p-3 text-[11px] text-muted-foreground">
            {!canManage && (
              <span className="text-destructive font-medium block mb-1">
                Manager or Admin role required to transition lifecycle states.
              </span>
            )}
            Valid state transitions: <br />
            Registered → Active · Active → Maintenance / Retired / Revoked · Maintenance → Active / Retired / Revoked
          </div>
        </Card>
      </div>

      {/* Chain of Custody History for this Asset */}
      <Section
        eyebrow="Immutable Custody Trail"
        title="Custody History for this Asset"
        actions={
          <Link href="/app/custody">
            <Button variant="ghost" size="sm">
              Global Custody Explorer <ArrowRight className="size-3" />
            </Button>
          </Link>
        }
        data-demo="custody-timeline"
      >
        {custodyEvents.length === 0 ? (
          <EmptyState
            title="No custody transfers recorded"
            description="Initial vault custody has been established. No subsequent transfer has occurred."
          />
        ) : (
          <div className="relative pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-border">
            <div className="flex flex-col gap-6">
              {custodyEvents.map((ev, i) => (
                <div key={ev.id} className="relative flex flex-col gap-2 rounded-2xl border border-border bg-cream p-4">
                  <span className="absolute -left-[27px] top-4 size-3.5 rounded-full border-2 border-background bg-primary" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink">{ev.id}</span>
                      <Badge tone="ink">{ev.type}</Badge>
                      <CustodyStatusBadge status={ev.status} />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{formatDate(ev.timestamp)}</span>
                  </div>

                  <div className="mt-2 grid gap-3 sm:grid-cols-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">From Custodian:</span>
                      <div className="mt-0.5">
                        <DidLabel did={ev.from} />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">To Custodian:</span>
                      <div className="mt-0.5">
                        <DidLabel did={ev.to} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Purpose: &ldquo;{ev.purpose}&rdquo;</span>
                    <span className="font-mono">Ref: {shortHash(ev.txRef)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Linked Document Hashes (Privacy-Preserving Audit) */}
      <Section
        eyebrow="Privacy-Preserving Hash Anchoring"
        title="Attached Cryptographic Document Hashes"
        actions={
          <Button size="sm" onClick={() => setDocModalOpen(true)}>
            <FilePlus2 className="size-3.5" /> Anchor New Document
          </Button>
        }
        data-demo="documents"
      >
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          In compliance with zero-leakage security, the underlying document text is kept in local encrypted storage.
          Only the SHA-256 fingerprint is anchored into the verifiable audit trail.
        </p>

        {documents.length === 0 ? (
          <EmptyState
            title="No documents attached"
            description="Attach a maintenance report, test certification, or handover log to anchor its SHA-256 hash."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <span className="font-mono text-xs font-semibold text-ink">{doc.id}</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{formatDate(doc.addedAt)}</span>
                  </div>
                  <h4 className="mt-2 font-medium text-ink">{doc.name}</h4>
                  <div className="mt-3 rounded-xl border border-border bg-cream p-2.5">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Anchored SHA-256 Hash</p>
                    <Mono className="text-primary text-[11px] break-all">{doc.anchoredHash}</Mono>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Private Ref: <Mono>{doc.storageRef}</Mono>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Added by: <Mono>{doc.addedBy}</Mono>
                  </span>
                  <Link href={`/app/audit?doc=${doc.id}&verify=1`}>
                    <Button size="sm" variant="outline">
                      <FileCheck2 className="size-3.5" /> Verify in Audit Center
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Recent Access Decisions Related to this Asset */}
      <Section
        eyebrow="Access Evaluation History"
        title="Purpose-Bound Authorization Decisions"
      >
        {accessRecords.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No access requests logged for this asset yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2.5">Decision ID</th>
                  <th className="pb-2.5">Requester DID</th>
                  <th className="pb-2.5">Action</th>
                  <th className="pb-2.5">Purpose</th>
                  <th className="pb-2.5">Outcome</th>
                  <th className="pb-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accessRecords.map((rec) => (
                  <tr key={rec.id} className="transition-colors hover:bg-cream/60">
                    <td className="py-3 font-mono text-xs font-semibold text-ink">{rec.id}</td>
                    <td className="py-3 font-mono text-xs text-ink">
                      <DidLabel did={rec.did} />
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">{rec.action}</td>
                    <td className="py-3 text-xs text-ink">&ldquo;{rec.purpose}&rdquo;</td>
                    <td className="py-3">
                      <OutcomeBadge outcome={rec.outcome} />
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

      {/* Anchor Document Modal */}
      <Modal
        open={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        title="Anchor Cryptographic Document Hash"
        description="Attach a maintenance or handover report. The SHA-256 hash is generated securely via Web Crypto in your browser and placed on the audit log."
      >
        <form onSubmit={handleDocumentSubmit} className="flex flex-col gap-4">
          <Field label="Document Name / Title" htmlFor="doc-title">
            <Input
              id="doc-title"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Maintenance Report — RF Alignment"
              required
            />
          </Field>
          <Field label="Purpose" htmlFor="doc-purpose">
            <Select
              id="doc-purpose"
              value={docPurpose}
              onChange={(e) => setDocPurpose(e.target.value as Purpose)}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Document Payload / Report Content"
            htmlFor="doc-content"
            hint="This content stays in off-chain simulated storage. Only its SHA-256 fingerprint will be anchored."
          >
            <Textarea
              id="doc-content"
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Enter technical report, maintenance logs, inspection notes..."
              required
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDocModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Compute Hash & Anchor</Button>
          </div>
        </form>
      </Modal>

      {/* Lifecycle Transition Dialog */}
      <Modal
        open={selectedTargetState !== null}
        onClose={() => setSelectedTargetState(null)}
        title={`Transition Asset to ${selectedTargetState}`}
        description={`Update the lifecycle state of ${asset.id} from ${asset.status} to ${selectedTargetState}.`}
      >
        {selectedTargetState && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-cream p-4 text-xs">
              <p className="font-semibold text-ink">State Machine Transition Rule:</p>
              <p className="mt-1 text-muted-foreground">
                {transitionCheck(asset.status, selectedTargetState).reason}
              </p>
            </div>

            <Field label="Operational Purpose" htmlFor="lc-purpose">
              <Select
                id="lc-purpose"
                value={lifecyclePurpose}
                onChange={(e) => setLifecyclePurpose(e.target.value as Purpose)}
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>

            {(selectedTargetState === 'Retired' || selectedTargetState === 'Revoked') && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="size-4 inline mr-1" />
                <strong>Warning:</strong> Moving to {selectedTargetState} is a permanent decommission. The asset cannot
                be transferred through normal workflows again.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedTargetState(null)}>
                Cancel
              </Button>
              <Button
                variant={selectedTargetState === 'Revoked' ? 'danger' : 'primary'}
                onClick={handleExecuteLifecycle}
              >
                Confirm Transition
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

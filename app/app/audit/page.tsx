'use client'

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileCheck2,
  FileCode2,
  FileText,
  Filter,
  History,
  Lock,
  RefreshCw,
  ScrollText,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Workflow,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCaps, DidLabel, KeyValue, Section, StatCard } from '@/components/app/shared'
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
import { Badge } from '@/components/daam/status-badge'
import { useDaam } from '@/lib/daam/store'
import { formatDate, shortAddr, shortHash, sha256Hex } from '@/lib/daam/format'
import type { AuditCategory, AuditEvent } from '@/lib/daam/types'
import { cn } from '@/lib/utils'

export default function AuditCenterPage() {
  const searchParams = useSearchParams()
  const initialDocId = searchParams.get('doc')
  const autoVerify = searchParams.get('verify') === '1'

  const { state } = useDaam()
  const { isAuditor } = useCaps()

  // Audit explorer filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Document verifier state
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocId && state.documents.some((d) => d.id === initialDocId)
      ? initialDocId
      : state.documents[0]?.id ?? '',
  )
  const [docContentToVerify, setDocContentToVerify] = useState<string>('')
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'verified' | 'mismatch'
    computedHash: string
    anchoredHash: string
    reason: string
  }>({
    status: 'idle',
    computedHash: '',
    anchoredHash: '',
    reason: '',
  })
  const [verifying, setVerifying] = useState(false)

  const activeDoc = state.documents.find((d) => d.id === selectedDocId)

  // Sync doc content on select
  useEffect(() => {
    if (activeDoc) {
      setDocContentToVerify(activeDoc.privateContent)
      setVerificationResult({
        status: 'idle',
        computedHash: '',
        anchoredHash: activeDoc.anchoredHash,
        reason: '',
      })
    }
  }, [activeDoc])

  // Auto-verify if triggered by URL
  useEffect(() => {
    if (autoVerify && activeDoc) {
      runVerification(activeDoc.privateContent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoVerify, activeDoc?.id])

  const runVerification = async (content: string) => {
    if (!activeDoc) return
    setVerifying(true)
    const computed = await sha256Hex(content)
    const match = computed === activeDoc.anchoredHash

    setVerificationResult({
      status: match ? 'verified' : 'mismatch',
      computedHash: computed,
      anchoredHash: activeDoc.anchoredHash,
      reason: match
        ? 'Cryptographic integrity verified: Browser Web Crypto SHA-256 calculation matches the anchored blockchain audit hash exactly.'
        : 'Integrity mismatch detected: Off-chain payload content has been altered or tampered with since anchor registration!',
    })
    setVerifying(false)
  }

  const simulateTamper = () => {
    const tampered = docContentToVerify + ' [TAMPERED BY ATTACKER]'
    setDocContentToVerify(tampered)
    runVerification(tampered)
  }

  const restoreOriginal = () => {
    if (activeDoc) {
      setDocContentToVerify(activeDoc.privateContent)
      runVerification(activeDoc.privateContent)
    }
  }

  // Filtered audit events
  const filteredEvents = state.audit.filter((ev) => {
    if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchId = ev.id.toLowerCase().includes(q)
      const matchType = ev.type.toLowerCase().includes(q)
      const matchActor = ev.actor.toLowerCase().includes(q)
      const matchAsset = ev.assetId?.toLowerCase().includes(q)
      const matchSum = ev.summary.toLowerCase().includes(q)
      const matchTx = ev.txRef.toLowerCase().includes(q)
      if (!matchId && !matchType && !matchActor && !matchAsset && !matchSum && !matchTx) return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Zero-Leak Cryptographic Audit Center"
        title="Privacy-Preserving Audit Trail & Integrity Verifier"
        description="Inspect tamper-evident system logs across all identities, access decisions, and custody handovers. Verify document integrity independently using the browser's Web Crypto SHA-256 API."
      />

      {/* Auditor Persona Banner */}
      <div className="rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-ink">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <strong className="font-semibold text-ink">Auditor Workspace (Read-Only by Design):</strong> As mandated
            by regulatory compliance, the audit center grants full visibility into all historical events, transaction
            references, and document fingerprints, without granting permission to alter assets, forge permissions, or
            bypass dynamic policies.
          </div>
        </div>
      </div>

      {/* Privacy Architecture Visual Diagram */}
      <Section
        eyebrow="Zero-Leakage Security Model"
        title="Privacy Architecture: Private Storage → SHA-256 Hash → Ledger"
      >
        <div className="rounded-2xl border border-ink/10 bg-cream/70 p-6">
          <div className="grid gap-4 sm:grid-cols-4 items-center text-center">
            <div className="rounded-2xl border border-border bg-card p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-ink text-cream mx-auto">
                <FileText className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-xs text-ink">1. Sensitive Document</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Maintenance notes, schematics, certifications</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-ink text-cream mx-auto">
                <Lock className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-xs text-ink">2. Off-Chain Private Storage</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Encrypted off-chain at enc://vault/... (never leaked)</p>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-cream mx-auto">
                <FileCheck2 className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-xs text-primary">3. SHA-256 Fingerprint</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Real 256-bit hash generated via browser Web Crypto</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-ink text-cream mx-auto">
                <ScrollText className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-xs text-ink">4. Anchored Audit Ledger</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Immutable reference; anyone can independently re-verify</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Interactive Document Integrity Verification Tool */}
      <div data-demo="doc-verifier">
        <Section
          eyebrow="Live Cryptographic Verification"
          title="Document Hash Integrity Verifier"
          actions={<SimLabel />}
        >
          {state.documents.length === 0 ? (
            <EmptyState
              title="No documents anchored yet"
              description="Anchor a document from any asset's passport page to verify its SHA-256 integrity."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Document Selector & Payload */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <Field label="Select Anchored Document to Inspect" htmlFor="doc-select">
                  <Select
                    id="doc-select"
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                  >
                    {state.documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.id} — {d.name} (Asset: {d.assetId})
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="rounded-2xl border border-border bg-cream p-3 text-xs">
                  <p className="font-semibold text-ink">Anchored Hash on Ledger (Reference):</p>
                  <Mono className="mt-1 block text-primary break-all">{activeDoc?.anchoredHash}</Mono>
                  <div className="mt-2 flex flex-wrap justify-between text-muted-foreground">
                    <span>Target Asset: {activeDoc?.assetId}</span>
                    <span>Storage: {activeDoc?.storageRef}</span>
                    <span>Anchored: {formatDate(activeDoc?.addedAt ?? '')}</span>
                  </div>
                </div>

                <Field
                  label="Private Document Payload"
                  htmlFor="doc-verify-content"
                  hint="You can edit this payload to test how the verifier flags altered content."
                >
                  <Textarea
                    id="doc-verify-content"
                    value={docContentToVerify}
                    onChange={(e) => setDocContentToVerify(e.target.value)}
                    className="font-mono text-xs"
                    rows={4}
                  />
                </Field>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => runVerification(docContentToVerify)} disabled={verifying}>
                    <FileCheck2 className="size-4" /> Re-Compute & Verify SHA-256
                  </Button>
                  <Button variant="outline" onClick={simulateTamper}>
                    <AlertTriangle className="size-4 text-warning" /> Test Tamper Simulation
                  </Button>
                  <Button variant="ghost" size="sm" onClick={restoreOriginal}>
                    <RefreshCw className="size-3.5" /> Restore Original
                  </Button>
                </div>
              </div>

              {/* Verification Outcome Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border bg-card p-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Integrity Status</p>

                  <div className="mt-3">
                    {verificationResult.status === 'verified' && (
                      <div className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success">
                        <CheckCircle2 className="size-5 shrink-0" /> Integrity Verified (Match)
                      </div>
                    )}
                    {verificationResult.status === 'mismatch' && (
                      <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                        <XCircle className="size-5 shrink-0" /> Integrity Mismatch (Tampered!)
                      </div>
                    )}
                    {verificationResult.status === 'idle' && (
                      <div className="rounded-2xl border border-border bg-cream p-3 text-xs text-muted-foreground">
                        Click &quot;Re-Compute & Verify SHA-256&quot; to test cryptographic integrity with Web Crypto.
                      </div>
                    )}
                  </div>

                  {verificationResult.reason && (
                    <p className="mt-3 text-xs leading-relaxed text-ink">{verificationResult.reason}</p>
                  )}

                  {verificationResult.computedHash && (
                    <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-cream p-3 text-xs">
                      <div>
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">Computed SHA-256:</span>
                        <Mono className="mt-0.5 block text-ink break-all">{verificationResult.computedHash}</Mono>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">Anchored SHA-256:</span>
                        <Mono className="mt-0.5 block text-primary break-all">{verificationResult.anchoredHash}</Mono>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  Engine: <code className="font-mono text-ink">window.crypto.subtle.digest(&apos;SHA-256&apos;)</code>
                </div>
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* Audit Event Explorer */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event ID, actor DID, asset ID, or summary..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Category:</span>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-44"
            >
              <option value="all">All Categories</option>
              <option value="identity">Identity Events</option>
              <option value="permission">Role & Permissions</option>
              <option value="access">Access Governance</option>
              <option value="nft">NFT Minting</option>
              <option value="custody">Custody Transfers</option>
              <option value="lifecycle">Lifecycle Changes</option>
              <option value="document">Document Anchoring</option>
              <option value="policy">Policy Updates</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Audit Trail Table */}
      <Section
        eyebrow="Verifiable Event Log"
        title={`Audit Trail Ledger (${filteredEvents.length} Events)`}
      >
        {filteredEvents.length === 0 ? (
          <EmptyState title="No audit events found for your filter" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Event ID</th>
                  <th className="pb-3">Type & Category</th>
                  <th className="pb-3">Actor DID</th>
                  <th className="pb-3">Target Asset</th>
                  <th className="pb-3">Summary</th>
                  <th className="pb-3">Tx Ref & Event Hash</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="transition-colors hover:bg-cream/60">
                    <td className="py-3 font-mono text-xs font-semibold text-ink">{ev.id}</td>
                    <td className="py-3">
                      <span className="block text-xs font-medium text-ink">{ev.type}</span>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">{ev.category}</span>
                    </td>
                    <td className="py-3">
                      <DidLabel did={ev.actor} />
                    </td>
                    <td className="py-3 font-mono text-xs">
                      {ev.assetId ? (
                        <Link href={`/app/assets/${ev.assetId}`} className="text-primary hover:underline">
                          {ev.assetId}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 text-xs text-ink max-w-sm truncate" title={ev.summary}>
                      {ev.summary}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-muted-foreground">
                      <span className="block" title={ev.txRef}>Tx: {shortHash(ev.txRef)}</span>
                      <span className="block text-[10px] text-muted-foreground/70" title={ev.eventHash}>
                        Hash: {shortHash(ev.eventHash)}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-muted-foreground">
                      {formatDate(ev.timestamp)}
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

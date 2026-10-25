'use client'

import {
  Boxes,
  ExternalLink,
  Eye,
  Filter,
  Grid,
  List,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Tag,
  Workflow,
} from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useCaps, DidLabel, KeyValue, Section, StatCard } from '@/components/app/shared'
import { Modal } from '@/components/daam/modal'
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
import { AssetStatusBadge } from '@/components/daam/status-badge'
import { useDaam } from '@/lib/daam/store'
import { formatDate, shortHash } from '@/lib/daam/format'
import { PURPOSES, type AssetStatus, type Purpose } from '@/lib/daam/types'
import { cn } from '@/lib/utils'

export default function AssetRegistryPage() {
  const { state, registerAsset } = useDaam()
  const { isAdmin } = useCaps()

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Register modal
  const [registerOpen, setRegisterOpen] = useState(false)
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('Hardware')
  const [newPurpose, setNewPurpose] = useState<Purpose>('Operational deployment')

  const categories = Array.from(new Set(state.assets.map((a) => a.category)))

  const filtered = state.assets.filter((asset) => {
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchId = asset.id.toLowerCase().includes(q)
      const matchName = asset.name.toLowerCase().includes(q)
      const matchCust = asset.custodian.toLowerCase().includes(q)
      if (!matchId && !matchName && !matchCust) return false
    }
    return true
  })

  const handleRegister = (e: FormEvent) => {
    e.preventDefault()
    registerAsset({
      id: newId,
      name: newName,
      category: newCategory,
      purpose: newPurpose,
    })
    setRegisterOpen(false)
    setNewId('')
    setNewName('')
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="NFT Digital Asset Registry"
        title="Asset Passports & Tokenized Twins"
        description="Each registered physical asset is bound to a unique ERC-721 token passport containing immutable metadata hashes, state-machine lifecycle tracking, and distinct ownership vs. custody delineation."
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button onClick={() => setRegisterOpen(true)} data-demo="register-asset">
                <Plus className="size-4" /> Register Asset & Mint NFT
              </Button>
            )}
          </div>
        }
      />

      {/* Delineation Callout Banner */}
      <div className="rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-ink">
        <div className="flex items-start gap-3">
          <Workflow className="size-5 shrink-0 text-primary" />
          <div>
            <strong className="font-semibold text-ink">Ownership vs. Custody Architecture:</strong> In DAAM, asset
            ownership permanently resides with the organization (<Mono className="text-ink">BEL</Mono>). An employee or
            department holds <em>operational custody</em> without owning the underlying NFT. Custody changes are governed
            by dynamic access policy and logged on the immutable chain of custody.
          </div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset ID, name, or custodian DID..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
                <option value="all">All statuses</option>
                <option value="Registered">Registered</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
                <option value="Revoked">Revoked</option>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Category:</span>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-36">
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center rounded-xl border border-border bg-cream p-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={cn('rounded-lg p-1.5 text-muted-foreground transition-colors', viewMode === 'cards' && 'bg-ink text-cream')}
                aria-label="Grid view"
              >
                <Grid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn('rounded-lg p-1.5 text-muted-foreground transition-colors', viewMode === 'table' && 'bg-ink text-cream')}
                aria-label="Table view"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Asset Display: Cards or Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Try modifying your search or filter parameters, or register a new asset as Admin."
        />
      ) : viewMode === 'cards' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <Card
              key={asset.id}
              className="group relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
            >
              <div>
                {/* Header row: Token ID & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                      NFT #{String(asset.tokenId).padStart(4, '0')}
                    </span>
                    <span className="text-xs text-muted-foreground">{asset.category}</span>
                  </div>
                  <AssetStatusBadge status={asset.status} />
                </div>

                {/* Asset ID & Name */}
                <h3 className="mt-3 font-serif text-2xl font-normal text-ink group-hover:text-primary">
                  {asset.name}
                </h3>
                <p className="font-mono text-xs text-muted-foreground">{asset.id}</p>

                {/* Details list */}
                <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border bg-cream p-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium text-ink">{asset.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custodian:</span>
                    <DidLabel did={asset.custodian} className="max-w-[170px]" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metadata Hash:</span>
                    <Mono className="text-muted-foreground">{shortHash(asset.metadataHash)}</Mono>
                  </div>
                </div>
              </div>

              {/* Bottom action: Open Passport */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Registered {formatDate(asset.registeredAt)}
                </span>
                <Link href={`/app/assets/${asset.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="size-3.5" /> View Passport
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Token & Asset ID</th>
                  <th className="pb-3">Asset Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Custodian</th>
                  <th className="pb-3">Metadata Hash</th>
                  <th className="pb-3 text-right">Passport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((asset) => (
                  <tr key={asset.id} className="transition-colors hover:bg-cream/60">
                    <td className="py-3">
                      <span className="font-mono text-xs font-semibold text-primary">
                        #{String(asset.tokenId).padStart(4, '0')}
                      </span>
                      <span className="block font-mono text-xs text-ink">{asset.id}</span>
                    </td>
                    <td className="py-3 font-medium text-ink">{asset.name}</td>
                    <td className="py-3 text-xs text-muted-foreground">{asset.category}</td>
                    <td className="py-3">
                      <AssetStatusBadge status={asset.status} />
                    </td>
                    <td className="py-3">
                      <DidLabel did={asset.custodian} />
                    </td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">
                      {shortHash(asset.metadataHash)}
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/app/assets/${asset.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="size-3.5" /> Passport
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Mint Asset Passport Modal */}
      <Modal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register Asset & Mint NFT Passport"
        description="Creates a digital twin token on the simulated blockchain, binds cryptographic metadata hashes, and assigns initial vault custody."
      >
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Field label="Asset ID" htmlFor="asset-id" hint="Format: ORG-TYPE-NUMBER (e.g. BEL-TX-9001)">
            <Input
              id="asset-id"
              value={newId}
              onChange={(e) => setNewId(e.target.value.toUpperCase())}
              placeholder="e.g. BEL-TX-9001"
              required
            />
          </Field>
          <Field label="Asset Name" htmlFor="asset-name">
            <Input
              id="asset-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Transceiver Array"
              required
            />
          </Field>
          <Field label="Category" htmlFor="asset-cat">
            <Select id="asset-cat" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              <option value="Hardware">Hardware</option>
              <option value="Communications">Communications</option>
              <option value="Sensor Unit">Sensor Unit</option>
              <option value="Control Terminal">Control Terminal</option>
              <option value="Server / Edge">Server / Edge</option>
            </Select>
          </Field>
          <Field label="Registration Purpose" htmlFor="asset-purpose">
            <Select
              id="asset-purpose"
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value as Purpose)}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Mint Passport Token</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

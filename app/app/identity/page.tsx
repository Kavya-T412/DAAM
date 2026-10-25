'use client'

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Filter,
  Fingerprint,
  MoreVertical,
  PauseCircle,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCaps, DidLabel, KeyValue, Section } from '@/components/app/shared'
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
import { IdentityStatusBadge, Badge } from '@/components/daam/status-badge'
import { useDaam } from '@/lib/daam/store'
import { formatDate, shortAddr } from '@/lib/daam/format'
import { ROLES, type Identity, type IdentityStatus, type Role } from '@/lib/daam/types'
import { cn } from '@/lib/utils'

export default function IdentityManagementPage() {
  const {
    state,
    me,
    verifyIdentity,
    activateIdentity,
    setRole,
    suspendIdentity,
    reinstateIdentity,
    revokeCredential,
    registerIdentity,
  } = useDaam()
  const { isAdmin } = useCaps()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Modals
  const [registerOpen, setRegisterOpen] = useState(false)
  const [regAlias, setRegAlias] = useState('')
  const [regRole, setRegRole] = useState<Role>('User')

  const [roleModalIdentity, setRoleModalIdentity] = useState<Identity | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>('User')

  const [verifyModalIdentity, setVerifyModalIdentity] = useState<Identity | null>(null)
  const [verifyRole, setVerifyRole] = useState<Role>('User')

  const [confirmSuspend, setConfirmSuspend] = useState<Identity | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<Identity | null>(null)

  // Filtered identities
  const filtered = state.identities.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (roleFilter !== 'all' && item.role !== roleFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchDid = item.did.toLowerCase().includes(q)
      const matchAlias = item.alias.toLowerCase().includes(q)
      const matchWallet = item.wallet.toLowerCase().includes(q)
      if (!matchDid && !matchAlias && !matchWallet) return false
    }
    return true
  })

  const handleRegister = (e: FormEvent) => {
    e.preventDefault()
    registerIdentity({ alias: regAlias.trim(), requestedRole: regRole })
    setRegisterOpen(false)
    setRegAlias('')
  }

  const handleVerifySubmit = () => {
    if (!verifyModalIdentity) return
    verifyIdentity(verifyModalIdentity.did, verifyRole)
    setVerifyModalIdentity(null)
  }

  const handleRoleChangeSubmit = () => {
    if (!roleModalIdentity) return
    setRole(roleModalIdentity.did, selectedRole)
    setRoleModalIdentity(null)
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Decentralized Identity Registry"
        title="Identity & Credential Governance"
        description="Verify decentralized identifiers (DIDs), evaluate cryptographic credential validity, assign enterprise RBAC roles, and control active authorization states."
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setRegisterOpen(true)}>
              <UserPlus className="size-4" /> Request DID Registration
            </Button>
          </div>
        }
      />

      {/* Security Architecture Notice */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-ink">
        <div className="flex items-start gap-3">
          <ShieldAlert className="size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <strong className="font-semibold text-primary">Identity-State Enforcement Rule:</strong>{' '}
            Suspension or revocation takes effect immediately across all policy evaluation points. A suspended identity
            retains its cryptographic wallet ownership, but the DAAM policy engine rejects any protected actions,
            asset access, or custody transfers initiated by or targeting that DID.
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by DID, alias, or wallet address..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Revoked">Revoked</option>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Role:</span>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-36">
                <option value="all">All roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
            {(statusFilter !== 'all' || roleFilter !== 'all' || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setRoleFilter('all')
                  setSearch('')
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Identities Table / Cards */}
      <Section
        eyebrow="Verifiable Registry"
        title={`Registered Personas & Identities (${filtered.length})`}
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No identities found"
            description="Try adjusting your search query or status filter to see other registered identities."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Identity / DID</th>
                  <th className="pb-3">Wallet Address</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Credential</th>
                  <th className="pb-3">Registered</th>
                  <th className="pb-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((id) => {
                  const isCurrent = me?.did === id.did
                  return (
                    <tr
                      key={id.did}
                      data-demo={`identity-${id.did}`}
                      className={cn(
                        'transition-colors hover:bg-cream/70',
                        isCurrent && 'bg-peach/25',
                      )}
                    >
                      {/* DID & Alias */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-ink font-serif text-xs text-cream">
                            {id.role.slice(0, 1)}
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-ink">
                              {id.alias} {isCurrent && <span className="text-[11px] text-primary">(You)</span>}
                            </span>
                            <span className="block truncate font-mono text-[11px] text-muted-foreground" title={id.did}>
                              {id.did}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Wallet */}
                      <td className="py-3.5 pr-3 font-mono text-xs text-ink" title={id.wallet}>
                        {shortAddr(id.wallet)}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 pr-3">
                        <Badge tone="ink">{id.role}</Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 pr-3">
                        <IdentityStatusBadge status={id.status} />
                      </td>

                      {/* Credential Status */}
                      <td className="py-3.5 pr-3">
                        {id.credential === 'Valid' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="size-3.5" /> Valid
                          </span>
                        ) : id.credential === 'Revoked' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-destructive">
                            <Ban className="size-3.5" /> Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-warning">
                            <ShieldAlert className="size-3.5" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 pr-3 font-mono text-xs text-muted-foreground">
                        {formatDate(id.registeredAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {id.status === 'Pending' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setVerifyModalIdentity(id)
                                  setVerifyRole(id.role)
                                }}
                              >
                                <ShieldCheck className="size-3.5" /> Verify
                              </Button>
                            )}

                            {id.status === 'Active' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRoleModalIdentity(id)
                                    setSelectedRole(id.role)
                                  }}
                                  title="Change role"
                                >
                                  Role
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setConfirmSuspend(id)}
                                  className="text-destructive hover:bg-destructive/10"
                                  title="Suspend identity"
                                >
                                  <PauseCircle className="size-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setConfirmRevoke(id)}
                                  className="text-destructive hover:bg-destructive/10"
                                  title="Revoke credential"
                                >
                                  <Ban className="size-3.5" />
                                </Button>
                              </>
                            )}

                            {id.status === 'Suspended' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reinstateIdentity(id.did)}
                                className="text-success hover:bg-success/10"
                              >
                                <RotateCcw className="size-3.5" /> Reinstate
                              </Button>
                            )}

                            {id.status === 'Revoked' && (
                              <span className="text-xs text-muted-foreground italic">Terminal state</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Admin only</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Verify Identity Modal */}
      <Modal
        open={verifyModalIdentity !== null}
        onClose={() => setVerifyModalIdentity(null)}
        title="Verify & Activate Identity"
        description="Review registration credentials, assign the organization role, and activate this DID in the governance registry."
      >
        {verifyModalIdentity && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-cream p-4">
              <KeyValue label="Decentralized Identifier" mono>
                {verifyModalIdentity.did}
              </KeyValue>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <KeyValue label="Wallet">{shortAddr(verifyModalIdentity.wallet)}</KeyValue>
                <KeyValue label="Organization">{verifyModalIdentity.org}</KeyValue>
              </div>
            </div>

            <Field label="Assign Role" htmlFor="verify-role" hint="Select the RBAC role authorized for this employee or node.">
              <Select
                id="verify-role"
                value={verifyRole}
                onChange={(e) => setVerifyRole(e.target.value as Role)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setVerifyModalIdentity(null)}>
                Cancel
              </Button>
              <Button onClick={handleVerifySubmit}>
                <ShieldCheck /> Confirm & Activate DID
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Change Role Modal */}
      <Modal
        open={roleModalIdentity !== null}
        onClose={() => setRoleModalIdentity(null)}
        title="Assign Enterprise Role"
        description="Update the RBAC role associated with this decentralized identifier. This immediately updates all policy checks."
      >
        {roleModalIdentity && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-cream p-3 text-xs">
              DID: <Mono className="text-ink">{roleModalIdentity.did}</Mono> (Current role: {roleModalIdentity.role})
            </div>
            <Field label="New Role" htmlFor="edit-role">
              <Select id="edit-role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRoleModalIdentity(null)}>
                Cancel
              </Button>
              <Button onClick={handleRoleChangeSubmit}>Update Role</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        open={confirmSuspend !== null}
        onClose={() => setConfirmSuspend(null)}
        onConfirm={() => {
          if (confirmSuspend) suspendIdentity(confirmSuspend.did)
        }}
        title="Suspend Identity?"
        description={
          <span>
            Are you sure you want to suspend <strong className="text-ink">{confirmSuspend?.did}</strong>?
            This will immediately block all protected operations, asset updates, and custody requests for this persona.
          </span>
        }
        confirmLabel="Suspend Identity"
        tone="danger"
      />

      {/* Revoke Confirmation Dialog */}
      <ConfirmDialog
        open={confirmRevoke !== null}
        onClose={() => setConfirmRevoke(null)}
        onConfirm={() => {
          if (confirmRevoke) revokeCredential(confirmRevoke.did)
        }}
        title="Revoke Credential Permanently?"
        description={
          <span>
            Revoking <strong className="text-ink">{confirmRevoke?.did}</strong> is a terminal governance action.
            The cryptographic credential will be invalidated and this identity cannot be reinstated through ordinary operations.
          </span>
        }
        confirmLabel="Revoke Permanently"
        tone="danger"
      />

      {/* Request Registration Modal */}
      <Modal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register Decentralized Identity"
        description="Submit a new identity verification request linked to your connected wallet."
      >
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Field label="Display Name / Alias" htmlFor="reg-alias">
            <Input
              id="reg-alias"
              value={regAlias}
              onChange={(e) => setRegAlias(e.target.value)}
              placeholder="e.g. Systems Operator 4"
              required
            />
          </Field>
          <Field label="Requested Role" htmlFor="reg-role">
            <Select id="reg-role" value={regRole} onChange={(e) => setRegRole(e.target.value as Role)}>
              {ROLES.filter((r) => r !== 'Admin').map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

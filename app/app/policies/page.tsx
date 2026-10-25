'use client'

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  KeyRound,
  Lock,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Workflow,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useCaps, Section, StatCard } from '@/components/app/shared'
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
import { ACTION_LABELS } from '@/lib/daam/policy'
import {
  ASSET_STATUSES,
  IDENTITY_STATUSES,
  PURPOSES,
  ROLES,
  type ActionKey,
  type AssetStatus,
  type IdentityStatus,
  type PolicyRule,
  type Purpose,
  type Role,
} from '@/lib/daam/types'
import { cn } from '@/lib/utils'

export default function PolicyManagementPage() {
  const { state, updateRule, updatePolicies } = useDaam()
  const { isAdmin } = useCaps()

  const [activeActionKey, setActiveActionKey] = useState<ActionKey>('view_maintenance')

  const currentRule: PolicyRule = state.policies.rules[activeActionKey]

  const toggleRole = (role: Role) => {
    if (!isAdmin) return
    const has = currentRule.allowedRoles.includes(role)
    const next = has
      ? currentRule.allowedRoles.filter((r) => r !== role)
      : [...currentRule.allowedRoles, role]

    updateRule(
      activeActionKey,
      { allowedRoles: next },
      `Updated allowed roles for ${ACTION_LABELS[activeActionKey]}: [${next.join(', ')}]`,
    )
  }

  const togglePurpose = (purpose: Purpose) => {
    if (!isAdmin) return
    const has = currentRule.permittedPurposes.includes(purpose)
    const next = has
      ? currentRule.permittedPurposes.filter((p) => p !== purpose)
      : [...currentRule.permittedPurposes, purpose]

    updateRule(
      activeActionKey,
      { permittedPurposes: next },
      `Updated permitted purposes for ${ACTION_LABELS[activeActionKey]}`,
    )
  }

  const toggleAssetState = (assetStatus: AssetStatus) => {
    if (!isAdmin) return
    const has = currentRule.allowedAssetStates.includes(assetStatus)
    const next = has
      ? currentRule.allowedAssetStates.filter((s) => s !== assetStatus)
      : [...currentRule.allowedAssetStates, assetStatus]

    updateRule(
      activeActionKey,
      { allowedAssetStates: next },
      `Updated allowed asset states for ${ACTION_LABELS[activeActionKey]}: [${next.join(', ')}]`,
    )
  }

  const toggleApprovalRequired = () => {
    if (!isAdmin) return
    const next = !currentRule.requiresApproval
    updateRule(
      activeActionKey,
      { requiresApproval: next },
      `Rule "${ACTION_LABELS[activeActionKey]}" requiresApproval set to ${next}`,
    )
  }

  const toggleBlockedIdentityState = (st: IdentityStatus) => {
    if (!isAdmin) return
    const has = state.policies.blockedIdentityStates.includes(st)
    const next = has
      ? state.policies.blockedIdentityStates.filter((s) => s !== st)
      : [...state.policies.blockedIdentityStates, st]

    updatePolicies(
      { blockedIdentityStates: next },
      `Blocked identity states updated: [${next.join(', ')}]`,
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Enterprise Policy Administration"
        title="Dynamic Access Governance & Policy Rules"
        description="Configure fine-grained role-based access rules, permitted operational purposes, asset lifecycle prerequisites, and secondary approval gates. Policy updates take effect immediately."
      />

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-xs leading-relaxed text-warning">
          <div className="flex items-start gap-3">
            <Lock className="size-5 shrink-0" />
            <div>
              <strong className="font-semibold">Read-Only View:</strong> Only active identities with the{' '}
              <strong className="font-semibold">Admin</strong> role can modify policy rules. Use the persona switcher
              to switch to Admin to test policy customization.
            </div>
          </div>
        </div>
      )}

      {/* Action Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {Object.entries(ACTION_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveActionKey(key as ActionKey)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-medium transition-colors',
              activeActionKey === key
                ? 'bg-ink text-cream shadow-sm'
                : 'bg-cream text-ink border border-border hover:border-ink/40',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active Rule Configuration Panel */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Section
            eyebrow="Rule Configuration"
            title={`Policy for: ${ACTION_LABELS[activeActionKey]}`}
          >
            {/* Roles checklist */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Authorized Roles (RBAC)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ROLES.map((r) => {
                  const active = currentRule.allowedRoles.includes(r)
                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => toggleRole(r)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all text-left',
                        active
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-cream text-muted-foreground hover:border-ink/30',
                      )}
                    >
                      <span>{r}</span>
                      {active ? <Check className="size-3.5 text-primary" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Permitted Purposes */}
            <div className="mt-6 flex flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Permitted Purposes (Purpose-Bound Enforcement)
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {PURPOSES.map((p) => {
                  const active = currentRule.permittedPurposes.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => togglePurpose(p)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all text-left',
                        active
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-cream text-muted-foreground hover:border-ink/30',
                      )}
                    >
                      <span className="truncate">{p}</span>
                      {active ? <Check className="size-3.5 text-primary shrink-0 ml-2" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Allowed Asset States */}
            <div className="mt-6 flex flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Eligible Asset Lifecycle States
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ASSET_STATUSES.map((st) => {
                  const active = currentRule.allowedAssetStates.includes(st)
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => toggleAssetState(st)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium transition-all',
                        active
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-cream text-muted-foreground hover:border-ink/30',
                      )}
                    >
                      <span>{st}</span>
                      {active ? <Check className="size-3 text-primary" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Approval Gate Toggle */}
            <div className="mt-6 rounded-2xl border border-border bg-cream p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-sm text-ink">Require Additional Approval Gate</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When enabled, non-admin requests trigger an &quot;Approval Required&quot; decision awaiting secondary sign-off.
                </p>
              </div>
              <Button
                variant={currentRule.requiresApproval ? 'primary' : 'outline'}
                size="sm"
                disabled={!isAdmin}
                onClick={toggleApprovalRequired}
              >
                {currentRule.requiresApproval ? 'Gate Active' : 'No Gate Required'}
              </Button>
            </div>
          </Section>

          {/* Global Blocked Identity States */}
          <Section
            eyebrow="Global Security Constraints"
            title="Identity States that Invalidate All Protected Operations"
          >
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Identities in selected states are automatically rejected by policy across all operations, regardless of
              their assigned roles.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {IDENTITY_STATUSES.map((st) => {
                const blocked = state.policies.blockedIdentityStates.includes(st)
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => toggleBlockedIdentityState(st)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all text-left',
                      blocked
                        ? 'border-destructive bg-destructive/10 text-destructive font-semibold'
                        : 'border-border bg-cream text-muted-foreground hover:border-ink/30',
                    )}
                  >
                    <span>{st}</span>
                    <span className="text-[11px] font-mono">{blocked ? 'BLOCKED' : 'Allowed'}</span>
                  </button>
                )
              })}
            </div>
          </Section>
        </div>

        {/* Live Policy Preview Card */}
        <div className="lg:col-span-4">
          <Section
            eyebrow="Live Rule Preview"
            title="Effective Policy Summary"
          >
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-cream p-4 text-xs">
              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Action</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{ACTION_LABELS[activeActionKey]}</p>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Permitted Roles</p>
                <p className="text-ink mt-0.5">{currentRule.allowedRoles.join(', ') || 'None'}</p>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Permitted Purposes</p>
                <ul className="list-disc list-inside text-ink mt-1 space-y-0.5">
                  {currentRule.permittedPurposes.map((p) => (
                    <li key={p} className="truncate">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Permitted Asset States</p>
                <p className="text-ink mt-0.5">{currentRule.allowedAssetStates.join(', ') || 'None'}</p>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Secondary Approval</p>
                <p className="text-ink mt-0.5">
                  {currentRule.requiresApproval ? 'Required for non-admin' : 'Not required'}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-[11px] text-ink leading-relaxed">
              <strong className="text-primary">Instant Propagation:</strong> Every policy update writes a timestamped
              audit event to the ledger and immediately changes the outcome in the Policy Simulator and live Access Request
              console.
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

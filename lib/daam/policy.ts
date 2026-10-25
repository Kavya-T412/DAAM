import { transitionCheck } from './lifecycle'
import type { ActionKey, Asset, AssetStatus, Decision, Identity, Policies, PolicyCheck, Purpose } from './types'

export const ACTION_LABELS: Record<ActionKey, string> = {
  view_metadata: 'View asset metadata',
  view_maintenance: 'View maintenance record',
  update_asset: 'Update record / attach document',
  transfer_custody: 'Transfer custody',
  change_lifecycle: 'Change lifecycle state',
  register_asset: 'Register asset & mint NFT',
}

const ACTION_NOUNS: Record<ActionKey, string> = {
  view_metadata: 'metadata request',
  view_maintenance: 'maintenance record request',
  update_asset: 'asset update',
  transfer_custody: 'custody transfer',
  change_lifecycle: 'lifecycle change',
  register_asset: 'asset registration',
}

export interface EvaluationInput {
  identity: Pick<Identity, 'did' | 'role' | 'status' | 'credential'> | undefined
  asset: Pick<Asset, 'id' | 'status' | 'custodian'> | undefined
  action: ActionKey
  purpose: Purpose
  policies: Policies
  durationDays?: number
  receiver?: Pick<Identity, 'did' | 'role' | 'status' | 'credential'> | undefined
  targetState?: AssetStatus
}

export function evaluate(input: EvaluationInput): Decision {
  const { identity, asset, action, purpose, policies, durationDays, receiver, targetState } = input
  const rule = policies.rules[action]
  const label = ACTION_LABELS[action].toLowerCase()
  const checks: PolicyCheck[] = []
  const reasons: Record<string, string> = {}

  const walletOk = Boolean(identity)
  checks.push({
    key: 'wallet',
    label: 'Wallet identity recognized?',
    pass: walletOk,
    detail: identity ? `Wallet resolves to ${identity.did}` : 'Wallet is not linked to a registered DID',
  })
  reasons.wallet = 'Access denied because this wallet is not linked to a registered identity.'

  const blocked = identity ? policies.blockedIdentityStates.includes(identity.status) : true
  const credRevoked = identity?.credential === 'Revoked'
  const didOk = Boolean(identity) && !blocked && !credRevoked
  checks.push({
    key: 'did',
    label: 'DID active?',
    pass: didOk,
    detail: !identity
      ? 'No DID to evaluate'
      : credRevoked
        ? 'Credential has been revoked'
        : blocked
          ? `Identity status "${identity.status}" is blocked by policy`
          : `Identity status "${identity.status}" with valid credential`,
  })
  reasons.did = credRevoked
    ? "Access denied because this identity's credential has been revoked."
    : `Access denied because this identity is ${identity?.status.toLowerCase() ?? 'unknown'}.`

  const roleOk = Boolean(identity) && rule.allowedRoles.includes(identity!.role)
  checks.push({
    key: 'role',
    label: 'Role authorized?',
    pass: roleOk,
    detail: identity
      ? `${identity.role} ${roleOk ? 'is' : 'is not'} in [${rule.allowedRoles.join(', ')}]`
      : 'No role to evaluate',
  })
  reasons.role = `Access denied because the ${identity?.role ?? 'unknown'} role is not authorized to ${label}.`

  const assetOk = !asset || rule.allowedAssetStates.includes(asset.status)
  checks.push({
    key: 'asset',
    label: 'Asset state eligible?',
    pass: assetOk,
    detail: !asset
      ? 'No existing asset involved'
      : `${asset.id} is ${asset.status}; allowed: ${rule.allowedAssetStates.join(', ') || 'none'}`,
  })
  reasons.asset = `Access denied because asset ${asset?.id} is ${asset?.status} and this action requires ${
    rule.allowedAssetStates.join(' or ') || 'a state that policy does not currently allow'
  }.`

  checks.push({
    key: 'action',
    label: 'Requested action permitted?',
    pass: rule.enabled,
    detail: rule.enabled ? `"${ACTION_LABELS[action]}" is enabled` : `"${ACTION_LABELS[action]}" is disabled by policy`,
  })
  reasons.action = 'Access denied because this action is currently disabled by policy.'

  const purposeOk = rule.permittedPurposes.includes(purpose)
  checks.push({
    key: 'purpose',
    label: 'Purpose permitted?',
    pass: purposeOk,
    detail: `"${purpose}" ${purposeOk ? 'is' : 'is not'} a permitted purpose for this action`,
  })
  reasons.purpose = 'Access denied because the requested purpose is not permitted for this asset.'

  let conditionFailure: string | null = null
  const conditionNotes: string[] = []
  if (action === 'transfer_custody') {
    if (asset && (asset.status === 'Retired' || asset.status === 'Revoked')) {
      conditionFailure = `Access denied because ${asset.status.toLowerCase()} assets cannot be transferred through normal workflows.`
    } else if (!receiver) {
      conditionFailure = 'Access denied because no eligible receiving DID was provided.'
    } else if (asset && receiver.did === asset.custodian) {
      conditionFailure = 'Access denied because the receiving DID is already the current custodian.'
    } else if (policies.blockedIdentityStates.includes(receiver.status) || receiver.credential === 'Revoked') {
      conditionFailure = `Access denied because the receiving identity is ${receiver.status.toLowerCase()}.`
    } else if (!policies.eligibleCustodianRoles.includes(receiver.role)) {
      conditionFailure = `Access denied because the ${receiver.role} role is not eligible to hold custody.`
    } else {
      conditionNotes.push(`Receiver ${receiver.did} is active and eligible`)
    }
  }
  if (action === 'change_lifecycle' && asset && targetState) {
    const t = transitionCheck(asset.status, targetState)
    if (!t.ok) conditionFailure = `Access denied: ${t.reason}`
    else conditionNotes.push(t.reason)
  }
  if (durationDays !== undefined && durationDays > policies.maxAccessDays) {
    conditionFailure = `Access denied because the requested duration (${durationDays} days) exceeds the ${policies.maxAccessDays}-day maximum.`
  } else if (durationDays !== undefined) {
    conditionNotes.push(`Duration ${durationDays}d within ${policies.maxAccessDays}d limit`)
  }
  checks.push({
    key: 'conditions',
    label: 'Additional conditions satisfied?',
    pass: conditionFailure === null,
    detail: conditionFailure ?? (conditionNotes.join(' · ') || 'No additional conditions apply'),
  })
  reasons.conditions = conditionFailure ?? ''

  const firstFail = checks.find((c) => !c.pass)
  if (firstFail) {
    return { outcome: 'Denied', reason: reasons[firstFail.key], checks }
  }

  const needsApproval = (rule.requiresApproval || rule.approvalPurposes.includes(purpose)) && identity?.role !== 'Admin'
  if (needsApproval) {
    return {
      outcome: 'Approval Required',
      reason: `Additional approval is required for this ${ACTION_NOUNS[action]}${
        rule.approvalPurposes.includes(purpose) ? ` when the purpose is "${purpose}"` : ''
      }.`,
      checks,
    }
  }

  return {
    outcome: 'Granted',
    reason: `Access granted: every policy condition is satisfied for "${purpose}".`,
    checks,
  }
}

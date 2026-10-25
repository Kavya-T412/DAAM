export type Role = 'Admin' | 'Manager' | 'Engineer' | 'Technician' | 'User' | 'Auditor'

export const ROLES: Role[] = ['Admin', 'Manager', 'Engineer', 'Technician', 'User', 'Auditor']

export type IdentityStatus = 'Pending' | 'Verified' | 'Active' | 'Suspended' | 'Revoked'
export const IDENTITY_STATUSES: IdentityStatus[] = ['Pending', 'Verified', 'Active', 'Suspended', 'Revoked']

export type CredentialStatus = 'Valid' | 'Pending' | 'Revoked'

export type AssetStatus = 'Registered' | 'Active' | 'Maintenance' | 'Retired' | 'Revoked'
export const ASSET_STATUSES: AssetStatus[] = ['Registered', 'Active', 'Maintenance', 'Retired', 'Revoked']

export type Purpose =
  | 'Scheduled maintenance'
  | 'Incident investigation'
  | 'Operational deployment'
  | 'Compliance audit'
  | 'Inventory reconciliation'
  | 'Training'

export const PURPOSES: Purpose[] = [
  'Scheduled maintenance',
  'Incident investigation',
  'Operational deployment',
  'Compliance audit',
  'Inventory reconciliation',
  'Training',
]

export type ActionKey =
  | 'view_metadata'
  | 'view_maintenance'
  | 'update_asset'
  | 'transfer_custody'
  | 'change_lifecycle'
  | 'register_asset'

export type PersonaKey = 'Admin' | 'Manager' | 'User' | 'Auditor'

export interface Identity {
  did: string
  wallet: string
  alias: string
  org: string
  role: Role
  status: IdentityStatus
  credential: CredentialStatus
  registeredAt: string
  lastActivity: string
}

export interface AssetDocument {
  id: string
  assetId: string
  name: string
  anchoredHash: string
  storageRef: string
  privateContent: string
  addedAt: string
  addedBy: string
}

export interface Asset {
  id: string
  tokenId: number
  name: string
  category: string
  owner: string
  custodian: string
  status: AssetStatus
  metadataHash: string
  metadataUri: string
  registeredAt: string
}

export type CustodyStatus = 'Completed' | 'Pending Approval' | 'Rejected'
export type CustodyType = 'Initial Assignment' | 'Transfer' | 'Return to Vault'

export interface CustodyEvent {
  id: string
  assetId: string
  type: CustodyType
  from: string
  to: string
  initiator: string
  approver?: string
  purpose: Purpose
  timestamp: string
  txRef: string
  status: CustodyStatus
}

export type Outcome = 'Granted' | 'Denied' | 'Approval Required'

export interface PolicyCheck {
  key: string
  label: string
  pass: boolean
  detail: string
}

export interface Decision {
  outcome: Outcome
  reason: string
  checks: PolicyCheck[]
}

export interface AccessRecord extends Decision {
  id: string
  did: string
  assetId: string
  action: ActionKey
  purpose: Purpose
  durationDays?: number
  timestamp: string
  approvedBy?: string
}

export type AuditType =
  | 'Identity Registration'
  | 'Identity Verified'
  | 'Identity Suspended'
  | 'Identity Reinstated'
  | 'Credential Revoked'
  | 'Role Changed'
  | 'Access Granted'
  | 'Access Denied'
  | 'Approval Required'
  | 'Approval Decision'
  | 'NFT Minted'
  | 'Custody Transfer'
  | 'Lifecycle Change'
  | 'Document Anchored'
  | 'Policy Updated'

export type AuditCategory = 'identity' | 'permission' | 'access' | 'nft' | 'custody' | 'lifecycle' | 'document' | 'policy'

export interface AuditEvent {
  id: string
  type: AuditType
  category: AuditCategory
  actor: string
  assetId?: string
  subject?: string
  summary: string
  timestamp: string
  txRef: string
  eventHash: string
}

export interface PolicyRule {
  action: ActionKey
  label: string
  enabled: boolean
  allowedRoles: Role[]
  permittedPurposes: Purpose[]
  allowedAssetStates: AssetStatus[]
  requiresApproval: boolean
  approvalPurposes: Purpose[]
}

export interface Policies {
  rules: Record<ActionKey, PolicyRule>
  blockedIdentityStates: IdentityStatus[]
  eligibleCustodianRoles: Role[]
  maxAccessDays: number
}

export interface WalletSession {
  provider: 'Demo Wallet' | 'MetaMask' | 'WalletConnect'
  address: string
  network: string
}

export interface Toast {
  id: number
  tone: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
}

'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { sha256Hex, simHash, simTx } from './format'
import {
  PERSONAS,
  SEED_ACCESS,
  SEED_ASSETS,
  SEED_AUDIT,
  SEED_CUSTODY,
  SEED_DOCUMENTS,
  SEED_IDENTITIES,
  SEED_POLICIES,
  UNREGISTERED_WALLET,
  VAULT_DID,
  ORG,
} from './mock-data'
import { ACTION_LABELS, evaluate } from './policy'
import type {
  AccessRecord,
  ActionKey,
  Asset,
  AssetDocument,
  AssetStatus,
  AuditEvent,
  CustodyEvent,
  Decision,
  Identity,
  PersonaKey,
  Policies,
  PolicyRule,
  Purpose,
  Role,
  Toast,
  WalletSession,
} from './types'

export interface DaamState {
  wallet: WalletSession | null
  activeDid: string | null
  identities: Identity[]
  assets: Asset[]
  documents: AssetDocument[]
  custody: CustodyEvent[]
  access: AccessRecord[]
  audit: AuditEvent[]
  policies: Policies
}

export interface Result {
  ok: boolean
  message: string
  decision?: Decision
  id?: string
}

const initialState = (): DaamState => ({
  wallet: null,
  activeDid: null,
  identities: SEED_IDENTITIES,
  assets: SEED_ASSETS,
  documents: SEED_DOCUMENTS,
  custody: SEED_CUSTODY,
  access: SEED_ACCESS,
  audit: SEED_AUDIT,
  policies: SEED_POLICIES,
})

type AuditInput = Omit<AuditEvent, 'id' | 'txRef' | 'eventHash' | 'timestamp'>

function withAudit(s: DaamState, ev: AuditInput, now: string): DaamState {
  const id = `EVT-${1001 + s.audit.length}`
  const event: AuditEvent = {
    ...ev,
    id,
    timestamp: now,
    txRef: simTx(`${id}:${now}`),
    eventHash: simHash(`${id}:${ev.type}:${ev.summary}:${now}`),
  }
  return { ...s, audit: [event, ...s.audit] }
}

function touch(s: DaamState, did: string | null, now: string): DaamState {
  if (!did) return s
  return { ...s, identities: s.identities.map((i) => (i.did === did ? { ...i, lastActivity: now } : i)) }
}

function patchIdentity(s: DaamState, did: string, patch: Partial<Identity>): DaamState {
  return { ...s, identities: s.identities.map((i) => (i.did === did ? { ...i, ...patch } : i)) }
}

function recordAccess(s: DaamState, rec: Omit<AccessRecord, 'id'>): { state: DaamState; id: string } {
  const id = `ACC-${5001 + s.access.length}`
  return { state: { ...s, access: [{ ...rec, id }, ...s.access] }, id }
}

function accessAuditType(d: Decision): AuditEvent['type'] {
  return d.outcome === 'Granted' ? 'Access Granted' : d.outcome === 'Denied' ? 'Access Denied' : 'Approval Required'
}

interface DaamContextValue {
  state: DaamState
  me: Identity | undefined
  toasts: Toast[]
  dismissToast: (id: number) => void
  notify: (t: Omit<Toast, 'id'>) => void
  identityOf: (did: string) => Identity | undefined
  connectWallet: (provider: WalletSession['provider'], persona: PersonaKey | 'unregistered') => void
  switchPersona: (persona: PersonaKey) => void
  disconnectWallet: () => void
  registerIdentity: (input: { alias: string; requestedRole: Role }) => Result
  approveRegistration: (did: string) => Result
  verifyIdentity: (did: string, role: Role) => Result
  activateIdentity: (did: string) => Result
  setRole: (did: string, role: Role) => Result
  suspendIdentity: (did: string) => Result
  reinstateIdentity: (did: string) => Result
  revokeCredential: (did: string) => Result
  registerAsset: (input: { id: string; name: string; category: string; purpose: Purpose }) => Result
  transferCustody: (input: { assetId: string; to: string; purpose: Purpose }) => Result
  decideCustody: (id: string, approve: boolean) => Result
  changeLifecycle: (input: { assetId: string; to: AssetStatus; purpose: Purpose }) => Result
  requestAccess: (input: {
    did: string
    assetId: string
    action: ActionKey
    purpose: Purpose
    durationDays?: number
  }) => Result
  decideAccess: (id: string, approve: boolean) => Result
  addDocument: (input: { assetId: string; name: string; content: string; purpose: Purpose }) => Promise<Result>
  updateRule: (action: ActionKey, patch: Partial<PolicyRule>, summary: string) => Result
  updatePolicies: (patch: Partial<Omit<Policies, 'rules'>>, summary: string) => Result
  resetDemo: () => void
}

const DaamContext = createContext<DaamContextValue | null>(null)

let toastSeq = 1

export function DaamProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DaamState>(initialState)
  const ref = useRef<DaamState>(state)
  const [toasts, setToasts] = useState<Toast[]>([])

  const commit = useCallback((next: DaamState) => {
    ref.current = next
    setState(next)
  }, [])

  const notify = useCallback((t: Omit<Toast, 'id'>) => {
    const id = toastSeq++
    setToasts((prev) => [...prev.slice(-3), { ...t, id }])
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5200)
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), [])

  const actor = () => ref.current.identities.find((i) => i.did === ref.current.activeDid)
  const find = (did: string) => ref.current.identities.find((i) => i.did === did)

  const requireAdmin = (): Result | null => {
    const a = actor()
    if (!a || a.role !== 'Admin' || a.status !== 'Active' || a.credential !== 'Valid') {
      const r = { ok: false, message: 'Only an active Admin identity can perform identity governance actions.' }
      notify({ tone: 'error', title: 'Not permitted', description: r.message })
      return r
    }
    return null
  }

  const finish = (r: Result, title: string): Result => {
    notify({
      tone: r.decision?.outcome === 'Approval Required' ? 'warning' : r.ok ? 'success' : 'error',
      title,
      description: r.message,
    })
    return r
  }

  const value = useMemo<DaamContextValue>(() => {
    const identityGovernance = (
      did: string,
      patch: Partial<Identity>,
      type: AuditEvent['type'],
      summary: string,
      title: string,
    ): Result => {
      const denied = requireAdmin()
      if (denied) return denied
      const now = new Date().toISOString()
      let s = patchIdentity(ref.current, did, patch)
      s = withAudit(s, { type, category: type === 'Role Changed' ? 'permission' : 'identity', actor: ref.current.activeDid!, subject: did, summary }, now)
      s = touch(s, ref.current.activeDid, now)
      commit(s)
      return finish({ ok: true, message: summary }, title)
    }

    return {
      state,
      me: state.identities.find((i) => i.did === state.activeDid),
      toasts,
      dismissToast,
      notify,
      identityOf: (did) => state.identities.find((i) => i.did === did),

      connectWallet: (provider, persona) => {
        if (persona === 'unregistered') {
          const existing = ref.current.identities.find((i) => i.wallet === UNREGISTERED_WALLET)
          commit({
            ...ref.current,
            wallet: { provider, address: UNREGISTERED_WALLET, network: 'Demo Chain (simulated)' },
            activeDid: existing?.did ?? null,
          })
          notify({ tone: 'info', title: 'Demo wallet connected', description: 'No DID is linked to this wallet yet.' })
          return
        }
        const did = PERSONAS[persona].did
        const id = find(did)!
        commit({ ...ref.current, wallet: { provider, address: id.wallet, network: 'Demo Chain (simulated)' }, activeDid: did })
        notify({ tone: 'success', title: `Connected as ${persona}`, description: `Wallet resolved to ${did} (simulated).` })
      },

      switchPersona: (persona) => {
        const did = PERSONAS[persona].did
        const id = find(did)!
        commit({
          ...ref.current,
          wallet: { provider: ref.current.wallet?.provider ?? 'Demo Wallet', address: id.wallet, network: 'Demo Chain (simulated)' },
          activeDid: did,
        })
        notify({ tone: 'info', title: `Persona: ${persona}`, description: did })
      },

      disconnectWallet: () => {
        commit({ ...ref.current, wallet: null, activeDid: null })
        notify({ tone: 'info', title: 'Wallet disconnected', description: 'Your DID and credentials are unchanged — only this session ended.' })
      },

      registerIdentity: ({ alias, requestedRole }) => {
        const s0 = ref.current
        if (!s0.wallet) return { ok: false, message: 'Connect a wallet first.' }
        const now = new Date().toISOString()
        const did = `did:bel:employee:${3001 + s0.identities.length}`
        const identity: Identity = {
          did,
          wallet: s0.wallet.address,
          alias: alias || 'New registrant',
          org: ORG,
          role: requestedRole,
          status: 'Pending',
          credential: 'Pending',
          registeredAt: now,
          lastActivity: now,
        }
        let s: DaamState = { ...s0, identities: [identity, ...s0.identities], activeDid: did }
        s = withAudit(s, { type: 'Identity Registration', category: 'identity', actor: did, subject: did, summary: `Registration requested for ${did} (${requestedRole})` }, now)
        commit(s)
        return finish({ ok: true, message: `Registration submitted for ${did}. Awaiting administrator review.`, id: did }, 'Registration submitted')
      },

      approveRegistration: (did) => {
        const now = new Date().toISOString()
        const target = find(did)
        if (!target) return { ok: false, message: 'Identity not found.' }
        let s = patchIdentity(ref.current, did, { status: 'Active', credential: 'Valid', lastActivity: now })
        s = withAudit(s, { type: 'Identity Verified', category: 'identity', actor: PERSONAS.Admin.did, subject: did, summary: `${did} verified and activated as ${target.role} (simulated admin review)` }, now)
        commit(s)
        return finish({ ok: true, message: `${did} is now Active as ${target.role}.` }, 'Administrator approved')
      },

      verifyIdentity: (did, role) =>
        identityGovernance(did, { status: 'Active', credential: 'Valid', role }, 'Identity Verified', `${did} verified and activated as ${role}`, 'Identity verified'),
      activateIdentity: (did) =>
        identityGovernance(did, { status: 'Active', credential: 'Valid' }, 'Identity Verified', `${did} activated`, 'Identity activated'),
      setRole: (did, role) => identityGovernance(did, { role }, 'Role Changed', `${did} role changed to ${role}`, 'Role updated'),
      suspendIdentity: (did) =>
        identityGovernance(did, { status: 'Suspended' }, 'Identity Suspended', `${did} suspended — protected operations blocked`, 'Identity suspended'),
      reinstateIdentity: (did) =>
        identityGovernance(did, { status: 'Active' }, 'Identity Reinstated', `${did} reinstated to Active`, 'Identity reinstated'),
      revokeCredential: (did) =>
        identityGovernance(did, { status: 'Revoked', credential: 'Revoked' }, 'Credential Revoked', `Credential revoked for ${did}`, 'Credential revoked'),

      registerAsset: ({ id, name, category, purpose }) => {
        const s0 = ref.current
        const a = actor()
        const assetId = id.trim().toUpperCase()
        if (!assetId || !name.trim()) return finish({ ok: false, message: 'Asset ID and name are required.' }, 'Registration incomplete')
        if (s0.assets.some((x) => x.id === assetId)) return finish({ ok: false, message: `${assetId} is already registered.` }, 'Duplicate asset')
        const decision = evaluate({ identity: a, asset: undefined, action: 'register_asset', purpose, policies: s0.policies })
        const now = new Date().toISOString()
        let { state: s } = recordAccess(s0, { did: a?.did ?? 'unknown', assetId, action: 'register_asset', purpose, timestamp: now, ...decision })
        if (decision.outcome !== 'Granted') {
          s = withAudit(s, { type: accessAuditType(decision), category: 'access', actor: a?.did ?? 'unknown', assetId, summary: `Register ${assetId}: ${decision.reason}` }, now)
          commit(s)
          return finish({ ok: false, message: decision.reason, decision }, 'Registration blocked')
        }
        const tokenId = Math.max(...s0.assets.map((x) => x.tokenId)) + 1
        const asset: Asset = {
          id: assetId,
          tokenId,
          name: name.trim(),
          category: category.trim() || 'General',
          owner: ORG,
          custodian: VAULT_DID,
          status: 'Registered',
          metadataHash: simHash(`${assetId}:${name}:metadata:${now}`),
          metadataUri: `ipfs://bafy${simHash(assetId + now).slice(2, 30)}/metadata.json`,
          registeredAt: now,
        }
        s = { ...s, assets: [asset, ...s.assets] }
        s = withAudit(s, { type: 'NFT Minted', category: 'nft', actor: a!.did, assetId, summary: `Asset passport NFT #${String(tokenId).padStart(4, '0')} minted for ${assetId} (simulated)` }, now)
        s = touch(s, a!.did, now)
        commit(s)
        return finish({ ok: true, message: `${assetId} registered with simulated NFT #${String(tokenId).padStart(4, '0')}.`, decision, id: assetId }, 'Asset registered')
      },

      transferCustody: ({ assetId, to, purpose }) => {
        const s0 = ref.current
        const a = actor()
        const asset = s0.assets.find((x) => x.id === assetId)
        if (!asset) return finish({ ok: false, message: 'Asset not found.' }, 'Transfer failed')
        const receiver = find(to)
        const decision = evaluate({ identity: a, asset, action: 'transfer_custody', purpose, policies: s0.policies, receiver })
        const now = new Date().toISOString()
        const rec = recordAccess(s0, { did: a?.did ?? 'unknown', assetId, action: 'transfer_custody', purpose, timestamp: now, ...decision })
        let s = rec.state
        if (decision.outcome === 'Denied') {
          s = withAudit(s, { type: 'Access Denied', category: 'access', actor: a?.did ?? 'unknown', assetId, summary: `Custody transfer of ${assetId}: ${decision.reason}` }, now)
          commit(s)
          return finish({ ok: false, message: decision.reason, decision }, 'Transfer denied')
        }
        const id = `CUS-${1001 + s.custody.length}`
        const pending = decision.outcome === 'Approval Required'
        const event: CustodyEvent = {
          id,
          assetId,
          type: to === VAULT_DID ? 'Return to Vault' : asset.custodian === VAULT_DID ? 'Initial Assignment' : 'Transfer',
          from: asset.custodian,
          to,
          initiator: a!.did,
          approver: pending ? undefined : a!.role === 'Admin' ? a!.did : undefined,
          purpose,
          timestamp: now,
          txRef: simTx(`${id}:${now}`),
          status: pending ? 'Pending Approval' : 'Completed',
        }
        s = { ...s, custody: [event, ...s.custody] }
        if (!pending) s = { ...s, assets: s.assets.map((x) => (x.id === assetId ? { ...x, custodian: to } : x)) }
        s = withAudit(
          s,
          {
            type: pending ? 'Approval Required' : 'Custody Transfer',
            category: 'custody',
            actor: a!.did,
            assetId,
            subject: to,
            summary: pending ? `${assetId} transfer to ${to} awaiting approval` : `${assetId} custody → ${to} (${purpose})`,
          },
          now,
        )
        s = touch(s, a!.did, now)
        commit(s)
        return finish(
          { ok: true, message: pending ? decision.reason : `Custody of ${assetId} transferred to ${to}. Ref ${event.txRef}`, decision, id },
          pending ? 'Approval required' : 'Custody transferred',
        )
      },

      decideCustody: (id, approve) => {
        const s0 = ref.current
        const a = actor()
        if (!a || !['Admin', 'Manager'].includes(a.role) || a.status !== 'Active')
          return finish({ ok: false, message: 'Only an active Admin or Manager can decide custody approvals.' }, 'Not permitted')
        const ev = s0.custody.find((c) => c.id === id)
        if (!ev || ev.status !== 'Pending Approval') return { ok: false, message: 'Nothing to decide.' }
        if (ev.initiator === a.did)
          return finish({ ok: false, message: 'Separation of duties: the initiator cannot approve their own transfer.' }, 'Not permitted')
        const now = new Date().toISOString()
        let s: DaamState = {
          ...s0,
          custody: s0.custody.map((c) => (c.id === id ? { ...c, status: approve ? 'Completed' : 'Rejected', approver: a.did } : c)),
        }
        if (approve) s = { ...s, assets: s.assets.map((x) => (x.id === ev.assetId ? { ...x, custodian: ev.to } : x)) }
        s = withAudit(s, { type: approve ? 'Custody Transfer' : 'Approval Decision', category: 'custody', actor: a.did, assetId: ev.assetId, subject: ev.to, summary: approve ? `${ev.assetId} custody → ${ev.to} approved by ${a.did}` : `${ev.assetId} transfer to ${ev.to} rejected` }, now)
        commit(s)
        return finish({ ok: true, message: approve ? 'Transfer approved and custodian updated.' : 'Transfer rejected. History preserved.' }, approve ? 'Approved' : 'Rejected')
      },

      changeLifecycle: ({ assetId, to, purpose }) => {
        const s0 = ref.current
        const a = actor()
        const asset = s0.assets.find((x) => x.id === assetId)
        if (!asset) return { ok: false, message: 'Asset not found.' }
        const decision = evaluate({ identity: a, asset, action: 'change_lifecycle', purpose, policies: s0.policies, targetState: to })
        const now = new Date().toISOString()
        let { state: s } = recordAccess(s0, { did: a?.did ?? 'unknown', assetId, action: 'change_lifecycle', purpose, timestamp: now, ...decision })
        if (decision.outcome !== 'Granted') {
          s = withAudit(s, { type: accessAuditType(decision), category: 'access', actor: a?.did ?? 'unknown', assetId, summary: `${asset.status} → ${to} on ${assetId}: ${decision.reason}` }, now)
          commit(s)
          return finish({ ok: false, message: decision.reason, decision }, 'Transition blocked')
        }
        s = { ...s, assets: s.assets.map((x) => (x.id === assetId ? { ...x, status: to } : x)) }
        s = withAudit(s, { type: 'Lifecycle Change', category: 'lifecycle', actor: a!.did, assetId, summary: `${assetId} moved ${asset.status} → ${to} (${purpose})` }, now)
        s = touch(s, a!.did, now)
        commit(s)
        return finish({ ok: true, message: `${assetId} is now ${to}. Dependent access decisions recalculated.`, decision }, 'Lifecycle updated')
      },

      requestAccess: ({ did, assetId, action, purpose, durationDays }) => {
        const s0 = ref.current
        const identity = find(did)
        const asset = s0.assets.find((x) => x.id === assetId)
        const decision = evaluate({ identity, asset, action, purpose, policies: s0.policies, durationDays })
        const now = new Date().toISOString()
        const rec = recordAccess(s0, { did, assetId, action, purpose, durationDays, timestamp: now, ...decision })
        let s = withAudit(rec.state, { type: accessAuditType(decision), category: 'access', actor: did, assetId, subject: did, summary: `${ACTION_LABELS[action]} on ${assetId}: ${decision.reason}` }, now)
        s = touch(s, did, now)
        commit(s)
        return finish(
          { ok: decision.outcome === 'Granted', message: decision.reason, decision, id: rec.id },
          decision.outcome === 'Granted' ? 'Access granted' : decision.outcome === 'Denied' ? 'Access denied' : 'Approval required',
        )
      },

      decideAccess: (id, approve) => {
        const s0 = ref.current
        const a = actor()
        if (!a || !['Admin', 'Manager'].includes(a.role) || a.status !== 'Active')
          return finish({ ok: false, message: 'Only an active Admin or Manager can decide approvals.' }, 'Not permitted')
        const rec = s0.access.find((r) => r.id === id)
        if (!rec || rec.outcome !== 'Approval Required') return { ok: false, message: 'Nothing to decide.' }
        const now = new Date().toISOString()
        const reason = approve ? `Access granted after additional approval by ${a.did}.` : `Access denied: additional approval was declined by ${a.did}.`
        let s: DaamState = {
          ...s0,
          access: s0.access.map((r) => (r.id === id ? { ...r, outcome: approve ? 'Granted' : 'Denied', reason, approvedBy: a.did } : r)),
        }
        s = withAudit(s, { type: 'Approval Decision', category: 'access', actor: a.did, assetId: rec.assetId, subject: rec.did, summary: reason }, now)
        commit(s)
        return finish({ ok: true, message: reason }, approve ? 'Approved' : 'Declined')
      },

      addDocument: async ({ assetId, name, content, purpose }) => {
        const a = actor()
        const asset = ref.current.assets.find((x) => x.id === assetId)
        if (!asset) return { ok: false, message: 'Asset not found.' }
        const decision = evaluate({ identity: a, asset, action: 'update_asset', purpose, policies: ref.current.policies })
        const now = new Date().toISOString()
        if (decision.outcome !== 'Granted') {
          let { state: s } = recordAccess(ref.current, { did: a?.did ?? 'unknown', assetId, action: 'update_asset', purpose, timestamp: now, ...decision })
          s = withAudit(s, { type: accessAuditType(decision), category: 'access', actor: a?.did ?? 'unknown', assetId, summary: `Attach document to ${assetId}: ${decision.reason}` }, now)
          commit(s)
          return finish({ ok: false, message: decision.reason, decision }, 'Document blocked')
        }
        const hash = await sha256Hex(content)
        const s0 = ref.current
        const docId = `DOC-${assetId.split('-')[1] ?? 'X'}-${String(s0.documents.length + 1).padStart(2, '0')}`
        const doc: AssetDocument = {
          id: docId,
          assetId,
          name: name.trim() || 'Untitled document',
          anchoredHash: hash,
          storageRef: `enc://vault/${assetId.toLowerCase()}/${docId.toLowerCase()}.aes`,
          privateContent: content,
          addedAt: now,
          addedBy: a!.did,
        }
        let { state: s } = recordAccess(s0, { did: a!.did, assetId, action: 'update_asset', purpose, timestamp: now, ...decision })
        s = { ...s, documents: [doc, ...s.documents] }
        s = withAudit(s, { type: 'Document Anchored', category: 'document', actor: a!.did, assetId, summary: `Hash of "${doc.name}" anchored for ${assetId}` }, now)
        s = touch(s, a!.did, now)
        commit(s)
        return finish({ ok: true, message: `SHA-256 ${hash.slice(0, 14)}… anchored; content kept in encrypted off-chain storage.`, id: docId }, 'Document hash anchored')
      },

      updateRule: (action, patch, summary) => {
        const denied = requireAdmin()
        if (denied) return denied
        const now = new Date().toISOString()
        const s0 = ref.current
        let s: DaamState = {
          ...s0,
          policies: { ...s0.policies, rules: { ...s0.policies.rules, [action]: { ...s0.policies.rules[action], ...patch } } },
        }
        s = withAudit(s, { type: 'Policy Updated', category: 'policy', actor: s0.activeDid!, summary }, now)
        commit(s)
        notify({ tone: 'success', title: 'Policy updated', description: summary })
        return { ok: true, message: summary }
      },

      updatePolicies: (patch, summary) => {
        const denied = requireAdmin()
        if (denied) return denied
        const now = new Date().toISOString()
        const s0 = ref.current
        let s: DaamState = { ...s0, policies: { ...s0.policies, ...patch } }
        s = withAudit(s, { type: 'Policy Updated', category: 'policy', actor: s0.activeDid!, summary }, now)
        commit(s)
        notify({ tone: 'success', title: 'Policy updated', description: summary })
        return { ok: true, message: summary }
      },

      resetDemo: () => {
        const keep = ref.current
        const fresh = initialState()
        const did = keep.activeDid && fresh.identities.some((i) => i.did === keep.activeDid) ? keep.activeDid : null
        commit({ ...fresh, wallet: did ? keep.wallet : null, activeDid: did })
        notify({ tone: 'info', title: 'Demo data reset', description: 'All records restored to the initial illustrative dataset.' })
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, toasts])

  return <DaamContext.Provider value={value}>{children}</DaamContext.Provider>
}

export function useDaam() {
  const ctx = useContext(DaamContext)
  if (!ctx) throw new Error('useDaam must be used within DaamProvider')
  return ctx
}

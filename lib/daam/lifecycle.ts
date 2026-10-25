import type { AssetStatus } from './types'

export const TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  Registered: ['Active', 'Revoked'],
  Active: ['Maintenance', 'Retired', 'Revoked'],
  Maintenance: ['Active', 'Retired', 'Revoked'],
  Retired: [],
  Revoked: [],
}

export const LIFECYCLE_ORDER: AssetStatus[] = ['Registered', 'Active', 'Maintenance', 'Retired', 'Revoked']

export function transitionCheck(from: AssetStatus, to: AssetStatus): { ok: boolean; reason: string } {
  if (from === to) return { ok: false, reason: `Asset is already ${from}.` }
  if (TRANSITIONS[from].includes(to)) return { ok: true, reason: `${from} → ${to} is a valid transition.` }
  if (from === 'Revoked')
    return { ok: false, reason: 'Revoked assets are terminal and cannot return to service through ordinary operations.' }
  if (from === 'Retired') return { ok: false, reason: 'Retired assets are decommissioned and cannot change state.' }
  if (from === 'Registered' && to === 'Maintenance')
    return { ok: false, reason: 'An asset must be Active before it can enter Maintenance.' }
  if (from === 'Registered' && to === 'Retired')
    return { ok: false, reason: 'A registered asset that never entered service should be revoked, not retired.' }
  return { ok: false, reason: `${from} → ${to} is not a permitted lifecycle transition.` }
}

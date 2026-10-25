const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n: number) => String(n).padStart(2, '0')

/** Timezone-stable formatting so server and client render identical strings. */
export function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export const formatDate = fmtDate

export function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}

export const formatDateTime = fmtDateTime

export function shortAddr(addr: string): string {
  if (!addr.startsWith('0x') || addr.length < 10) return addr
  return `0x${addr.slice(2, 5)}...${addr.slice(-3)}`
}

export function shortHash(hash: string, size = 6): string {
  if (hash.length <= size * 2 + 3) return hash
  return `${hash.slice(0, size + 2)}…${hash.slice(-size)}`
}

/**
 * Deterministic, non-cryptographic hash used only to label simulated event
 * and transaction references. Document integrity uses real SHA-256 instead.
 */
export function simHash(input: string): string {
  let out = ''
  let h1 = 0x811c9dc5
  for (let round = 0; round < 8; round++) {
    let h = h1 ^ (round * 0x9e3779b1)
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    h1 = h
    out += (h >>> 0).toString(16).padStart(8, '0')
  }
  return `0x${out}`
}

export function simTx(seed: string): string {
  return `sim-tx:${simHash(seed).slice(0, 18)}`
}

export async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return `0x${Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`
}

export function timeAgo(iso: string, nowIso: string): string {
  const diff = Math.max(0, new Date(nowIso).getTime() - new Date(iso).getTime())
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

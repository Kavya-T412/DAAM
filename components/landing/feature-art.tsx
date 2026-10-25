import { Ban, Check, FileLock2, Fingerprint, Hash, Lock, ShieldCheck, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const frame = 'relative flex h-36 items-center justify-center overflow-hidden rounded-2xl'

export function IdentityArt({ dark }: { dark?: boolean }) {
  return (
    <div className={cn(frame, dark ? 'bg-cream/5' : 'bg-ink/[0.04]')} aria-hidden="true">
      <div className="flex items-center gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary text-cream shadow-lg">
          <Wallet className="size-6" />
        </span>
        <span className="h-px w-10 border-t-2 border-dashed border-current opacity-40" />
        <span className="relative rounded-2xl border border-current/20 bg-cream px-3 py-2 text-ink shadow">
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-success">
            <span className="absolute inset-0 rounded-full bg-success animate-ping-soft" />
          </span>
          <Fingerprint className="size-5 text-primary" />
          <span className="mt-1 block font-mono text-[9px]">did:bel:1023</span>
        </span>
      </div>
    </div>
  )
}

export function PolicyArt() {
  const rows = ['Identity active', 'Role permits action', 'Purpose allowed', 'Within time window']
  return (
    <div className={cn(frame, 'bg-ink/[0.04] px-5')} aria-hidden="true">
      <ul className="w-full space-y-1.5">
        {rows.map((r, i) => (
          <li key={r} className="flex items-center gap-2 rounded-lg bg-cream px-2.5 py-1.5 text-[11px] text-ink shadow-sm" style={{ opacity: 1 - i * 0.12 }}>
            <span className="grid size-4 place-items-center rounded-full bg-success text-cream">
              <Check className="size-2.5" />
            </span>
            {r}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PassportArt() {
  return (
    <div className={cn(frame, 'bg-cream/10')} aria-hidden="true">
      <div className="w-44 -rotate-6 rounded-xl bg-cream p-3 text-ink shadow-xl">
        <div className="flex justify-between font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
          <span>NFT passport</span>
          <span>ERC-721</span>
        </div>
        <p className="mt-1.5 font-serif text-3xl leading-none">#0003</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-primary/20">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </div>
      <div className="absolute right-6 bottom-4 w-28 rotate-6 rounded-xl bg-ink p-2.5 text-cream shadow-xl">
        <p className="font-mono text-[8px] text-cream/60">metadata</p>
        <p className="font-mono text-[9px]">0x56f5…19d4</p>
      </div>
    </div>
  )
}

export function LifecycleArt() {
  const states = ['Reg', 'Active', 'Maint', 'Retired']
  return (
    <div className={cn(frame, 'bg-ink/[0.04] px-5')} aria-hidden="true">
      <div className="relative flex w-full items-center justify-between">
        <span className="absolute inset-x-3 top-3 h-0.5 bg-ink/15" />
        <span className="absolute top-3 left-3 h-0.5 w-[60%] bg-primary" />
        {states.map((s, i) => (
          <span key={s} className="relative flex flex-col items-center gap-2">
            <span className={cn('size-6 rounded-full border-2', i < 2 ? 'border-primary bg-primary' : i === 2 ? 'border-primary bg-cream' : 'border-ink/20 bg-cream')}>
              {i === 2 && <span className="block size-full rounded-full bg-primary/40 animate-ping-soft" />}
            </span>
            <span className="font-mono text-[10px] text-ink">{s}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function CustodyArt() {
  const people = ['VLT', 'E-1023', 'M-07', 'E-3311']
  return (
    <div className={cn(frame, 'bg-ink/[0.04]')} aria-hidden="true">
      <div className="flex items-center">
        {people.map((p, i) => (
          <span key={p} className="flex items-center">
            <span className={cn('grid size-12 place-items-center rounded-full border-2 font-mono text-[9px] font-semibold', i === people.length - 1 ? 'border-primary bg-primary text-cream' : 'border-ink/20 bg-cream text-ink')}>
              {p}
            </span>
            {i < people.length - 1 && <span className="h-0.5 w-5 bg-ink/25" />}
          </span>
        ))}
      </div>
    </div>
  )
}

export function PrivacyArt({ dark }: { dark?: boolean }) {
  return (
    <div className={cn(frame, dark ? 'bg-cream/5' : 'bg-ink/[0.04]')} aria-hidden="true">
      <div className="flex items-center gap-2">
        <span className="grid size-12 place-items-center rounded-xl bg-cream text-ink shadow">
          <FileLock2 className="size-5" />
        </span>
        <span className="font-mono text-xs opacity-60">→</span>
        <span className="grid size-12 place-items-center rounded-xl bg-secondary text-ink shadow">
          <Hash className="size-5" />
        </span>
        <span className="font-mono text-xs opacity-60">→</span>
        <span className="rounded-xl border border-current/20 px-2.5 py-2 font-mono text-[9px] leading-tight">
          0x7f3a…c21e
          <br />
          <span className="opacity-60">on-chain ref</span>
        </span>
      </div>
      <Lock className="absolute top-3 right-3 size-4 opacity-40" />
    </div>
  )
}

export function StateArt() {
  return (
    <div className={cn(frame, 'bg-ink/[0.04] gap-3')} aria-hidden="true">
      <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream px-4 py-3 shadow">
        <ShieldCheck className="size-6 text-success" />
        <span className="text-[10px] font-medium text-ink">Active</span>
      </span>
      <span className="font-mono text-xs text-ink/50">vs</span>
      <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-ink px-4 py-3 text-cream shadow">
        <Ban className="size-6 text-secondary" />
        <span className="text-[10px] font-medium">Suspended</span>
      </span>
    </div>
  )
}

export function HistoryArt() {
  return (
    <div className={cn(frame, 'bg-cream/10')} aria-hidden="true">
      <div className="flex flex-col gap-1.5">
        {['0x1a4c…77fe', '0xae31…09b2', '0xc902…4d10'].map((h, i) => (
          <span key={h} className="flex items-center gap-2 rounded-lg bg-cream px-3 py-1.5 font-mono text-[10px] text-ink shadow" style={{ marginLeft: i * 14 }}>
            <span className="size-2 rounded-sm bg-primary" />
            {h}
          </span>
        ))}
      </div>
    </div>
  )
}

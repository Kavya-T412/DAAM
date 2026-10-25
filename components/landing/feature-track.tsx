'use client'

import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CustodyArt, HistoryArt, IdentityArt, LifecycleArt, PassportArt, PolicyArt, PrivacyArt, StateArt } from './feature-art'

type Variant = 'cream' | 'ink' | 'pink' | 'outline'

interface Feature {
  title: string
  body: string
  tech: string
  href: string
  variant: Variant
  width: string
  art: ReactNode
}

const FEATURES: Feature[] = [
  { title: 'Wallet-Linked Identity', body: 'A wallet signs in; a decentralized identifier carries the role, department, and status.', tech: 'DID registry · simulated signatures', href: '/app/identity', variant: 'cream', width: 'w-[300px] sm:w-[360px]', art: <IdentityArt /> },
  { title: 'Dynamic Access Governance', body: 'Access is decided per request from role, purpose, identity state, and asset state — and explained.', tech: 'Policy engine · RBAC + context', href: '/app/access', variant: 'ink', width: 'w-[300px] sm:w-[420px]', art: <PolicyArt /> },
  { title: 'NFT Asset Passport', body: 'Each physical asset gets a unique token whose metadata hash binds it to its digital twin.', tech: 'ERC-721 style · metadata hash', href: '/app/assets', variant: 'pink', width: 'w-[300px] sm:w-[340px]', art: <PassportArt /> },
  { title: 'Lifecycle Intelligence', body: 'Registered → Active → Maintenance → Retired. Invalid transitions are rejected by rule.', tech: 'State machine · rule validation', href: '/app/assets', variant: 'cream', width: 'w-[300px] sm:w-[400px]', art: <LifecycleArt /> },
  { title: 'Chain of Custody', body: 'Who holds an asset, from whom, why, and who approved — never overwritten.', tech: 'Append-only custody ledger', href: '/app/custody', variant: 'outline', width: 'w-[300px] sm:w-[360px]', art: <CustodyArt /> },
  { title: 'Privacy-Preserving Audit', body: 'Documents stay private. Only their SHA-256 fingerprint is anchored for verification.', tech: 'Web Crypto SHA-256 · hash anchoring', href: '/app/audit', variant: 'ink', width: 'w-[300px] sm:w-[380px]', art: <PrivacyArt dark /> },
  { title: 'Identity-State Protection', body: 'Suspend or revoke a DID and every protected action stops at once — the wallet can’t bypass it.', tech: 'Status-gated authorization', href: '/app/identity', variant: 'cream', width: 'w-[300px] sm:w-[340px]', art: <StateArt /> },
  { title: 'Verifiable Asset History', body: 'Every lifecycle, custody, and access event carries a reference anyone can independently verify.', tech: 'Hash-referenced event log', href: '/app/audit', variant: 'pink', width: 'w-[300px] sm:w-[400px]', art: <HistoryArt /> },
]

const SKIN: Record<Variant, string> = {
  cream: 'bg-cream text-ink border-border',
  ink: 'bg-ink text-cream border-ink',
  pink: 'bg-primary text-cream border-primary',
  outline: 'bg-transparent text-ink border-ink/30 border-dashed',
}

const SPEED = 38
const GAP = 20

function FeatureCard({ f, index, hidden }: { f: Feature; index: number; hidden?: boolean }) {
  const dark = f.variant === 'ink' || f.variant === 'pink'
  return (
    <article
      data-card={hidden ? undefined : index}
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${FEATURES.length}: ${f.title}`}
      className={cn('group flex h-[440px] shrink-0 flex-col rounded-[28px] border p-5 transition-transform duration-300 hover:-translate-y-1.5', SKIN[f.variant], f.width)}
    >
      <div className="flex items-start justify-between">
        <span className="font-serif text-5xl leading-none opacity-90">{String(index + 1).padStart(2, '0')}</span>
        <span className={cn('rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider', dark ? 'bg-cream/15' : 'bg-ink/5')}>{f.tech}</span>
      </div>
      <div className="mt-5">{f.art}</div>
      <h3 className="mt-5 font-serif text-[28px] leading-[1.05] text-balance">{f.title}</h3>
      <p className={cn('mt-2 text-sm leading-relaxed', dark ? 'text-cream/80' : 'text-muted-foreground')}>{f.body}</p>
      <Link
        href={f.href}
        tabIndex={hidden ? -1 : undefined}
        draggable={false}
        className={cn(
          'mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors',
          dark ? 'border-cream/30 hover:bg-cream hover:text-ink' : 'border-ink/25 hover:bg-ink hover:text-cream',
        )}
      >
        Explore<span className="sr-only"> {f.title}</span> <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  )
}

export function FeatureTrack() {
  const viewport = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const setA = useRef<HTMLDivElement>(null)
  const offset = useRef(0)
  const setWidth = useRef(1)
  const cardLefts = useRef<number[]>([])
  const flags = useRef({ hover: false, focus: false, drag: false, visible: false, resumeAt: 0 })
  const tween = useRef<{ from: number; to: number; start: number } | null>(null)
  const playingRef = useRef(true)
  const reducedRef = useRef(false)
  const activeRef = useRef(0)

  const [playing, setPlaying] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      reducedRef.current = mq.matches
      setReduced(mq.matches)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const vp = viewport.current
    const a = setA.current
    const track = inner.current
    if (!vp || !a || !track) return

    const measure = () => {
      setWidth.current = a.offsetWidth + GAP
      cardLefts.current = Array.from(a.querySelectorAll<HTMLElement>('[data-card]')).map((c) => c.offsetLeft - a.offsetLeft)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(a)

    const io = new IntersectionObserver(([e]) => (flags.current.visible = e.isIntersecting), { threshold: 0.1 })
    io.observe(vp)

    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(now - last, 64)
      last = now
      const f = flags.current
      const w = setWidth.current
      if (tween.current) {
        const t = Math.min((now - tween.current.start) / 550, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        offset.current = tween.current.from + (tween.current.to - tween.current.from) * ease
        if (t >= 1) tween.current = null
      } else if (playingRef.current && !reducedRef.current && f.visible && !f.hover && !f.focus && !f.drag && now > f.resumeAt) {
        offset.current += (SPEED * dt) / 1000
      }
      if (!tween.current) {
        if (offset.current >= w) offset.current -= w
        if (offset.current < 0) offset.current += w
      }
      track.style.transform = `translate3d(${-offset.current}px,0,0)`

      const pos = (((offset.current + 60) % w) + w) % w
      let idx = 0
      cardLefts.current.forEach((left, i) => {
        if (left <= pos) idx = i
      })
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      tween.current = null
      offset.current += e.deltaX
      flags.current.resumeAt = performance.now() + 1500
    }
    vp.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      vp.removeEventListener('wheel', onWheel)
    }
  }, [])

  const goTo = useCallback((index: number) => {
    const lefts = cardLefts.current
    const n = lefts.length
    if (!n) return
    const w = setWidth.current
    const wrapped = ((index % n) + n) % n
    let to = lefts[wrapped]
    const from = offset.current
    if (index >= n) to += w
    if (index < 0 && to > from) to -= w
    tween.current = { from, to, start: performance.now() }
    flags.current.resumeAt = performance.now() + 3500
  }, [])

  const drag = useRef({ x: 0, start: 0, moved: false, id: -1 })

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    drag.current = { x: e.clientX, start: offset.current, moved: false, id: e.pointerId }
    flags.current.drag = true
    tween.current = null
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!flags.current.drag || drag.current.id !== e.pointerId) return
    const dx = e.clientX - drag.current.x
    if (!drag.current.moved && Math.abs(dx) > 6) {
      drag.current.moved = true
      viewport.current?.setPointerCapture(e.pointerId)
    }
    if (drag.current.moved) offset.current = drag.current.start - dx
  }
  const endDrag = (e: React.PointerEvent) => {
    if (drag.current.id !== e.pointerId) return
    flags.current.drag = false
    flags.current.resumeAt = performance.now() + 1800
    if (viewport.current?.hasPointerCapture(e.pointerId)) viewport.current.releasePointerCapture(e.pointerId)
  }

  return (
    <div>
      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label="Platform capabilities"
        className={cn('relative cursor-grab overflow-hidden select-none active:cursor-grabbing', reduced && 'cursor-auto')}
        style={{ touchAction: 'pan-y' }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') flags.current.hover = true
        }}
        onPointerLeave={() => (flags.current.hover = false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault()
            e.stopPropagation()
            drag.current.moved = false
          }
        }}
        onFocus={(e) => {
          flags.current.focus = true
          const card = (e.target as HTMLElement).closest<HTMLElement>('[data-card]')
          if (viewport.current) viewport.current.scrollLeft = 0
          if (card) {
            const i = Number(card.dataset.card)
            tween.current = { from: offset.current, to: cardLefts.current[i] ?? 0, start: performance.now() }
          }
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) flags.current.focus = false
        }}
      >
        <div ref={inner} className="flex w-max gap-5 px-5 py-4 will-change-transform md:px-8" style={{ gap: GAP }}>
          <div ref={setA} className="flex gap-5" style={{ gap: GAP }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} f={f} index={i} />
            ))}
          </div>
          <div className="flex gap-5" style={{ gap: GAP }} aria-hidden="true" inert>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} f={f} index={i} hidden />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex items-center gap-1.5" role="group" aria-label="Choose capability">
          {FEATURES.map((f, i) => (
            <button
              key={f.title}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${f.title}`}
              aria-current={i === active ? 'true' : undefined}
              className="grid h-6 place-items-center px-0.5"
            >
              <span className={cn('block h-1.5 rounded-full transition-all duration-500', i === active ? 'w-8 bg-primary' : 'w-3 bg-ink/20 hover:bg-ink/40')} />
            </button>
          ))}
          <span className="ml-3 font-mono text-xs text-muted-foreground" aria-live="polite">
            {String(active + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goTo(activeRef.current - 1)} className="grid size-10 place-items-center rounded-full border border-ink/20 hover:bg-ink hover:text-cream" aria-label="Previous capability">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" onClick={() => goTo(activeRef.current + 1)} className="grid size-10 place-items-center rounded-full border border-ink/20 hover:bg-ink hover:text-cream" aria-label="Next capability">
            <ChevronRight className="size-4" />
          </button>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={!playing}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-xs font-medium text-cream hover:bg-[#45263a]"
            >
              {playing ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
              {playing ? 'Pause motion' : 'Play motion'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

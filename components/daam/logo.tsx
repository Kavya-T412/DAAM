import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="#321B2A" strokeWidth="1.5" />
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#FF9292" strokeWidth="1.5" transform="rotate(-30 16 16)" />
      <circle cx="16" cy="16" r="5" fill="#FF467A" />
      <circle cx="27" cy="10" r="2.2" fill="#321B2A" />
    </svg>
  )
}

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5 rounded-full', className)} aria-label="DAAM home">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-45" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-2xl tracking-tight text-ink">DAAM</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Nexus trust layer</span>
      </span>
    </Link>
  )
}

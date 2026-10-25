import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BtnVariant = 'primary' | 'ink' | 'outline' | 'ghost' | 'danger' | 'soft'
type BtnSize = 'sm' | 'md' | 'lg'

export function btn(variant: BtnVariant = 'primary', size: BtnSize = 'md', className?: string) {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:size-4 [&_svg]:shrink-0',
    size === 'sm' && 'h-8 px-3.5 text-xs',
    size === 'md' && 'h-10 px-5 text-sm',
    size === 'lg' && 'h-12 px-7 text-[15px]',
    variant === 'primary' && 'bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(255,70,122,0.8)] hover:-translate-y-0.5 hover:bg-[#f23a6e]',
    variant === 'ink' && 'bg-ink text-cream hover:-translate-y-0.5 hover:bg-[#45263a]',
    variant === 'outline' && 'border border-ink/20 bg-cream/60 text-ink hover:border-ink/50 hover:bg-cream',
    variant === 'ghost' && 'text-ink hover:bg-ink/5',
    variant === 'danger' && 'bg-destructive text-cream hover:bg-[#9f342f]',
    variant === 'soft' && 'bg-accent text-ink hover:bg-secondary/50',
    className,
  )
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { variant?: BtnVariant; size?: BtnSize }) {
  return <button type={type} className={btn(variant, size, className)} {...props} />
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-3xl border border-border bg-card shadow-[0_1px_0_rgba(50,27,42,0.04),0_18px_40px_-28px_rgba(50,27,42,0.35)]', className)}
      {...props}
    />
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground', className)}>{children}</p>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 font-serif text-4xl leading-[1.05] text-ink text-balance md:text-5xl">{title}</h1>
        {description && <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

const control =
  'h-10 w-full rounded-xl border border-input bg-cream px-3 text-sm text-ink placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary/40 disabled:opacity-60'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(control, 'h-auto min-h-24 py-2.5 leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select className={cn(control, 'appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2374535C' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props}>
      {children}
    </select>
  )
}

export function Mono({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <span title={title} className={cn('font-mono text-[12px] tracking-tight', className)}>
      {children}
    </span>
  )
}

export function SimLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-dashed border-ink/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      Simulated
    </span>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 px-6 py-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

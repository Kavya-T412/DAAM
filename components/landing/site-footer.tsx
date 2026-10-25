import { Logo } from '@/components/daam/logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <Logo />
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          Hackathon prototype for PS 26125. Wallet connections, transactions, and on-chain references are simulated. Document hashing uses the browser’s Web Crypto API (SHA-256).
        </p>
      </div>
    </footer>
  )
}

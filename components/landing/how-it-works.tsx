import { Reveal } from './reveal'

const STEPS = [
  { title: 'Connect wallet', body: 'The wallet is the login credential. In this prototype a Demo Wallet simulates the signature.' },
  { title: 'Resolve DID', body: 'The address maps to a decentralized identifier holding role, department, and status.' },
  { title: 'Request access', body: 'The user names the asset, the action, and the purpose — every request is purpose-bound.' },
  { title: 'Evaluate policy', body: 'Identity state, role, purpose, asset state, custody, and time are checked together.' },
  { title: 'Verify asset passport', body: 'The asset’s NFT and metadata hash confirm which physical item is being acted on.' },
  { title: 'Record custody', body: 'Transfers append a record with sender, receiver, purpose, and approval — nothing is overwritten.' },
  { title: 'Verify audit history', body: 'Anyone authorized can re-hash a document or event and match it to the anchored reference.' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="hiw-title" className="scroll-mt-16 bg-ink py-24 text-cream md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-secondary">How it works</p>
          <h2 id="hiw-title" className="mt-3 font-serif text-5xl leading-[0.98] text-balance md:text-6xl">
            From a wallet signature to a <em className="text-secondary">verifiable record.</em>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-cream/70">
            Seven steps, each producing evidence. Authorization is never just “who are you” — it is who, why, on what, and in which state.
          </p>
        </div>
        <ol className="relative border-l border-cream/15 pl-8">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative pb-10 last:pb-0">
              <Reveal delay={i * 40}>
                <span className="absolute top-0 -left-[49px] grid size-8 place-items-center rounded-full border border-cream/25 bg-ink font-mono text-xs text-secondary">
                  {i + 1}
                </span>
                <h3 className="font-serif text-3xl leading-tight">{s.title}</h3>
                <p className="mt-2 max-w-lg leading-relaxed text-cream/70">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

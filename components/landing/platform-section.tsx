import { FeatureTrack } from './feature-track'

export function PlatformSection() {
  return (
    <section id="platform" aria-labelledby="platform-title" className="relative scroll-mt-16 md:h-[150vh]">
      <div className="flex flex-col justify-center py-16 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:py-6">
        <div className="mx-auto mb-6 flex w-full max-w-7xl flex-col gap-4 px-5 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">The platform · 8 capabilities</p>
            <h2 id="platform-title" className="mt-3 max-w-3xl font-serif text-5xl leading-[0.98] text-ink text-balance md:text-6xl">
              One trust layer, <em className="text-primary">eight moving parts.</em>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Drag, swipe, or use the controls. The exhibition pauses whenever you hover or focus a card.
          </p>
        </div>
        <FeatureTrack />
      </div>
    </section>
  )
}

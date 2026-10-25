import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { PlatformSection } from '@/components/landing/platform-section'
import { SecuritySection } from '@/components/landing/security-section'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteHeader } from '@/components/landing/site-header'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <PlatformSection />
        <HowItWorks />
        <SecuritySection />
      </main>
      <SiteFooter />
    </>
  )
}

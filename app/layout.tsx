import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { AppProviders } from '@/components/daam/app-providers'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const display = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'DAAM — Decentralized Identity & Digital Asset Governance',
  description:
    'A unified trust layer for decentralized identity, purpose-bound access governance, NFT asset passports, and verifiable chain of custody. Interactive hackathon prototype for PS 26125.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FEE7C8',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${display.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

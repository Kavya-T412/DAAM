'use client'

import type { ReactNode } from 'react'
import { DaamProvider } from '@/lib/daam/store'
import { UiProvider } from '@/lib/daam/ui'
import { GuidedDemo } from './guided-demo'
import { Toaster } from './toaster'
import { WalletModal } from './wallet-modal'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <DaamProvider>
      <UiProvider>
        {children}
        <WalletModal />
        <GuidedDemo />
        <Toaster />
      </UiProvider>
    </DaamProvider>
  )
}

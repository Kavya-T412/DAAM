'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface UiContextValue {
  walletOpen: boolean
  setWalletOpen: (open: boolean) => void
  demoActive: boolean
  demoStep: number
  startDemo: () => void
  stopDemo: () => void
  setDemoStep: (step: number) => void
}

const UiContext = createContext<UiContextValue | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [walletOpen, setWalletOpen] = useState(false)
  const [demoActive, setDemoActive] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  const value = useMemo<UiContextValue>(
    () => ({
      walletOpen,
      setWalletOpen,
      demoActive,
      demoStep,
      startDemo: () => {
        setDemoStep(0)
        setDemoActive(true)
      },
      stopDemo: () => setDemoActive(false),
      setDemoStep,
    }),
    [walletOpen, demoActive, demoStep],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi must be used within UiProvider')
  return ctx
}

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/app/app-shell'

export const metadata: Metadata = {
  title: 'Console — DAAM',
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}

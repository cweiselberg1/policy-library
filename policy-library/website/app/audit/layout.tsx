'use client'

import { RequireAuth } from '@/components/auth/RequireAuth'

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>
}

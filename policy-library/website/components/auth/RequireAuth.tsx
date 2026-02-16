'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function check() {
      const { data, error } = await getUser()
      if (error || !data?.user) {
        router.replace('/login')
        return
      }
      setAuthorized(true)
    }
    check()
  }, [router])

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-evergreen-950 via-dark-900 to-evergreen-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-copper-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-dark-300 text-lg">Verifying access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

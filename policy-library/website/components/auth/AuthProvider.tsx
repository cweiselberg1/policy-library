'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, getUserProfile, signOut } from '@/lib/supabase/auth'
import { loadOrgData, orgStorage } from '@/lib/supabase/org-storage'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  organizationId: string | null
  organizationName: string | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: sessionData } = await getSession()
        if (sessionData?.session?.user) {
          const authUser = sessionData.session.user
          setUser(authUser)

          // Fetch profile to get organization_id
          const { data: profile } = await getUserProfile(authUser.id)
          if (profile?.organization_id) {
            setOrganizationId(profile.organization_id)
            setOrganizationName(profile.organization ?? null)
            // Hydrate org data cache from Supabase
            await loadOrgData(profile.organization_id)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Logout error:', error)
        return
      }
      orgStorage.clear()
      setUser(null)
      setOrganizationId(null)
      setOrganizationName(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    organizationId,
    organizationName,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

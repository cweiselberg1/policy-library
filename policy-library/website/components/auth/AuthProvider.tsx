'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, getUser, signOut } from '@/lib/supabase/auth'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check initial session
    const checkAuth = async () => {
      try {
        const { data: sessionData } = await getSession()
        if (sessionData?.session?.user) {
          setUser(sessionData.session.user)
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
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
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

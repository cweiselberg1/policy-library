import { createClient } from './client'
import type { Database } from '@/types/database'

export type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, metadata?: {
  full_name?: string
  organization?: string
  role?: string
}) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  return { data, error }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  return { error }
}

/**
 * Get the current user session
 */
export async function getSession() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getSession()

  return { data, error }
}

/**
 * Get the current user
 */
export async function getUser() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()

  return { data, error }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<{ data: Profile | null, error: any }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single() as any

  return { data, error }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates as Database['public']['Tables']['profiles']['Update'])
    .eq('id', userId)
    .select()
    .single() as any

  return { data, error }
}

/**
 * Reset password for email
 */
export async function resetPassword(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  return { data, error }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { data, error }
}

/**
 * Verify if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await getSession()
  return !!data.session
}

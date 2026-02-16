'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orgName, setOrgName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.push('/login')
        return
      }
      setUser(data.session.user)
      setContactEmail(data.session.user.email || '')
      setChecking(false)
    }
    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug,
          primary_contact_email: contactEmail || user.email!,
        })
        .select('id')
        .single()

      if (orgError) {
        setError(orgError.message || 'Failed to create organization.')
        setLoading(false)
        return
      }

      // Link profile to organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: org.id, organization: orgName })
        .eq('id', user.id)

      if (profileError) {
        setError(profileError.message || 'Failed to link profile.')
        setLoading(false)
        return
      }

      // Redirect to dashboard (AuthProvider will pick up the org on next load)
      window.location.href = '/dashboard'
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-evergreen-50 via-pearl-50 to-copper-50 flex items-center justify-center">
        <p className="text-dark-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-evergreen-50 via-pearl-50 to-copper-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-pearl-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-evergreen-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-evergreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-dark-900">Set Up Your Organization</h1>
            <p className="text-dark-500 mt-2">Create your organization to get started with HIPAA compliance management.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-dark-700 mb-1">
                Organization Name
              </label>
              <input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 border border-pearl-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-copper-500 focus:border-copper-500 disabled:bg-pearl-50 disabled:text-dark-400"
                placeholder="Acme Healthcare"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-dark-700 mb-1">
                Primary Contact Email
              </label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 border border-pearl-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-copper-500 focus:border-copper-500 disabled:bg-pearl-50 disabled:text-dark-400"
                placeholder="admin@acmehealthcare.com"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !orgName.trim()}
              className="w-full px-4 py-2.5 bg-copper-600 text-white font-medium rounded-lg hover:bg-copper-700 disabled:bg-pearl-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Organization...' : 'Create Organization'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-dark-400 mt-6">
          Your data is protected with enterprise-grade encryption.
        </p>
      </div>
    </div>
  )
}

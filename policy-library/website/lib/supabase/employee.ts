import { createClient } from './client'
import { orgStorage } from './org-storage'
import type { Database, AssignmentStatus } from '@/types/database'

type Assignment = Database['public']['Tables']['employee_policy_assignments']['Row']
type PolicyBundle = Database['public']['Tables']['policy_bundles']['Row']

export interface EmployeeAssignment extends Assignment {
  policy_bundles: Pick<PolicyBundle, 'name' | 'slug' | 'description' | 'policy_ids' | 'is_required'> | null
}

export interface DashboardStats {
  total_assigned: number
  completed: number
  pending: number
  overdue: number
  completion_rate: number
}

export async function getEmployeeAssignments(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('employee_policy_assignments')
    .select(`
      *,
      policy_bundles (
        name,
        slug,
        description,
        policy_ids,
        is_required
      )
    `)
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })

  return { data: data as EmployeeAssignment[] | null, error }
}

export async function getAssignmentById(assignmentId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('employee_policy_assignments')
    .select(`
      *,
      policy_bundles (
        name,
        slug,
        description,
        policy_ids,
        is_required,
        target_roles,
        due_days
      )
    `)
    .eq('id', assignmentId)
    .single()

  return { data: data as EmployeeAssignment | null, error }
}

export async function getAssignmentByBundleId(userId: string, bundleId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('employee_policy_assignments')
    .select(`
      *,
      policy_bundles (
        name,
        slug,
        description,
        policy_ids,
        is_required,
        target_roles,
        due_days
      )
    `)
    .eq('user_id', userId)
    .eq('policy_bundle_id', bundleId)
    .single()

  return { data: data as EmployeeAssignment | null, error }
}

export function computeDashboardStats(assignments: EmployeeAssignment[]): DashboardStats {
  const total_assigned = assignments.length
  const completed = assignments.filter(a => a.status === 'completed').length
  const overdue = assignments.filter(a => a.is_overdue && a.status !== 'completed').length
  const pending = total_assigned - completed
  const completion_rate = total_assigned > 0 ? completed / total_assigned : 0

  return { total_assigned, completed, pending, overdue, completion_rate }
}

export async function submitAttestation(assignmentId: string, signature: string) {
  const supabase = createClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('employee_policy_assignments')
    .update({
      status: 'completed' as AssignmentStatus,
      completed_at: now,
      acknowledged_at: now,
      completion_percentage: 100,
      notes: `Electronically signed by: ${signature}`,
    })
    .eq('id', assignmentId)
    .select()
    .single()

  if (error) {
    return { data, error }
  }

  // Keep training module progress aligned with policy attestations.
  try {
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id

    if (userId) {
      const { data: assignments } = await supabase
        .from('employee_policy_assignments')
        .select('status')
        .eq('user_id', userId)

      const totalAssignments = assignments?.length ?? 0
      const completedAssignments = assignments?.filter(
        (a) => a.status === 'completed' || a.status === 'waived'
      ).length ?? 0
      const allPoliciesCompleted = totalAssignments > 0 && completedAssignments === totalAssignments

      const { data: existingProgress } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      const hipaaComplete = existingProgress?.hipaa_101_complete ?? false
      const cybersecurityComplete = existingProgress?.cybersecurity_complete ?? false

      const completedModules = [
        allPoliciesCompleted,
        hipaaComplete,
        cybersecurityComplete,
      ].filter(Boolean).length

      const overallPercentage = completedModules === 3 ? 100 : completedModules * 33
      const currentStep = !allPoliciesCompleted
        ? 'policies'
        : !hipaaComplete
          ? 'hipaa-101'
          : !cybersecurityComplete
            ? 'cybersecurity'
            : 'complete'

      const progressPayload = {
        user_id: userId,
        policies_completed: completedAssignments,
        hipaa_101_complete: hipaaComplete,
        cybersecurity_complete: cybersecurityComplete,
        overall_percentage: overallPercentage,
        current_step: currentStep,
      }

      if (existingProgress) {
        await supabase
          .from('training_progress')
          .update(progressPayload)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('training_progress')
          .insert(progressPayload)
      }

      if (allPoliciesCompleted) {
        await supabase
          .from('module_completions')
          .upsert(
            {
              user_id: userId,
              module_name: 'policies',
              quiz_score: null,
              completed_at: now,
            },
            { onConflict: 'user_id,module_name' }
          )
      }
    }
  } catch (syncError) {
    console.warn('Attestation saved, but training progress sync failed:', syncError)
  }

  return { data, error }
}

export async function submitIncident(incidentData: {
  title: string
  description: string
  category: string
  severity: string
  location?: string
  affected_systems?: string[]
  affected_individuals_count?: number | null
}) {
  const supabase = createClient()

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) {
    return { data: null, error: new Error('Authentication required') }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, full_name, email')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.organization_id) {
    return { data: null, error: profileError || new Error('Unable to resolve organization') }
  }

  const insertPayload = {
    organization_id: profile.organization_id,
    reported_by: user.id,
    reporter_name: profile.full_name || null,
    reporter_email: profile.email || user.email || null,
    is_anonymous: false,
    title: incidentData.title,
    description: incidentData.description,
    category: incidentData.category,
    severity: incidentData.severity,
    location: incidentData.location || null,
    affected_systems: incidentData.affected_systems || [],
    affected_individuals_count: incidentData.affected_individuals_count ?? null,
  }

  type IncidentInsertResult = {
    id: string
    title: string
    description: string
    category: string
    severity: string
    status: string
    is_anonymous: boolean
    location: string | null
    affected_systems: string[] | null
    affected_individuals_count: number | null
    created_at: string
  }

  type DynamicTableClient = {
    from: (table: string) => {
      insert: (values: Record<string, unknown>) => {
        select: () => {
          single: () => Promise<{
            data: IncidentInsertResult | null
            error: { code?: string; message?: string } | null
          }>
        }
      }
    }
  }

  const dynamicClient = supabase as unknown as DynamicTableClient

  const { data, error } = await dynamicClient
    .from('incidents')
    .insert(insertPayload as Record<string, unknown>)
    .select()
    .single()

  const incidentsTableMissing =
    !!error &&
    (error.code === 'PGRST205' ||
      error.message?.includes("Could not find the table 'public.incidents'"))

  const incidentRecord =
    data ??
    (incidentsTableMissing
      ? {
          id: `fallback-${Date.now()}`,
          title: incidentData.title,
          description: incidentData.description,
          category: incidentData.category,
          severity: incidentData.severity,
          status: 'open',
          is_anonymous: false,
          location: incidentData.location || null,
          affected_systems: incidentData.affected_systems || [],
          affected_individuals_count: incidentData.affected_individuals_count ?? null,
          created_at: new Date().toISOString(),
        }
      : null)

  if (error && !incidentsTableMissing) {
    return { data: null, error }
  }

  const auditEventType = incidentsTableMissing
    ? 'incident_report_fallback'
    : 'incident_report'

  const { error: auditError } = await supabase.from('audit_log').insert({
    event_type: auditEventType,
    user_id: user.id,
    details: {
      incident_id: incidentRecord?.id || null,
      title: incidentData.title,
      category: incidentData.category,
      severity: incidentData.severity,
      affected_individuals_count: incidentData.affected_individuals_count ?? null,
      fallback_mode: incidentsTableMissing,
    } as unknown as Database['public']['Tables']['audit_log']['Insert']['details'],
  })
  if (auditError) {
    return { data: null, error: auditError }
  }

  // Keep org cache in sync for pages currently reading `hipaa-incidents`.
  try {
    const raw = orgStorage.getItem('hipaa-incidents')
    const existing = JSON.parse(raw || '[]')
    const nextIncident = {
      id: incidentRecord?.id || `fallback-${Date.now()}`,
      title: incidentRecord?.title || incidentData.title,
      description: incidentRecord?.description || incidentData.description,
      category: incidentRecord?.category || incidentData.category,
      severity: incidentRecord?.severity || incidentData.severity,
      status: incidentRecord?.status || 'open',
      is_anonymous: incidentRecord?.is_anonymous ?? false,
      created_at: incidentRecord?.created_at || new Date().toISOString(),
      location: incidentRecord?.location ?? incidentData.location ?? null,
      affected_systems: incidentRecord?.affected_systems ?? incidentData.affected_systems ?? [],
      affected_individuals_count:
        incidentRecord?.affected_individuals_count ?? incidentData.affected_individuals_count ?? null,
    }
    orgStorage.setItem('hipaa-incidents', JSON.stringify([nextIncident, ...existing]))
  } catch (cacheError) {
    console.warn('Incident saved, but org cache sync failed:', cacheError)
  }

  return { data: incidentRecord, error: null }
}

export async function getEmployeeProfile(userId: string) {
  const supabase = createClient()

  const [profileResult, employeeResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('employees').select('*').eq('user_id', userId).single(),
  ])

  return {
    profile: profileResult.data,
    employee: employeeResult.data,
    error: profileResult.error || employeeResult.error,
  }
}

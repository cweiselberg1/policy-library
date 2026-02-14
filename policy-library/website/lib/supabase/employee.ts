import { createClient } from './client'
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
  const userId = userData?.user?.id || null

  const { data, error } = await supabase
    .from('audit_log')
    .insert({
      event_type: 'incident_report',
      user_id: userId,
      details: incidentData as unknown as Database['public']['Tables']['audit_log']['Insert']['details'],
    })
    .select()
    .single()

  return { data, error }
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

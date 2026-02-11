/**
 * Employee Management TypeScript Interfaces
 * Types for organizations, departments, employees, roles, and teams
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export interface Organization {
  id: string
  name: string
  slug: string | null
  subscription_tier: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  logo_url: string | null
  website: string | null
  address: Json | null
  contact_email: string | null
  phone: string | null
  metadata: Json | null
  created_at: string
  updated_at: string
}

export interface OrganizationInsert {
  id?: string
  name: string
  slug?: string | null
  subscription_tier?: 'free' | 'pro' | 'enterprise'
  status?: 'active' | 'suspended' | 'cancelled'
  logo_url?: string | null
  website?: string | null
  address?: Json | null
  contact_email?: string | null
  phone?: string | null
  metadata?: Json | null
  created_at?: string
  updated_at?: string
}

export interface OrganizationUpdate {
  id?: string
  name?: string
  slug?: string | null
  subscription_tier?: 'free' | 'pro' | 'enterprise'
  status?: 'active' | 'suspended' | 'cancelled'
  logo_url?: string | null
  website?: string | null
  address?: Json | null
  contact_email?: string | null
  phone?: string | null
  metadata?: Json | null
  created_at?: string
  updated_at?: string
}

export interface OrganizationSettings {
  id: string
  organization_id: string
  max_departments: number
  max_employees: number
  enable_hierarchy: boolean
  enable_teams: boolean
  enable_permissions: boolean
  enable_audit: boolean
  custom_fields: Json | null
  audit_retention_days: number
  created_at: string
  updated_at: string
}

// ============================================================================
// DEPARTMENT TYPES
// ============================================================================

export interface Department {
  id: string
  organization_id: string
  name: string
  description: string | null
  parent_id: string | null
  manager_id: string | null
  budget: number | null
  status: 'active' | 'inactive'
  metadata: Json | null
  created_at: string
  updated_at: string
}

export interface DepartmentInsert {
  id?: string
  organization_id: string
  name: string
  description?: string | null
  parent_id?: string | null
  manager_id?: string | null
  budget?: number | null
  status?: 'active' | 'inactive'
  metadata?: Json | null
  created_at?: string
  updated_at?: string
}

export interface DepartmentUpdate {
  id?: string
  organization_id?: string
  name?: string
  description?: string | null
  parent_id?: string | null
  manager_id?: string | null
  budget?: number | null
  status?: 'active' | 'inactive'
  metadata?: Json | null
  created_at?: string
  updated_at?: string
}

export interface DepartmentNode extends Department {
  children?: DepartmentNode[]
  depth?: number
}

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export interface Employee {
  id: string
  organization_id: string
  department_id: string
  manager_id: string | null
  employee_id: string
  position_title: string
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'temporary'
  start_date: string
  end_date: string | null
  salary_grade: string | null
  location: string | null
  phone: string | null
  mobile_phone: string | null
  emergency_contact: Json | null
  skills: string[]
  custom_fields: Json | null
  created_at: string
  updated_at: string
}

export interface EmployeeInsert {
  id: string
  organization_id: string
  department_id: string
  manager_id?: string | null
  employee_id: string
  position_title: string
  employment_status?: 'active' | 'inactive' | 'on_leave' | 'terminated'
  employment_type?: 'full_time' | 'part_time' | 'contractor' | 'temporary'
  start_date: string
  end_date?: string | null
  salary_grade?: string | null
  location?: string | null
  phone?: string | null
  mobile_phone?: string | null
  emergency_contact?: Json | null
  skills?: string[]
  custom_fields?: Json | null
  created_at?: string
  updated_at?: string
}

export interface EmployeeUpdate {
  id?: string
  organization_id?: string
  department_id?: string
  manager_id?: string | null
  employee_id?: string
  position_title?: string
  employment_status?: 'active' | 'inactive' | 'on_leave' | 'terminated'
  employment_type?: 'full_time' | 'part_time' | 'contractor' | 'temporary'
  start_date?: string
  end_date?: string | null
  salary_grade?: string | null
  location?: string | null
  phone?: string | null
  mobile_phone?: string | null
  emergency_contact?: Json | null
  skills?: string[]
  custom_fields?: Json | null
  created_at?: string
  updated_at?: string
}

export interface EmployeeWithDepartment extends Employee {
  department?: Department
  manager?: Employee | null
}

export interface EmployeeWithTeams extends EmployeeWithDepartment {
  teams?: TeamMember[]
  roles?: Role[]
}

// ============================================================================
// ROLE TYPES
// ============================================================================

export interface Role {
  id: string
  organization_id: string
  name: string
  description: string | null
  permissions: string[]
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface RoleInsert {
  id?: string
  organization_id: string
  name: string
  description?: string | null
  permissions?: string[]
  is_system?: boolean
  created_at?: string
  updated_at?: string
}

export interface RoleUpdate {
  id?: string
  organization_id?: string
  name?: string
  description?: string | null
  permissions?: string[]
  is_system?: boolean
  created_at?: string
  updated_at?: string
}

// ============================================================================
// EMPLOYEE ROLE TYPES
// ============================================================================

export interface EmployeeRole {
  id: string
  employee_id: string
  role_id: string
  granted_by: string | null
  granted_at: string
  expires_at: string | null
  created_at: string
}

export interface EmployeeRoleInsert {
  id?: string
  employee_id: string
  role_id: string
  granted_by?: string | null
  granted_at?: string
  expires_at?: string | null
  created_at?: string
}

export interface EmployeeRoleUpdate {
  id?: string
  employee_id?: string
  role_id?: string
  granted_by?: string | null
  granted_at?: string
  expires_at?: string | null
  created_at?: string
}

export interface EmployeeRoleWithRole extends EmployeeRole {
  role?: Role
}

// ============================================================================
// EMPLOYEE PERMISSION TYPES
// ============================================================================

export interface EmployeePermission {
  id: string
  employee_id: string
  resource: string
  action: string
  granted_by: string | null
  granted_at: string
  expires_at: string | null
  created_at: string
}

export interface EmployeePermissionInsert {
  id?: string
  employee_id: string
  resource: string
  action: string
  granted_by?: string | null
  granted_at?: string
  expires_at?: string | null
  created_at?: string
}

export interface EmployeePermissionUpdate {
  id?: string
  employee_id?: string
  resource?: string
  action?: string
  granted_by?: string | null
  granted_at?: string
  expires_at?: string | null
  created_at?: string
}

// ============================================================================
// TEAM TYPES
// ============================================================================

export interface TeamMember {
  id: string
  organization_id: string
  name: string
  description: string | null
  lead_id: string | null
  employee_count: number
  created_at: string
  updated_at: string
}

export interface TeamMemberInsert {
  id?: string
  organization_id: string
  name: string
  description?: string | null
  lead_id?: string | null
  employee_count?: number
  created_at?: string
  updated_at?: string
}

export interface TeamMemberUpdate {
  id?: string
  organization_id?: string
  name?: string
  description?: string | null
  lead_id?: string | null
  employee_count?: number
  created_at?: string
  updated_at?: string
}

export interface TeamMemberWithEmployees extends TeamMember {
  employees?: Employee[]
  lead?: Employee | null
}

// ============================================================================
// TEAM ASSIGNMENT TYPES
// ============================================================================

export interface TeamAssignment {
  id: string
  team_id: string
  employee_id: string
  role_in_team: string | null
  assigned_at: string
}

export interface TeamAssignmentInsert {
  id?: string
  team_id: string
  employee_id: string
  role_in_team?: string | null
  assigned_at?: string
}

export interface TeamAssignmentUpdate {
  id?: string
  team_id?: string
  employee_id?: string
  role_in_team?: string | null
  assigned_at?: string
}

// ============================================================================
// AUDIT EVENT TYPES
// ============================================================================

export interface AuditEvent {
  id: string
  organization_id: string
  employee_id: string | null
  action: string
  resource_type: string
  resource_id: string
  old_values: Json | null
  new_values: Json | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AuditEventInsert {
  id?: string
  organization_id: string
  employee_id?: string | null
  action: string
  resource_type: string
  resource_id: string
  old_values?: Json | null
  new_values?: Json | null
  ip_address?: string | null
  user_agent?: string | null
  created_at?: string
}

// ============================================================================
// VIEW/DTO TYPES
// ============================================================================

export interface EmployeeDirectory {
  organization_id: string
  employees: EmployeeWithTeams[]
  departments: DepartmentNode[]
  total_count: number
}

export interface DepartmentWithMembers extends Department {
  members: Employee[]
  child_departments: DepartmentWithMembers[]
  manager?: Employee | null
}

export interface EmployeePermissionSet {
  employee_id: string
  roles: Role[]
  direct_permissions: EmployeePermission[]
  all_permissions: Set<string>
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateEmployeeRequest {
  organization_id: string
  department_id: string
  manager_id?: string | null
  employee_id: string
  position_title: string
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'temporary'
  start_date: string
  end_date?: string | null
  phone?: string | null
  mobile_phone?: string | null
  location?: string | null
  skills?: string[]
  custom_fields?: Json | null
}

export interface UpdateEmployeeRequest {
  department_id?: string
  manager_id?: string | null
  position_title?: string
  employment_status?: 'active' | 'inactive' | 'on_leave' | 'terminated'
  employment_type?: 'full_time' | 'part_time' | 'contractor' | 'temporary'
  end_date?: string | null
  phone?: string | null
  mobile_phone?: string | null
  location?: string | null
  skills?: string[]
  custom_fields?: Json | null
}

export interface CreateDepartmentRequest {
  organization_id: string
  name: string
  description?: string | null
  parent_id?: string | null
  manager_id?: string | null
  budget?: number | null
}

export interface CreateRoleRequest {
  organization_id: string
  name: string
  description?: string | null
  permissions?: string[]
}

export interface AssignRoleRequest {
  employee_id: string
  role_id: string
  expires_at?: string | null
}

export interface GrantPermissionRequest {
  employee_id: string
  resource: string
  action: string
  expires_at?: string | null
}

export interface CreateTeamRequest {
  organization_id: string
  name: string
  description?: string | null
  lead_id?: string | null
}

export interface AddTeamMemberRequest {
  team_id: string
  employee_id: string
  role_in_team?: string | null
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'
export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'temporary'
export type SubscriptionTier = 'free' | 'pro' | 'enterprise'
export type DepartmentStatus = 'active' | 'inactive'
export type OrganizationStatus = 'active' | 'suspended' | 'cancelled'

export interface PagedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
}

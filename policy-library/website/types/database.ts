export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types matching the database
export type UserRole = 'admin' | 'privacy_officer' | 'compliance_manager' | 'department_manager' | 'employee'
export type DepartmentStatus = 'active' | 'inactive' | 'archived'
export type AssignmentStatus = 'assigned' | 'acknowledged' | 'completed' | 'overdue' | 'waived'
export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'
export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'temporary'
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          organization: string | null
          organization_id: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          organization?: string | null
          organization_id?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          organization?: string | null
          organization_id?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          primary_contact_email: string
          primary_contact_name: string | null
          legal_entity_name: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          status: 'active' | 'suspended' | 'cancelled'
          phone: string | null
          website: string | null
          address: Json
          max_users_allowed: number
          enable_sso: boolean
          sso_domain: string | null
          metadata: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          primary_contact_email: string
          primary_contact_name?: string | null
          legal_entity_name?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          status?: 'active' | 'suspended' | 'cancelled'
          phone?: string | null
          website?: string | null
          address?: Json
          max_users_allowed?: number
          enable_sso?: boolean
          sso_domain?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          primary_contact_email?: string
          primary_contact_name?: string | null
          legal_entity_name?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          status?: 'active' | 'suspended' | 'cancelled'
          phone?: string | null
          website?: string | null
          address?: Json
          max_users_allowed?: number
          enable_sso?: boolean
          sso_domain?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          organization_id: string
          parent_id: string | null
          name: string
          description: string | null
          code: string
          path: string
          path_depth: number
          manager_id: string | null
          budget: number | null
          policy_officer_user_id: string | null
          status: DepartmentStatus
          metadata: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          parent_id?: string | null
          name: string
          description?: string | null
          code: string
          path?: string
          path_depth?: number
          manager_id?: string | null
          budget?: number | null
          policy_officer_user_id?: string | null
          status?: DepartmentStatus
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          parent_id?: string | null
          name?: string
          description?: string | null
          code?: string
          path?: string
          path_depth?: number
          manager_id?: string | null
          budget?: number | null
          policy_officer_user_id?: string | null
          status?: DepartmentStatus
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'departments_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'departments_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          }
        ]
      }
      employees: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          department_id: string | null
          role: UserRole
          employee_id: string | null
          position_title: string | null
          employment_status: EmploymentStatus
          employment_type: EmploymentType
          start_date: string | null
          end_date: string | null
          phone: string | null
          mobile_phone: string | null
          location: string | null
          manager_id: string | null
          emergency_contact: Json | null
          skills: string[]
          metadata: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          department_id?: string | null
          role?: UserRole
          employee_id?: string | null
          position_title?: string | null
          employment_status?: EmploymentStatus
          employment_type?: EmploymentType
          start_date?: string | null
          end_date?: string | null
          phone?: string | null
          mobile_phone?: string | null
          location?: string | null
          manager_id?: string | null
          emergency_contact?: Json | null
          skills?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          department_id?: string | null
          role?: UserRole
          employee_id?: string | null
          position_title?: string | null
          employment_status?: EmploymentStatus
          employment_type?: EmploymentType
          start_date?: string | null
          end_date?: string | null
          phone?: string | null
          mobile_phone?: string | null
          location?: string | null
          manager_id?: string | null
          emergency_contact?: Json | null
          skills?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'employees_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'employees_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          }
        ]
      }
      employee_invitations: {
        Row: {
          id: string
          organization_id: string
          department_id: string | null
          email: string
          position_title: string | null
          employment_type: EmploymentType
          role: UserRole
          invited_by: string
          invited_at: string
          accepted_at: string | null
          expires_at: string
          status: InvitationStatus
          token: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          department_id?: string | null
          email: string
          position_title?: string | null
          employment_type?: EmploymentType
          role?: UserRole
          invited_by: string
          invited_at?: string
          accepted_at?: string | null
          expires_at?: string
          status?: InvitationStatus
          token?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          department_id?: string | null
          email?: string
          position_title?: string | null
          employment_type?: EmploymentType
          role?: UserRole
          invited_by?: string
          invited_at?: string
          accepted_at?: string | null
          expires_at?: string
          status?: InvitationStatus
          token?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'employee_invitations_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      policy_bundles: {
        Row: {
          id: string
          organization_id: string
          name: string
          slug: string
          description: string | null
          target_roles: UserRole[]
          target_departments: string[] | null
          policy_ids: string[]
          is_default: boolean
          is_required: boolean
          due_days: number
          metadata: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          slug: string
          description?: string | null
          target_roles?: UserRole[]
          target_departments?: string[] | null
          policy_ids?: string[]
          is_default?: boolean
          is_required?: boolean
          due_days?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          slug?: string
          description?: string | null
          target_roles?: UserRole[]
          target_departments?: string[] | null
          policy_ids?: string[]
          is_default?: boolean
          is_required?: boolean
          due_days?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'policy_bundles_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      department_policy_requirements: {
        Row: {
          id: string
          department_id: string
          policy_bundle_id: string
          due_days: number | null
          enforcement_level: 'required' | 'recommended' | 'optional'
          additional_requirements: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          department_id: string
          policy_bundle_id: string
          due_days?: number | null
          enforcement_level?: 'required' | 'recommended' | 'optional'
          additional_requirements?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          department_id?: string
          policy_bundle_id?: string
          due_days?: number | null
          enforcement_level?: 'required' | 'recommended' | 'optional'
          additional_requirements?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'department_policy_requirements_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'department_policy_requirements_policy_bundle_id_fkey'
            columns: ['policy_bundle_id']
            isOneToOne: false
            referencedRelation: 'policy_bundles'
            referencedColumns: ['id']
          }
        ]
      }
      employee_policy_assignments: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          department_id: string
          policy_bundle_id: string
          status: AssignmentStatus
          assigned_at: string
          due_at: string
          acknowledged_at: string | null
          completed_at: string | null
          completion_percentage: number
          is_overdue: boolean
          reassigned_count: number
          last_reassigned_at: string | null
          notes: string | null
          waiver_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          department_id: string
          policy_bundle_id: string
          status?: AssignmentStatus
          assigned_at?: string
          due_at?: string
          acknowledged_at?: string | null
          completed_at?: string | null
          completion_percentage?: number
          reassigned_count?: number
          last_reassigned_at?: string | null
          notes?: string | null
          waiver_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          department_id?: string
          policy_bundle_id?: string
          status?: AssignmentStatus
          assigned_at?: string
          due_at?: string
          acknowledged_at?: string | null
          completed_at?: string | null
          completion_percentage?: number
          reassigned_count?: number
          last_reassigned_at?: string | null
          notes?: string | null
          waiver_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'employee_policy_assignments_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'employee_policy_assignments_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'employee_policy_assignments_policy_bundle_id_fkey'
            columns: ['policy_bundle_id']
            isOneToOne: false
            referencedRelation: 'policy_bundles'
            referencedColumns: ['id']
          }
        ]
      }
      course_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          completed_lessons: string[]
          progress_percentage: number
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          completed_lessons?: string[]
          progress_percentage?: number
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          completed_lessons?: string[]
          progress_percentage?: number
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          certificate_url: string
          issued_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          certificate_url: string
          issued_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          certificate_url?: string
          issued_at?: string
        }
        Relationships: []
      }
      remediation_plans: {
        Row: {
          id: string
          cfr_citation: string
          title: string
          gap_description: string
          policy_dependencies: string[]
          regulatory_requirements: Json
          status: 'pending' | 'in_progress' | 'closeable' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'critical'
          auto_populated_fields: Json | null
          last_auto_update: string | null
          estimated_completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cfr_citation: string
          title: string
          gap_description: string
          policy_dependencies?: string[]
          regulatory_requirements?: Json
          status?: 'pending' | 'in_progress' | 'closeable' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          auto_populated_fields?: Json | null
          last_auto_update?: string | null
          estimated_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cfr_citation?: string
          title?: string
          gap_description?: string
          policy_dependencies?: string[]
          regulatory_requirements?: Json
          status?: 'pending' | 'in_progress' | 'closeable' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          auto_populated_fields?: Json | null
          last_auto_update?: string | null
          estimated_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      policy_publications: {
        Row: {
          id: string
          policy_id: string
          published_by: string
          published_at: string
          policy_metadata: Json
        }
        Insert: {
          id?: string
          policy_id: string
          published_by: string
          published_at?: string
          policy_metadata?: Json
        }
        Update: {
          id?: string
          policy_id?: string
          published_by?: string
          published_at?: string
          policy_metadata?: Json
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          details?: Json
          created_at?: string
        }
        Relationships: []
      }
      org_data: {
        Row: {
          id: string
          organization_id: string
          data_key: string
          data_value: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          data_key: string
          data_value?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          data_key?: string
          data_value?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'org_data_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role_type: UserRole
      department_status_type: DepartmentStatus
      assignment_status_type: AssignmentStatus
      employment_status_type: EmploymentStatus
      employment_type: EmploymentType
      invitation_status_type: InvitationStatus
    }
  }
}

/**
 * Training Portal TypeScript Interfaces
 */

export interface TrainingProgress {
  id: string
  user_id: string
  module_id: string
  started_at: string
  completed_at: string | null
  completion_percentage: number
  current_step: number
  last_accessed: string
  created_at: string
  updated_at: string
}

export interface PolicyAcknowledgment {
  id: string
  user_id: string
  policy_id: string
  acknowledged_at: string
  acknowledged_version: string
  ip_address: string | null
  created_at: string
  updated_at: string
}

export interface ModuleCompletion {
  id: string
  user_id: string
  module_id: string
  completed_at: string
  score: number | null
  certificate_url: string | null
  validity_start: string
  validity_end: string | null
  created_at: string
  updated_at: string
}

export interface TrainingSession {
  id: string
  user_id: string
  session_token: string
  module_id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  device_info: Record<string, unknown> | null
  ip_address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrainingModule {
  id: string
  title: string
  description: string
  slug: string
  category: 'hipaa' | 'cybersecurity' | 'compliance' | 'policy'
  order: number
  total_steps: number
  estimated_duration_minutes: number
  is_required: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface UserTrainingStatus {
  user_id: string
  total_modules: number
  completed_modules: number
  in_progress_modules: number
  completion_percentage: number
  last_training_date: string | null
  next_renewal_date: string | null
}

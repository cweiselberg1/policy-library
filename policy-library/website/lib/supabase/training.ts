import { createClient } from './client'

export interface TrainingProgress {
  id?: string
  user_id: string
  policies_completed: number
  hipaa_101_complete: boolean
  cybersecurity_complete: boolean
  overall_percentage: number
  current_step: string | null
}

export interface ModuleCompletion {
  id?: string
  user_id: string
  module_name: string
  completed_at: string
  quiz_score: number | null
}

export async function getTrainingProgress(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('training_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data: data as TrainingProgress | null, error }
}

export async function upsertTrainingProgress(progress: {
  user_id: string
  policies_completed?: number
  hipaa_101_complete?: boolean
  cybersecurity_complete?: boolean
  overall_percentage?: number
  current_step?: string
}) {
  const supabase = createClient()

  // Try to get existing record
  const { data: existing } = await supabase
    .from('training_progress')
    .select('id')
    .eq('user_id', progress.user_id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('training_progress')
      .update(progress)
      .eq('user_id', progress.user_id)
      .select()
      .single()
    return { data, error }
  } else {
    const { data, error } = await supabase
      .from('training_progress')
      .insert(progress)
      .select()
      .single()
    return { data, error }
  }
}

export async function getModuleCompletions(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('module_completions')
    .select('*')
    .eq('user_id', userId)

  return { data: data as ModuleCompletion[] | null, error }
}

export async function completeModule(userId: string, moduleName: string, quizScore?: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('module_completions')
    .upsert({
      user_id: userId,
      module_name: moduleName,
      quiz_score: quizScore ?? null,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,module_name' })
    .select()
    .single()

  return { data, error }
}

// For PO dashboard: get all employees' training progress
export async function getAllTrainingProgress() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('training_progress')
    .select('*')
    .order('updated_at', { ascending: false })

  return { data: data as TrainingProgress[] | null, error }
}

// For PO dashboard: get all module completions
export async function getAllModuleCompletions() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('module_completions')
    .select('*')
    .order('completed_at', { ascending: false })

  return { data: data as ModuleCompletion[] | null, error }
}

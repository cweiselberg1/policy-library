import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Progress calculation logic:
// - All policies (10 total) = 33%
// - HIPAA 101 module = 66%
// - Cybersecurity module = 100%

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { module_id } = body

    if (!module_id || typeof module_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected module_id (string)' },
        { status: 400 }
      )
    }

    // Validate module_id
    const validModules = ['hipaa-101', 'cybersecurity']
    if (!validModules.includes(module_id)) {
      return NextResponse.json(
        { error: `Invalid module_id. Must be one of: ${validModules.join(', ')}` },
        { status: 400 }
      )
    }

    // Get current progress
    const { data: progress } = await supabase
      .from('course_progress')
      .select('completed_lessons')
      .eq('user_id', user.id)
      .eq('course_id', 'hipaa-training')
      .single() as any

    const completedLessons = progress?.completed_lessons || []

    // Add module if not already completed
    if (!completedLessons.includes(module_id)) {
      completedLessons.push(module_id)
    }

    // Calculate progress percentage
    let progressPercentage = 0

    // Count completed policies (each policy is 3.3% of total, 10 policies = 33%)
    const policyCount = completedLessons.filter((l: string) => l.startsWith('policy-')).length
    progressPercentage += Math.round((policyCount / 10) * 33)

    // Add module completion percentages
    if (completedLessons.includes('hipaa-101')) {
      progressPercentage = Math.max(progressPercentage, 66)
    }
    if (completedLessons.includes('cybersecurity')) {
      progressPercentage = 100
    }

    // Update or insert progress
    if (progress) {
      const { error } = await supabase
        .from('course_progress')
        .update({
          completed_lessons: completedLessons,
          progress_percentage: progressPercentage,
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('course_id', 'hipaa-training') as any

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
    } else {
      const { error } = await supabase
        .from('course_progress')
        .insert({
          user_id: user.id,
          course_id: 'hipaa-training',
          completed_lessons: completedLessons,
          progress_percentage: progressPercentage,
          started_at: new Date().toISOString(),
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null
        })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      module_id,
      completed_lessons: completedLessons,
      progress_percentage: progressPercentage,
      course_completed: progressPercentage === 100
    })
  } catch (error) {
    console.error('Error marking module complete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

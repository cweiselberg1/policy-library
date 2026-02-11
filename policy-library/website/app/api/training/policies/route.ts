import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Mock policy data
const MOCK_POLICIES = [
  { id: 'policy-1', title: 'Privacy Policy', category: 'Privacy' },
  { id: 'policy-2', title: 'Security Policy', category: 'Security' },
  { id: 'policy-3', title: 'Data Breach Response', category: 'Incident Response' },
  { id: 'policy-4', title: 'Access Control Policy', category: 'Security' },
  { id: 'policy-5', title: 'Encryption Standards', category: 'Security' },
  { id: 'policy-6', title: 'Patient Rights Policy', category: 'Privacy' },
  { id: 'policy-7', title: 'Business Associate Agreement', category: 'Compliance' },
  { id: 'policy-8', title: 'Risk Assessment Policy', category: 'Risk Management' },
  { id: 'policy-9', title: 'Audit Controls', category: 'Compliance' },
  { id: 'policy-10', title: 'Training and Awareness', category: 'Training' }
]

export async function GET() {
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

    // Fetch user's acknowledged policies from course_progress
    const { data: progress } = await supabase
      .from('course_progress')
      .select('completed_lessons')
      .eq('user_id', user.id)
      .eq('course_id', 'hipaa-training')
      .single() as any

    const acknowledgedPolicies = progress?.completed_lessons?.filter(
      (lesson: string) => lesson.startsWith('policy-')
    ) || []

    return NextResponse.json({
      policies: MOCK_POLICIES,
      acknowledged: acknowledgedPolicies
    })
  } catch (error) {
    console.error('Error fetching policies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { policy_id } = body

    if (!policy_id || typeof policy_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected policy_id (string)' },
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

    // Add policy if not already acknowledged
    if (!completedLessons.includes(policy_id)) {
      completedLessons.push(policy_id)
    }

    // Calculate new progress percentage
    const policyCount = completedLessons.filter((l: string) => l.startsWith('policy-')).length
    const progressPercentage = Math.round((policyCount / 10) * 33) // Policies = 33% of total

    // Update or insert progress
    if (progress) {
      const { error } = await supabase
        .from('course_progress')
        .update({
          completed_lessons: completedLessons,
          progress_percentage: progressPercentage,
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
          started_at: new Date().toISOString()
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
      acknowledged: completedLessons.filter((l: string) => l.startsWith('policy-')),
      progress_percentage: progressPercentage
    })
  } catch (error) {
    console.error('Error acknowledging policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
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
    const { policy_id } = body

    if (!policy_id || typeof policy_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected policy_id (string)' },
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

    if (!progress) {
      return NextResponse.json(
        { error: 'No progress record found' },
        { status: 404 }
      )
    }

    // Remove policy from completed lessons
    const completedLessons = progress.completed_lessons.filter(
      (lesson: string) => lesson !== policy_id
    )

    // Calculate new progress percentage
    const policyCount = completedLessons.filter((l: string) => l.startsWith('policy-')).length
    const progressPercentage = Math.round((policyCount / 10) * 33)

    // Update progress
    const { error } = await supabase
      .from('course_progress')
      .update({
        completed_lessons: completedLessons,
        progress_percentage: progressPercentage,
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

    return NextResponse.json({
      success: true,
      acknowledged: completedLessons.filter((l: string) => l.startsWith('policy-')),
      progress_percentage: progressPercentage
    })
  } catch (error) {
    console.error('Error removing policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

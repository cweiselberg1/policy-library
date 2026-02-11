import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Fetch user's last position from course_progress
    const { data: progress, error } = await supabase
      .from('course_progress')
      .select('completed_lessons, progress_percentage')
      .eq('user_id', user.id)
      .eq('course_id', 'hipaa-training')
      .single() as any

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!progress) {
      return NextResponse.json({
        last_position: null,
        progress_percentage: 0,
        completed_lessons: []
      })
    }

    // Determine last position based on completed lessons
    let lastPosition = 'policies' // Default starting point

    const completedLessons = progress.completed_lessons || []
    const policyCount = completedLessons.filter((l: string) => l.startsWith('policy-')).length

    if (completedLessons.includes('cybersecurity')) {
      lastPosition = 'complete'
    } else if (completedLessons.includes('hipaa-101')) {
      lastPosition = 'cybersecurity'
    } else if (policyCount === 10) {
      lastPosition = 'hipaa-101'
    } else if (policyCount > 0) {
      lastPosition = 'policies'
    }

    return NextResponse.json({
      last_position: lastPosition,
      progress_percentage: progress.progress_percentage,
      completed_lessons: completedLessons
    })
  } catch (error) {
    console.error('Error fetching session:', error)
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
    const { current_position } = body

    if (!current_position || typeof current_position !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected current_position (string)' },
        { status: 400 }
      )
    }

    // Validate position
    const validPositions = ['policies', 'hipaa-101', 'cybersecurity', 'complete']
    if (!validPositions.includes(current_position)) {
      return NextResponse.json(
        { error: `Invalid position. Must be one of: ${validPositions.join(', ')}` },
        { status: 400 }
      )
    }

    // Get current progress
    const { data: progress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', 'hipaa-training')
      .single() as any

    if (progress) {
      // Update existing progress with timestamp
      const { error } = await supabase
        .from('course_progress')
        .update({
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
      // Create new progress record if none exists
      const { error } = await supabase
        .from('course_progress')
        .insert({
          user_id: user.id,
          course_id: 'hipaa-training',
          completed_lessons: [],
          progress_percentage: 0,
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
      current_position,
      saved_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

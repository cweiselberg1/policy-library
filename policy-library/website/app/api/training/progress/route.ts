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

    // Fetch user's training progress
    const { data: progress, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', 'hipaa-training')
      .single() as any

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // If no progress exists, return default structure
    if (!progress) {
      return NextResponse.json({
        user_id: user.id,
        course_id: 'hipaa-training',
        completed_lessons: [],
        progress_percentage: 0,
        started_at: null,
        completed_at: null,
        updated_at: null
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
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
    const { completed_lessons, progress_percentage } = body

    if (!Array.isArray(completed_lessons) || typeof progress_percentage !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected completed_lessons (array) and progress_percentage (number)' },
        { status: 400 }
      )
    }

    // Check if progress record exists
    const { data: existing } = await supabase
      .from('course_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', 'hipaa-training')
      .single() as any

    let result

    if (existing) {
      // Update existing progress
      const { data, error } = await supabase
        .from('course_progress')
        .update({
          completed_lessons,
          progress_percentage,
          completed_at: progress_percentage === 100 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('course_id', 'hipaa-training')
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('course_progress')
        .insert({
          user_id: user.id,
          course_id: 'hipaa-training',
          completed_lessons,
          progress_percentage,
          started_at: new Date().toISOString(),
          completed_at: progress_percentage === 100 ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

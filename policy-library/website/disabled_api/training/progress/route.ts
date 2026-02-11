import { NextResponse } from 'next/server';

export async function GET() {
  // Mock endpoint - returns empty progress since we have no backend
  return NextResponse.json({
    progress: {
      completed: 0,
      total: 20,
      lastAccessed: null
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mock endpoint - just validate the request and return success
    if (!body.policyId) {
      return NextResponse.json(
        { error: 'policyId is required' },
        { status: 400 }
      );
    }

    // Return success without actually storing anything
    return NextResponse.json({
      success: true,
      message: 'Progress recorded (mock)'
    });
  } catch (error) {
    console.error('Error recording progress:', error);
    return NextResponse.json(
      { error: 'Failed to record progress' },
      { status: 500 }
    );
  }
}

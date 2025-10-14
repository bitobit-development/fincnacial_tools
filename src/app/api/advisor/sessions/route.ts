/**
 * API Route: /api/advisor/sessions
 *
 * Manage AI advisor conversation sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateSessionSchema = z.object({
  userId: z.string().uuid(),
});

/**
 * POST /api/advisor/sessions
 * Create a new advisor session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = CreateSessionSchema.parse(body);

    // TODO: Create session in database
    const sessionId = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        userId,
        startedAt: new Date().toISOString(),
        currentPhase: 'personal_profile',
      },
    });
  } catch (error) {
    console.error('Create Session Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create session',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/advisor/sessions?userId=xxx
 * Get all sessions for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    // TODO: Load sessions from database

    return NextResponse.json({
      success: true,
      data: {
        sessions: [],
      },
    });
  } catch (error) {
    console.error('Get Sessions Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load sessions',
      },
      { status: 500 }
    );
  }
}

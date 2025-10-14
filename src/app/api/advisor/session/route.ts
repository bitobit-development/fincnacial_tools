/**
 * API Route: /api/advisor/session
 *
 * POST: Create a new advisor session (marks current as inactive)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  deactivateUserSessions,
  createAdvisorSession,
} from '@/lib/db/queries';

// Request body schema
const NewSessionRequestSchema = z.object({
  userId: z.string().refine((val) => {
    // Allow demo UUID or standard UUIDs
    return val === '00000000-0000-0000-0000-000000000001' ||
           /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
  }, { message: 'Invalid UUID format' }),
  currentSessionId: z.string().uuid().nullable().optional(),
});

/**
 * POST /api/advisor/session
 * Create a new session for the user, deactivating any active sessions
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/advisor/session - Request received');

  try {
    // Parse and validate request body
    const body = await request.json();
    console.log('[API] Request body:', JSON.stringify(body, null, 2));

    console.log('[API] Validating with Zod...');
    console.log('[API] Zod schema:', NewSessionRequestSchema);
    console.log('[API] About to parse body...');
    const validationResult = NewSessionRequestSchema.safeParse(body);
    console.log('[API] Validation result:', validationResult);

    if (!validationResult.success) {
      console.error('[API] Zod validation FAILED:', validationResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { userId, currentSessionId } = validationResult.data;
    console.log('[API] Validation passed - userId:', userId);

    // Deactivate all active sessions for this user
    console.log('[API] Deactivating user sessions...');
    await deactivateUserSessions(userId);
    console.log('[API] Deactivated active sessions for user');

    // Create new session
    console.log('[API] Creating new advisor session...');
    const newSession = await createAdvisorSession({
      userId,
      startedAt: new Date(),
      lastActivity: new Date(),
      currentPhase: 'personal_profile',
      isActive: true,
      userProfile: {},
      totalQuestionsAsked: 0,
      questionsAnswered: 0,
      phasesCompleted: [],
      confidenceScore: 0,
      needsClarification: [],
      readyForProjection: false,
    });

    console.log('[API] New session created:', newSession.id);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: newSession.id,
        message: 'New session created successfully',
      },
    });
  } catch (error) {
    console.error('[API] ========= ERROR CAUGHT =========');
    console.error('[API] Create Session Error:', error);
    console.error('[API] Error type:', typeof error);
    console.error('[API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error && 'cause' in error ? error.cause : undefined,
    });

    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors);
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
        error: error instanceof Error ? error.message : 'Failed to create new session',
      },
      { status: 500 }
    );
  }
}

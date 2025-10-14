/**
 * API Route: /api/advisor/session
 *
 * POST: Create a new advisor session (marks current as inactive)
 * PATCH: Update session with manual adjustments
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  deactivateUserSessions,
  createAdvisorSession,
  updateAdvisorSession,
  getSessionById,
} from '@/lib/db/queries';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getAuthenticatedUserId } from '@/lib/auth';

// Request body schema
const NewSessionRequestSchema = z.object({
  userId: z.string().refine((val) => {
    // Allow demo UUID or standard UUIDs
    return val === '00000000-0000-0000-0000-000000000001' ||
           /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
  }, { message: 'Invalid UUID format' }),
  currentSessionId: z.string().uuid().optional().or(z.null()),
});

// Request body schema for PATCH (manual adjustments)
const PatchSessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
  adjustments: z.object({
    monthly_ra_contribution: z.number().min(0).max(500000).optional(),
    investment_return: z.number().min(0).max(15).optional(),
    inflation_rate: z.number().min(0).max(10).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one adjustment must be provided' }
  ),
});

/**
 * POST /api/advisor/session
 * Create a new session for the user, deactivating any active sessions
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/advisor/session - Request received');

  // 🔒 SECURITY: Authenticate the request
  const authenticatedUserId = await getAuthenticatedUserId(request);

  if (!authenticatedUserId) {
    console.warn('[API] Unauthenticated session creation attempt');
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 }
    );
  }

  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, RATE_LIMITS.SESSION_CREATE);
  if (rateLimitResult) return rateLimitResult;

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

    // 🔒 SECURITY: Verify userId in request matches authenticated user
    if (userId !== authenticatedUserId) {
      console.warn('[API] userId mismatch - requested:', userId, 'authenticated:', authenticatedUserId);
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Cannot create session for another user',
        },
        { status: 403 }
      );
    }

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
    // Log minimal info in production, detailed info in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API] ========= ERROR CAUGHT =========');
      console.error('[API] Create Session Error:', error);
      console.error('[API] Error type:', typeof error);
      console.error('[API] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error && 'cause' in error ? error.cause : undefined,
      });
    } else {
      // Production: Log only essential info (no stack traces)
      console.error('[API] Create Session Error:', error instanceof Error ? error.message : 'Unknown error');
    }

    if (error instanceof z.ZodError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Zod validation errors:', error.errors);
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          // Only include detailed validation errors in development
          ...(process.env.NODE_ENV === 'development' && { details: error.errors }),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Failed to create new session'
          : (error instanceof Error ? error.message : 'Failed to create new session'),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/advisor/session
 * Update session with manual adjustments to retirement plan parameters
 */
export async function PATCH(request: NextRequest) {
  console.log('[API] PATCH /api/advisor/session - Request received');

  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, RATE_LIMITS.SESSION_UPDATE);
  if (rateLimitResult) return rateLimitResult;

  try {
    // Parse and validate request body
    const body = await request.json();
    console.log('[API] Request body:', JSON.stringify(body, null, 2));

    const validationResult = PatchSessionRequestSchema.safeParse(body);
    console.log('[API] Validation result:', validationResult.success);

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

    const { sessionId, adjustments } = validationResult.data;
    console.log('[API] Validated - sessionId:', sessionId);
    console.log('[API] Adjustments:', adjustments);

    // Fetch existing session
    console.log('[API] Fetching session...');
    const session = await getSessionById(sessionId);

    if (!session) {
      console.error('[API] Session not found:', sessionId);
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 404 }
      );
    }

    console.log('[API] Session found, userId:', session.userId);

    // 🔒 SECURITY: Verify session ownership
    const authenticatedUserId = await getAuthenticatedUserId(request);

    if (!authenticatedUserId) {
      console.warn('[API] Unauthenticated access attempt');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    if (session.userId !== authenticatedUserId) {
      console.warn('[API] Unauthorized access attempt - userId mismatch');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: You do not have permission to modify this session',
        },
        { status: 403 }
      );
    }

    // Merge manual_adjustments into userProfile
    const currentProfile = session.userProfile || {};
    const timestamp = new Date();

    const updatedProfile = {
      ...currentProfile,
      manual_adjustments: {
        monthly_ra_contribution: adjustments.monthly_ra_contribution,
        investment_return: adjustments.investment_return,
        inflation_rate: adjustments.inflation_rate,
        adjusted_at: timestamp,
        adjusted_by: 'user',
      },
    };

    console.log('[API] Updating session with new profile...');

    // Update session
    const updatedSession = await updateAdvisorSession(sessionId, {
      userProfile: updatedProfile,
      lastActivity: timestamp,
    });

    console.log('[API] Session updated successfully');

    return NextResponse.json({
      success: true,
      data: {
        sessionId: updatedSession.id,
        message: 'Manual adjustments saved successfully',
        adjustments: {
          monthly_ra_contribution: adjustments.monthly_ra_contribution,
          investment_return: adjustments.investment_return,
          inflation_rate: adjustments.inflation_rate,
          adjusted_at: timestamp,
        },
      },
    });
  } catch (error) {
    // Log minimal info in production, detailed info in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API] ========= ERROR CAUGHT =========');
      console.error('[API] PATCH Session Error:', error);
      console.error('[API] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } else {
      // Production: Log only essential info (no stack traces)
      console.error('[API] PATCH Session Error:', error instanceof Error ? error.message : 'Unknown error');
    }

    if (error instanceof z.ZodError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Zod validation errors:', error.errors);
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          // Only include detailed validation errors in development
          ...(process.env.NODE_ENV === 'development' && { details: error.errors }),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Failed to update session'
          : (error instanceof Error ? error.message : 'Failed to update session'),
      },
      { status: 500 }
    );
  }
}

/**
 * API Route: /api/advisor/chat
 *
 * POST: Send message to AI financial advisor
 */

import { NextRequest, NextResponse } from 'next/server';
import { openaiAdvisor } from '@/lib/services/openaiAdvisor';
import type { ConversationSession } from '@/types/aiAdvisor';
import { z } from 'zod';
import {
  getActiveSession,
  getSessionById,
  createAdvisorSession,
  updateAdvisorSession,
  addAdvisorMessage,
  getRecentMessages,
} from '@/lib/db/queries';
import { getAuthenticatedUserId } from '@/lib/auth';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

// Request body schema
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid(),
});

/**
 * POST /api/advisor/chat
 * Send a message to the AI advisor
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/advisor/chat - Request received');

  // 🔒 SECURITY: Authenticate the request
  const authenticatedUserId = await getAuthenticatedUserId(request);

  if (!authenticatedUserId) {
    console.warn('[API] Unauthenticated chat request');
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 }
    );
  }

  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, RATE_LIMITS.CHAT_MESSAGE);
  if (rateLimitResult) return rateLimitResult;

  try {
    // Parse and validate request body
    const body = await request.json();
    console.log('[API] Request body:', JSON.stringify(body, null, 2));

    const { message, sessionId, userId } = ChatRequestSchema.parse(body);
    console.log('[API] Validated request - userId:', userId, 'sessionId:', sessionId);

    // 🔒 SECURITY: Verify userId in request matches authenticated user
    if (userId !== authenticatedUserId) {
      console.warn('[API] userId mismatch in chat - requested:', userId, 'authenticated:', authenticatedUserId);
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Cannot send messages as another user',
        },
        { status: 403 }
      );
    }

    // Load or create session from database
    let dbSession;
    let conversationMessages = [];

    if (sessionId) {
      // Load existing session
      console.log('[API] Loading existing session:', sessionId);
      dbSession = await getSessionById(sessionId);

      if (dbSession) {
        conversationMessages = dbSession.messages || [];
        console.log('[API] Loaded session with', conversationMessages.length, 'messages');
      }
    }

    if (!dbSession) {
      // Get active session or create new one
      console.log('[API] Looking for active session for user:', userId);
      dbSession = await getActiveSession(userId);

      if (!dbSession) {
        console.log('[API] Creating new session for user:', userId);

        // Ensure user exists first (create if not exists)
        console.log('[API] Ensuring user exists:', userId);
        try {
          const { db } = await import('@/lib/db/connection');
          const { users } = await import('@/lib/db/schema');

          // Try to insert user (will fail silently if exists due to unique constraint)
          try {
            await db.insert(users).values({
              id: userId,
              email: `user-${userId}@demo.local`,
              name: 'Demo User',
              authProvider: 'demo',
              isActive: true,
            });
            console.log('[API] Demo user created successfully');
          } catch (insertError: any) {
            if (insertError.code === '23505') {
              console.log('[API] User already exists (unique constraint)');
            } else {
              console.error('[API] Error creating user:', insertError);
              throw insertError; // Re-throw to prevent session creation
            }
          }
        } catch (userError) {
          console.error('[API] User creation failed:', userError);
          throw userError; // Re-throw to prevent session creation without user
        }

        console.log('[API] User verification complete, creating session');
        dbSession = await createAdvisorSession({
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
        console.log('[API] New session created:', dbSession.id);
      } else {
        console.log('[API] Using active session:', dbSession.id);
        conversationMessages = await getRecentMessages(dbSession.id, 20);
      }
    }

    // Build ConversationSession object for OpenAI service
    const session: ConversationSession = {
      id: dbSession.id,
      user_id: dbSession.userId,
      started_at: dbSession.startedAt,
      last_activity: dbSession.lastActivity,
      current_phase: dbSession.currentPhase as any,
      messages: conversationMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.timestamp,
        phase: msg.phase as any,
        function_calls: msg.functionCalls as any,
      })),
      user_profile: (dbSession.userProfile as any) || {},
      advisor_state: {
        total_questions_asked: dbSession.totalQuestionsAsked || 0,
        questions_answered: dbSession.questionsAnswered || 0,
        current_phase: dbSession.currentPhase as any,
        phases_completed: (dbSession.phasesCompleted as any) || [],
        confidence_score: dbSession.confidenceScore || 0,
        needs_clarification: (dbSession.needsClarification as any) || [],
        ready_for_projection: dbSession.readyForProjection || false,
      },
      plan_overrides: [],
    };

    console.log('[API] Calling openaiAdvisor.chat()...');

    // Send message to AI advisor
    const response = await openaiAdvisor.chat(message, session);

    console.log('[API] OpenAI response received:', {
      messageId: response.message.id,
      contentLength: response.message.content?.length || 0,
      hasUpdatedProfile: Object.keys(response.updated_profile || {}).length > 0,
    });

    // Save user message to database
    await addAdvisorMessage({
      sessionId: dbSession.id,
      role: 'user',
      content: message,
      timestamp: new Date(),
      phase: dbSession.currentPhase,
      extractedData: null,
      functionCalls: null,
    });

    // Save assistant response to database
    await addAdvisorMessage({
      sessionId: dbSession.id,
      role: 'assistant',
      content: response.message.content,
      timestamp: response.message.timestamp,
      phase: dbSession.currentPhase,
      extractedData: response.updated_profile || null,
      functionCalls: response.message.function_calls || null,
    });

    // Update session with latest activity and profile
    const updatedProfile = {
      ...(dbSession.userProfile as any),
      ...response.updated_profile,
    };

    await updateAdvisorSession(dbSession.id, {
      lastActivity: new Date(),
      userProfile: updatedProfile,
      totalQuestionsAsked: (dbSession.totalQuestionsAsked || 0) + 1,
      questionsAnswered:
        Object.keys(response.updated_profile || {}).length > 0
          ? (dbSession.questionsAnswered || 0) + 1
          : dbSession.questionsAnswered || 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...response,
        sessionId: dbSession.id,
        // Include the complete user profile in the response
        user_profile: updatedProfile,
      },
    });
  } catch (error) {
    console.error('AI Advisor Chat Error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
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

    // Check if it's an OpenAI API error
    if (error && typeof error === 'object' && 'status' in error) {
      const openaiError = error as any;
      console.error('OpenAI API Error:', {
        status: openaiError.status,
        message: openaiError.message,
        type: openaiError.type,
      });

      return NextResponse.json(
        {
          success: false,
          error: `OpenAI API error: ${openaiError.message || 'Unknown error'}`,
          details: {
            status: openaiError.status,
            type: openaiError.type,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process message',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/advisor/chat?sessionId=xxx
 * Get conversation history for a session
 */
export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Authenticate the request
  const authenticatedUserId = await getAuthenticatedUserId(request);

  if (!authenticatedUserId) {
    console.warn('[API] Unauthenticated GET chat request');
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId && !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId or userId is required',
        },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Verify userId parameter matches authenticated user
    if (userId && userId !== authenticatedUserId) {
      console.warn('[API] Unauthorized GET chat - userId mismatch');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Cannot access another user\'s data',
        },
        { status: 403 }
      );
    }

    let session;
    let messages;

    if (sessionId) {
      // Load specific session
      session = await getSessionById(sessionId);

      // 🔒 SECURITY: Verify session belongs to authenticated user
      if (session && session.userId !== authenticatedUserId) {
        console.warn('[API] Unauthorized session access attempt');
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized: Cannot access another user\'s session',
          },
          { status: 403 }
        );
      }

      if (session) {
        messages = session.messages;
      }
    } else if (userId) {
      // Load active session for user (already verified above)
      session = await getActiveSession(userId);
      if (session) {
        messages = await getRecentMessages(session.id, 50);
      }
    }

    if (!session) {
      return NextResponse.json({
        success: true,
        data: {
          session: null,
          messages: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          userId: session.userId,
          currentPhase: session.currentPhase,
          userProfile: session.userProfile,
          startedAt: session.startedAt,
          lastActivity: session.lastActivity,
        },
        messages: messages || [],
      },
    });
  } catch (error) {
    console.error('Get Session Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load session',
      },
      { status: 500 }
    );
  }
}

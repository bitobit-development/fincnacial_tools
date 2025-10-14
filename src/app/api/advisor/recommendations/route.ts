/**
 * API Route: /api/advisor/recommendations
 *
 * Get AI-generated financial recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GET /api/advisor/recommendations?sessionId=xxx
 * Get recommendations for a session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId is required',
        },
        { status: 400 }
      );
    }

    // TODO: Load recommendations from database

    return NextResponse.json({
      success: true,
      data: {
        recommendations: [],
      },
    });
  } catch (error) {
    console.error('Get Recommendations Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load recommendations',
      },
      { status: 500 }
    );
  }
}

const OverrideRecommendationSchema = z.object({
  recommendationId: z.string().uuid(),
  overrideBy: z.string(),
  overrideReason: z.string().min(10).max(1000),
});

/**
 * POST /api/advisor/recommendations/override
 * Override an AI recommendation (financial advisor only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendationId, overrideBy, overrideReason } = OverrideRecommendationSchema.parse(body);

    // TODO: Update recommendation in database

    return NextResponse.json({
      success: true,
      data: {
        recommendationId,
        overridden: true,
        overrideAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Override Recommendation Error:', error);

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
        error: 'Failed to override recommendation',
      },
      { status: 500 }
    );
  }
}

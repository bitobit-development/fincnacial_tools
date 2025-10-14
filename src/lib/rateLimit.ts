/**
 * Rate Limiting Utility
 *
 * Implements token bucket rate limiting for API endpoints
 * Limits requests per user/IP to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'next-rate-limit';

// Rate limiter configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 unique users per interval
});

/**
 * Apply rate limiting to an API route
 *
 * @param request - Next.js request object
 * @param limit - Maximum requests per interval (default: 10)
 * @returns NextResponse with 429 status if rate limit exceeded, null otherwise
 *
 * @example
 * const rateLimitResult = await applyRateLimit(request, 10);
 * if (rateLimitResult) return rateLimitResult;
 */
export async function applyRateLimit(
  request: NextRequest,
  limit: number = 10
): Promise<NextResponse | null> {
  try {
    // Use IP address as identifier (fallback to 'anonymous' in development)
    const identifier = request.ip ??
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      'anonymous';

    await limiter.check(limit, identifier);
    return null; // No rate limit exceeded
  } catch {
    // Rate limit exceeded
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60', // Suggest retry after 60 seconds
        },
      }
    );
  }
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  SESSION_CREATE: 5,       // 5 session creations per minute
  SESSION_UPDATE: 10,      // 10 session updates per minute
  CHAT_MESSAGE: 20,        // 20 chat messages per minute
  CALCULATIONS: 15,        // 15 calculation requests per minute
} as const;

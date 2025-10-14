/**
 * NextAuth.js Configuration
 *
 * Provides authentication for the application
 * Using demo credentials provider for MVP (replace with OAuth in production)
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { sql } from '@vercel/postgres';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes, allow specific demo accounts
        // TODO: Replace with proper user authentication in production
        if (
          credentials.email === 'demo@example.com' &&
          credentials.password === 'demo123'
        ) {
          return {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'demo@example.com',
            name: 'Demo User',
          };
        }

        if (
          credentials.email === 'test@example.com' &&
          credentials.password === 'test123'
        ) {
          return {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            name: 'Test User',
          };
        }

        // Invalid credentials
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user ID to token on sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID to session
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Get the authenticated user's ID from the request
 *
 * @param request - Next.js request object
 * @returns User ID or null if not authenticated
 */
export async function getAuthenticatedUserId(
  request: Request
): Promise<string | null> {
  const authHeader = request.headers.get('authorization');

  // DEVELOPMENT ONLY: Allow unauthenticated requests to use demo user
  // This bypasses authentication for local development and testing
  if (!authHeader && process.env.NODE_ENV === 'development') {
    console.warn('[AUTH] Development mode: Allowing unauthenticated request as demo user');
    return '00000000-0000-0000-0000-000000000001'; // Demo user
  }

  // Extract Bearer token
  if (!authHeader?.startsWith('Bearer ')) {
    return null; // No valid authorization header
  }

  const token = authHeader.replace('Bearer ', '');

  // Validate JWT token
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[AUTH] NEXTAUTH_SECRET not configured');
      return null;
    }

    // Import dynamically to avoid issues
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, secret) as { id: string; email?: string };

    if (!decoded.id) {
      console.error('[AUTH] JWT token missing user ID');
      return null;
    }

    return decoded.id;
  } catch (error) {
    if (error instanceof Error) {
      console.error('[AUTH] JWT verification failed:', error.message);
    }
    return null; // Invalid or expired token
  }
}

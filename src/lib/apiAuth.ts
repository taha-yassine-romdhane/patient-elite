/**
 * API Authentication Helper
 * Utility functions for validating authentication in API routes
 */

import { NextRequest } from 'next/server';
import { validateSession, type SessionData } from './sessionAuth';

/**
 * Extract and validate session from API request
 */
export async function getSessionFromRequest(request: NextRequest | Request): Promise<SessionData | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Validate session from database
    const session = await validateSession(token);
    return session;
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Require authentication for API route
 * Returns session data or throws error
 */
export async function requireAuth(request: NextRequest | Request): Promise<SessionData> {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
}

/**
 * Require specific role for API route
 */
export async function requireRole(request: NextRequest | Request, requiredRole: string): Promise<SessionData> {
  const session = await requireAuth(request);
  
  if (session.user.role !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`);
  }
  
  return session;
}

/**
 * Require admin role for API route
 */
export async function requireAdmin(request: NextRequest | Request): Promise<SessionData> {
  return requireRole(request, 'ADMIN');
}

/**
 * Create standardized auth error responses
 */
export const AuthErrors = {
  MISSING_TOKEN: {
    message: 'Token manquant',
    status: 401,
  },
  INVALID_SESSION: {
    message: 'Session invalide ou expirée',
    status: 401,
  },
  INSUFFICIENT_PERMISSIONS: {
    message: 'Permissions insuffisantes',
    status: 403,
  },
  ADMIN_REQUIRED: {
    message: 'Accès administrateur requis',
    status: 403,
  },
} as const;

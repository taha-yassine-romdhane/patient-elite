/**
 * Server Action Authentication Helper
 * Handles authentication for Next.js Server Actions
 */

import { cookies } from 'next/headers';
import { validateSession, type SessionData } from './sessionAuth';

export interface ServerActionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Get current user from session for Server Actions
 * Server Actions can access cookies but not Authorization headers
 */
export async function getCurrentUserForServerAction(): Promise<ServerActionUser | null> {
  try {
    // Get session token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      // If no cookie, try to get from localStorage (this won't work in server actions)
      // Server actions need to rely on cookies or other server-side storage
      return null;
    }

    // Validate session from database
    const session = await validateSession(token);
    
    if (!session) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  } catch (error) {
    console.error('Error getting current user for server action:', error);
    return null;
  }
}

/**
 * Require authentication for Server Action
 */
export async function requireAuthForServerAction(): Promise<ServerActionUser> {
  const user = await getCurrentUserForServerAction();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Require specific role for Server Action
 */
export async function requireRoleForServerAction(requiredRole: string): Promise<ServerActionUser> {
  const user = await requireAuthForServerAction();
  
  if (user.role !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`);
  }
  
  return user;
}

/**
 * Check if user should be filtered (for employee role)
 */
export function shouldFilterByUser(user: ServerActionUser | null): boolean {
  return user?.role === 'EMPLOYEE';
}

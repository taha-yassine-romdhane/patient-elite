/**
 * Server Action Authentication Helper
 * Handles authentication for Next.js Server Actions
 * 
 * Note: Server Actions cannot access localStorage directly.
 * Authentication is handled by passing user ID in form data and validating it.
 */

import { validateSession, type SessionData } from './sessionAuth';
import { prisma } from './prisma';

export interface ServerActionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Get current user by validating session token for Server Actions
 * Since Server Actions can't access localStorage, the token must be passed explicitly
 */
export async function getCurrentUserForServerAction(token?: string): Promise<ServerActionUser | null> {
  try {
    if (!token) {
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
 * Get current user by user ID for Server Actions
 * This is an alternative when you have the user ID from form data
 */
export async function getCurrentUserByIdForServerAction(userId: string): Promise<ServerActionUser | null> {
  try {
    if (!userId) {
      return null;
    }

    // Get user from database
    const user = await prisma.technician.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    console.error('Error getting current user by ID for server action:', error);
    return null;
  }
}

/**
 * Require authentication for Server Action using token
 */
export async function requireAuthForServerAction(token?: string): Promise<ServerActionUser> {
  const user = await getCurrentUserForServerAction(token);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Require authentication for Server Action using user ID
 */
export async function requireAuthForServerActionById(userId: string): Promise<ServerActionUser> {
  const user = await getCurrentUserByIdForServerAction(userId);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Require specific role for Server Action using token
 */
export async function requireRoleForServerAction(requiredRole: string, token?: string): Promise<ServerActionUser> {
  const user = await requireAuthForServerAction(token);
  
  if (user.role !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`);
  }
  
  return user;
}

/**
 * Require specific role for Server Action using user ID
 */
export async function requireRoleForServerActionById(requiredRole: string, userId: string): Promise<ServerActionUser> {
  const user = await requireAuthForServerActionById(userId);
  
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

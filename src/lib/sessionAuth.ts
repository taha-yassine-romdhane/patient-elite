/**
 * Database-based Session Authentication System
 * Stores session tokens in database for maximum security and reliability
 */

import { prisma } from '@/lib/prisma';

export interface SessionData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: Date;
}

/**
 * Generate a secure random session token using Web Crypto API
 */
function generateSessionToken(): string {
  // Use Web Crypto API which is supported in Edge Runtime
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a new session in the database
 */
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  // Clean up expired sessions for this user first
  await cleanupExpiredSessions(userId);
  
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  return token;
}

/**
 * Validate a session token and return session data
 */
export async function validateSession(token: string): Promise<SessionData | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });
      return null;
    }

    return {
      id: session.id,
      token: session.token,
      userId: session.userId,
      expiresAt: session.expiresAt,
      user: session.user,
      createdAt: session.createdAt,
    };
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

/**
 * Delete a specific session (logout)
 */
export async function deleteSession(token: string): Promise<boolean> {
  try {
    await prisma.session.delete({
      where: { token },
    });
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}

/**
 * Delete all sessions for a user (logout from all devices)
 */
export async function deleteAllUserSessions(userId: string): Promise<boolean> {
  try {
    await prisma.session.deleteMany({
      where: { userId },
    });
    return true;
  } catch (error) {
    console.error('Error deleting user sessions:', error);
    return false;
  }
}

/**
 * Clean up expired sessions for a specific user
 */
export async function cleanupExpiredSessions(userId?: string): Promise<void> {
  try {
    const where = {
      expiresAt: {
        lt: new Date(),
      },
      ...(userId && { userId }),
    };

    await prisma.session.deleteMany({ where });
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map(session => ({
      id: session.id,
      token: session.token,
      userId: session.userId,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      user: session.user,
    }));
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}

/**
 * Extend session expiration (refresh session)
 */
export async function refreshSession(token: string): Promise<boolean> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Extend by 7 days

    await prisma.session.update({
      where: { token },
      data: { expiresAt },
    });

    return true;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}

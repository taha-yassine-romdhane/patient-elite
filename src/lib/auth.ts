import { headers } from 'next/headers';
import { validateSession } from './sessionAuth';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Get token from Authorization header
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
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
    console.error('Error extracting current user:', error);
    return null;
  }
}

export function shouldFilterByUser(user: AuthUser | null): boolean {
  // Only filter for EMPLOYEE role, ADMIN should see all records
  return user?.role === 'EMPLOYEE';
} 
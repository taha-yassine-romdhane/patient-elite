import { getServerSession } from "next-auth/next";
import { authOptions } from "./nextauth";
import { NextRequest } from "next/server";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
      role: session.user.role,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function shouldFilterByUser(user: AuthUser | null): boolean {
  // Only filter for EMPLOYEE role, ADMIN should see all records
  return user?.role === 'EMPLOYEE';
}

export async function requireAuth(request?: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function requireRole(role: string): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (user.role !== role) {
    throw new Error(`Role ${role} required`);
  }
  
  return user;
}
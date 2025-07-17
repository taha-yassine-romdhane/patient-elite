import { jwtVerify } from 'jose';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  try {
    // Get token from cookie header
    const token = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return null;
    }
    
    // Check if JWT_SECRET is set
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.warn('JWT_SECRET is not set in environment variables');
      return null;
    }
    
    // Verify token
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.id || !payload.email || !payload.name || !payload.role) {
      return null;
    }
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
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
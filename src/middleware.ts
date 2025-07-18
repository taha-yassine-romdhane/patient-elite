import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Get token from Authorization header (sent by fetchWithAuth)
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  if (pathname === '/login' || pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/signup')) {
    return NextResponse.next();
  }

  // For API routes, let them handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For page routes, we can't verify localStorage server-side
  // So we'll let the client-side handle authentication redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

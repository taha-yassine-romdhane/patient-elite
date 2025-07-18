import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSession } from '@/lib/sessionAuth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and public pages
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/login' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');
    
    // If no auth header, try to get from cookie
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }

    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validate session from database
    const session = await validateSession(token);

    if (!session) {
      console.log('Invalid or expired session, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control
    const userRole = session.user.role;
    
    // Admin routes
    if (pathname.startsWith('/admin/') && userRole !== 'ADMIN') {
      console.log('Access denied: Admin route for non-admin user');
      return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    }
    
    // Employee routes
    if (pathname.startsWith('/employee/') && userRole !== 'EMPLOYEE') {
      console.log('Access denied: Employee route for non-employee user');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware authentication error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

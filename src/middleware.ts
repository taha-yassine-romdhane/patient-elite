import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip all middleware authentication - let client-side AuthGuard handle everything
  // This is because:
  // 1. Middleware runs in Edge Runtime which can't access Prisma/database
  // 2. Middleware can't access localStorage where tokens are stored
  // 3. AuthGuard component handles client-side authentication and redirects
  // 4. API routes handle their own authentication validation
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based access control
    // If the user is trying to access an admin route and doesn't have the ADMIN role
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      // Redirect them to employee dashboard if they're not an admin
      return NextResponse.redirect(new URL('/employee/dashboard', req.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback determines if the user is authorized to access a page.
      // It's called before the middleware function.
      // We are just checking if a token exists.
      authorized: ({ token }) => !!token,
    },
  }
);

// This config specifies which paths the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, especially /api/auth for login)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page itself, to prevent redirect loops)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};

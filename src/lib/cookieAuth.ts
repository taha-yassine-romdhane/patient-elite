/**
 * Secure Cookie-based Authentication for HTTPS Production
 * Uses httpOnly, secure cookies for better security
 */

import { NextResponse } from 'next/server';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

/**
 * Set a secure cookie in the response
 */
export function setSecureCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Lax for development
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  let cookieString = `${name}=${value}`;
  
  if (finalOptions.maxAge) {
    cookieString += `; Max-Age=${finalOptions.maxAge}`;
  }
  
  if (finalOptions.path) {
    cookieString += `; Path=${finalOptions.path}`;
  }
  
  if (finalOptions.httpOnly) {
    cookieString += '; HttpOnly';
  }
  
  if (finalOptions.secure) {
    cookieString += '; Secure';
  }
  
  if (finalOptions.sameSite) {
    cookieString += `; SameSite=${finalOptions.sameSite}`;
  }

  console.log('Setting cookie:', cookieString);
  response.headers.set('Set-Cookie', cookieString);
  return response;
}

/**
 * Clear a cookie by setting it to expire
 */
export function clearCookie(response: NextResponse, name: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? '; Secure' : '';
  const sameSiteFlag = isProduction ? '; SameSite=strict' : '; SameSite=lax';
  const cookieString = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly${secureFlag}${sameSiteFlag}`;
  response.headers.set('Set-Cookie', cookieString);
  return response;
}

/**
 * Get cookie value from request
 */
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  
  return cookie ? cookie.split('=')[1] : null;
}

/**
 * Create a response with authentication cookie
 */
export function createAuthResponse(data: any, token: string) {
  const response = NextResponse.json(data, { status: 200 });
  
  // Set secure authentication cookie
  setSecureCookie(response, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
  });

  return response;
}

/**
 * Create a logout response that clears cookies
 */
export function createLogoutResponse() {
  const response = NextResponse.json({ message: 'Déconnexion réussie' }, { status: 200 });
  clearCookie(response, 'auth-token');
  return response;
}

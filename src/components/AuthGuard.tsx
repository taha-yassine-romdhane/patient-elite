"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    // Public routes that don't require authentication
    const publicRoutes = ['/login'];
    
    if (publicRoutes.includes(pathname)) {
      // If user is already logged in, redirect to dashboard
      if (session?.user) {
        const dashboardPath = session.user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard';
        router.push(dashboardPath);
      }
      return;
    }

    // Check if user is authenticated
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Admin routes
    if (pathname.startsWith('/admin') && session.user.role !== 'ADMIN') {
      router.push('/employee/dashboard');
      return;
    }

    // Employee routes
    if (pathname.startsWith('/employee') && session.user.role !== 'EMPLOYEE') {
      router.push('/admin/dashboard');
      return;
    }
  }, [session, status, pathname, router]);

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Public routes
  const publicRoutes = ['/login'];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Protected routes - only render if authenticated
  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUserInfo } from '@/lib/apiClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Public routes that don't require authentication
      const publicRoutes = ['/login'];
      
      if (publicRoutes.includes(pathname)) {
        // If user is already logged in, redirect to dashboard
        if (isAuthenticated()) {
          const userInfo = getUserInfo();
          if (userInfo) {
            const dashboardPath = userInfo.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard';
            router.push(dashboardPath);
            return;
          }
        }
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Check role-based access
      const userInfo = getUserInfo();
      if (!userInfo) {
        router.push('/login');
        return;
      }

      // Admin routes
      if (pathname.startsWith('/admin') && userInfo.role !== 'ADMIN') {
        router.push('/employee/dashboard');
        return;
      }

      // Employee routes
      if (pathname.startsWith('/employee') && userInfo.role !== 'EMPLOYEE') {
        router.push('/admin/dashboard');
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

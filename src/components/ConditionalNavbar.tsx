"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const ConditionalNavbar = () => {
  const pathname = usePathname();

  // Don't show navbar for admin routes (handled by admin layout)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Show regular Navbar for all other routes
  return <Navbar />;
};

export default ConditionalNavbar;
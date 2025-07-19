"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // If user is not logged in, don't show navbar
  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md fixed w-full z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">
            Patients Elite
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${pathname === '/' ? 'bg-blue-700' : ''}`}
            >
              Accueil
            </Link>
            
            {user && (
              <button 
                onClick={handleLogout}
                className="ml-4 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                Déconnexion
              </button>
            )}
            
            {!user && (
              <Link 
                href="/login" 
                className="ml-4 px-4 py-2 rounded-md bg-blue-800 text-white text-sm font-medium hover:bg-blue-900"
              >
                Connexion
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 pb-4 px-4">
          <Link 
            href="/" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 mt-1"
            onClick={() => setIsMenuOpen(false)}
          >
            Accueil
          </Link>
          
          {user && (
            <button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700 mt-2"
            >
              Déconnexion
            </button>
          )}
          
          {!user && (
            <Link 
              href="/login" 
              className="block px-3 py-2 rounded-md text-base font-medium bg-blue-800 hover:bg-blue-900 mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
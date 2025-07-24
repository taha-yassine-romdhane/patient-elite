"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, LogOut } from 'lucide-react';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // If user is not logged in, don't show navbar
  if (status === 'loading') {
    return null;
  }
  
  if (!session) {
    return null;
  }


  return (
    <nav className="bg-black text-white shadow-lg fixed w-full z-10 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
            Patients Elite
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-3 items-center">
            <Button
              variant={pathname === '/' ? 'secondary' : 'ghost'}
              size="sm"
              asChild
              className={pathname === '/' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'text-white hover:bg-gray-800 hover:text-white'}
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Accueil
              </Link>
            </Button>
            
            {user && (
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            )}
            
            {!user && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="ml-2 border-gray-600 text-white hover:bg-white hover:text-black"
              >
                <Link href="/login">
                  Connexion
                </Link>
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-gray-800 hover:text-white p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 pb-4 px-4 border-t border-gray-800">
          <Button
            variant={pathname === '/' ? 'secondary' : 'ghost'}
            size="sm"
            asChild
            className={`w-full justify-start mt-2 ${
              pathname === '/' 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'text-white hover:bg-gray-800 hover:text-white'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </Button>
          
          {user && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full justify-start mt-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          )}
          
          {!user && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full justify-start mt-2 border-gray-600 text-white hover:bg-white hover:text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link href="/login">
                Connexion
              </Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
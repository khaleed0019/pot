'use client';

import Link from 'next/link';
import { Search, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, appUser, loading, signOut } = useAuth();

  const role = appUser?.role ?? null;
  const isAdmin = role === 'ADMIN';
  const isAgent = role === 'AGENT';

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">Property On Set</span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/buy" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">Buy</Link>
              <Link href="/rent" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">Rent</Link>
              <Link href={isAgent ? '/agent/dashboard' : '/sell'} className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">
                {isAgent ? 'Agent' : 'Sell'}
              </Link>
              <Link href="/invest" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">Invest</Link>
              <Link href="/agents" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">Agents</Link>
              {isAdmin && (
                <Link href="/admin" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1">
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search city, zip, or address"
                className="bg-transparent border-none focus:outline-none text-sm w-48"
              />
            </div>
            {!loading && currentUser ? (
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-700 hover:text-primary font-medium"
              >
                <User className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <Link href="/login" className="flex items-center text-gray-700 hover:text-primary font-medium">
                <User className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/buy" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Buy</Link>
            <Link href="/rent" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Rent</Link>
            <Link href={isAgent ? '/agent/dashboard' : '/sell'} className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
              {isAgent ? 'Agent' : 'Sell'}
            </Link>
            <Link href="/invest" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Invest</Link>
            <Link href="/agents" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Agents</Link>
            {isAdmin && (
              <Link href="/admin" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Admin
              </Link>
            )}
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="block w-full text-left text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

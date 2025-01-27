'use client';

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import Link from 'next/link';

export default function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="bg-white shadow-lg dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
              ShillDash
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/add-token" 
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Add Token
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 
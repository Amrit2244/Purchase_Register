'use client';

import { useEffect } from 'react'; // Added useEffect
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: {
      username?: string
      role?: string
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    // Show a loading indicator or a blank screen while session is loading or redirecting
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100"> {/* Updated background */}
        <div className="text-lg font-medium text-gray-600">Loading session...</div>
        {/* Or return null for a blank screen during redirect */}
      </div>
    );
  }

  // Only render the full layout if authenticated
  return (
    <div className="min-h-screen bg-slate-100"> {/* Updated background */}
      <nav className="bg-indigo-700 shadow-lg"> {/* Updated navbar background */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Image 
                  src="/logo.svg" // Assuming logo is suitable for dark backgrounds or use a different one
                  alt="Purchase Register Logo" 
                  width={40} 
                  height={40} 
                  className="mr-2" // Filter invert might be needed if logo is dark: filter invert
                />
                <span className="text-xl font-bold text-white">Purchase Register</span> {/* Updated text color */}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-indigo-300 text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out" // Active link style + transition
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/parties"
                  className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Parties
                </Link>
                <Link
                  href="/dashboard/items"
                  className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Items
                </Link>
                <Link
                  href="/dashboard/purchase-entry"
                  className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Purchase Entry
                </Link>
                <Link
                  href="/dashboard/edit-entry"
                  className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Edit Entries
                </Link>
                <Link
                  href="/dashboard/delete-entry"
                  className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Delete Entry
                </Link>
                <Link
                  href="/dashboard/reports/by-parties"
                  className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Party Reports
                </Link>
                <Link
                  href="/dashboard/reports/by-item"
                  className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Item Reports
                </Link>
                <Link
                  href="/dashboard/reports/all-entries"
                  className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  All Entries Report
                </Link>
                {session?.user?.role === 'admin' && (
                  <Link
                    href="/dashboard/users"
                    className="border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                  >
                    User Management
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-indigo-100 mr-4"> {/* Updated text color */}
                Welcome, {session?.user?.name}
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium" /* Updated button style */
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
'use client';

import { useEffect, CSSProperties } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'; // Adjusted path

declare module "next-auth" {
  interface Session {
    user?: {
      username?: string;
      role?: string;
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme(); // Access theme properties

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        className="flex items-center justify-center min-h-screen bg-background text-foreground"
      >
        <div className="text-lg font-medium">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="bg-primary text-text-on-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Purchase Register Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <span className="text-xl font-bold text-text-on-primary">
                  Purchase Register
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  href="/dashboard"
                  className="text-text-on-primary hover:text-accent border-secondary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/parties"
                  className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  Parties
                </Link>
                <Link href="/dashboard/items" className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out">Items</Link>
                <Link href="/dashboard/purchase-entry" className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out">Purchase Entry</Link>
                <Link href="/dashboard/edit-entry" className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out">Edit Entries</Link>
                <Link href="/dashboard/delete-entry" className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out">Delete Entry</Link>
                <Link href="/dashboard/reports/by-parties" className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out">Party Reports</Link>
                <Link href="/dashboard/reports/by-item" className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out">Item Reports</Link>
                <Link href="/dashboard/reports/all-entries" className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out">All Entries Report</Link>
                {session?.user?.role === 'admin' && (
                  <Link
                    href="/dashboard/users"
                    className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                  >
                    User Management
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  className="text-text-on-primary hover:text-accent border-transparent hover:border-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                >
                  App Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-text-on-primary">
                Welcome, {session?.user?.name}
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-text-on-secondary hover:opacity-90"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content will inherit body background and text color from themeStyles */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

// Export default the wrapper component that includes ThemeProvider
export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  return (
    <ThemeProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ThemeProvider>
  );
}

// or wherever your ThemeColors type is defined

interface ThemeColors {
  primary: string;
  secondary: string;
  text_on_primary: string;
  text_on_secondary: string;
  text_on_primary_accent: string; // Add this line
  // ...other color properties
}
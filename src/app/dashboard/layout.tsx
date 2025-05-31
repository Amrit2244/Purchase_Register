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
        style={{
          backgroundColor: 'var(--color-background)', // Use CSS variable
          color: 'var(--color-text)', // Use CSS variable
        }}
      >
        <div className="text-lg font-medium">Loading session...</div>
      </div>
    );
  }

  // CSS properties to set CSS variables from the theme
  const themeStyles: CSSProperties = {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-background': theme.colors.background,
    '--color-text': theme.colors.text,
    '--font-size-base': `${theme.fontSize}px`,
  } as CSSProperties; // Type assertion for CSS custom properties

  return (
    <div
      className="min-h-screen"
      style={themeStyles} // Apply theme variables here
    >
      {/* Apply background color from CSS variable set in globals.css body or by themeStyles */}
      <nav className="shadow-lg" style={{ backgroundColor: 'var(--color-primary)'}}>
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
                {/* Text color will be inherited or explicitly set if needed */}
                <span className="text-xl font-bold" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : theme.colors.text_on_primary || '#FFFFFF' }}>
                  Purchase Register
                </span>
              </div>
              {/* Links will use themed text colors based on body styles or specific link styling if added */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  href="/dashboard"
                  className="border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                  style={{ color: theme.mode === 'dark' ? '#FFFFFF' : theme.colors.text_on_primary || '#FFFFFF', borderColor: theme.colors.secondary }} // Example active link
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/parties"
                  className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                  style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }} // Example link
                >
                  Parties
                </Link>
                {/* Add similar styling for other links */}
                <Link href="/dashboard/items" className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out" style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}>Items</Link>
                <Link href="/dashboard/purchase-entry" className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out" style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}>Purchase Entry</Link>
                <Link href="/dashboard/edit-entry" className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out" style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}>Edit Entries</Link>
                <Link href="/dashboard/delete-entry" className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out" style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}>Delete Entry</Link>
                <Link href="/dashboard/reports/by-parties" className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out" style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}>Party Reports</Link>
                <Link href="/dashboard/reports/by-item" className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out" style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}>Item Reports</Link>
                <Link href="/dashboard/reports/all-entries" className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out" style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}>All Entries Report</Link>
                {session?.user?.role === 'admin' && (
                  <Link
                    href="/dashboard/users"
                    className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                    style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}
                  >
                    User Management
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  className="border-transparent hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out"
                  style={{ color: theme.mode === 'dark' ? '#E0E0E0' : theme.colors.text_on_primary || '#E0E0E0', }}
                >
                  App Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span
                className="mr-4"
                style={{
                  color: theme.mode === 'dark'
                    ? '#F0F0F0'
                    : theme.colors.text_on_primary || '#F0F0F0' // Use text_on_primary instead
                }}
              >
                Welcome, {session?.user?.name}
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: theme.colors.secondary, color: theme.mode === 'dark' ? '#FFFFFF' : theme.colors.text_on_secondary || '#FFFFFF' }}
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
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
// import { useTheme } from '../../contexts/ThemeContext'; // No longer needed for direct styling
import {version} from '../../../package.json'; // Adjust the path as necessary
const APP_VERSION = version || 'N/A'; // Fallback if version is not defined

const menuItems = [
  { href: '/dashboard/parties', title: 'Manage Parties', description: 'Access and manage party details and information.', icon: '👥' },
  { href: '/dashboard/items', title: 'Manage Items', description: 'Handle your item catalog, categories, and stock.', icon: '📦' },
  { href: '/dashboard/purchase-entry', title: 'New Purchase Entry', description: 'Create new purchase entries for incoming goods.', icon: '➕' },
  { href: '/dashboard/edit-entry', title: 'Edit Entries', description: 'Modify or update existing purchase records.', icon: '✏️' },
  { href: '/dashboard/delete-entry', title: 'Delete Entry', description: 'Remove purchase entries from the records.', icon: '🗑️' },
  { href: '/dashboard/reports/by-parties', title: 'Party Reports', description: 'Generate purchase reports filtered by party.', icon: '📊' },
  { href: '/dashboard/reports/by-item', title: 'Item Reports', description: 'Generate purchase reports filtered by item.', icon: '📈' },
  { href: '/dashboard/reports/all-entries', title: 'All Entries Report', description: 'View a comprehensive report of all purchase entries.', icon: '📋' },
  { href: '/dashboard/users', title: 'User Management', description: 'Manage user accounts and roles (Admin only).', icon: '⚙️' },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  // const { theme } = useTheme(); // No longer needed for direct styling

  if (status === 'loading') {
    return (
      // Ensure loading state also respects basic theming if possible, or keep it simple
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center shadow-md bg-primary text-text-on-primary">
        <h1 className="text-2xl font-bold">Purchase Register for Baba Shekh Farid</h1>
        <span className="text-sm font-medium">{APP_VERSION}</span>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10"> {/* Background is inherited */}
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-primary">Welcome, {session?.user?.name || 'User'}!</h2>
          <p className="text-lg mt-2 text-muted">Select an option to get started.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            if (item.href === '/dashboard/users' && session?.user?.role !== 'admin') return null;

            return (
              <Link
                href={item.href}
                key={item.title}
                className="group p-6 rounded-2xl shadow-xl hover:shadow-2xl bg-card-background transition transform hover:-translate-y-1 border border-border"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200"> {/* Icon color can be text-accent if desired */}
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-foreground group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-sm text-muted border-t border-border">
        &copy; {new Date().getFullYear()} Smart Purchase Register. All rights reserved. | Version {APP_VERSION}
      </footer>
    </div>
  );
}

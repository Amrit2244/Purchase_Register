'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext'; // Import useTheme

const menuItems = [
  {
    href: '/dashboard/parties',
    title: 'Manage Parties',
    description: 'Access and manage party details and information.',
    icon: '👥'
  },
  {
    href: '/dashboard/items',
    title: 'Manage Items',
    description: 'Handle your item catalog, categories, and stock.',
    icon: '📦'
  },
  {
    href: '/dashboard/purchase-entry',
    title: 'New Purchase Entry',
    description: 'Create new purchase entries for incoming goods.',
    icon: '➕'
  },
  {
    href: '/dashboard/edit-entry',
    title: 'Edit Entries',
    description: 'Modify or update existing purchase records.',
    icon: '✏️'
  },
  {
    href: '/dashboard/delete-entry',
    title: 'Delete Entry',
    description: 'Remove purchase entries from the records.',
    icon: '🗑️'
  },
  {
    href: '/dashboard/reports/by-parties',
    title: 'Party Reports',
    description: 'Generate purchase reports filtered by party.',
    icon: '📊'
  },
  {
    href: '/dashboard/reports/by-item',
    title: 'Item Reports',
    description: 'Generate purchase reports filtered by item.',
    icon: '📈'
  },
  {
    href: '/dashboard/reports/all-entries',
    title: 'All Entries Report',
    description: 'View a comprehensive report of all purchase entries.',
    icon: '📋'
  },
  {
    href: '/dashboard/users',
    title: 'User Management',
    description: 'Manage user accounts and roles (Admin only).',
    icon: '⚙️'
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { theme } = useTheme(); // Access theme properties

  // Loading state is handled by DashboardLayoutContent now, but good for robustness
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Text color will be inherited from body which uses var(--color-text) */}
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Page container - background color is inherited from the layout which sets CSS variables
  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        {/* Heading uses primary color, paragraph uses general text color */}
        <h1
          className="text-3xl md:text-4xl font-bold"
          style={{ color: 'var(--color-primary)' }}
        >
          Dashboard Home
        </h1>
        {/* Text color inherited from body which uses var(--color-text) */}
        <p className="text-lg mt-2">
          Welcome back, {session?.user?.name || 'User'}! Select an option to proceed.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.map((item) => {
          if (item.href === '/dashboard/users' && session?.user?.role !== 'admin') {
            return null;
          }
          return (
            <Link href={item.href} key={item.title} legacyBehavior>
              {/* Card styles use CSS variables for background, border, and text */}
              <a
                className="block p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group"
                style={{
                  backgroundColor: theme.mode === 'dark' ? theme.colors.secondary : theme.colors.background, // Example: lighter background for cards in dark, main in light
                  borderColor: theme.colors.secondary, // Use secondary for border
                  borderWidth: '1px', // Ensure border is visible
                  color: 'var(--color-text)' // General text color for card content
                }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon color can be primary or secondary */}
                  <div
                    className="text-4xl mb-4 transition-colors"
                    style={{ color: 'var(--color-primary)' }} // Icon color
                  >
                    {item.icon}
                  </div>
                  {/* Title color can be primary on hover, default text otherwise */}
                  <h3
                    className="text-xl font-semibold mb-2 transition-colors group-hover:text-[var(--color-primary)]"
                    // style={{ color: 'var(--color-text)' }} // Handled by parent 'a' tag
                  >
                    {item.title}
                  </h3>
                  {/* Description text color inherited */}
                  <p className="text-sm">
                    {item.description}
                  </p>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
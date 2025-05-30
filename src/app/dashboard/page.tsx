'use client';

import { useSession } from 'next-auth/react';
// useRouter and useEffect might not be needed if layout handles auth redirection
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
import Link from 'next/link'; // Added Link import

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
  // const router = useRouter(); // Potentially remove if layout handles all auth redirects

  // useEffect(() => { // Potentially remove if layout handles all auth redirects
  //   if (status === 'unauthenticated') {
  //     router.push('/'); // Or '/login' as per layout
  //   }
  // }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // The main layout (layout.tsx) should handle redirecting unauthenticated users.
  // If session is null and status is not 'loading', it means unauthenticated.
  // However, layout.tsx should prevent this page from rendering in that state.

  return (
    // The min-h-screen and bg-gray-100 might be inherited from layout.tsx children wrapper
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">
          Dashboard Home
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Welcome back, {session?.user?.name || 'User'}! Select an option to proceed.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.map((item) => {
          // Basic conditional rendering for User Management (can be enhanced)
          if (item.href === '/dashboard/users' && session?.user?.role !== 'admin') {
            return null;
          }
          return (
            <Link href={item.href} key={item.title} legacyBehavior>
              <a className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-200 group">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-4 text-indigo-500 group-hover:text-indigo-600 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">
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
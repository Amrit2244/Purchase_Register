'use client';

import { useState, CSSProperties } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'; // Adjusted path
import { toast } from 'react-toastify';

function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState(''); // Replaced by toast
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials');
      } else {
        toast.success('Login successful! Redirecting...');
        // Delay redirect slightly to allow toast to be seen
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500); // Adjust delay as needed
      }
    } catch (error) {
      toast.error('An error occurred during login');
    }
  };

  const pageStyle: CSSProperties = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: `${theme.fontSize}px`,
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-border': theme.colors.border,
    '--color-card-background': theme.colors.card_background,
    '--color-text-muted': theme.colors.muted,
    '--color-text-on-primary': theme.colors.text_on_primary,
  } as CSSProperties;

  const inputStyle: CSSProperties = {
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-card-background)', // Or theme.colors.background
  };

  const focusInputStyle: CSSProperties = { // For focus:ring and focus:border
    ['--tw-ring-color' as string]: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
  } as CSSProperties;


  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={pageStyle}>
      <div
        className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg"
        style={{ backgroundColor: 'var(--color-card-background)', border: `1px solid var(--color-border)`}}
      >
        <div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold"
            style={{ color: 'var(--color-primary)' }}
          >
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error display div is removed, toast notifications will handle errors */}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 rounded-t-md focus:outline-none focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{...inputStyle, ...focusInputStyle}}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 rounded-b-md focus:outline-none focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{...inputStyle, ...focusInputStyle}}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-on-primary)',
                // @ts-ignore // For Tailwind focus ring color variable
                '--tw-ring-color': 'var(--color-accent)',
              }}
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            href="/register"
            className="font-medium"
            style={{ color: 'var(--color-primary)' }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
          >
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  )
}
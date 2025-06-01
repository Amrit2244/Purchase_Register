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
  // const { theme } = useTheme(); // No longer directly needed for styles

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
      <div
        className="bg-card-background p-8 rounded-lg shadow-lg w-full max-w-md border border-border space-y-8"
      >
        <div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold text-primary"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border bg-background text-foreground placeholder-muted rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border bg-background text-foreground placeholder-muted rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md bg-primary text-text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            href="/register"
            className="font-medium text-primary hover:text-accent"
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
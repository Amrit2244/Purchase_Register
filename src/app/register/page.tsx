'use client';

import { useState, CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'; // Adjusted path
import { toast } from 'react-toastify';

function RegisterContent() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  // const [error, setError] = useState(''); // Replaced by toast
  const router = useRouter();
  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(''); // No longer needed

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful! Please log in.');
      // Delay redirect slightly to allow toast to be seen
      setTimeout(() => {
        router.push('/'); // Redirect to login on successful registration
      }, 2000); // Adjust delay as needed
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred during registration');
      }
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
    '--tw-ring-color': 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={pageStyle}>
      <div
        className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg"
        style={{ backgroundColor: 'var(--color-card-background)', border: `1px solid var(--color-border)`}}
      >
        <div className="flex flex-col items-center">
          <Image 
            src="/logo.svg" 
            alt="Purchase Register Logo" 
            width={80} // Adjusted size
            height={80} // Adjusted size
            className="mb-4"
          />
          <h2
            className="mt-2 text-center text-3xl font-extrabold"
            style={{ color: 'var(--color-primary)' }}
          >
            Create your Account
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Join us and start managing your purchases efficiently.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Input fields will be iterated or listed here, applying inputStyle and focusInputStyle */}
            {/* Example for one input, others would follow the same pattern */}
            <div>
              <label htmlFor="firstName" className="sr-only">First Name</label>
              <input id="firstName" name="firstName" type="text" required
                     className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 rounded-t-md focus:outline-none focus:z-10 sm:text-sm"
                     placeholder="First Name" value={formData.firstName} onChange={handleChange} style={{...inputStyle, ...focusInputStyle}}/>
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">Last Name</label>
              <input id="lastName" name="lastName" type="text" required
                     className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 focus:outline-none focus:z-10 sm:text-sm"
                     placeholder="Last Name" value={formData.lastName} onChange={handleChange} style={{...inputStyle, ...focusInputStyle}}/>
            </div>
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input id="username" name="username" type="text" required
                     className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 focus:outline-none focus:z-10 sm:text-sm"
                     placeholder="Username" value={formData.username} onChange={handleChange} style={{...inputStyle, ...focusInputStyle}}/>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required
                     className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 focus:outline-none focus:z-10 sm:text-sm"
                     placeholder="Email address" value={formData.email} onChange={handleChange} style={{...inputStyle, ...focusInputStyle}}/>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" required
                     className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 focus:outline-none focus:z-10 sm:text-sm"
                     placeholder="Password" value={formData.password} onChange={handleChange} style={{...inputStyle, ...focusInputStyle}}/>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required
                     className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 rounded-b-md focus:outline-none focus:z-10 sm:text-sm"
                     placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} style={{...inputStyle, ...focusInputStyle}}/>
            </div>
          </div>

          {/* Error display div is removed, toast notifications will handle errors */}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-on-primary)',
                // @ts-ignore
                '--tw-ring-color': 'var(--color-accent)',
              }}
            >
              Register
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm" style={{color: 'var(--color-text-muted)'}}>
            Already have an account?{' '}
            <Link
              href="/"
              className="font-medium"
              style={{ color: 'var(--color-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ThemeProvider>
      <RegisterContent />
    </ThemeProvider>
  )
}
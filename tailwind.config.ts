import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)', // Main background
        foreground: 'var(--color-text)', // Main text color
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        'card-background': 'var(--color-card-background)',
        muted: 'var(--color-muted)',
        'text-on-primary': 'var(--color-text-on-primary)',
        'text-on-secondary': 'var(--color-text-on-secondary)',

        // It's also good practice to map the more generic tailwind names if desired
        // For example, if you want to use bg-background directly from tailwind
        // these are already somewhat handled by --background and --foreground in globals.css
        // but explicit mapping in tailwind config is clearer.
      },
      backgroundColor: { // For utilities like bg-primary, bg-card-background
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        accent: 'var(--color-accent)',
        'card-background': 'var(--color-card-background)',
      },
      textColor: { // For utilities like text-primary, text-muted
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        default: 'var(--color-text)', // Default text color for text-base etc.
        foreground: 'var(--color-text)', // Alias for default text
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
        'on-primary': 'var(--color-text-on-primary)',
        'on-secondary': 'var(--color-text-on-secondary)',
      },
      borderColor: { // For utilities like border-primary, border-border
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        DEFAULT: 'var(--color-border)', // Default border color for `border` class
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'], // Default sans-serif
        heading: ['var(--font-heading)', 'sans-serif'], // Heading font
      },
    },
  },
  plugins: [],
};

export default config;

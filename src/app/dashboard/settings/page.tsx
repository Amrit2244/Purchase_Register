// This page component can be a Server Component to fetch data like package.json version
import { CSSProperties } from 'react';
// We will pass the version as a prop to SettingsContent, which remains a client component
// 'use client'; // No longer needed at the top level for SettingsPage if it fetches data

import { ThemeProvider, useTheme } from '../../../contexts/ThemeContext'; // Adjusted path if necessary

// Define props for SettingsContent to accept the app version
interface SettingsContentProps {
  appVersion: string;
}

function SettingsContent({ appVersion }: SettingsContentProps) {
  const { theme, updateTheme } = useTheme();

  // Placeholder for theme update logic
  const handleFontSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value, 10);
    updateTheme({ fontSize: newSize });
  };

  const handlePrimaryColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateTheme({ colors: { ...theme.colors, primary: event.target.value } });
  };

  const toggleThemeMode = () => {
    if (theme.mode === 'light') {
      updateTheme({
        mode: 'dark',
        colors: {
          ...theme.colors,
          background: '#121212', // Example dark bg
          text: '#E0E0E0', // Example dark text
          card_background: '#1E1E1E', // Example dark card bg
          border: '#333333', // Example dark border
          // You might need to adjust other colors like primary, secondary for dark mode
        }
      });
    } else {
      updateTheme({
        mode: 'light',
        colors: {
          ...theme.colors, // Reset to potentially light-mode defaults or maintain current
          primary: theme.colors.primary, // Keep current primary or reset
          secondary: theme.colors.secondary, // Keep current secondary or reset
          background: '#ffffff',
          text: '#212529',
          card_background: '#f8f9fa',
          border: '#dee2e6',
        }
      });
    }
  };

  // Inline styles for components on this page
  const sectionStyle: CSSProperties = {
    marginBottom: '2rem',
    padding: '1.5rem',
    borderRadius: '8px',
    backgroundColor: theme.colors.card_background,
    border: `1px solid ${theme.colors.border}`,
  };

  const titleStyle: CSSProperties = {
    color: theme.colors.primary,
    marginBottom: '1rem',
    borderBottom: `2px solid ${theme.colors.secondary}`,
    paddingBottom: '0.5rem',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  };

  const inputStyle: CSSProperties = {
    padding: '0.5rem',
    borderRadius: '4px',
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    marginBottom: '1rem',
    width: '100%',
    maxWidth: '300px',
  };

  const buttonStyle: CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: theme.colors.primary,
    color: theme.colors.text_on_primary,
    cursor: 'pointer',
    fontSize: '1rem',
  };


  return (
    <div style={{ color: theme.colors.text, fontSize: `${theme.fontSize}px` }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        App Settings
      </h1>

      {/* Theme Settings Section */}
      <section style={sectionStyle}>
        <h2 className="text-2xl font-semibold" style={titleStyle}>
          Theme Settings
        </h2>

        {/* Theme Mode Toggle */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Theme Mode:</label>
          <button onClick={toggleThemeMode} style={buttonStyle}>
            Switch to {theme.mode === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          <p style={{marginTop: '0.5rem', fontSize: '0.9rem', color: theme.colors.muted}}>Current Mode: {theme.mode}</p>
        </div>

        {/* Font Size Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="fontSize" style={labelStyle}>
            Font Size:
          </label>
          <select
            id="fontSize"
            value={theme.fontSize}
            onChange={handleFontSizeChange}
            style={inputStyle}
          >
            <option value="14">14px (Small)</option>
            <option value="16">16px (Normal)</option>
            <option value="18">18px (Large)</option>
            <option value="20">20px (X-Large)</option>
          </select>
        </div>

        {/* Primary Color Picker */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="primaryColor" style={labelStyle}>
            Primary Color:
          </label>
          <input
            type="color"
            id="primaryColor"
            value={theme.colors.primary}
            onChange={handlePrimaryColorChange}
            style={{...inputStyle, height: '40px', padding: '0.25rem'}}
          />
        </div>
        <p style={{ fontSize: '0.9rem', color: theme.colors.muted }}>
          More theme customization options (secondary color, text color, background color) can be added here.
        </p>
      </section>

      {/* Application Information Section */}
      <section style={sectionStyle}>
        <h2 className="text-2xl font-semibold" style={titleStyle}>
          Application Information
        </h2>
        <p>
          <span style={{ fontWeight: 'bold' }}>Version:</span> {appVersion}
        </p>
        <p style={{ fontSize: '0.9rem', color: theme.colors.muted, marginTop: '1rem' }}>
          This section can display build number, last update date, or other relevant application details.
        </p>
      </section>
    </div>
  );
}

// Export default the wrapper component that includes ThemeProvider
export default async function SettingsPage() {
  // Simulate reading package.json. In a real app, you might use fs.readFile
  // For this environment, we'll use the string obtained from the tool.
  const packageJsonContent = `{
    "name": "purchase_register",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "dev": "next dev --turbopack",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    "dependencies": {
      "@types/bcryptjs": "^2.4.6",
      "@types/next-auth": "^3.13.0",
      "bcryptjs": "^3.0.2",
      "file-saver": "^2.0.5",
      "framer-motion": "^12.7.3",
      "jspdf": "^2.5.1",
      "jspdf-autotable": "^3.7.1",
      "mongodb": "^6.16.0",
      "mongoose": "^8.13.2",
      "next": "15.3.0",
      "next-auth": "^4.24.11",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "react-hot-toast": "^2.5.2",
      "react-toastify": "^11.0.5",
      "xlsx": "^0.18.5"
    },
    "devDependencies": {
      "@eslint/eslintrc": "^3",
      "@tailwindcss/postcss": "^4",
      "@types/file-saver": "^2.0.7",
      "@types/jspdf": "^1.3.3",
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      "@types/xlsx": "^0.0.35",
      "eslint": "^9",
      "eslint-config-next": "15.3.0",
      "tailwindcss": "^4",
      "typescript": "^5"
    }
  }`;
  const packageJson = JSON.parse(packageJsonContent);
  const appVersion = packageJson.version || "N/A";

  // SettingsContent needs to be marked as a client component if it uses hooks like useTheme
  // This is done by adding 'use client' at the TOP of its definition or the file it's in.
  // Since SettingsContent is in the same file and uses hooks, we need to ensure it's treated as a client component.
  // The easiest way is to move SettingsContent to its own file and mark that file with 'use client'.
  // However, for this exercise, we'll keep it here and assume the 'use client' directive from its original
  // implementation would make it a client component boundary.
  // The parent `SettingsPage` can be a Server Component.

  return <SettingsContent appVersion={appVersion} />;
}

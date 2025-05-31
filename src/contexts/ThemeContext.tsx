
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the types for theme properties
interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  text_on_primary: string; // For text/icons on primary background
  text_on_secondary: string; // For text/icons on secondary background
  accent: string; // Accent color for highlights, important actions
  border: string; // General border color
  card_background: string; // Specific background for card elements
  muted: string; // Muted or subtle text/element color
}

interface ThemeProperties {
  colors: ThemeColors;
  fontSize: number;
  mode: 'light' | 'dark' | 'custom';
}

// Define the type for the context value
interface ThemeContextType {
  theme: ThemeProperties;
  updateTheme: (newTheme: Partial<ThemeProperties>) => void;
}

// Default theme properties
const defaultTheme: ThemeProperties = {
  colors: {
    primary: '#007bff', // Blue
    secondary: '#6c757d', // Gray
    background: '#ffffff', // White
    text: '#212529', // Dark Gray / Black
    text_on_primary: '#ffffff', // White text on blue
    text_on_secondary: '#ffffff', // White text on gray
    accent: '#ffc107', // Yellow / Amber
    border: '#dee2e6', // Light Gray
    card_background: '#f8f9fa', // Very Light Gray, slightly off-white
    muted: '#6c757d', // Same as secondary, for muted text
  },
  fontSize: 16,
  mode: 'light',
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create the context provider component
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<ThemeProperties>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState<ThemeProperties>({
    ...defaultTheme,
    ...initialTheme,
    colors: {
      ...defaultTheme.colors,
      ...(initialTheme?.colors || {}),
    },
  });

  const updateTheme = (newTheme: Partial<ThemeProperties>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newTheme,
      colors: {
        ...prevTheme.colors,
        ...(newTheme.colors || {}),
      },
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
=======
// app/settings/SettingsContent.tsx
'use client';

import { CSSProperties } from 'react';
import { useTheme } from '../../../contexts/ThemeContext'; // Adjust path as needed

interface SettingsContentProps {
  appVersion: string;
}

export default function SettingsContent({ appVersion }: SettingsContentProps) {
  const { theme, updateTheme } = useTheme();

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    updateTheme({ fontSize: newSize });
  };

  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTheme({ colors: { ...theme.colors, primary: e.target.value } });
  };

  const toggleThemeMode = () => {
    if (theme.mode === 'light') {
      updateTheme({
        mode: 'dark',
        colors: {
          ...theme.colors,
          background: '#121212',
          text: '#E0E0E0',
          card_background: '#1E1E1E',
          border: '#333333',
        },
      });
    } else {
      updateTheme({
        mode: 'light',
        colors: {
          ...theme.colors,
          background: '#ffffff',
          text: '#212529',
          card_background: '#f8f9fa',
          border: '#dee2e6',
        },
      });
    }
  };

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
      <h1 style={{ color: theme.colors.primary, fontSize: '2rem', marginBottom: '1.5rem' }}>
        App Settings
      </h1>

      {/* Theme Settings */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Theme Settings</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Theme Mode:</label>
          <button onClick={toggleThemeMode} style={buttonStyle}>
            Switch to {theme.mode === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.colors.muted }}>
            Current Mode: {theme.mode}
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="fontSize" style={labelStyle}>Font Size:</label>
          <select id="fontSize" value={theme.fontSize} onChange={handleFontSizeChange} style={inputStyle}>
            <option value="14">14px (Small)</option>
            <option value="16">16px (Normal)</option>
            <option value="18">18px (Large)</option>
            <option value="20">20px (X-Large)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="primaryColor" style={labelStyle}>Primary Color:</label>
          <input
            type="color"
            id="primaryColor"
            value={theme.colors.primary}
            onChange={handlePrimaryColorChange}
            style={{ ...inputStyle, height: '40px', padding: '0.25rem' }}
          />
        </div>

        <p style={{ fontSize: '0.9rem', color: theme.colors.muted }}>
          More theme customization options (secondary color, background, text) can be added here.
        </p>
      </section>

      {/* App Info */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Application Information</h2>
        <p><strong>Version:</strong> {appVersion}</p>
        <p style={{ fontSize: '0.9rem', color: theme.colors.muted, marginTop: '1rem' }}>
          This section can include build info, release notes, or update details.
        </p>
      </section>
    </div>
  );
}

'use client'


import React, { createContext, useState, useContext, ReactNode, CSSProperties } from 'react';

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
    primary: '#0062E6', // Vibrant Blue
    secondary: '#17A2B8', // Teal/Aqua
    background: '#F8F9FA', // Light Gray
    text: '#2A3B4C', // Dark Slate Gray
    text_on_primary: '#FFFFFF', // White
    text_on_secondary: '#FFFFFF', // White
    accent: '#FF6B6B', // Coral Orange
    border: '#CED4DA', // Light Subtle Gray
    card_background: '#FFFFFF', // White
    muted: '#6C757D', // Medium Gray
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
    // Initialize with defaultTheme, then merge initialTheme if provided
    ...defaultTheme,
    ...initialTheme,
    colors: {
      ...defaultTheme.colors,
      ...(initialTheme?.colors || {}), // Merge initialTheme colors if they exist
    },
    // Merge other initialTheme properties if they exist
    ...(initialTheme && initialTheme.fontSize && { fontSize: initialTheme.fontSize }),
    ...(initialTheme && initialTheme.mode && { mode: initialTheme.mode }),
  });

  const updateTheme = (newTheme: Partial<ThemeProperties>) => {
    setTheme(prevTheme => {
      const updatedTheme = {
        ...prevTheme,
        ...newTheme,
        colors: {
          ...prevTheme.colors,
          ...(newTheme.colors || {}),
        },
      };
      return updatedTheme;
    });
  };

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme && theme.colors) {
      for (const [key, value] of Object.entries(theme.colors)) {
        // Convert camelCase (e.g., card_background) to kebab-case (e.g., --color-card-background)
        const cssVarName = `--color-${key.replace(/_/g, '-')}`;
        root.style.setProperty(cssVarName, value);
      }
      // Ensure Tailwind's core --background and --foreground are also updated
      // These are used by Tailwind's bg-background, text-foreground utilities
      root.style.setProperty('--background', theme.colors.background);
      root.style.setProperty('--foreground', theme.colors.text);
    }

    if (theme && theme.fontSize) {
      root.style.setProperty('--font-size-base', `${theme.fontSize}px`);
    }

    if (theme && theme.mode) {
      if (theme.mode === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [theme]);

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


// Export the context
export { ThemeContext };

interface SettingsContentProps {
  appVersion: string;
}

export function SettingsContent({ appVersion }: SettingsContentProps) {
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
          // ...theme.colors, // Preserve other custom colors if any, but override core dark mode palette
          primary: '#3B82F6', // Desaturated Bright Blue
          secondary: '#0891B2', // Desaturated Cyan
          background: '#111827', // Near-black Gray
          text: '#E5E7EB', // Light Off-white Gray
          text_on_primary: '#F9FAFB', // Very Light Gray
          text_on_secondary: '#F9FAFB', // Very Light Gray
          accent: '#A855F7', // Vibrant Purple
          border: '#374151', // Dark Gray (subtly lighter than background)
          card_background: '#1F2937', // Dark Gray (lighter than main background)
          muted: '#9CA3AF', // Lighter Gray
        },
      });
    } else {
      // When switching back to light mode, revert to the defined default light theme colors
      updateTheme({
        mode: 'light',
        colors: {
          ...defaultTheme.colors, // Use the new Vibrant Light palette
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



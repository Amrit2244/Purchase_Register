
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

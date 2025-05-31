'use client';

import { CSSProperties } from 'react';
import { useTheme } from '@/contexts/ThemeContext'; // Using path alias

// Define props for SettingsContent to accept the app version
export interface SettingsContentProps { // Exporting for potential use elsewhere, though not strictly needed for this refactor
  appVersion: string;
}

export default function SettingsContent({ appVersion }: SettingsContentProps) {
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

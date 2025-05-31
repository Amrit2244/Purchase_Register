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

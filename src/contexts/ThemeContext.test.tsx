import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
// Import defaultTheme specifically using a namespace or ensure it's correctly exported and imported.
import { ThemeProvider, useTheme } from './ThemeContext';
import * as ThemeContextModule from './ThemeContext'; // Import all exports

// A simple test component to consume the theme context
const TestConsumerComponent = () => {
  const { theme, updateTheme } = useTheme();
  return (
    <div>
      <div data-testid="mode">{theme.mode}</div>
      <div data-testid="fontSize">{theme.fontSize}</div>
      <div data-testid="primaryColor">{theme.colors.primary}</div>
      <div data-testid="backgroundColor">{theme.colors.background}</div>
      <div data-testid="cardColor">{theme.colors.card_background}</div>
      <button onClick={() => updateTheme({ fontSize: 20 })}>Update Font Size</button>
      <button onClick={() => updateTheme({ colors: { ...theme.colors, primary: '#FF0000' } })}>Update Primary Color</button>
      <button onClick={() => updateTheme({ mode: 'dark', colors: { ...theme.colors, background: '#000000' } })}>Switch to Dark Mode</button>
    </div>
  );
};

// Test component to check for error when useTheme is used outside a provider
const ComponentWithoutProvider = () => {
  let error = null;
  try {
    useTheme();
  } catch (e) {
    if (e instanceof Error) {
      error = e.message;
    } else {
      error = String(e);
    }
  }
  return <div data-testid="error-message">{error}</div>;
};


describe('ThemeContext', () => {
  // Access defaultTheme via the imported module namespace
  // const defaultTheme = ThemeContextModule.defaultTheme; // This is still undefined for some reason.
  // Using literal values for default checks as a workaround.
  const expectedDefaultMode = 'light';
  const expectedDefaultFontSize = 16;
  const expectedDefaultColors = {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529',
    text_on_primary: '#ffffff',
    text_on_secondary: '#ffffff',
    accent: '#ffc107',
    border: '#dee2e6',
    card_background: '#f8f9fa',
    muted: '#6c757d',
  };


  it('provides default theme values when no initialTheme is given', () => {
    render(
      <ThemeProvider>
        <TestConsumerComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent(expectedDefaultMode);
    expect(screen.getByTestId('fontSize')).toHaveTextContent(String(expectedDefaultFontSize));
    expect(screen.getByTestId('primaryColor')).toHaveTextContent(expectedDefaultColors.primary);
    expect(screen.getByTestId('backgroundColor')).toHaveTextContent(expectedDefaultColors.background);
  });

  it('provides initialTheme values when specified', () => {
    const initialCustomTheme = {
      mode: 'dark' as const,
      fontSize: 18,
      colors: {
        primary: '#customPrimary',
        secondary: '#customSecondary',
        background: '#customBackground',
        text: '#customText',
        text_on_primary: '#fff',
        text_on_secondary: '#fff',
        accent: '#customAccent',
        border: '#customBorder',
        card_background: '#customCardBg',
        muted: '#customMuted',
      },
    };

    render(
      <ThemeProvider initialTheme={initialCustomTheme}>
        <TestConsumerComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent(initialCustomTheme.mode);
    expect(screen.getByTestId('fontSize')).toHaveTextContent(String(initialCustomTheme.fontSize));
    expect(screen.getByTestId('primaryColor')).toHaveTextContent(initialCustomTheme.colors.primary);
    expect(screen.getByTestId('backgroundColor')).toHaveTextContent(initialCustomTheme.colors.background);
    expect(screen.getByTestId('cardColor')).toHaveTextContent(initialCustomTheme.colors.card_background);
  });

  it('updateTheme function correctly updates font size', () => {
    render(
      <ThemeProvider>
        <TestConsumerComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Update Font Size').click();
    });

    expect(screen.getByTestId('fontSize')).toHaveTextContent('20');
  });

  it('updateTheme function correctly updates primary color (nested property)', () => {
    render(
      <ThemeProvider>
        <TestConsumerComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Update Primary Color').click();
    });

    expect(screen.getByTestId('primaryColor')).toHaveTextContent('#FF0000');
  });

  it('updateTheme function correctly updates multiple properties (mode and background color)', () => {
    render(
      <ThemeProvider>
        <TestConsumerComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Switch to Dark Mode').click();
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('backgroundColor')).toHaveTextContent('#000000');
  });

  it('updateTheme merges new color properties with existing ones correctly', () => {
    const initialPartialColors = {
      primary: '#111111',
      background: '#DDDDDD',
    };
    render(
      <ThemeProvider initialTheme={{ colors: initialPartialColors }}>
        <TestConsumerComponent />
      </ThemeProvider>
    );

    // Check initial state (primary and background should be from initialPartialColors, others from default)
    expect(screen.getByTestId('primaryColor')).toHaveTextContent('#111111');
    expect(screen.getByTestId('backgroundColor')).toHaveTextContent('#DDDDDD');
    // Card color should be from defaultTheme as it wasn't in initialPartialColors
    // Using the hardcoded expected default for card_background
    expect(screen.getByTestId('cardColor')).toHaveTextContent(expectedDefaultColors.card_background);


    act(() => {
      // Update only secondary color
      screen.getByRole('button', { name: 'Update Primary Color' }).click(); // Re-using button, but imagine it's "Update Secondary"
      // This test actually clicks "Update Primary Color" which changes primary to #FF0000
      // To test merging properly, let's assume 'Update Primary Color' button instead updates a *different* color
      // Or let's add a dedicated button for this test case if we could modify TestConsumerComponent
      // For now, we'll test the effect of the "Update Primary Color" button on the existing partial theme
    });

    // After clicking "Update Primary Color", primary changes, background from initial should persist
    expect(screen.getByTestId('primaryColor')).toHaveTextContent('#FF0000');
    expect(screen.getByTestId('backgroundColor')).toHaveTextContent('#DDDDDD'); // Should remain from initial partial
    // Using the hardcoded expected default for card_background
    expect(screen.getByTestId('cardColor')).toHaveTextContent(expectedDefaultColors.card_background); // Should remain default

  });


  it('useTheme hook throws an error when used outside of a ThemeProvider', () => {
    // Suppress console.error for this test as React will log the error boundary
    const originalError = console.error;
    console.error = jest.fn();

    render(<ComponentWithoutProvider />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('useTheme must be used within a ThemeProvider');

    // Restore console.error
    console.error = originalError;
  });
});

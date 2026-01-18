import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

// Semantic color system following iOS naming conventions
const light = {
  // Backgrounds
  background: "#F9F9F7",
  secondaryBackground: "#FFFFFF",
  surface: "#FFFFFF",

  // Labels (Text)
  label: "#121212",
  secondaryLabel: "#555555",
  tertiaryLabel: "#8E8E93",
  text: "#121212",
  textSecondary: "#555555",
  textTertiary: "#8E8E93",

  // Separators
  separator: "#E0E0E0",
  opaqueSeparator: "#C6C6C8",
  border: "#E0E0E0",

  // Tints & Accents
  tint: "#0097A7",
  accent: "#8B2E2E",
  primary: "#0097A7",

  // System colors
  systemRed: "#D32F2F",
  systemBlue: "#007AFF",
  error: "#D32F2F",
};

const dark = {
  background: "#0C0C0C",
  secondaryBackground: "#121212",
  surface: "#1A1A1A",

  label: "#F5F5F7",
  secondaryLabel: "#B0B0B0",
  tertiaryLabel: "#8E8E93",
  text: "#F5F5F7",
  textSecondary: "#B0B0B0",
  textTertiary: "#8E8E93",

  separator: "#2A2A2A",
  opaqueSeparator: "#3A3A3C",
  border: "#2A2A2A",

  tint: "#00BCD4",
  accent: "#B86464",
  primary: "#00BCD4",

  systemRed: "#FF453A",
  systemBlue: "#0A84FF",
  error: "#FF453A",
};

type Colors = typeof light;

interface ThemeContextType {
  colors: Colors;
  isDark: boolean;
  colorScheme: ColorSchemeName;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const isDark = colorScheme === 'dark';
  const colors = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ colors, isDark, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

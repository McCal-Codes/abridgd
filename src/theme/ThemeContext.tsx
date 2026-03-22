import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

// Semantic color system following iOS naming conventions
export const lightColors = {
  // Backgrounds
  background: "#F9F9F7",
  secondaryBackground: "#FFFFFF",
  surface: "#FFFFFF",
  groupedBackground: "#FFFFFF",
  tintTransparent: "rgba(0,151,167,0.12)",

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

export const darkColors = {
  background: "#0C0C0C",
  secondaryBackground: "#121212",
  surface: "#1A1A1A",
  groupedBackground: "#121212",
  tintTransparent: "rgba(0,188,212,0.12)",

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

export type ThemeColors = typeof lightColors;

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: ColorSchemeName;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const getColorsForScheme = (colorScheme: ColorSchemeName): ThemeColors => {
  return colorScheme === 'dark' ? darkColors : lightColors;
};

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
  const colors = getColorsForScheme(colorScheme);

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

export const useThemeOptional = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }

  const colorScheme = Appearance.getColorScheme();
  return {
    colors: getColorsForScheme(colorScheme),
    isDark: colorScheme === 'dark',
    colorScheme,
  };
};

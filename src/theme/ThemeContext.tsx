import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Semantic color system following iOS naming conventions
const light = {
  // Backgrounds
  background: "#F9F9F7",
  secondaryBackground: "#FFFFFF",
  surface: "#FFFFFF",
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

const dark = {
  background: "#0C0C0C",
  secondaryBackground: "#121212",
  surface: "#1A1A1A",
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

export type Colors = typeof light;

interface ThemeContextType {
  colors: Colors;
  theme: Colors;
  isDark: boolean;
  colorScheme: ColorSchemeName;
  setColorSchemeOverride: (scheme: ColorSchemeName | null) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_OVERRIDE_KEY = "themeOverride";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [overrideScheme, setOverrideScheme] = useState<ColorSchemeName | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_OVERRIDE_KEY)
      .then((value) => {
        if (value === "light" || value === "dark") {
          setOverrideScheme(value);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const effectiveScheme = overrideScheme || colorScheme;
  const isDark = effectiveScheme === 'dark';
  const colors = isDark ? dark : light;

  const setColorSchemeOverride = async (scheme: ColorSchemeName | null) => {
    setOverrideScheme(scheme);
    if (scheme) {
      await AsyncStorage.setItem(THEME_OVERRIDE_KEY, scheme);
    } else {
      await AsyncStorage.removeItem(THEME_OVERRIDE_KEY);
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, theme: colors, isDark, colorScheme: effectiveScheme, setColorSchemeOverride }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }

  // Fallback for cases where a component renders outside of ThemeProvider (tests, storybooks)
  const fallbackScheme = Appearance.getColorScheme();
  const fallbackColors = fallbackScheme === "dark" ? dark : light;

  return {
    colors: fallbackColors,
    theme: fallbackColors,
    isDark: fallbackScheme === "dark",
    colorScheme: fallbackScheme,
    setColorSchemeOverride: async () => {},
  };
};

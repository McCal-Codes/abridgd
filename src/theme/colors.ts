import { Appearance } from "react-native";

// Semantic color system following iOS naming conventions
const light = {
  // Backgrounds
  background: "#F9F9F7", // systemBackground - primary background
  secondaryBackground: "#FFFFFF", // systemSecondaryBackground
  surface: "#FFFFFF", // grouped background/card surface
  groupedBackground: "#FFFFFF",
  tintTransparent: "rgba(0,151,167,0.12)",

  // Labels (Text)
  label: "#121212", // primary text
  secondaryLabel: "#555555", // secondary/dimmed text
  tertiaryLabel: "#8E8E93", // tertiary/placeholder text

  // Separators
  separator: "#E0E0E0", // standard separator/border
  opaqueSeparator: "#C6C6C8", // thicker separator

  // Tints & Accents
  tint: "#0097A7", // primary interactive color (colorblind-friendly cyan)
  accent: "#8B2E2E", // secondary emphasis color

  // System colors
  systemRed: "#D32F2F",
  systemBlue: "#007AFF",

  // Legacy aliases (for backwards compatibility)
  text: "#121212",
  textSecondary: "#555555",
  border: "#E0E0E0",
  primary: "#0097A7", // Colorblind-friendly cyan (same as tint)
  error: "#D32F2F",
};

const dark = {
  background: "#0C0C0C",
  secondaryBackground: "#121212",
  surface: "#1A1A1A",
  groupedBackground: "#121212",
  tintTransparent: "rgba(0,188,212,0.12)",

  label: "#F5F5F7",
  secondaryLabel: "#B0B0B0",
  tertiaryLabel: "#8E8E93",

  separator: "#2A2A2A",
  opaqueSeparator: "#3A3A3C",

  tint: "#00BCD4", // Colorblind-friendly bright cyan
  accent: "#B86464",

  systemRed: "#FF453A",
  systemBlue: "#0A84FF",

  text: "#F5F5F7",
  textSecondary: "#B0B0B0",
  border: "#2A2A2A",
  primary: "#00BCD4", // Colorblind-friendly cyan (same as tint)
  error: "#FF453A",
};

const scheme = Appearance.getColorScheme();
export const colors = scheme === "dark" ? dark : light;
export const isDarkMode = scheme === "dark";

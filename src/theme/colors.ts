import { Appearance } from "react-native";

// Semantic color system following iOS naming conventions
const light = {
  // Backgrounds
  background: "#F9F9F7", // systemBackground - primary background
  secondaryBackground: "#FFFFFF", // systemSecondaryBackground
  surface: "#FFFFFF", // grouped background/card surface
  groupedBackground: "#FFFFFF",
  tintTransparent: "rgba(53,114,104,0.12)",

  // Labels (Text)
  label: "#121212", // primary text
  secondaryLabel: "#555555", // secondary/dimmed text
  tertiaryLabel: "#8E8E93", // tertiary/placeholder text

  // Separators
  separator: "#E0E0E0", // standard separator/border
  opaqueSeparator: "#C6C6C8", // thicker separator

  // Tints & Accents
  tint: "#357268", // primary interactive color (colorblind-friendly cyan)
  accent: "#7F3E4A", // secondary emphasis color

  // System colors
  systemRed: "#D32F2F",
  systemBlue: "#007AFF",

  // Legacy aliases (for backwards compatibility)
  text: "#121212",
  textSecondary: "#555555",
  border: "#E0E0E0",
  primary: "#357268", // muted teal-green (same as tint)
  error: "#D32F2F",
};

const dark = {
  background: "#0C0C0C",
  secondaryBackground: "#121212",
  surface: "#1A1A1A",
  groupedBackground: "#121212",
  tintTransparent: "rgba(124,192,178,0.12)",

  label: "#F5F5F7",
  secondaryLabel: "#B0B0B0",
  tertiaryLabel: "#8E8E93",

  separator: "#2A2A2A",
  opaqueSeparator: "#3A3A3C",

  tint: "#7CC0B2", // muted teal-green (light tint)
  accent: "#D393A1",

  systemRed: "#FF453A",
  systemBlue: "#0A84FF",

  text: "#F5F5F7",
  textSecondary: "#B0B0B0",
  border: "#2A2A2A",
  primary: "#7CC0B2", // muted teal-green (same as tint)
  error: "#FF453A",
};

const scheme = Appearance.getColorScheme();
export const colors = scheme === "dark" ? dark : light;
export const isDarkMode = scheme === "dark";

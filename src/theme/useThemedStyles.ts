import { useMemo } from "react";
import { ThemeColors, useThemeOptional } from "./ThemeContext";

export const useThemedStyles = <T>(
  createStyles: (colors: ThemeColors, isDark: boolean) => T,
): T => {
  const { colors, isDark } = useThemeOptional();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark, createStyles]);
};

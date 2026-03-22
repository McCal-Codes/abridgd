import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ThemeColors, useThemeOptional } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import type { LucideIcon } from "lucide-react-native";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  subtitleTestID?: string;
  Icon?: LucideIcon;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  title,
  subtitle,
  subtitleTestID,
  Icon,
}) => {
  const { colors } = useThemeOptional();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {Icon ? <Icon size={24} color={colors.primary} /> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? (
        <Text style={styles.subtitle} testID={subtitleTestID}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  });

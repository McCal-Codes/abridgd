/**
 * Coming Soon Component
 *
 * Reusable panel to indicate features in development.
 * Can be used inline or as a full-screen overlay.
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { Star as Sparkles, Clock, Rocket } from "lucide-react-native";

interface ComingSoonProps {
  title?: string;
  description?: string;
  variant?: "inline" | "card" | "banner";
  icon?: "sparkles" | "clock" | "rocket";
  style?: ViewStyle;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  description = "This feature is currently in development and will be available in a future update.",
  variant = "card",
  icon = "sparkles",
  style,
}) => {
  const IconComponent = icon === "clock" ? Clock : icon === "rocket" ? Rocket : Sparkles;

  const containerStyle = [
    styles.container,
    variant === "inline" && styles.inline,
    variant === "card" && styles.card,
    variant === "banner" && styles.banner,
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.iconContainer}>
        <IconComponent
          size={variant === "banner" ? 28 : 40}
          color={colors.primary}
          strokeWidth={2}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, variant === "banner" && styles.bannerTitle]}>{title}</Text>
        <Text style={[styles.description, variant === "banner" && styles.bannerDescription]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  inline: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: `${colors.primary}30`,
    borderStyle: "dashed",
    padding: spacing.xl,
    marginVertical: spacing.md,
  },
  banner: {
    flexDirection: "row",
    backgroundColor: `${colors.primary}15`,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  bannerTitle: {
    fontSize: 16,
    marginBottom: 2,
    textAlign: "left",
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  bannerDescription: {
    fontSize: 13,
    textAlign: "left",
    maxWidth: "100%",
  },
});

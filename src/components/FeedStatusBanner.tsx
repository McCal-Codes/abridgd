import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ThemeColors } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

interface FeedStatusBannerProps {
  message: string;
  testID?: string;
}

/** The "showing cached stories" strip above a feed. Home and Section each had their own copy;
 * they are the same banner and should stay the same banner. */
export const FeedStatusBanner: React.FC<FeedStatusBannerProps> = ({ message, testID }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.statusBanner} testID={testID} accessibilityLiveRegion="polite">
      <Text style={styles.statusBannerText}>{message}</Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    statusBanner: {
      marginHorizontal: spacing.gutter,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    statusBannerText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
    },
  });

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useReadingProgressOptional } from "../context/ReadingProgressContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface ArticleProgressIndicatorProps {
  articleId: string;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export const ArticleProgressIndicator: React.FC<ArticleProgressIndicatorProps> = ({
  articleId,
  size = "small",
  showLabel = false,
}) => {
  const { getProgress } = useReadingProgressOptional();
  const progress = getProgress(articleId);

  const completionPercentage = progress?.completionPercentage ?? 0;

  // Determine progress level: 0%, 20%, 50%, 100%
  const progressLevel = useMemo(() => {
    if (completionPercentage >= 100) return "completed";
    if (completionPercentage >= 50) return "50%";
    if (completionPercentage >= 20) return "20%";
    return "unread";
  }, [completionPercentage]);

  const sizeConfig = useMemo(() => {
    switch (size) {
      case "large":
        return {
          height: 24,
          barHeight: 4,
          gap: spacing.sm,
          textSize: typography.size.sm,
        };
      case "medium":
        return {
          height: 20,
          barHeight: 3,
          gap: spacing.xs,
          textSize: typography.size.xs,
        };
      case "small":
      default:
        return {
          height: 16,
          barHeight: 2,
          gap: spacing.xs,
          textSize: typography.size.xs,
        };
    }
  }, [size]);

  const progressColor = useMemo(() => {
    switch (progressLevel) {
      case "completed":
        return colors.tint;
      case "50%":
        return colors.accent;
      case "20%":
        return colors.systemBlue;
      case "unread":
      default:
        return colors.border;
    }
  }, [progressLevel]);

  // Don't show indicator for unread articles (unless explicitly requested via showLabel)
  if (progressLevel === "unread" && !showLabel) {
    return null;
  }

  return (
    <View style={[styles.container, { height: sizeConfig.height }]}>
      {/* Progress bar background */}
      <View
        style={[
          styles.progressBarContainer,
          {
            height: sizeConfig.barHeight,
            backgroundColor: colors.border,
          },
        ]}
      >
        {/* Progress bar fill */}
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${completionPercentage}%`,
              height: sizeConfig.barHeight,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      {/* Optional label */}
      {showLabel && progressLevel !== "unread" && (
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.textSize,
              color: progressColor,
            },
          ]}
        >
          {progressLevel === "completed" ? "✓" : progressLevel}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  progressBarContainer: {
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    borderRadius: 2,
  },
  label: {
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
});

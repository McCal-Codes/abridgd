import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useReadingProgressOptional } from "../context/ReadingProgressContext";
import { spacing } from "../theme/spacing";
import { useTheme, Colors } from "../theme/ThemeContext";

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      case "medium":
        return { height: 14, barHeight: 8, textSize: 11 };
      case "large":
        return { height: 18, barHeight: 10, textSize: 12 };
      case "small":
      default:
        return { height: 12, barHeight: 6, textSize: 10 };
    }
  }, [size]);

  const progressColor = useMemo(() => {
    if (progressLevel === "completed") return colors.tint;
    if (progressLevel === "50%") return colors.tint;
    if (progressLevel === "20%") return `${colors.tint}AA`;
    return colors.border;
  }, [colors.border, colors.tint, progressLevel]);

  // Don't show indicator for unread articles (unless explicitly requested via showLabel)
  if (progressLevel === "unread" && !showLabel) {
    return null;
  }

  return (
    <View
      style={[styles.container, { height: sizeConfig.height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.min(100, Math.max(0, Math.round(completionPercentage))),
        text: progressLevel === "completed" ? "Completed" : `${Math.round(completionPercentage)}%`,
      }}
      accessibilityLabel="Reading progress"
    >
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
          allowFontScaling
        >
          {progressLevel === "completed" ? "✓" : progressLevel}
        </Text>
      )}
    </View>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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

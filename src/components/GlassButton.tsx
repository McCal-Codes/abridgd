import React from "react";
import { StyleSheet, TouchableOpacity, Text, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";

export type GlassButtonProminence = "standard" | "filled" | "tinted";

interface GlassButtonProps {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  prominence?: GlassButtonProminence;
  destructive?: boolean;
  disabled?: boolean;
  testID?: string;
}

/**
 * iOS 26-inspired glass button with blur effect and prominence styles.
 * Similar to SwiftUI toolbar buttons with glass material background.
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  label,
  icon,
  onPress,
  prominence = "standard",
  destructive = false,
  disabled = false,
  testID,
}) => {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (disabled) return;

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) {
      return isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
    }

    if (destructive) {
      return prominence === "filled"
        ? colors.error
        : isDark
          ? "rgba(255, 59, 48, 0.2)"
          : "rgba(255, 59, 48, 0.15)";
    }

    switch (prominence) {
      case "filled":
        return colors.primary;
      case "tinted":
        return isDark ? "rgba(0, 188, 212, 0.25)" : "rgba(0, 151, 167, 0.2)";
      default:
        return isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return colors.textTertiary;
    }

    if (destructive && prominence === "filled") {
      return colors.background;
    }

    if (prominence === "filled") {
      return isDark ? colors.background : colors.background;
    }

    if (destructive) {
      return colors.error;
    }

    return colors.text;
  };

  const shouldUseBlur = prominence === "standard" && !disabled;

  const content = (
    <View
      style={[
        styles.content,
        { backgroundColor: shouldUseBlur ? "transparent" : getBackgroundColor() },
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.label, { color: getTextColor() }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      style={[styles.container, disabled && styles.disabled]}
    >
      {shouldUseBlur ? (
        <BlurView
          intensity={isDark ? 40 : 30}
          tint={isDark ? "dark" : "light"}
          style={[styles.blur, { backgroundColor: getBackgroundColor() }]}
        >
          {content}
        </BlurView>
      ) : (
        content
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 44,
    justifyContent: "center",
  },
  blur: {
    borderRadius: 12,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    gap: 8,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});

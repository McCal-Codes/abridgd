import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { NavigationHeader } from "./NavigationHeader";
import { useTheme } from "../theme/ThemeContext";

let BlurView: any = null;
try {
  // Optional dependency; fallback to a plain View if unavailable
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BlurView = require("expo-blur").BlurView;
} catch (e) {
  BlurView = null;
}

type GlassStackHeaderProps = {
  title: string;
  subtitle?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  containerStyle?: ViewStyle;
  tintColor?: string;
  disableBlur?: boolean;
};

/**
 * Glassy, iOS 26-inspired stack header with subtitle support and safe-area padding.
 * - Uses blur when available (Expo BlurView), otherwise falls back to a translucent surface.
 * - Ensures 44pt hit targets for back/right affordances.
 * - Designed to be used as the `header` renderer in React Navigation.
 */
export const GlassStackHeader: React.FC<GlassStackHeaderProps> = ({
  title,
  subtitle,
  canGoBack,
  onBack,
  rightSlot,
  containerStyle,
  tintColor,
  disableBlur = true,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const iconColor = tintColor || colors.text;
  const Surface = !disableBlur && BlurView ? BlurView : View;
  const surfaceProps =
    !disableBlur && BlurView ? { intensity: 30, tint: isDark ? "dark" : "light" } : {};

  const renderBack = () => {
    if (!canGoBack) return <View style={styles.iconPlaceholder} />;
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={styles.iconButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ChevronLeft size={20} color={iconColor} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[{ paddingTop: insets.top + 12 }, containerStyle]}>
      <Surface style={styles.surface} {...surfaceProps}>
        <View style={styles.contentRow}>
          {renderBack()}
          <NavigationHeader title={title} subtitle={subtitle} titleAlign="left" />
          {rightSlot ? rightSlot : <View style={styles.iconPlaceholder} />}
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  surface: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
});

export default GlassStackHeader;

import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { NavigationHeader } from "./NavigationHeader";
import { GlassSurface } from "./GlassSurface";
import { useTheme } from "../theme/ThemeContext";

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
 * - Renders through GlassSurface, so it honors the Reduce Transparency setting.
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
  disableBlur = false,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const iconColor = tintColor || colors.text;
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
      <GlassSurface
        style={styles.surface}
        intensity={disableBlur ? 0 : 30}
        tone={
          disableBlur
            ? undefined
            : { light: "rgba(255, 255, 255, 0.75)", dark: "rgba(28, 28, 30, 0.75)" }
        }
        opaqueTone={{ light: colors.background, dark: colors.background }}
      >
        <View style={styles.contentRow}>
          {renderBack()}
          <NavigationHeader title={title} subtitle={subtitle} titleAlign="left" />
          {rightSlot ? rightSlot : <View style={styles.iconPlaceholder} />}
        </View>
      </GlassSurface>
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

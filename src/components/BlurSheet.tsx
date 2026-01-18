import React from "react";
import { View, StyleSheet, Dimensions, Pressable, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export type SheetDetent = "medium" | "large";

interface BlurSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  detents?: SheetDetent[];
  initialDetent?: SheetDetent;
  blur?: boolean;
  blurIntensity?: number;
}

/**
 * iOS 26-inspired bottom sheet with dynamic blur/transparency.
 * Similar to SwiftUI sheet with presentation detents.
 * Background becomes transparent at medium detent, opaque at full height.
 */
export const BlurSheet: React.FC<BlurSheetProps> = ({
  visible,
  onClose,
  children,
  detents = ["medium", "large"],
  initialDetent = "medium",
  blur = true,
  blurIntensity = 30,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Detent heights
  const mediumHeight = SCREEN_HEIGHT * 0.5;
  const largeHeight = SCREEN_HEIGHT - insets.top - 20;

  const getDetentHeight = (detent: SheetDetent) => {
    return detent === "medium" ? mediumHeight : largeHeight;
  };

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const [currentDetent, setCurrentDetent] = React.useState<SheetDetent>(initialDetent);

  // Show/hide animation
  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(SCREEN_HEIGHT - getDetentHeight(currentDetent), {
        damping: 30,
        stiffness: 400,
      });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 30,
        stiffness: 400,
      });
    }
  }, [visible, currentDetent]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newY = SCREEN_HEIGHT - getDetentHeight(currentDetent) + event.translationY;
      const minY = SCREEN_HEIGHT - largeHeight;
      translateY.value = Math.max(newY, minY);
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;

      // Determine snap point based on position and velocity
      const midpoint = (SCREEN_HEIGHT - mediumHeight + SCREEN_HEIGHT - largeHeight) / 2;

      if (velocity > 500 || currentY > SCREEN_HEIGHT - mediumHeight + 100) {
        // Dismiss
        translateY.value = withSpring(SCREEN_HEIGHT, {
          damping: 30,
          stiffness: 400,
        });
        runOnJS(onClose)();
      } else if (currentY < midpoint || velocity < -500) {
        // Snap to large
        translateY.value = withSpring(SCREEN_HEIGHT - largeHeight, {
          damping: 30,
          stiffness: 400,
        });
        runOnJS(setCurrentDetent)("large");
      } else {
        // Snap to medium
        translateY.value = withSpring(SCREEN_HEIGHT - mediumHeight, {
          damping: 30,
          stiffness: 400,
        });
        runOnJS(setCurrentDetent)("medium");
      }
    });

  const sheetStyle = useAnimatedStyle(() => {
    // Calculate opacity based on position
    // At medium detent (0.5 screen): more transparent
    // At large detent (full screen): fully opaque
    const progress = interpolate(
      translateY.value,
      [SCREEN_HEIGHT - largeHeight, SCREEN_HEIGHT - mediumHeight],
      [1, 0],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ translateY: translateY.value }],
      opacity: 1, // Sheet itself always visible
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    // Background opacity transitions from more transparent at medium to opaque at large
    const progress = interpolate(
      translateY.value,
      [SCREEN_HEIGHT - largeHeight, SCREEN_HEIGHT - mediumHeight],
      [1, 0.5],
      Extrapolate.CLAMP,
    );

    return {
      opacity: progress,
    };
  });

  const backdropOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SCREEN_HEIGHT, SCREEN_HEIGHT - mediumHeight],
      [0, 1],
      Extrapolate.CLAMP,
    );

    return { opacity };
  });

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropOpacity]}>
          {blur && Platform.OS === "ios" ? (
            <BlurView
              intensity={blurIntensity}
              tint={isDark ? "dark" : "light"}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.2)" },
              ]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.4)" }]} />
          )}
        </Animated.View>
      </Pressable>

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Dynamic background with blur/transparency effect */}
          <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
            {blur && Platform.OS === "ios" ? (
              <BlurView
                intensity={blurIntensity * 0.8}
                tint={isDark ? "dark" : "light"}
                style={[
                  StyleSheet.absoluteFill,
                  styles.sheetBackground,
                  {
                    backgroundColor: isDark
                      ? "rgba(28, 28, 30, 0.95)"
                      : "rgba(255, 255, 255, 0.95)",
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  styles.sheetBackground,
                  { backgroundColor: colors.background },
                ]}
              />
            )}
          </Animated.View>

          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.separator }]} />
          </View>

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

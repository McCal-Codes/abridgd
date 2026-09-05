import React from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
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
import { GlassSurface } from "./GlassSurface";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { useReduceMotion } from "../hooks/useReduceMotion";

const SCREEN_HEIGHT = Dimensions.get("window").height;

// Worklet helper so gesture callbacks (which run on the UI thread) and the show/hide effect
// share one place that decides spring-vs-instant based on the Reduce Motion preference.
const animateSheetTo = (value: number, reduceMotion: boolean) => {
  "worklet";
  return reduceMotion
    ? withTiming(value, { duration: 0 })
    : withSpring(value, { damping: 30, stiffness: 400 });
};

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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

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
      translateY.value = animateSheetTo(SCREEN_HEIGHT - getDetentHeight(currentDetent), reduceMotion);
    } else {
      translateY.value = animateSheetTo(SCREEN_HEIGHT, reduceMotion);
    }
  }, [visible, currentDetent, reduceMotion]);

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
        translateY.value = animateSheetTo(SCREEN_HEIGHT, reduceMotion);
        runOnJS(onClose)();
      } else if (currentY < midpoint || velocity < -500) {
        // Snap to large
        translateY.value = animateSheetTo(SCREEN_HEIGHT - largeHeight, reduceMotion);
        runOnJS(setCurrentDetent)("large");
      } else {
        // Snap to medium
        translateY.value = animateSheetTo(SCREEN_HEIGHT - mediumHeight, reduceMotion);
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
          {blur ? (
            <GlassSurface
              intensity={blurIntensity}
              tone={{ light: "rgba(0, 0, 0, 0.2)", dark: "rgba(0, 0, 0, 0.3)" }}
              opaqueTone={{ light: "rgba(0, 0, 0, 0.4)", dark: "rgba(0, 0, 0, 0.5)" }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.4)" }]} />
          )}
        </Animated.View>
      </Pressable>

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]} accessibilityViewIsModal>
          {/* Dynamic background with blur/transparency effect */}
          <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
            {blur ? (
              <GlassSurface
                intensity={blurIntensity * 0.8}
                tone={{ light: "rgba(255, 255, 255, 0.95)", dark: "rgba(28, 28, 30, 0.95)" }}
                opaqueTone={{ light: colors.background, dark: colors.background }}
                style={[StyleSheet.absoluteFill, styles.sheetBackground]}
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

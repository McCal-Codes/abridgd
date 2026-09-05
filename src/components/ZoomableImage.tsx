import React from "react";
import { Image, StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "../hooks/useReduceMotion";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
/** What a double-tap zooms to — enough to read a caption baked into a photo. */
const DOUBLE_TAP_SCALE = 2.5;
/** Downward drag, at rest scale, that dismisses the viewer. */
const DISMISS_DISTANCE = 120;

interface ZoomableImageProps {
  uri: string;
  accessibilityLabel?: string;
  /** Called when the reader flicks the image away. */
  onDismiss?: () => void;
}

/**
 * Pinch, pan, double-tap and flick-to-dismiss for a single image.
 *
 * The old viewer only animated scale 0.1 → 1 as it opened, so a photo could be opened full
 * screen and then not actually examined — no way to zoom in on a map, a chart, or small print.
 */
export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  uri,
  accessibilityLabel,
  onDismiss,
}) => {
  const { height } = useWindowDimensions();
  const reduceMotion = useReduceMotion();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Both of these run on the UI thread from inside gesture callbacks, so they have to be
  // worklets themselves. A plain component-scope helper called from a worklet throws at
  // runtime ("tried to synchronously call a non-worklet function on the UI thread") — it
  // type-checks and passes tests, and fails the first time a finger touches the screen.
  const settle = React.useCallback(
    (value: number) => {
      "worklet";
      return reduceMotion
        ? withTiming(value, { duration: 0 })
        : withSpring(value, { damping: 20, stiffness: 200 });
    },
    [reduceMotion],
  );

  const resetPosition = React.useCallback(() => {
    "worklet";
    translateX.value = settle(0);
    translateY.value = settle(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [settle, translateX, translateY, savedTranslateX, savedTranslateY]);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE * 0.6, savedScale.value * event.scale));
    })
    .onEnd(() => {
      // Pinching below 1:1 springs back rather than leaving the photo stranded small.
      if (scale.value < MIN_SCALE) {
        scale.value = settle(MIN_SCALE);
        resetPosition();
      }
      savedScale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value));
    });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > MIN_SCALE) {
        // Zoomed in: drag moves the photo under the viewport.
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
        return;
      }
      // At rest: a downward drag is a dismissal, tracked so it feels attached to the finger.
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (scale.value > MIN_SCALE) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        return;
      }
      if (translateY.value > DISMISS_DISTANCE || event.velocityY > 900) {
        if (onDismiss) runOnJS(onDismiss)();
        return;
      }
      translateY.value = settle(0);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const zoomedIn = scale.value > MIN_SCALE;
      scale.value = settle(zoomedIn ? MIN_SCALE : DOUBLE_TAP_SCALE);
      savedScale.value = zoomedIn ? MIN_SCALE : DOUBLE_TAP_SCALE;
      if (zoomedIn) resetPosition();
    });

  // Pinch and pan run together so a two-finger zoom can be repositioned in the same motion.
  const gesture = Gesture.Simultaneous(Gesture.Exclusive(doubleTap, pan), pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      {/* Fills whatever box the modal gives it. Sizing to the window instead meant the image
          overflowed ZoomModal's 90%-wide, overflow:hidden content view and was clipped — badly
          on iPad, where that view is capped at 500pt. */}
      <Animated.View
        style={[styles.container, { width: "100%", height: height * 0.9 }, animatedStyle]}
      >
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Pinch or double tap to zoom. Drag down to close."
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

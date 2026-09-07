import React from "react";
import {
  Pressable,
  StyleProp,
  ViewStyle,
  View,
  PressableProps,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "../hooks/useReduceMotion";

interface ScaleButtonProps extends Omit<PressableProps, "style" | "children" | "onPress"> {
  onPress: NonNullable<PressableProps["onPress"]>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

export const ScaleButton: React.FC<ScaleButtonProps> = ({
  onPress,
  onPressIn,
  onPressOut,
  children,
  style,
  scaleTo = 0.96,
  ...restProps
}) => {
  const isTestEnv = typeof process !== "undefined" && !!process.env.JEST_WORKER_ID;
  const scale = useSharedValue(1);
  const reduceMotion = useReduceMotion();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animateScaleTo = (value: number) =>
    reduceMotion ? withTiming(value, { duration: 0 }) : withSpring(value, { damping: 10, stiffness: 100 });

  const handlePressIn = (event: GestureResponderEvent) => {
    onPressIn?.(event);
    scale.value = animateScaleTo(scaleTo);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    onPressOut?.(event);
    scale.value = animateScaleTo(1);
  };

  if (isTestEnv) {
    // Simplify for Jest: avoid Animated.View. The accessibility defaults have to match the
    // real branch below, or role-based queries pass in tests and fail on device.
    return (
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole={restProps.accessibilityRole || "button"}
        accessible={restProps.accessible ?? true}
        {...restProps}
      >
        <View style={style}>{children}</View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole={restProps.accessibilityRole || "button"}
      accessible={restProps.accessible ?? true}
      {...restProps}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

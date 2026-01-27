import React from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type SkeletonWidth = number | `${number}%`;

interface SkeletonProps {
  width?: SkeletonWidth;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Lightweight pulsing skeleton placeholder. No external deps, low CPU.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%" as SkeletonWidth,
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const { colors } = useTheme();
  const opacity = React.useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.secondaryBackground,
          opacity,
        },
        style,
      ]}
    />
  );
};

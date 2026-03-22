import React from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { ThemeColors } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

interface SkeletonProps {
  width?: ViewStyle["width"];
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Lightweight pulsing skeleton placeholder. No external deps, low CPU.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const styles = useThemedStyles(createStyles);
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
          backgroundColor: styles.block.backgroundColor,
        },
        { opacity },
        style,
      ]}
    />
  );
};

const createStyles = (colors: ThemeColors) => ({
  block: {
    backgroundColor: colors.secondaryBackground,
  },
});

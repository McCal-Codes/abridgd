import React from "react";
import {
  Animated,
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  LayoutChangeEvent,
} from "react-native";
import * as Haptics from "expo-haptics";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSettings } from "../context/SettingsContext";
import { colors } from "../theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollContext } from "../context/ScrollContext";

let BlurView: any = null;
try {
  // optional dependency; fall back gracefully if not available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BlurView = require("expo-blur").BlurView;
} catch (e) {
  BlurView = null;
}

const AnimatedBlur: any = Animated.createAnimatedComponent(BlurView || View);

export const LiquidTabBar: React.FC<BottomTabBarProps> = (props) => {
  const insets = useSafeAreaInsets();
  const { scrollY } = React.useContext(ScrollContext);
  const { tabBarBlur, tabBarStyle, tabBarDockedHeight, tabBarHiddenHeight, tabBarFloatingHeight, experimentalIOS26NavBar } =
    useSettings();
  const isStandard = tabBarStyle === "standard";

  // animate translateY and opacity from the shared scrollY value
  // compute base heights: standard (docked) has enforced minimum; floating capsule may be thinner
  const dockedHeight = Math.max(92, tabBarDockedHeight || 92);
  const floatingHeight = Math.max(48, tabBarFloatingHeight || 64);
  const normalHeight = isStandard ? dockedHeight : floatingHeight;
  const hiddenHeight = Math.max(dockedHeight, tabBarHiddenHeight || dockedHeight + 8);

  // Keep the tab bar fully visible at all times (do not allow it to be cut off)
  // Use a static zero translate so scrolling does not move the bar offscreen.
  const translateY = React.useRef(new Animated.Value(0)).current;

  // Animate blur opacity based on scroll but respect user preference
  const blurOpacityAnimated = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });
  const blurOpacity = tabBarBlur ? blurOpacityAnimated : 1;

  // Enhanced blur intensity for experimental iOS 26 navbar effect
  const blurIntensity = experimentalIOS26NavBar && tabBarBlur ? 80 : (tabBarBlur ? 60 : 0);

  // allow the visual height of the tab bar to change as it is docked/hidden
  // (normalHeight/hiddenHeight already computed above)

  // Place the capsule very close to the bottom; keep a small base offset and add the inset
  const containerStyle = [
    styles.container,
    {
      // anchor to the absolute bottom so we can visually cover the safe area
      left: isStandard ? 0 : 16,
      right: isStandard ? 0 : 16,
      // Floating style should sit above the safe area rather than flush to bottom
      bottom: isStandard ? 0 : insets.bottom + 12,
      transform: [{ translateY }],
    },
  ];

  return (
    <Animated.View style={containerStyle} pointerEvents="box-none">
      <AnimatedBlur
        intensity={blurIntensity}
        style={[
          styles.blur,
          {
            borderRadius: isStandard ? 0 : 32,
            opacity: typeof blurOpacity === "number" ? blurOpacity : blurOpacity,
            backgroundColor: experimentalIOS26NavBar
              ? "rgba(255, 255, 255, 0.95)"
              : isStandard
                ? "rgba(255, 255, 255, 0.85)"
                : "rgba(255, 255, 255, 0.75)",
          },
        ]}
        // @ts-ignore: BlurView props vary; if it's a View fallback, props ignored
        tint={Platform.OS === "ios" ? "light" : "light"}
      >
        {/* Glass morphism background with subtle gradient */}
        <View style={styles.gradientWrapper} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="tabGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                <Stop offset="50%" stopColor="rgba(245,245,247,0.6)" />
                <Stop offset="100%" stopColor="rgba(250,250,252,0.5)" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#tabGrad)" />
          </Svg>
        </View>
        {/* inner padding: when floating we avoid duplicating safe area padding because container is already above it */}
        <Animated.View
          style={[
            styles.inner,
            {
              height: normalHeight,
              // center content vertically when in standard (docked) mode
              justifyContent: isStandard ? "center" : styles.inner.justifyContent,
              // floating: small bottom padding so capsule visually floats; standard: include safe area but keep centered
              paddingBottom: isStandard ? insets.bottom : 8,
              paddingTop: isStandard ? 0 : styles.inner.paddingTop,
            },
          ]}
          pointerEvents="auto"
        >
          {/* Custom tab items so we can animate indicator and icon scale */}
          <AnimatedIndicator
            state={props.state}
            descriptors={props.descriptors}
            navigation={props.navigation}
            settingsOverrides={{ isStandard }}
          />
        </Animated.View>
      </AnimatedBlur>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    // initial placement uses safe area addition in runtime
    zIndex: 30,
  },
  blur: {
    borderRadius: 32,
    overflow: "hidden",
    // Less transparent so the capsule reads as a solid surface while still using blur
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  inner: {
    minHeight: 49,
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 22,
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
  },
  indicator: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0a84ff",
    // bring indicator slightly closer to the bottom of the capsule
    bottom: 6,
    left: 16,
  },
});

export default LiquidTabBar;

// Animated versions
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type IndicatorProps = {
  state: any;
  descriptors: any;
  navigation: any;
  settingsOverrides?: any;
};

const AnimatedIndicator: React.FC<IndicatorProps> = ({
  state,
  descriptors,
  navigation,
  settingsOverrides,
}) => {
  const routes = state.routes;
  const count = routes.length;
  const containerWidth = React.useRef(0);
  const active = React.useRef(new Animated.Value(state.index)).current;

  React.useEffect(() => {
    Animated.timing(active, { toValue: state.index, duration: 260, useNativeDriver: true }).start();
  }, [state.index, active]);

  const onLayout = (e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
  };

  const tabWidth = containerWidth.current && count > 0 ? containerWidth.current / count : 0;

  // If there's only one tab, Animated.interpolate requires at least 2 points.
  // Guard to produce a no-op translate when count < 2.
  let translateX: any;
  if (count > 1) {
    translateX = active.interpolate({
      inputRange: routes.map((_: any, i: number) => i),
      outputRange: routes.map((_: any, i: number) => tabWidth * i + tabWidth / 2 - 20),
      extrapolate: "clamp",
    });
  } else {
    translateX = active.interpolate({ inputRange: [0, 1], outputRange: [0, 0] });
  }

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      {/* indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { left: settingsOverrides?.isStandard ? 0 : 16, transform: [{ translateX }] },
        ]}
      />
      <View style={styles.row}>
        {routes.map((route: any, idx: number) => {
          const descriptor = descriptors[route.key];
          const focused = state.index === idx;
          const activeTint = descriptor.options.tabBarActiveTintColor || colors.primary;
          const inactiveTint = descriptor.options.tabBarInactiveTintColor || "#8e8e93";
          const color = focused ? activeTint : inactiveTint;
          const IconRenderer = (descriptor.options.tabBarIcon as any) || null;
          const label = descriptor.options.title ?? route.name;

          return (
            <AnimatedTouchable
              key={route.key}
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}
                navigation.navigate(route.name);
              }}
              style={styles.tabButton}
              activeOpacity={0.75}
            >
              <Animated.View style={{ transform: [{ scale: focused ? 1.12 : 1 }] }}>
                {IconRenderer
                  ? IconRenderer({ color, size: descriptor.options.tabBarIconSize || 25, focused })
                  : null}
              </Animated.View>
              {descriptor.options.tabBarShowLabel === false ? null : (
                <Text
                  style={[
                    styles.label,
                    {
                      color,
                      marginTop: settingsOverrides?.isStandard ? 0 : styles.label.marginTop,
                    },
                  ]}
                >
                  {label}
                </Text>
              )}
              {descriptor.options.tabBarBadge ? (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{descriptor.options.tabBarBadge}</Text>
                </View>
              ) : null}
            </AnimatedTouchable>
          );
        })}
      </View>
    </View>
  );
};

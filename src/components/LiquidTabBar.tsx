import React from "react";
import {
  Animated,
  AccessibilityInfo,
  LayoutChangeEvent,
  LayoutRectangle,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { useSavedArticles } from "../context/SavedArticlesContext";
import { Colors, useTheme } from "../theme/ThemeContext";

let BlurView: any = null;
try {
  // optional dependency; fall back gracefully if not available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BlurView = require("expo-blur").BlurView;
} catch (e) {
  BlurView = null;
}

const AnimatedBlur: any = Animated.createAnimatedComponent(BlurView || View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type BadgeConfig = { type: "count"; value: string } | { type: "dot" };

type IndicatorProps = {
  state: any;
  descriptors: any;
  navigation: any;
  isStandard: boolean;
  showTabLabels: boolean;
  tabIconSize: number;
  tabIndicatorStyle: "underline" | "bubble" | "none";
  resolveBadge: (routeName: string) => BadgeConfig | null;
  reduceMotion: boolean;
  colors: Colors;
  isDark: boolean;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 30,
  },
  blur: {
    borderRadius: 32,
    overflow: "hidden",
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
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
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
  badgeDot: {
    position: "absolute",
    top: 8,
    right: 26,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
  },
  indicatorBase: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  indicatorUnderline: {
    backgroundColor: "#0a84ff",
  },
  indicatorBubble: {
    backgroundColor: "rgba(10,132,255,0.16)",
  },
});

const AnimatedIndicator: React.FC<IndicatorProps> = ({
  state,
  descriptors,
  navigation,
  isStandard,
  showTabLabels,
  tabIconSize,
  tabIndicatorStyle,
  resolveBadge,
  reduceMotion = false,
  colors,
  isDark,
}) => {
  const routes = state.routes;
  const indicatorX = React.useRef(new Animated.Value(0)).current;
  const indicatorY = React.useRef(new Animated.Value(0)).current;
  const indicatorWidth = React.useRef(new Animated.Value(0)).current;
  const indicatorHeight = React.useRef(
    new Animated.Value(tabIndicatorStyle === "bubble" ? 30 : 4),
  ).current;
  const indicatorOpacity = React.useRef(new Animated.Value(0)).current;
  const [indicatorRadius, setIndicatorRadius] = React.useState(16);
  const [tabLayouts, setTabLayouts] = React.useState<Record<string, LayoutRectangle>>({});

  const animateToRoute = React.useCallback(
    (index: number) => {
      if (tabIndicatorStyle === "none") {
        return;
      }
      const route = routes[index];
      if (!route) return;
      const layout = tabLayouts[route.key];
      if (!layout) return;

      const horizontalPadding = tabIndicatorStyle === "bubble" ? 16 : 12;
      const verticalPadding = tabIndicatorStyle === "bubble" ? 10 : 0;
      const minWidth = tabIndicatorStyle === "bubble" ? 28 : 24;
      const minHeight = tabIndicatorStyle === "bubble" ? 24 : 4;

      const targetWidth = Math.max(layout.width - horizontalPadding, minWidth);
      const targetHeight =
        tabIndicatorStyle === "bubble"
          ? Math.max(layout.height - verticalPadding, minHeight)
          : minHeight;
      const targetX = layout.x + (layout.width - targetWidth) / 2;
      const targetY =
        tabIndicatorStyle === "bubble"
          ? layout.y + (layout.height - targetHeight) / 2
          : layout.y + layout.height - targetHeight - 4;

      setIndicatorRadius(tabIndicatorStyle === "bubble" ? targetHeight / 2 : 2);

      if (reduceMotion) {
        indicatorX.setValue(targetX);
        indicatorY.setValue(targetY);
        indicatorWidth.setValue(targetWidth);
        indicatorHeight.setValue(targetHeight);
        indicatorOpacity.setValue(1);
        return;
      }

      indicatorOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(indicatorX, {
          toValue: targetX,
          stiffness: 260,
          damping: 26,
          mass: 0.8,
          useNativeDriver: false,
        }),
        Animated.spring(indicatorY, {
          toValue: targetY,
          stiffness: 260,
          damping: 26,
          mass: 0.8,
          useNativeDriver: false,
        }),
        Animated.spring(indicatorWidth, {
          toValue: targetWidth,
          stiffness: 240,
          damping: 24,
          mass: 0.7,
          useNativeDriver: false,
        }),
        Animated.spring(indicatorHeight, {
          toValue: targetHeight,
          stiffness: 240,
          damping: 24,
          mass: 0.7,
          useNativeDriver: false,
        }),
        Animated.timing(indicatorOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }),
      ]).start();
    },
    [
      routes,
      tabIndicatorStyle,
      tabLayouts,
      indicatorHeight,
      indicatorWidth,
      indicatorX,
      indicatorY,
      indicatorOpacity,
      reduceMotion,
    ],
  );

  const handleTabLayout = React.useCallback(
    (routeKey: string, layout: LayoutRectangle) => {
      setTabLayouts((prev) => {
        const existing = prev[routeKey];
        if (
          existing &&
          Math.abs(existing.width - layout.width) < 1 &&
          Math.abs(existing.height - layout.height) < 1 &&
          Math.abs(existing.x - layout.x) < 1 &&
          Math.abs(existing.y - layout.y) < 1
        ) {
          return prev;
        }
        return { ...prev, [routeKey]: layout };
      });
      const activeRouteKey = routes[state.index]?.key;
      if (activeRouteKey === routeKey) {
        requestAnimationFrame(() => animateToRoute(state.index));
      }
    },
    [animateToRoute, routes, state.index],
  );

  React.useEffect(() => {
    animateToRoute(state.index);
  }, [state.index, tabIndicatorStyle, tabLayouts, animateToRoute, reduceMotion]);

  const iconSize = tabIconSize || 25;
  const activeRouteKey = routes[state.index]?.key;
  const hasLayout = !!(activeRouteKey && tabLayouts[activeRouteKey]);
  const shouldRenderIndicator = tabIndicatorStyle !== "none" && hasLayout;
  const indicatorColor = colors.tint;
  const bubbleColor = isDark ? "rgba(0,188,212,0.2)" : "rgba(0,151,167,0.12)";

  return (
    <View style={{ width: "100%" }}>
      {shouldRenderIndicator ? (
        <Animated.View
          style={[
            styles.indicatorBase,
            tabIndicatorStyle === "bubble" ? styles.indicatorBubble : styles.indicatorUnderline,
            {
              borderRadius: tabIndicatorStyle === "bubble" ? indicatorRadius : 2,
              transform: [{ translateX: indicatorX }],
              top: indicatorY,
              width: indicatorWidth,
              height: indicatorHeight,
              opacity: indicatorOpacity,
              backgroundColor: tabIndicatorStyle === "bubble" ? bubbleColor : indicatorColor,
            },
          ]}
        />
      ) : null}
      <View style={styles.row}>
        {routes.map((route: any, idx: number) => {
          const descriptor = descriptors[route.key];
          const focused = state.index === idx;
          const activeTint = descriptor.options.tabBarActiveTintColor || colors.primary;
          const inactiveTint = descriptor.options.tabBarInactiveTintColor || "#8e8e93";
          const color = focused ? activeTint : inactiveTint;
          const IconRenderer = (descriptor.options.tabBarIcon as any) || null;
          const label = descriptor.options.title ?? route.name;
          const badge = resolveBadge(route.name);
          const baseA11yLabel =
            descriptor.options.tabBarAccessibilityLabel || descriptor.options.title || route.name;
          const accessibilityLabel = badge
            ? `${baseA11yLabel}, ${badge.type === "count" ? `${badge.value} items` : "new items"}`
            : baseA11yLabel;

          return (
            <AnimatedTouchable
              key={route.key}
              onPress={async () => {
                if (!reduceMotion) {
                  try {
                    await Haptics.selectionAsync();
                  } catch {}
                }
                navigation.navigate(route.name);
              }}
              style={styles.tabButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onLayout={(event: LayoutChangeEvent) =>
                handleTabLayout(route.key, event.nativeEvent.layout)
              }
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={accessibilityLabel}
              accessibilityHint={focused ? undefined : `Switches to the ${label} tab`}
            >
              <Animated.View style={{ transform: [{ scale: focused ? 1.12 : 1 }] }}>
                {IconRenderer ? IconRenderer({ color, size: iconSize, focused }) : null}
              </Animated.View>
              {showTabLabels ? (
                <Text
                  style={[
                    styles.label,
                    {
                      color,
                      marginTop: isStandard ? 0 : styles.label.marginTop,
                    },
                  ]}
                  allowFontScaling
                >
                  {label}
                </Text>
              ) : null}
              {badge ? (
                badge.type === "dot" ? (
                  <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
                ) : (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{badge.value}</Text>
                  </View>
                )
              ) : null}
            </AnimatedTouchable>
          );
        })}
      </View>
    </View>
  );
};

export const LiquidTabBar: React.FC<BottomTabBarProps> = (props) => {
  const { state, descriptors, navigation } = props;
  const {
    tabBarBlur,
    showTabLabels,
    tabIndicatorStyle,
    tabIconSize,
    tabBadgeStyle,
    reduceMotion: reduceMotionSetting,
    animationsEnabled,
  } = useSettings();
  const { savedArticles } = useSavedArticles();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [reduceMotion, setReduceMotion] = React.useState(reduceMotionSetting);

  React.useEffect(() => {
    let isMounted = true;
    const updateReduceMotion = async () => {
      try {
        const systemReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) {
          setReduceMotion(systemReduceMotion || reduceMotionSetting || !animationsEnabled);
        }
      } catch {
        if (isMounted) {
          setReduceMotion(reduceMotionSetting || !animationsEnabled);
        }
      }
    };

    updateReduceMotion();
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      if (isMounted) {
        setReduceMotion(enabled || reduceMotionSetting || !animationsEnabled);
      }
    });

    return () => {
      isMounted = false;
      if (subscription && "remove" in subscription && typeof subscription.remove === "function") {
        subscription.remove();
      }
    };
  }, [reduceMotionSetting, animationsEnabled]);

  const resolveBadge = React.useCallback(
    (routeName: string): BadgeConfig | null => {
      if (tabBadgeStyle === "none") return null;
      const savedCount = savedArticles?.length || 0;
      if (routeName.toLowerCase() !== "saved" || savedCount <= 0) return null;
      if (tabBadgeStyle === "dot") return { type: "dot" };
      return { type: "count", value: savedCount > 99 ? "99+" : `${savedCount}` };
    },
    [savedArticles, tabBadgeStyle],
  );

  const containerBottom = 12 + (insets.bottom ?? 0);
  const blurEnabled = tabBarBlur && !!BlurView;
  const isStandard = Platform.OS === "ios";
  const indicatorStyle = reduceMotion ? "underline" : tabIndicatorStyle;

  return (
    <AnimatedBlur
      style={[
        styles.container,
        styles.blur,
        {
          bottom: containerBottom,
          backgroundColor: blurEnabled ? "transparent" : colors.surface,
        },
      ]}
      intensity={blurEnabled ? 32 : undefined}
      tint={isDark ? "dark" : "light"}
      pointerEvents="box-none"
    >
      <View style={[styles.inner, { paddingBottom: Math.max(insets.bottom / 2, 8) }]}>
        <View style={styles.gradientWrapper} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="tabGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop
                  offset="0"
                  stopColor={isDark ? "rgba(18,18,18,0.92)" : "rgba(255,255,255,0.92)"}
                />
                <Stop
                  offset="1"
                  stopColor={isDark ? "rgba(18,18,18,0.88)" : "rgba(255,255,255,0.88)"}
                />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#tabGradient)" />
          </Svg>
        </View>

        <AnimatedIndicator
          state={state}
          descriptors={descriptors}
          navigation={navigation}
          isStandard={isStandard}
          showTabLabels={showTabLabels}
          tabIconSize={tabIconSize}
          tabIndicatorStyle={indicatorStyle}
          resolveBadge={resolveBadge}
          reduceMotion={reduceMotion}
          colors={colors}
          isDark={isDark}
        />
      </View>
    </AnimatedBlur>
  );
};

export default LiquidTabBar;

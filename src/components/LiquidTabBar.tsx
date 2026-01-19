import React from "react";
import {
  Animated,
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  LayoutChangeEvent,
  LayoutRectangle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSettings } from "../context/SettingsContext";
import { useSavedArticles } from "../context/SavedArticlesContext";
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
  const {
    tabBarBlur,
    tabBarStyle,
    tabBarDockedHeight,
    tabBarHiddenHeight,
    tabBarFloatingHeight,
    experimentalIOS26NavBar,
    showTabLabels,
    tabBadgeStyle,
    tabIndicatorStyle,
    tabIconSize,
  } = useSettings();
  const { savedArticles } = useSavedArticles();
  const savedArticlesCount = savedArticles.length;
  const resolveBadge = React.useCallback(
    (routeName: string) => {
      if (tabBadgeStyle === "none") {
        return null;
      }

      if (routeName === "Saved" && savedArticlesCount > 0) {
        if (tabBadgeStyle === "dot") {
          return { type: "dot" as const };
        }
        return {
          type: "count" as const,
          value: savedArticlesCount > 99 ? "99+" : savedArticlesCount.toString(),
        };
      }

      return null;
    },
    [savedArticlesCount, tabBadgeStyle],
  );
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
  const blurIntensity = experimentalIOS26NavBar && tabBarBlur ? 80 : tabBarBlur ? 60 : 0;
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
            isStandard={isStandard}
            showTabLabels={showTabLabels}
            tabIconSize={tabIconSize}
            tabIndicatorStyle={tabIndicatorStyle}
            resolveBadge={resolveBadge}
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

export default LiquidTabBar;

// Animated versions
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
};

const AnimatedIndicator: React.FC<IndicatorProps> = ({
  state,
  descriptors,
  navigation,
  isStandard,
  showTabLabels,
  tabIconSize,
  tabIndicatorStyle,
  resolveBadge,
}) => {
  const routes = state.routes;
  const indicatorX = React.useRef(new Animated.Value(0)).current;
  const indicatorY = React.useRef(new Animated.Value(0)).current;
  const indicatorWidth = React.useRef(new Animated.Value(0)).current;
  const indicatorHeight = React.useRef(
    new Animated.Value(tabIndicatorStyle === "bubble" ? 30 : 4),
  ).current;
  const [indicatorRadius, setIndicatorRadius] = React.useState(16);
  const [tabLayouts, setTabLayouts] = React.useState<Record<string, LayoutRectangle>>({});

  const handleTabLayout = React.useCallback((routeKey: string, layout: LayoutRectangle) => {
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
  }, []);

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

      Animated.parallel([
        Animated.spring(indicatorX, {
          toValue: targetX,
          stiffness: 260,
          damping: 25,
          useNativeDriver: false,
        }),
        Animated.spring(indicatorY, {
          toValue: targetY,
          stiffness: 260,
          damping: 25,
          useNativeDriver: false,
        }),
        Animated.timing(indicatorWidth, {
          toValue: targetWidth,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(indicatorHeight, {
          toValue: targetHeight,
          duration: 200,
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
    ],
  );

  React.useEffect(() => {
    animateToRoute(state.index);
  }, [state.index, tabIndicatorStyle, tabLayouts, animateToRoute]);

  const iconSize = tabIconSize || 25;
  const activeRouteKey = routes[state.index]?.key;
  const hasLayout = !!(activeRouteKey && tabLayouts[activeRouteKey]);
  const shouldRenderIndicator = tabIndicatorStyle !== "none" && hasLayout;

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
              onLayout={(event: LayoutChangeEvent) =>
                handleTabLayout(route.key, event.nativeEvent.layout)
              }
              activeOpacity={0.75}
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

import React from 'react';
import { Animated, StyleSheet, View, Platform, TouchableOpacity, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSettings } from '../context/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollContext } from '../context/ScrollContext';

let BlurView: any = null;
try {
  // optional dependency; fall back gracefully if not available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BlurView = require('expo-blur').BlurView;
} catch (e) {
  BlurView = null;
}

const AnimatedBlur: any = Animated.createAnimatedComponent(BlurView || View);

export const LiquidTabBar: React.FC<BottomTabBarProps> = (props) => {
  const insets = useSafeAreaInsets();
  const { scrollY } = React.useContext(ScrollContext);
  const { tabBarBlur, tabBarStyle, tabBarDockedHeight, tabBarHiddenHeight } = useSettings();
  const isStandard = tabBarStyle === 'standard';

  // animate translateY and opacity from the shared scrollY value
  const translateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 42],
    extrapolate: 'clamp',
  });

  // Animate blur opacity based on scroll but respect user preference
  const blurOpacityAnimated = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });
  const blurOpacity = tabBarBlur ? blurOpacityAnimated : 1;

  // allow the visual height of the tab bar to change as it is docked/hidden
  const normalHeight = isStandard ? (tabBarDockedHeight || 56) : (tabBarDockedHeight || 56);
  const hiddenHeight = tabBarHiddenHeight || (normalHeight + 8);
  const animatedHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [normalHeight, hiddenHeight],
    extrapolate: 'clamp',
  });

  // Place the capsule very close to the bottom; keep a small base offset and add the inset
  // Reduced base offset to place the capsule even lower
  const containerStyle = [
    styles.container,
    {
      // anchor to the absolute bottom so we can visually cover the safe area
      left: isStandard ? 0 : 16,
      right: isStandard ? 0 : 16,
      bottom: 0,
      transform: [{ translateY }],
    },
  ];

  // Debug: log insets so we can see placement in device logs
  // eslint-disable-next-line no-console
  console.log('[LiquidTabBar] insets', insets, 'containerBottom', 6 + insets.bottom);

  return (
    <Animated.View style={containerStyle} pointerEvents="box-none">
      <AnimatedBlur
        intensity={tabBarBlur ? 50 : 0}
        style={[
          styles.blur,
          {
            borderRadius: isStandard ? 0 : 32,
            opacity: typeof blurOpacity === 'number' ? blurOpacity : blurOpacity,
            backgroundColor: 'transparent'
          }
        ]}
        // @ts-ignore: BlurView props vary; if it's a View fallback, props ignored
        tint={Platform.OS === 'ios' ? 'default' : 'light'}
      >
        {/* Gradient background (75% opacity) placed under content */}
        <View style={styles.gradientWrapper} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="tabGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
                <Stop offset="100%" stopColor="rgba(245,245,247,0.75)" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#tabGrad)" />
          </Svg>
        </View>
        <Animated.View style={[styles.inner, { height: animatedHeight, paddingBottom: 8 + insets.bottom }]} pointerEvents="auto">
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
    position: 'absolute',
    left: 16,
    right: 16,
    // initial placement uses safe area addition in runtime
    zIndex: 30,
  },
  blur: {
    borderRadius: 32,
    overflow: 'hidden',
    // Less transparent so the capsule reads as a solid surface while still using blur
    backgroundColor: 'transparent',
    shadowColor: '#000',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 22,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
  },
  indicator: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0a84ff',
    // bring indicator slightly closer to the bottom of the capsule
    bottom: 6,
    left: 16,
  }
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

const AnimatedIndicator: React.FC<IndicatorProps> = ({ state, descriptors, navigation, settingsOverrides }) => {
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

  const translateX = active.interpolate({
    inputRange: routes.map((_: any, i: number) => i),
    outputRange: routes.map((_: any, i: number) => (tabWidth * i) + (tabWidth / 2) - 20),
    extrapolate: 'clamp',
  });

  return (
    <View onLayout={onLayout} style={{ width: '100%' }}>
      {/* indicator */}
      <Animated.View style={[styles.indicator, { left: settingsOverrides?.isStandard ? 0 : 16, transform: [{ translateX }] }]} />
      <View style={styles.row}>
        {routes.map((route: any, idx: number) => {
          const descriptor = descriptors[route.key];
          const focused = state.index === idx;
          const activeTint = descriptor.options.tabBarActiveTintColor || '#0a84ff';
          const inactiveTint = descriptor.options.tabBarInactiveTintColor || '#8e8e93';
          const color = focused ? activeTint : inactiveTint;
          const IconRenderer = (descriptor.options.tabBarIcon as any) || null;
          const label = descriptor.options.title ?? route.name;

          return (
            <AnimatedTouchable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabButton}
              activeOpacity={0.75}
            >
              <Animated.View style={{ transform: [{ scale: focused ? 1.12 : 1 }] }}>
                {IconRenderer ? IconRenderer({ color, size: descriptor.options.tabBarIconSize || 25, focused }) : null}
              </Animated.View>
              {descriptor.options.tabBarShowLabel === false ? null : (
                <Text style={[styles.label, { color }]}>{label}</Text>
              )}
              {descriptor.options.tabBarBadge ? (
                <View style={styles.badge}><Text style={styles.badgeText}>{descriptor.options.tabBarBadge}</Text></View>
              ) : null}
            </AnimatedTouchable>
          );
        })}
      </View>
    </View>
  );
};

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ArticleScreen } from "../screens/ArticleScreen";
import { RootStackParamList, TabParamList } from "./types";
import { DigestScreen } from "../screens/DigestScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SectionScreen } from "../screens/SectionScreen";
import { SavedScreen } from "../screens/SavedScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { OnboardingScreen } from "../screens/OnboardingScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ReadingSettingsScreen } from "../screens/ReadingSettingsScreen";
import { DataPerformanceSettingsScreen } from "../screens/DataPerformanceSettingsScreen";
import { DigestSettingsScreen } from "../screens/DigestSettingsScreen";
import { GroundingFocusSettingsScreen } from "../screens/GroundingFocusSettingsScreen";
import { AccessibilitySettingsScreen } from "../screens/AccessibilitySettingsScreen";
import { NavigationSettingsScreen } from "../screens/NavigationSettingsScreen";
import { AppInfoScreen } from "../screens/AppInfoScreen";
import { SourcesSettingsScreen } from "../screens/SourcesSettingsScreen";
import { TabBarSettingsScreen } from "../screens/TabBarSettingsScreen";
import { DebugSettingsScreen } from "../screens/DebugSettingsScreen";
import { IOS26DemoScreen } from "../screens/iOS26DemoScreen";
import { AchievementsScreen } from "../screens/AchievementsScreen";
import { useSettings, sanitizeTabs } from "../context/SettingsContext";
import { View, ActivityIndicator } from "react-native";
import { ScrollProvider } from "../context/ScrollContext";
import LiquidTabBar from "../components/LiquidTabBar";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import {
  Flame,
  MapPin,
  Briefcase,
  Trophy,
  Palette,
  Newspaper,
  Bookmark,
  Home,
  Search,
  Star,
  User,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab configurations based on layout preference
type TabConfig = {
  name: string;
  component: React.ComponentType<any>;
  Icon: LucideIcon;
  title?: string;
  params?: Record<string, any>;
};

export const getTabConfig = (layout: "minimal" | "comprehensive"): Record<string, TabConfig> =>
  ({
    minimal: {
      home: { name: "Home", component: HomeScreen, Icon: Home },
      discover: {
        name: "Discover",
        params: { category: "Local" },
        Icon: Search,
      },
      saved: { name: "Saved", component: SavedScreen, Icon: Bookmark },
      digest: { name: "Digest", component: DigestScreen, Icon: Star },
      profile: { name: "Profile", component: ProfileScreen, Icon: User },
    },
    comprehensive: {
      top: { name: "Top", component: HomeScreen, Icon: Flame },
      local: {
        name: "Local",
        component: SectionScreen,
        params: { category: "Local" },
        Icon: MapPin,
      },
      digest: { name: "Digest", component: DigestScreen, Icon: Newspaper },
      saved: { name: "Saved", component: SavedScreen, Icon: Bookmark },
      profile: { name: "Profile", component: ProfileScreen, Icon: User },
    },
  })[layout];

// Tab Navigator component
const TabNavigatorScreen = ({ navigation }: any) => {
  const { activeTabs, tabLayout, defaultTab, showTabLabels, tabIconSize } = useSettings();
  const TAB_CONFIG = getTabConfig(tabLayout);
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom ?? 0;
  // Clamp the inset used for layout so very large insets don't push the capsule too high
  const clampedBottomInset = Math.min(bottomInset, 20);
  // Compute a small internal padding to visually balance the capsule
  const internalPaddingBottom = bottomInset > 0 ? Math.round(bottomInset / 3) : 8;

  const safeActiveTabs = React.useMemo(
    () => sanitizeTabs(activeTabs, tabLayout),
    [activeTabs, tabLayout],
  );

  const fallbackTabId = safeActiveTabs[0];
  const resolvedDefaultId = safeActiveTabs.includes(defaultTab) ? defaultTab : fallbackTabId;
  const getRouteNameForTab = (tabId?: string) => {
    if (!tabId) return undefined;
    const config = TAB_CONFIG[tabId as keyof typeof TAB_CONFIG];
    return config?.name;
  };
  const resolvedDefaultRouteName =
    getRouteNameForTab(resolvedDefaultId) ?? getRouteNameForTab(fallbackTabId);
  const activeTabsKey = React.useMemo(() => safeActiveTabs.join("|"), [safeActiveTabs]);
  const navigatorKey = `${tabLayout}-${activeTabsKey}-${resolvedDefaultId || "root"}`;

  return (
    <Tab.Navigator
      key={navigatorKey}
      initialRouteName={resolvedDefaultRouteName as keyof TabParamList | undefined}
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          // More Apple-like floating capsule (translucent by default; LiquidTabBar will respect blur setting)
          backgroundColor: "rgba(255,255,255,0.82)",
          borderTopWidth: 0,
          height: 49,
          paddingBottom: internalPaddingBottom,
          paddingTop: 4,
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 12 + clampedBottomInset,
          borderRadius: 32,
          // Subtle diffuse shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.secondaryLabel,
        tabBarShowLabel: showTabLabels,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.sans,
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 6,
          paddingVertical: 4,
          paddingHorizontal: 6,
        },
        tabBarAllowFontScaling: true,
      }}
    >
      {safeActiveTabs.map((tabId: string) => {
        const config = TAB_CONFIG[tabId as keyof typeof TAB_CONFIG];
        if (!config) return null;

        return (
          <Tab.Screen
            key={tabId}
            name={config.name as keyof TabParamList}
            component={config.component}
            initialParams={config.params}
            options={{
              title: config.title || config.name,
              tabBarIcon: ({ color }: { color: string }) => (
                <config.Icon color={color} size={tabIconSize || 25} />
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { hasCompletedOnboarding, isLoadingSettings, shouldShowWhatsNew } = useSettings();

  if (isLoadingSettings) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const initialRouteName = hasCompletedOnboarding && !shouldShowWhatsNew ? "Main" : "Onboarding";
  const onboardingParams = shouldShowWhatsNew ? { startSlideId: "whats-new" } : undefined;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "right", "left"]}
    >
      <ScrollProvider>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{
            headerShown: true,
            headerTransparent: false,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleAlign: "left",
          }}
        >
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
            initialParams={onboardingParams}
          />
          <Stack.Screen
            name="Main"
            component={TabNavigatorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Article"
            component={ArticleScreen}
            options={{
              headerShown: true,
              headerBackTitle: "Back",
              headerTitle: "",
              headerTintColor: colors.text,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: "Settings",
            }}
          />
          <Stack.Screen
            name="ReadingSettings"
            component={ReadingSettingsScreen}
            options={{
              headerShown: true,
              title: "Reading Experience",
            }}
          />
          <Stack.Screen
            name="DataPerformanceSettings"
            component={DataPerformanceSettingsScreen}
            options={{
              headerShown: true,
              title: "Data & Performance",
            }}
          />
          <Stack.Screen
            name="DigestSettings"
            component={DigestSettingsScreen}
            options={{
              headerShown: true,
              title: "Digest & Launch",
            }}
          />
          <Stack.Screen
            name="GroundingFocusSettings"
            component={GroundingFocusSettingsScreen}
            options={{
              headerShown: true,
              title: "Grounding & Focus",
            }}
          />
          <Stack.Screen
            name="AccessibilitySettings"
            component={AccessibilitySettingsScreen}
            options={{
              headerShown: true,
              title: "Accessibility",
            }}
          />
          <Stack.Screen
            name="NavigationSettings"
            component={NavigationSettingsScreen}
            options={{
              headerShown: true,
              title: "Navigation",
            }}
          />
          <Stack.Screen
            name="AppInfo"
            component={AppInfoScreen}
            options={{
              headerShown: true,
              title: "App Info",
            }}
          />
          <Stack.Screen
            name="SourcesSettings"
            component={SourcesSettingsScreen}
            options={{
              headerShown: true,
              title: "News Sources",
            }}
          />
          <Stack.Screen
            name="TabBarSettings"
            component={TabBarSettingsScreen}
            options={{
              headerShown: true,
              title: "Tab Bar Studio",
            }}
          />
          <Stack.Screen
            name="DebugSettings"
            component={DebugSettingsScreen}
            options={{
              headerShown: true,
              title: "Debug & Advanced",
            }}
          />
          <Stack.Screen
            name="iOS26Demo"
            component={IOS26DemoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Achievements"
            component={AchievementsScreen}
            options={{
              headerShown: true,
              title: "Achievements",
            }}
          />
        </Stack.Navigator>
      </ScrollProvider>
    </SafeAreaView>
  );
};

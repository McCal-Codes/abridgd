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

import { OnboardingScreen } from "../screens/OnboardingScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ReadingSettingsScreen } from "../screens/ReadingSettingsScreen";
import { DigestSettingsScreen } from "../screens/DigestSettingsScreen";
import { CustomizationSettingsScreen } from "../screens/CustomizationSettingsScreen";
import { SourcesSettingsScreen } from "../screens/SourcesSettingsScreen";
import { TabBarSettingsScreen } from "../screens/TabBarSettingsScreen";
import { DebugSettingsScreen } from "../screens/DebugSettingsScreen";
import { iOS26DemoScreen } from "../screens/iOS26DemoScreen";
import { useSettings } from "../context/SettingsContext";
import { View, ActivityIndicator, TouchableOpacity, Text } from "react-native";
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
  Settings,
  Home,
  Search,
  Star,
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

const getTabConfig = (layout: "minimal" | "comprehensive"): Record<string, TabConfig> =>
  ({
    minimal: {
      home: { name: "Home", component: HomeScreen, Icon: Home },
      discover: {
        name: "Discover",
        component: SectionScreen,
        params: { category: "Local" },
        Icon: Search,
      },
      saved: { name: "Saved", component: SavedScreen, Icon: Bookmark },
      digest: { name: "Digest", component: DigestScreen, Icon: Star },
    },
    comprehensive: {
      top: { name: "Top", component: HomeScreen, Icon: Flame },
      local: {
        name: "Local",
        component: SectionScreen,
        params: { category: "Local" },
        Icon: MapPin,
      },
      business: {
        name: "Business",
        component: SectionScreen,
        params: { category: "Business" },
        Icon: Briefcase,
      },
      sports: {
        name: "Sports",
        component: SectionScreen,
        params: { category: "Sports" },
        Icon: Trophy,
      },
      culture: {
        name: "Culture",
        component: SectionScreen,
        params: { category: "Culture" },
        Icon: Palette,
      },
      digest: { name: "Digest", component: DigestScreen, Icon: Newspaper },
      saved: { name: "Saved", component: SavedScreen, Icon: Bookmark },
    },
  })[layout];

// Tab Navigator component
const TabNavigatorScreen = ({ navigation }: any) => {
  const { activeTabs, tabLayout } = useSettings();
  const TAB_CONFIG = getTabConfig(tabLayout);
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom ?? 0;
  // Clamp the inset used for layout so very large insets don't push the capsule too high
  const clampedBottomInset = Math.min(bottomInset, 20);
  // Compute a small internal padding to visually balance the capsule
  const internalPaddingBottom = bottomInset > 0 ? Math.round(bottomInset / 3) : 8;

  return (
    <Tab.Navigator
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.separator,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTitleStyle: {
          fontFamily: typography.fontFamily.serif,
          fontWeight: "700",
          fontSize: typography.size.xl,
          color: colors.label,
        },
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
        tabBarShowLabel: true,
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
        headerRight: () => (
          <View style={{ flexDirection: "row", marginRight: 8, alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                try {
                  const state = navigation.getState && navigation.getState();
                  const topRoute = state && state.routes && state.routes[state.index];
                  if (topRoute && topRoute.name === "Settings") {
                    navigation.goBack();
                  } else {
                    navigation.navigate("Settings");
                  }
                } catch (e) {
                  navigation.navigate("Settings");
                }
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Open settings"
              accessibilityRole="button"
              style={{ padding: 6, borderRadius: 8 }}
            >
              <Text
                style={{
                  color: colors.tint,
                  fontFamily: typography.fontFamily.sans,
                  fontWeight: "600",
                }}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      {activeTabs.map((tabId: string) => {
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
              tabBarIcon: ({ color }) => <config.Icon color={color} size={25} />,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { hasCompletedOnboarding, isLoadingSettings, isWelcomeBackEnabled } = useSettings();
  const [hasSeenWelcomeBack, setHasSeenWelcomeBack] = React.useState(false);

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

  const initialRouteName = hasCompletedOnboarding ? "Main" : "Onboarding";

  return (
    // Allow content to extend to the bottom so our floating tab capsule can overlay the safe area
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["right", "left"]}>
      <ScrollProvider>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
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
              headerTintColor: "#000",
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: "Settings",
              headerTintColor: colors.text,
            }}
          />
          <Stack.Screen
            name="ReadingSettings"
            component={ReadingSettingsScreen}
            options={{ headerShown: true, title: "Reading Features", headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="DigestSettings"
            component={DigestSettingsScreen}
            options={{ headerShown: true, title: "Digest Settings", headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="CustomizationSettings"
            component={CustomizationSettingsScreen}
            options={{ headerShown: true, title: "Customization", headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="SourcesSettings"
            component={SourcesSettingsScreen}
            options={{ headerShown: true, title: "News Sources", headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="TabBarSettings"
            component={TabBarSettingsScreen}
            options={{ headerShown: true, title: "Tab Bar Layout", headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="DebugSettings"
            component={DebugSettingsScreen}
            options={{ headerShown: true, title: "Debug & Advanced", headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="iOS26Demo"
            component={iOS26DemoScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </ScrollProvider>
    </SafeAreaView>
  );
};

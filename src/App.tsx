import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import { RootNavigator } from "./navigation/RootNavigator";
import { SettingsProvider } from "./context/SettingsContext";
import { SavedArticlesProvider } from "./context/SavedArticlesContext";
import { SavedEventsProvider } from "./features/events/SavedEventsContext";
import { ProfileProvider } from "./context/ProfileContext";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";
import { ReadingProgressProvider } from "./context/ReadingProgressContext";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { runStorageHousekeeping } from "./services/storageHousekeeping";
import { scrubBreadcrumb } from "./utils/sentryScrub";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Crash reporting (Sentry)
import * as Sentry from "@sentry/react-native";
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    tracesSampleRate: 0.2,
    environment: __DEV__ ? "development" : "production",
    // Crash reports must not identify the reader or record what they read.
    sendDefaultPii: false,
    beforeBreadcrumb: scrubBreadcrumb,
  });
}

const AppContent = () => {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer>
      <ErrorBoundary>
        <ProfileProvider>
          <SavedArticlesProvider>
            <SavedEventsProvider>
              <ReadingProgressProvider>
                <SettingsProvider>
                  <RootNavigator />
                  <StatusBar
                    style={isDark ? "light" : "dark"}
                    backgroundColor={colors.background}
                  />
                </SettingsProvider>
              </ReadingProgressProvider>
            </SavedEventsProvider>
          </SavedArticlesProvider>
        </ProfileProvider>
      </ErrorBoundary>
    </NavigationContainer>
  );
};

export default Sentry.wrap(function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Trim the feed and full-story caches once per launch, after the first screen has had a
  // moment to render, so it never competes with startup reads.
  useEffect(() => {
    const timer = setTimeout(() => {
      runStorageHousekeeping().catch(() => {});
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});

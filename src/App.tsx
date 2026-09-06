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
import { ProfileProvider } from "./context/ProfileContext";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";
import { ReadingProgressProvider } from "./context/ReadingProgressContext";

import { ErrorBoundary } from "./components/ErrorBoundary";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Crash reporting (Sentry)
import * as Sentry from "@sentry/react-native";
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    tracesSampleRate: 0.2,
  });
}

const AppContent = () => {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer>
      <ErrorBoundary>
        <ProfileProvider>
          <SavedArticlesProvider>
            <ReadingProgressProvider>
              <SettingsProvider>
                <RootNavigator />
                <StatusBar
                  style={isDark ? "light" : "dark"}
                  backgroundColor={colors.background}
                />
              </SettingsProvider>
            </ReadingProgressProvider>
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

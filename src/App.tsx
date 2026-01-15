import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './navigation/RootNavigator';
import { SettingsProvider } from './context/SettingsContext';
import { SavedArticlesProvider } from './context/SavedArticlesContext';
import { ProfileProvider } from './context/ProfileContext';

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ErrorBoundary>
          <ProfileProvider>
            <SavedArticlesProvider>
              <SettingsProvider>
                <RootNavigator />
                <StatusBar style="dark" />
              </SettingsProvider>
            </SavedArticlesProvider>
          </ProfileProvider>
        </ErrorBoundary>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

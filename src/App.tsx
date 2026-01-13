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
    <ErrorBoundary>
      <ProfileProvider>
        <SavedArticlesProvider>
          <SettingsProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <RootNavigator />
                <StatusBar style="dark" />
              </NavigationContainer>
            </SafeAreaProvider>
          </SettingsProvider>
        </SavedArticlesProvider>
      </ProfileProvider>
    </ErrorBoundary>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArticleScreen } from '../screens/ArticleScreen';
import { RootStackParamList } from './types';
import { DigestScreen } from '../screens/DigestScreen';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ReadingSettingsScreen } from '../screens/ReadingSettingsScreen';
import { DigestSettingsScreen } from '../screens/DigestSettingsScreen';
import { CustomizationSettingsScreen } from '../screens/CustomizationSettingsScreen';
import { SourcesSettingsScreen } from '../screens/SourcesSettingsScreen';
import { TabBarSettingsScreen } from '../screens/TabBarSettingsScreen';
import { DebugSettingsScreen } from '../screens/DebugSettingsScreen';
import { useSettings } from '../context/SettingsContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { hasCompletedOnboarding, isLoadingSettings, isWelcomeBackEnabled } = useSettings();
  const [hasSeenWelcomeBack, setHasSeenWelcomeBack] = React.useState(false);

  if (isLoadingSettings) {
      return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
              <ActivityIndicator color={colors.primary} />
          </View>
      );
  }

  if (hasCompletedOnboarding && isWelcomeBackEnabled && !hasSeenWelcomeBack) {
      return (
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
              <DigestScreen isWelcomeBack onContinue={() => setHasSeenWelcomeBack(true)} />
          </SafeAreaView>
      );
  }

  return (
    <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={hasCompletedOnboarding ? "Main" : "Onboarding"}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen 
        name="Article" 
        component={ArticleScreen} 
        options={{ 
            headerShown: true, 
            headerBackTitle: 'Back', 
            headerTitle: '',
            headerTintColor: '#000',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
            headerShown: true, 
            title: 'Settings',
            headerTintColor: colors.text,
        }}
      />
      <Stack.Screen 
        name="ReadingSettings" 
        component={ReadingSettingsScreen} 
        options={{ headerShown: true, title: 'Reading Features', headerTintColor: colors.text }}
      />
      <Stack.Screen 
        name="DigestSettings" 
        component={DigestSettingsScreen} 
        options={{ headerShown: true, title: 'Digest Settings', headerTintColor: colors.text }}
      />
      <Stack.Screen 
        name="CustomizationSettings" 
        component={CustomizationSettingsScreen} 
        options={{ headerShown: true, title: 'Customization', headerTintColor: colors.text }}
      />
      <Stack.Screen 
        name="SourcesSettings" 
        component={SourcesSettingsScreen} 
        options={{ headerShown: true, title: 'News Sources', headerTintColor: colors.text }}
      />
      <Stack.Screen 
        name="TabBarSettings" 
        component={TabBarSettingsScreen} 
        options={{ headerShown: true, title: 'Tab Bar Layout', headerTintColor: colors.text }}
      />
      <Stack.Screen 
        name="DebugSettings" 
        component={DebugSettingsScreen} 
        options={{ headerShown: true, title: 'Debug & Advanced', headerTintColor: colors.text }}
      />
    </Stack.Navigator>
  );
};

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { SectionScreen } from '../screens/SectionScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { DigestScreen } from '../screens/DigestScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { TabParamList } from './types';
import { useSettings } from '../context/SettingsContext';

import { TouchableOpacity, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { Flame, MapPin, Briefcase, Trophy, Palette, Newspaper, Bookmark, Settings, Home, Search, Star } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

const Tab = createBottomTabNavigator<TabParamList>();

// Tab configurations based on layout preference
type TabConfig = {
  name: string;
  component: React.ComponentType<any>;
  Icon: LucideIcon;
  title?: string;
  params?: Record<string, any>;
};

const getTabConfig = (layout: 'minimal' | 'comprehensive'): Record<string, TabConfig> => ({
  minimal: {
    home: { name: 'Home', component: HomeScreen, title: 'Home', Icon: Home },
    discover: { name: 'Discover', component: SectionScreen, params: { category: 'Local' }, Icon: Search },
    saved: { name: 'Saved', component: SavedScreen, Icon: Bookmark },
    digest: { name: 'Digest', component: DigestScreen, title: 'Daily Digest', Icon: Star },
  },
  comprehensive: {
    top: { name: 'Top', component: HomeScreen, title: 'Top Stories', Icon: Flame },
    local: { name: 'Local', component: SectionScreen, params: { category: 'Local' }, Icon: MapPin },
    business: { name: 'Business', component: SectionScreen, params: { category: 'Business' }, Icon: Briefcase },
    sports: { name: 'Sports', component: SectionScreen, params: { category: 'Sports' }, Icon: Trophy },
    culture: { name: 'Culture', component: SectionScreen, params: { category: 'Culture' }, Icon: Palette },
    digest: { name: 'Digest', component: DigestScreen, title: 'Daily Digest', Icon: Newspaper },
    saved: { name: 'Saved', component: SavedScreen, Icon: Bookmark },
  }
}[layout]);

export const TabNavigator = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeTabs, tabLayout } = useSettings();

  console.log('TabNavigator rendering with activeTabs:', activeTabs, 'tabLayout:', tabLayout);
  console.log('Navigation object:', navigation);
  console.log('Navigation state:', navigation.getState());

  const TAB_CONFIG = getTabConfig(tabLayout);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          shadowColor: 'transparent',
          elevation: 0,
          minHeight: 80, // Increase height for settings icon
          paddingTop: 24 // Extra top padding for safe area
        },
        headerTitleStyle: {
          fontFamily: typography.fontFamily.serif,
          fontWeight: '700',
          fontSize: typography.size.xl,
          color: colors.text,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false, // NYT-style: icon-only tabs
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={{ padding: 8, marginRight: 8 }}
          >
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
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
              tabBarIcon: ({ color, size }) => (
                <config.Icon color={color} size={size} />
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

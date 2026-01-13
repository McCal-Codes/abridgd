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

import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Tab configuration mapping
const TAB_CONFIG = {
  top: { name: 'Top', component: HomeScreen, title: 'Top Stories', icon: '🔥' },
  local: { name: 'Local', component: SectionScreen, params: { category: 'Local' }, icon: '📍' },
  business: { name: 'Business', component: SectionScreen, params: { category: 'Business' }, icon: '💼' },
  sports: { name: 'Sports', component: SectionScreen, params: { category: 'Sports' }, icon: '⚽' },
  culture: { name: 'Culture', component: SectionScreen, params: { category: 'Culture' }, icon: '🎭' },
  digest: { name: 'Digest', component: DigestScreen, title: 'Daily Digest', label: 'Digest', icon: '📰' },
  saved: { name: 'Saved', component: SavedScreen, icon: '🔖' },
};

export const TabNavigator = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeTabs } = useSettings();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { 
            backgroundColor: colors.background, 
            borderBottomWidth: 1, 
            borderBottomColor: colors.border,
            shadowColor: 'transparent', // iOS
            elevation: 0, // Android
        },
        headerTitleStyle: { 
            fontFamily: typography.fontFamily.serif, 
            fontWeight: '700', 
            fontSize: typography.size.xl, 
            color: colors.text 
        },
        tabBarStyle: { 
            backgroundColor: colors.surface, 
            borderTopColor: colors.border,
            paddingTop: 5,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
            fontSize: 10, 
            fontWeight: '500',
            marginBottom: 4 
        },
        headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 16 }}>
                <Text style={{ fontSize: 24 }}>⚙️</Text>
            </TouchableOpacity>
        ),
      }}
    >
      {activeTabs.map((tabId) => {
        const config = TAB_CONFIG[tabId as keyof typeof TAB_CONFIG];
        if (!config) return null;

        return (
          <Tab.Screen
            key={tabId}
            name={config.name as any}
            component={config.component}
            options={{
              title: config.title || config.name,
              tabBarLabel: config.label || config.name,
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>{config.icon}</Text>,
            }}
            initialParams={config.params}
          />
        );
      })}
    </Tab.Navigator>
  );
};

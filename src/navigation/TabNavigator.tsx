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

import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { Flame, MapPin, Briefcase, Trophy, Palette, Newspaper, Bookmark, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator<TabParamList>();

// Tab configuration mapping with icons
const TAB_CONFIG = {
  top: { name: 'Top', component: HomeScreen, title: 'Top Stories', Icon: Flame },
  local: { name: 'Local', component: SectionScreen, params: { category: 'Local' }, Icon: MapPin },
  business: { name: 'Business', component: SectionScreen, params: { category: 'Business' }, Icon: Briefcase },
  sports: { name: 'Sports', component: SectionScreen, params: { category: 'Sports' }, Icon: Trophy },
  culture: { name: 'Culture', component: SectionScreen, params: { category: 'Culture' }, Icon: Palette },
  digest: { name: 'Digest', component: DigestScreen, title: 'Daily Digest', label: 'Digest', Icon: Newspaper },
  saved: { name: 'Saved', component: SavedScreen, Icon: Bookmark },
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
            shadowColor: 'transparent',
            elevation: 0,
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
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
            fontSize: 11, 
            fontWeight: '600',
            marginTop: 4,
        },
        headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 16 }}>
                <Settings size={24} color={colors.text} />
            </TouchableOpacity>
        ),
      }}
    >
      {activeTabs.map((tabId) => {
        const config = TAB_CONFIG[tabId as keyof typeof TAB_CONFIG];
        if (!config) return null;

        const TabIcon = config.Icon;

        return (
          <Tab.Screen
            key={tabId}
            name={config.name as any}
            component={config.component}
            options={{
              title: config.title || config.name,
              tabBarLabel: config.label || config.name,
              tabBarIcon: ({ color, focused }) => (
                <View style={{ 
                  transform: [{ scale: focused ? 1.1 : 1 }],
                  opacity: focused ? 1 : 0.7,
                }}>
                  <TabIcon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                </View>
              ),
            }}
            initialParams={config.params}
          />
        );
      })}
    </Tab.Navigator>
  );
};

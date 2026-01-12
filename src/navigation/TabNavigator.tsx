import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { SectionScreen } from '../screens/SectionScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
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
            fontFamily: typography.fontFamily.sans, 
            fontSize: 10, 
            fontWeight: '500',
            marginBottom: 4 
        },
      }}
    >
      <Tab.Screen name="Top" component={HomeScreen} options={{ title: 'Top Stories' }} />
      <Tab.Screen name="Local" component={SectionScreen} initialParams={{ category: 'Local' }} />
      <Tab.Screen name="Business" component={SectionScreen} initialParams={{ category: 'Business' }} />
      <Tab.Screen name="Sports" component={SectionScreen} initialParams={{ category: 'Sports' }} />
      <Tab.Screen name="Culture" component={SectionScreen} initialParams={{ category: 'Culture' }} />
      <Tab.Screen name="Saved" component={SavedScreen} />
    </Tab.Navigator>
  );
};

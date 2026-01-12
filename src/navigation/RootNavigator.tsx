import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ArticleScreen } from '../screens/ArticleScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    </Stack.Navigator>
  );
};

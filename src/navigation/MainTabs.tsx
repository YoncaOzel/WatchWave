import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AiCoachScreen from '../screens/AiCoachScreen';
import SwipeDiscoveryScreen from '../screens/SwipeDiscoveryScreen';
import { BottomTabParamList } from './types';
import { useThemeStore } from '../store/themeStore';

const Tab = createBottomTabNavigator<BottomTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { colors } = useThemeStore();
  const icons: Record<string, string> = {
    Home: '⊞',
    Search: '⌕',
    Library: '⊟',
    Profile: '⊙',
    AiCoach: '✨',
    Discovery: '🔥',
  };
  return (
    <Text style={{ fontSize: 22, color: focused ? colors.primary : colors.textSecondary }}>
      {icons[name]}
    </Text>
  );
}

export default function MainTabs() {
  const { colors } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarLabelStyle: { fontSize: 11 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Ana Sayfa' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'Ara' }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ tabBarLabel: 'Kütüphane' }} />
      <Tab.Screen name="Discovery" component={SwipeDiscoveryScreen} options={{ tabBarLabel: 'Keşfet' }} />
      <Tab.Screen name="AiCoach" component={AiCoachScreen} options={{ tabBarLabel: 'Asistan' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

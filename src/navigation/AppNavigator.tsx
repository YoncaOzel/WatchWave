import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import DetailScreen from '../screens/DetailScreen';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useLibraryStore } from '../store/libraryStore';
import { AuthService } from '../services/AuthService';
import { FirestoreService } from '../services/FirestoreService';
import { DarkColors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const { loadTheme } = useThemeStore();
  const { setList } = useLibraryStore();

  useEffect(() => {
    loadTheme();

    const timeout = setTimeout(() => {
      if (useAuthStore.getState().isLoading) {
        setUser(null);
      }
    }, 5000);

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = AuthService.onAuthChanged(async (firebaseUser) => {
        clearTimeout(timeout);
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
          });
          try {
            const lists = await FirestoreService.loadAllLists(firebaseUser.uid);
            setList('watchlist', lists.watchlist);
            setList('watched', lists.watched);
            setList('favorites', lists.favorites);
          } catch {
            // Firestore yapılandırılmamış — Zustand verileri korunur
          }
        } else {
          setUser(null);
        }
      });
    } catch {
      clearTimeout(timeout);
      setUser(null);
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: DarkColors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={DarkColors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="PublicProfile"
        // @ts-ignore dynamic import placeholder
        component={require('../screens/PublicProfileScreen').default}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

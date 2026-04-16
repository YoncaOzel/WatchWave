import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkBanner from './src/components/NetworkBanner';
import { useThemeStore } from './src/store/themeStore';
import { DarkColors, LightColors } from './src/theme/colors';

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error?.message + '\n' + error?.stack };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#141414', padding: 20, paddingTop: 60 }}>
          <Text style={{ color: '#ff4444', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Uygulama Hatasi
          </Text>
          <ScrollView>
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {this.state.error}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const buildNavTheme = (isDark: boolean): Theme => ({
  ...DarkTheme,
  dark: isDark,
  colors: {
    ...DarkTheme.colors,
    primary: isDark ? DarkColors.primary : LightColors.primary,
    background: isDark ? DarkColors.background : LightColors.background,
    card: isDark ? DarkColors.cardBackground : LightColors.cardBackground,
    text: isDark ? DarkColors.textPrimary : LightColors.textPrimary,
    border: isDark ? DarkColors.border : LightColors.border,
    notification: isDark ? DarkColors.primary : LightColors.primary,
  },
});

function AppContent() {
  const { isDark, colors } = useThemeStore();
  const navTheme = buildNavTheme(isDark);

  const linking = {
    prefixes: [Linking.createURL('/'), 'watchwave://'],
    config: {
      screens: {
        SharedList: 'shared-list/:uid/:listId',
        Main: {
          screens: {
            Home: 'home',
          },
        },
      },
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme} linking={linking}>
          <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
          <AppNavigator />
          <NetworkBanner />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

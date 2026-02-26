import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors, ColorScheme } from '../theme/colors';

const THEME_STORAGE_KEY = '@watchwave_theme';

interface ThemeState {
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true,
  colors: DarkColors,

  toggleTheme: async () => {
    const next = !get().isDark;
    set({ isDark: next, colors: next ? DarkColors : LightColors });
    await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
  },

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored !== null) {
        const isDark = JSON.parse(stored) as boolean;
        set({ isDark, colors: isDark ? DarkColors : LightColors });
      }
    } catch {
      // AsyncStorage hatası — varsayılan karanlık temayı kullan
    }
  },
}));

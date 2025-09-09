import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, Theme } from '../types/theme';
import { LanguageType, changeLanguage } from '../locales/i18n';
import { lightTheme, darkTheme } from '../themes/colors';

interface AppState {
  // Theme state
  themeMode: ThemeMode;
  theme: Theme;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;

  // Language state
  currentLanguage: LanguageType;
  setLanguage: (language: LanguageType) => Promise<void>;

  // Loading states
  isThemeLoading: boolean;
  isLanguageLoading: boolean;
  setThemeLoading: (loading: boolean) => void;
  setLanguageLoading: (loading: boolean) => void;

  // Hydration state
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;

  // Initialization
  initializeFromSystem: (systemColorScheme: 'light' | 'dark' | null) => void;
  initializeApp: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      themeMode: 'light',
      theme: lightTheme,
      isDark: false,
      currentLanguage: 'system' as LanguageType,
      isThemeLoading: false,
      isLanguageLoading: false,
      hasHydrated: false,

      // Actions
      setThemeMode: (mode: ThemeMode) => {
        const isDark = mode === 'dark';
        const theme = isDark ? darkTheme : lightTheme;
        set({ themeMode: mode, theme, isDark });
      },

      setLanguage: async (language: LanguageType) => {
        set({ currentLanguage: language });
        // Update i18n language using the centralized function
        await changeLanguage(language);
      },

      setThemeLoading: (loading: boolean) => set({ isThemeLoading: loading }),

      setLanguageLoading: (loading: boolean) =>
        set({ isLanguageLoading: loading }),

      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),

      initializeFromSystem: (systemColorScheme: 'light' | 'dark' | null) => {
        const currentState = get();
        // Only initialize if we haven't hydrated yet or if no theme is set
        if (!currentState.hasHydrated && currentState.themeMode === 'light') {
          const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
          const isDark = systemTheme === 'dark';
          const theme = isDark ? darkTheme : lightTheme;
          set({ themeMode: systemTheme, theme, isDark });
        }
      },

      initializeApp: async () => {
        const currentState = get();

        // Apply current theme after hydration
        const isDark = currentState.themeMode === 'dark';
        const theme = isDark ? darkTheme : lightTheme;
        set({ theme, isDark });

        // Initialize language using the centralized function
        await changeLanguage(currentState.currentLanguage);
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        themeMode: state.themeMode,
        currentLanguage: state.currentLanguage,
      }),
      onRehydrateStorage: () => state => {
        // This callback is called when the store is rehydrated
        if (state) {
          state.setHasHydrated(true);
          // Apply the hydrated theme
          const isDark = state.themeMode === 'dark';
          const theme = isDark ? darkTheme : lightTheme;
          state.theme = theme;
          state.isDark = isDark;
        }
      },
    },
  ),
);

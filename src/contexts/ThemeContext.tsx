import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode } from '../types/theme';
import { lightTheme, darkTheme } from '../themes/colors';

const THEME_STORAGE_KEY = '@SmartScanner:theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Determine if we should use dark theme
  const isDark = themeMode === 'dark';

  // Get the current theme based on isDark
  const theme = isDark ? darkTheme : lightTheme;

  // Load theme preference from storage or use system default
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
          // User has a saved preference, use it
          setThemeModeState(savedTheme as ThemeMode);
        } else {
          // No saved preference, detect from system and save it
          const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
          setThemeModeState(systemTheme);
          await AsyncStorage.setItem(THEME_STORAGE_KEY, systemTheme);
        }
      } catch (error) {
        console.warn('Error loading theme preference:', error);
        // Fallback to system theme if storage fails
        const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
        setThemeModeState(systemTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  // Save theme preference to storage
  const setThemeMode = async (mode: ThemeMode): Promise<void> => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

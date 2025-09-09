import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AppInitializer } from './src/components';
import { useAppStore } from './src/store';
import './src/locales/i18n'; // Initialize i18n

// Inner component that has access to theme store
const AppContent: React.FC = () => {
  const { isDark, theme } = useAppStore();

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

function App() {
  return (
    <SafeAreaProvider>
      <AppInitializer>
        <AppContent />
      </AppInitializer>
    </SafeAreaProvider>
  );
}

export default App;

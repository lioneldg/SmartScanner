import React, { useEffect, ReactNode, useState } from "react";
import {
  useColorScheme,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAppStore } from "../store";

interface AppInitializerProps {
  children: ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { hasHydrated, initializeFromSystem, initializeApp } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Wait for hydration and then initialize the app
  useEffect(() => {
    const initializeAppState = async () => {
      if (hasHydrated && !isInitialized) {
        // First initialize from system if needed
        initializeFromSystem(systemColorScheme as "light" | "dark" | null);

        // Then initialize the app (theme and language)
        await initializeApp();

        setIsInitialized(true);
      }
    };

    initializeAppState();
  }, [
    hasHydrated,
    systemColorScheme,
    initializeFromSystem,
    initializeApp,
    isInitialized,
  ]);

  // Show loading indicator while waiting for hydration and initialization
  if (!hasHydrated || !isInitialized) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" testID="activity-indicator" />
      </View>
    );
  }

  return <>{children}</>;
};

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppInitializer;

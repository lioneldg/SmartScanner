import React, { useCallback } from "react";
import { TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "./types";
import { useAppStore, useScanStore } from "../store";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ScansScreen from "../screens/ScansScreen";
import TextEditScreen from "../screens/TextEditScreen";
import { Ionicons } from "@react-native-vector-icons/ionicons";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const { scanHistory, clearHistory } = useScanStore();

  const renderSettingsButton = useCallback(
    (navigation: NavigationProp<RootStackParamList>) => (
      <TouchableOpacity
        onPress={() => navigation.navigate("Settings")}
        style={styles.settingsButton}
      >
        <Ionicons name="settings-outline" size={26} color={theme.colors.text} />
      </TouchableOpacity>
    ),
    [theme.colors.text]
  );

  const renderClearButton = useCallback(() => {
    const handleClearAll = () => {
      Alert.alert(t("scans.clearAll"), t("scans.clearAllMessage"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.clear"),
          style: "destructive",
          onPress: clearHistory,
        },
      ]);
    };

    if (scanHistory.length === 0) {
      return null;
    }

    return (
      <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    );
  }, [scanHistory.length, theme.colors.error, t, clearHistory]);

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: theme.typography.weights.bold,
        },
        headerTitleAlign: "center",
        headerBackTitle: t("common.goBack"),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: t("home.title"),
          headerRight: () => renderSettingsButton(navigation),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t("navigation.settings"),
        }}
      />
      <Stack.Screen
        name="Scans"
        component={ScansScreen}
        options={{
          title: t("navigation.scans"),
          headerRight: () => renderClearButton(),
        }}
      />
      <Stack.Screen
        name="TextEdit"
        component={TextEditScreen}
        options={{
          title: t("textEdit.title"),
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    padding: 8,
  },
  clearButton: {
    padding: 8,
  },
});

export default AppNavigator;

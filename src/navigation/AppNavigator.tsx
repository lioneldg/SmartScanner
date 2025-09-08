import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from './types';
import { useTheme } from '../contexts/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const renderSettingsButton = useCallback(
    (navigation: any) => (
      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')}
        style={styles.settingsButton}
      >
        <Icon name="settings-outline" size={26} color={theme.colors.text} />
      </TouchableOpacity>
    ),
    [theme.colors.text],
  );

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
        headerTitleAlign: 'center',
        headerBackTitle: t('common.goBack'),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: t('home.title'),
          headerRight: () => renderSettingsButton(navigation),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('navigation.settings'),
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    padding: 8,
  },
});

export default AppNavigator;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Create dynamic styles based on theme
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>
      <Text style={styles.subtitle}>{t('home.welcome')}</Text>
      <Text style={styles.description}>{t('home.description')}</Text>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          // TODO: Implement scanning functionality
          console.log('Start scanning...');
        }}
      >
        <Text style={styles.scanButtonText}>{t('home.startScanning')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>{t('navigation.profile')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.buttonText}>{t('navigation.settings')}</Text>
      </TouchableOpacity>
    </View>
  );
};

// Create dynamic styles based on theme
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      marginBottom: theme.spacing.sm,
      color: theme.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    description: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.xxl,
      textAlign: 'center',
    },
    scanButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.xl,
      minWidth: 250,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    scanButtonText: {
      color: 'white',
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      textAlign: 'center',
    },
    button: {
      backgroundColor: theme.colors.info,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
      minWidth: 200,
    },
    buttonText: {
      color: 'white',
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.semibold,
      textAlign: 'center',
    },
  });

export default HomeScreen;

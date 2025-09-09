import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { t } = useTranslation();
  const { theme } = useAppStore();

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
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    scanButtonText: {
      color: theme.colors.background,
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      textAlign: 'center',
    },
  });

export default HomeScreen;

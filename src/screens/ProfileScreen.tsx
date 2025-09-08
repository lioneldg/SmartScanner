import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Create dynamic styles based on theme
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Text style={styles.info}>{t('profile.info')}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>{t('common.goBack')}</Text>
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
      marginBottom: theme.spacing.lg,
      color: theme.colors.text,
    },
    info: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xxl,
      textAlign: 'center',
    },
    button: {
      backgroundColor: theme.colors.success,
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

export default ProfileScreen;

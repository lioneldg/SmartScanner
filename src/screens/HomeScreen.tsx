import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAppStore, useScanStore } from '../store';
import { RootStackParamList } from '../navigation/types';
import { adaptiveOcrService } from '../services/AdaptiveOcrService';
import { cameraService } from '../services/CameraService';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const { addScanResult, isScanning, setScanning, ocrSettings, scanHistory } =
    useScanStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [ocrReady, setOcrReady] = useState(false);

  // Create dynamic styles based on theme
  const styles = createStyles(theme);

  const initializeOCR = useCallback(async () => {
    console.log('HomeScreen: Starting OCR initialization...');

    // Test module availability first
    try {
      const platformInfo = adaptiveOcrService.getPlatformInfo();
      console.log('HomeScreen: Platform info:', platformInfo);
    } catch (error) {
      console.error('HomeScreen: Failed to get platform info:', error);
      Alert.alert(
        'Module Error',
        'OCR module not found. This indicates a native module registration issue.',
        [{ text: t('common.ok') }],
      );
      return;
    }

    if (
      adaptiveOcrService.isReady() &&
      adaptiveOcrService.getCurrentLanguage() === ocrSettings.language
    ) {
      console.log('HomeScreen: OCR already ready');
      setOcrReady(true);
      return;
    }

    setIsInitializing(true);
    try {
      console.log('HomeScreen: Calling adaptiveOcrService.initialize...');
      await adaptiveOcrService.initialize({ language: ocrSettings.language });
      adaptiveOcrService.updateSettings(ocrSettings);
      setOcrReady(true);

      const platformInfo = adaptiveOcrService.getPlatformInfo();
      console.log(
        `OCR initialized: ${platformInfo.engine} on ${platformInfo.platform}`,
      );
    } catch (error) {
      console.error('Failed to initialize OCR:', error);
      Alert.alert(t('error.ocrInit'), t('error.ocrInitMessage'), [
        { text: t('common.ok') },
      ]);
    } finally {
      setIsInitializing(false);
    }
  }, [ocrSettings, t]);

  // Initialize OCR on component mount
  useEffect(() => {
    initializeOCR();
  }, [initializeOCR]);

  const handleScanPress = async () => {
    if (!ocrReady) {
      Alert.alert(t('error.ocrNotReady'), t('error.ocrNotReadyMessage'), [
        { text: t('common.ok') },
      ]);
      return;
    }

    try {
      // Show image source selection
      const captureResult = await cameraService.showSourceSelection(
        cameraService.getOcrOptimizedOptions(),
        t,
      );

      // Now that user has selected a source, start loading state
      setScanning(true);

      // Extract text using OCR
      const scanResult = await adaptiveOcrService.extractTextFromImage({
        uri: captureResult.uri,
      });

      // Add to scan history
      addScanResult(scanResult);

      // Copy to clipboard automatically
      if (scanResult.text.trim()) {
        Clipboard.setString(scanResult.text);
        Alert.alert(
          t('success.textExtracted'),
          scanResult.text.substring(0, 200) +
            (scanResult.text.length > 200 ? '...' : '') +
            '\n\n' +
            t('success.copiedToClipboard'),
          [{ text: t('common.ok') }],
        );
      } else {
        Alert.alert(t('warning.noText'), t('warning.noTextMessage'), [
          { text: t('common.ok') },
        ]);
      }
    } catch (error) {
      console.error('Scan error:', error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes('cancelled') ||
        errorMessage.includes('User cancelled') ||
        errorMessage.toLowerCase().includes('cancel')
      ) {
        // User cancelled, no need to show error
        console.log('User cancelled detected, stopping scan');
        return;
      }

      Alert.alert(
        t('error.scanFailed'),
        errorMessage || t('error.scanFailedMessage'),
        [{ text: t('common.ok') }],
      );
    } finally {
      console.log('Finally block executed, setting scanning to false');
      setScanning(false);
    }
  };

  const renderScansButton = () => {
    if (scanHistory.length === 0) return null;

    return (
      <TouchableOpacity
        style={styles.scansButton}
        onPress={() => navigation.navigate('Scans')}
      >
        <Ionicons
          name="list-outline"
          size={20}
          color={theme.colors.primary}
          style={styles.buttonIcon}
        />
        <Text style={styles.scansButtonText}>
          {t('home.viewScans')} ({scanHistory.length})
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.textTertiary}
        />
      </TouchableOpacity>
    );
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('home.initializingOCR')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>{t('home.title')}</Text>
      <Text style={styles.subtitle}>{t('home.welcome')}</Text>
      <Text style={styles.description}>{t('home.description')}</Text>

      {/* Main scan button */}
      <TouchableOpacity
        style={[
          styles.scanButton,
          (!ocrReady || isScanning) && styles.scanButtonDisabled,
        ]}
        onPress={handleScanPress}
        disabled={!ocrReady || isScanning}
      >
        {isScanning ? (
          <ActivityIndicator size="small" color={theme.colors.buttonText} />
        ) : (
          <>
            <Ionicons
              name="scan"
              size={24}
              color={theme.colors.buttonText}
              style={styles.buttonIcon}
            />
            <Text style={styles.scanButtonText}>{t('home.startScanning')}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Scans button */}
      {renderScansButton()}

      {/* OCR Status */}
      <View style={styles.statusContainer}>
        <Ionicons
          name={ocrReady ? 'checkmark-circle' : 'alert-circle'}
          size={16}
          color={ocrReady ? theme.colors.success : theme.colors.warning}
        />
        <Text
          style={[
            styles.statusText,
            { color: ocrReady ? theme.colors.success : theme.colors.warning },
          ]}
        >
          {ocrReady ? t('home.ocrReady') : t('home.ocrNotReady')}
        </Text>
      </View>
    </ScrollView>
  );
};

// Create dynamic styles based on theme
const createStyles = (theme: any) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
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
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },
    scanButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      minWidth: 250,
      elevation: 3,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanButtonDisabled: {
      backgroundColor: theme.colors.textTertiary,
      elevation: 0,
      shadowOpacity: 0,
    },
    scanButtonText: {
      color: theme.colors.buttonText,
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      textAlign: 'center',
    },
    buttonIcon: {
      marginRight: theme.spacing.sm,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    quickActionButton: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    quickActionText: {
      color: theme.colors.primary,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      marginLeft: theme.spacing.xs,
    },
    scansButton: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    scansButtonText: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
    },
    statusText: {
      fontSize: theme.typography.sizes.xs,
      marginLeft: theme.spacing.xs,
      fontWeight: theme.typography.weights.medium,
    },
  });

export default HomeScreen;

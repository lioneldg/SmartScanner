import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAppStore, useScanStore } from "../store";
import { RootStackParamList } from "../navigation/types";
import { adaptiveOcrService } from "../services/AdaptiveOcrService";
import { cameraService } from "../services/CameraService";
import { Theme } from "../types/theme";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const { isScanning, setScanning, ocrSettings, scanHistory } = useScanStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [ocrReady, setOcrReady] = useState(false);

  // Create dynamic styles based on theme
  const styles = createStyles(theme);

  const initializeOCR = useCallback(async () => {
    console.log("HomeScreen: Starting OCR initialization...");

    // Test module availability first
    try {
      const platformInfo = adaptiveOcrService.getPlatformInfo();
      console.log("HomeScreen: Platform info:", platformInfo);
    } catch (error) {
      console.error("HomeScreen: Failed to get platform info:", error);
      Alert.alert(
        "Module Error",
        "OCR module not found. This indicates a native module registration issue.",
        [{ text: t("common.ok") }]
      );
      return;
    }

    if (
      adaptiveOcrService.isReady() &&
      adaptiveOcrService.getCurrentLanguage() === ocrSettings.language
    ) {
      console.log("HomeScreen: OCR already ready");
      setOcrReady(true);
      return;
    }

    setIsInitializing(true);
    try {
      console.log("HomeScreen: Calling adaptiveOcrService.initialize...");
      await adaptiveOcrService.initialize({ language: ocrSettings.language });
      adaptiveOcrService.updateSettings(ocrSettings);
      setOcrReady(true);

      const platformInfo = adaptiveOcrService.getPlatformInfo();
      console.log(
        `OCR initialized: ${platformInfo.engine} on ${platformInfo.platform}`
      );
    } catch (error) {
      console.error("Failed to initialize OCR:", error);
      Alert.alert(t("error.ocrInit"), t("error.ocrInitMessage"), [
        { text: t("common.ok") },
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
      Alert.alert(t("error.ocrNotReady"), t("error.ocrNotReadyMessage"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    try {
      // Show image source selection
      const captureResult = await cameraService.showSourceSelection(
        cameraService.getOcrOptimizedOptions(),
        t
      );

      // Now that user has selected a source, start loading state
      setScanning(true);

      // Extract text using OCR
      const scanResult = await adaptiveOcrService.extractTextFromImage({
        uri: captureResult.uri,
      });

      // Only proceed if text was detected
      if (scanResult.text.trim()) {
        // Navigate to text edit screen instead of showing alert
        navigation.navigate("TextEdit", {
          extractedText: scanResult.text,
          imageUri: scanResult.imageUri,
          confidence: scanResult.confidence,
        });
      } else {
        Alert.alert(t("warning.noText"), t("warning.noTextMessage"), [
          { text: t("common.ok") },
        ]);
      }
    } catch (error) {
      console.error("Scan error:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("User cancelled") ||
        errorMessage.toLowerCase().includes("cancel")
      ) {
        // User cancelled, no need to show error
        console.log("User cancelled detected, stopping scan");
        return;
      }

      Alert.alert(
        t("error.scanFailed"),
        errorMessage || t("error.scanFailedMessage"),
        [{ text: t("common.ok") }]
      );
    } finally {
      console.log("Finally block executed, setting scanning to false");
      setScanning(false);
    }
  };

  const renderScansButton = () => {
    if (scanHistory.length === 0) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.scansButton}
        onPress={() => navigation.navigate("Scans")}
      >
        <Ionicons
          name="list-outline"
          size={20}
          color={theme.colors.primary}
          style={styles.buttonIcon}
        />
        <Text style={styles.scansButtonText}>
          {t("home.viewScans")} ({scanHistory.length})
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
        <Text style={styles.loadingText}>{t("home.initializingOCR")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {/* Welcome section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.subtitle}>{t("home.welcome")}</Text>
        <Text style={styles.description}>{t("home.description")}</Text>
      </View>

      {/* Main scan button */}
      <View style={styles.scanSection}>
        <TouchableOpacity
          style={[
            styles.scanButton,
            (!ocrReady || isScanning) && styles.scanButtonDisabled,
          ]}
          onPress={handleScanPress}
          disabled={!ocrReady || isScanning}
          testID="scan-button"
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
              <Text style={styles.scanButtonText}>
                {t("home.startScanning")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Secondary actions */}
      <View style={styles.secondaryActions}>
        {renderScansButton()}

        {/* OCR Status */}
        <View style={styles.statusContainer}>
          <Ionicons
            name={ocrReady ? "checkmark-circle" : "alert-circle"}
            size={16}
            color={ocrReady ? theme.colors.success : theme.colors.warning}
          />
          <Text
            style={[
              styles.statusText,
              { color: ocrReady ? theme.colors.success : theme.colors.warning },
            ]}
          >
            {ocrReady ? t("home.ocrReady") : t("home.ocrNotReady")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Create dynamic styles based on theme
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    welcomeSection: {
      alignItems: "center",
      marginBottom: theme.spacing.xxl,
    },
    scanSection: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    secondaryActions: {
      width: "100%",
      alignItems: "center",
      gap: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: theme.typography.sizes.xl,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: "center",
      fontWeight: theme.typography.weights.semibold,
    },
    description: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 300,
    },
    scanButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      minWidth: 280,
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
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
      textAlign: "center",
    },
    buttonIcon: {
      marginRight: theme.spacing.sm,
    },
    scansButton: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      width: "100%",
      maxWidth: 300,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 2,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    scansButtonText: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statusText: {
      fontSize: theme.typography.sizes.xs,
      marginLeft: theme.spacing.xs,
      fontWeight: theme.typography.weights.medium,
    },
  });

export default HomeScreen;

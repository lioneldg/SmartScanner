import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store";
import { Theme } from "../types/theme";
import DateFormatService from "../services/DateFormatService";

type ViewScanScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ViewScan"
>;

const ViewScanScreen: React.FC<ViewScanScreenProps> = ({ route }) => {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const { scan } = route?.params || {};

  // Early return if scan is not available or theme is not ready
  if (!scan || !theme) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("error.scanNotFound")}</Text>
      </View>
    );
  }

  // Create dynamic styles based on theme
  const styles = createStyles(theme);

  const handleCopyToClipboard = () => {
    if (scan?.text) {
      Clipboard.setString(scan.text);
      Alert.alert(t("success.copied"), t("success.copiedMessage"), [
        { text: t("common.ok") },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with copy button */}
      <View style={styles.header}>
        <View style={styles.scanInfo}>
          <Text style={styles.confidenceText}>
            {Math.round(scan.confidence)}% {t("viewScan.confidence")}
          </Text>
          <Text style={styles.dateText}>
            {DateFormatService.formatDate(scan.timestamp)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyToClipboard}
          testID="copy-button"
        >
          <Ionicons
            name="copy-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Scrollable text content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.scanText}>{scan.text}</Text>
      </ScrollView>
    </View>
  );
};

// Create dynamic styles based on theme
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    scanInfo: {
      flex: 1,
    },
    confidenceText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    dateText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textSecondary,
    },
    copyButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 1,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    scanText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
      lineHeight: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    errorText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.error,
      textAlign: "center",
      marginTop: theme.spacing.xl,
    },
  });

export default ViewScanScreen;

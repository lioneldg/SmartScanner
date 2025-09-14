import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store";
import { ThemeMode, Theme } from "../types/theme";
import {
  LANGUAGES,
  LanguageType,
  getAvailableLanguageOptions,
} from "../locales/i18n";

type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Settings"
>;

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { t } = useTranslation();
  const {
    currentLanguage,
    setLanguage,
    isLanguageLoading,
    themeMode,
    setThemeMode,
    isThemeLoading,
    setLanguageLoading,
    setThemeLoading,
    theme,
  } = useAppStore();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Get available language options based on system language
  const availableOptions = getAvailableLanguageOptions();
  const languageOptions = availableOptions.map((option) => ({
    key: option.key,
    label: t(option.labelKey),
  }));

  // Theme options
  const themeOptions = [
    { key: "light" as ThemeMode, label: t("common.light") },
    { key: "dark" as ThemeMode, label: t("common.dark") },
  ];

  const handleLanguageChange = async (language: LanguageType) => {
    setLanguageLoading(true);
    try {
      await setLanguage(language);
      setShowLanguageModal(false);
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setLanguageLoading(false);
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeLoading(true);
    setThemeMode(mode);
    setShowThemeModal(false);
    setThemeLoading(false);
  };

  const getCurrentLanguageLabel = () => {
    const option = languageOptions.find((opt) => opt.key === currentLanguage);
    if (option) {
      return option.label;
    }

    // If current language is not in available options, show the appropriate label
    switch (currentLanguage) {
      case LANGUAGES.SYSTEM:
        return t("common.system");
      case LANGUAGES.EN:
        return t("common.english");
      case LANGUAGES.FR:
        return t("common.french");
      default:
        return t("common.system");
    }
  };

  const getCurrentThemeLabel = () => {
    const option = themeOptions.find((opt) => opt.key === themeMode);
    return option ? option.label : t("common.light");
  };

  const renderLanguageOption = ({
    item,
  }: {
    item: { key: LanguageType; label: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.option,
        item.key === currentLanguage && styles.selectedOption,
      ]}
      onPress={() => handleLanguageChange(item.key)}
    >
      <Text
        style={[
          styles.optionText,
          item.key === currentLanguage && styles.selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
      {item.key === currentLanguage && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  const renderThemeOption = ({
    item,
  }: {
    item: { key: ThemeMode; label: string };
  }) => (
    <TouchableOpacity
      style={[styles.option, item.key === themeMode && styles.selectedOption]}
      onPress={() => handleThemeChange(item.key)}
    >
      <Text
        style={[
          styles.optionText,
          item.key === themeMode && styles.selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
      {item.key === themeMode && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  // Create dynamic styles based on theme
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("settings.title")}</Text>

      {/* Language Selection */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowLanguageModal(true)}
          disabled={isLanguageLoading}
        >
          <Text style={styles.selectorText}>{getCurrentLanguageLabel()}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Selection */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>{t("settings.theme")}</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowThemeModal(true)}
          disabled={isThemeLoading}
        >
          <Text style={styles.selectorText}>{getCurrentThemeLabel()}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("settings.selectLanguage")}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={languageOptions}
              renderItem={renderLanguageOption}
              keyExtractor={(item) => item.key}
              style={styles.optionsList}
            />
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings.selectTheme")}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowThemeModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={themeOptions}
              renderItem={renderThemeOption}
              keyExtractor={(item) => item.key}
              style={styles.optionsList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Create dynamic styles based on theme
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
      textAlign: "center",
    },
    settingSection: {
      width: "100%",
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    selector: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectorText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
    },
    arrow: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.weights.bold,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
      minWidth: 200,
    },
    buttonText: {
      color: theme.colors.background,
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.semibold,
      textAlign: "center",
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.modalBackground,
      borderRadius: theme.borderRadius.lg,
      padding: 0,
      width: "80%",
      maxHeight: "60%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
    },
    closeButton: {
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    closeButtonText: {
      fontSize: 24,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.weights.bold,
    },
    optionsList: {
      maxHeight: 200,
    },
    option: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    selectedOption: {
      backgroundColor: theme.colors.surface,
    },
    optionText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
    },
    selectedOptionText: {
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.semibold,
    },
    checkmark: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.bold,
    },
  });

export default SettingsScreen;

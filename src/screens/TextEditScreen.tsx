import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import { RootStackParamList } from "../navigation/types";
import { useAppStore, useScanStore } from "../store";
import { Theme } from "../types/theme";

type TextEditScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "TextEdit"
>;

const TextEditScreen: React.FC<TextEditScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const { addScanResult } = useScanStore();
  const {
    extractedText = "",
    imageUri = "",
    confidence = 0,
  } = route.params || {};

  const [editedText, setEditedText] = useState(extractedText);

  // Check if text has been modified
  const hasTextChanged = editedText !== extractedText;

  // Create dynamic styles based on theme
  const styles = createStyles(theme);

  const handleSave = useCallback(() => {
    if (!editedText.trim()) {
      Alert.alert(t("error.emptyText"), t("error.emptyTextMessage"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    // Create scan result with edited text
    const scanResult = {
      id: Date.now().toString(),
      text: editedText.trim(),
      confidence: confidence || 0,
      timestamp: Date.now(),
      imageUri: imageUri || "",
      type: "text" as const,
      language: "eng", // Default language
      processing_time_ms: 0, // Default processing time
    };

    // Add to scan history
    addScanResult(scanResult);

    // Copy to clipboard
    Clipboard.setString(editedText.trim());

    Alert.alert(t("success.textSaved"), t("success.textSavedMessage"), [
      {
        text: t("common.ok"),
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [editedText, confidence, imageUri, addScanResult, t, navigation]);

  const handleReset = useCallback(() => {
    setEditedText(extractedText);
  }, [extractedText]);

  // Configure header with save button only
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Ionicons
              name="checkmark-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        ),
      });
    }, [navigation, handleSave, theme.colors.text])
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.textInput}
          value={editedText}
          onChangeText={setEditedText}
          placeholder={t("textEdit.placeholder")}
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />

        {hasTextChanged && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Ionicons
                name="refresh-outline"
                size={20}
                color={theme.colors.text}
              />
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                {t("textEdit.reset")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    textInput: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      minHeight: 300,
      marginBottom: 16,
    },
    buttonContainer: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 8,
    },
    buttonText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
    },
    headerButton: {
      padding: 8,
    },
  });

export default TextEditScreen;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

// Import translation files
import en from './en.json';
import fr from './fr.json';

// Available languages
export const LANGUAGES = {
  SYSTEM: 'system',
  EN: 'en',
  FR: 'fr',
} as const;

export type LanguageType = (typeof LANGUAGES)[keyof typeof LANGUAGES];

// Translation resources
const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

// Get device locale
const getDeviceLocale = (): string => {
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    return locales[0].languageCode;
  }
  return 'en'; // fallback
};

const determineLanguage = (selectedLanguage: LanguageType): string => {
  if (selectedLanguage !== LANGUAGES.SYSTEM) {
    return selectedLanguage;
  }

  const deviceLocale = getDeviceLocale();

  // Corrected logic:
  // - English if device is in English (same language)
  // - French if device is in French (same language)
  // - English if device is in another language (default to English)
  switch (deviceLocale) {
    case 'en':
      return 'en'; // English if phone is in English
    case 'fr':
      return 'fr'; // French if phone is in French
    default:
      return 'en'; // English if phone is in another language
  }
};

// Storage keys
const STORAGE_KEY = 'selected_language';

// Get stored language preference
const getStoredLanguage = async (): Promise<LanguageType> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && Object.values(LANGUAGES).includes(stored as LanguageType)) {
      return stored as LanguageType;
    }
  } catch (error) {
    console.warn('Error getting stored language:', error);
  }
  return LANGUAGES.SYSTEM; // default to system
};

// Check if a language is available in current options
export const isLanguageAvailable = (language: LanguageType): boolean => {
  const availableOptions = getAvailableLanguageOptions();
  return availableOptions.some(option => option.key === language);
};

// Get fallback language if current is not available
export const getFallbackLanguage = (
  currentLanguage: LanguageType,
): LanguageType => {
  if (isLanguageAvailable(currentLanguage)) {
    return currentLanguage;
  }

  const availableOptions = getAvailableLanguageOptions();
  return availableOptions[0]?.key || LANGUAGES.SYSTEM;
};

// Store language preference
export const storeLanguagePreference = async (
  language: LanguageType,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    console.warn('Error storing language preference:', error);
  }
};

// Initialize i18n
const initI18n = async (): Promise<void> => {
  const selectedLanguage = await getStoredLanguage();
  const actualLanguage = determineLanguage(selectedLanguage);

  await i18n.use(initReactI18next).init({
    resources,
    lng: actualLanguage,
    fallbackLng: 'en',
    debug: __DEV__,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

// Change language
export const changeLanguage = async (language: LanguageType): Promise<void> => {
  await storeLanguagePreference(language);
  const actualLanguage = determineLanguage(language);
  await i18n.changeLanguage(actualLanguage);
};

// Get current selected language preference (not the actual i18n language)
export const getCurrentLanguagePreference = async (): Promise<LanguageType> => {
  return await getStoredLanguage();
};

// Get available language options based on system language
export const getAvailableLanguageOptions = () => {
  const deviceLocale = getDeviceLocale();

  switch (deviceLocale) {
    case 'fr':
      // If system is French: System (=French) and English
      return [
        { key: LANGUAGES.SYSTEM as LanguageType, labelKey: 'common.system' },
        { key: LANGUAGES.EN as LanguageType, labelKey: 'common.english' },
      ];
    case 'en':
      // If system is English: System (=English) and French
      return [
        { key: LANGUAGES.SYSTEM as LanguageType, labelKey: 'common.system' },
        { key: LANGUAGES.FR as LanguageType, labelKey: 'common.french' },
      ];
    default:
      // If system is other language: English and French (no System option)
      return [
        { key: LANGUAGES.EN as LanguageType, labelKey: 'common.english' },
        { key: LANGUAGES.FR as LanguageType, labelKey: 'common.french' },
      ];
  }
};

// Initialize on import
initI18n();

export default i18n;

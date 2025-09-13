import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
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

// Note: Language storage is now handled by the app store (Zustand)
// This is kept for backward compatibility but not actively used

// Initialize i18n with default settings
const initI18n = async (): Promise<void> => {
  // Start with system language detection
  const systemLanguage = getDeviceLocale();
  const initialLanguage = systemLanguage === 'fr' ? 'fr' : 'en';

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
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

// Change language (used by the app store)
export const changeLanguage = async (language: LanguageType): Promise<void> => {
  const actualLanguage = determineLanguage(language);
  await i18n.changeLanguage(actualLanguage);
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

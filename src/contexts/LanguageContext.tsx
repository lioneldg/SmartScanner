import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  changeLanguage,
  getCurrentLanguagePreference,
  LanguageType,
  LANGUAGES,
  getFallbackLanguage,
} from '../locales/i18n';

interface LanguageContextType {
  currentLanguage: LanguageType;
  setLanguage: (language: LanguageType) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageType>(
    LANGUAGES.SYSTEM,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const storedLanguage = await getCurrentLanguagePreference();
        const validLanguage = getFallbackLanguage(storedLanguage);
        setCurrentLanguage(validLanguage);

        // If the stored language is not valid, update the storage with fallback
        if (storedLanguage !== validLanguage) {
          await changeLanguage(validLanguage);
        }
      } catch (error) {
        console.warn('Error initializing language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = async (language: LanguageType): Promise<void> => {
    try {
      setIsLoading(true);
      await changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

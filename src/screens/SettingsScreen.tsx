import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LANGUAGES,
  LanguageType,
  getAvailableLanguageOptions,
} from '../locales/i18n';

type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, isLoading } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Get available language options based on system language
  const availableOptions = getAvailableLanguageOptions();
  const languageOptions = availableOptions.map(option => ({
    key: option.key,
    label: t(option.labelKey),
  }));

  const handleLanguageChange = async (language: LanguageType) => {
    try {
      await setLanguage(language);
      setShowLanguageModal(false);
      Alert.alert(t('settings.languageChanged'), '', [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to change language. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const getCurrentLanguageLabel = () => {
    const option = languageOptions.find(opt => opt.key === currentLanguage);
    if (option) {
      return option.label;
    }

    // If current language is not in available options, show the appropriate label
    switch (currentLanguage) {
      case LANGUAGES.SYSTEM:
        return t('common.system');
      case LANGUAGES.EN:
        return t('common.english');
      case LANGUAGES.FR:
        return t('common.french');
      default:
        return t('common.system');
    }
  };

  const renderLanguageOption = ({
    item,
  }: {
    item: { key: LanguageType; label: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.languageOption,
        item.key === currentLanguage && styles.selectedLanguageOption,
      ]}
      onPress={() => handleLanguageChange(item.key)}
    >
      <Text
        style={[
          styles.languageOptionText,
          item.key === currentLanguage && styles.selectedLanguageOptionText,
        ]}
      >
        {item.label}
      </Text>
      {item.key === currentLanguage && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <Text style={styles.info}>{t('settings.info')}</Text>

      {/* Language Selection */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <TouchableOpacity
          style={styles.languageSelector}
          onPress={() => setShowLanguageModal(true)}
          disabled={isLoading}
        >
          <Text style={styles.languageSelectorText}>
            {getCurrentLanguageLabel()}
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>{t('common.goBack')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>{t('common.goToHome')}</Text>
      </TouchableOpacity>

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
                {t('settings.selectLanguage')}
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
              keyExtractor={item => item.key}
              style={styles.languageList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  settingSection: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  languageSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    width: '80%',
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  languageList: {
    maxHeight: 200,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  selectedLanguageOption: {
    backgroundColor: '#e3f2fd',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageOptionText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;

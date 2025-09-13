import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAppStore, useScanStore } from '../store';
import { RootStackParamList } from '../navigation/types';
import { ScanResult } from '../types/ocr';
import DateFormatService from '../services/DateFormatService';

type ScansScreenProps = NativeStackScreenProps<RootStackParamList, 'Scans'>;

const ScansScreen: React.FC<ScansScreenProps> = ({}) => {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const { scanHistory, deleteScanItem, getStatistics } = useScanStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Create dynamic styles based on theme
  const styles = createStyles(theme);

  const handleCopyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert(t('success.copied'), t('success.copiedMessage'), [
      { text: t('common.ok') },
    ]);
  };

  const handleCopyPress = (scan: ScanResult) => {
    handleCopyToClipboard(scan.text);
  };

  const handleLongPress = (scan: ScanResult) => {
    Alert.alert(
      t('scans.actions'),
      scan.text.substring(0, 100) + (scan.text.length > 100 ? '...' : ''),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('scans.delete'),
          style: 'destructive',
          onPress: () => handleDeleteScan(scan.id),
        },
      ],
    );
  };

  const handleDeleteScan = async (id: string) => {
    setIsDeleting(id);
    try {
      deleteScanItem(id);
    } catch (error) {
      Alert.alert(t('error.deleteFailed'), t('error.deleteFailedMessage'), [
        { text: t('common.ok') },
      ]);
    } finally {
      setIsDeleting(null);
    }
  };

  const renderScanItem = ({ item }: { item: ScanResult }) => (
    <View style={styles.scanItem}>
      {isDeleting === item.id ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.scanItemContent}
            onLongPress={() => handleLongPress(item)}
            disabled={isDeleting === item.id}
          >
            <Text style={styles.scanText} numberOfLines={3}>
              {item.text}
            </Text>
            <View style={styles.scanMeta}>
              <Text style={styles.scanMetaText}>
                {Math.round(item.confidence)}%
              </Text>
              <Text style={styles.scanMetaText}>
                {DateFormatService.formatScanDate(item.timestamp)}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopyPress(item)}
            disabled={isDeleting === item.id}
          >
            <Ionicons
              name="copy-outline"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="scan-outline"
        size={64}
        color={theme.colors.textTertiary}
      />
      <Text style={styles.emptyTitle}>{t('scans.noScans')}</Text>
      <Text style={styles.emptyMessage}>{t('scans.noScansMessage')}</Text>
    </View>
  );

  const stats = getStatistics();

  return (
    <View style={styles.container}>
      {/* Statistics */}
      {stats.totalScans > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>{t('scans.statistics')}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>
              {t('scans.total')}: {stats.totalScans}
            </Text>
            <Text style={styles.statItem}>
              {t('scans.avgConfidence')}: {Math.round(stats.averageConfidence)}%
            </Text>
          </View>
        </View>
      )}

      {/* Scans List */}
      <FlatList
        data={scanHistory}
        renderItem={renderScanItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Create dynamic styles based on theme
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    statsContainer: {
      backgroundColor: theme.colors.surface,
      margin: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
    },
    statsTitle: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    listContainer: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    scanItem: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    scanItemContent: {
      flex: 1,
    },
    copyButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
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
    scanText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: theme.spacing.xs,
    },
    scanMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    scanMetaText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textTertiary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    emptyMessage: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

export default ScansScreen;

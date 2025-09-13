import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanResult, OcrSettings } from '../types/ocr';

interface ScanItem extends ScanResult {
  // Extending ScanResult which already has all needed properties
}

interface ScanState {
  // Scan history
  scanHistory: ScanItem[];

  // Current scan state
  isScanning: boolean;
  lastScanResult: ScanResult | null;

  // OCR settings
  ocrSettings: OcrSettings;

  // Statistics
  totalScans: number;
  averageConfidence: number;

  // Actions
  addScanResult: (scanResult: ScanResult) => void;
  addScanResultLegacy: (content: string, type: ScanItem['type']) => void; // For backward compatibility
  clearHistory: () => void;
  deleteScanItem: (id: string) => void;
  setScanning: (scanning: boolean) => void;
  setLastScanResult: (result: ScanResult | null) => void;
  updateOcrSettings: (settings: Partial<OcrSettings>) => void;
  getStatistics: () => {
    totalScans: number;
    averageConfidence: number;
    languageDistribution: Record<string, number>;
  };
  exportScanHistory: () => string;
  importScanHistory: (jsonData: string) => boolean;
}

export const useScanStore = create<ScanState>()(
  persist(
    (set, get) => ({
      // Initial state
      scanHistory: [],
      isScanning: false,
      lastScanResult: null,
      totalScans: 0,
      averageConfidence: 0,
      ocrSettings: {
        language: 'eng',
        autoDetectTextType: true,
        minimumConfidence: 60,
        preprocessImage: true,
      },

      // Actions
      addScanResult: (scanResult: ScanResult) => {
        const newScan: ScanItem = {
          ...scanResult,
        };

        set(state => {
          const newHistory = [newScan, ...state.scanHistory];
          // Keep only the last 15 scans
          const limitedHistory = newHistory.slice(0, 15);
          const newTotalScans = limitedHistory.length;

          // Calculate new average confidence
          const totalConfidence = limitedHistory.reduce(
            (sum, item) => sum + item.confidence,
            0,
          );
          const newAverageConfidence =
            newTotalScans > 0 ? totalConfidence / newTotalScans : 0;

          return {
            scanHistory: limitedHistory,
            lastScanResult: scanResult,
            totalScans: newTotalScans,
            averageConfidence: newAverageConfidence,
          };
        });
      },

      addScanResultLegacy: (content: string, type: ScanItem['type']) => {
        const scanResult: ScanResult = {
          id: `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: content,
          confidence: 95, // Assume high confidence for legacy scans
          language: 'eng',
          processing_time_ms: 0,
          timestamp: Date.now(),
          type,
        };

        get().addScanResult(scanResult);
      },

      clearHistory: () =>
        set({
          scanHistory: [],
          totalScans: 0,
          averageConfidence: 0,
          lastScanResult: null,
        }),

      deleteScanItem: (id: string) =>
        set(state => {
          const updatedHistory = state.scanHistory.filter(
            item => item.id !== id,
          );
          const newTotalScans = updatedHistory.length;

          // Recalculate average confidence
          const newAverageConfidence =
            newTotalScans > 0
              ? updatedHistory.reduce((sum, item) => sum + item.confidence, 0) /
                newTotalScans
              : 0;

          return {
            scanHistory: updatedHistory,
            totalScans: newTotalScans,
            averageConfidence: newAverageConfidence,
          };
        }),

      setScanning: (scanning: boolean) => set({ isScanning: scanning }),

      setLastScanResult: (result: ScanResult | null) =>
        set({ lastScanResult: result }),

      updateOcrSettings: (settings: Partial<OcrSettings>) =>
        set(state => ({
          ocrSettings: { ...state.ocrSettings, ...settings },
        })),

      getStatistics: () => {
        const state = get();
        const languageDistribution = state.scanHistory.reduce((acc, item) => {
          acc[item.language] = (acc[item.language] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          totalScans: state.totalScans,
          averageConfidence: state.averageConfidence,
          languageDistribution,
        };
      },

      exportScanHistory: () => {
        const state = get();
        return JSON.stringify(
          {
            scanHistory: state.scanHistory,
            totalScans: state.totalScans,
            averageConfidence: state.averageConfidence,
            exportDate: new Date().toISOString(),
          },
          null,
          2,
        );
      },

      importScanHistory: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          if (data.scanHistory && Array.isArray(data.scanHistory)) {
            set({
              scanHistory: data.scanHistory,
              totalScans: data.totalScans || data.scanHistory.length,
              averageConfidence: data.averageConfidence || 0,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to import scan history:', error);
          return false;
        }
      },
    }),
    {
      name: 'smart-scanner-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

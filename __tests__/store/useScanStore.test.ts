import { act } from "@testing-library/react-native";
import { useScanStore } from "../../src/store/useScanStore";
import { ScanResult, OcrSettings } from "../../src/types/ocr";

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

describe("useScanStore", () => {
  const mockScanResult: ScanResult = {
    id: "test-id",
    text: "Hello World",
    confidence: 95,
    language: "eng",
    processing_time_ms: 100,
    timestamp: Date.now(),
    type: "text",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    useScanStore.setState({
      scanHistory: [],
      isScanning: false,
      lastScanResult: null,
      totalScans: 0,
      averageConfidence: 0,
      ocrSettings: {
        language: "eng",
        autoDetectTextType: true,
        minimumConfidence: 60,
        preprocessImage: true,
      },
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = useScanStore.getState();

      expect(state.scanHistory).toEqual([]);
      expect(state.isScanning).toBe(false);
      expect(state.lastScanResult).toBeNull();
      expect(state.totalScans).toBe(0);
      expect(state.averageConfidence).toBe(0);
      expect(state.ocrSettings).toEqual({
        language: "eng",
        autoDetectTextType: true,
        minimumConfidence: 60,
        preprocessImage: true,
      });
    });
  });

  describe("Scan Result Management", () => {
    it("should add scan result to history", () => {
      useScanStore.getState().addScanResult(mockScanResult);
      const state = useScanStore.getState();

      expect(state.scanHistory).toHaveLength(1);
      expect(state.scanHistory[0]).toEqual(mockScanResult);
      expect(state.lastScanResult).toEqual(mockScanResult);
      expect(state.totalScans).toBe(1);
      expect(state.averageConfidence).toBe(95);
    });

    it("should add multiple scan results", () => {
      const scan1 = { ...mockScanResult, id: "scan1", confidence: 90 };
      const scan2 = { ...mockScanResult, id: "scan2", confidence: 80 };

      useScanStore.getState().addScanResult(scan1);
      useScanStore.getState().addScanResult(scan2);
      const state = useScanStore.getState();

      expect(state.scanHistory).toHaveLength(2);
      expect(state.scanHistory[0]).toEqual(scan2); // Most recent first
      expect(state.scanHistory[1]).toEqual(scan1);
      expect(state.totalScans).toBe(2);
      expect(state.averageConfidence).toBe(85); // (90 + 80) / 2
    });

    it("should limit history to 15 items", () => {
      // Add 16 scan results
      for (let i = 0; i < 16; i++) {
        const scan = { ...mockScanResult, id: `scan${i}`, confidence: 90 };
        useScanStore.getState().addScanResult(scan);
      }

      const state = useScanStore.getState();
      expect(state.scanHistory).toHaveLength(15);
      expect(state.totalScans).toBe(15);
    });

    it("should add legacy scan result", () => {
      useScanStore.getState().addScanResultLegacy("Legacy text", "email");
      const state = useScanStore.getState();

      expect(state.scanHistory).toHaveLength(1);
      expect(state.scanHistory[0].text).toBe("Legacy text");
      expect(state.scanHistory[0].type).toBe("email");
      expect(state.scanHistory[0].confidence).toBe(95);
      expect(state.scanHistory[0].id).toMatch(/^legacy_\d+_[a-z0-9]+$/);
    });

    it("should clear scan history", () => {
      useScanStore.getState().addScanResult(mockScanResult);
      useScanStore.getState().clearHistory();
      const state = useScanStore.getState();

      expect(state.scanHistory).toEqual([]);
      expect(state.totalScans).toBe(0);
      expect(state.averageConfidence).toBe(0);
      expect(state.lastScanResult).toBeNull();
    });

    it("should delete specific scan item", () => {
      const scan1 = { ...mockScanResult, id: "scan1", confidence: 90 };
      const scan2 = { ...mockScanResult, id: "scan2", confidence: 80 };

      useScanStore.getState().addScanResult(scan1);
      useScanStore.getState().addScanResult(scan2);
      useScanStore.getState().deleteScanItem("scan1");

      const state = useScanStore.getState();
      expect(state.scanHistory).toHaveLength(1);
      expect(state.scanHistory[0].id).toBe("scan2");
      expect(state.totalScans).toBe(1);
      expect(state.averageConfidence).toBe(80);
    });

    it("should set average confidence to 0 when last item deleted", () => {
      const scan = { ...mockScanResult, id: "only", confidence: 77 };
      useScanStore.getState().addScanResult(scan);

      useScanStore.getState().deleteScanItem("only");

      const state = useScanStore.getState();
      expect(state.scanHistory).toHaveLength(0);
      expect(state.totalScans).toBe(0);
      expect(state.averageConfidence).toBe(0);
    });
  });

  describe("Scanning State", () => {
    it("should set scanning state", () => {
      useScanStore.getState().setScanning(true);
      expect(useScanStore.getState().isScanning).toBe(true);

      useScanStore.getState().setScanning(false);
      expect(useScanStore.getState().isScanning).toBe(false);
    });

    it("should set last scan result", () => {
      const mockScanResult: ScanResult = {
        id: "test-id",
        text: "Hello World",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
        timestamp: Date.now(),
        type: "text",
      };

      useScanStore.getState().setLastScanResult(mockScanResult);
      expect(useScanStore.getState().lastScanResult).toEqual(mockScanResult);

      useScanStore.getState().setLastScanResult(null);
      expect(useScanStore.getState().lastScanResult).toBeNull();
    });
  });

  describe("OCR Settings", () => {
    it("should update OCR settings", () => {
      const newSettings: Partial<OcrSettings> = {
        language: "fra" as const,
        minimumConfidence: 80,
      };

      useScanStore.getState().updateOcrSettings(newSettings);
      const state = useScanStore.getState();

      expect(state.ocrSettings.language).toBe("fra");
      expect(state.ocrSettings.minimumConfidence).toBe(80);
      expect(state.ocrSettings.autoDetectTextType).toBe(true); // Should remain unchanged
    });

    it("should merge settings with existing ones", () => {
      const newSettings: Partial<OcrSettings> = {
        language: "fra" as const,
      };

      useScanStore.getState().updateOcrSettings(newSettings);
      const state = useScanStore.getState();

      expect(state.ocrSettings).toEqual({
        language: "fra" as const,
        autoDetectTextType: true,
        minimumConfidence: 60,
        preprocessImage: true,
      });
    });
  });

  describe("Statistics", () => {
    it("should calculate statistics correctly", () => {
      const scans = [
        { ...mockScanResult, id: "scan1", confidence: 90, language: "eng" },
        { ...mockScanResult, id: "scan2", confidence: 80, language: "fr" },
        { ...mockScanResult, id: "scan3", confidence: 70, language: "eng" },
      ];

      scans.forEach((scan) => useScanStore.getState().addScanResult(scan));

      const stats = useScanStore.getState().getStatistics();

      expect(stats.totalScans).toBe(3);
      expect(stats.averageConfidence).toBe(80); // (90 + 80 + 70) / 3
      expect(stats.languageDistribution).toEqual({
        eng: 2,
        fr: 1,
      });
    });

    it("should handle empty history statistics", () => {
      const stats = useScanStore.getState().getStatistics();

      expect(stats.totalScans).toBe(0);
      expect(stats.averageConfidence).toBe(0);
      expect(stats.languageDistribution).toEqual({});
    });
  });

  describe("Export/Import", () => {
    it("should export scan history as JSON", () => {
      const scan1 = { ...mockScanResult, id: "scan1", confidence: 90 };
      const scan2 = { ...mockScanResult, id: "scan2", confidence: 80 };

      useScanStore.getState().addScanResult(scan1);
      useScanStore.getState().addScanResult(scan2);

      const exported = useScanStore.getState().exportScanHistory();
      const parsed = JSON.parse(exported);

      expect(parsed.scanHistory).toHaveLength(2);
      expect(parsed.totalScans).toBe(2);
      expect(parsed.averageConfidence).toBe(85);
      expect(parsed.exportDate).toBeDefined();
    });

    it("should import valid scan history", () => {
      const importData = {
        scanHistory: [
          { ...mockScanResult, id: "imported1", confidence: 90 },
          { ...mockScanResult, id: "imported2", confidence: 80 },
        ],
        totalScans: 2,
        averageConfidence: 85,
      };

      const result = useScanStore
        .getState()
        .importScanHistory(JSON.stringify(importData));

      expect(result).toBe(true);
      const state = useScanStore.getState();
      expect(state.scanHistory).toHaveLength(2);
      expect(state.totalScans).toBe(2);
      expect(state.averageConfidence).toBe(85);
    });

    it("should import scan history with fallback totals when fields missing", () => {
      const importData = {
        scanHistory: [
          { ...mockScanResult, id: "a", confidence: 90 },
          { ...mockScanResult, id: "b", confidence: 70 },
        ],
        // totalScans omitted
        // averageConfidence omitted
      } as any;

      const result = useScanStore
        .getState()
        .importScanHistory(JSON.stringify(importData));

      expect(result).toBe(true);
      const state = useScanStore.getState();
      expect(state.totalScans).toBe(2);
      expect(state.averageConfidence).toBe(0);
    });

    it("should import empty scan history array and keep zero stats", () => {
      const importData = {
        scanHistory: [],
      };

      const result = useScanStore
        .getState()
        .importScanHistory(JSON.stringify(importData));

      expect(result).toBe(true);
      const state = useScanStore.getState();
      expect(state.scanHistory).toHaveLength(0);
      expect(state.totalScans).toBe(0);
      expect(state.averageConfidence).toBe(0);
    });

    it("should handle invalid import data", () => {
      const result = useScanStore.getState().importScanHistory("invalid json");

      expect(result).toBe(false);
      const state = useScanStore.getState();
      expect(state.scanHistory).toEqual([]);
    });

    it("should handle import data without scanHistory", () => {
      const invalidData = { totalScans: 2, averageConfidence: 85 };
      const result = useScanStore
        .getState()
        .importScanHistory(JSON.stringify(invalidData));

      expect(result).toBe(false);
    });

    it("should handle import data with non-array scanHistory", () => {
      const invalidData = { scanHistory: "not an array", totalScans: 2 };
      const result = useScanStore
        .getState()
        .importScanHistory(JSON.stringify(invalidData));

      expect(result).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle scan result without imageUri", () => {
      const scanWithoutUri = { ...mockScanResult, imageUri: undefined };

      useScanStore.getState().addScanResult(scanWithoutUri);
      const state = useScanStore.getState();

      expect(state.scanHistory[0]).toEqual(scanWithoutUri);
    });

    it("should handle zero confidence scans", () => {
      const zeroConfidenceScan = { ...mockScanResult, confidence: 0 };

      useScanStore.getState().addScanResult(zeroConfidenceScan);
      const state = useScanStore.getState();

      expect(state.averageConfidence).toBe(0);
    });

    it("should handle very high confidence scans", () => {
      const highConfidenceScan = { ...mockScanResult, confidence: 100 };

      useScanStore.getState().addScanResult(highConfidenceScan);
      const state = useScanStore.getState();

      expect(state.averageConfidence).toBe(100);
    });
  });

  describe("State Consistency", () => {
    it("should maintain state consistency after operations", () => {
      const scan1 = { ...mockScanResult, id: "scan1", confidence: 90 };
      const scan2 = { ...mockScanResult, id: "scan2", confidence: 80 };

      // Add scans
      useScanStore.getState().addScanResult(scan1);
      useScanStore.getState().addScanResult(scan2);

      let state = useScanStore.getState();
      expect(state.scanHistory).toHaveLength(2);
      expect(state.totalScans).toBe(2);
      expect(state.averageConfidence).toBe(85);

      // Delete one scan
      useScanStore.getState().deleteScanItem("scan1");

      state = useScanStore.getState();
      expect(state.scanHistory).toHaveLength(1);
      expect(state.totalScans).toBe(1);
      expect(state.averageConfidence).toBe(80);

      // Clear all
      useScanStore.getState().clearHistory();

      state = useScanStore.getState();
      expect(state.scanHistory).toEqual([]);
      expect(state.totalScans).toBe(0);
      expect(state.averageConfidence).toBe(0);
    });
  });

  describe("Store Integration", () => {
    it("should work with multiple subscribers", () => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      const unsubscribe1 = useScanStore.subscribe(subscriber1);
      const unsubscribe2 = useScanStore.subscribe(subscriber2);

      // Trigger state change
      useScanStore.getState().addScanResult(mockScanResult);

      // Check that the state was actually changed
      const state = useScanStore.getState();
      expect(state.scanHistory).toHaveLength(1);
      expect(state.scanHistory[0]).toEqual(mockScanResult);

      // Clean up
      unsubscribe1();
      unsubscribe2();
    });

    it("should unsubscribe properly", () => {
      const subscriber = jest.fn();
      const unsubscribe = useScanStore.subscribe(subscriber);

      unsubscribe();
      useScanStore.getState().addScanResult(mockScanResult);

      expect(subscriber).not.toHaveBeenCalled();
    });
  });
});

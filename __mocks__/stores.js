// Mock data for stores
const mockTheme = {
  colors: {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
    textTertiary: "#999999",
    buttonText: "#FFFFFF",
    success: "#34C759",
    warning: "#FF9500",
    surface: "#F2F2F7",
    border: "#C6C6C8",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    weights: {
      medium: "500",
      bold: "700",
      semibold: "600",
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

const mockAppStoreState = {
  theme: mockTheme,
  themeMode: "light",
  isDark: false,
  currentLanguage: "en",
  setLanguage: jest.fn(),
  setThemeMode: jest.fn(),
  setThemeLoading: jest.fn(),
  setLanguageLoading: jest.fn(),
  hasHydrated: true,
  initializeFromSystem: jest.fn(),
  initializeApp: jest.fn(),
};

const mockScanStoreState = {
  addScanResult: jest.fn(),
  isScanning: false,
  setScanning: jest.fn(),
  ocrSettings: {
    language: "eng",
    autoDetectTextType: true,
    minimumConfidence: 60,
    preprocessImage: true,
  },
  scanHistory: [],
  clearHistory: jest.fn(),
  deleteScanItem: jest.fn(),
  setLastScanResult: jest.fn(),
  updateOcrSettings: jest.fn(),
  getStatistics: jest.fn().mockReturnValue({
    totalScans: 0,
    averageConfidence: 0,
    languageDistribution: {},
  }),
  exportScanHistory: jest.fn(),
  importScanHistory: jest.fn(),
};

const mockScanResult = {
  id: "test-id",
  text: "Extracted text",
  confidence: 95,
  language: "eng",
  processing_time_ms: 100,
  timestamp: Date.now(),
  type: "text",
};

module.exports = {
  mockTheme,
  mockAppStoreState,
  mockScanStoreState,
  mockScanResult,
};


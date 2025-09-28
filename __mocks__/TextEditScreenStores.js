// Mock stores specifically for TextEditScreen tests
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
    },
  },
  borderRadius: {
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
  getStatistics: jest.fn(),
  exportScanHistory: jest.fn(),
  importScanHistory: jest.fn(),
};

const mockTFunction = jest.fn((key) => key);

const mockI18n = {
  use: jest.fn().mockReturnThis(),
  init: jest.fn(() => Promise.resolve()),
  changeLanguage: jest.fn(() => Promise.resolve()),
  language: "en",
  t: mockTFunction,
  loadResources: jest.fn(() => Promise.resolve()),
  addResource: jest.fn(),
  addResources: jest.fn(),
  addResourceBundle: jest.fn(),
  hasResourceBundle: jest.fn(() => false),
  getResourceBundle: jest.fn(() => ({})),
  removeResourceBundle: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  store: {},
  services: {},
  options: {},
  format: jest.fn(),
  exists: jest.fn(() => false),
  getFixedT: jest.fn(() => mockTFunction),
  dir: jest.fn(() => "ltr"),
  cloneInstance: jest.fn(),
  createInstance: jest.fn(),
  isInitialized: true,
  hasLoadedNamespace: jest.fn(() => true),
  loadNamespaces: jest.fn(() => Promise.resolve()),
  loadLanguages: jest.fn(() => Promise.resolve()),
  reloadResources: jest.fn(() => Promise.resolve()),
  setDefaultNamespace: jest.fn(),
  getDataByLanguage: jest.fn(() => ({})),
  getResource: jest.fn(),
  toJSON: jest.fn(() => ({})),
};

module.exports = {
  mockTheme,
  mockAppStoreState,
  mockScanStoreState,
  mockTFunction,
  mockI18n,
};

const mockTheme = {
  colors: {
    background: "#000000",
    surface: "#1a1a1a",
    text: "#ffffff",
    textSecondary: "#888888",
    border: "#333333",
    primary: "#007AFF",
    error: "#FF3B30",
  },
  typography: {
    sizes: {
      xs: 10,
      sm: 12,
      md: 16,
      lg: 18,
      xl: 24,
    },
    weights: {
      medium: "500",
      bold: "700",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

const mockAppStoreState = {
  theme: mockTheme,
  isDarkMode: true,
  language: "en",
};

const mockTFunction = (key) => {
  const translations = {
    "viewScan.title": "View Scan",
    "viewScan.confidence": "confidence",
    "success.copied": "Copied",
    "success.copiedMessage": "Text copied to clipboard",
    "common.ok": "OK",
    "error.scanNotFound": "Scan not found",
  };
  return translations[key] || key;
};

const mockI18n = {
  language: "en",
  changeLanguage: jest.fn(),
  t: mockTFunction,
};

module.exports = {
  mockTheme,
  mockAppStoreState,
  mockTFunction,
  mockI18n,
};

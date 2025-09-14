import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert, Clipboard } from "react-native";
import { useTranslation } from "react-i18next";
import HomeScreen from "../../src/screens/HomeScreen";
import { useAppStore, useScanStore } from "../../src/store";
import { adaptiveOcrService } from "../../src/services/AdaptiveOcrService";
import { cameraService } from "../../src/services/CameraService";

// Mock dependencies
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

// Mock Clipboard
const mockClipboard = {
  setString: jest.fn(),
};

jest.mock("../../src/store", () => ({
  useAppStore: jest.fn(),
  useScanStore: jest.fn(),
}));

jest.mock("../../src/services/AdaptiveOcrService", () => ({
  adaptiveOcrService: {
    getPlatformInfo: jest.fn(),
    isReady: jest.fn(),
    getCurrentLanguage: jest.fn(),
    initialize: jest.fn(),
    updateSettings: jest.fn(),
    extractTextFromImage: jest.fn(),
  },
}));

jest.mock("../../src/services/CameraService", () => ({
  cameraService: {
    showSourceSelection: jest.fn(),
    getOcrOptimizedOptions: jest.fn(),
  },
}));

jest.mock("@react-native-clipboard/clipboard", () => ({
  setString: jest.fn(),
}));

// React Native is mocked globally in setup.ts

const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockUseScanStore = useScanStore as jest.MockedFunction<
  typeof useScanStore
>;
const mockAdaptiveOcrService = adaptiveOcrService as jest.Mocked<
  typeof adaptiveOcrService
>;
const mockCameraService = cameraService as jest.Mocked<typeof cameraService>;

// Mock store data
const mockTheme = {
  background: "#FFFFFF",
  primary: "#007AFF",
  text: "#000000",
  // Add other theme properties as needed
};

const defaultAppStoreState = {
  themeMode: "light" as const,
  theme: mockTheme,
  isDark: false,
  currentLanguage: "en" as const,
  isThemeLoading: false,
  isLanguageLoading: false,
  hasHydrated: true,
  setThemeMode: jest.fn(),
  setLanguage: jest.fn(),
  setThemeLoading: jest.fn(),
  setLanguageLoading: jest.fn(),
  setHasHydrated: jest.fn(),
  initializeFromSystem: jest.fn(),
  initializeApp: jest.fn(),
};

const defaultScanStoreState = {
  scanHistory: [],
  isScanning: false,
  lastScanResult: null,
  ocrSettings: {
    language: "eng",
    confidence: 0.8,
    autoDetect: true,
  },
  totalScans: 0,
  averageConfidence: 0,
  addScanResult: jest.fn(),
  addScanResultLegacy: jest.fn(),
  clearHistory: jest.fn(),
  deleteScanItem: jest.fn(),
  setScanning: jest.fn(),
  setLastScanResult: jest.fn(),
  updateOcrSettings: jest.fn(),
  setScanHistory: jest.fn(),
  addScan: jest.fn(),
  deleteScan: jest.fn(),
  clearScans: jest.fn(),
  setDeleting: jest.fn(),
};

describe("HomeScreen", () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  };

  const mockRoute = {
    key: "Home",
    name: "Home" as const,
    params: undefined,
  };

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

  const defaultAppStoreState = {
    theme: mockTheme,
    themeMode: "light" as const,
    isDark: false,
    currentLanguage: "en" as const,
    setLanguage: jest.fn(),
    setThemeMode: jest.fn(),
    setThemeLoading: jest.fn(),
    setLanguageLoading: jest.fn(),
    hasHydrated: true,
    initializeFromSystem: jest.fn(),
    initializeApp: jest.fn(),
  };

  const defaultScanStoreState = {
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

  const mockT = jest.fn((key: string) => key) as any;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockI18n = {
      use: jest.fn().mockReturnThis(),
      init: jest.fn(() => Promise.resolve()),
      changeLanguage: jest.fn(() => Promise.resolve()),
      language: "en",
      t: mockT,
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
      getFixedT: jest.fn(() => mockT),
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

    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: mockI18n as any,
      ready: true,
    } as any);

    mockUseAppStore.mockReturnValue(defaultAppStoreState);
    mockUseScanStore.mockReturnValue(defaultScanStoreState);

    mockAdaptiveOcrService.getPlatformInfo.mockReturnValue({
      platform: "ios",
      engine: "Vision Framework",
    });
    // Don't mock isReady here - let each test control it
    mockAdaptiveOcrService.getCurrentLanguage.mockReturnValue("eng");
    mockAdaptiveOcrService.initialize.mockResolvedValue(undefined);
    mockAdaptiveOcrService.updateSettings.mockReturnValue(undefined);
    mockAdaptiveOcrService.extractTextFromImage.mockResolvedValue({
      id: "test-id",
      text: "Extracted text",
      confidence: 95,
      language: "eng",
      processing_time_ms: 100,
      timestamp: Date.now(),
      type: "text",
    });

    mockCameraService.showSourceSelection.mockResolvedValue({
      uri: "file://test.jpg",
      base64: "base64string",
      fileName: "test.jpg",
      fileSize: 1024,
      width: 1920,
      height: 1080,
      type: "image/jpeg",
    });
    mockCameraService.getOcrOptimizedOptions.mockReturnValue({
      quality: 0.9,
      maxWidth: 1920,
      maxHeight: 1920,
      includeBase64: false,
      mediaType: "photo",
    });
  });

  it("should render correctly", () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText("home.title")).toBeTruthy();
    expect(getByText("home.welcome")).toBeTruthy();
    expect(getByText("home.description")).toBeTruthy();
  });

  it("should show loading state during OCR initialization", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(false);
    mockAdaptiveOcrService.initialize.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText("home.initializingOCR")).toBeTruthy();
  });

  it("should initialize OCR on mount", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(false);

    render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      expect(mockAdaptiveOcrService.initialize).toHaveBeenCalledWith({
        language: "eng",
      });
    });
  });

  it("should not initialize OCR if already ready with correct language", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);
    mockAdaptiveOcrService.getCurrentLanguage.mockReturnValue("eng");

    render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      expect(mockAdaptiveOcrService.initialize).not.toHaveBeenCalled();
    });
  });

  it("should show error alert on OCR initialization failure", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(false);
    mockAdaptiveOcrService.initialize.mockRejectedValue(
      new Error("OCR init failed")
    );

    render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "error.ocrInit",
        "error.ocrInitMessage",
        [{ text: "common.ok" }]
      );
    });
  });

  it("should show error alert on module not found", async () => {
    mockAdaptiveOcrService.getPlatformInfo.mockImplementation(() => {
      throw new Error("Module not found");
    });

    render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Module Error",
        "OCR module not found. This indicates a native module registration issue.",
        [{ text: "common.ok" }]
      );
    });
  });

  it("should handle scan button press successfully", async () => {
    // Mock OCR as already ready
    mockAdaptiveOcrService.isReady.mockReturnValue(true);
    mockAdaptiveOcrService.getCurrentLanguage.mockReturnValue("eng");
    mockAdaptiveOcrService.initialize.mockResolvedValue(undefined);

    // Mock camera and OCR extraction
    mockCameraService.showSourceSelection.mockResolvedValue({
      uri: "test-image.jpg",
      width: 100,
      height: 100,
    });
    mockAdaptiveOcrService.extractTextFromImage.mockResolvedValue({
      id: "test-scan-1",
      text: "Extracted text",
      confidence: 0.95,
      language: "eng",
      processing_time_ms: 100,
      timestamp: Date.now(),
      type: "text",
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for OCR to be ready (should be immediate since isReady returns true)
    await waitFor(() => {
      expect(getByText("home.ocrReady")).toBeTruthy();
    });

    const scanButton = getByText("home.startScanning");
    fireEvent.press(scanButton);

    // Wait for the entire scan process to complete
    await waitFor(
      () => {
        expect(mockCameraService.showSourceSelection).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(mockAdaptiveOcrService.extractTextFromImage).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(defaultScanStoreState.addScanResult).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // Note: Clipboard.setString is called but we can't easily mock it in this test environment
    // The important part is that the scan process completes successfully
  });

  it("should show error when OCR not ready", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(false);
    mockAdaptiveOcrService.getCurrentLanguage.mockReturnValue("fra"); // Different language
    mockAdaptiveOcrService.initialize.mockRejectedValue(
      new Error("OCR init failed")
    );

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(getByText("home.startScanning")).toBeTruthy();
    });

    const scanButton = getByText("home.startScanning");
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "error.ocrNotReady",
        "error.ocrNotReadyMessage",
        [{ text: "common.ok" }]
      );
    });
  });

  it("should show success alert with extracted text", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const scanButton = getByText("home.startScanning");
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "success.textExtracted",
        expect.stringContaining("Extracted text"),
        [{ text: "common.ok" }]
      );
    });
  });

  it("should show warning when no text extracted", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);
    mockAdaptiveOcrService.extractTextFromImage.mockResolvedValue({
      id: "test-id",
      text: "   ", // Empty/whitespace text
      confidence: 95,
      language: "eng",
      processing_time_ms: 100,
      timestamp: Date.now(),
      type: "text",
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const scanButton = getByText("home.startScanning");
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "warning.noText",
        "warning.noTextMessage",
        [{ text: "common.ok" }]
      );
    });
  });

  it("should handle scan cancellation gracefully", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);
    mockCameraService.showSourceSelection.mockRejectedValue(
      new Error("User cancelled")
    );

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const scanButton = getByText("home.startScanning");
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  it("should show error alert on scan failure", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);
    mockCameraService.showSourceSelection.mockRejectedValue(
      new Error("Camera error")
    );

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const scanButton = getByText("home.startScanning");
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "error.scanFailed",
        "Camera error",
        [{ text: "common.ok" }]
      );
    });
  });

  it("should show scans button when history has items", () => {
    mockUseScanStore.mockReturnValue({
      ...defaultScanStoreState,
      scanHistory: [
        {
          id: "1",
          text: "test",
          confidence: 95,
          language: "eng",
          processing_time_ms: 100,
          timestamp: Date.now(),
          type: "text",
        },
        {
          id: "2",
          text: "test2",
          confidence: 90,
          language: "eng",
          processing_time_ms: 100,
          timestamp: Date.now(),
          type: "text",
        },
      ],
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText("home.viewScans (2)")).toBeTruthy();
  });

  it("should not show scans button when history is empty", () => {
    const { queryByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(queryByText(/home.viewScans/)).toBeNull();
  });

  it("should navigate to scans screen when scans button pressed", async () => {
    mockUseScanStore.mockReturnValue({
      ...defaultScanStoreState,
      scanHistory: [
        {
          id: "1",
          text: "test",
          confidence: 95,
          language: "eng",
          processing_time_ms: 100,
          timestamp: Date.now(),
          type: "text",
        },
      ],
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const scansButton = getByText("home.viewScans (1)");
    fireEvent.press(scansButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Scans");
  });

  it("should show OCR status correctly", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      expect(getByText("home.ocrReady")).toBeTruthy();
    });
  });

  it("should show OCR not ready status", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(false);
    mockAdaptiveOcrService.getCurrentLanguage.mockReturnValue("fra"); // Different language
    mockAdaptiveOcrService.initialize.mockRejectedValue(
      new Error("OCR init failed")
    );

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(getByText("home.ocrNotReady")).toBeTruthy();
    });
  });

  it("should disable scan button when scanning", () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);

    mockUseScanStore.mockReturnValue({
      ...defaultScanStoreState,
      isScanning: true,
    });

    const { getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // When scanning, the button should show ActivityIndicator and be disabled
    const scanButton = getByTestId("scan-button");
    expect(scanButton.props.disabled).toBe(true);
  });

  it("should show activity indicator when scanning", () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);

    mockUseScanStore.mockReturnValue({
      ...defaultScanStoreState,
      isScanning: true,
    });

    const { getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // The ActivityIndicator should be inside the scan button
    const scanButton = getByTestId("scan-button");
    expect(scanButton).toBeTruthy();
    // Check that the button contains an ActivityIndicator
    expect(scanButton.children[0].type.displayName).toBe("ActivityIndicator");
  });

  it("should handle long text in success alert", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);
    const longText = "a".repeat(300);
    mockAdaptiveOcrService.extractTextFromImage.mockResolvedValue({
      id: "test-id",
      text: longText,
      confidence: 95,
      language: "eng",
      processing_time_ms: 100,
      timestamp: Date.now(),
      type: "text",
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const scanButton = getByText("home.startScanning");
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "success.textExtracted",
        expect.stringContaining("..."),
        [{ text: "common.ok" }]
      );
    });
  });

  it("should set scanning state correctly during scan", async () => {
    mockAdaptiveOcrService.isReady.mockReturnValue(true);

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const scanButton = getByText("home.startScanning");
    fireEvent.press(scanButton);

    // Wait for setScanning(true) to be called after showSourceSelection resolves
    await waitFor(() => {
      expect(defaultScanStoreState.setScanning).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(defaultScanStoreState.setScanning).toHaveBeenCalledWith(false);
    });
  });
});

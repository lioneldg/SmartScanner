import {
  adaptiveOcrService,
  AdaptiveOcrService,
} from "../../src/services/AdaptiveOcrService";
import { Platform } from "react-native";
import { decode } from "base-64";
import NativeOcr from "../../src/specs/NativeOcr";

// Declare global for TypeScript
declare const global: any;

// Mock dependencies
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
  TurboModuleRegistry: {
    getEnforcing: jest.fn(() => ({
      initialize: jest.fn().mockResolvedValue({
        success: true,
        message: "OCR initialized successfully",
      }),
      extractTextFromImage: jest.fn().mockResolvedValue({
        success: true,
        result: JSON.stringify({
          text: "Test text",
          confidence: 95,
          language: "eng",
          processing_time_ms: 100,
        }),
      }),
    })),
  },
}));

jest.mock("base-64", () => ({
  decode: jest.fn(),
}));

// Mock the NativeOcr module
jest.mock("../../src/specs/NativeOcr", () => ({
  initialize: jest.fn().mockResolvedValue({
    success: true,
    message: "OCR initialized successfully",
  }),
  extractTextFromImage: jest.fn().mockResolvedValue({
    success: true,
    result: JSON.stringify({
      text: "Test text",
      confidence: 95,
      language: "eng",
      processing_time_ms: 100,
    }),
  }),
}));

describe("AdaptiveOcrService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service state
    adaptiveOcrService.reset();
  });

  describe("Platform Detection", () => {
    it("should use NativeOcr module on iOS", () => {
      (Platform.OS as any) = "ios";
      const service = new AdaptiveOcrService();

      expect(NativeOcr).toBeDefined();
    });

    it("should use NativeOcr module on Android", () => {
      (Platform.OS as any) = "android";
      const service = new AdaptiveOcrService();

      expect(NativeOcr).toBeDefined();
    });
  });

  describe("Initialization", () => {
    it("should initialize successfully with default settings", async () => {
      const mockResponse = { success: true, message: "Initialized" };
      (NativeOcr.initialize as jest.Mock).mockResolvedValue(mockResponse);

      await adaptiveOcrService.initialize();

      expect(NativeOcr.initialize).toHaveBeenCalledWith("eng");
      expect(adaptiveOcrService.isReady()).toBe(true);
      expect(adaptiveOcrService.getCurrentLanguage()).toBe("eng");
    });

    it("should initialize with custom language", async () => {
      const mockResponse = { success: true, message: "Initialized" };
      (NativeOcr.initialize as jest.Mock).mockResolvedValue(mockResponse);

      await adaptiveOcrService.initialize({ language: "fra" });

      expect(NativeOcr.initialize).toHaveBeenCalledWith("fra");
      expect(adaptiveOcrService.getCurrentLanguage()).toBe("fra");
    });

    it("should throw error on initialization failure", async () => {
      const mockResponse = { success: false, message: "Initialization failed" };
      (NativeOcr.initialize as jest.Mock).mockResolvedValue(mockResponse);

      await expect(adaptiveOcrService.initialize()).rejects.toThrow(
        "OCR initialization failed"
      );
    });

    it("should not reinitialize if already initialized", async () => {
      const mockResponse = { success: true, message: "Initialized" };
      (NativeOcr.initialize as jest.Mock).mockResolvedValue(mockResponse);

      await adaptiveOcrService.initialize();
      await adaptiveOcrService.initialize();

      expect(NativeOcr.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe("Text Extraction", () => {
    beforeEach(async () => {
      const mockResponse = { success: true, message: "Initialized" };
      (NativeOcr.initialize as jest.Mock).mockResolvedValue(mockResponse);
      await adaptiveOcrService.initialize();
    });

    it("should extract text from image bytes", async () => {
      const mockOcrResult = {
        text: "Test text",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const imageData = { bytes: [1, 2, 3, 4] };
      const result = await adaptiveOcrService.extractTextFromImage(imageData);

      expect(result.text).toBe("Test text");
      expect(result.confidence).toBe(95);
      expect(result.id).toMatch(/^ocr_\d+_[a-z0-9]+$/);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it("should extract text from base64 image", async () => {
      const mockOcrResult = {
        text: "Test text",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );
      (decode as jest.Mock).mockReturnValue("decoded");

      const imageData = { base64: "base64string" };
      const result = await adaptiveOcrService.extractTextFromImage(imageData);

      expect(decode).toHaveBeenCalledWith("base64string");
      expect(result.text).toBe("Test text");
    });

    it("should extract text from URI", async () => {
      const mockOcrResult = {
        text: "Test text",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
      });

      const imageData = { uri: "file://test.jpg" };
      const result = await adaptiveOcrService.extractTextFromImage(imageData);

      expect(global.fetch).toHaveBeenCalledWith("file://test.jpg");
      expect(result.text).toBe("Test text");
    });

    it("should throw error if not initialized", async () => {
      adaptiveOcrService.reset();

      const imageData = { bytes: [1, 2, 3, 4] };
      await expect(
        adaptiveOcrService.extractTextFromImage(imageData)
      ).rejects.toThrow("OCR service not initialized");
    });

    it("should throw error on extraction failure", async () => {
      const mockResponse = { success: false, message: "Extraction failed" };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const imageData = { bytes: [1, 2, 3, 4] };
      await expect(
        adaptiveOcrService.extractTextFromImage(imageData)
      ).rejects.toThrow("Text extraction failed");
    });

    it("should warn on low confidence", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const mockOcrResult = {
        text: "Test text",
        confidence: 30, // Below threshold
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const imageData = { bytes: [1, 2, 3, 4] };
      await adaptiveOcrService.extractTextFromImage(imageData);

      expect(consoleSpy).toHaveBeenCalledWith("Low confidence: 30%");
      consoleSpy.mockRestore();
    });
  });

  describe("Text Type Detection", () => {
    beforeEach(async () => {
      const mockResponse = { success: true, message: "Initialized" };
      (NativeOcr.initialize as jest.Mock).mockResolvedValue(mockResponse);
      await adaptiveOcrService.initialize();
    });

    it("should detect URL type", async () => {
      const mockOcrResult = {
        text: "https://example.com",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const imageData = { bytes: [1, 2, 3, 4] };
      const result = await adaptiveOcrService.extractTextFromImage(imageData);

      expect(result.type).toBe("url");
    });

    it("should detect email type", async () => {
      const mockOcrResult = {
        text: "test@example.com",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const imageData = { bytes: [1, 2, 3, 4] };
      const result = await adaptiveOcrService.extractTextFromImage(imageData);

      expect(result.type).toBe("email");
    });

    it("should detect phone type", async () => {
      const mockOcrResult = {
        text: "+1 555 123 4567",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const imageData = { bytes: [1, 2, 3, 4] };
      const result = await adaptiveOcrService.extractTextFromImage(imageData);

      expect(result.type).toBe("phone");
    });

    it("should default to text type", async () => {
      const mockOcrResult = {
        text: "Regular text content",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const imageData = { bytes: [1, 2, 3, 4] };
      const result = await adaptiveOcrService.extractTextFromImage(imageData);

      expect(result.type).toBe("text");
    });
  });

  describe("Settings Management", () => {
    it("should update settings", () => {
      const newSettings = {
        language: "fra" as const,
        minimumConfidence: 80,
      };

      adaptiveOcrService.updateSettings(newSettings);
      const settings = adaptiveOcrService.getSettings();

      expect(settings.language).toBe("fra");
      expect(settings.minimumConfidence).toBe(80);
    });

    it("should reinitialize when language changes", async () => {
      const mockResponse = { success: true, message: "Initialized" };
      (NativeOcr.initialize as jest.Mock).mockResolvedValue(mockResponse);

      // First initialize with default language
      await adaptiveOcrService.initialize();

      // Clear previous calls
      (NativeOcr.initialize as jest.Mock).mockClear();

      // Change language
      adaptiveOcrService.updateSettings({ language: "fra" });

      // Wait for async reinitialization
      await new Promise<void>((resolve) => setTimeout(resolve, 10));

      expect(NativeOcr.initialize).toHaveBeenCalledWith("fra");
    });
  });

  describe("Utility Methods", () => {
    it("should get platform info", () => {
      // Reset platform to ios for this test
      (Platform.OS as any) = "ios";
      const platformInfo = adaptiveOcrService.getPlatformInfo();

      expect(platformInfo.platform).toBe("ios");
      expect(platformInfo.engine).toBe("Vision Framework");
    });

    it("should reset service state", () => {
      adaptiveOcrService.reset();

      expect(adaptiveOcrService.isReady()).toBe(false);
      expect(adaptiveOcrService.getCurrentLanguage()).toBe("eng");
      expect(adaptiveOcrService.getSettings()).toEqual({
        language: "eng",
        autoDetectTextType: true,
        minimumConfidence: 60,
        preprocessImage: true,
      });
    });
  });

  describe("Convenience Methods", () => {
    beforeEach(async () => {
      const mockResponse = { success: true, message: "Initialized" };
      (NativeOcr.initialize as jest.Mock).mockResolvedValue(mockResponse);
      await adaptiveOcrService.initialize();
    });

    it("should extract text from URI", async () => {
      const mockOcrResult = {
        text: "Test text",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
      });

      const result = await adaptiveOcrService.extractTextFromUri(
        "file://test.jpg"
      );

      expect(result.text).toBe("Test text");
    });

    it("should extract text from base64", async () => {
      const mockOcrResult = {
        text: "Test text",
        confidence: 95,
        language: "eng",
        processing_time_ms: 100,
      };
      const mockResponse = {
        success: true,
        result: JSON.stringify(mockOcrResult),
      };
      (NativeOcr.extractTextFromImage as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );
      (decode as jest.Mock).mockReturnValue("decoded");

      const result = await adaptiveOcrService.extractTextFromBase64(
        "base64string"
      );

      expect(result.text).toBe("Test text");
    });
  });
});

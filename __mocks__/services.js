// Mock data for services
const mockAdaptiveOcrService = {
  getPlatformInfo: jest.fn().mockReturnValue({
    platform: "ios",
    engine: "Vision Framework",
  }),
  isReady: jest.fn().mockReturnValue(false),
  getCurrentLanguage: jest.fn().mockReturnValue("eng"),
  initialize: jest.fn().mockResolvedValue(undefined),
  updateSettings: jest.fn().mockReturnValue(undefined),
  extractTextFromImage: jest.fn().mockResolvedValue({
    id: "test-id",
    text: "Extracted text",
    confidence: 95,
    language: "eng",
    processing_time_ms: 100,
    timestamp: Date.now(),
    type: "text",
  }),
  reset: jest.fn(),
  getSettings: jest.fn().mockReturnValue({
    language: "eng",
    autoDetectTextType: true,
    minimumConfidence: 60,
    preprocessImage: true,
  }),
  extractTextFromUri: jest.fn().mockResolvedValue({
    id: "test-id",
    text: "Extracted text",
    confidence: 95,
    language: "eng",
    processing_time_ms: 100,
    timestamp: Date.now(),
    type: "text",
  }),
  extractTextFromBase64: jest.fn().mockResolvedValue({
    id: "test-id",
    text: "Extracted text",
    confidence: 95,
    language: "eng",
    processing_time_ms: 100,
    timestamp: Date.now(),
    type: "text",
  }),
};

const mockCameraService = {
  showSourceSelection: jest.fn().mockResolvedValue({
    uri: "file://test.jpg",
    base64: "base64string",
    fileName: "test.jpg",
    fileSize: 1024,
    width: 1920,
    height: 1080,
    type: "image/jpeg",
  }),
  getOcrOptimizedOptions: jest.fn().mockReturnValue({
    quality: 0.9,
    maxWidth: 1920,
    maxHeight: 1920,
    includeBase64: false,
    mediaType: "photo",
  }),
  requestCameraPermission: jest.fn().mockResolvedValue(true),
  hasCameraPermission: jest.fn().mockResolvedValue(true),
  requestPhotoLibraryPermission: jest.fn().mockResolvedValue(true),
  hasPhotoLibraryPermission: jest.fn().mockResolvedValue(true),
  captureFromCamera: jest.fn().mockResolvedValue({
    uri: "file://test.jpg",
    base64: "base64string",
    fileName: "test.jpg",
    fileSize: 1024,
    width: 1920,
    height: 1080,
    type: "image/jpeg",
  }),
  selectFromGallery: jest.fn().mockResolvedValue({
    uri: "file://test.jpg",
    base64: "base64string",
    fileName: "test.jpg",
    fileSize: 1024,
    width: 1920,
    height: 1080,
    type: "image/jpeg",
  }),
  captureFromSource: jest.fn().mockResolvedValue({
    uri: "file://test.jpg",
    base64: "base64string",
    fileName: "test.jpg",
    fileSize: 1024,
    width: 1920,
    height: 1080,
    type: "image/jpeg",
  }),
};

const mockDateFormatService = {
  formatDate: jest.fn().mockReturnValue("2024-01-01"),
  formatTime: jest.fn().mockReturnValue("12:00:00"),
  formatDateTime: jest.fn().mockReturnValue("2024-01-01 12:00:00"),
  getRelativeTime: jest.fn().mockReturnValue("2 hours ago"),
};

module.exports = {
  mockAdaptiveOcrService,
  mockCameraService,
  mockDateFormatService,
};


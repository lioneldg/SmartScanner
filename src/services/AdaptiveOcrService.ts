import { NativeModules, Platform } from 'react-native';
import {
  OcrResult,
  OcrModuleResponse,
  OcrConfiguration,
  ImageData,
  ScanResult,
  OcrLanguage,
  OcrSettings,
} from '../types/ocr';

interface OcrModuleInterface {
  initialize(language: string): Promise<OcrModuleResponse>;
  extractTextFromImage(imageData: number[]): Promise<OcrModuleResponse>;
}

// Get the appropriate OCR module based on platform
const getOcrModule = (): OcrModuleInterface => {
  console.log('getOcrModule: Platform is', Platform.OS);
  console.log(
    'getOcrModule: Available NativeModules:',
    Object.keys(NativeModules),
  );

  if (Platform.OS === 'ios') {
    // Use Vision framework on iOS
    const { VisionOcrModule } = NativeModules;
    console.log(
      'getOcrModule: VisionOcrModule:',
      VisionOcrModule ? 'Found' : 'NULL',
    );
    return VisionOcrModule;
  } else {
    // Use ML Kit on Android
    const { OcrModule } = NativeModules;
    console.log('getOcrModule: OcrModule:', OcrModule ? 'Found' : 'NULL');
    return OcrModule;
  }
};

class AdaptiveOcrService {
  private isInitialized: boolean = false;
  private currentLanguage: OcrLanguage = 'eng';
  private ocrModule: OcrModuleInterface;
  private settings: OcrSettings = {
    language: 'eng',
    autoDetectTextType: true,
    minimumConfidence: 60,
    preprocessImage: true,
  };

  constructor() {
    this.ocrModule = getOcrModule();
    console.log('AdaptiveOcrService: Constructor called');
    console.log(
      'AdaptiveOcrService: OCR Module:',
      this.ocrModule ? 'Found' : 'NULL',
    );
    console.log('AdaptiveOcrService: Platform:', Platform.OS);
  }

  /**
   * Initialize the OCR engine
   */
  async initialize(config?: Partial<OcrConfiguration>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const language = config?.language || this.settings.language;
      const response = await this.ocrModule.initialize(language);

      if (response.success) {
        this.isInitialized = true;
        this.currentLanguage = language as OcrLanguage;
        console.log(`OCR Service initialized successfully on ${Platform.OS}`);
      } else {
        throw new Error(response.message || 'Failed to initialize OCR');
      }
    } catch (error) {
      console.error('OCR initialization error:', error);
      throw new Error(`OCR initialization failed: ${error}`);
    }
  }

  /**
   * Extract text from image data
   */
  async extractTextFromImage(imageData: ImageData): Promise<ScanResult> {
    if (!this.isInitialized) {
      throw new Error('OCR service not initialized. Call initialize() first.');
    }

    try {
      let bytes: number[];

      if (imageData.bytes) {
        bytes = imageData.bytes;
      } else if (imageData.base64) {
        bytes = this.base64ToBytes(imageData.base64);
      } else if (imageData.uri) {
        bytes = await this.uriToBytes(imageData.uri);
      } else {
        throw new Error('Invalid image data provided');
      }

      const response = await this.ocrModule.extractTextFromImage(bytes);

      if (!response.success || !response.result) {
        throw new Error(response.message || 'Text extraction failed');
      }

      const ocrResult: OcrResult = JSON.parse(response.result);

      // Check confidence threshold
      if (ocrResult.confidence < this.settings.minimumConfidence) {
        console.warn(`Low confidence: ${ocrResult.confidence}%`);
      }

      // Create scan result
      const scanResult: ScanResult = {
        ...ocrResult,
        id: this.generateId(),
        timestamp: Date.now(),
        imageUri: imageData.uri,
        type: this.settings.autoDetectTextType
          ? this.detectTextType(ocrResult.text)
          : 'text',
      };

      return scanResult;
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error(`Text extraction failed: ${error}`);
    }
  }

  /**
   * Extract text from image URI
   */
  async extractTextFromUri(uri: string): Promise<ScanResult> {
    return this.extractTextFromImage({ uri });
  }

  /**
   * Extract text from base64 image
   */
  async extractTextFromBase64(base64: string): Promise<ScanResult> {
    return this.extractTextFromImage({ base64 });
  }

  /**
   * Update OCR settings
   */
  updateSettings(newSettings: Partial<OcrSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    // If language changed, reinitialize
    if (newSettings.language && newSettings.language !== this.currentLanguage) {
      this.isInitialized = false;
      this.initialize({ language: newSettings.language }).catch(console.error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): OcrSettings {
    return { ...this.settings };
  }

  /**
   * Check if OCR is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): OcrLanguage {
    return this.currentLanguage;
  }

  /**
   * Get platform info
   */
  getPlatformInfo(): { platform: string; engine: string } {
    return {
      platform: Platform.OS,
      engine:
        Platform.OS === 'ios' ? 'Vision Framework' : 'ML Kit Text Recognition',
    };
  }

  /**
   * Reset OCR service
   */
  reset(): void {
    this.isInitialized = false;
    this.currentLanguage = 'eng';
    this.settings = {
      language: 'eng',
      autoDetectTextType: true,
      minimumConfidence: 60,
      preprocessImage: true,
    };
  }

  // Private helper methods

  private generateId(): string {
    return `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectTextType(text: string): ScanResult['type'] {
    const trimmedText = text.trim();

    // URL detection
    const urlRegex = /^https?:\/\/[^\s]+$/i;
    if (urlRegex.test(trimmedText)) {
      return 'url';
    }

    // Email detection
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmedText)) {
      return 'email';
    }

    // Phone number detection (basic)
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    if (phoneRegex.test(trimmedText.replace(/\s/g, ''))) {
      return 'phone';
    }

    // Default to text
    return 'text';
  }

  private base64ToBytes(base64: string): number[] {
    // Remove data URL prefix if present
    const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');

    // Convert base64 to binary string
    const binaryString = require('base-64').decode(cleanBase64);

    // Convert to byte array
    const bytes = new Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  }

  private async uriToBytes(uri: string): Promise<number[]> {
    try {
      // Use fetch to get image data
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const bytes = Array.from(new Uint8Array(arrayBuffer));
      return bytes;
    } catch (error) {
      throw new Error(`Failed to load image from URI: ${error}`);
    }
  }
}

// Export singleton instance
export const adaptiveOcrService = new AdaptiveOcrService();

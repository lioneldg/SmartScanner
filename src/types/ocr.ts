export interface OcrResult {
  text: string;
  confidence: number;
  language: string;
  processing_time_ms: number;
}

export interface OcrError {
  message: string;
  error_type: string;
}

export interface OcrModuleResponse {
  success: boolean;
  result?: string; // JSON string of OcrResult
  message?: string;
}

export interface OcrModuleError {
  code: string;
  message: string;
}

export interface OcrConfiguration {
  language: string;
  dataPath?: string;
}

export interface ImageData {
  uri?: string;
  base64?: string;
  bytes?: number[];
}

export interface ScanResult extends OcrResult {
  id: string;
  timestamp: number;
  imageUri?: string;
  type: 'text' | 'url' | 'email' | 'phone' | 'unknown';
}

export type OcrLanguage =
  | 'eng' // English
  | 'fra' // French
  | 'deu' // German
  | 'spa' // Spanish
  | 'ita' // Italian
  | 'por' // Portuguese
  | 'rus' // Russian
  | 'chi_sim' // Chinese Simplified
  | 'chi_tra' // Chinese Traditional
  | 'jpn' // Japanese
  | 'kor'; // Korean

export interface OcrSettings {
  language: OcrLanguage;
  autoDetectTextType: boolean;
  minimumConfidence: number;
  preprocessImage: boolean;
}

export interface TextDetection {
  text: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

export interface OcrAnalysisResult extends OcrResult {
  detections: TextDetection[];
  imageMetadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

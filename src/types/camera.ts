import { MediaType, PhotoQuality } from 'react-native-image-picker';

export interface CaptureOptions {
  quality?: PhotoQuality;
  maxWidth?: number;
  maxHeight?: number;
  includeBase64?: boolean;
  mediaType?: MediaType;
}

export interface CaptureResult {
  uri: string;
  base64?: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  type?: string;
}

export type CaptureSource = 'camera' | 'gallery';

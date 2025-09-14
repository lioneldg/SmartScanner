// Local type definitions (no longer using react-native-image-picker)
type PhotoQuality = number;
type MediaType = "photo" | "video" | "mixed";

export interface CaptureOptions {
  quality?: PhotoQuality;
  maxWidth?: number;
  maxHeight?: number;
  includeBase64?: boolean;
  mediaType?: MediaType;
  // Options for image cropping
  cropping?: boolean;
  cropperActiveWidgetColor?: string;
  cropperStatusBarColor?: string;
  cropperToolbarColor?: string;
  freeStyleCropEnabled?: boolean;
  hideBottomControls?: boolean;
  enableRotationGesture?: boolean;
}

export interface CaptureResult {
  uri: string;
  base64?: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  type?: string;
  // Cropping information
  cropRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type CaptureSource = "camera" | "gallery";

import ImagePicker from "react-native-image-crop-picker";
import { Platform, Alert, PermissionsAndroid } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { CaptureOptions, CaptureResult, CaptureSource } from "../types";
import { useAppStore } from "../store";
import { Theme } from "../types/theme";

// Type for react-native-image-crop-picker options
interface ImageCropPickerOptions {
  width?: number;
  height?: number;
  compressImageQuality?: number;
  includeBase64?: boolean;
  cropping?: boolean;
  freeStyleCropEnabled?: boolean;
  cropperActiveWidgetColor?: string;
  cropperStatusBarColor?: string;
  cropperToolbarColor?: string;
  hideBottomControls?: boolean;
  enableRotationGesture?: boolean;
}

// Type guard to check if the result is an Image (not Video)
interface ImageResult {
  path: string;
  data?: string;
  filename?: string;
  size: number;
  width: number;
  height: number;
  mime: string;
  cropRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

function isImageResult(result: unknown): result is ImageResult {
  if (!result || typeof result !== "object") {
    return false;
  }

  const obj = result as Record<string, unknown>;
  return (
    "mime" in obj &&
    "path" in obj &&
    "size" in obj &&
    "width" in obj &&
    "height" in obj &&
    typeof obj.mime === "string" &&
    obj.mime.startsWith("image/")
  );
}

class CameraService {
  private getDefaultOptions(theme: Theme): ImageCropPickerOptions {
    return {
      width: 1920,
      height: 1920,
      compressImageQuality: 0.8,
      includeBase64: false,
      cropping: true,
      freeStyleCropEnabled: true,
      cropperActiveWidgetColor: theme.colors.primary,
      cropperStatusBarColor: theme.colors.surface,
      cropperToolbarColor: theme.colors.surface,
      hideBottomControls: false,
      enableRotationGesture: true,
    };
  }

  private mapCaptureOptionsToPickerOptions(
    options: CaptureOptions,
    theme: Theme
  ): ImageCropPickerOptions {
    const defaultOptions = this.getDefaultOptions(theme);

    return {
      ...defaultOptions,
      // Map quality to compressImageQuality
      ...(options.quality && { compressImageQuality: options.quality }),
      // Map dimensions
      ...(options.maxWidth && { width: options.maxWidth }),
      ...(options.maxHeight && { height: options.maxHeight }),
      // Map other options directly
      ...(options.includeBase64 !== undefined && {
        includeBase64: options.includeBase64,
      }),
      ...(options.cropping !== undefined && { cropping: options.cropping }),
      ...(options.freeStyleCropEnabled !== undefined && {
        freeStyleCropEnabled: options.freeStyleCropEnabled,
      }),
      ...(options.hideBottomControls !== undefined && {
        hideBottomControls: options.hideBottomControls,
      }),
      ...(options.enableRotationGesture !== undefined && {
        enableRotationGesture: options.enableRotationGesture,
      }),
      // Map cropper colors
      ...(options.cropperActiveWidgetColor && {
        cropperActiveWidgetColor: options.cropperActiveWidgetColor,
      }),
      ...(options.cropperStatusBarColor && {
        cropperStatusBarColor: options.cropperStatusBarColor,
      }),
      ...(options.cropperToolbarColor && {
        cropperToolbarColor: options.cropperToolbarColor,
      }),
    };
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(t?: (key: string) => string): Promise<boolean> {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t ? t("camera.permissionTitle") : "Camera Permission",
            message: t
              ? t("camera.permissionMessage")
              : "SmartScanner needs access to camera to scan documents",
            buttonNeutral: t ? t("camera.askMeLater") : "Ask Me Later",
            buttonNegative: t ? t("common.cancel") : "Cancel",
            buttonPositive: t ? t("common.ok") : "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error("Camera permission error:", error);
      return false;
    }
  }

  /**
   * Check if camera permission is granted
   */
  async hasCameraPermission(): Promise<boolean> {
    try {
      if (Platform.OS === "android") {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return result;
      } else {
        const result = await check(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error("Permission check error:", error);
      return false;
    }
  }

  /**
   * Request photo library permission (iOS only)
   */
  async requestPhotoLibraryPermission(): Promise<boolean> {
    try {
      if (Platform.OS === "ios") {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return result === RESULTS.GRANTED;
      }
      // Android doesn't need explicit permission for gallery access
      return true;
    } catch (error) {
      console.error("Photo library permission error:", error);
      return false;
    }
  }

  /**
   * Check if photo library permission is granted
   */
  async hasPhotoLibraryPermission(): Promise<boolean> {
    try {
      if (Platform.OS === "ios") {
        const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return result === RESULTS.GRANTED;
      }
      // Android doesn't need explicit permission for gallery access
      return true;
    } catch (error) {
      console.error("Photo library permission check error:", error);
      return false;
    }
  }

  /**
   * Capture image from camera with cropping
   */
  async captureFromCamera(
    options?: CaptureOptions,
    t?: (key: string) => string
  ): Promise<CaptureResult> {
    const hasPermission = await this.hasCameraPermission();
    if (!hasPermission) {
      const granted = await this.requestCameraPermission(t);
      if (!granted) {
        throw new Error(
          t ? t("camera.permissionDenied") : "Camera permission denied"
        );
      }
    }

    try {
      // Get current theme from store
      const theme = useAppStore.getState().theme;

      const pickerOptions = this.mapCaptureOptionsToPickerOptions(
        options || {},
        theme
      );

      const image = await ImagePicker.openCamera(pickerOptions);

      if (!isImageResult(image)) {
        throw new Error("Expected image result but received video");
      }

      const result: CaptureResult = {
        uri: image.path,
        base64: image.data,
        fileName: image.filename,
        fileSize: image.size,
        width: image.width,
        height: image.height,
        type: image.mime,
        cropRect: image.cropRect,
      };

      return result;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "E_PICKER_CANCELLED"
      ) {
        throw new Error("User cancelled");
      }
      const errorMessage =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : t
          ? t("camera.noImageCaptured")
          : "No image captured";
      throw new Error(errorMessage);
    }
  }

  /**
   * Select image from gallery with cropping
   */
  async selectFromGallery(
    options?: CaptureOptions,
    t?: (key: string) => string
  ): Promise<CaptureResult> {
    // Check photo library permission for iOS
    if (Platform.OS === "ios") {
      const hasPermission = await this.hasPhotoLibraryPermission();
      if (!hasPermission) {
        const granted = await this.requestPhotoLibraryPermission();
        if (!granted) {
          throw new Error(
            t
              ? t("camera.photoLibraryDenied")
              : "Photo library permission denied"
          );
        }
      }
    }

    try {
      // Get current theme from store
      const theme = useAppStore.getState().theme;

      const pickerOptions = this.mapCaptureOptionsToPickerOptions(
        options || {},
        theme
      );

      const image = await ImagePicker.openPicker(pickerOptions);

      if (!isImageResult(image)) {
        throw new Error("Expected image result but received video");
      }

      const result: CaptureResult = {
        uri: image.path,
        base64: image.data,
        fileName: image.filename,
        fileSize: image.size,
        width: image.width,
        height: image.height,
        type: image.mime,
        cropRect: image.cropRect,
      };

      return result;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "E_PICKER_CANCELLED"
      ) {
        throw new Error("User cancelled");
      }
      const errorMessage =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : t
          ? t("camera.noImageSelected")
          : "No image selected";
      throw new Error(errorMessage);
    }
  }

  /**
   * Show source selection modal
   */
  async showSourceSelection(
    options?: CaptureOptions,
    t?: (key: string) => string
  ): Promise<CaptureResult> {
    return new Promise((resolve, reject) => {
      Alert.alert(
        t ? t("camera.selectSource") : "Select Image Source",
        t
          ? t("camera.selectSourceMessage")
          : "Choose how you want to capture the image",
        [
          {
            text: t ? t("camera.camera") : "Camera",
            onPress: async () => {
              try {
                const result = await this.captureFromCamera(options, t);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            },
          },
          {
            text: t ? t("camera.gallery") : "Gallery",
            onPress: async () => {
              try {
                const result = await this.selectFromGallery(options, t);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            },
          },
          {
            text: t ? t("common.cancel") : "Cancel",
            style: "cancel",
            onPress: () => reject(new Error("User cancelled")),
          },
        ],
        { cancelable: true }
      );
    });
  }

  /**
   * Capture image from specific source
   */
  async captureFromSource(
    source: CaptureSource,
    options?: CaptureOptions,
    t?: (key: string) => string
  ): Promise<CaptureResult> {
    switch (source) {
      case "camera":
        return this.captureFromCamera(options, t);
      case "gallery":
        return this.selectFromGallery(options, t);
      default:
        throw new Error(`Unsupported source: ${source}`);
    }
  }

  /**
   * Get optimized options for OCR with cropping
   */
  getOcrOptimizedOptions(): CaptureOptions {
    return {
      quality: 0.9,
      maxWidth: 1920,
      maxHeight: 1920,
      includeBase64: false, // We'll load from URI to save memory
      cropping: true, // Enable cropping for better OCR accuracy
      freeStyleCropEnabled: true, // Allow free-form cropping
      hideBottomControls: false,
      enableRotationGesture: true,
    };
  }
}

// Export singleton instance
export const cameraService = new CameraService();

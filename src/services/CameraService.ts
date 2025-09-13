import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
  PhotoQuality,
} from 'react-native-image-picker';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { CaptureOptions, CaptureResult, CaptureSource } from '../types';

class CameraService {
  private defaultOptions: CameraOptions = {
    mediaType: 'photo',
    quality: 0.8 as PhotoQuality,
    maxWidth: 1920,
    maxHeight: 1920,
    includeBase64: false,
    saveToPhotos: false,
  };

  /**
   * Request camera permission
   */
  async requestCameraPermission(t?: (key: string) => string): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t ? t('camera.permissionTitle') : 'Camera Permission',
            message: t
              ? t('camera.permissionMessage')
              : 'SmartScanner needs access to camera to scan documents',
            buttonNeutral: t ? t('camera.askMeLater') : 'Ask Me Later',
            buttonNegative: t ? t('common.cancel') : 'Cancel',
            buttonPositive: t ? t('common.ok') : 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  /**
   * Check if camera permission is granted
   */
  async hasCameraPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return result;
      } else {
        const result = await check(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Request photo library permission (iOS only)
   */
  async requestPhotoLibraryPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return result === RESULTS.GRANTED;
      }
      // Android doesn't need explicit permission for gallery access
      return true;
    } catch (error) {
      console.error('Photo library permission error:', error);
      return false;
    }
  }

  /**
   * Check if photo library permission is granted
   */
  async hasPhotoLibraryPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return result === RESULTS.GRANTED;
      }
      // Android doesn't need explicit permission for gallery access
      return true;
    } catch (error) {
      console.error('Photo library permission check error:', error);
      return false;
    }
  }

  /**
   * Capture image from camera
   */
  async captureFromCamera(
    options?: CaptureOptions,
    t?: (key: string) => string,
  ): Promise<CaptureResult> {
    const hasPermission = await this.hasCameraPermission();
    if (!hasPermission) {
      const granted = await this.requestCameraPermission(t);
      if (!granted) {
        throw new Error(
          t ? t('camera.permissionDenied') : 'Camera permission denied',
        );
      }
    }

    const pickerOptions: CameraOptions = {
      ...this.defaultOptions,
      ...options,
    };

    return new Promise((resolve, reject) => {
      launchCamera(pickerOptions, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          reject(new Error('User cancelled'));
          return;
        }

        if (response.errorMessage) {
          reject(new Error(response.errorMessage));
          return;
        }

        const asset = response.assets?.[0];
        if (!asset || !asset.uri) {
          reject(
            new Error(t ? t('camera.noImageCaptured') : 'No image captured'),
          );
          return;
        }

        const result: CaptureResult = {
          uri: asset.uri,
          base64: asset.base64,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          type: asset.type,
        };

        resolve(result);
      });
    });
  }

  /**
   * Select image from gallery
   */
  async selectFromGallery(
    options?: CaptureOptions,
    t?: (key: string) => string,
  ): Promise<CaptureResult> {
    // Check photo library permission for iOS
    if (Platform.OS === 'ios') {
      const hasPermission = await this.hasPhotoLibraryPermission();
      if (!hasPermission) {
        const granted = await this.requestPhotoLibraryPermission();
        if (!granted) {
          throw new Error(
            t
              ? t('camera.photoLibraryDenied')
              : 'Photo library permission denied',
          );
        }
      }
    }

    const pickerOptions: ImageLibraryOptions = {
      ...this.defaultOptions,
      ...options,
    };

    return new Promise((resolve, reject) => {
      launchImageLibrary(pickerOptions, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          reject(new Error('User cancelled'));
          return;
        }

        if (response.errorMessage) {
          reject(new Error(response.errorMessage));
          return;
        }

        const asset = response.assets?.[0];
        if (!asset || !asset.uri) {
          reject(
            new Error(t ? t('camera.noImageSelected') : 'No image selected'),
          );
          return;
        }

        const result: CaptureResult = {
          uri: asset.uri,
          base64: asset.base64,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          type: asset.type,
        };

        resolve(result);
      });
    });
  }

  /**
   * Show source selection modal
   */
  async showSourceSelection(
    options?: CaptureOptions,
    t?: (key: string) => string,
  ): Promise<CaptureResult> {
    return new Promise((resolve, reject) => {
      Alert.alert(
        t ? t('camera.selectSource') : 'Select Image Source',
        t
          ? t('camera.selectSourceMessage')
          : 'Choose how you want to capture the image',
        [
          {
            text: t ? t('camera.camera') : 'Camera',
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
            text: t ? t('camera.gallery') : 'Gallery',
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
            text: t ? t('common.cancel') : 'Cancel',
            style: 'cancel',
            onPress: () => reject(new Error('User cancelled')),
          },
        ],
        { cancelable: true },
      );
    });
  }

  /**
   * Capture image from specific source
   */
  async captureFromSource(
    source: CaptureSource,
    options?: CaptureOptions,
    t?: (key: string) => string,
  ): Promise<CaptureResult> {
    switch (source) {
      case 'camera':
        return this.captureFromCamera(options, t);
      case 'gallery':
        return this.selectFromGallery(options, t);
      default:
        throw new Error(`Unsupported source: ${source}`);
    }
  }

  /**
   * Get optimized options for OCR
   */
  getOcrOptimizedOptions(): CaptureOptions {
    return {
      quality: 0.9 as PhotoQuality,
      maxWidth: 1920,
      maxHeight: 1920,
      includeBase64: false, // We'll load from URI to save memory
      mediaType: 'photo',
    };
  }
}

// Export singleton instance
export const cameraService = new CameraService();

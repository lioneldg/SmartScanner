import { cameraService } from "../../src/services/CameraService";
import { Platform, Alert, PermissionsAndroid } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import ImagePicker from "react-native-image-crop-picker";

// Mock dependencies
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
  Alert: {
    alert: jest.fn(),
  },
  PermissionsAndroid: {
    request: jest.fn(),
    check: jest.fn(),
    PERMISSIONS: {
      CAMERA: "android.permission.CAMERA",
    },
    RESULTS: {
      GRANTED: "granted",
      DENIED: "denied",
    },
  },
}));

jest.mock("react-native-permissions", () => ({
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {
    IOS: {
      CAMERA: "ios.permission.CAMERA",
      PHOTO_LIBRARY: "ios.permission.PHOTO_LIBRARY",
    },
    ANDROID: {
      CAMERA: "android.permission.CAMERA",
    },
  },
  RESULTS: {
    GRANTED: "granted",
    DENIED: "denied",
    BLOCKED: "blocked",
  },
}));

jest.mock("react-native-image-crop-picker", () => ({
  openCamera: jest.fn(),
  openPicker: jest.fn(),
  clean: jest.fn(),
  cleanSingle: jest.fn(),
}));

describe("CameraService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Permission Management", () => {
    describe("Camera Permission", () => {
      it("should request camera permission on Android", async () => {
        (Platform.OS as any) = "android";
        (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
          PermissionsAndroid.RESULTS.GRANTED
        );

        const result = await cameraService.requestCameraPermission();

        expect(PermissionsAndroid.request).toHaveBeenCalledWith(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          expect.objectContaining({
            title: "Camera Permission",
            message: "SmartScanner needs access to camera to scan documents",
          })
        );
        expect(result).toBe(true);
      });

      it("should request camera permission on iOS", async () => {
        (Platform.OS as any) = "ios";
        (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

        const result = await cameraService.requestCameraPermission();

        expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS.CAMERA);
        expect(result).toBe(true);
      });

      it("should handle permission denial", async () => {
        (Platform.OS as any) = "ios";
        (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

        const result = await cameraService.requestCameraPermission();

        expect(result).toBe(false);
      });

      it("should handle permission errors", async () => {
        (Platform.OS as any) = "ios";
        (request as jest.Mock).mockRejectedValue(new Error("Permission error"));

        const result = await cameraService.requestCameraPermission();

        expect(result).toBe(false);
      });

      it("should check camera permission on Android", async () => {
        (Platform.OS as any) = "android";
        (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);

        const result = await cameraService.hasCameraPermission();

        expect(PermissionsAndroid.check).toHaveBeenCalledWith(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        expect(result).toBe(true);
      });

      it("should check camera permission on iOS", async () => {
        (Platform.OS as any) = "ios";
        (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

        const result = await cameraService.hasCameraPermission();

        expect(check).toHaveBeenCalledWith(PERMISSIONS.IOS.CAMERA);
        expect(result).toBe(true);
      });
    });

    describe("Photo Library Permission", () => {
      it("should request photo library permission on iOS", async () => {
        (Platform.OS as any) = "ios";
        (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

        const result = await cameraService.requestPhotoLibraryPermission();

        expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS.PHOTO_LIBRARY);
        expect(result).toBe(true);
      });

      it("should return true on Android (no permission needed)", async () => {
        (Platform.OS as any) = "android";

        const result = await cameraService.requestPhotoLibraryPermission();

        expect(result).toBe(true);
      });

      it("should check photo library permission on iOS", async () => {
        (Platform.OS as any) = "ios";
        (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

        const result = await cameraService.hasPhotoLibraryPermission();

        expect(check).toHaveBeenCalledWith(PERMISSIONS.IOS.PHOTO_LIBRARY);
        expect(result).toBe(true);
      });

      it("should return true on Android for photo library", async () => {
        (Platform.OS as any) = "android";

        const result = await cameraService.hasPhotoLibraryPermission();

        expect(result).toBe(true);
      });
    });
  });

  describe("Camera Capture", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should capture image from camera successfully with cropping", async () => {
      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockImage);

      const result = await cameraService.captureFromCamera();

      expect(ImagePicker.openCamera).toHaveBeenCalledWith(
        expect.objectContaining({
          cropping: true,
          freeStyleCropEnabled: true,
          enableRotationGesture: true,
        })
      );
      expect(result).toEqual({
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      });
    });

    it("should request permission before capturing", async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockImage);

      await cameraService.captureFromCamera();

      expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS.CAMERA);
    });

    it("should throw error when permission denied", async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "Camera permission denied"
      );
    });

    it("should throw error when user cancels", async () => {
      (ImagePicker.openCamera as jest.Mock).mockRejectedValue({
        code: "E_PICKER_CANCELLED",
        message: "User cancelled image selection",
      });

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "User cancelled"
      );
    });

    it("should throw error on capture failure", async () => {
      (ImagePicker.openCamera as jest.Mock).mockRejectedValue(
        new Error("Camera error")
      );

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "Camera error"
      );
    });

    it("should use custom options", async () => {
      const customOptions = {
        quality: 0.9,
        maxWidth: 1024,
        maxHeight: 1024,
        cropping: false,
      };

      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1024,
        height: 1024,
        mime: "image/jpeg",
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockImage);

      await cameraService.captureFromCamera(customOptions);

      expect(ImagePicker.openCamera).toHaveBeenCalledWith(
        expect.objectContaining({
          compressImageQuality: 0.9,
          width: 1024,
          height: 1024,
          cropping: false,
        })
      );
    });
  });

  describe("Gallery Selection", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should select image from gallery successfully with cropping", async () => {
      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 100,
          y: 100,
          width: 1720,
          height: 880,
        },
      };

      (ImagePicker.openPicker as jest.Mock).mockResolvedValue(mockImage);

      const result = await cameraService.selectFromGallery();

      expect(ImagePicker.openPicker).toHaveBeenCalledWith(
        expect.objectContaining({
          cropping: true,
          freeStyleCropEnabled: true,
          enableRotationGesture: true,
        })
      );
      expect(result).toEqual({
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
        cropRect: {
          x: 100,
          y: 100,
          width: 1720,
          height: 880,
        },
      });
    });

    it("should request photo library permission on iOS", async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      };

      (ImagePicker.openPicker as jest.Mock).mockResolvedValue(mockImage);

      await cameraService.selectFromGallery();

      expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS.PHOTO_LIBRARY);
    });

    it("should not request permission on Android", async () => {
      (Platform.OS as any) = "android";

      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      };

      (ImagePicker.openPicker as jest.Mock).mockResolvedValue(mockImage);

      await cameraService.selectFromGallery();

      expect(request).not.toHaveBeenCalled();
    });

    it("should throw error when permission denied", async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      await expect(cameraService.selectFromGallery()).rejects.toThrow(
        "Photo library permission denied"
      );
    });

    it("should throw error when user cancels gallery selection", async () => {
      (ImagePicker.openPicker as jest.Mock).mockRejectedValue({
        code: "E_PICKER_CANCELLED",
        message: "User cancelled image selection",
      });

      await expect(cameraService.selectFromGallery()).rejects.toThrow(
        "User cancelled"
      );
    });
  });

  describe("Source Selection", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should show source selection alert", async () => {
      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockImage);

      // Mock Alert.alert to simulate camera selection
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          // Simulate pressing the first button (Camera)
          buttons[0].onPress();
        }
      );

      const result = await cameraService.showSourceSelection();

      expect(Alert.alert).toHaveBeenCalledWith(
        "Select Image Source",
        "Choose how you want to capture the image",
        expect.arrayContaining([
          expect.objectContaining({ text: "Camera" }),
          expect.objectContaining({ text: "Gallery" }),
          expect.objectContaining({ text: "Cancel" }),
        ]),
        { cancelable: true }
      );
      expect(result.uri).toBe("file://test.jpg");
    });

    it("should handle gallery selection", async () => {
      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      };

      (ImagePicker.openPicker as jest.Mock).mockResolvedValue(mockImage);

      // Mock Alert.alert to simulate gallery selection
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          // Simulate pressing the second button (Gallery)
          buttons[1].onPress();
        }
      );

      const result = await cameraService.showSourceSelection();

      expect(result.uri).toBe("file://test.jpg");
    });

    it("should handle cancellation", async () => {
      // Mock Alert.alert to simulate cancellation
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          // Simulate pressing the cancel button
          buttons[2].onPress();
        }
      );

      await expect(cameraService.showSourceSelection()).rejects.toThrow(
        "User cancelled"
      );
    });
  });

  describe("Source-specific Capture", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should capture from camera source", async () => {
      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockImage);

      const result = await cameraService.captureFromSource("camera");

      expect(ImagePicker.openCamera).toHaveBeenCalled();
      expect(result.uri).toBe("file://test.jpg");
    });

    it("should capture from gallery source", async () => {
      const mockImage = {
        path: "file://test.jpg",
        data: "base64string",
        filename: "test.jpg",
        size: 1024,
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
        cropRect: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      };

      (ImagePicker.openPicker as jest.Mock).mockResolvedValue(mockImage);

      const result = await cameraService.captureFromSource("gallery");

      expect(ImagePicker.openPicker).toHaveBeenCalled();
      expect(result.uri).toBe("file://test.jpg");
    });

    it("should throw error for unsupported source", async () => {
      await expect(
        cameraService.captureFromSource("unsupported" as any)
      ).rejects.toThrow("Unsupported source: unsupported");
    });
  });

  describe("OCR Optimized Options", () => {
    it("should return optimized options for OCR with cropping", () => {
      const options = cameraService.getOcrOptimizedOptions();

      expect(options).toEqual({
        quality: 0.9,
        maxWidth: 1920,
        maxHeight: 1920,
        includeBase64: false,
        cropping: true,
        freeStyleCropEnabled: true,
        hideBottomControls: false,
        enableRotationGesture: true,
      });
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should handle null/undefined result from image picker", async () => {
      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(null);

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "Expected image result but received video"
      );
    });

    it("should handle non-object result from image picker", async () => {
      (ImagePicker.openCamera as jest.Mock).mockResolvedValue("invalid_result");

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "Expected image result but received video"
      );
    });

    it("should handle permission check errors for camera", async () => {
      (check as jest.Mock).mockRejectedValue(
        new Error("Permission check failed")
      );

      const result = await cameraService.hasCameraPermission();

      expect(result).toBe(false);
    });

    it("should handle permission check errors for photo library", async () => {
      (check as jest.Mock).mockRejectedValue(
        new Error("Permission check failed")
      );

      const result = await cameraService.hasPhotoLibraryPermission();

      expect(result).toBe(false);
    });

    it("should handle photo library permission request errors", async () => {
      (request as jest.Mock).mockRejectedValue(
        new Error("Permission request failed")
      );

      const result = await cameraService.requestPhotoLibraryPermission();

      expect(result).toBe(false);
    });

    it("should handle video result from camera (not image)", async () => {
      const mockVideo = {
        path: "file://test.mp4",
        mime: "video/mp4",
        size: 2048,
        width: 1920,
        height: 1080,
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockVideo);

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "Expected image result but received video"
      );
    });

    it("should handle video result from gallery (not image)", async () => {
      const mockVideo = {
        path: "file://test.mp4",
        mime: "video/mp4",
        size: 2048,
        width: 1920,
        height: 1080,
      };

      (ImagePicker.openPicker as jest.Mock).mockResolvedValue(mockVideo);

      await expect(cameraService.selectFromGallery()).rejects.toThrow(
        "Expected image result but received video"
      );
    });

    it("should handle error without message property in camera", async () => {
      const errorWithoutMessage = { code: "SOME_ERROR" };
      (ImagePicker.openCamera as jest.Mock).mockRejectedValue(
        errorWithoutMessage
      );

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "No image captured"
      );
    });

    it("should handle error without message property in gallery", async () => {
      const errorWithoutMessage = { code: "SOME_ERROR" };
      (ImagePicker.openPicker as jest.Mock).mockRejectedValue(
        errorWithoutMessage
      );

      await expect(cameraService.selectFromGallery()).rejects.toThrow(
        "No image selected"
      );
    });

    it("should handle error with translation function in camera", async () => {
      const t = jest.fn((key: string) => `translated_${key}`);
      const errorWithoutMessage = { code: "SOME_ERROR" };
      (ImagePicker.openCamera as jest.Mock).mockRejectedValue(
        errorWithoutMessage
      );

      await expect(
        cameraService.captureFromCamera(undefined, t)
      ).rejects.toThrow("translated_camera.noImageCaptured");
    });

    it("should handle error with translation function in gallery", async () => {
      const t = jest.fn((key: string) => `translated_${key}`);
      const errorWithoutMessage = { code: "SOME_ERROR" };
      (ImagePicker.openPicker as jest.Mock).mockRejectedValue(
        errorWithoutMessage
      );

      await expect(
        cameraService.selectFromGallery(undefined, t)
      ).rejects.toThrow("translated_camera.noImageSelected");
    });
  });

  describe("Options Mapping Coverage", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should handle all mapping options in mapCaptureOptionsToPickerOptions", async () => {
      const fullOptions = {
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 768,
        includeBase64: true,
        cropping: false,
        freeStyleCropEnabled: false,
        hideBottomControls: true,
        enableRotationGesture: false,
        cropperActiveWidgetColor: "#FF0000",
        cropperStatusBarColor: "#00FF00",
        cropperToolbarColor: "#0000FF",
      };

      const mockImage = {
        path: "file://test.jpg",
        mime: "image/jpeg",
        size: 1024,
        width: 1024,
        height: 768,
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockImage);

      await cameraService.captureFromCamera(fullOptions);

      expect(ImagePicker.openCamera).toHaveBeenCalledWith(
        expect.objectContaining({
          compressImageQuality: 0.8,
          width: 1024,
          height: 768,
          includeBase64: true,
          cropping: false,
          freeStyleCropEnabled: false,
          hideBottomControls: true,
          enableRotationGesture: false,
          cropperActiveWidgetColor: "#FF0000",
          cropperStatusBarColor: "#00FF00",
          cropperToolbarColor: "#0000FF",
        })
      );
    });

    it("should handle falsy values in options mapping", async () => {
      const optionsWithFalsyValues = {
        quality: 0, // falsy but should be mapped
        maxWidth: 0, // falsy, should not be mapped
        maxHeight: undefined, // should not be mapped
        includeBase64: false, // should be mapped
        cropping: undefined, // should not be mapped
      };

      const mockImage = {
        path: "file://test.jpg",
        mime: "image/jpeg",
        size: 1024,
        width: 1920,
        height: 1920,
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockImage);

      await cameraService.captureFromCamera(optionsWithFalsyValues);

      expect(ImagePicker.openCamera).toHaveBeenCalledWith(
        expect.objectContaining({
          includeBase64: false,
          // quality: 0 should not be mapped because it's falsy
          // maxWidth: 0 should not be mapped because it's falsy
          // Should use default width/height from getDefaultOptions
          width: 1920,
          height: 1920,
        })
      );
    });
  });

  describe("Source Selection Error Handling", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should handle camera error in showSourceSelection", async () => {
      (ImagePicker.openCamera as jest.Mock).mockRejectedValue(
        new Error("Camera failed")
      );

      // Mock Alert.alert to simulate camera selection
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          // Simulate pressing the camera button which will fail
          buttons[0].onPress();
        }
      );

      await expect(cameraService.showSourceSelection()).rejects.toThrow(
        "Camera failed"
      );
    });

    it("should handle gallery error in showSourceSelection", async () => {
      (ImagePicker.openPicker as jest.Mock).mockRejectedValue(
        new Error("Gallery failed")
      );

      // Mock Alert.alert to simulate gallery selection
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          // Simulate pressing the gallery button which will fail
          buttons[1].onPress();
        }
      );

      await expect(cameraService.showSourceSelection()).rejects.toThrow(
        "Gallery failed"
      );
    });
  });

  describe("Internationalization", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);
    });

    it("should use translation function when provided", async () => {
      const t = jest.fn((key: string) => `translated_${key}`);

      await expect(
        cameraService.captureFromCamera(undefined, t)
      ).rejects.toThrow("translated_camera.permissionDenied");

      expect(t).toHaveBeenCalledWith("camera.permissionDenied");
    });

    it("should use translation for permission request", async () => {
      const t = jest.fn((key: string) => `translated_${key}`);
      (Platform.OS as any) = "android";
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.DENIED
      );

      await cameraService.requestCameraPermission(t);

      expect(t).toHaveBeenCalledWith("camera.permissionTitle");
      expect(t).toHaveBeenCalledWith("camera.permissionMessage");
      expect(t).toHaveBeenCalledWith("camera.askMeLater");
      expect(t).toHaveBeenCalledWith("common.cancel");
      expect(t).toHaveBeenCalledWith("common.ok");
    });

    it("should use translation for gallery permission error", async () => {
      const t = jest.fn((key: string) => `translated_${key}`);

      await expect(
        cameraService.selectFromGallery(undefined, t)
      ).rejects.toThrow("translated_camera.photoLibraryDenied");

      expect(t).toHaveBeenCalledWith("camera.photoLibraryDenied");
    });

    it("should use translation in showSourceSelection", async () => {
      const t = jest.fn((key: string) => `translated_${key}`);
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const mockImage = {
        path: "file://test.jpg",
        mime: "image/jpeg",
        size: 1024,
        width: 1920,
        height: 1080,
      };

      (ImagePicker.openCamera as jest.Mock).mockResolvedValue(mockImage);

      // Mock Alert.alert to simulate camera selection
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          buttons[0].onPress();
        }
      );

      await cameraService.showSourceSelection(undefined, t);

      expect(Alert.alert).toHaveBeenCalledWith(
        "translated_camera.selectSource",
        "translated_camera.selectSourceMessage",
        expect.arrayContaining([
          expect.objectContaining({ text: "translated_camera.camera" }),
          expect.objectContaining({ text: "translated_camera.gallery" }),
          expect.objectContaining({ text: "translated_common.cancel" }),
        ]),
        { cancelable: true }
      );
    });
  });
});

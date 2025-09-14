import { cameraService } from "../../src/services/CameraService";
import { Platform, Alert, PermissionsAndroid } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

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

jest.mock("react-native-image-picker", () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
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

    it("should capture image from camera successfully", async () => {
      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchCamera as jest.Mock).mockImplementation((options, callback) => {
        callback({
          didCancel: false,
          errorMessage: null,
          assets: [mockAsset],
        });
      });

      const result = await cameraService.captureFromCamera();

      expect(launchCamera).toHaveBeenCalled();
      expect(result).toEqual({
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      });
    });

    it("should request permission before capturing", async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchCamera as jest.Mock).mockImplementation((options, callback) => {
        callback({
          didCancel: false,
          errorMessage: null,
          assets: [mockAsset],
        });
      });

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
      (launchCamera as jest.Mock).mockImplementation((options, callback) => {
        callback({
          didCancel: true,
          errorMessage: null,
          assets: [],
        });
      });

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "User cancelled"
      );
    });

    it("should throw error on capture failure", async () => {
      (launchCamera as jest.Mock).mockImplementation((options, callback) => {
        callback({
          didCancel: false,
          errorMessage: "Camera error",
          assets: [],
        });
      });

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "Camera error"
      );
    });

    it("should throw error when no image captured", async () => {
      (launchCamera as jest.Mock).mockImplementation((options, callback) => {
        callback({
          didCancel: false,
          errorMessage: null,
          assets: [],
        });
      });

      await expect(cameraService.captureFromCamera()).rejects.toThrow(
        "No image captured"
      );
    });

    it("should use custom options", async () => {
      const customOptions = {
        quality: 0.9 as const,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1024,
        height: 1024,
        type: "image/jpeg",
      };

      (launchCamera as jest.Mock).mockImplementation((options, callback) => {
        callback({
          didCancel: false,
          errorMessage: null,
          assets: [mockAsset],
        });
      });

      await cameraService.captureFromCamera(customOptions);

      expect(launchCamera).toHaveBeenCalledWith(
        expect.objectContaining({
          quality: 0.9,
          maxWidth: 1024,
          maxHeight: 1024,
        }),
        expect.any(Function)
      );
    });
  });

  describe("Gallery Selection", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should select image from gallery successfully", async () => {
      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchImageLibrary as jest.Mock).mockImplementation(
        (options, callback) => {
          callback({
            didCancel: false,
            errorMessage: null,
            assets: [mockAsset],
          });
        }
      );

      const result = await cameraService.selectFromGallery();

      expect(launchImageLibrary).toHaveBeenCalled();
      expect(result).toEqual({
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      });
    });

    it("should request photo library permission on iOS", async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchImageLibrary as jest.Mock).mockImplementation(
        (options, callback) => {
          callback({
            didCancel: false,
            errorMessage: null,
            assets: [mockAsset],
          });
        }
      );

      await cameraService.selectFromGallery();

      expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS.PHOTO_LIBRARY);
    });

    it("should not request permission on Android", async () => {
      (Platform.OS as any) = "android";

      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchImageLibrary as jest.Mock).mockImplementation(
        (options, callback) => {
          callback({
            didCancel: false,
            errorMessage: null,
            assets: [mockAsset],
          });
        }
      );

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
  });

  describe("Source Selection", () => {
    beforeEach(() => {
      (Platform.OS as any) = "ios";
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
    });

    it("should show source selection alert", async () => {
      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchCamera as jest.Mock).mockImplementation((options, callback) => {
        callback({
          didCancel: false,
          errorMessage: null,
          assets: [mockAsset],
        });
      });

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
      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchImageLibrary as jest.Mock).mockImplementation(
        (options, callback) => {
          callback({
            didCancel: false,
            errorMessage: null,
            assets: [mockAsset],
          });
        }
      );

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
      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchCamera as jest.Mock).mockImplementation((options, callback) => {
        callback({
          didCancel: false,
          errorMessage: null,
          assets: [mockAsset],
        });
      });

      const result = await cameraService.captureFromSource("camera");

      expect(launchCamera).toHaveBeenCalled();
      expect(result.uri).toBe("file://test.jpg");
    });

    it("should capture from gallery source", async () => {
      const mockAsset = {
        uri: "file://test.jpg",
        base64: "base64string",
        fileName: "test.jpg",
        fileSize: 1024,
        width: 1920,
        height: 1080,
        type: "image/jpeg",
      };

      (launchImageLibrary as jest.Mock).mockImplementation(
        (options, callback) => {
          callback({
            didCancel: false,
            errorMessage: null,
            assets: [mockAsset],
          });
        }
      );

      const result = await cameraService.captureFromSource("gallery");

      expect(launchImageLibrary).toHaveBeenCalled();
      expect(result.uri).toBe("file://test.jpg");
    });

    it("should throw error for unsupported source", async () => {
      await expect(
        cameraService.captureFromSource("unsupported" as any)
      ).rejects.toThrow("Unsupported source: unsupported");
    });
  });

  describe("OCR Optimized Options", () => {
    it("should return optimized options for OCR", () => {
      const options = cameraService.getOcrOptimizedOptions();

      expect(options).toEqual({
        quality: 0.9,
        maxWidth: 1920,
        maxHeight: 1920,
        includeBase64: false,
        mediaType: "photo",
      });
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
  });
});

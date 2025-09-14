// Mock for react-native-permissions
const mockPermissions = {
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
};

module.exports = mockPermissions;


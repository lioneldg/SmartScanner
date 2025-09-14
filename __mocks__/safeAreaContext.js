// Mock for react-native-safe-area-context
const mockSafeAreaContext = {
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaProvider: ({ children }) => children,
};

module.exports = mockSafeAreaContext;


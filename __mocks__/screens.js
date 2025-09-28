// Mock for react-native-screens
const mockScreens = {
  enableScreens: jest.fn(),
};

// Mock for TextEditScreen
const mockTextEditScreen = () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return React.createElement(
    View,
    { testID: "text-edit-screen" },
    React.createElement(Text, null, "Text Edit Screen")
  );
};

module.exports = {
  ...mockScreens,
  TextEditScreen: mockTextEditScreen,
};


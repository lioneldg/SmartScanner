// Mock for @react-native-vector-icons
const mockVectorIcons = {
  Ionicons: "Ionicons",
};

// Mock for font files
jest.mock("@react-native-vector-icons/ionicons/fonts/Ionicons.ttf", () => "Ionicons.ttf");

module.exports = mockVectorIcons;

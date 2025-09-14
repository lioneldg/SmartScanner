// Mock for @react-native-clipboard/clipboard
const mockClipboard = {
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve("")),
  hasString: jest.fn(() => Promise.resolve(false)),
};

module.exports = mockClipboard;


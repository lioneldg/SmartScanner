// Mock for react-native-localize
const mockLocalize = {
  getLocales: jest.fn(() => [
    {
      countryCode: "US",
      languageCode: "en",
      isRTL: false,
      languageTag: "en-US",
    },
  ]),
  findBestAvailableLanguage: jest.fn(() => ({
    languageTag: "en",
    isRTL: false,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

module.exports = mockLocalize;


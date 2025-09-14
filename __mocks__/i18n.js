// Mock for i18next and react-i18next
const mockTFunction = jest.fn((key) => key);
// Add the $TFunctionBrand property for TypeScript compatibility
mockTFunction.$TFunctionBrand = true;

const mockI18n = {
  use: jest.fn().mockReturnThis(),
  init: jest.fn(() => Promise.resolve()),
  changeLanguage: jest.fn(() => Promise.resolve()),
  language: "en",
  t: mockTFunction,
  // Add other required i18n properties
  loadResources: jest.fn(() => Promise.resolve()),
  addResource: jest.fn(),
  addResources: jest.fn(),
  addResourceBundle: jest.fn(),
  hasResourceBundle: jest.fn(() => false),
  getResourceBundle: jest.fn(() => ({})),
  removeResourceBundle: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  store: {},
  services: {},
  options: {},
  format: jest.fn(),
  exists: jest.fn(() => false),
  getFixedT: jest.fn(() => mockTFunction),
  dir: jest.fn(() => 'ltr'),
  cloneInstance: jest.fn(),
  createInstance: jest.fn(),
  isInitialized: true,
  hasLoadedNamespace: jest.fn(() => true),
  loadNamespaces: jest.fn(() => Promise.resolve()),
  loadLanguages: jest.fn(() => Promise.resolve()),
  reloadResources: jest.fn(() => Promise.resolve()),
  setDefaultNamespace: jest.fn(),
  getDataByLanguage: jest.fn(() => ({})),
  getResource: jest.fn(),
  toJSON: jest.fn(() => ({})),
};

const mockReactI18next = {
  useTranslation: () => ({
    t: mockTFunction,
    i18n: mockI18n,
  }),
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
};

module.exports = {
  i18n: mockI18n,
  reactI18next: mockReactI18next,
};


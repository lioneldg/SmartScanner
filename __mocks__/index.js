// Centralized mocks for all tests
const asyncStorage = require('./asyncStorage');
const i18n = require('./i18n');
const permissions = require('./permissions');
// imagePicker removed - no longer using react-native-image-picker
const localize = require('./localize');
const clipboard = require('./clipboard');
const safeAreaContext = require('./safeAreaContext');
const screens = require('./screens');
const vectorIcons = require('./vectorIcons');
const navigation = require('./navigation');
const zustand = require('./zustand');
const stores = require('./stores');
const services = require('./services');
const base64 = require('./base64');

// Export individual mocks for easier access
module.exports = {
  asyncStorage,
  i18n,
  permissions,
  // imagePicker removed
  localize,
  clipboard,
  safeAreaContext,
  screens,
  vectorIcons,
  navigation,
  zustand,
  stores,
  services,
  base64,
};

// Also export as default for ES6 imports
module.exports.default = module.exports;

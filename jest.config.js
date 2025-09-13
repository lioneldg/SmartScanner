module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-vector-icons|@react-native-async-storage|@react-native-clipboard|react-native-image-picker|react-native-localize|react-native-permissions|i18next|react-i18next)/)',
  ],
};

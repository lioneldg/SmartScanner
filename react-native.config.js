module.exports = {
  dependencies: {
    'react-native-screens': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-screens/android',
          packageImportPath: 'import com.swmansion.rnscreens.RNScreensPackage;',
        },
      },
    },
  },
  assets: ['./node_modules/react-native-vector-icons/Fonts/'],
};

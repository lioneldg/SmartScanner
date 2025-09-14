// Mock for react-native
const React = require('react');

const mockComponent = (name) => {
  const Component = (props) => React.createElement(name, props, props.children);
  Component.displayName = name;
  return Component;
};

const mockNativeModules = {
  VisionOcrModule: {
    initialize: jest.fn(),
    extractText: jest.fn(),
  },
  OcrModule: {
    initialize: jest.fn(),
    extractText: jest.fn(),
  },
  DevMenu: {
    addItem: jest.fn(),
    reload: jest.fn(),
  },
};

module.exports = {
  // Components
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  ScrollView: mockComponent('ScrollView'),
  FlatList: mockComponent('FlatList'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TouchableHighlight: mockComponent('TouchableHighlight'),
  TouchableWithoutFeedback: mockComponent('TouchableWithoutFeedback'),
  Image: mockComponent('Image'),
  TextInput: mockComponent('TextInput'),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  Modal: mockComponent('Modal'),
  SafeAreaView: mockComponent('SafeAreaView'),
  StatusBar: mockComponent('StatusBar'),
  KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
  RefreshControl: mockComponent('RefreshControl'),
  SectionList: mockComponent('SectionList'),
  VirtualizedList: mockComponent('VirtualizedList'),
  
  // APIs
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    absoluteFill: {},
    absoluteFillObject: {},
    hairlineWidth: 1,
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  NativeModules: mockNativeModules,
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
  },
  
  // Hooks
  useColorScheme: jest.fn(() => 'light'),
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
  
  // Other
  AppRegistry: {
    registerComponent: jest.fn(),
    runApplication: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  BackHandler: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};
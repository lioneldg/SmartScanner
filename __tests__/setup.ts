// Import centralized mocks
const mocks = require("../__mocks__");

// Mock react-native-permissions
jest.mock("react-native-permissions", () => mocks.permissions);

// Mock react-native-image-picker
jest.mock("react-native-image-picker", () => mocks.imagePicker);

// Mock react-native-localize
jest.mock("react-native-localize", () => mocks.localize);

// Mock AsyncStorage for Zustand persistence
jest.mock(
  "@react-native-async-storage/async-storage",
  () => mocks.asyncStorage
);

// Mock zustand
jest.mock("zustand", () => ({
  create: jest.fn(() => (fn: any) => {
    let store: any = {};
    const setState = (partial: any) => {
      if (typeof partial === "function") {
        store = { ...store, ...partial(store) };
      } else {
        store = { ...store, ...partial };
      }
    };
    const getState = () => store;
    const subscribe = jest.fn(() => jest.fn()); // Return unsubscribe function
    const destroy = jest.fn();

    store = fn(setState, getState, { getState, setState, subscribe, destroy });

    // Add subscribe method to the store
    (store as any).subscribe = subscribe;
    (store as any).getState = getState;
    (store as any).setState = setState;
    (store as any).destroy = destroy;

    return store;
  }),
}));

// Mock Zustand persistence middleware
jest.mock("zustand/middleware", () => ({
  persist:
    (config: any, options: any = {}) =>
    (set: any, get: any, api: any) => {
      const store: any = config(set, get, api);

      // Simulate immediate rehydration lifecycle
      try {
        if (options && typeof options.onRehydrateStorage === "function") {
          const after = options.onRehydrateStorage();
          if (typeof after === "function") {
            after(store);
          }
        }
        // Apply minimal hydrated flags similar to production code
        if (typeof store.setHasHydrated === "function") {
          store.setHasHydrated(true);
        }
        try {
          const themes = require("../src/themes/colors");
          const isDark = store.themeMode === "dark";
          store.theme = isDark ? themes.darkTheme : themes.lightTheme;
          store.isDark = isDark;
        } catch {}
      } catch (_) {
        // noop for tests
      }

      return {
        ...store,
        getState: () => store,
        setState: (partial: any) => {
          if (typeof partial === "function") {
            Object.assign(store, partial(store));
          } else {
            Object.assign(store, partial);
          }
        },
      };
    },
  createJSONStorage: jest.fn(() => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve(null)),
  })),
}));

// Mock Clipboard
jest.mock("@react-native-clipboard/clipboard", () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve("")),
  hasString: jest.fn(() => Promise.resolve(false)),
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => mocks.safeAreaContext);

// Mock react-native-screens
jest.mock("react-native-screens", () => {
  const actual = jest.requireActual("react-native-screens");
  return {
    ...actual,
    ...mocks.screens,
  };
});

// Mock @react-native-vector-icons
jest.mock("@react-native-vector-icons/ionicons", () => mocks.vectorIcons);

// Mock font files
jest.mock(
  "@react-native-vector-icons/ionicons/fonts/Ionicons.ttf",
  () => "Ionicons.ttf"
);

// Mock @react-navigation/native
jest.mock("@react-navigation/native", () => mocks.navigation.navigation);

// Mock @react-navigation/native-stack
jest.mock("@react-navigation/native-stack", () => mocks.navigation.nativeStack);

// Mock i18n
jest.mock("i18next", () => mocks.i18n.i18n);

// Mock react-i18next
jest.mock("react-i18next", () => mocks.i18n.reactI18next);

// Mock React Native components globally
jest.mock("react-native", () => {
  const mockComponent = (name: string) => {
    const Component = (props: any) => {
      const React = require("react");
      return React.createElement(name, props, props.children);
    };
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

  return {
    // Components
    View: mockComponent("View"),
    Text: mockComponent("Text"),
    ScrollView: mockComponent("ScrollView"),
    FlatList: ({
      data,
      renderItem,
      ListEmptyComponent,
      keyExtractor,
      ...props
    }: any) => {
      const React = require("react");
      if (!data || data.length === 0) {
        return ListEmptyComponent
          ? React.createElement(ListEmptyComponent)
          : React.createElement("View");
      }
      return React.createElement(
        "View",
        props,
        data.map((item: any, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          return renderItem
            ? React.createElement(renderItem, { item, index, key })
            : null;
        })
      );
    },
    TouchableOpacity: mockComponent("TouchableOpacity"),
    TouchableHighlight: mockComponent("TouchableHighlight"),
    TouchableWithoutFeedback: mockComponent("TouchableWithoutFeedback"),
    Image: mockComponent("Image"),
    TextInput: mockComponent("TextInput"),
    ActivityIndicator: mockComponent("ActivityIndicator"),
    Modal: mockComponent("Modal"),
    SafeAreaView: mockComponent("SafeAreaView"),
    StatusBar: mockComponent("StatusBar"),
    KeyboardAvoidingView: mockComponent("KeyboardAvoidingView"),
    RefreshControl: mockComponent("RefreshControl"),
    SectionList: mockComponent("SectionList"),
    VirtualizedList: mockComponent("VirtualizedList"),

    // APIs
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
      absoluteFill: {},
      absoluteFillObject: {},
      hairlineWidth: 1,
    },
    Platform: {
      OS: "ios",
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
    useColorScheme: jest.fn(() => "light"),
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),

    // Other
    AppRegistry: {
      registerComponent: jest.fn(),
      runApplication: jest.fn(),
    },
    Clipboard: {
      setString: jest.fn(),
      getString: jest.fn(() => Promise.resolve("")),
      hasString: jest.fn(() => Promise.resolve(false)),
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
});

// Mock fetch
(globalThis as any).fetch = jest.fn();

// Suppress console errors and warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  // Filter out specific errors that are expected or not critical for tests
  const message = args
    .map((a) => {
      if (typeof a === "string") return a;
      if (a && typeof a.message === "string") return a.message;
      if (a && typeof a.toString === "function") return a.toString();
      try {
        return JSON.stringify(a);
      } catch {
        return "";
      }
    })
    .join(" ");

  const suppressedErrorSubstrings = [
    // React testing warnings/errors
    "Warning: An update to %s inside a test was not wrapped in act",
    "not wrapped in act(",
    "The current testing environment is not configured to support act(",
    "Warning: You should not use <Text> as a child of <Text>",
    "Warning: Failed prop type",
    "Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'DevMenu' could not be found",
    // Domain-specific expected error logs verified by tests
    "Failed to initialize OCR",
    "Scan error:",
    "Camera permission error",
    "OCR initialization error",
    "OCR extraction error",
    "Error changing language",
    "Failed to import scan history",
  ];

  if (message && suppressedErrorSubstrings.some((s) => message.includes(s))) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args: any[]) => {
  const warningMessage = args
    .map((a) =>
      typeof a === "string" ? a : a?.message || a?.toString?.() || ""
    )
    .join(" ");
  const suppressedWarnSubstrings = [
    "Warning: `useSuspense` is not supported in `react-i18next`",
    "Low confidence",
  ];
  if (
    warningMessage &&
    suppressedWarnSubstrings.some((s) => warningMessage.includes(s))
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

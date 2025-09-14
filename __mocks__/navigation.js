// Mock for @react-navigation/native and @react-navigation/native-stack
const mockNavigation = {
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
};

const mockNativeStack = {
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => {
      const React = require("react");
      return React.createElement("View", { testID: "stack-navigator" }, children);
    },
    Screen: ({ component: Component, name, options }) => {
      const React = require("react");
      const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

      let headerRightElement = null;
      try {
        const resolvedOptions =
          typeof options === "function" ? options({ navigation: mockNav }) : options || {};
        if (resolvedOptions && typeof resolvedOptions.headerRight === "function") {
          const raw = resolvedOptions.headerRight();
          if (raw) {
            try {
              headerRightElement = React.cloneElement(raw, {
                testID: `${name}-headerRight-button`,
              });
            } catch {
              headerRightElement = raw;
            }
          }
        }
      } catch {
        // noop in test mock
      }

      const screenElement = Component
        ? React.createElement(Component, { testID: `${name}-screen` })
        : React.createElement("View", { testID: `${name}-screen` });

      return React.createElement(
        "View",
        { testID: `${name}-container` },
        screenElement,
        headerRightElement
          ? React.createElement("View", { testID: `${name}-headerRight` }, headerRightElement)
          : null,
      );
    },
  }),
};

module.exports = {
  navigation: mockNavigation,
  nativeStack: mockNativeStack,
};

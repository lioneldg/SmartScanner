import React from "react";
import { render } from "@testing-library/react-native";
import App from "../App";

// Mock the store
jest.mock("../src/store", () => ({
  useAppStore: jest.fn(() => ({
    isDark: false,
    theme: {
      colors: {
        background: "#ffffff",
        text: "#000000",
      },
    },
  })),
  useScanStore: jest.fn(() => ({
    scanHistory: [],
    addScanResult: jest.fn(),
    clearHistory: jest.fn(),
  })),
}));

// Mock the AppInitializer component
jest.mock("../src/components/AppInitializer", () => {
  return function MockAppInitializer({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  };
});

// Mock the AppNavigator component
jest.mock("../src/navigation/AppNavigator", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function MockAppNavigator() {
    return React.createElement(
      View,
      { testID: "app-navigator" },
      React.createElement(Text, null, "App Navigator")
    );
  };
});

describe("App", () => {
  it("should render without crashing", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("app-navigator")).toBeTruthy();
  });

  it("should render AppNavigator", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("app-navigator")).toBeTruthy();
  });
});

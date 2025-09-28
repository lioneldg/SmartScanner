import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import ViewScanScreen from "../../src/screens/ViewScanScreen";
import { useAppStore } from "../../src/store";
import { useTranslation } from "react-i18next";
import Clipboard from "@react-native-clipboard/clipboard";
import DateFormatService from "../../src/services/DateFormatService";

// Import mocks from __mocks__ folder
const {
  mockTheme,
  mockAppStoreState,
  mockTFunction,
  mockI18n,
} = require("../../__mocks__/ViewScanScreenStores");

// Mock dependencies
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("@react-native-clipboard/clipboard", () => ({
  setString: jest.fn(),
}));

jest.mock("../../src/store", () => ({
  useAppStore: jest.fn(),
}));

jest.mock("../../src/services/DateFormatService", () => ({
  formatDate: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

// Use mock data from __mocks__ folder
const defaultAppStoreState = mockAppStoreState;
const mockT = mockTFunction;

describe("ViewScanScreen", () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };

  const mockScan = {
    id: "test-scan-1",
    text: "This is a test scan text content that should be displayed in the ViewScanScreen.",
    confidence: 95,
    timestamp: 1640995200000, // 2022-01-01
    imageUri: "file://test-image.jpg",
  };

  const mockRoute = {
    key: "ViewScan",
    name: "ViewScan" as const,
    params: {
      scan: mockScan,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: mockI18n as any,
      ready: true,
    } as any);

    mockUseAppStore.mockReturnValue(defaultAppStoreState);

    (DateFormatService.formatDate as jest.Mock).mockReturnValue("Jan 1, 2022");
  });

  it("should render correctly with scan data", () => {
    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText(mockScan.text)).toBeTruthy();
    expect(getByText("95% confidence")).toBeTruthy();
    expect(getByText("Jan 1, 2022")).toBeTruthy();
  });

  it("should render error message when scan is not provided", () => {
    const routeWithoutScan = {
      ...mockRoute,
      params: {},
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithoutScan as any}
      />
    );

    expect(getByText("Scan not found")).toBeTruthy();
  });

  it("should render error message when route params are undefined", () => {
    const routeWithoutParams = {
      ...mockRoute,
      params: undefined,
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithoutParams as any}
      />
    );

    expect(getByText("Scan not found")).toBeTruthy();
  });

  it("should render error message when route is undefined", () => {
    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={undefined as any}
      />
    );

    expect(getByText("Scan not found")).toBeTruthy();
  });

  it("should render error message when theme is not available", () => {
    mockUseAppStore.mockReturnValue({
      theme: null,
    });

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText("Scan not found")).toBeTruthy();
  });

  it("should copy text to clipboard when copy button is pressed", async () => {
    const { getByTestId } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const copyButton = getByTestId("copy-button");
    fireEvent.press(copyButton);

    await waitFor(() => {
      expect(Clipboard.setString).toHaveBeenCalledWith(mockScan.text);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Copied",
        "Text copied to clipboard",
        [{ text: "OK" }]
      );
    });
  });

  it("should not copy to clipboard when scan text is empty", async () => {
    const scanWithoutText = {
      ...mockScan,
      text: "",
    };

    const routeWithEmptyText = {
      ...mockRoute,
      params: {
        scan: scanWithoutText,
      },
    };

    const { getByTestId } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithEmptyText as any}
      />
    );

    const copyButton = getByTestId("copy-button");
    fireEvent.press(copyButton);

    await waitFor(() => {
      expect(Clipboard.setString).not.toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  it("should format date correctly using DateFormatService", () => {
    render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(DateFormatService.formatDate).toHaveBeenCalledWith(
      mockScan.timestamp
    );
  });

  it("should display confidence as percentage", () => {
    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText("95% confidence")).toBeTruthy();
  });

  it("should handle different confidence values", () => {
    const scanWithLowConfidence = {
      ...mockScan,
      confidence: 75,
    };

    const routeWithLowConfidence = {
      ...mockRoute,
      params: {
        scan: scanWithLowConfidence,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithLowConfidence as any}
      />
    );

    expect(getByText("75% confidence")).toBeTruthy();
  });

  it("should handle scan without imageUri", () => {
    const scanWithoutImage = {
      ...mockScan,
      imageUri: undefined,
    };

    const routeWithoutImage = {
      ...mockRoute,
      params: {
        scan: scanWithoutImage,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithoutImage as any}
      />
    );

    expect(getByText(mockScan.text)).toBeTruthy();
    expect(getByText("95% confidence")).toBeTruthy();
  });

  it("should apply correct styles based on theme", () => {
    const { getByTestId } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const copyButton = getByTestId("copy-button");
    expect(copyButton).toBeTruthy();
  });

  it("should handle long text content with scroll", () => {
    const longTextScan = {
      ...mockScan,
      text: "This is a very long text content that should be scrollable in the ViewScanScreen. ".repeat(
        20
      ),
    };

    const routeWithLongText = {
      ...mockRoute,
      params: {
        scan: longTextScan,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithLongText as any}
      />
    );

    expect(getByText(longTextScan.text)).toBeTruthy();
  });

  it("should handle special characters in text", () => {
    const specialCharScan = {
      ...mockScan,
      text: "Text with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?`~",
    };

    const routeWithSpecialChars = {
      ...mockRoute,
      params: {
        scan: specialCharScan,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithSpecialChars as any}
      />
    );

    expect(getByText(specialCharScan.text)).toBeTruthy();
  });

  it("should handle multiline text correctly", () => {
    const multilineScan = {
      ...mockScan,
      text: "Line 1\nLine 2\nLine 3\nLine 4",
    };

    const routeWithMultiline = {
      ...mockRoute,
      params: {
        scan: multilineScan,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithMultiline as any}
      />
    );

    expect(getByText(multilineScan.text)).toBeTruthy();
  });

  it("should handle confidence value of 0", () => {
    const zeroConfidenceScan = {
      ...mockScan,
      confidence: 0,
    };

    const routeWithZeroConfidence = {
      ...mockRoute,
      params: {
        scan: zeroConfidenceScan,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithZeroConfidence as any}
      />
    );

    expect(getByText("0% confidence")).toBeTruthy();
  });

  it("should handle confidence value of 1", () => {
    const fullConfidenceScan = {
      ...mockScan,
      confidence: 100,
    };

    const routeWithFullConfidence = {
      ...mockRoute,
      params: {
        scan: fullConfidenceScan,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithFullConfidence as any}
      />
    );

    expect(getByText("100% confidence")).toBeTruthy();
  });

  it("should handle partial route params with defaults", () => {
    const routeWithPartialParams = {
      ...mockRoute,
      params: {
        scan: {
          id: "test-scan-2",
          text: "Partial scan text",
          confidence: 80,
          timestamp: 1640995200000,
          // imageUri is missing
        },
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithPartialParams as any}
      />
    );

    expect(getByText("Partial scan text")).toBeTruthy();
    expect(getByText("80% confidence")).toBeTruthy();
  });

  it("should handle empty text scenario", () => {
    const scanWithEmptyText = {
      ...mockScan,
      text: "",
    };

    const routeWithEmptyText = {
      ...mockRoute,
      params: {
        scan: scanWithEmptyText,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithEmptyText as any}
      />
    );

    expect(getByText("95% confidence")).toBeTruthy();
    expect(getByText("Jan 1, 2022")).toBeTruthy();
  });

  it("should handle whitespace-only text", () => {
    const scanWithWhitespace = {
      ...mockScan,
      text: "   \n\t   ",
    };

    const routeWithWhitespace = {
      ...mockRoute,
      params: {
        scan: scanWithWhitespace,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithWhitespace as any}
      />
    );

    expect(getByText("   \n\t   ")).toBeTruthy();
  });

  it("should handle very long single line text", () => {
    const longLineScan = {
      ...mockScan,
      text: "A".repeat(1000),
    };

    const routeWithLongLine = {
      ...mockRoute,
      params: {
        scan: longLineScan,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithLongLine as any}
      />
    );

    expect(getByText(longLineScan.text)).toBeTruthy();
  });

  it("should handle copy button press with null scan", async () => {
    const routeWithNullScan = {
      ...mockRoute,
      params: {
        scan: null,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithNullScan as any}
      />
    );

    expect(getByText("Scan not found")).toBeTruthy();
  });

  it("should handle copy button press with undefined scan", async () => {
    const routeWithUndefinedScan = {
      ...mockRoute,
      params: {
        scan: undefined,
      },
    };

    const { getByText } = render(
      <ViewScanScreen
        navigation={mockNavigation as any}
        route={routeWithUndefinedScan as any}
      />
    );

    expect(getByText("Scan not found")).toBeTruthy();
  });
});

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert, Clipboard } from "react-native";
import { useTranslation } from "react-i18next";
import TextEditScreen from "../../src/screens/TextEditScreen";
import { useAppStore, useScanStore } from "../../src/store";

// Import mocks from __mocks__ folder
const {
  mockTheme,
  mockAppStoreState,
  mockScanStoreState,
  mockTFunction,
  mockI18n,
} = require("../../__mocks__/TextEditScreenStores");

// Mock dependencies
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("@react-native-clipboard/clipboard", () => ({
  setString: jest.fn(),
}));

jest.mock("../../src/store", () => ({
  useAppStore: jest.fn(),
  useScanStore: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useFocusEffect: jest.fn((callback) => {
    // Immediately call the callback to simulate focus
    callback();
  }),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockUseScanStore = useScanStore as jest.MockedFunction<
  typeof useScanStore
>;

// Use mock data from __mocks__ folder
const defaultAppStoreState = mockAppStoreState;
const defaultScanStoreState = mockScanStoreState;
const mockT = mockTFunction;

describe("TextEditScreen", () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  };

  const mockRoute = {
    key: "TextEdit",
    name: "TextEdit" as const,
    params: {
      extractedText: "Sample extracted text",
      imageUri: "file://test.jpg",
      confidence: 0.95,
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
    mockUseScanStore.mockReturnValue(defaultScanStoreState);
  });

  it("should render correctly with extracted text", () => {
    const { getByDisplayValue } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByDisplayValue("Sample extracted text")).toBeTruthy();
  });

  it("should configure header with save button on focus", () => {
    render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // Verify that setOptions was called to configure the header
    expect(mockNavigation.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        headerRight: expect.any(Function),
      })
    );
  });

  it("should have save button in header that can be triggered", () => {
    render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // Verify that setOptions was called to configure the header
    expect(mockNavigation.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        headerRight: expect.any(Function),
      })
    );

    // Get the header button function from setOptions call
    const setOptionsCall = mockNavigation.setOptions.mock.calls[0][0];
    const headerRight = setOptionsCall.headerRight;

    // Verify that the header button is a function that can be rendered
    expect(typeof headerRight).toBe("function");

    // Render the header button to verify it doesn't crash
    const HeaderButton = headerRight;
    const { root } = render(<HeaderButton />);
    expect(root).toBeTruthy();
  });

  it("should reset text to original when reset button is pressed", () => {
    const { getByDisplayValue, getByText } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const textInput = getByDisplayValue("Sample extracted text");
    fireEvent.changeText(textInput, "Edited text content");

    // Verify text was changed
    expect(textInput.props.value).toBe("Edited text content");

    // Press reset button
    const resetButton = getByText("textEdit.reset");
    fireEvent.press(resetButton);

    // Verify text was reset to original
    expect(textInput.props.value).toBe("Sample extracted text");
  });

  it("should handle undefined route params with default values", () => {
    const routeWithoutParams = {
      key: "TextEdit",
      name: "TextEdit" as const,
      params: undefined,
    };

    const { getByDisplayValue } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={routeWithoutParams as any}
      />
    );

    // Should render with empty text input
    const textInput = getByDisplayValue("");
    expect(textInput).toBeTruthy();
    expect(textInput.props.value).toBe("");
  });

  it("should display placeholder text correctly", () => {
    const { getByPlaceholderText } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const textInput = getByPlaceholderText("textEdit.placeholder");
    expect(textInput).toBeTruthy();
  });

  it("should reset to empty text when original text was empty", () => {
    const routeWithEmptyText = {
      key: "TextEdit",
      name: "TextEdit" as const,
      params: {
        extractedText: "",
        imageUri: "",
        confidence: 0,
      },
    };

    const { getByDisplayValue, getByText } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={routeWithEmptyText as any}
      />
    );

    const textInput = getByDisplayValue("");
    fireEvent.changeText(textInput, "Some text");

    // Verify text was changed
    expect(textInput.props.value).toBe("Some text");

    // Press reset button
    const resetButton = getByText("textEdit.reset");
    fireEvent.press(resetButton);

    // Verify text was reset to empty
    expect(textInput.props.value).toBe("");
  });

  it("should not show reset button when text has not been modified", () => {
    const { queryByText } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // Reset button should not be visible when text hasn't been changed
    const resetButton = queryByText("textEdit.reset");
    expect(resetButton).toBeNull();
  });

  it("should show reset button only when text has been modified", () => {
    const { getByDisplayValue, getByText, queryByText } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const textInput = getByDisplayValue("Sample extracted text");

    // Initially, reset button should not be visible
    expect(queryByText("textEdit.reset")).toBeNull();

    // Modify the text
    fireEvent.changeText(textInput, "Modified text");

    // Now reset button should be visible
    const resetButton = getByText("textEdit.reset");
    expect(resetButton).toBeTruthy();
  });

  it("should apply theme colors correctly", () => {
    const { getByDisplayValue } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const textInput = getByDisplayValue("Sample extracted text");

    // Check that the text input has the correct styling properties
    expect(textInput.props.style).toEqual(
      expect.objectContaining({
        fontSize: mockTheme.typography.sizes.md,
        color: mockTheme.colors.text,
        backgroundColor: mockTheme.colors.surface,
      })
    );
  });

  it("should handle partial route params with defaults", () => {
    const routeWithPartialParams = {
      key: "TextEdit",
      name: "TextEdit" as const,
      params: {
        extractedText: "Partial text",
        // imageUri and confidence are missing
      },
    };

    const { getByDisplayValue } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={routeWithPartialParams as any}
      />
    );

    const textInput = getByDisplayValue("Partial text");
    expect(textInput).toBeTruthy();
    expect(textInput.props.value).toBe("Partial text");
  });

  it("should handle long text content", () => {
    const longText =
      "This is a very long text that should be handled properly by the TextEditScreen component. ".repeat(
        10
      );

    const routeWithLongText = {
      key: "TextEdit",
      name: "TextEdit" as const,
      params: {
        extractedText: longText,
        imageUri: "file://test.jpg",
        confidence: 0.95,
      },
    };

    const { getByDisplayValue } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={routeWithLongText as any}
      />
    );

    const textInput = getByDisplayValue(longText);
    expect(textInput).toBeTruthy();
    expect(textInput.props.value).toBe(longText);
    expect(textInput.props.multiline).toBe(true);
  });

  it("should handle empty text scenario", () => {
    const routeWithEmptyText = {
      key: "TextEdit",
      name: "TextEdit" as const,
      params: {
        extractedText: "   ", // Only whitespace
        imageUri: "",
        confidence: 0,
      },
    };

    const { getByDisplayValue } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={routeWithEmptyText as any}
      />
    );

    // Verify that the component renders with empty text
    const textInput = getByDisplayValue("   ");
    expect(textInput).toBeTruthy();

    // Verify that setOptions was still called to configure the header
    expect(mockNavigation.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        headerRight: expect.any(Function),
      })
    );
  });

  it("should handle default values when params are missing", () => {
    const routeWithoutParams = {
      key: "TextEdit",
      name: "TextEdit" as const,
      params: undefined,
    };

    const { getByDisplayValue } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={routeWithoutParams as any}
      />
    );

    // Verify that the component renders with empty text
    const textInput = getByDisplayValue("");
    expect(textInput).toBeTruthy();

    // Verify that setOptions was still called to configure the header
    expect(mockNavigation.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        headerRight: expect.any(Function),
      })
    );
  });

  it("should handle save functionality", () => {
    // This test verifies that the save functionality exists and can be triggered
    // The actual save logic is tested through the component's behavior
    render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // Verify that setOptions was called to configure the header with save button
    expect(mockNavigation.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        headerRight: expect.any(Function),
      })
    );

    // Get the header button function from setOptions call
    const setOptionsCall = mockNavigation.setOptions.mock.calls[0][0];
    const headerRight = setOptionsCall.headerRight;

    // Verify that the header button is a function that can be rendered
    expect(typeof headerRight).toBe("function");

    // Render the header button to verify it doesn't crash
    const HeaderButton = headerRight;
    const { root } = render(<HeaderButton />);
    expect(root).toBeTruthy();
  });

  it("should handle text editing", () => {
    const { getByDisplayValue } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const textInput = getByDisplayValue("Sample extracted text");

    // Test that text can be edited
    fireEvent.changeText(textInput, "Edited text");

    // Verify the text was updated
    expect(textInput.props.value).toBe("Edited text");
  });

  it("should handle text reset", () => {
    const { getByDisplayValue, getByText } = render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const textInput = getByDisplayValue("Sample extracted text");

    // Edit the text first
    fireEvent.changeText(textInput, "Edited text");
    expect(textInput.props.value).toBe("Edited text");

    // Reset the text
    const resetButton = getByText("textEdit.reset");
    fireEvent.press(resetButton);

    // Verify text was reset to original
    expect(textInput.props.value).toBe("Sample extracted text");
  });

  it("should handle save with empty text scenario", async () => {
    // Mock Alert to capture calls
    const mockAlert = jest.spyOn(Alert, "alert");

    const routeWithEmptyText = {
      key: "TextEdit",
      name: "TextEdit" as const,
      params: {
        extractedText: "   ", // Only whitespace
        imageUri: "",
        confidence: 0,
      },
    };

    render(
      <TextEditScreen
        navigation={mockNavigation as any}
        route={routeWithEmptyText as any}
      />
    );

    // Get the header button function from setOptions call
    const setOptionsCall = mockNavigation.setOptions.mock.calls[0][0];
    const headerRight = setOptionsCall.headerRight;

    // Create a mock TouchableOpacity that calls onPress when rendered
    const MockTouchableOpacity = ({ onPress }: any) => {
      React.useEffect(() => {
        if (onPress) {
          onPress();
        }
      }, [onPress]);
      return null;
    };

    // Mock TouchableOpacity to capture the onPress function
    const originalTouchableOpacity = require("react-native").TouchableOpacity;
    require("react-native").TouchableOpacity = MockTouchableOpacity;

    // Create a new renderer for the header button
    const { render: renderHeader } = require("@testing-library/react-native");
    const HeaderButton = headerRight;
    renderHeader(<HeaderButton />);

    // Wait for alert to be called
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "error.emptyText",
        "error.emptyTextMessage",
        [{ text: "common.ok" }]
      );
    });

    // Restore original TouchableOpacity and Alert
    require("react-native").TouchableOpacity = originalTouchableOpacity;
    mockAlert.mockRestore();
  });
});

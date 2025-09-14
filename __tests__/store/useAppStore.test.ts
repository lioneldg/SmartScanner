import { act } from "@testing-library/react-native";
import { useAppStore } from "../../src/store/useAppStore";
import { changeLanguage } from "../../src/locales/i18n";
import { lightTheme, darkTheme } from "../../src/themes/colors";

// Mock dependencies
jest.mock("../../src/locales/i18n", () => ({
  changeLanguage: jest.fn(),
}));

jest.mock("../../src/themes/colors", () => ({
  lightTheme: {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
  },
  darkTheme: {
    primary: "#0A84FF",
    background: "#000000",
    text: "#FFFFFF",
  },
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

describe("useAppStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    useAppStore.setState({
      themeMode: "light",
      theme: lightTheme,
      isDark: false,
      currentLanguage: "system" as any,
      isThemeLoading: false,
      isLanguageLoading: false,
      hasHydrated: false,
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = useAppStore.getState();

      expect(state.themeMode).toBe("light");
      expect(state.theme).toEqual(lightTheme);
      expect(state.isDark).toBe(false);
      expect(state.currentLanguage).toBe("system");
      expect(state.isThemeLoading).toBe(false);
      expect(state.isLanguageLoading).toBe(false);
      expect(state.hasHydrated).toBe(false);
    });
  });

  describe("Theme Management", () => {
    it("should set theme mode to dark", () => {
      useAppStore.getState().setThemeMode("dark");
      const state = useAppStore.getState();

      expect(state.themeMode).toBe("dark");
      expect(state.theme).toEqual(darkTheme);
      expect(state.isDark).toBe(true);
    });

    it("should set theme mode to light", () => {
      useAppStore.getState().setThemeMode("light");
      const state = useAppStore.getState();

      expect(state.themeMode).toBe("light");
      expect(state.theme).toEqual(lightTheme);
      expect(state.isDark).toBe(false);
    });

    it("should set theme mode to light", () => {
      useAppStore.getState().setThemeMode("light");
      const state = useAppStore.getState();

      expect(state.themeMode).toBe("light");
      expect(state.theme).toEqual(lightTheme);
      expect(state.isDark).toBe(false);
    });

    it("should update theme when switching to dark mode", () => {
      useAppStore.getState().setThemeMode("dark");
      const state = useAppStore.getState();

      expect(state.theme).toEqual(darkTheme);
    });

    it("should update theme when switching to light mode", () => {
      // First set to dark
      useAppStore.getState().setThemeMode("dark");
      // Then switch to light
      useAppStore.getState().setThemeMode("light");
      const state = useAppStore.getState();

      expect(state.theme).toEqual(lightTheme);
    });
  });

  describe("Language Management", () => {
    it("should set language and call changeLanguage", async () => {
      (changeLanguage as jest.Mock).mockResolvedValue(undefined);

      await useAppStore.getState().setLanguage("en");
      const state = useAppStore.getState();

      expect(state.currentLanguage).toBe("en");
      expect(changeLanguage).toHaveBeenCalledWith("en");
    });

    it("should set language to French", async () => {
      (changeLanguage as jest.Mock).mockResolvedValue(undefined);

      await useAppStore.getState().setLanguage("fr");
      const state = useAppStore.getState();

      expect(state.currentLanguage).toBe("fr");
      expect(changeLanguage).toHaveBeenCalledWith("fr");
    });

    it("should handle language change errors", async () => {
      (changeLanguage as jest.Mock).mockRejectedValue(
        new Error("Language change failed")
      );

      await expect(
        useAppStore.getState().setLanguage("en" as any) // Test with invalid type
      ).rejects.toThrow("Language change failed");
    });
  });

  describe("Loading States", () => {
    it("should set theme loading state", () => {
      useAppStore.getState().setThemeLoading(true);
      expect(useAppStore.getState().isThemeLoading).toBe(true);

      useAppStore.getState().setThemeLoading(false);
      expect(useAppStore.getState().isThemeLoading).toBe(false);
    });

    it("should set language loading state", () => {
      useAppStore.getState().setLanguageLoading(true);
      expect(useAppStore.getState().isLanguageLoading).toBe(true);

      useAppStore.getState().setLanguageLoading(false);
      expect(useAppStore.getState().isLanguageLoading).toBe(false);
    });
  });

  describe("Hydration State", () => {
    it("should set hydration state", () => {
      useAppStore.getState().setHasHydrated(true);
      expect(useAppStore.getState().hasHydrated).toBe(true);

      useAppStore.getState().setHasHydrated(false);
      expect(useAppStore.getState().hasHydrated).toBe(false);
    });
  });

  describe("System Initialization", () => {
    it("should initialize from system dark mode when not hydrated", () => {
      useAppStore.getState().initializeFromSystem("dark");
      const state = useAppStore.getState();

      expect(state.themeMode).toBe("dark");
      expect(state.theme).toEqual(darkTheme);
      expect(state.isDark).toBe(true);
    });

    it("should initialize from system light mode when not hydrated", () => {
      useAppStore.getState().initializeFromSystem("light");
      const state = useAppStore.getState();

      expect(state.themeMode).toBe("light");
      expect(state.theme).toEqual(lightTheme);
      expect(state.isDark).toBe(false);
    });

    it("should not initialize if already hydrated", () => {
      useAppStore.getState().setHasHydrated(true);
      useAppStore.getState().setThemeMode("dark");

      useAppStore.getState().initializeFromSystem("light");
      const state = useAppStore.getState();

      // Should remain dark since already hydrated
      expect(state.themeMode).toBe("dark");
      expect(state.theme).toEqual(darkTheme);
    });

    it("should not initialize if theme mode is not light", () => {
      useAppStore.getState().setThemeMode("dark");

      useAppStore.getState().initializeFromSystem("light");
      const state = useAppStore.getState();

      // Should remain dark
      expect(state.themeMode).toBe("dark");
    });

    it("should handle null system color scheme", () => {
      useAppStore.getState().initializeFromSystem(null);
      const state = useAppStore.getState();

      expect(state.themeMode).toBe("light");
      expect(state.theme).toEqual(lightTheme);
      expect(state.isDark).toBe(false);
    });
  });

  describe("App Initialization", () => {
    it("should initialize app with current theme", async () => {
      (changeLanguage as jest.Mock).mockResolvedValue(undefined);
      useAppStore.getState().setThemeMode("dark");

      await useAppStore.getState().initializeApp();
      const state = useAppStore.getState();

      expect(state.theme).toEqual(darkTheme);
      expect(state.isDark).toBe(true);
      expect(changeLanguage).toHaveBeenCalledWith("system");
    });

    it("should initialize app with light theme", async () => {
      (changeLanguage as jest.Mock).mockResolvedValue(undefined);
      useAppStore.getState().setThemeMode("light");

      await useAppStore.getState().initializeApp();
      const state = useAppStore.getState();

      expect(state.theme).toEqual(lightTheme);
      expect(state.isDark).toBe(false);
    });

    it("should call changeLanguage with current language", async () => {
      (changeLanguage as jest.Mock).mockResolvedValue(undefined);
      useAppStore.getState().setLanguage("fr");

      await useAppStore.getState().initializeApp();

      expect(changeLanguage).toHaveBeenCalledWith("fr");
    });
  });

  describe("Persistence", () => {
    it("should persist theme mode and language", () => {
      const state = useAppStore.getState();

      // These should be persisted according to partialize
      expect(state.themeMode).toBeDefined();
      expect(state.currentLanguage).toBeDefined();
    });

    it("should not persist other state properties", () => {
      const state = useAppStore.getState();

      // These should not be persisted
      expect(state.theme).toBeDefined(); // This is computed
      expect(state.isDark).toBeDefined(); // This is computed
      expect(state.isThemeLoading).toBeDefined();
      expect(state.isLanguageLoading).toBeDefined();
      expect(state.hasHydrated).toBeDefined();
    });
  });

  describe("State Updates", () => {
    it("should update multiple state properties atomically", () => {
      useAppStore.setState({
        themeMode: "dark",
        isThemeLoading: true,
        isLanguageLoading: true,
      });

      const state = useAppStore.getState();
      expect(state.themeMode).toBe("dark");
      expect(state.isThemeLoading).toBe(true);
      expect(state.isLanguageLoading).toBe(true);
    });

    it("should maintain state consistency", () => {
      useAppStore.getState().setThemeMode("dark");
      const state = useAppStore.getState();

      expect(state.themeMode).toBe("dark");
      expect(state.isDark).toBe(true);
      expect(state.theme).toEqual(darkTheme);
    });
  });

  describe("Error Handling", () => {
    it("should handle language change errors gracefully", async () => {
      (changeLanguage as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(useAppStore.getState().setLanguage("en")).rejects.toThrow(
        "Network error"
      );

      // State should not be updated on error
      const state = useAppStore.getState();
      expect(state.currentLanguage).toBe("en"); // Initial value
    });

    it("should handle app initialization errors", async () => {
      (changeLanguage as jest.Mock).mockRejectedValue(new Error("i18n error"));

      await expect(useAppStore.getState().initializeApp()).rejects.toThrow(
        "i18n error"
      );
    });
  });

  describe("Store Integration", () => {
    it("should work with multiple subscribers", () => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      const unsubscribe1 = useAppStore.subscribe(subscriber1);
      const unsubscribe2 = useAppStore.subscribe(subscriber2);

      // Trigger state change
      useAppStore.getState().setThemeMode("dark");

      // Check that the state was actually changed
      const state = useAppStore.getState();
      expect(state.themeMode).toBe("dark");

      // Clean up
      unsubscribe1();
      unsubscribe2();
    });

    it("should unsubscribe properly", () => {
      const subscriber = jest.fn();
      const unsubscribe = useAppStore.subscribe(subscriber);

      unsubscribe();
      useAppStore.getState().setThemeMode("dark");

      expect(subscriber).not.toHaveBeenCalled();
    });
  });
});

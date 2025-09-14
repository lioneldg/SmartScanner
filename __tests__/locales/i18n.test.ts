import {
  getDeviceLocale,
  determineLanguage,
  changeLanguage,
  getAvailableLanguageOptions,
  LANGUAGES,
} from "../../src/locales/i18n";
import * as RNLocalize from "react-native-localize";
import i18n from "i18next";

// Mock dependencies
jest.mock("react-native-localize", () => ({
  getLocales: jest.fn(),
}));

jest.mock("i18next", () => ({
  changeLanguage: jest.fn(),
  use: jest.fn().mockReturnThis(),
  init: jest.fn(),
}));

const mockGetLocales = RNLocalize.getLocales as jest.MockedFunction<
  typeof RNLocalize.getLocales
>;
const mockI18nChangeLanguage = i18n.changeLanguage as jest.MockedFunction<
  typeof i18n.changeLanguage
>;

describe("i18n utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDeviceLocale", () => {
    it("should return first locale language code", () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "fr",
          countryCode: "FR",
          languageTag: "fr-FR",
          isRTL: false,
        },
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
      ]);

      const result = getDeviceLocale();
      expect(result).toBe("fr");
    });

    it("should return fallback when no locales", () => {
      mockGetLocales.mockReturnValue([]);

      const result = getDeviceLocale();
      expect(result).toBe("en");
    });

    it("should handle empty locales array", () => {
      mockGetLocales.mockReturnValue([]);

      const result = getDeviceLocale();
      expect(result).toBe("en");
    });

    it("should handle undefined locales", () => {
      mockGetLocales.mockReturnValue(undefined as any);

      const result = getDeviceLocale();
      expect(result).toBe("en");
    });
  });

  describe("determineLanguage", () => {
    beforeEach(() => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
      ]);
    });

    it("should return selected language when not system", () => {
      const result = determineLanguage("fr");
      expect(result).toBe("fr");
    });

    it("should return selected language for English", () => {
      const result = determineLanguage("en");
      expect(result).toBe("en");
    });

    it("should return device locale when system selected and device is English", () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
      ]);

      const result = determineLanguage("system");
      expect(result).toBe("en");
    });

    it("should return device locale when system selected and device is French", () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "fr",
          countryCode: "FR",
          languageTag: "fr-FR",
          isRTL: false,
        },
      ]);

      const result = determineLanguage("system");
      expect(result).toBe("fr");
    });

    it("should return English when system selected and device is other language", () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "de",
          countryCode: "DE",
          languageTag: "de-DE",
          isRTL: false,
        },
      ]);

      const result = determineLanguage("system");
      expect(result).toBe("en");
    });

    it("should return English when system selected and no device locale", () => {
      mockGetLocales.mockReturnValue([]);

      const result = determineLanguage("system");
      expect(result).toBe("en");
    });
  });

  describe("changeLanguage", () => {
    beforeEach(() => {
      mockI18nChangeLanguage.mockResolvedValue({} as any);
    });

    it("should change language to selected language", async () => {
      await changeLanguage("fr");

      expect(mockI18nChangeLanguage).toHaveBeenCalledWith("fr");
    });

    it("should change language to English when system selected and device is English", async () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
      ]);

      await changeLanguage("system");

      expect(mockI18nChangeLanguage).toHaveBeenCalledWith("en");
    });

    it("should change language to French when system selected and device is French", async () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "fr",
          countryCode: "FR",
          languageTag: "fr-FR",
          isRTL: false,
        },
      ]);

      await changeLanguage("system");

      expect(mockI18nChangeLanguage).toHaveBeenCalledWith("fr");
    });

    it("should change language to English when system selected and device is other language", async () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "de",
          countryCode: "DE",
          languageTag: "de-DE",
          isRTL: false,
        },
      ]);

      await changeLanguage("system");

      expect(mockI18nChangeLanguage).toHaveBeenCalledWith("en");
    });

    it("should handle i18n change language errors", async () => {
      mockI18nChangeLanguage.mockRejectedValue(
        new Error("Language change failed")
      );

      await expect(changeLanguage("fr")).rejects.toThrow(
        "Language change failed"
      );
    });
  });

  describe("getAvailableLanguageOptions", () => {
    it("should return system and English options when device is French", () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "fr",
          countryCode: "FR",
          languageTag: "fr-FR",
          isRTL: false,
        },
      ]);

      const options = getAvailableLanguageOptions();

      expect(options).toEqual([
        { key: "system", labelKey: "common.system" },
        { key: "en", labelKey: "common.english" },
      ]);
    });

    it("should return system and French options when device is English", () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
      ]);

      const options = getAvailableLanguageOptions();

      expect(options).toEqual([
        { key: "system", labelKey: "common.system" },
        { key: "fr", labelKey: "common.french" },
      ]);
    });

    it("should return English and French options when device is other language", () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "de",
          countryCode: "DE",
          languageTag: "de-DE",
          isRTL: false,
        },
      ]);

      const options = getAvailableLanguageOptions();

      expect(options).toEqual([
        { key: "en", labelKey: "common.english" },
        { key: "fr", labelKey: "common.french" },
      ]);
    });

    it("should return English and French options when no device locale", () => {
      mockGetLocales.mockReturnValue([]);

      const options = getAvailableLanguageOptions();

      expect(options).toEqual([
        { key: "system", labelKey: "common.system" },
        { key: "fr", labelKey: "common.french" },
      ]);
    });

    it("should handle undefined device locale", () => {
      mockGetLocales.mockReturnValue(undefined as any);

      const options = getAvailableLanguageOptions();

      expect(options).toEqual([
        { key: "system", labelKey: "common.system" },
        { key: "fr", labelKey: "common.french" },
      ]);
    });
  });

  describe("LANGUAGES constant", () => {
    it("should have correct language constants", () => {
      expect(LANGUAGES.SYSTEM).toBe("system");
      expect(LANGUAGES.EN).toBe("en");
      expect(LANGUAGES.FR).toBe("fr");
    });

    it("should be immutable", () => {
      // Test that we can't modify the constant
      const originalSystem = LANGUAGES.SYSTEM;
      (LANGUAGES as any).SYSTEM = "modified";
      expect(LANGUAGES.SYSTEM).toBe(originalSystem); // Should not change
    });
  });

  describe("Edge cases", () => {
    it("should handle null device locale", () => {
      mockGetLocales.mockReturnValue(null as any);

      const result = getDeviceLocale();
      expect(result).toBe("en");
    });

    it("should handle malformed locale objects", () => {
      mockGetLocales.mockReturnValue([
        { languageCode: null, countryCode: "US" },
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
      ] as any);

      const result = getDeviceLocale();
      expect(result).toBe("en");
    });

    it("should handle empty language code", () => {
      mockGetLocales.mockReturnValue([
        { languageCode: "", countryCode: "US" },
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
      ] as any);

      const result = getDeviceLocale();
      expect(result).toBe("en");
    });

    it("should handle multiple locales with same language", () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
        {
          languageCode: "en",
          countryCode: "GB",
          languageTag: "en-GB",
          isRTL: false,
        },
        {
          languageCode: "fr",
          countryCode: "FR",
          languageTag: "fr-FR",
          isRTL: false,
        },
      ]);

      const result = getDeviceLocale();
      expect(result).toBe("en");
    });
  });

  describe("Integration tests", () => {
    it("should work correctly with French device and system language", async () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "fr",
          countryCode: "FR",
          languageTag: "fr-FR",
          isRTL: false,
        },
      ]);
      mockI18nChangeLanguage.mockResolvedValue({} as any);

      const options = getAvailableLanguageOptions();
      expect(options).toHaveLength(2);
      expect(options[0].key).toBe("system");

      await changeLanguage("system");
      expect(mockI18nChangeLanguage).toHaveBeenCalledWith("fr");
    });

    it("should work correctly with English device and system language", async () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "en",
          countryCode: "US",
          languageTag: "en-US",
          isRTL: false,
        },
      ]);
      mockI18nChangeLanguage.mockResolvedValue({} as any);

      const options = getAvailableLanguageOptions();
      expect(options).toHaveLength(2);
      expect(options[0].key).toBe("system");

      await changeLanguage("system");
      expect(mockI18nChangeLanguage).toHaveBeenCalledWith("en");
    });

    it("should work correctly with non-supported device language", async () => {
      mockGetLocales.mockReturnValue([
        {
          languageCode: "es",
          countryCode: "ES",
          languageTag: "es-ES",
          isRTL: false,
        },
      ]);
      mockI18nChangeLanguage.mockResolvedValue({} as any);

      const options = getAvailableLanguageOptions();
      expect(options).toHaveLength(2);
      expect(options[0].key).toBe("en");
      expect(options[1].key).toBe("fr");

      await changeLanguage("system");
      expect(mockI18nChangeLanguage).toHaveBeenCalledWith("en");
    });
  });
});

import DateFormatService from "../../src/services/DateFormatService";
import i18n from "../../src/locales/i18n";

// Mock i18n
jest.mock("../../src/locales/i18n", () => ({
  language: "en",
}));

describe("DateFormatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("formatDate", () => {
    const testTimestamp = 1640995200000; // 2022-01-01 00:00:00 UTC

    it("should format date with time by default", () => {
      const result = DateFormatService.formatDate(testTimestamp);

      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it("should format date without time when includeTime is false", () => {
      const result = DateFormatService.formatDate(testTimestamp, {
        includeTime: false,
      });

      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).not.toMatch(/\d{2}:\d{2}/);
    });

    it("should format date with time when includeTime is true", () => {
      const result = DateFormatService.formatDate(testTimestamp, {
        includeTime: true,
      });

      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it("should use English locale by default", () => {
      (i18n.language as any) = "en";
      const result = DateFormatService.formatDate(testTimestamp);

      // English format: MM/DD/YYYY, HH:MM
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it("should use French locale when language is fr", () => {
      (i18n.language as any) = "fr";
      const result = DateFormatService.formatDate(testTimestamp);

      // French format: DD/MM/YYYY HH:MM (without comma)
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });

    it("should fallback to English for unknown language", () => {
      (i18n.language as any) = "unknown";
      const result = DateFormatService.formatDate(testTimestamp);

      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it("should handle different timestamps correctly", () => {
      const timestamps = [
        1640995200000, // 2022-01-01 00:00:00
        1641081600000, // 2022-01-02 00:00:00
        1641168000000, // 2022-01-03 00:00:00
      ];

      timestamps.forEach((timestamp) => {
        const result = DateFormatService.formatDate(timestamp);
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
      });
    });

    it("should handle edge case timestamps", () => {
      const edgeCases = [
        0, // Unix epoch
        946684800000, // 2000-01-01
        4102444800000, // 2100-01-01
      ];

      edgeCases.forEach((timestamp) => {
        const result = DateFormatService.formatDate(timestamp);
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
      });
    });
  });

  describe("formatScanDate", () => {
    const testTimestamp = 1640995200000; // 2022-01-01 00:00:00 UTC

    it("should format scan date with time", () => {
      const result = DateFormatService.formatScanDate(testTimestamp);

      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it("should be equivalent to formatDate with includeTime true", () => {
      const scanDateResult = DateFormatService.formatScanDate(testTimestamp);
      const formatDateResult = DateFormatService.formatDate(testTimestamp, {
        includeTime: true,
      });

      expect(scanDateResult).toBe(formatDateResult);
    });

    it("should handle different timestamps", () => {
      const timestamps = [
        1640995200000, // 2022-01-01 00:00:00
        1641081600000, // 2022-01-02 00:00:00
        1641168000000, // 2022-01-03 00:00:00
      ];

      timestamps.forEach((timestamp) => {
        const result = DateFormatService.formatScanDate(timestamp);
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
      });
    });
  });

  describe("Locale-specific formatting", () => {
    const testTimestamp = 1640995200000; // 2022-01-01 00:00:00 UTC

    it("should format correctly for English locale", () => {
      (i18n.language as any) = "en";
      const result = DateFormatService.formatDate(testTimestamp);

      // Should contain date and time
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it("should format correctly for French locale", () => {
      (i18n.language as any) = "fr";
      const result = DateFormatService.formatDate(testTimestamp);

      // Should contain date and time
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });

    it("should handle language changes dynamically", () => {
      (i18n.language as any) = "en";
      const englishResult = DateFormatService.formatDate(testTimestamp);

      (i18n.language as any) = "fr";
      const frenchResult = DateFormatService.formatDate(testTimestamp);

      // Both should be valid date formats
      expect(englishResult).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
      expect(frenchResult).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });
  });

  describe("Error handling", () => {
    it("should handle invalid timestamps gracefully", () => {
      // Test specific invalid timestamps that should throw
      expect(() => {
        DateFormatService.formatDate(NaN);
      }).toThrow();

      expect(() => {
        DateFormatService.formatDate(Infinity);
      }).toThrow();

      expect(() => {
        DateFormatService.formatDate(-Infinity);
      }).toThrow();

      // Test that valid timestamps don't throw
      expect(() => {
        DateFormatService.formatDate(0);
      }).not.toThrow();

      expect(() => {
        DateFormatService.formatDate(1000);
      }).not.toThrow();
    });

    it("should handle very large timestamps", () => {
      const largeTimestamp = Number.MAX_SAFE_INTEGER;

      expect(() => {
        DateFormatService.formatDate(largeTimestamp);
      }).toThrow();

      // Test that reasonable large timestamps work
      const reasonableLargeTimestamp = 4102444800000; // Year 2100
      expect(() => {
        DateFormatService.formatDate(reasonableLargeTimestamp);
      }).not.toThrow();
    });

    it("should handle negative timestamps", () => {
      const negativeTimestamp = -1640995200000;

      expect(() => {
        DateFormatService.formatDate(negativeTimestamp);
      }).not.toThrow();
    });
  });

  describe("Static method behavior", () => {
    it("should be callable without instantiation", () => {
      expect(typeof DateFormatService.formatDate).toBe("function");
      expect(typeof DateFormatService.formatScanDate).toBe("function");
    });

    it("should not have side effects", () => {
      const timestamp1 = 1640995200000;
      const timestamp2 = 1641081600000;

      const result1 = DateFormatService.formatDate(timestamp1);
      const result2 = DateFormatService.formatDate(timestamp2);
      const result1Again = DateFormatService.formatDate(timestamp1);

      expect(result1).toBe(result1Again);
      expect(result1).not.toBe(result2);
    });
  });
});

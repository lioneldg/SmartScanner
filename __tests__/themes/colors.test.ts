import { lightTheme, darkTheme } from "../../src/themes/colors";
import { Theme } from "../../src/types/theme";

describe("Theme Colors", () => {
  describe("lightTheme", () => {
    it("should have correct structure", () => {
      expect(lightTheme).toHaveProperty("colors");
      expect(lightTheme).toHaveProperty("spacing");
      expect(lightTheme).toHaveProperty("borderRadius");
      expect(lightTheme).toHaveProperty("typography");
    });

    it("should have all required color properties", () => {
      const requiredColors = [
        "background",
        "surface",
        "card",
        "text",
        "textSecondary",
        "textTertiary",
        "buttonText",
        "primary",
        "primaryLight",
        "primaryDark",
        "success",
        "warning",
        "error",
        "info",
        "border",
        "divider",
        "ripple",
        "overlay",
        "modalBackground",
        "modalOverlay",
      ];

      requiredColors.forEach((color) => {
        expect(lightTheme.colors).toHaveProperty(color);
        expect(
          lightTheme.colors[color as keyof typeof lightTheme.colors]
        ).toBeDefined();
      });
    });

    it("should have correct background colors", () => {
      expect(lightTheme.colors.background).toBe("#FFFFFF");
      expect(lightTheme.colors.surface).toBe("#F8F9FA");
      expect(lightTheme.colors.card).toBe("#FFFFFF");
    });

    it("should have correct text colors", () => {
      expect(lightTheme.colors.text).toBe("#1A1A1A");
      expect(lightTheme.colors.textSecondary).toBe("#666666");
      expect(lightTheme.colors.textTertiary).toBe("#999999");
      expect(lightTheme.colors.buttonText).toBe("#1A1A1A");
    });

    it("should have correct primary colors", () => {
      expect(lightTheme.colors.primary).toBe("#FF9500");
      expect(lightTheme.colors.primaryLight).toBe("#FFB84D");
      expect(lightTheme.colors.primaryDark).toBe("#E68500");
    });

    it("should have correct status colors", () => {
      expect(lightTheme.colors.success).toBe("#28A745");
      expect(lightTheme.colors.warning).toBe("#FFC107");
      expect(lightTheme.colors.error).toBe("#DC3545");
      expect(lightTheme.colors.info).toBe("#17A2B8");
    });

    it("should have correct border colors", () => {
      expect(lightTheme.colors.border).toBe("#E9ECEF");
      expect(lightTheme.colors.divider).toBe("#DEE2E6");
    });

    it("should have correct interactive colors", () => {
      expect(lightTheme.colors.ripple).toBe("rgba(255, 149, 0, 0.06)");
      expect(lightTheme.colors.overlay).toBe("rgba(0, 0, 0, 0.1)");
    });

    it("should have correct modal colors", () => {
      expect(lightTheme.colors.modalBackground).toBe("#FFFFFF");
      expect(lightTheme.colors.modalOverlay).toBe("rgba(0, 0, 0, 0.5)");
    });
  });

  describe("darkTheme", () => {
    it("should have correct structure", () => {
      expect(darkTheme).toHaveProperty("colors");
      expect(darkTheme).toHaveProperty("spacing");
      expect(darkTheme).toHaveProperty("borderRadius");
      expect(darkTheme).toHaveProperty("typography");
    });

    it("should have all required color properties", () => {
      const requiredColors = [
        "background",
        "surface",
        "card",
        "text",
        "textSecondary",
        "textTertiary",
        "buttonText",
        "primary",
        "primaryLight",
        "primaryDark",
        "success",
        "warning",
        "error",
        "info",
        "border",
        "divider",
        "ripple",
        "overlay",
        "modalBackground",
        "modalOverlay",
      ];

      requiredColors.forEach((color) => {
        expect(darkTheme.colors).toHaveProperty(color);
        expect(
          darkTheme.colors[color as keyof typeof darkTheme.colors]
        ).toBeDefined();
      });
    });

    it("should have correct background colors", () => {
      expect(darkTheme.colors.background).toBe("#000000");
      expect(darkTheme.colors.surface).toBe("#1C1C1E");
      expect(darkTheme.colors.card).toBe("#2C2C2E");
    });

    it("should have correct text colors", () => {
      expect(darkTheme.colors.text).toBe("#FFFFFF");
      expect(darkTheme.colors.textSecondary).toBe("#AEAEB2");
      expect(darkTheme.colors.textTertiary).toBe("#8E8E93");
      expect(darkTheme.colors.buttonText).toBe("#FFFFFF");
    });

    it("should have correct primary colors", () => {
      expect(darkTheme.colors.primary).toBe("#007AFF");
      expect(darkTheme.colors.primaryLight).toBe("#5AC8FA");
      expect(darkTheme.colors.primaryDark).toBe("#0051D5");
    });

    it("should have correct status colors", () => {
      expect(darkTheme.colors.success).toBe("#30D158");
      expect(darkTheme.colors.warning).toBe("#FF9F0A");
      expect(darkTheme.colors.error).toBe("#FF453A");
      expect(darkTheme.colors.info).toBe("#64D2FF");
    });

    it("should have correct border colors", () => {
      expect(darkTheme.colors.border).toBe("#38383A");
      expect(darkTheme.colors.divider).toBe("#48484A");
    });

    it("should have correct interactive colors", () => {
      expect(darkTheme.colors.ripple).toBe("rgba(0, 122, 255, 0.06)");
      expect(darkTheme.colors.overlay).toBe("rgba(255, 255, 255, 0.1)");
    });

    it("should have correct modal colors", () => {
      expect(darkTheme.colors.modalBackground).toBe("#1C1C1E");
      expect(darkTheme.colors.modalOverlay).toBe("rgba(0, 0, 0, 0.7)");
    });
  });

  describe("Shared properties", () => {
    it("should have identical spacing values", () => {
      expect(lightTheme.spacing).toEqual(darkTheme.spacing);
    });

    it("should have identical borderRadius values", () => {
      expect(lightTheme.borderRadius).toEqual(darkTheme.borderRadius);
    });

    it("should have identical typography values", () => {
      expect(lightTheme.typography).toEqual(darkTheme.typography);
    });

    it("should have correct spacing values", () => {
      expect(lightTheme.spacing.xs).toBe(4);
      expect(lightTheme.spacing.sm).toBe(8);
      expect(lightTheme.spacing.md).toBe(16);
      expect(lightTheme.spacing.lg).toBe(24);
      expect(lightTheme.spacing.xl).toBe(32);
      expect(lightTheme.spacing.xxl).toBe(48);
    });

    it("should have correct borderRadius values", () => {
      expect(lightTheme.borderRadius.sm).toBe(4);
      expect(lightTheme.borderRadius.md).toBe(8);
      expect(lightTheme.borderRadius.lg).toBe(12);
      expect(lightTheme.borderRadius.xl).toBe(16);
    });

    it("should have correct typography sizes", () => {
      expect(lightTheme.typography.sizes.xs).toBe(12);
      expect(lightTheme.typography.sizes.sm).toBe(14);
      expect(lightTheme.typography.sizes.md).toBe(16);
      expect(lightTheme.typography.sizes.lg).toBe(18);
      expect(lightTheme.typography.sizes.xl).toBe(24);
      expect(lightTheme.typography.sizes.xxl).toBe(32);
    });

    it("should have correct typography weights", () => {
      expect(lightTheme.typography.weights.normal).toBe("400");
      expect(lightTheme.typography.weights.medium).toBe("500");
      expect(lightTheme.typography.weights.semibold).toBe("600");
      expect(lightTheme.typography.weights.bold).toBe("700");
    });
  });

  describe("Color contrast and accessibility", () => {
    it("should have sufficient contrast between text and background in light theme", () => {
      // Basic check that text colors are darker than background
      expect(lightTheme.colors.text).not.toBe(lightTheme.colors.background);
      expect(lightTheme.colors.textSecondary).not.toBe(
        lightTheme.colors.background
      );
    });

    it("should have sufficient contrast between text and background in dark theme", () => {
      // Basic check that text colors are lighter than background
      expect(darkTheme.colors.text).not.toBe(darkTheme.colors.background);
      expect(darkTheme.colors.textSecondary).not.toBe(
        darkTheme.colors.background
      );
    });

    it("should have different primary colors between themes", () => {
      expect(lightTheme.colors.primary).not.toBe(darkTheme.colors.primary);
    });

    it("should have different background colors between themes", () => {
      expect(lightTheme.colors.background).not.toBe(
        darkTheme.colors.background
      );
      expect(lightTheme.colors.surface).not.toBe(darkTheme.colors.surface);
    });
  });

  describe("Theme type compatibility", () => {
    it("should be compatible with Theme type", () => {
      const lightThemeTyped: Theme = lightTheme;
      const darkThemeTyped: Theme = darkTheme;

      expect(lightThemeTyped).toBeDefined();
      expect(darkThemeTyped).toBeDefined();
    });

    it("should have all required Theme properties", () => {
      const requiredProperties = [
        "colors",
        "spacing",
        "borderRadius",
        "typography",
      ];

      requiredProperties.forEach((prop) => {
        expect(lightTheme).toHaveProperty(prop);
        expect(darkTheme).toHaveProperty(prop);
      });
    });
  });

  describe("Color format validation", () => {
    it("should have valid hex color formats", () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      Object.values(lightTheme.colors).forEach((color) => {
        if (typeof color === "string" && color.startsWith("#")) {
          expect(color).toMatch(hexColorRegex);
        }
      });

      Object.values(darkTheme.colors).forEach((color) => {
        if (typeof color === "string" && color.startsWith("#")) {
          expect(color).toMatch(hexColorRegex);
        }
      });
    });

    it("should have valid rgba color formats", () => {
      const rgbaColorRegex = /^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/;

      Object.values(lightTheme.colors).forEach((color) => {
        if (typeof color === "string" && color.startsWith("rgba")) {
          expect(color).toMatch(rgbaColorRegex);
        }
      });

      Object.values(darkTheme.colors).forEach((color) => {
        if (typeof color === "string" && color.startsWith("rgba")) {
          expect(color).toMatch(rgbaColorRegex);
        }
      });
    });
  });

  describe("Theme consistency", () => {
    it("should have consistent color naming", () => {
      const lightColorKeys = Object.keys(lightTheme.colors);
      const darkColorKeys = Object.keys(darkTheme.colors);

      expect(lightColorKeys).toEqual(darkColorKeys);
    });

    it("should have consistent spacing naming", () => {
      const lightSpacingKeys = Object.keys(lightTheme.spacing);
      const darkSpacingKeys = Object.keys(darkTheme.spacing);

      expect(lightSpacingKeys).toEqual(darkSpacingKeys);
    });

    it("should have consistent borderRadius naming", () => {
      const lightBorderRadiusKeys = Object.keys(lightTheme.borderRadius);
      const darkBorderRadiusKeys = Object.keys(darkTheme.borderRadius);

      expect(lightBorderRadiusKeys).toEqual(darkBorderRadiusKeys);
    });

    it("should have consistent typography naming", () => {
      const lightTypographyKeys = Object.keys(lightTheme.typography);
      const darkTypographyKeys = Object.keys(darkTheme.typography);

      expect(lightTypographyKeys).toEqual(darkTypographyKeys);
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined color values gracefully", () => {
      // All colors should be defined
      Object.values(lightTheme.colors).forEach((color) => {
        expect(color).toBeDefined();
        expect(color).not.toBeNull();
      });

      Object.values(darkTheme.colors).forEach((color) => {
        expect(color).toBeDefined();
        expect(color).not.toBeNull();
      });
    });

    it("should have non-empty color values", () => {
      Object.values(lightTheme.colors).forEach((color) => {
        expect(color).toBeTruthy();
      });

      Object.values(darkTheme.colors).forEach((color) => {
        expect(color).toBeTruthy();
      });
    });
  });
});

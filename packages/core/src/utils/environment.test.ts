import { describe, expect, it } from "vitest";
import { captureEnvironment } from "./environment.js";

describe("captureEnvironment", () => {
  describe("in non-browser environment (Node.js)", () => {
    it("should return default values when window is undefined", () => {
      const env = captureEnvironment();

      expect(env.userAgent).toBe("unknown");
      expect(env.screenResolution).toEqual([0, 0]);
      expect(env.viewportSize).toEqual([0, 0]);
      expect(env.devicePixelRatio).toBe(1);
      expect(typeof env.timezone).toBe("string");
      expect(env.language).toBe("en");
      expect(env.touchCapable).toBe(false);
    });

    it("should capture timezone from Intl API", () => {
      const env = captureEnvironment();
      // Timezone should be a valid IANA timezone string
      expect(env.timezone.length).toBeGreaterThan(0);
      // Common timezone formats include Region/City
      expect(typeof env.timezone).toBe("string");
    });

    it("should not include connectionType in non-browser environment", () => {
      const env = captureEnvironment();
      expect(env.connectionType).toBeUndefined();
    });
  });

  describe("EnvironmentInfo structure", () => {
    it("should return all required fields", () => {
      const env = captureEnvironment();

      expect(env).toHaveProperty("userAgent");
      expect(env).toHaveProperty("screenResolution");
      expect(env).toHaveProperty("viewportSize");
      expect(env).toHaveProperty("devicePixelRatio");
      expect(env).toHaveProperty("timezone");
      expect(env).toHaveProperty("language");
      expect(env).toHaveProperty("touchCapable");
    });

    it("should return screenResolution as tuple of two numbers", () => {
      const env = captureEnvironment();

      expect(Array.isArray(env.screenResolution)).toBe(true);
      expect(env.screenResolution.length).toBe(2);
      expect(typeof env.screenResolution[0]).toBe("number");
      expect(typeof env.screenResolution[1]).toBe("number");
    });

    it("should return viewportSize as tuple of two numbers", () => {
      const env = captureEnvironment();

      expect(Array.isArray(env.viewportSize)).toBe(true);
      expect(env.viewportSize.length).toBe(2);
      expect(typeof env.viewportSize[0]).toBe("number");
      expect(typeof env.viewportSize[1]).toBe("number");
    });

    it("should return devicePixelRatio as a number", () => {
      const env = captureEnvironment();
      expect(typeof env.devicePixelRatio).toBe("number");
      expect(env.devicePixelRatio).toBeGreaterThanOrEqual(0);
    });

    it("should return touchCapable as a boolean", () => {
      const env = captureEnvironment();
      expect(typeof env.touchCapable).toBe("boolean");
    });
  });

  describe("serialization", () => {
    it("should produce JSON-serializable output", () => {
      const env = captureEnvironment();
      const json = JSON.stringify(env);
      const parsed = JSON.parse(json);

      expect(parsed.userAgent).toBe(env.userAgent);
      expect(parsed.screenResolution).toEqual(env.screenResolution);
      expect(parsed.viewportSize).toEqual(env.viewportSize);
      expect(parsed.devicePixelRatio).toBe(env.devicePixelRatio);
      expect(parsed.timezone).toBe(env.timezone);
      expect(parsed.language).toBe(env.language);
      expect(parsed.touchCapable).toBe(env.touchCapable);
    });
  });
});

import { describe, expect, it } from "vitest";
import { hashText, simpleHash } from "./hash.js";

describe("hashText", () => {
  it("should return a string", async () => {
    const hash = await hashText("test");
    expect(typeof hash).toBe("string");
  });

  it("should return a 64-character hex string for SHA-256", async () => {
    const hash = await hashText("test");
    // SHA-256 produces 256 bits = 64 hex characters
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should return consistent hash for same input", async () => {
    const hash1 = await hashText("hello world");
    const hash2 = await hashText("hello world");
    expect(hash1).toBe(hash2);
  });

  it("should return different hashes for different inputs", async () => {
    const hash1 = await hashText("hello");
    const hash2 = await hashText("world");
    expect(hash1).not.toBe(hash2);
  });

  it("should handle empty string", async () => {
    const hash = await hashText("");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should handle unicode characters", async () => {
    const hash = await hashText("\u4E2D\u6587\u6D4B\u8BD5");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should handle long strings", async () => {
    const longString = "a".repeat(100000);
    const hash = await hashText(longString);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("should handle special characters", async () => {
    const hash = await hashText("!@#$%^&*()_+-=[]{}|;':\",./<>?");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should produce known SHA-256 hash for 'hello'", async () => {
    const hash = await hashText("hello");
    // Known SHA-256 hash for "hello"
    expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
});

describe("simpleHash", () => {
  it("should return a string", () => {
    const hash = simpleHash("test");
    expect(typeof hash).toBe("string");
  });

  it("should return a hex string", () => {
    const hash = simpleHash("test");
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("should return consistent hash for same input", () => {
    const hash1 = simpleHash("hello world");
    const hash2 = simpleHash("hello world");
    expect(hash1).toBe(hash2);
  });

  it("should return different hashes for different inputs", () => {
    const hash1 = simpleHash("hello");
    const hash2 = simpleHash("world");
    expect(hash1).not.toBe(hash2);
  });

  it("should handle empty string", () => {
    const hash = simpleHash("");
    expect(typeof hash).toBe("string");
    // Empty string should produce "00000000" (padded)
    expect(hash).toBe("00000000");
  });

  it("should be at least 8 characters (padded)", () => {
    const hash = simpleHash("a");
    expect(hash.length).toBeGreaterThanOrEqual(8);
  });

  it("should handle unicode characters", () => {
    const hash = simpleHash("\u4E2D\u6587");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should be synchronous", () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      simpleHash(`test-${i}`);
    }
    const duration = performance.now() - start;
    // Should complete quickly since it's synchronous
    expect(duration).toBeLessThan(1000);
  });

  it("should produce deterministic output", () => {
    const inputs = ["a", "ab", "abc", "abcd", "abcde"];
    const hashes = inputs.map(simpleHash);

    // All hashes should be unique
    const uniqueHashes = new Set(hashes);
    expect(uniqueHashes.size).toBe(inputs.length);

    // Running again should produce same results
    const hashes2 = inputs.map(simpleHash);
    expect(hashes).toEqual(hashes2);
  });
});

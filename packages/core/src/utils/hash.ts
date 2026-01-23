/**
 * Compute SHA-256 hash of text.
 *
 * Uses the Web Crypto API when available.
 *
 * @param text - Text to hash
 * @returns Promise resolving to hex-encoded hash
 *
 * @example
 * ```typescript
 * const hash = await hashText("Hello, world!");
 * // "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3"
 * ```
 */
export async function hashText(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Simple fallback hash for environments without SubtleCrypto
  // Note: This is NOT cryptographically secure, just for deduplication
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Synchronous simple hash for non-cryptographic purposes.
 *
 * @param text - Text to hash
 * @returns Simple numeric hash as hex string
 */
export function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

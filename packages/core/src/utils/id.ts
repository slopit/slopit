/**
 * Generate a unique session ID.
 *
 * Uses crypto.randomUUID() when available (modern browsers and Node.js),
 * falls back to a manual implementation for older environments.
 *
 * @returns A UUID v4 string
 *
 * @example
 * ```typescript
 * const sessionId = generateSessionId();
 * // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * ```
 */
export function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a unique trial ID.
 *
 * @param prefix - Optional prefix for the ID
 * @returns A prefixed unique ID
 *
 * @example
 * ```typescript
 * const trialId = generateTrialId("survey");
 * // "survey-f47ac10b-58cc"
 * ```
 */
export function generateTrialId(prefix = "trial"): string {
  const uuid = generateSessionId();
  const shortId = uuid.split("-").slice(0, 2).join("-");
  return `${prefix}-${shortId}`;
}

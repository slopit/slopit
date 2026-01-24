import type { SlopitSession } from "../schemas/index.js";
import { SlopitSessionSchema } from "./zod-schemas.js";

export type { ZodBehavioralData, ZodSlopitSession, ZodSlopitTrial } from "./zod-schemas.js";
export {
  AnalysisFlagSchema,
  BehavioralDataSchema,
  CaptureFlagSchema,
  EnvironmentInfoSchema,
  FocusEventSchema,
  KeystrokeEventSchema,
  PasteEventSchema,
  PlatformInfoSchema,
  SlopitSessionSchema,
  SlopitTrialSchema,
} from "./zod-schemas.js";

/**
 * Validation result for a session.
 */
export interface ValidationResult {
  /**
   * Whether the session is valid.
   */
  success: boolean;

  /**
   * The validated session if successful.
   */
  data?: SlopitSession;

  /**
   * Validation errors if unsuccessful.
   */
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Validate a session object against the schema.
 *
 * @param data - Raw session data to validate
 * @returns Validation result with parsed data or errors
 *
 * @example
 * ```typescript
 * const result = validateSession(rawData);
 * if (result.success) {
 *   console.log(result.data.sessionId);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateSession(data: unknown): ValidationResult {
  const result = SlopitSessionSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as SlopitSession,
    };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

/**
 * Check if a value is a valid SlopitSession.
 *
 * @param data - Value to check
 * @returns True if valid SlopitSession
 *
 * @example
 * ```typescript
 * if (isValidSession(data)) {
 *   // TypeScript knows data is SlopitSession
 *   console.log(data.sessionId);
 * }
 * ```
 */
export function isValidSession(data: unknown): data is SlopitSession {
  return SlopitSessionSchema.safeParse(data).success;
}

/**
 * Challenge system for verifying human presence during behavioral capture.
 *
 * Challenges are interactive tasks that collect behavioral data while
 * verifying participant engagement. Researchers can implement custom
 * challenge renderers or use the provided implementations.
 *
 * @module
 */

/**
 * Available challenge types.
 *
 * - `audio_transcription`: User transcribes audio content
 * - `image_description`: User describes visual content
 * - `typing_test`: User types displayed text (captures natural rhythm)
 * - `memory_recall`: User answers questions about previously shown content
 * - `consistency_check`: User re-answers a previous question for comparison
 */
export type ChallengeType =
  | "audio_transcription"
  | "image_description"
  | "typing_test"
  | "memory_recall"
  | "consistency_check";

/**
 * Configuration for a challenge.
 */
export interface ChallengeConfig {
  /**
   * Type of challenge to present.
   */
  type: ChallengeType;

  /**
   * Prompt or instructions to display to the participant.
   */
  prompt: string;

  /**
   * Keywords expected in a valid response.
   * Used for automatic verification of memory recall and description challenges.
   */
  expectedKeywords?: string[];

  /**
   * Time limit for completing the challenge in milliseconds.
   * When exceeded, the challenge should auto-submit with current response.
   */
  timeLimit?: number;

  /**
   * Type-specific configuration data.
   *
   * For `typing_test`: `{ text: string }` - the text to type
   * For `audio_transcription`: `{ audioUrl: string }` - URL of audio file
   * For `image_description`: `{ imageUrl: string }` - URL of image
   * For `memory_recall`: `{ question: string, context?: string }`
   * For `consistency_check`: `{ originalQuestion: string, originalAnswer: string }`
   */
  data?: Record<string, unknown>;
}

/**
 * Result from a completed challenge.
 */
export interface ChallengeResult {
  /**
   * Whether the challenge was successfully completed.
   * For typing tests, this indicates accuracy threshold was met.
   * For keyword-based challenges, this indicates required keywords were present.
   */
  passed: boolean;

  /**
   * The participant's response text.
   */
  response: string;

  /**
   * Time taken to complete the challenge in milliseconds.
   */
  completionTime: number;

  /**
   * Behavioral data captured during the challenge.
   * Contains keystroke events, timing patterns, and other captured signals.
   */
  behavioralData?: unknown;
}

/**
 * Interface for challenge renderers.
 *
 * Researchers implement this interface to customize how challenges
 * are presented to participants. The library provides default
 * implementations for common challenge types.
 *
 * @example
 * ```typescript
 * class CustomChallenge implements ChallengeRenderer {
 *   private cleanup: (() => void) | null = null;
 *
 *   async render(
 *     config: ChallengeConfig,
 *     container: HTMLElement
 *   ): Promise<ChallengeResult> {
 *     // Create and append UI elements to container
 *     // Set up event listeners and capture
 *     // Return result when participant submits
 *   }
 *
 *   cleanup(): void {
 *     // Remove elements and event listeners
 *   }
 * }
 * ```
 */
export interface ChallengeRenderer {
  /**
   * Render the challenge UI and wait for completion.
   *
   * @param config - Challenge configuration
   * @param container - DOM element to render the challenge into
   * @returns Promise that resolves with the challenge result when submitted
   */
  render(config: ChallengeConfig, container: HTMLElement): Promise<ChallengeResult>;

  /**
   * Clean up the challenge UI and release resources.
   * Called after the challenge completes or is cancelled.
   */
  cleanup(): void;
}

/**
 * Typing test challenge that captures natural typing rhythm.
 *
 * Displays text for the participant to type, capturing keystroke
 * timing patterns that can be compared against their regular typing
 * behavior. This helps verify the same person is responding throughout
 * the study.
 *
 * @example
 * ```typescript
 * const challenge = new TypingTestChallenge();
 * const result = await challenge.render(
 *   {
 *     type: "typing_test",
 *     prompt: "Please type the following text exactly as shown:",
 *     data: { text: "The quick brown fox jumps over the lazy dog." },
 *     timeLimit: 60000,
 *   },
 *   document.getElementById("challenge-container")!
 * );
 * console.log(result.passed, result.behavioralData);
 * challenge.cleanup();
 * ```
 */
export class TypingTestChallenge implements ChallengeRenderer {
  private container: HTMLElement | null = null;
  private startTime = 0;
  private keystrokes: Array<{ key: string; time: number; event: "keydown" | "keyup" }> = [];
  private boundHandlers: {
    keydown: ((e: KeyboardEvent) => void) | null;
    keyup: ((e: KeyboardEvent) => void) | null;
  } = { keydown: null, keyup: null };

  /**
   * Render the typing test challenge.
   *
   * @param config - Challenge configuration with `data.text` containing the text to type
   * @param container - Container element for the challenge UI
   * @returns Promise resolving to challenge result with typing accuracy and keystroke data
   */
  async render(config: ChallengeConfig, container: HTMLElement): Promise<ChallengeResult> {
    this.container = container;
    this.keystrokes = [];

    const targetText = (config.data?.["text"] as string | undefined) ?? "";

    return new Promise((resolve) => {
      // Create challenge UI
      const wrapper = document.createElement("div");
      wrapper.className = "slopit-typing-challenge";

      const promptEl = document.createElement("p");
      promptEl.className = "slopit-challenge-prompt";
      promptEl.textContent = config.prompt;
      wrapper.appendChild(promptEl);

      const targetEl = document.createElement("div");
      targetEl.className = "slopit-typing-target";
      targetEl.textContent = targetText;
      wrapper.appendChild(targetEl);

      const inputEl = document.createElement("textarea");
      inputEl.className = "slopit-typing-input";
      inputEl.placeholder = "Type the text above...";
      inputEl.rows = 3;
      wrapper.appendChild(inputEl);

      const submitBtn = document.createElement("button");
      submitBtn.className = "slopit-challenge-submit";
      submitBtn.textContent = "Submit";
      submitBtn.type = "button";
      wrapper.appendChild(submitBtn);

      container.appendChild(wrapper);

      // Start timing
      this.startTime = performance.now();

      // Set up keystroke capture
      this.boundHandlers.keydown = (e: KeyboardEvent) => {
        this.keystrokes.push({
          key: e.key,
          time: performance.now() - this.startTime,
          event: "keydown",
        });
      };

      this.boundHandlers.keyup = (e: KeyboardEvent) => {
        this.keystrokes.push({
          key: e.key,
          time: performance.now() - this.startTime,
          event: "keyup",
        });
      };

      inputEl.addEventListener("keydown", this.boundHandlers.keydown);
      inputEl.addEventListener("keyup", this.boundHandlers.keyup);

      // Handle submission
      const submit = (): void => {
        const completionTime = performance.now() - this.startTime;
        const response = inputEl.value;

        // Calculate accuracy using Levenshtein distance
        const accuracy = this.calculateAccuracy(targetText, response);
        const passed = accuracy >= 0.9; // 90% accuracy threshold

        resolve({
          passed,
          response,
          completionTime,
          behavioralData: {
            keystrokes: [...this.keystrokes],
            targetText,
            accuracy,
          },
        });
      };

      submitBtn.addEventListener("click", submit);

      // Handle time limit
      if (config.timeLimit !== undefined) {
        setTimeout(() => {
          submit();
        }, config.timeLimit);
      }

      // Focus the input
      inputEl.focus();
    });
  }

  /**
   * Clean up challenge UI and event listeners.
   */
  cleanup(): void {
    if (this.container) {
      const wrapper = this.container.querySelector(".slopit-typing-challenge");
      if (wrapper) {
        const input = wrapper.querySelector(".slopit-typing-input");
        if (input && this.boundHandlers.keydown) {
          input.removeEventListener("keydown", this.boundHandlers.keydown as EventListener);
        }
        if (input && this.boundHandlers.keyup) {
          input.removeEventListener("keyup", this.boundHandlers.keyup as EventListener);
        }
        wrapper.remove();
      }
      this.container = null;
    }
    this.boundHandlers = { keydown: null, keyup: null };
    this.keystrokes = [];
  }

  /**
   * Calculate typing accuracy as a ratio (0-1).
   * Uses a simple character-by-character comparison with length normalization.
   */
  private calculateAccuracy(target: string, actual: string): number {
    if (target.length === 0) {
      return actual.length === 0 ? 1 : 0;
    }

    const maxLen = Math.max(target.length, actual.length);
    let matches = 0;

    for (let i = 0; i < Math.min(target.length, actual.length); i++) {
      if (target[i] === actual[i]) {
        matches++;
      }
    }

    return matches / maxLen;
  }
}

/**
 * Memory recall challenge that verifies participant engagement.
 *
 * Presents a question about previously shown content and checks
 * if the response contains expected keywords. Captures typing
 * behavior during the response.
 *
 * @example
 * ```typescript
 * const challenge = new MemoryRecallChallenge();
 * const result = await challenge.render(
 *   {
 *     type: "memory_recall",
 *     prompt: "What color was the car in the image you saw earlier?",
 *     expectedKeywords: ["red", "sedan"],
 *     timeLimit: 30000,
 *   },
 *   document.getElementById("challenge-container")!
 * );
 * ```
 */
export class MemoryRecallChallenge implements ChallengeRenderer {
  private container: HTMLElement | null = null;
  private startTime = 0;
  private keystrokes: Array<{ key: string; time: number; event: "keydown" | "keyup" }> = [];
  private boundHandlers: {
    keydown: ((e: KeyboardEvent) => void) | null;
    keyup: ((e: KeyboardEvent) => void) | null;
  } = { keydown: null, keyup: null };

  /**
   * Render the memory recall challenge.
   *
   * @param config - Challenge configuration with optional `expectedKeywords`
   * @param container - Container element for the challenge UI
   * @returns Promise resolving to challenge result with keyword matching status
   */
  async render(config: ChallengeConfig, container: HTMLElement): Promise<ChallengeResult> {
    this.container = container;
    this.keystrokes = [];

    return new Promise((resolve) => {
      // Create challenge UI
      const wrapper = document.createElement("div");
      wrapper.className = "slopit-memory-challenge";

      const promptEl = document.createElement("p");
      promptEl.className = "slopit-challenge-prompt";
      promptEl.textContent = config.prompt;
      wrapper.appendChild(promptEl);

      const inputEl = document.createElement("textarea");
      inputEl.className = "slopit-memory-input";
      inputEl.placeholder = "Type your answer...";
      inputEl.rows = 3;
      wrapper.appendChild(inputEl);

      const submitBtn = document.createElement("button");
      submitBtn.className = "slopit-challenge-submit";
      submitBtn.textContent = "Submit";
      submitBtn.type = "button";
      wrapper.appendChild(submitBtn);

      container.appendChild(wrapper);

      // Start timing
      this.startTime = performance.now();

      // Set up keystroke capture
      this.boundHandlers.keydown = (e: KeyboardEvent) => {
        this.keystrokes.push({
          key: e.key,
          time: performance.now() - this.startTime,
          event: "keydown",
        });
      };

      this.boundHandlers.keyup = (e: KeyboardEvent) => {
        this.keystrokes.push({
          key: e.key,
          time: performance.now() - this.startTime,
          event: "keyup",
        });
      };

      inputEl.addEventListener("keydown", this.boundHandlers.keydown);
      inputEl.addEventListener("keyup", this.boundHandlers.keyup);

      // Handle submission
      const submit = (): void => {
        const completionTime = performance.now() - this.startTime;
        const response = inputEl.value;

        // Check for expected keywords (case-insensitive)
        const passed = this.checkKeywords(response, config.expectedKeywords ?? []);

        resolve({
          passed,
          response,
          completionTime,
          behavioralData: {
            keystrokes: [...this.keystrokes],
            expectedKeywords: config.expectedKeywords,
            matchedKeywords: this.getMatchedKeywords(response, config.expectedKeywords ?? []),
          },
        });
      };

      submitBtn.addEventListener("click", submit);

      // Handle time limit
      if (config.timeLimit !== undefined) {
        setTimeout(() => {
          submit();
        }, config.timeLimit);
      }

      // Focus the input
      inputEl.focus();
    });
  }

  /**
   * Clean up challenge UI and event listeners.
   */
  cleanup(): void {
    if (this.container) {
      const wrapper = this.container.querySelector(".slopit-memory-challenge");
      if (wrapper) {
        const input = wrapper.querySelector(".slopit-memory-input");
        if (input && this.boundHandlers.keydown) {
          input.removeEventListener("keydown", this.boundHandlers.keydown as EventListener);
        }
        if (input && this.boundHandlers.keyup) {
          input.removeEventListener("keyup", this.boundHandlers.keyup as EventListener);
        }
        wrapper.remove();
      }
      this.container = null;
    }
    this.boundHandlers = { keydown: null, keyup: null };
    this.keystrokes = [];
  }

  /**
   * Check if response contains all expected keywords.
   */
  private checkKeywords(response: string, keywords: string[]): boolean {
    if (keywords.length === 0) {
      return true; // No keywords required
    }

    const lowerResponse = response.toLowerCase();
    return keywords.every((keyword) => lowerResponse.includes(keyword.toLowerCase()));
  }

  /**
   * Get list of keywords that were matched in the response.
   */
  private getMatchedKeywords(response: string, keywords: string[]): string[] {
    const lowerResponse = response.toLowerCase();
    return keywords.filter((keyword) => lowerResponse.includes(keyword.toLowerCase()));
  }
}

/**
 * Create a challenge renderer for the specified type.
 *
 * Returns a built-in renderer for supported types (typing_test, memory_recall),
 * or null for types that require custom implementation (audio_transcription,
 * image_description, consistency_check).
 *
 * @param type - The challenge type
 * @returns A challenge renderer instance, or null if type requires custom implementation
 *
 * @example
 * ```typescript
 * const challenge = createChallenge("typing_test");
 * if (challenge) {
 *   const result = await challenge.render(config, container);
 *   challenge.cleanup();
 * }
 * ```
 */
export function createChallenge(type: ChallengeType): ChallengeRenderer | null {
  switch (type) {
    case "typing_test":
      return new TypingTestChallenge();
    case "memory_recall":
      return new MemoryRecallChallenge();
    case "audio_transcription":
    case "image_description":
    case "consistency_check":
      // These require custom implementation by the researcher
      return null;
    default: {
      // Exhaustive check
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

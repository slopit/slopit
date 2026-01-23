import { completeSession, createSessionMetadata, createTextResponse } from "@slopit/adapter-shared";
import type { SlopitSession, SlopitTrial } from "@slopit/core";
import type { JsPsych } from "jspsych";

/**
 * Options for exporting jsPsych data to SlopitSession format.
 */
export interface ExportOptions {
  /**
   * Participant ID (e.g., from Prolific).
   */
  participantId?: string;

  /**
   * Study ID.
   */
  studyId?: string;

  /**
   * Filter function to select which trials to include.
   * @param trial - The jsPsych trial data
   * @returns true to include, false to exclude
   */
  trialFilter?: (trial: Record<string, unknown>) => boolean;

  /**
   * Whether to include raw platform data for each trial.
   * @default true
   */
  includePlatformData?: boolean;
}

/**
 * Export jsPsych data to SlopitSession format.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Export options
 * @returns SlopitSession object
 *
 * @example
 * ```javascript
 * const session = exportToSlopit(jsPsych, {
 *   participantId: jsPsych.data.urlVariables().PROLIFIC_PID,
 *   studyId: "my-study-001",
 * });
 *
 * // Send to server or save
 * console.log(JSON.stringify(session));
 * ```
 */
export function exportToSlopit(jsPsych: JsPsych, options: ExportOptions = {}): SlopitSession {
  const allTrials = jsPsych.data.get().values() as Record<string, unknown>[];
  const filteredTrials = options.trialFilter ? allTrials.filter(options.trialFilter) : allTrials;

  const sessionStartTime = jsPsych.getStartTime()?.getTime() ?? Date.now();

  const trials: SlopitTrial[] = filteredTrials.map((trial, index) => {
    return convertTrial(trial, index, options.includePlatformData ?? true);
  });

  // Use shared utilities to create session metadata
  const sessionBase = createSessionMetadata(
    {
      name: "jspsych",
      version: jsPsych.version(),
      adapterVersion: "0.1.0",
    },
    {
      ...(options.participantId !== undefined ? { participantId: options.participantId } : {}),
      ...(options.studyId !== undefined ? { studyId: options.studyId } : {}),
      startTime: sessionStartTime,
    },
  );

  // Complete the session with trials and end time
  return completeSession(sessionBase, trials);
}

function convertTrial(
  trial: Record<string, unknown>,
  index: number,
  includePlatformData: boolean,
): SlopitTrial {
  const timeElapsed = Number(trial["time_elapsed"] ?? 0);
  const rt = Number(trial["rt"] ?? 0);

  const converted: SlopitTrial = {
    trialId: String(trial["trial_id"] ?? `trial-${index}`),
    trialIndex: index,
    trialType: String(trial["trial_type"] ?? "unknown"),
    startTime: timeElapsed - rt,
    endTime: timeElapsed,
    rt: rt,
  };

  // Extract response if present
  if (trial["response"] !== undefined) {
    const response = trial["response"];
    if (typeof response === "string") {
      converted.response = createTextResponse(response);
    } else {
      converted.response = {
        type: "other",
        value: response,
      };
    }
  }

  // Extract slopit behavioral data if present
  if (trial["slopit"] && typeof trial["slopit"] === "object") {
    const sd = trial["slopit"] as Record<string, unknown>;
    if (sd["behavioral"]) {
      converted.behavioral = sd["behavioral"] as NonNullable<SlopitTrial["behavioral"]>;
    }
    if (sd["flags"] && Array.isArray(sd["flags"])) {
      converted.captureFlags = sd["flags"] as NonNullable<SlopitTrial["captureFlags"]>;
    }
  }

  // Include raw platform data if requested
  if (includePlatformData) {
    const platformData = { ...trial };
    delete platformData["slopit"];
    converted.platformData = platformData;
  }

  return converted;
}

/**
 * Get slopit data from a specific trial.
 *
 * @param jsPsych - The jsPsych instance
 * @param trialIndex - The trial index to get data from
 * @returns The slopit data or undefined if not found
 */
export function getSlopitDataFromTrial(
  jsPsych: JsPsych,
  trialIndex: number,
): { behavioral: unknown; flags: unknown[] } | undefined {
  const trial = jsPsych.data.get().filter({ trial_index: trialIndex }).values()[0] as
    | Record<string, unknown>
    | undefined;

  if (!trial || !trial["slopit"]) {
    return undefined;
  }

  return trial["slopit"] as { behavioral: unknown; flags: unknown[] };
}

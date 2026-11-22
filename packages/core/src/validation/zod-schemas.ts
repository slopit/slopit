import { z } from "zod";

// Behavioral schemas
export const ModifierStateSchema = z.object({
  shift: z.boolean(),
  ctrl: z.boolean(),
  alt: z.boolean(),
  meta: z.boolean(),
});

export const KeystrokeEventSchema = z.object({
  time: z.number(),
  key: z.string(),
  code: z.string(),
  event: z.enum(["keydown", "keyup"]),
  textLength: z.number().optional(),
  modifiers: ModifierStateSchema.optional(),
});

export const FocusEventSchema = z.object({
  time: z.number(),
  event: z.enum(["focus", "blur", "visibilitychange"]),
  visibility: z.enum(["visible", "hidden"]).optional(),
  blurDuration: z.number().optional(),
});

export const PasteEventSchema = z.object({
  time: z.number(),
  textLength: z.number(),
  textPreview: z.string().optional(),
  textHash: z.string().optional(),
  precedingKeystrokes: z.number(),
  blocked: z.boolean(),
});

export const MouseEventSchema = z.object({
  time: z.number(),
  event: z.enum(["mousemove", "mousedown", "mouseup", "click"]),
  x: z.number(),
  y: z.number(),
});

export const KeystrokeMetricsSchema = z.object({
  totalKeystrokes: z.number(),
  printableKeystrokes: z.number(),
  deletions: z.number(),
  meanIKI: z.number(),
  stdIKI: z.number(),
  medianIKI: z.number(),
  pauseCount: z.number(),
  productProcessRatio: z.number(),
});

export const FocusMetricsSchema = z.object({
  blurCount: z.number(),
  totalBlurDuration: z.number(),
  hiddenCount: z.number(),
  totalHiddenDuration: z.number(),
});

export const TimingMetricsSchema = z.object({
  firstKeystrokeLatency: z.number().optional(),
  totalResponseTime: z.number(),
  charactersPerMinute: z.number().optional(),
});

export const BehavioralMetricsSchema = z.object({
  keystroke: KeystrokeMetricsSchema.optional(),
  focus: FocusMetricsSchema.optional(),
  timing: TimingMetricsSchema.optional(),
});

export const ResponseControlEventSchema = z
  .object({
    time: z.number().nonnegative(),
    event: z.enum([
      "keydown",
      "keyup",
      "focusin",
      "focusout",
      "input",
      "change",
      "click",
      "submit",
      "paste",
      "copy",
      "cut",
      "pointerdown",
      "pointerup",
      "pointermove",
    ]),
    control: z.enum(["select", "button", "text", "radio", "checkbox", "range"]),
    trusted: z.boolean(),
    key: z
      .enum([
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "Backspace",
        "Delete",
        "End",
        "Enter",
        "Escape",
        "Home",
        "PageDown",
        "PageUp",
        "Tab",
        "redacted",
      ])
      .optional(),
    x: z.number().nonnegative().optional(),
    y: z.number().nonnegative().optional(),
  })
  .strict();

export const ResponseControlsDataSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    events: z.array(ResponseControlEventSchema),
  })
  .strict();

export const BehavioralDataSchema = z.object({
  responseControls: ResponseControlsDataSchema.optional(),
  keystrokes: z.array(KeystrokeEventSchema).optional(),
  focus: z.array(FocusEventSchema).optional(),
  paste: z.array(PasteEventSchema).optional(),
  mouse: z.array(MouseEventSchema).optional(),
  metrics: BehavioralMetricsSchema.optional(),
});

// Flag schemas
export const SeveritySchema = z.enum(["info", "low", "medium", "high"]);

export const CaptureFlagSchema = z.object({
  type: z.string(),
  severity: SeveritySchema,
  message: z.string(),
  timestamp: z.number(),
  details: z.record(z.unknown()).optional(),
});

export const AnalysisFlagSchema = z.object({
  type: z.string(),
  analyzer: z.string(),
  severity: SeveritySchema,
  message: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  evidence: z.record(z.unknown()).optional(),
  trialIds: z.array(z.string()).optional(),
});

// Session schemas
export const PlatformInfoSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  adapterVersion: z.string().optional(),
});

export const EnvironmentInfoSchema = z.object({
  userAgent: z.string(),
  screenResolution: z.tuple([z.number(), z.number()]),
  viewportSize: z.tuple([z.number(), z.number()]),
  devicePixelRatio: z.number(),
  timezone: z.string(),
  language: z.string(),
  touchCapable: z.boolean(),
  connectionType: z.string().optional(),
});

export const SessionTimingSchema = z.object({
  startTime: z.number(),
  endTime: z.number().optional(),
  duration: z.number().optional(),
});

export const StimulusInfoSchema = z.object({
  type: z.enum(["text", "image", "audio", "video", "html", "other"]),
  content: z.string().optional(),
  contentHash: z.string().optional(),
  parameters: z.record(z.unknown()).optional(),
});

export const SpanAnnotationSchema = z.object({
  start: z.number(),
  end: z.number(),
  label: z.string(),
  text: z.string(),
});

export const ResponseInfoSchema = z.object({
  type: z.enum(["text", "choice", "multi-choice", "slider", "likert", "annotation", "other"]),
  value: z.unknown(),
  characterCount: z.number().optional(),
  wordCount: z.number().optional(),
});

export const SlopitTrialSchema = z.object({
  trialId: z.string(),
  trialIndex: z.number(),
  trialType: z.string().optional(),
  startTime: z.number(),
  endTime: z.number(),
  rt: z.number().optional(),
  stimulus: StimulusInfoSchema.optional(),
  response: ResponseInfoSchema.optional(),
  behavioral: BehavioralDataSchema.optional(),
  platformData: z.record(z.unknown()).optional(),
  captureFlags: z.array(CaptureFlagSchema).optional(),
});

export const SessionFocusEventSchema = z.object({
  timestamp: z.number(),
  event: z.enum(["focus", "blur", "visibilitychange"]),
  visibility: z.enum(["visible", "hidden"]).optional(),
});

export const ErrorEventSchema = z.object({
  timestamp: z.number(),
  message: z.string(),
  stack: z.string().optional(),
  source: z.string().optional(),
});

export const CustomEventSchema = z.object({
  timestamp: z.number(),
  type: z.string(),
  data: z.record(z.unknown()).optional(),
});

export const GlobalEventsSchema = z.object({
  focus: z.array(SessionFocusEventSchema),
  errors: z.array(ErrorEventSchema),
  custom: z.array(CustomEventSchema).optional(),
});

export const SlopitSessionSchema = z.object({
  schemaVersion: z.literal("1.0"),
  sessionId: z.string(),
  participantId: z.string().optional(),
  studyId: z.string().optional(),
  platform: PlatformInfoSchema,
  environment: EnvironmentInfoSchema,
  timing: SessionTimingSchema,
  trials: z.array(SlopitTrialSchema),
  globalEvents: GlobalEventsSchema,
  metadata: z.record(z.unknown()).optional(),
});

// Type inference helpers
export type ZodSlopitSession = z.infer<typeof SlopitSessionSchema>;
export type ZodSlopitTrial = z.infer<typeof SlopitTrialSchema>;
export type ZodBehavioralData = z.infer<typeof BehavioralDataSchema>;

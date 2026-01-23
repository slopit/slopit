import CodeBlock from "@theme/CodeBlock";
import type { ReactNode } from "react";
import { useState } from "react";

const typescriptCode = `import { initJsPsych } from "jspsych";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { SlopitExtension } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
});

const trial = {
  type: jsPsychSurveyText,
  questions: [{ prompt: "Describe your morning:" }],
  extensions: [{
    type: SlopitExtension,
    params: { targetSelector: "textarea" },
  }],
};`;

const pythonCode = `from slopit import load_sessions
from slopit.pipeline import AnalysisPipeline
from slopit.behavioral import (
    KeystrokeAnalyzer,
    FocusAnalyzer,
    PasteAnalyzer,
)

# Load session data
sessions = load_sessions("data/")

# Create and run analysis pipeline
pipeline = AnalysisPipeline([
    KeystrokeAnalyzer(),
    FocusAnalyzer(),
    PasteAnalyzer(),
])
result = pipeline.analyze(sessions)`;

type Tab = "typescript" | "python";

export default function CodePreview(): ReactNode {
  const [activeTab, setActiveTab] = useState<Tab>("typescript");

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          className={`code-tab ${activeTab === "typescript" ? "active" : ""}`}
          onClick={() => setActiveTab("typescript")}
        >
          TypeScript
        </button>
        <button
          type="button"
          className={`code-tab ${activeTab === "python" ? "active" : ""}`}
          onClick={() => setActiveTab("python")}
        >
          Python
        </button>
      </div>
      <div className="[&_pre]:!rounded-none [&_pre]:!m-0 [&_pre]:!border-0">
        {activeTab === "typescript" ? (
          <CodeBlock language="typescript">{typescriptCode}</CodeBlock>
        ) : (
          <CodeBlock language="python">{pythonCode}</CodeBlock>
        )}
      </div>
    </div>
  );
}

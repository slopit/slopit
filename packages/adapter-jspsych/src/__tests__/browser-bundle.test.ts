import { readFileSync } from "node:fs";
import { BehavioralDataSchema } from "@slopit/core";
import { describe, expect, it } from "vitest";
import type { SlopitExtension } from "../extension.js";

describe("published classic script", () => {
  it("captures only redacted response events after consent and detaches on withdrawal", () => {
    const source = readFileSync("dist/browser.global.js", "utf8");
    const exports = new Function("window", source.concat("\nreturn SlopitJsPsych;"))(window) as {
      SlopitExtension: typeof SlopitExtension;
      responseControlsSchemaVersion: string;
    };
    expect(exports.responseControlsSchemaVersion).toBe("1.0");
    const display = document.createElement("div");
    display.innerHTML =
      '<input class="answer" type="text"><select class="answer"><option>hidden answer</option></select><input id="outside"><button class="answer">Continue</button>';
    const input = display.querySelector("input");
    const outside = display.querySelector("#outside");
    const select = display.querySelector("select");
    const button = display.querySelector("button");
    const extension = new exports.SlopitExtension({ getDisplayElement: () => display } as never);
    let granted = false;
    const lifetime = new AbortController();
    const params = {
      responseControls: {
        targetSelector: ".answer",
        hasConsent: () => granted,
        signal: lifetime.signal,
      },
    };
    const printable = () =>
      new KeyboardEvent("keydown", { key: "secret", code: "KeyS", bubbles: true });
    extension.on_start(params);
    extension.on_load(params);
    input?.dispatchEvent(printable());
    expect(extension.on_finish()).toEqual({});

    granted = true;
    extension.on_start(params);
    extension.on_load(params);
    input?.dispatchEvent(printable());
    input?.dispatchEvent(new Event("paste", { bubbles: true }));
    outside?.dispatchEvent(printable());
    select?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    select?.dispatchEvent(new Event("change", { bubbles: true }));
    button?.click();
    const result = extension.on_finish();
    const behavior = BehavioralDataSchema.parse(result.slopit?.behavioral);
    expect(
      behavior.responseControls?.events.map(({ event, control, trusted, key }) => [
        event,
        control,
        trusted,
        key,
      ]),
    ).toEqual([
      ["keydown", "text", false, "redacted"],
      ["paste", "text", false, undefined],
      ["keydown", "select", false, "ArrowDown"],
      ["change", "select", false, undefined],
      ["click", "button", false, undefined],
    ]);
    const wire = JSON.stringify(result);
    expect(wire).not.toMatch(/secret|KeyS|hidden answer|textPreview|textHash/);

    extension.on_start(params);
    extension.on_load(params);
    lifetime.abort();
    input?.dispatchEvent(printable());
    expect(extension.on_finish()).toEqual({});
  });
});

import { describe, expect, it } from "vitest";
import {
  PAPERCLIP_HERMES_DEFAULT_PROMPT_TEMPLATE,
  applyPaperclipHermesPromptDefaults,
} from "../adapters/hermes-local.js";

describe("applyPaperclipHermesPromptDefaults", () => {
  it("injects the Paperclip-safe default prompt template when none is configured", () => {
    const result = applyPaperclipHermesPromptDefaults({ model: "gpt-5.4" });

    expect(result).toMatchObject({
      model: "gpt-5.4",
      promptTemplate: PAPERCLIP_HERMES_DEFAULT_PROMPT_TEMPLATE,
    });
    expect(String(result.promptTemplate)).toContain("python3 /tmp/paperclip_api.py");
    expect(String(result.promptTemplate)).toContain("urllib.request");
    expect(String(result.promptTemplate)).toContain("todo,in_progress,blocked");
    expect(String(result.promptTemplate)).toContain("Prefer an existing `in_progress` issue first");
    expect(String(result.promptTemplate)).not.toContain("curl -s");
    expect(String(result.promptTemplate)).not.toContain("python3 -m json.tool");
  });

  it("preserves an explicit custom prompt template", () => {
    const result = applyPaperclipHermesPromptDefaults({
      model: "gpt-5.4",
      promptTemplate: "custom-template",
    });

    expect(result).toEqual({
      model: "gpt-5.4",
      promptTemplate: "custom-template",
    });
  });
});

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("radix-ui", () => {
  const React = require("react");
  const passthrough = (tag: string) => ({ children, className, asChild, ...props }: any) =>
    React.createElement(tag, { className, ...props }, children);

  return {
    Select: {
      Root: passthrough("div"),
      Group: passthrough("div"),
      Value: passthrough("span"),
      Trigger: passthrough("button"),
      Portal: passthrough("div"),
      Content: passthrough("div"),
      Viewport: passthrough("div"),
      Label: passthrough("div"),
      Item: passthrough("div"),
      ItemIndicator: passthrough("span"),
      ItemText: passthrough("span"),
      Separator: passthrough("div"),
      ScrollUpButton: passthrough("div"),
      ScrollDownButton: passthrough("div"),
      Icon: passthrough("span"),
    },
  };
});

import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

describe("SelectTrigger visual system", () => {
  it("uses flat industrial chrome instead of rounded shadowed SaaS input styling", () => {
    const html = renderToStaticMarkup(
      <SelectTrigger>
        <SelectValue>Theme</SelectValue>
      </SelectTrigger>,
    );

    expect(html).toContain("rounded-none");
    expect(html).not.toContain("rounded-md");
    expect(html).not.toContain("shadow-xs");
    expect(html).not.toContain("box-shadow");
  });

  it("keeps dropdown content and options hard-edged without soft menu rounding or shadows", () => {
    const html = renderToStaticMarkup(
      <SelectContent>
        <SelectItem value="in_progress">In progress</SelectItem>
      </SelectContent>,
    );

    expect(html).toContain("rounded-none border border-[var(--border-visible)]");
    expect(html).toContain("font-mono text-[11px] uppercase tracking-[0.16em]");
    expect(html).not.toContain("rounded-md");
    expect(html).not.toContain("rounded-sm");
    expect(html).not.toContain("shadow-md");
  });
});

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("radix-ui", () => {
  const React = require("react");
  const passthrough =
    (tag: string) =>
    ({ children, className, asChild, align, sideOffset, disablePortal, ...props }: any) =>
      React.createElement(tag, { className, ...props }, children);

  return {
    Popover: {
      Root: passthrough("div"),
      Trigger: passthrough("button"),
      Portal: passthrough("div"),
      Content: passthrough("div"),
      Anchor: passthrough("div"),
    },
  };
});

import { PopoverContent } from "./popover";

describe("Popover visual system", () => {
  it("keeps popover surfaces flat and hard-edged instead of rounded shadowed SaaS chrome", () => {
    const html = renderToStaticMarkup(
      <PopoverContent disablePortal className="space-y-2">
        <p className="text-sm font-medium">Agent heartbeat</p>
        <p className="text-xs text-muted-foreground">Last run succeeded 24s ago. Next timer run in 9m.</p>
      </PopoverContent>,
    );

    expect(html).toContain("rounded-none border border-[var(--border-visible)]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--card)_96%,var(--background))]");
    expect(html).not.toContain("rounded-md");
    expect(html).not.toContain("shadow-md");
  });
});

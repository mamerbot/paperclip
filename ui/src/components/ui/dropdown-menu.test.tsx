// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("radix-ui", () => {
  const React = require("react");
  const passthrough =
    (tag: string) =>
    ({ children, className, sideOffset, ...props }: any) =>
      React.createElement(tag, { className, ...props }, children);

  return {
    DropdownMenu: {
      Root: passthrough("div"),
      Portal: passthrough("div"),
      Trigger: passthrough("button"),
      Content: passthrough("div"),
      Group: passthrough("div"),
      Item: passthrough("div"),
      CheckboxItem: passthrough("div"),
      RadioGroup: passthrough("div"),
      RadioItem: passthrough("div"),
      Label: passthrough("div"),
      Separator: passthrough("div"),
      Sub: passthrough("div"),
      SubTrigger: passthrough("div"),
      SubContent: passthrough("div"),
      ItemIndicator: passthrough("span"),
    },
  };
});

import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./dropdown-menu";

describe("DropdownMenu visual system", () => {
  it("keeps dropdown menu surfaces flat and hard-edged instead of rounded shadowed SaaS chrome", () => {
    const html = renderToStaticMarkup(
      <DropdownMenuContent>
        <DropdownMenuItem>Mark as done</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Watch issue</DropdownMenuCheckboxItem>
        <DropdownMenuSubTrigger>More actions</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Delete issue</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuContent>,
    );

    expect(html).toContain("rounded-none border border-[var(--border-visible)]");
    expect(html).toContain("font-mono text-[11px] uppercase tracking-[0.16em]");
    expect(html).toContain("border-b border-[color-mix(in_srgb,var(--border-visible)_52%,transparent)]");
    expect(html).not.toContain("rounded-md");
    expect(html).not.toContain("rounded-sm");
    expect(html).not.toContain("shadow-md");
    expect(html).not.toContain("shadow-lg");
  });
});

// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Command, CommandInput, CommandList, CommandItem } from "./command";

describe("Command visual system", () => {
  it("renders command surfaces as flat industrial panels without gradient or shadow chrome", () => {
    const html = renderToStaticMarkup(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem value="theme">Theme</CommandItem>
        </CommandList>
      </Command>,
    );

    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("shadow-");
    expect(html).not.toContain("rounded-xs");
    expect(html).toContain("border border-[var(--border-visible)]");
    expect(html).toContain("before:content-[&#x27;command_interface&#x27;]");
  });
});

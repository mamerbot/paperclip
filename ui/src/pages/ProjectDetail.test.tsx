// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { ColorPicker, ProjectPauseNotice } from "./ProjectDetail";

describe("ProjectDetail visual system", () => {
  it("renders the color picker popover as flat industrial chrome without shadowed wrappers", () => {
    const html = renderToStaticMarkup(
      <ColorPicker currentColor="#FF4719" onSelect={() => {}} defaultOpen />,
    );

    expect(html).toContain("rounded-none border border-[var(--border-visible)]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--popover)_94%,var(--background))]");
    expect(html).not.toContain("shadow-lg");
    expect(html).not.toContain("transition-[box-shadow]");
    expect(html).not.toContain("transition-[transform,box-shadow]");
  });

  it("renders the budget hard-stop notice as a hard-edged alert plate instead of a rounded pill", () => {
    const html = renderToStaticMarkup(<ProjectPauseNotice />);

    expect(html).toContain('data-project-pause-badge="true"');
    expect(html).toContain('data-project-pause-glyph="plate"');
    expect(html).toContain("Paused by budget hard stop");
    expect(html).toContain("rounded-none");
    expect(html).toContain("font-mono");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("h-2 w-2 rounded-full");
  });
});

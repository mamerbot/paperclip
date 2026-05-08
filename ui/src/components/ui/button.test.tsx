// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Button } from "./button";

describe("Button visual system", () => {
  it("keeps primary and outline button chrome flat without inset shadow styling", () => {
    const html = renderToStaticMarkup(
      <div>
        <Button>Ship</Button>
        <Button variant="outline">Inspect</Button>
      </div>,
    );

    expect(html).not.toContain("shadow-");
    expect(html).not.toContain("box-shadow");
    expect(html).not.toContain("shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--border-visible)_30%,transparent)]");
    expect(html).toContain("border-[var(--text-display)] bg-[var(--text-display)] text-[var(--background)]");
    expect(html).toContain("border-[var(--border-visible)] bg-[color-mix(in_srgb,var(--accent)_70%,transparent)]");
  });
});

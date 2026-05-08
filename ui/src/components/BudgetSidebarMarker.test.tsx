// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { BudgetSidebarMarker } from "./BudgetSidebarMarker";

describe("BudgetSidebarMarker visual system", () => {
  it("renders a hard-edged warning plate without circular badge or shadow chrome", () => {
    const html = renderToStaticMarkup(<BudgetSidebarMarker />);

    expect(html).toContain("border-[var(--status-danger-border)]");
    expect(html).toContain("bg-[var(--status-danger-bg)]");
    expect(html).toContain("text-[var(--status-danger-fg)]");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("shadow-");
  });
});

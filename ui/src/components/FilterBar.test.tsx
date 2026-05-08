// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={className} {...props}>{children}</span>
  ),
}));

import { FilterBar } from "./FilterBar";

describe("FilterBar visual system", () => {
  it("renders filter dismiss controls as hard-edged utility plates instead of rounded pill buttons", () => {
    const html = renderToStaticMarkup(
      <FilterBar
        filters={[
          { key: "status", label: "Status", value: "Active" },
          { key: "priority", label: "Priority", value: "High" },
        ]}
        onRemove={() => {}}
        onClear={() => {}}
      />,
    );

    expect(html).toContain('data-filter-dismiss="status"');
    expect(html).toContain('data-filter-dismiss="priority"');
    expect(html).toContain('data-filter-dismiss-glyph="plate"');
    expect(html).toContain("ml-1 border border-[var(--border-visible)] px-1 py-0.5 text-[var(--text-secondary)] transition-[color,background-color,border-color] hover:border-[var(--event-accent)] hover:bg-[color-mix(in_srgb,var(--accent)_76%,transparent)] hover:text-[var(--text-display)]");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("hover:bg-accent p-0.5");
  });
});

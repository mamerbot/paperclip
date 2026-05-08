// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

import { Bot } from "lucide-react";
import { MetricCard } from "./MetricCard";

describe("MetricCard visual system", () => {
  it("renders metric panels as hard-edged industrial plates instead of rounded cards", () => {
    const html = renderToStaticMarkup(
      <MetricCard icon={Bot} value={12} label="Active Agents" description="+3 this week" />,
    );

    expect(html).toContain("rounded-none");
    expect(html).not.toContain("rounded-lg");
    expect(html).toContain("border border-[var(--border-visible)]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--card)_92%,var(--background))]");
  });
});

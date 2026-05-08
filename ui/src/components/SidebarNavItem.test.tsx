// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LayoutDashboard } from "lucide-react";

vi.mock("@/lib/router", () => ({
  NavLink: ({ className, children }: { className?: ((state: { isActive: boolean }) => string) | string; children: React.ReactNode }) => {
    const resolvedClassName = typeof className === "function" ? className({ isActive: true }) : className;
    return <a className={resolvedClassName}>{children}</a>;
  },
}));

vi.mock("../context/SidebarContext", () => ({
  useSidebar: () => ({ isMobile: false, setSidebarOpen: () => {} }),
}));

import { SidebarNavItem } from "./SidebarNavItem";

describe("SidebarNavItem visual system", () => {
  it("renders the active shell state as flat industrial chrome without gradients, shadows, or circular alert dots", () => {
    const html = renderToStaticMarkup(
      <SidebarNavItem
        to="/dashboard"
        label="Dashboard"
        icon={LayoutDashboard}
        alert
        liveCount={2}
      />,
    );

    expect(html).toContain("bg-[color-mix(in_srgb,var(--foreground)_6%,var(--accent))]");
    expect(html).toContain("border border-[var(--status-danger-border)] bg-[var(--signal)]");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("shadow-");
    expect(html).not.toContain("rounded-full");
  });

  it("renders live state as a rectangular readout badge instead of a pulsing dot plus helper text", () => {
    const html = renderToStaticMarkup(
      <SidebarNavItem
        to="/dashboard"
        label="Dashboard"
        icon={LayoutDashboard}
        liveCount={2}
      />,
    );

    expect(html).toContain("2 live");
    expect(html).toContain('aria-label="2 live runs"');
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("relative flex h-2 w-2");
  });
});

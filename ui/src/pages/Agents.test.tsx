// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const useQueryMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: "/agents/all" }),
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1" }),
}));

vi.mock("../context/DialogContext", () => ({
  useDialog: () => ({ openNewAgent: () => {} }),
}));

vi.mock("../context/BreadcrumbContext", () => ({
  useBreadcrumbs: () => ({ setBreadcrumbs: () => {} }),
}));

vi.mock("../context/SidebarContext", () => ({
  useSidebar: () => ({ isMobile: true, setSidebarOpen: () => {} }),
}));

vi.mock("../components/StatusBadge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock("../components/PageTabBar", () => ({
  PageTabBar: () => <div>tabs</div>,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock("../components/EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock("../components/PageSkeleton", () => ({
  PageSkeleton: () => <div>Loading</div>,
}));

import { Agents } from "./Agents";

describe("Agents visual system", () => {
  it("renders live-run links as plated readouts instead of pulsing round dots", () => {
    useQueryMock
      .mockReturnValueOnce({
        data: [
          {
            id: "agent-1",
            name: "Jony",
            role: "engineering",
            title: "Lead Industrialist",
            status: "active",
            adapterType: "hermes_local",
            lastHeartbeatAt: new Date("2026-05-08T07:45:00Z").toISOString(),
          },
        ],
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: [
          {
            id: "org-ignored",
            name: "ignored",
            status: "active",
            role: "engineering",
            reports: [],
          },
        ],
      })
      .mockReturnValueOnce({
        data: [
          {
            id: "run-1",
            agentId: "agent-1",
            status: "running",
          },
        ],
      });

    const html = renderToStaticMarkup(<Agents />);

    expect(html).toContain('data-agent-live-badge="true"');
    expect(html).toContain('data-agent-live-glyph="plate"');
    expect(html).toContain("LIVE");
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("rounded-full bg-[var(--status-live-fg)]");
  });
});

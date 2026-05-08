// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: [] }),
}));

vi.mock("../context/DialogContext", () => ({
  useDialog: () => ({ openNewIssue: () => {} }),
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({
    selectedCompanyId: "company-1",
    selectedCompany: {
      id: "company-1",
      name: "Emtesseract",
      issuePrefix: "EMT",
    },
  }),
}));

vi.mock("../api/heartbeats", () => ({
  heartbeatsApi: { liveRunsForCompany: async () => [] },
}));

vi.mock("../hooks/useInboxBadge", () => ({
  useInboxBadge: () => ({ inbox: 0, failedRuns: 0 }),
}));

vi.mock("./SidebarSection", () => ({
  SidebarSection: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./SidebarNavItem", () => ({
  SidebarNavItem: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock("./SidebarProjects", () => ({ SidebarProjects: () => <div>Projects</div> }));
vi.mock("./SidebarAgents", () => ({ SidebarAgents: () => <div>Agents</div> }));
vi.mock("@/plugins/slots", () => ({ PluginSlotOutlet: () => null }));

import { Sidebar } from "./Sidebar";

describe("Sidebar visual system", () => {
  it("renders hard-edged shell backgrounds without gradient or shadow chrome", () => {
    const html = renderToStaticMarkup(<Sidebar />);

    expect(html).toContain("bg-[color-mix(in_srgb,var(--accent)_28%,var(--background))]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--foreground)_4%,var(--accent))]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--foreground)_9%,var(--background))]");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("shadow-");
  });
});

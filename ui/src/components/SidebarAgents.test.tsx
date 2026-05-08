// @vitest-environment node

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

let queryCall = 0;

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => {
    queryCall += 1;
    if (queryCall === 1) {
      return {
        data: [
          {
            id: "agent-1",
            name: "Jony",
            status: "active",
            reportsTo: null,
            icon: "bot",
            pauseReason: null,
          },
        ],
      };
    }
    return {
      data: [
        {
          id: "run-1",
          agentId: "agent-1",
        },
      ],
    };
  },
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1" }),
}));

vi.mock("../context/DialogContext", () => ({
  useDialog: () => ({ openNewAgent: () => {} }),
}));

vi.mock("../context/SidebarContext", () => ({
  useSidebar: () => ({ isMobile: false, setSidebarOpen: () => {} }),
}));

vi.mock("@/lib/router", () => ({
  NavLink: ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <a className={className}>{children}</a>
  ),
  useLocation: () => ({ pathname: "/EMT/dashboard" }),
}));

vi.mock("./AgentIconPicker", () => ({
  AgentIcon: ({ className }: { className?: string }) => <span className={className}>icon</span>,
}));

beforeAll(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    configurable: true,
  });
});

beforeEach(() => {
  queryCall = 0;
});

import { SidebarAgents } from "./SidebarAgents";

describe("SidebarAgents visual system", () => {
  it("renders live agent state as a rectangular readout instead of a pulsing round dot", () => {
    const html = renderToStaticMarkup(<SidebarAgents />);

    expect(html).toContain('data-sidebar-agent-live-badge="true"');
    expect(html).toContain('data-sidebar-agent-live-glyph="plate"');
    expect(html).toContain("1 live");
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("relative flex h-2 w-2");
  });
});

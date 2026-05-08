// @vitest-environment jsdom

import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";

const locationState = { pathname: "/EMT/issues", search: "", hash: "" };

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: { devServer: { enabled: false } }, isLoading: false, error: null }),
}));

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
  Outlet: () => <div data-testid="outlet">Outlet</div>,
  useLocation: () => locationState,
  useNavigate: () => vi.fn(),
  useParams: () => ({ companyPrefix: "EMT" }),
}));

vi.mock("./CompanyRail", () => ({ CompanyRail: () => <div data-testid="company-rail" /> }));
vi.mock("./Sidebar", () => ({ Sidebar: () => <div data-testid="sidebar" /> }));
vi.mock("./InstanceSidebar", () => ({ InstanceSidebar: () => <div data-testid="instance-sidebar" /> }));
vi.mock("./BreadcrumbBar", () => ({ BreadcrumbBar: () => <div data-testid="breadcrumb-bar" /> }));
vi.mock("./PropertiesPanel", () => ({ PropertiesPanel: () => <div data-testid="properties-panel" /> }));
vi.mock("./CommandPalette", () => ({ CommandPalette: () => <div data-testid="command-palette" /> }));
vi.mock("./NewIssueDialog", () => ({ NewIssueDialog: () => null }));
vi.mock("./NewProjectDialog", () => ({ NewProjectDialog: () => null }));
vi.mock("./NewGoalDialog", () => ({ NewGoalDialog: () => null }));
vi.mock("./NewAgentDialog", () => ({ NewAgentDialog: () => null }));
vi.mock("./ToastViewport", () => ({ ToastViewport: () => null }));
vi.mock("./MobileBottomNav", () => ({ MobileBottomNav: () => null }));
vi.mock("./WorktreeBanner", () => ({ WorktreeBanner: () => null }));
vi.mock("./DevRestartBanner", () => ({ DevRestartBanner: () => null }));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, ...props }: { children?: React.ReactNode; asChild?: boolean } & Record<string, unknown>) => {
    if (asChild) return <>{children}</>;
    return <button {...props}>{children}</button>;
  },
}));
vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("../context/DialogContext", () => ({
  useDialog: () => ({ openNewIssue: vi.fn(), openOnboarding: vi.fn() }),
}));
vi.mock("../context/PanelContext", () => ({
  usePanel: () => ({ togglePanelVisible: vi.fn() }),
}));
vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({
    companies: [{ id: "company-1", name: "Emtesseract", issuePrefix: "EMT" }],
    loading: false,
    selectedCompany: { id: "company-1", name: "Emtesseract", issuePrefix: "EMT" },
    selectedCompanyId: "company-1",
    selectionSource: "manual",
    setSelectedCompanyId: vi.fn(),
  }),
}));
vi.mock("../context/SidebarContext", () => ({
  useSidebar: () => ({ sidebarOpen: true, setSidebarOpen: vi.fn(), toggleSidebar: vi.fn(), isMobile: false }),
}));
vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark", toggleTheme: vi.fn() }),
}));
vi.mock("../hooks/useKeyboardShortcuts", () => ({ useKeyboardShortcuts: () => {} }));
vi.mock("../hooks/useCompanyPageMemory", () => ({ useCompanyPageMemory: () => {} }));
vi.mock("../api/health", () => ({ healthApi: { get: vi.fn() } }));
vi.mock("../lib/company-selection", () => ({ shouldSyncCompanySelectionFromRoute: () => false }));
vi.mock("../lib/instance-settings", () => ({
  DEFAULT_INSTANCE_SETTINGS_PATH: "/instance/settings/general",
  normalizeRememberedInstanceSettingsPath: (value: string | null | undefined) => value ?? "/instance/settings/general",
}));
vi.mock("../lib/queryKeys", () => ({ queryKeys: { health: ["health"] } }));
vi.mock("../lib/utils", () => ({ cn: (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ") }));
vi.mock("../pages/NotFound", () => ({ NotFoundPage: () => <div data-testid="not-found" /> }));

import { Layout } from "./Layout";

describe("Layout scroll behavior", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    locationState.pathname = "/EMT/issues";
    locationState.search = "";
    locationState.hash = "";
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("resets the desktop main scroll position when the route pathname changes", () => {
    act(() => {
      root.render(<Layout />);
    });

    const main = container.querySelector("#main-content") as HTMLElement;
    expect(main).toBeTruthy();

    main.scrollTop = 3701;
    expect(main.scrollTop).toBe(3701);

    act(() => {
      locationState.pathname = "/EMT/design-guide";
      root.render(<Layout />);
    });

    expect(main.scrollTop).toBe(0);
  });
});

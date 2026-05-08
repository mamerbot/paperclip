// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/router", () => ({
  NavLink: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <a className={className}>{children}</a>
  ),
  useLocation: () => ({ pathname: "/projects/factory-ops/issues" }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: unknown[] }) => {
    const joined = queryKey.join(":");
    if (joined.includes("projects")) {
      return {
        data: [
          {
            id: "project-1",
            slug: "factory-ops",
            name: "Factory Ops",
            color: "#00bcd4",
            archivedAt: null,
            pauseReason: "budget",
          },
          {
            id: "project-2",
            slug: "budget-watch",
            name: "Budget Watch",
            color: "#ffcc00",
            archivedAt: null,
            pauseReason: null,
          },
        ],
      };
    }
    return { data: { user: { id: "user-1" } } };
  },
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({
    selectedCompany: { id: "company-1", issuePrefix: "EMT" },
    selectedCompanyId: "company-1",
  }),
}));

vi.mock("../context/DialogContext", () => ({
  useDialog: () => ({ openNewProject: () => {} }),
}));

vi.mock("../context/SidebarContext", () => ({
  useSidebar: () => ({ isMobile: false, setSidebarOpen: () => {} }),
}));

vi.mock("../api/auth", () => ({
  authApi: { getSession: async () => ({ user: { id: "user-1" } }) },
}));

vi.mock("../api/projects", () => ({
  projectsApi: { list: async () => [] },
}));

vi.mock("../lib/queryKeys", () => ({
  queryKeys: {
    projects: { list: (companyId: string) => ["projects", companyId] },
    auth: { session: ["auth", "session"] },
  },
}));

vi.mock("../lib/utils", () => ({
  cn: (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" "),
  projectRouteRef: (project: { slug?: string | null; id: string }) => project.slug ?? project.id,
}));

vi.mock("../hooks/useProjectOrder", () => ({
  useProjectOrder: ({ projects }: { projects: unknown[] }) => ({
    orderedProjects: projects,
    persistOrder: () => {},
  }),
}));

vi.mock("./BudgetSidebarMarker", () => ({
  BudgetSidebarMarker: ({ title }: { title?: string }) => <span data-budget-marker>{title}</span>,
}));

vi.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button className={className}>{children}</button>
  ),
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/plugins/slots", () => ({
  PluginSlotMount: () => null,
  usePluginSlots: () => ({ slots: [] }),
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PointerSensor: function PointerSensor() {},
  closestCenter: {},
  useSensor: () => ({}),
  useSensors: (...args: unknown[]) => args,
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  arrayMove: <T,>(items: T[]) => items,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

import { SidebarProjects } from "./SidebarProjects";

describe("SidebarProjects visual system", () => {
  it("renders project navigation with flat industrial markers instead of colorful app-dot chips", () => {
    const html = renderToStaticMarkup(<SidebarProjects />);

    expect(html).toContain("Factory Ops");
    expect(html).toContain("Budget Watch");
    expect(html).toContain("data-project-nav-marker");
    expect(html).toContain("border border-[var(--border-visible)] bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]");
    expect(html).not.toContain("#00bcd4");
    expect(html).not.toContain("#ffcc00");
    expect(html).not.toContain("rounded-full");
  });

  it("uses framed project rows instead of soft accent fills for the active state", () => {
    const html = renderToStaticMarkup(<SidebarProjects />);

    expect(html).toContain("border border-[var(--border-visible)] bg-[color-mix(in_srgb,var(--foreground)_6%,var(--accent))] text-[var(--text-display)]");
    expect(html).not.toContain("bg-accent text-foreground");
    expect(html).not.toContain("hover:bg-accent/50");
  });

  it("allows long project names to wrap instead of truncating in the sidebar", () => {
    const html = renderToStaticMarkup(<SidebarProjects />);

    expect(html).toContain("data-project-name");
    expect(html).toContain("min-w-0 flex-1 whitespace-normal break-words leading-tight");
    expect(html).not.toContain("flex-1 truncate");
  });
});

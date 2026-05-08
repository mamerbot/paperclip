// @vitest-environment node

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

let useQueriesCallCount = 0;

vi.mock("@tanstack/react-query", () => ({
  useQueries: ({ queries }: { queries: unknown[] }) => {
    useQueriesCallCount += 1;
    return queries.map(() =>
      useQueriesCallCount === 1
        ? { data: [{ id: "run-1" }] }
        : { data: { inbox: 2 } },
    );
  },
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({
    companies: [
      {
        id: "company-1",
        name: "Emtesseract",
        issuePrefix: "EMT",
        status: "active",
        logoUrl: null,
        brandColor: "#ff4719",
      },
    ],
    selectedCompanyId: "company-1",
    setSelectedCompanyId: () => {},
  }),
}));

vi.mock("../context/DialogContext", () => ({
  useDialog: () => ({ openOnboarding: () => {} }),
}));

vi.mock("../api/sidebarBadges", () => ({
  sidebarBadgesApi: { get: async () => ({ inbox: 0 }) },
}));

vi.mock("../api/heartbeats", () => ({
  heartbeatsApi: { liveRunsForCompany: async () => [] },
}));

vi.mock("@/lib/router", () => ({
  useLocation: () => ({ pathname: "/EMT/dashboard" }),
  useNavigate: () => () => {},
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("./CompanyPatternIcon", () => ({
  CompanyPatternIcon: ({ brandColor }: { brandColor?: string | null }) => (
    <div data-testid="company-pattern-icon" data-brand-color={brandColor ?? "none"} />
  ),
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: {},
  PointerSensor: function PointerSensor() {},
  useSensor: () => ({}),
  useSensors: (...args: unknown[]) => args,
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
  arrayMove: <T,>(items: T[]) => items,
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => undefined } },
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
  useQueriesCallCount = 0;
});

import { CompanyRail } from "./CompanyRail";

describe("CompanyRail visual system", () => {
  it("renders flat shell chrome without gradients or shadow effects", () => {
    const html = renderToStaticMarkup(<CompanyRail />);

    expect(html).toContain("bg-[color-mix(in_srgb,var(--sidebar)_96%,var(--background))]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--foreground)_4%,var(--sidebar))]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--sidebar)_84%,var(--background))]");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("shadow-");
    expect(html).not.toContain("drop-shadow-");
  });

  it("keeps company rail icons monochrome instead of passing brand-color accents into the shell", () => {
    const html = renderToStaticMarkup(<CompanyRail />);

    expect(html).toContain('data-testid="company-pattern-icon"');
    expect(html).toContain('data-brand-color="none"');
    expect(html).not.toContain('data-brand-color="#ff4719"');
  });

  it("renders live and unread rail markers as hard-edged plates without pulsing circular dots", () => {
    const html = renderToStaticMarkup(<CompanyRail />);

    expect(html).toContain('data-company-rail-indicator="live"');
    expect(html).toContain('data-company-rail-indicator="unread"');
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("h-1.5 w-1.5");
  });
});

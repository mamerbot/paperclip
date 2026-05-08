// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock("@/lib/router", () => ({
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: "/approvals/pending" }),
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1" }),
}));

vi.mock("../context/BreadcrumbContext", () => ({
  useBreadcrumbs: () => ({ setBreadcrumbs: () => {} }),
}));

vi.mock("../components/PageSkeleton", () => ({
  PageSkeleton: () => <div>Loading</div>,
}));

vi.mock("../components/PageTabBar", () => ({
  PageTabBar: ({ items }: { items: Array<{ label: React.ReactNode }> }) => <div>{items[0]?.label}</div>,
}));

vi.mock("../components/ApprovalCard", () => ({
  ApprovalCard: () => <div data-approval-card="true" />,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { Approvals } from "./Approvals";

beforeEach(() => {
  useQueryMock.mockReset();
  useMutationMock.mockReset();
  invalidateQueriesMock.mockReset();

  useMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useQueryMock.mockImplementation(({ queryKey }: { queryKey: readonly unknown[] }) => {
    const scope = queryKey[0];
    if (scope === "approvals") {
      return {
        data: [
          {
            id: "approval-1",
            status: "pending",
            createdAt: new Date("2026-05-08T09:00:00Z").toISOString(),
            requestType: "budget_exception",
          },
          {
            id: "approval-2",
            status: "revision_requested",
            createdAt: new Date("2026-05-08T08:00:00Z").toISOString(),
            requestType: "tool_access",
          },
        ],
        isLoading: false,
        error: null,
      };
    }

    if (scope === "agents") {
      return { data: [], isLoading: false, error: null };
    }

    return { data: [], isLoading: false, error: null };
  });
});

describe("Approvals visual system", () => {
  it("renders the pending count as a hard-edged plated readout instead of a rounded pill", () => {
    const html = renderToStaticMarkup(<Approvals />);

    expect(html).toContain('data-approvals-pending-count="true"');
    expect(html).toContain('data-approvals-pending-glyph="plate"');
    expect(html).toContain(">2<");
    expect(html).not.toContain("rounded-full border border-[var(--status-progress-border)]");
  });
});

// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: "/EMT/inbox/all", search: "", hash: "" }),
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({
    selectedCompanyId: "company-1",
    selectedCompany: { id: "company-1", issuePrefix: "EMT", name: "Emtesseract" },
  }),
}));

vi.mock("../context/BreadcrumbContext", () => ({
  useBreadcrumbs: () => ({ setBreadcrumbs: () => {} }),
}));

vi.mock("../components/PageSkeleton", () => ({
  PageSkeleton: () => <div>Loading</div>,
}));

vi.mock("../components/EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock("../components/IssueRow", () => ({
  IssueRow: ({ desktopMetaLeading }: { desktopMetaLeading?: React.ReactNode }) => (
    <div data-issue-row="true">{desktopMetaLeading}</div>
  ),
}));

vi.mock("../components/StatusBadge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock("../components/PageTabBar", () => ({
  PageTabBar: () => <div data-page-tab-bar="true" />,
}));

vi.mock("../components/PriorityIcon", () => ({
  PriorityIcon: ({ priority }: { priority: string }) => <span>{priority}</span>,
}));

vi.mock("../components/StatusIcon", () => ({
  StatusIcon: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock("../components/ApprovalPayload", () => ({
  approvalLabel: () => "approval",
  defaultTypeIcon: () => <span>icon</span>,
  typeIcon: {},
}));

vi.mock("../hooks/useInboxBadge", () => ({
  useDismissedInboxItems: () => ({ dismissed: new Set<string>(), dismiss: vi.fn() }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder ?? "value"}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode; value: string }) => <div>{children}</div>,
}));

import { Inbox } from "./Inbox";

const issue = {
  id: "issue-1",
  identifier: "EMT-45",
  title: "Land Nothing-inspired skin on Paperclip web UI",
  priority: "critical",
  status: "in_progress",
  updatedAt: new Date("2026-05-08T08:00:00Z").toISOString(),
  isUnreadForMe: true,
  lastExternalCommentAt: null,
  myLastTouchAt: new Date("2026-05-08T07:00:00Z").toISOString(),
};

const defaultQueryResult = { data: [], isLoading: false, error: null };

beforeEach(() => {
  useQueryMock.mockReset();
  useMutationMock.mockReset();

  useMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useQueryMock.mockImplementation(({ queryKey }: { queryKey: readonly unknown[] }) => {
    const scope = queryKey[0];

    if (scope === "agents") {
      return { data: [{ id: "agent-1", name: "Jony" }], isLoading: false, error: null };
    }
    if (scope === "approvals") {
      return defaultQueryResult;
    }
    if (scope === "access") {
      return defaultQueryResult;
    }
    if (scope === "dashboard") {
      return {
        data: {
          agents: { error: 0 },
          costs: { monthBudgetCents: 0, monthUtilizationPercent: 0 },
        },
        isLoading: false,
        error: null,
      };
    }
    if (scope === "issues" && queryKey[2] === "touched-by-me") {
      return { data: [issue], isLoading: false, error: null };
    }
    if (scope === "issues") {
      return { data: [issue], isLoading: false, error: null };
    }
    if (scope === "heartbeats") {
      return {
        data: [
          {
            id: "run-1",
            agentId: "agent-1",
            status: "running",
            createdAt: new Date("2026-05-08T08:05:00Z").toISOString(),
            contextSnapshot: { issueId: "issue-1" },
          },
        ],
        isLoading: false,
        error: null,
      };
    }

    return defaultQueryResult;
  });
});

describe("Inbox visual system", () => {
  it("renders live issue indicators as plated readouts instead of pulsing round dots", () => {
    const html = renderToStaticMarkup(<Inbox />);

    expect(html).toContain('EMT-45');
    expect(html).toContain('data-inbox-live-badge="true"');
    expect(html).toContain('data-inbox-live-glyph="plate"');
    expect(html).toContain("LIVE");
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("rounded-full bg-[var(--status-live-fg)]");
  });
});

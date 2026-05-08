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
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({
    selectedCompanyId: "company-1",
    companies: [{ id: "company-1", name: "Emtesseract", issuePrefix: "EMT" }],
  }),
}));

vi.mock("../context/DialogContext", () => ({
  useDialog: () => ({
    openOnboarding: () => {},
  }),
}));

vi.mock("../context/BreadcrumbContext", () => ({
  useBreadcrumbs: () => ({
    setBreadcrumbs: () => {},
  }),
}));

vi.mock("../components/MetricCard", () => ({
  MetricCard: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock("../components/EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock("../components/StatusIcon", () => ({
  StatusIcon: () => <span>Status</span>,
}));

vi.mock("../components/PriorityIcon", () => ({
  PriorityIcon: () => <span>Priority</span>,
}));

vi.mock("../components/ActivityRow", () => ({
  ActivityRow: () => <div>Activity row</div>,
}));

vi.mock("../components/Identity", () => ({
  Identity: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("../components/ActiveAgentsPanel", () => ({
  ActiveAgentsPanel: () => <div>Active agents panel</div>,
}));

vi.mock("../components/ActivityCharts", () => ({
  ChartCard: ({ title, children }: { title: string; children: React.ReactNode }) => <section><h3>{title}</h3>{children}</section>,
  RunActivityChart: () => <div>Run activity</div>,
  PriorityChart: () => <div>Priority chart</div>,
  IssueStatusChart: () => <div>Issue status chart</div>,
  SuccessRateChart: () => <div>Success rate chart</div>,
}));

vi.mock("../components/PageSkeleton", () => ({
  PageSkeleton: () => <div>Loading</div>,
}));

vi.mock("@/plugins/slots", () => ({
  PluginSlotOutlet: ({ className, itemClassName }: { className?: string; itemClassName?: string }) => (
    <div className={className} data-item-class={itemClassName}>Plugin slot</div>
  ),
}));

import { Dashboard } from "./Dashboard";

describe("Dashboard visual system", () => {
  it("renders dashboard alert and plugin shell with flat industrial chrome", () => {
    useQueryMock
      .mockReturnValueOnce({ data: [{ id: "agent-1", name: "Jony" }] })
      .mockReturnValueOnce({
        data: {
          agents: { active: 1, running: 1, paused: 0, error: 0 },
          tasks: { inProgress: 1, open: 2, blocked: 0 },
          costs: { monthSpendCents: 1234, monthBudgetCents: 10000, monthUtilizationPercent: 12 },
          pendingApprovals: 0,
          budgets: { activeIncidents: 1, pausedAgents: 1, pausedProjects: 0, pendingApprovals: 1 },
        },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({ data: [] })
      .mockReturnValueOnce({
        data: [
          {
            id: "issue-1",
            companyId: "company-1",
            projectId: null,
            projectWorkspaceId: null,
            identifier: "EMT-45",
            title: "Land Nothing-inspired skin on Paperclip web UI",
            description: null,
            status: "in_progress",
            priority: "high",
            assigneeAgentId: "agent-1",
            createdByAgentId: null,
            originKind: "manual",
            externalUrl: null,
            executionRunId: null,
            executionAgentNameKey: null,
            executionLockedAt: null,
            activeRun: null,
            startedAt: null,
            dueAt: null,
            completedAt: null,
            createdAt: new Date("2026-05-05T00:00:00Z"),
            updatedAt: new Date("2026-05-05T00:00:00Z"),
          },
        ],
      })
      .mockReturnValueOnce({ data: [] })
      .mockReturnValueOnce({ data: [] });

    const html = renderToStaticMarkup(<Dashboard />);

    expect(html).toContain("active budget incident");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--status-danger-bg)_86%,var(--background))]");
    expect(html).toContain("data-item-class=\"border border-[var(--border-visible)] bg-[var(--card)] p-4\"");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("shadow-sm");
  });
});

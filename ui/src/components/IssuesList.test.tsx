// @vitest-environment node

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

let useQueryCallCount = 0;

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => {
    useQueryCallCount += 1;
    if (useQueryCallCount === 1) {
      return { data: { user: { id: "user-1" }, session: { userId: "user-1" } } };
    }
    if (useQueryCallCount === 2) {
      return { data: [] };
    }
    return {
      data: [
        { id: "label-1", name: "Theme", color: "#ff4719" },
      ],
    };
  },
}));

vi.mock("../context/DialogContext", () => ({
  useDialog: () => ({ openNewIssue: () => {} }),
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1" }),
}));

vi.mock("./StatusIcon", () => ({
  StatusIcon: ({ status }: { status: string }) => <span data-testid="status-icon">{status}</span>,
}));

vi.mock("./PriorityIcon", () => ({
  PriorityIcon: ({ priority }: { priority: string }) => <span data-testid="priority-icon">{priority}</span>,
}));

vi.mock("./EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => <div data-testid="empty-state">{message}</div>,
}));

vi.mock("./Identity", () => ({
  Identity: ({ name }: { name: string }) => <span data-testid="identity">{name}</span>,
}));

vi.mock("./IssueRow", () => ({
  IssueRow: ({ desktopMetaLeading, desktopTrailing }: { desktopMetaLeading?: React.ReactNode; desktopTrailing?: React.ReactNode }) => (
    <div data-testid="issue-row">
      {desktopMetaLeading}
      {desktopTrailing}
    </div>
  ),
}));

vi.mock("./PageSkeleton", () => ({
  PageSkeleton: () => <div data-testid="page-skeleton" />,
}));

vi.mock("./KanbanBoard", () => ({
  KanbanBoard: () => <div data-testid="kanban-board" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-content">{children}</div>,
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked }: { checked?: boolean }) => <input type="checkbox" checked={checked} readOnly />,
}));

vi.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div data-testid="collapsible">{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  useQueryCallCount = 0;
});

import { IssuesList } from "./IssuesList";

describe("IssuesList visual system", () => {
  it("renders live issue state as a hard-edged plate without the old pulsing dot badge", () => {
    const html = renderToStaticMarkup(
      <IssuesList
        issues={[
          {
            id: "issue-1",
            title: "Land Nothing-inspired skin",
            status: "in_progress",
            priority: "high",
            createdAt: "2026-05-08T00:00:00.000Z",
            updatedAt: "2026-05-08T00:00:00.000Z",
            issueNumber: 45,
            identifier: "EMT-45",
            labels: [],
            labelIds: [],
            assigneeAgentId: null,
            assigneeUserId: null,
          },
        ] as any}
        agents={[]}
        liveIssueIds={new Set(["issue-1"])}
        viewStateKey="issues-list-test"
        onUpdateIssue={() => {}}
      />,
    );

    expect(html).toContain('data-issue-live-badge="true"');
    expect(html).toContain('data-issue-live-glyph="plate"');
    expect(html).toContain("Live");
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("relative flex h-2 w-2");
    expect(html).not.toContain("rounded-full border border-[var(--status-live-border)] bg-[var(--status-live-bg)]");
    expect(html).not.toContain("rounded-md overflow-hidden mr-1");
  });

  it("renders quick-filter presets as hard-edged industrial selector plates instead of rounded pills", () => {
    const html = renderToStaticMarkup(
      <IssuesList
        issues={[
          {
            id: "issue-1",
            title: "Land Nothing-inspired skin",
            status: "in_progress",
            priority: "high",
            createdAt: "2026-05-08T00:00:00.000Z",
            updatedAt: "2026-05-08T00:00:00.000Z",
            issueNumber: 45,
            identifier: "EMT-45",
            labels: [],
            labelIds: [],
            assigneeAgentId: null,
            assigneeUserId: null,
          },
        ] as any}
        agents={[]}
        liveIssueIds={new Set()}
        viewStateKey="issues-list-test"
        onUpdateIssue={() => {}}
      />,
    );

    expect(html).toContain('data-quick-filter-preset="All"');
    expect(html).toContain('data-quick-filter-preset="Active"');
    expect(html).toContain("rounded-none border border-[var(--border-visible)] bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)] transition-[color,background-color,border-color]");
    expect(html).toContain("hover:border-[var(--event-accent)] hover:bg-[color-mix(in_srgb,var(--accent)_76%,transparent)] hover:text-[var(--text-display)]");
    expect(html).not.toContain("rounded-full border transition-colors");
    expect(html).not.toContain("bg-primary text-primary-foreground border-primary");
  });
});

// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1" }),
}));

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const useQueryClientMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
  useQueryClient: (...args: unknown[]) => useQueryClientMock(...args),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  SelectValue: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuCheckboxItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuShortcut: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: () => <input type="checkbox" />,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/lib/router", () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

vi.mock("./Identity", () => ({
  Identity: ({ name }: { name?: string | null }) => <span>{name ?? "Unknown"}</span>,
}));

vi.mock("./StatusBadge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock("./PriorityIcon", () => ({
  PriorityIcon: ({ priority }: { priority: string }) => <span>{priority}</span>,
}));

vi.mock("./IssueExecutionWorkspaceControl", () => ({
  IssueExecutionWorkspaceControl: () => <div>workspace control</div>,
}));

vi.mock("./IssueExecutionPolicyControl", () => ({
  IssueExecutionPolicyControl: () => <div>policy control</div>,
}));

beforeEach(() => {
  useQueryMock.mockReset();
  useMutationMock.mockReset();
  useQueryClientMock.mockReset();

  useQueryClientMock.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData: vi.fn() });
  useMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });

  useQueryMock.mockImplementation((config?: { queryKey?: unknown }) => {
    const key = Array.isArray(config?.queryKey) ? config.queryKey.join("|") : "";
    if (key.includes("auth")) {
      return { data: { user: { id: "user-1" }, session: { userId: "user-1" } }, isLoading: false, error: null };
    }
    if (key.includes("instance") || key.includes("experimental")) {
      return { data: { executionWorkspaces: true }, isLoading: false, error: null };
    }
    if (key.includes("agents")) {
      return { data: [], isLoading: false, error: null };
    }
    if (key.includes("projects")) {
      return { data: [], isLoading: false, error: null };
    }
    if (key.includes("labels")) {
      return { data: [], isLoading: false, error: null };
    }
    if (key.includes("execution-workspaces")) {
      return { data: [], isLoading: false, error: null };
    }
    return { data: [], isLoading: false, error: null };
  });
});

vi.mock("@/lib/queryKeys", () => ({
  queryKeys: {
    auth: { session: ["auth", "session"] },
    instance: { experimentalSettings: ["instance", "experimental-settings"] },
    agents: { list: (companyId?: string) => ["agents", companyId ?? ""] },
    projects: { list: (companyId?: string) => ["projects", companyId ?? ""] },
    executionWorkspaces: { list: (companyId?: string, filters?: unknown) => ["execution-workspaces", companyId ?? "", JSON.stringify(filters ?? {})] },
    issues: {
      detail: (issueId?: string) => ["issue", "detail", issueId ?? ""],
      list: (companyId?: string) => ["issue", "list", companyId ?? ""],
      labels: (companyId?: string) => ["issue", "labels", companyId ?? ""],
    },
  },
}));

vi.mock("@/api/issues", () => ({
  issuesApi: {
    listLabels: vi.fn(async () => []),
    createLabel: vi.fn(),
    deleteLabel: vi.fn(),
  },
}));

vi.mock("../api/agents", () => ({
  agentsApi: {
    list: vi.fn(async () => []),
  },
}));

vi.mock("../api/auth", () => ({
  authApi: {
    getSession: vi.fn(async () => ({ user: { id: "user-1" }, session: { userId: "user-1" } })),
  },
}));

vi.mock("../api/projects", () => ({
  projectsApi: {
    list: vi.fn(async () => []),
  },
}));

vi.mock("../api/execution-workspaces", () => ({
  executionWorkspacesApi: {
    list: vi.fn(async () => []),
  },
}));

vi.mock("../api/instanceSettings", () => ({
  instanceSettingsApi: {
    getExperimental: vi.fn(async () => ({ executionWorkspaces: true })),
  },
}));

vi.mock("@/lib/assignees", () => ({
  formatAssigneeUserLabel: (userId: string | null | undefined) => userId ?? "Unassigned",
  getRecentAssigneeIds: () => [],
  sortAgentsByRecency: (agents: unknown[]) => agents,
}));

import { IssueProperties } from "./IssueProperties";

describe("IssueProperties visual system", () => {
  it("renders selected labels as hard-edged plates without pill chips or round dots", () => {
    const html = renderToStaticMarkup(
      <IssueProperties
        issue={{
          id: "issue-1",
          companyId: "company-1",
          status: "in_progress",
          priority: "high",
          labels: [
            { id: "label-1", name: "Theme", color: "#FF4719" },
            { id: "label-2", name: "UI", color: "#E5DDD0" },
          ],
          labelIds: ["label-1", "label-2"],
          assigneeAgentId: null,
          assigneeUserId: null,
          createdByUserId: "local-board",
          createdByAgentId: null,
          projectId: null,
          projectWorkspaceId: null,
          executionWorkspaceId: null,
          executionPolicy: null,
          executionState: null,
          executionWorkspacePreference: null,
          executionWorkspaceSettings: null,
          createdAt: "2026-05-08T00:00:00.000Z",
          updatedAt: "2026-05-08T00:00:00.000Z",
        } as never}
        onUpdate={vi.fn()}
      />,
    );

    expect(html).toContain('data-issue-label-chip="true"');
    expect(html).toContain('data-issue-label-glyph="plate"');
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain('h-2.5 w-2.5 rounded-full');
  });
});

// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const useQueryClientMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
  useQueryClient: (...args: unknown[]) => useQueryClientMock(...args),
}));

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ state: null }),
  useNavigate: () => vi.fn(),
  useParams: () => ({ issueId: "issue-1" }),
}));

vi.mock("../api/issues", () => ({
  issuesApi: {
    get: vi.fn(),
    listComments: vi.fn(),
    listApprovals: vi.fn(),
    listAttachments: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
    reopenComment: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    uploadAttachment: vi.fn(),
    deleteAttachment: vi.fn(),
  },
}));

vi.mock("../api/activity", () => ({
  activityApi: {
    forIssue: vi.fn(),
    runsForIssue: vi.fn(),
  },
}));

vi.mock("../api/heartbeats", () => ({
  heartbeatsApi: {
    liveRunsForIssue: vi.fn(),
    activeRunForIssue: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock("../api/agents", () => ({
  agentsApi: {
    list: vi.fn(),
  },
}));

vi.mock("../api/auth", () => ({
  authApi: {
    getSession: vi.fn(),
  },
}));

vi.mock("../api/projects", () => ({
  projectsApi: {
    list: vi.fn(),
  },
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1" }),
}));

vi.mock("../context/PanelContext", () => ({
  usePanel: () => ({
    openPanel: vi.fn(),
    closePanel: vi.fn(),
    panelVisible: false,
    setPanelVisible: vi.fn(),
  }),
}));

vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

vi.mock("../context/BreadcrumbContext", () => ({
  useBreadcrumbs: () => ({ setBreadcrumbs: vi.fn() }),
}));

vi.mock("../hooks/useProjectOrder", () => ({
  useProjectOrder: ({ projects }: { projects: unknown[] }) => ({ orderedProjects: projects }),
}));

vi.mock("../lib/issueDetailBreadcrumb", () => ({
  readIssueDetailBreadcrumb: () => null,
}));

vi.mock("../lib/assignees", () => ({
  assigneeValueFromSelection: vi.fn(),
  suggestedCommentAssigneeValue: vi.fn(),
}));

vi.mock("../lib/queryKeys", () => ({
  queryKeys: {
    issues: {
      detail: () => ["issue", "detail"],
      comments: () => ["issue", "comments"],
      activity: () => ["issue", "activity"],
      runs: () => ["issue", "runs"],
      approvals: () => ["issue", "approvals"],
      attachments: () => ["issue", "attachments"],
      liveRuns: () => ["issue", "live-runs"],
      activeRun: () => ["issue", "active-run"],
      list: () => ["issue", "list"],
    },
    agents: { list: () => ["agents"] },
    auth: { session: ["auth", "session"] },
    projects: { list: () => ["projects"] },
  },
}));

vi.mock("../components/InlineEditor", () => ({
  InlineEditor: ({ value }: { value: string }) => <div>{value}</div>,
}));
vi.mock("../components/CommentThread", () => ({ CommentThread: () => <div>Comments</div> }));
vi.mock("../components/IssueDocumentsSection", () => ({ IssueDocumentsSection: () => <div>Documents</div> }));
vi.mock("../components/IssueWorkProductsSection", () => ({ IssueWorkProductsSection: () => <div>Work Products</div> }));
vi.mock("../components/IssueProperties", () => ({ IssueProperties: () => <div>Properties</div> }));
vi.mock("../components/LiveRunWidget", () => ({ LiveRunWidget: () => <div>Live Runs</div> }));
vi.mock("../components/ScrollToBottom", () => ({ ScrollToBottom: () => null }));
vi.mock("../components/StatusIcon", () => ({ StatusIcon: ({ status }: { status: string }) => <span>{status}</span> }));
vi.mock("../components/PriorityIcon", () => ({ PriorityIcon: ({ priority }: { priority: string }) => <span>{priority}</span> }));
vi.mock("../components/StatusBadge", () => ({ StatusBadge: ({ status }: { status: string }) => <span>{status}</span> }));
vi.mock("../components/Identity", () => ({ Identity: ({ name }: { name: string }) => <span>{name}</span> }));
vi.mock("@/plugins/slots", () => ({
  PluginSlotMount: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PluginSlotOutlet: () => <div>Plugin outlet</div>,
  usePluginSlots: () => ({ slots: [] }),
}));
vi.mock("@/plugins/launchers", () => ({ PluginLauncherOutlet: () => <div>Plugin launcher</div> }));
vi.mock("@/components/ui/separator", () => ({ Separator: () => <hr /> }));
vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));
vi.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/scroll-area", () => ({ ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

import { IssueDetail } from "./IssueDetail";

function makeIssue() {
  return {
    id: "issue-1",
    companyId: "company-1",
    projectId: null,
    projectWorkspaceId: null,
    title: "Land Nothing-inspired skin on Paperclip web UI",
    description: "Continue EMT-45",
    status: "in_progress",
    priority: "high",
    assigneeAgentId: null,
    assigneeUserId: null,
    createdByAgentId: null,
    createdByUserId: "local-board",
    issueNumber: 45,
    identifier: "EMT-45",
    originKind: "manual",
    originId: null,
    labels: [],
    labelIds: [],
    hiddenAt: null,
    createdAt: "2026-05-08T00:00:00.000Z",
    updatedAt: "2026-05-08T00:00:00.000Z",
    attachments: [],
    blockers: [],
    blockedBy: [],
    relatedWork: { inbound: [], outbound: [] },
    workProducts: [],
    project: null,
    activeRun: null,
  };
}

beforeEach(() => {
  useQueryMock.mockReset();
  useMutationMock.mockReset();
  useQueryClientMock.mockReset();

  useMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useQueryClientMock.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData: vi.fn() });

  useQueryMock.mockImplementation((config?: { queryKey?: unknown }) => {
    const key = Array.isArray(config?.queryKey) ? config.queryKey.join("|") : "";

    if (key === "issue,detail" || key === "issue|detail") return { data: makeIssue(), isLoading: false, error: null };
    if (key === "issue,live-runs" || key === "issue|live-runs") return { data: [{ id: "run-1" }], isLoading: false, error: null };
    if (key === "issue,active-run" || key === "issue|active-run") return { data: null, isLoading: false, error: null };
    if (key === "auth,session" || key === "auth|session") {
      return { data: { user: { id: "user-1" }, session: { userId: "user-1" } }, isLoading: false, error: null };
    }

    return { data: [], isLoading: false, error: null };
  });
});

describe("IssueDetail visual system", () => {
  it("renders live issue state as a hard-edged plate without pulsing dot chrome", () => {
    const html = renderToStaticMarkup(<IssueDetail />);

    expect(html).toContain('data-issue-live-badge="true"');
    expect(html).toContain('data-issue-live-glyph="plate"');
    expect(html).toContain("Live");
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("relative flex h-1.5 w-1.5");
  });
});

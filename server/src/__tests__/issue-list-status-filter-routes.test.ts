import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { issueRoutes } from "../routes/issues.js";
import { errorHandler } from "../middleware/index.js";

const COMPANY_ID = "cbc62b74-e2c6-43c5-ab0e-1310102cadb8";
const MALFORMED_COMPANY_ID = "cbc62b74-e2c-43c5-ab0e-1310102cadb8";

const mockIssueService = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock("../services/index.js", () => ({
  accessService: () => ({
    canUser: vi.fn(),
    hasPermission: vi.fn(),
  }),
  agentService: () => ({
    getById: vi.fn(),
  }),
  documentService: () => ({}),
  executionWorkspaceService: () => ({}),
  goalService: () => ({}),
  heartbeatService: () => ({
    wakeup: vi.fn(async () => undefined),
    reportRunActivity: vi.fn(async () => undefined),
  }),
  issueApprovalService: () => ({}),
  issueService: () => mockIssueService,
  logActivity: vi.fn(async () => undefined),
  projectService: () => ({}),
  routineService: () => ({
    syncRunStatusForIssue: vi.fn(async () => undefined),
  }),
  workProductService: () => ({}),
}));

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).actor = {
      type: "board",
      userId: "local-board",
      companyIds: [COMPANY_ID],
      source: "local_implicit",
      isInstanceAdmin: false,
    };
    next();
  });
  app.use("/api", issueRoutes({} as any, {} as any));
  app.use(errorHandler);
  return app;
}

describe("issue list status filter routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIssueService.list.mockImplementation(async (_companyId: string, filters?: { status?: string }) => {
      const statuses = filters?.status?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
      return statuses.map((status) => ({ id: status, status }));
    });
  });

  it("normalizes repeated status query params into the canonical comma-separated filter", async () => {
    const res = await request(createApp())
      .get(`/api/companies/${COMPANY_ID}/issues`)
      .query({
        assigneeAgentId: "agent-1",
        status: ["todo", "in_progress", "blocked"],
      });

    expect(res.status).toBe(200);
    expect(mockIssueService.list).toHaveBeenCalledWith(
      COMPANY_ID,
      expect.objectContaining({
        assigneeAgentId: "agent-1",
        status: "todo,in_progress,blocked",
      }),
    );
    expect(res.body).toEqual([
      { id: "todo", status: "todo" },
      { id: "in_progress", status: "in_progress" },
      { id: "blocked", status: "blocked" },
    ]);
  });

  it("rejects invalid status values with a 400 before reaching the service layer", async () => {
    const res = await request(createApp())
      .get(`/api/companies/${COMPANY_ID}/issues`)
      .query({ status: ["todo", "definitely_not_real"] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid issue status filter",
      details: {
        invalidStatuses: ["definitely_not_real"],
      },
    });
    expect(mockIssueService.list).not.toHaveBeenCalled();
  });

  it("rejects malformed company ids with a 400 before reaching the service layer", async () => {
    const res = await request(createApp()).get(`/api/companies/${MALFORMED_COMPANY_ID}/issues`);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid companyId in path. Expected a UUID.",
    });
    expect(mockIssueService.list).not.toHaveBeenCalled();
  });
});

import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { issueRoutes } from "../routes/issues.js";
import { errorHandler } from "../middleware/index.js";

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
      companyIds: ["company-1"],
      source: "local_implicit",
      isInstanceAdmin: false,
    };
    next();
  });
  app.use("/api", issueRoutes({} as any, {} as any));
  app.use(errorHandler);
  return app;
}

describe("issue list status filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIssueService.list.mockResolvedValue([]);
  });

  it("accepts repeated status query params", async () => {
    const res = await request(createApp()).get(
      "/api/companies/company-1/issues?status=todo&status=in_progress&status=blocked",
    );

    expect(res.status).toBe(200);
    expect(mockIssueService.list).toHaveBeenCalledWith(
      "company-1",
      expect.objectContaining({ status: "todo,in_progress,blocked" }),
    );
  });

  it("accepts comma-separated status query params", async () => {
    const res = await request(createApp()).get(
      "/api/companies/company-1/issues?status=todo,in_progress,blocked",
    );

    expect(res.status).toBe(200);
    expect(mockIssueService.list).toHaveBeenCalledWith(
      "company-1",
      expect.objectContaining({ status: "todo,in_progress,blocked" }),
    );
  });

  it("rejects invalid status filters with 400", async () => {
    const res = await request(createApp()).get("/api/companies/company-1/issues?status=todo&status=bogus");

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: "Invalid issue status filter",
      }),
    );
    expect(mockIssueService.list).not.toHaveBeenCalled();
  });
});

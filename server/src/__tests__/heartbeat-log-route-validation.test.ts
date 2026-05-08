import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { agentRoutes } from "../routes/agents.js";
import { errorHandler } from "../middleware/index.js";

const mockHeartbeatService = vi.hoisted(() => ({
  getRunLogAccess: vi.fn(),
  readLog: vi.fn(),
}));

const mockLogActivity = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("../services/index.js", () => ({
  agentService: () => ({ getById: vi.fn(), resolveByReference: vi.fn() }),
  agentInstructionsService: () => ({}),
  accessService: () => ({ canUser: vi.fn(), hasPermission: vi.fn(), getMembership: vi.fn(), listPrincipalGrants: vi.fn(), ensureMembership: vi.fn(), setPrincipalPermission: vi.fn() }),
  approvalService: () => ({}),
  companySkillService: () => ({ listRuntimeSkillEntries: vi.fn(), resolveRequestedSkillKeys: vi.fn() }),
  budgetService: () => ({}),
  heartbeatService: () => mockHeartbeatService,
  issueApprovalService: () => ({}),
  issueService: () => ({}),
  logActivity: mockLogActivity,
  secretService: () => ({
    resolveAdapterConfigForRuntime: vi.fn(),
    normalizeAdapterConfigForPersistence: vi.fn(async (_companyId: string, config: Record<string, unknown>) => config),
  }),
  syncInstructionsBundleConfigFromFilePath: vi.fn((_agent, config) => config),
  workspaceOperationService: () => ({ getById: vi.fn(), listForRun: vi.fn() }),
}));

vi.mock("../adapters/index.js", () => ({
  findServerAdapter: vi.fn(),
  listAdapterModels: vi.fn(),
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
  app.use("/api", agentRoutes({} as any));
  app.use(errorHandler);
  return app;
}

describe("heartbeat log route validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeartbeatService.getRunLogAccess.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      companyId: "company-1",
      logStore: null,
      logRef: null,
    });
    mockHeartbeatService.readLog.mockResolvedValue({
      runId: "11111111-1111-4111-8111-111111111111",
      content: "",
      nextOffset: 0,
      store: null,
      logRef: null,
    });
  });

  it("rejects non-UUID placeholder run ids before heartbeat lookup", async () => {
    const res = await request(createApp())
      .get("/api/heartbeat-runs/running-no-log/log?offset=0&limitBytes=256000");

    expect(res.status, JSON.stringify(res.body)).toBe(400);
    expect(res.body).toEqual({ error: "Heartbeat run id must be a UUID" });
    expect(mockHeartbeatService.getRunLogAccess).not.toHaveBeenCalled();
    expect(mockHeartbeatService.readLog).not.toHaveBeenCalled();
  });

  it("returns 404 for UUID-like run ids that do not exist", async () => {
    mockHeartbeatService.getRunLogAccess.mockResolvedValueOnce(null);

    const res = await request(createApp())
      .get("/api/heartbeat-runs/22222222-2222-4222-8222-222222222222/log?offset=0&limitBytes=256000");

    expect(res.status, JSON.stringify(res.body)).toBe(404);
    expect(res.body).toEqual({ error: "Heartbeat run not found" });
    expect(mockHeartbeatService.getRunLogAccess).toHaveBeenCalledWith("22222222-2222-4222-8222-222222222222");
    expect(mockHeartbeatService.readLog).not.toHaveBeenCalled();
  });

  it("trims UUID-like run ids before lookup and log reads", async () => {
    const res = await request(createApp())
      .get("/api/heartbeat-runs/%2011111111-1111-4111-8111-111111111111%20/log?offset=5&limitBytes=42");

    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(mockHeartbeatService.getRunLogAccess).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111");
    expect(mockHeartbeatService.readLog).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "11111111-1111-4111-8111-111111111111",
        companyId: "company-1",
      }),
      { offset: 5, limitBytes: 42 },
    );
  });
});

import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { issueRoutes } from "../routes/issues.js";
import { errorHandler } from "../middleware/index.js";

const mockIssueService = vi.hoisted(() => ({
  getById: vi.fn(),
  addComment: vi.fn(),
}));

const mockAccessService = vi.hoisted(() => ({
  canUser: vi.fn(),
  hasPermission: vi.fn(),
}));

const mockWorkProductService = vi.hoisted(() => ({
  createForIssue: vi.fn(),
}));

const mockHeartbeatService = vi.hoisted(() => ({
  reportRunActivity: vi.fn(async () => undefined),
}));

const mockLogActivity = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("../services/index.js", () => ({
  accessService: () => mockAccessService,
  agentService: () => ({}),
  documentService: () => ({}),
  executionWorkspaceService: () => ({}),
  goalService: () => ({}),
  heartbeatService: () => mockHeartbeatService,
  issueApprovalService: () => ({}),
  issueService: () => mockIssueService,
  logActivity: mockLogActivity,
  projectService: () => ({}),
  routineService: () => ({ syncRunStatusForIssue: vi.fn(async () => undefined) }),
  workProductService: () => mockWorkProductService,
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

function makeIssue() {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    companyId: "company-1",
    status: "in_progress",
    identifier: "EMT-21",
    issueNumber: 21,
    title: "Wrap EMT-20: implement minimal Paperclip -> Hermes launch/writeback bridge",
    description: "Implement the narrow Paperclip -> Hermes launch/writeback path.",
    assigneeAgentId: "22222222-2222-4222-8222-222222222222",
    assigneeUserId: null,
    projectId: "33333333-3333-4333-8333-333333333333",
    projectWorkspaceId: "44444444-4444-4444-8444-444444444444",
  };
}

function makeWorkProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: crypto.randomUUID(),
    companyId: "company-1",
    projectId: "33333333-3333-4333-8333-333333333333",
    issueId: "11111111-1111-4111-8111-111111111111",
    executionWorkspaceId: null,
    runtimeServiceId: null,
    type: "artifact",
    provider: "hermes-kanban",
    externalId: null,
    title: "Hermes Kanban launch trace",
    url: null,
    status: "active",
    reviewState: "none",
    isPrimary: false,
    healthStatus: "unknown",
    summary: null,
    metadata: null,
    createdByRunId: null,
    createdAt: new Date("2026-05-01T00:00:00.000Z"),
    updatedAt: new Date("2026-05-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("issue Hermes launch routes", () => {
  const originalLaunchUrl = process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_URL;
  const originalLaunchToken = process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_URL;
    delete process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_TOKEN;
    mockIssueService.getById.mockResolvedValue(makeIssue());
    mockIssueService.addComment.mockResolvedValue({
      id: "comment-1",
      issueId: "11111111-1111-4111-8111-111111111111",
      companyId: "company-1",
      body: "Hermes launch summary",
      createdAt: new Date("2026-05-01T00:00:00.000Z"),
      updatedAt: new Date("2026-05-01T00:00:00.000Z"),
      authorAgentId: null,
      authorUserId: "local-board",
    });
  });

  afterEach(() => {
    if (originalLaunchUrl === undefined) delete process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_URL;
    else process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_URL = originalLaunchUrl;
    if (originalLaunchToken === undefined) delete process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_TOKEN;
    else process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_TOKEN = originalLaunchToken;
    vi.unstubAllGlobals();
  });

  it("writes Hermes work-products and a comment in trace-only mode", async () => {
    mockWorkProductService.createForIssue
      .mockResolvedValueOnce(
        makeWorkProduct({
          id: "wp-board",
          type: "preview_url",
          title: "Hermes Kanban board",
          url: "https://hermes.example/kanban/board-1",
          summary: "Board link",
          metadata: { hermesBoardId: "board-1" },
        }),
      )
      .mockResolvedValueOnce(
        makeWorkProduct({
          id: "wp-trace",
          title: "Hermes Kanban launch trace",
          metadata: { rootTaskId: "task-1", childTaskIds: ["task-2", "task-3"] },
        }),
      );

    const res = await request(createApp())
      .post("/api/issues/11111111-1111-4111-8111-111111111111/hermes-launch")
      .send({
        launchMode: "trace_only",
        boardId: "board-1",
        boardUrl: "https://hermes.example/kanban/board-1",
        rootTaskId: "task-1",
        rootTaskUrl: "https://hermes.example/kanban/tasks/task-1",
        childTaskIds: ["task-2", "task-3"],
        statusSummary: "Queued in Hermes",
        summary: "Created traceability artifacts only.",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      launchStatus: "trace_only",
      launchModeRequested: "trace_only",
      remoteAttempted: false,
      boardId: "board-1",
      boardUrl: "https://hermes.example/kanban/board-1",
      rootTaskId: "task-1",
      childTaskIds: ["task-2", "task-3"],
      commentId: "comment-1",
    });
    expect(mockWorkProductService.createForIssue).toHaveBeenCalledTimes(2);
    expect(mockWorkProductService.createForIssue).toHaveBeenNthCalledWith(
      1,
      "11111111-1111-4111-8111-111111111111",
      "company-1",
      expect.objectContaining({
        type: "preview_url",
        provider: "hermes-kanban",
        title: "Hermes Kanban board",
        url: "https://hermes.example/kanban/board-1",
      }),
    );
    expect(mockWorkProductService.createForIssue).toHaveBeenNthCalledWith(
      2,
      "11111111-1111-4111-8111-111111111111",
      "company-1",
      expect.objectContaining({
        type: "artifact",
        provider: "hermes-kanban",
        title: "Hermes Kanban launch trace",
        metadata: expect.objectContaining({
          rootTaskId: "task-1",
          childTaskIds: ["task-2", "task-3"],
          launchMode: "trace_only",
        }),
      }),
    );
    expect(mockIssueService.addComment).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      expect.stringContaining("Hermes launch summary"),
      { agentId: undefined, userId: "local-board" },
    );
  });

  it("falls back to trace-only artifacts when auto mode has no configured launch URL", async () => {
    mockWorkProductService.createForIssue.mockResolvedValue(
      makeWorkProduct({
        id: "wp-trace",
        metadata: { launchMode: "trace_only" },
      }),
    );

    const res = await request(createApp())
      .post("/api/issues/11111111-1111-4111-8111-111111111111/hermes-launch")
      .send({
        launchMode: "auto",
        summary: "No remote bridge configured yet.",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      launchStatus: "trace_only",
      launchModeRequested: "auto",
      remoteAttempted: false,
      remoteStatus: "not_configured",
    });
    expect(mockWorkProductService.createForIssue).toHaveBeenCalledTimes(1);
    expect(mockIssueService.addComment).toHaveBeenCalledTimes(1);
  });

  it("calls the configured Hermes launch URL in auto mode and writes back the returned references", async () => {
    process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_URL = "https://hermes.example/api/launch";
    process.env.PAPERCLIP_HERMES_KANBAN_LAUNCH_TOKEN = "secret-token";
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        boardId: "board-remote",
        boardUrl: "https://hermes.example/kanban/board-remote",
        rootTaskId: "task-remote",
        rootTaskUrl: "https://hermes.example/kanban/tasks/task-remote",
        childTaskIds: ["task-child-1"],
        statusSummary: "Launch accepted",
        summary: "Hermes accepted the Paperclip issue for execution.",
        metadata: { providerRunId: "run-123" },
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    mockWorkProductService.createForIssue
      .mockResolvedValueOnce(
        makeWorkProduct({
          id: "wp-board",
          type: "preview_url",
          title: "Hermes Kanban board",
          url: "https://hermes.example/kanban/board-remote",
          metadata: { hermesBoardId: "board-remote" },
        }),
      )
      .mockResolvedValueOnce(
        makeWorkProduct({
          id: "wp-trace",
          metadata: { rootTaskId: "task-remote" },
        }),
      );

    const res = await request(createApp())
      .post("/api/issues/11111111-1111-4111-8111-111111111111/hermes-launch")
      .send({ launchMode: "auto", goal: "Launch the MVP bridge" });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://hermes.example/api/launch",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "content-type": "application/json",
          authorization: "Bearer secret-token",
        }),
      }),
    );
    expect(res.body).toMatchObject({
      launchStatus: "launched",
      launchModeRequested: "auto",
      remoteAttempted: true,
      remoteStatus: "ok",
      boardId: "board-remote",
      rootTaskId: "task-remote",
      childTaskIds: ["task-child-1"],
    });
    expect(mockWorkProductService.createForIssue).toHaveBeenCalledTimes(2);
  });
});

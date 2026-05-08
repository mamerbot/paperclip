import { beforeEach, describe, expect, it, vi } from "vitest";
import { agentService } from "../services/agents.ts";

function createAwaitable<T>(value: T, extras: Record<string, unknown> = {}) {
  return {
    then: <TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) => Promise.resolve(value).then(onfulfilled, onrejected),
    catch: <TResult = never>(
      onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
    ) => Promise.resolve(value).catch(onrejected),
    finally: (onfinally?: (() => void) | null) => Promise.resolve(value).finally(onfinally ?? undefined),
    ...extras,
  };
}

function createAgentRemovalDbStub(options: { includeBudgetCleanupSelects?: boolean } = {}) {
  const { includeBudgetCleanupSelects = true } = options;
  const agentRow = {
    id: "agent-1",
    companyId: "company-1",
    name: "Budget Agent",
    role: "general",
    title: null,
    reportsTo: null,
    capabilities: null,
    adapterType: "hermes_local",
    adapterConfig: {},
    runtimeConfig: {},
    budgetMonthlyCents: 100,
    spentMonthlyCents: 0,
    metadata: null,
    permissions: null,
    status: "idle",
    pauseReason: null,
    pausedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const rootSelectResults: unknown[][] = [
    [agentRow],
    [{ agentId: "agent-1", spentMonthlyCents: 0 }],
  ];
  const txSelectResults: unknown[][] = includeBudgetCleanupSelects
    ? [
        [{ id: "policy-1" }],
        [{ approvalId: "approval-1" }],
        [agentRow],
      ]
    : [[agentRow]];
  const deleteReturningResults: unknown[][] = [[agentRow]];

  const rootSelectWhere = vi.fn(() => createAwaitable(rootSelectResults.shift() ?? [], {
    groupBy: rootSelectGroupBy,
  }));
  const rootSelectGroupBy = vi.fn(async () => rootSelectResults.shift() ?? []);
  const rootSelectFrom = vi.fn(() => ({
    where: rootSelectWhere,
    groupBy: rootSelectGroupBy,
  }));

  const txSelectWhere = vi.fn(() => createAwaitable(txSelectResults.shift() ?? []));
  const txSelectFrom = vi.fn(() => ({
    where: txSelectWhere,
  }));

  const txUpdateWhere = vi.fn(async () => []);
  const txUpdateSet = vi.fn(() => ({
    where: txUpdateWhere,
  }));
  const txUpdate = vi.fn(() => ({
    set: txUpdateSet,
  }));

  const txDeleteWhere = vi.fn(() => createAwaitable([], {
    returning: vi.fn(async () => deleteReturningResults.shift() ?? []),
  }));
  const txDelete = vi.fn(() => ({
    where: txDeleteWhere,
  }));

  const tx = {
    select: vi.fn(() => ({ from: txSelectFrom })),
    update: txUpdate,
    delete: txDelete,
  };

  return {
    db: {
      select: vi.fn(() => ({ from: rootSelectFrom })),
      transaction: vi.fn(async (callback: (tx: typeof tx) => Promise<unknown>) => callback(tx)),
    },
    txDelete,
    txDeleteWhere,
    txSelectWhere,
    txUpdateSet,
    txUpdateWhere,
  };
}

describe("agentService budget cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes agent-scoped budget artifacts before deleting the agent row", async () => {
    const dbStub = createAgentRemovalDbStub();

    const service = agentService(dbStub.db as any);
    const removed = await service.remove("agent-1");

    expect(removed?.id).toBe("agent-1");
    expect(dbStub.txSelectWhere).toHaveBeenCalledTimes(2);
    expect(dbStub.txUpdateWhere).toHaveBeenCalledTimes(4);
    expect(dbStub.txDeleteWhere).toHaveBeenCalledTimes(12);
    expect(dbStub.txUpdateSet).toHaveBeenCalledWith(expect.objectContaining({ reportsTo: null }));
    expect(dbStub.txUpdateSet).toHaveBeenCalledWith(expect.objectContaining({ requestedByAgentId: null }));
    expect(dbStub.txUpdateSet).toHaveBeenCalledWith(expect.objectContaining({ authorAgentId: null }));
    expect(dbStub.txUpdateSet).toHaveBeenCalledWith(expect.objectContaining({ linkedByAgentId: null }));
  });

  it("terminates the agent without deleting still-valid budget artifacts", async () => {
    const dbStub = createAgentRemovalDbStub({ includeBudgetCleanupSelects: false });

    const service = agentService(dbStub.db as any);
    const terminated = await service.terminate("agent-1");

    expect(terminated?.id).toBe("agent-1");
    expect(dbStub.txSelectWhere).toHaveBeenCalledTimes(1);
    expect(dbStub.txDeleteWhere).toHaveBeenCalledTimes(0);
    expect(dbStub.txUpdateWhere).toHaveBeenCalledTimes(2);
    expect(dbStub.txUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "terminated",
        pauseReason: null,
        pausedAt: null,
        updatedAt: expect.any(Date),
      }),
    );
    expect(dbStub.txUpdateSet).toHaveBeenCalledWith(expect.objectContaining({ revokedAt: expect.any(Date) }));
  });
});

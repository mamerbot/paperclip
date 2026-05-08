import { describe, expect, it, vi } from "vitest";
import { queueIssueAssignmentWakeup } from "../services/issue-assignment-wakeup.js";

describe("queueIssueAssignmentWakeup", () => {
  it("forwards project scope into assignment wake payload and context", async () => {
    const wakeup = vi.fn().mockResolvedValue({ id: "run-1" });

    await queueIssueAssignmentWakeup({
      heartbeat: { wakeup },
      issue: {
        id: "issue-123",
        assigneeAgentId: "agent-123",
        status: "in_progress",
        projectId: "project-123",
        projectWorkspaceId: "workspace-123",
      },
      reason: "issue_assigned",
      mutation: "create",
      contextSource: "issue.create",
      requestedByActorType: "user",
      requestedByActorId: "local-board",
    });

    expect(wakeup).toHaveBeenCalledWith(
      "agent-123",
      expect.objectContaining({
        source: "assignment",
        triggerDetail: "system",
        reason: "issue_assigned",
        payload: {
          issueId: "issue-123",
          mutation: "create",
          projectId: "project-123",
          projectWorkspaceId: "workspace-123",
        },
        contextSnapshot: {
          issueId: "issue-123",
          source: "issue.create",
          projectId: "project-123",
          projectWorkspaceId: "workspace-123",
        },
        requestedByActorType: "user",
        requestedByActorId: "local-board",
      }),
    );
  });

  it("skips backlog issues", async () => {
    const wakeup = vi.fn().mockResolvedValue({ id: "run-1" });

    await queueIssueAssignmentWakeup({
      heartbeat: { wakeup },
      issue: {
        id: "issue-123",
        assigneeAgentId: "agent-123",
        status: "backlog",
        projectId: "project-123",
        projectWorkspaceId: "workspace-123",
      },
      reason: "issue_assigned",
      mutation: "create",
      contextSource: "issue.create",
    });

    expect(wakeup).not.toHaveBeenCalled();
  });
});

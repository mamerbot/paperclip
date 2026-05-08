// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Issue } from "@paperclipai/shared";

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

import { KanbanBoard } from "./KanbanBoard";

function issue(overrides: Partial<Issue>): Issue {
  return {
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
    createdAt: new Date("2026-05-01T00:00:00Z"),
    updatedAt: new Date("2026-05-01T00:00:00Z"),
    ...overrides,
  } as Issue;
}

describe("KanbanBoard visual system", () => {
  it("renders issue cards as flat industrial panels without soft SaaS shadow or gradient chrome", () => {
    const html = renderToStaticMarkup(
      <KanbanBoard
        issues={[issue({ id: "issue-1", status: "in_progress" })]}
        agents={[{ id: "agent-1", name: "Jony" }]}
        liveIssueIds={new Set(["issue-1"])}
        onUpdateIssue={() => {}}
      />,
    );

    expect(html).toContain("border-[color-mix(in_srgb,var(--border-visible)_44%,transparent)]");
    expect(html).toContain("hover:border-[var(--border-visible)]");
    expect(html).not.toContain("shadow-");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("bg-[linear-gradient");
  });

  it("renders live issue state as a plated readout instead of a pulsing round dot", () => {
    const html = renderToStaticMarkup(
      <KanbanBoard
        issues={[issue({ id: "issue-1", status: "in_progress" })]}
        agents={[{ id: "agent-1", name: "Jony" }]}
        liveIssueIds={new Set(["issue-1"])}
        onUpdateIssue={() => {}}
      />,
    );

    expect(html).toContain('data-kanban-live-badge="true"');
    expect(html).toContain('data-kanban-live-glyph="plate"');
    expect(html).toContain("Live");
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("relative mt-0.5 flex h-2 w-2 shrink-0");
    expect(html).not.toContain("rounded-full bg-[var(--status-live-fg)]");
  });
});

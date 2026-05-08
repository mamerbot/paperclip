// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const useQueryMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

vi.mock("./Identity", () => ({
  Identity: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("./transcript/RunTranscriptView", () => ({
  RunTranscriptView: () => <div>Transcript</div>,
}));

vi.mock("./transcript/useLiveRunTranscripts", () => ({
  useLiveRunTranscripts: () => ({
    transcriptByRun: new Map(),
    hasOutputForRun: () => false,
  }),
}));

import { ActiveAgentsPanel } from "./ActiveAgentsPanel";

describe("ActiveAgentsPanel visual system", () => {
  it("renders hard-edged live-run panels without gradient or shadow chrome", () => {
    useQueryMock
      .mockReturnValueOnce({
        data: [
          {
            id: "run-1",
            agentId: "agent-1",
            agentName: "Jony",
            issueId: "issue-1",
            status: "running",
            createdAt: new Date("2026-05-05T00:00:00Z").toISOString(),
            finishedAt: null,
          },
        ],
      })
      .mockReturnValueOnce({
        data: [
          {
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
            createdAt: new Date("2026-05-05T00:00:00Z"),
            updatedAt: new Date("2026-05-05T00:00:00Z"),
          },
        ],
      });

    const html = renderToStaticMarkup(<ActiveAgentsPanel companyId="company-1" />);

    expect(html).toContain("bg-[color-mix(in_srgb,var(--status-live-bg)_82%,var(--background))]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--accent)_34%,var(--background))]");
    expect(html).toContain("EMT-45 - Land Nothing-inspired skin on Paperclip web UI");
    expect(html).toContain('data-live-state-readout="running"');
    expect(html).toContain("LIVE");
    expect(html).not.toContain("animate-ping");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("shadow-");
  });
});

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: unknown[] }) => {
    const joined = queryKey.join(":");
    if (joined.includes("liveRuns")) {
      return {
        data: [
          {
            id: "run-1",
            status: "running",
            invocationSource: "heartbeat",
            triggerDetail: null,
            startedAt: "2026-05-07T00:00:00.000Z",
            finishedAt: null,
            createdAt: "2026-05-07T00:00:00.000Z",
            agentId: "agent-1",
            agentName: "Jony",
            adapterType: "hermes_local",
            issueId: "issue-1",
          },
        ],
      };
    }
    return { data: null };
  },
  useQueryClient: () => ({ invalidateQueries: () => {} }),
}));

vi.mock("@/lib/router", () => ({
  Link: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("./Identity", () => ({
  Identity: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("./StatusBadge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock("./transcript/RunTranscriptView", () => ({
  RunTranscriptView: () => <div>Transcript preview</div>,
}));

vi.mock("./transcript/useLiveRunTranscripts", () => ({
  useLiveRunTranscripts: () => ({
    transcriptByRun: new Map([["run-1", []]]),
    hasOutputForRun: () => false,
  }),
}));

vi.mock("../api/heartbeats", () => ({
  heartbeatsApi: {
    liveRunsForIssue: async () => [],
    activeRunForIssue: async () => null,
    cancel: async () => {},
  },
}));

vi.mock("../lib/queryKeys", () => ({
  queryKeys: {
    issues: {
      liveRuns: (issueId: string) => ["issues", "liveRuns", issueId],
      activeRun: (issueId: string) => ["issues", "activeRun", issueId],
    },
  },
}));

vi.mock("../lib/utils", () => ({
  formatDateTime: () => "2026-05-07 00:00",
}));

import { LiveRunWidget } from "./LiveRunWidget";

describe("LiveRunWidget visual system", () => {
  it("renders the execution surface as flat industrial panels without gradients or glow", () => {
    const html = renderToStaticMarkup(<LiveRunWidget issueId="issue-1" companyId="company-1" />);

    expect(html).toContain("bg-[color-mix(in_srgb,var(--status-live-bg)_16%,var(--background))]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--status-live-bg)_28%,var(--background))]");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("shadow-");
  });

  it("keeps live-run controls and run IDs as hard-edged readouts instead of soft chrome", () => {
    const html = renderToStaticMarkup(<LiveRunWidget issueId="issue-1" companyId="company-1" />);

    expect(html).toContain("Live Runs / Transcript Feed");
    expect(html).toContain("Open run");
    expect(html).toContain("Stop");
    expect(html).not.toContain("rounded-full");
  });
});

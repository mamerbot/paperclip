// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { BudgetIncidentCard } from "./BudgetIncidentCard";

describe("BudgetIncidentCard visual system", () => {
  it("keeps hard-stop incidents flat and mechanical without gradient chrome", () => {
    const html = renderToStaticMarkup(
      <BudgetIncidentCard
        incident={{
          id: "incident-1",
          companyId: "company-1",
          policyId: "policy-1",
          scopeType: "project",
          scopeId: "project-1",
          scopeName: "Industrial UI rollout",
          metric: "billed_cents",
          windowKind: "calendar_month_utc",
          windowStart: new Date("2026-05-01T00:00:00Z"),
          windowEnd: new Date("2026-05-31T23:59:59Z"),
          thresholdType: "hard",
          amountLimit: 10000,
          amountObserved: 12500,
          status: "open",
          approvalId: null,
          approvalStatus: null,
          resolvedAt: null,
          createdAt: new Date("2026-05-06T00:00:00Z"),
          updatedAt: new Date("2026-05-06T00:00:00Z"),
        }}
        onRaiseAndResume={() => {}}
        onKeepPaused={() => {}}
      />, 
    );

    expect(html).toContain("bg-[color-mix(in_srgb,var(--status-danger-bg)_86%,var(--background))]");
    expect(html).toContain("border-[var(--status-danger-border)]");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("background-image");
  });
});
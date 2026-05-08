// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("../lib/worktree-branding", () => ({
  getWorktreeUiBranding: () => ({
    name: "Industrial Theme Branch",
    color: "#181614",
    textColor: "#E5DDD0",
  }),
}));

import { WorktreeBanner } from "./WorktreeBanner";

describe("WorktreeBanner visual system", () => {
  it("renders the worktree marker as a hard-edged industrial plate instead of a circular dot", () => {
    const html = renderToStaticMarkup(<WorktreeBanner />);

    expect(html).toContain("Worktree");
    expect(html).toContain("Industrial Theme Branch");
    expect(html).toContain('data-worktree-glyph="plate"');
    expect(html).toContain('data-worktree-name="true"');
    expect(html).toContain("data-worktree-glyph=\"plate\"");
    expect(html).toContain("inline-flex h-4 w-4 shrink-0 items-center justify-center border border-current/35");
    expect(html).toContain("text-[9px] font-semibold leading-none opacity-80");
    expect(html).not.toContain("h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70");
    expect(html).not.toContain("rounded-full");
  });
});

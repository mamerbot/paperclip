// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ToastViewport } from "./ToastViewport";

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

vi.mock("../context/ToastContext", () => ({
  useToast: () => ({
    toasts: [
      {
        id: "toast-1",
        tone: "success",
        title: "Gilfoyle run succeeded",
        body: "Trigger: system",
        action: { href: "/runs/1", label: "View run" },
      },
    ],
    dismissToast: () => {},
  }),
}));

describe("ToastViewport", () => {
  it("renders notifications as flat industrial plates without rounded dots or shadow chrome", () => {
    const html = renderToStaticMarkup(<ToastViewport />);

    expect(html).toContain("Gilfoyle run succeeded");
    expect(html).toContain("Trigger: system");
    expect(html).toContain('data-toast-plate="true"');
    expect(html).toContain('data-toast-glyph="plate"');
    expect(html).toContain('data-toast-dismiss="true"');
    expect(html).toContain("border border-[var(--border-visible)]");
    expect(html).toContain("font-mono");
    expect(html).not.toContain("rounded-sm");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("shadow-lg");
    expect(html).not.toContain("backdrop-blur-xl");
    expect(html).not.toContain("h-2 w-2 shrink-0 rounded-full");
  });
});

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({ mutate: () => {}, mutateAsync: async () => {}, isPending: false }),
  useQuery: () => ({ data: [], isLoading: false, error: null }),
  useQueries: () => [],
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: "/EMT/design-guide" }),
  useParams: () => ({ companySlug: "EMT" }),
}));

vi.mock("@/context/CompanyContext", () => ({
  useCompany: () => ({
    companies: [{ id: "company-1", name: "Emtesseract", issuePrefix: "EMT" }],
    selectedCompanyId: "company-1",
    selectedCompany: { id: "company-1", name: "Emtesseract", issuePrefix: "EMT" },
  }),
}));

import { DesignGuide } from "./DesignGuide";

describe("DesignGuide visual system", () => {
  it("renders the hero and visible verification surfaces as flat industrial chrome without soft rounded wrappers", () => {
    const html = renderToStaticMarkup(<DesignGuide />);

    expect(html).toContain("DESIGN GUIDE");
    expect(html).toContain("System verification surface");
    expect(html).toContain("coverage");
    expect(html).toContain("mode pair");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--card)_88%,var(--background))]");
    expect(html).toContain("rounded-none border border-border p-3");
    expect(html).toContain("h-36 rounded-none border border-border");
    expect(html).toContain("border border-[var(--border-visible)] bg-[color-mix(in_srgb,var(--card)_92%,var(--background))]");
    expect(html).toContain("Show advanced filters");
    expect(html).toContain("h-auto max-w-full whitespace-normal py-2 text-left leading-tight");
    expect(html).toContain("[LOADING ISSUES...]");
    expect(html).toContain("[LOADING COMPANY DASHBOARD...]");
    expect(html).toContain('data-design-guide-live-badge="true"');
    expect(html).toContain('data-design-guide-live-glyph="plate"');
    expect(html).toContain("Live");
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("relative flex h-1.5 w-1.5");
    expect(html).not.toContain("bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_3%,transparent),transparent)]");
    expect(html).not.toContain("rounded-md border border-border");
    expect(html).not.toContain("rounded-t-md");
    expect(html).not.toContain("rounded-b-md");
    expect(html).not.toContain("Page Skeleton");
    expect(html).not.toContain("Skeletons");
  });
});

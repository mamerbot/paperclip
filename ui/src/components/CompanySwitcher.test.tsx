// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({
    companies: [
      { id: "company-1", name: "Emtesseract", status: "active" },
      { id: "company-2", name: "Skunkworks", status: "paused" },
      { id: "company-3", name: "Archive", status: "archived" },
    ],
    selectedCompany: { id: "company-1", name: "Emtesseract", status: "active" },
    setSelectedCompanyId: () => {},
  }),
}));

vi.mock("@/lib/router", () => ({
  Link: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <a className={className}>{children}</a>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button className={className}>{children}</button>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  DropdownMenuItem: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

import { CompanySwitcher } from "./CompanySwitcher";

describe("CompanySwitcher visual system", () => {
  it("uses token-backed industrial status indicators instead of legacy green/yellow pill dots", () => {
    const html = renderToStaticMarkup(<CompanySwitcher />);

    expect(html).toContain("border border-[var(--border-visible)] bg-[var(--status-live-fg)]");
    expect(html).toContain("border border-[var(--border-visible)] bg-[var(--status-progress-fg)]");
    expect(html).not.toContain("bg-green-400");
    expect(html).not.toContain("bg-yellow-400");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("Archive");
  });
});

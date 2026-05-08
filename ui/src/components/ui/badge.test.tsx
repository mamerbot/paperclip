// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Badge } from "./badge";

describe("Badge visual system", () => {
  it("renders badges as square industrial labels instead of rounded SaaS pills", () => {
    const html = renderToStaticMarkup(
      <div>
        <Badge variant="outline">beta</Badge>
        <Badge variant="secondary">live</Badge>
      </div>,
    );

    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("shadow-");
    expect(html).toContain("rounded-none");
    expect(html).toContain("font-mono");
    expect(html).toContain("uppercase");
    expect(html).toContain("tracking-[0.16em]");
  });
});

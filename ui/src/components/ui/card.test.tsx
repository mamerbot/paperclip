// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card visual system", () => {
  it("keeps cards flat and structural without soft shadow chrome", () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>Operator Surface</CardTitle>
        </CardHeader>
        <CardContent>Details</CardContent>
        <CardFooter>Actions</CardFooter>
      </Card>,
    );

    expect(html).not.toContain("shadow-sm");
    expect(html).not.toContain("shadow-");
    expect(html).toContain("rounded-none");
    expect(html).toContain("border border-[var(--border-visible)]");
    expect(html).toContain("bg-[color-mix(in_srgb,var(--card)_94%,var(--background))]");
  });
});

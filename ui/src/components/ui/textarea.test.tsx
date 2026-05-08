// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Textarea } from "./textarea";

describe("Textarea visual system", () => {
  it("uses flat industrial chrome instead of rounded shadowed SaaS input styling", () => {
    const html = renderToStaticMarkup(<Textarea defaultValue="Operator notes" />);

    expect(html).toContain("rounded-none");
    expect(html).not.toContain("rounded-md");
    expect(html).not.toContain("shadow-xs");
    expect(html).not.toContain("box-shadow");
  });
});

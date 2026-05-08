// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("radix-ui", () => {
  const React = require("react");
  const passthrough = (tag: string) => ({ children, className, ...props }: any) =>
    React.createElement(tag, { className, ...props }, children);

  return {
    Checkbox: {
      Root: passthrough("button"),
      Indicator: passthrough("span"),
    },
  };
});

import { Checkbox } from "./checkbox";

describe("Checkbox visual system", () => {
  it("uses plated industrial chrome instead of shadowed soft controls", () => {
    const html = renderToStaticMarkup(<Checkbox defaultChecked />);

    expect(html).toContain("rounded-[2px]");
    expect(html).not.toContain("rounded-[4px]");
    expect(html).not.toContain("shadow-xs");
    expect(html).not.toContain("transition-shadow");
    expect(html).toContain("transition-[border-color,background-color,color,opacity]");
  });
});

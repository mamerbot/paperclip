// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("radix-ui", () => {
  const React = require("react");
  const passthrough = (tag: string) => ({ children, className, ...props }: any) =>
    React.createElement(tag, { className, ...props }, children);

  return {
    Tabs: {
      Root: passthrough("div"),
      List: passthrough("div"),
      Trigger: passthrough("button"),
      Content: passthrough("div"),
    },
  };
});

import { Tabs, TabsList, TabsTrigger } from "./tabs";

describe("Tabs visual system", () => {
  it("avoids shadow-based active states and keeps triggers flat", () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(html).not.toContain("shadow-sm");
    expect(html).not.toContain("shadow-none");
    expect(html).not.toContain("box-shadow");
    expect(html).not.toContain("transition-[color,background-color,border-color,box-shadow]");
    expect(html).toContain("transition-[color,background-color,border-color,opacity]");
  });
});

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("radix-ui", () => {
  const React = require("react");
  const passthrough = (tag: string) => ({ children, className, ...props }: any) =>
    React.createElement(tag, { className, ...props }, children);

  return {
    Avatar: {
      Root: passthrough("span"),
      Image: passthrough("img"),
      Fallback: passthrough("span"),
    },
  };
});

import { Avatar, AvatarFallback, AvatarBadge, AvatarGroupCount } from "./avatar";

describe("Avatar visual system", () => {
  it("uses hard-edged industrial chrome instead of circular avatar pills", () => {
    const html = renderToStaticMarkup(
      <div>
        <Avatar>
          <AvatarFallback>JM</AvatarFallback>
          <AvatarBadge>!</AvatarBadge>
        </Avatar>
        <AvatarGroupCount>+5</AvatarGroupCount>
      </div>,
    );

    expect(html).toContain('data-slot="avatar"');
    expect(html).toContain("rounded-[2px]");
    expect(html).not.toContain("rounded-full");
  });
});

import { describe, expect, it } from "vitest";
import {
  getDiscordChannelPath,
  getDiscordRouteState,
  getDiscordThreadPath,
} from "../discord-routing";

describe("Discord route mapping", () => {
  it("maps top-level routes to channels", () => {
    expect(getDiscordRouteState("/")).toEqual({ activeChannel: "home", activeThread: null });
    expect(getDiscordRouteState("/projects")).toEqual({ activeChannel: "projects", activeThread: null });
    expect(getDiscordRouteState("/blogs")).toEqual({ activeChannel: "blogs", activeThread: null });
  });

  it("maps direct project and blog deep links to threads", () => {
    expect(getDiscordRouteState("/projects/pantas")).toEqual({
      activeChannel: "projects",
      activeThread: { parent: "projects", slug: "pantas" },
    });
    expect(getDiscordRouteState("/blogs/agentic-engineering-daily-stack")).toEqual({
      activeChannel: "blogs",
      activeThread: { parent: "blogs", slug: "agentic-engineering-daily-stack" },
    });
  });

  it("ignores extra nested path segments when deriving a thread", () => {
    expect(getDiscordRouteState("/projects/pantas/extra").activeThread).toEqual({
      parent: "projects",
      slug: "pantas",
    });
  });

  it("builds channel and thread destinations without local navigation state", () => {
    expect(getDiscordChannelPath("home")).toBe("/");
    expect(getDiscordChannelPath("projects")).toBe("/projects");
    expect(getDiscordThreadPath({ parent: "blogs", slug: "example" })).toBe("/blogs/example");
  });
});

/** @vitest-environment node */

import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import sitemap from "../sitemap";
import robots from "../robots";
import { GET as getLlms } from "../llms.txt/route";
import {
  GET as getMarkdown,
  HEAD as headMarkdown,
} from "../agent-markdown/route";
import { proxy } from "../../proxy";

describe("agent-facing endpoints", () => {
  it("publishes canonical sitemap entries with lastmod values", () => {
    const entries = sitemap();
    expect(entries.find((entry) => entry.url === "https://aedwon.com")).toBeTruthy();
    expect(
      entries.find((entry) => entry.url === "https://aedwon.com/projects/msl-network"),
    ).toBeTruthy();
    expect(
      entries.find((entry) => entry.url === "https://aedwon.com/projects/bettergov-ph"),
    ).toBeTruthy();
    expect(entries.every((entry) => entry.lastModified)).toBe(true);
  });

  it("publishes robots rules and the canonical sitemap URL", () => {
    const value = robots();
    expect(value.sitemap).toBe("https://aedwon.com/sitemap.xml");
    expect(value.host).toBe("https://aedwon.com");
    expect(value.rules).toMatchObject({ disallow: expect.arrayContaining(["/agent-markdown"]) });
  });

  it("serves llms.txt with explicit usage guidance", async () => {
    const response = await getLlms();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toContain("## When to use this site");
  });

  it("serves Markdown GET and HEAD responses with the protocol headers", async () => {
    const request = new Request(
      "https://aedwon.com/agent-markdown?path=%2Fprojects",
    );
    const response = await getMarkdown(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("vary")).toBe("Accept");
    expect(await response.text()).toContain("# Projects");

    const head = await headMarkdown(request);
    expect(head.status).toBe(200);
    expect(head.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(await head.text()).toBe("");
  });

  it("uses the forwarded canonical pathname for rewritten Markdown requests", async () => {
    const request = new Request("https://aedwon.com/projects", {
      headers: { "x-aedwon-markdown-path": "/projects" },
    });
    const response = await getMarkdown(request);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("# Projects");
  });

  it("rewrites Markdown requests and rejects unsupported representations", () => {
    const markdownRequest = new NextRequest("https://aedwon.com/projects", {
      headers: { accept: "text/markdown, text/html;q=0.8" },
    });
    const markdownResponse = proxy(markdownRequest);
    expect(markdownResponse.headers.get("vary")).toBe("Accept");
    expect(markdownResponse.headers.get("x-middleware-rewrite")).toContain(
      "/agent-markdown?path=%2Fprojects",
    );

    const htmlResponse = proxy(
      new NextRequest("https://aedwon.com/projects", {
        headers: { accept: "text/html" },
      }),
    );
    expect(htmlResponse.headers.get("vary")).toContain("Accept");

    const unsupported = proxy(
      new NextRequest("https://aedwon.com/projects", {
        headers: { accept: "application/pdf" },
      }),
    );
    expect(unsupported.status).toBe(406);
    expect(unsupported.headers.get("vary")).toBe("Accept");
  });
});

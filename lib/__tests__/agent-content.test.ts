import { describe, expect, it } from "vitest";
import { buildLlmsTxt, markdownForPath } from "../agent-content";
import {
  ABOUT_CONTENT,
  CONTACT_CONTENT,
  PRIVACY_CONTENT,
  SITE_URL,
} from "../site-content";

function flattenedLength(content: {
  intro: string;
  sections: { paragraphs: string[] }[];
}) {
  return [content.intro, ...content.sections.flatMap((section) => section.paragraphs)]
    .join(" ")
    .length;
}

describe("agent-facing portfolio content", () => {
  it("serves a substantial homepage Markdown representation", () => {
    const result = markdownForPath("/");
    expect(result.status).toBe(200);
    expect(result.body).toContain("# Aedwon — Aerol Balayon");
    expect(result.body).toContain("## Featured projects");
    expect(result.body).toContain("## Open source");
    expect(result.body).toContain("Microsoft Aspire");
    expect(result.body).toContain("OpenSRE");
    expect(result.body).toContain("DockRoute");
    expect(result.body).toContain("Pantas");
    expect(result.body.length).toBeGreaterThan(500);
  });

  it("renders structured OSS lifecycle labels in Markdown", () => {
    const result = markdownForPath("/");
    expect(result.status).toBe(200);
    expect(result.body).toContain(
      "[PR #5634](https://github.com/Tracer-Cloud/opensre/pull/5634) · Released · v0.1.2026.8.31",
    );
    expect(result.body).toContain(
      "[PR #744](https://github.com/bettergovph/bettergov/pull/744) · Approved",
    );
    expect(result.body).not.toContain(" · undefined:");
  });

  it("uses canonical project facts and redirects legacy aliases", () => {
    const project = markdownForPath("/projects/msl-network");
    expect(project.status).toBe(200);
    expect(project.body).toContain("Single-server MLBB Discord bot");
    expect(project.body).toContain("Timeline: 2026");

    const alias = markdownForPath("/projects/sb-norala");
    expect(alias.status).toBe(308);
    expect(alias.location).toBe(`${SITE_URL}/projects/norala-sb-portal`);
  });

  it("serves BetterGov contribution details instead of an external redirect", () => {
    const result = markdownForPath("/projects/bettergov-ph");
    expect(result.status).toBe(200);
    expect(result.body).toContain("Upstream PR Author");
    expect(result.body).toContain("[#706](https://github.com/bettergovph/bettergov/pull/706)");
    expect(result.body).toContain("[#744](https://github.com/bettergovph/bettergov/pull/744)");
    expect(result.body).toContain("closed without merge");
  });

  it("returns an agent-friendly Markdown 404 with recovery indexes", () => {
    const result = markdownForPath("/this-does-not-exist");
    expect(result.status).toBe(404);
    expect(result.body).toContain("# 404: Not found");
    expect(result.body).toContain(`${SITE_URL}/llms.txt`);
    expect(result.body).toContain(`${SITE_URL}/sitemap.xml`);
  });

  it("publishes explicit when-to-use guidance without business claims", () => {
    const llms = buildLlmsTxt();
    expect(llms).toContain("## When to use this site");
    expect(llms).toContain("Do not infer that this portfolio represents a company");
    expect(llms).toContain("Accept: text/markdown");
  });

  it("keeps each personal trust page substantive", () => {
    expect(flattenedLength(ABOUT_CONTENT)).toBeGreaterThan(500);
    expect(flattenedLength(CONTACT_CONTENT)).toBeGreaterThan(500);
    expect(flattenedLength(PRIVACY_CONTENT)).toBeGreaterThan(500);
  });
});
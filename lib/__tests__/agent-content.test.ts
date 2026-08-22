import { describe, expect, it } from "vitest";
import { buildLlmsTxt, markdownForPath } from "../agent-content";
import {
  ABOUT_CONTENT,
  CONTACT_CONTENT,
  PRIVACY_CONTENT,
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
    expect(result.body).toContain("Pantas");
    expect(result.body.length).toBeGreaterThan(500);
  });

  it("uses canonical project facts and redirects legacy aliases", () => {
    const project = markdownForPath("/projects/msl-network");
    expect(project.status).toBe(200);
    expect(project.body).toContain("Single-server MLBB Discord bot");
    expect(project.body).toContain("Timeline: 2026");

    const alias = markdownForPath("/projects/sb-norala");
    expect(alias.status).toBe(308);
    expect(alias.location).toBe("https://aedwon.com/projects/norala-sb-portal");
  });

  it("returns an agent-friendly Markdown 404 with recovery indexes", () => {
    const result = markdownForPath("/this-does-not-exist");
    expect(result.status).toBe(404);
    expect(result.body).toContain("# 404: Not found");
    expect(result.body).toContain("https://aedwon.com/llms.txt");
    expect(result.body).toContain("https://aedwon.com/sitemap.xml");
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

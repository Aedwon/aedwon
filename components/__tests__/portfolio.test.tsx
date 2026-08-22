import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/lib/data/projects";
import { EXPERIENCES } from "@/lib/data/experience";
import { AFFILIATION_GROUPS } from "@/lib/data/affiliations";
import { BLOG_POSTS } from "@/lib/data/blogs";

describe("Portfolio data layer integrity", () => {
  it("contains complete canonical project metadata", () => {
    expect(PROJECTS).toHaveLength(13);
    PROJECTS.forEach((project) => {
      expect(project.slug).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.summary).toBeTruthy();
      expect(project.role).toBeTruthy();
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.problem).toBeTruthy();
      expect(project.results).toBeTruthy();
    });
  });

  it("has exactly the four featured projects", () => {
    expect(PROJECTS.filter((project) => project.featured).map((project) => project.slug)).toEqual([
      "pantas",
      "msl-network",
      "qr-studio",
      "kiosk-survey",
    ]);
  });

  it("contains source-of-truth Pantas data", () => {
    const pantas = PROJECTS.find((project) => project.slug === "pantas");
    expect(pantas).toBeDefined();
    expect(pantas?.stack.map((item) => item.name)).toContain("Flutter 3.41+");
    expect(pantas?.stack.map((item) => item.name)).toContain("Drift (SQLite)");
    expect(pantas?.stack.map((item) => item.name)).toContain("Open Spaced Repetition (FSRS)");
    expect(pantas?.liveUrl).toBe("https://pantas.app");
  });

  it("contains 7 distinct experience entities with UP Oblation separated", () => {
    expect(EXPERIENCES).toHaveLength(7);
    const ids = EXPERIENCES.map((entity) => entity.id);
    expect(ids).toContain("up-fighting-maroons");
    expect(ids).toContain("up-oblation-esports");
    expect(ids).toContain("psysc");
    expect(ids).toContain("moonton");
  });

  it("contains 23 affiliations across 2 categories", () => {
    const totalItems = AFFILIATION_GROUPS.reduce((total, group) => total + group.items.length, 0);
    expect(totalItems).toBe(23);
    expect(AFFILIATION_GROUPS).toHaveLength(2);
  });

  it("contains technical blog posts", () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(0);
    BLOG_POSTS.forEach((post) => {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.content).toBeTruthy();
    });
  });
});

import { describe, it, expect } from "vitest";
import { PROJECTS } from "@/lib/data/projects";
import { EXPERIENCES } from "@/lib/data/experience";
import { AFFILIATION_GROUPS } from "@/lib/data/affiliations";
import { BLOG_POSTS } from "@/lib/data/blogs";

describe("Portfolio Data Layer Integrity", () => {
  it("should contain exactly 12 projects with complete metadata", () => {
    expect(PROJECTS).toHaveLength(12);
    PROJECTS.forEach((p) => {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.summary).toBeTruthy();
      expect(p.role).toBeTruthy();
      expect(p.stack.length).toBeGreaterThan(0);
      expect(p.problem).toBeTruthy();
      expect(p.results).toBeTruthy();
    });
  });

  it("should have exactly 4 featured projects", () => {
    const featured = PROJECTS.filter((p) => p.featured);
    expect(featured).toHaveLength(4);
    const slugs = featured.map((p) => p.slug);
    expect(slugs).toContain("pantas");
    expect(slugs).toContain("msl-network");
    expect(slugs).toContain("qr-studio");
    expect(slugs).toContain("kiosk-survey");
  });

  it("should contain ground truth data for Pantas", () => {
    const pantas = PROJECTS.find((p) => p.slug === "pantas");
    expect(pantas).toBeDefined();
    expect(pantas?.stack.map((s) => s.name)).toContain("Flutter (3.41+)");
    expect(pantas?.stack.map((s) => s.name)).toContain("Drift (SQLite)");
    expect(pantas?.stack.map((s) => s.name)).toContain("Open Spaced Repetition (FSRS)");
    expect(pantas?.liveUrl).toBe("https://pantas.app");
  });

  it("should contain 7 distinct experience entities with UP Oblation separated", () => {
    expect(EXPERIENCES).toHaveLength(7);
    const ids = EXPERIENCES.map((e) => e.id);
    expect(ids).toContain("up-fighting-maroons");
    expect(ids).toContain("up-oblation-esports");
    expect(ids).toContain("psysc");
    expect(ids).toContain("moonton");
  });

  it("should contain 23 affiliations across 2 categories", () => {
    const totalItems = AFFILIATION_GROUPS.reduce((acc, g) => acc + g.items.length, 0);
    expect(totalItems).toBe(23);
    expect(AFFILIATION_GROUPS).toHaveLength(2);
  });

  it("should contain technical blog posts", () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(0);
    BLOG_POSTS.forEach((post) => {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.content).toBeTruthy();
    });
  });
});

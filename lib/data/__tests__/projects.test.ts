import { describe, expect, it } from "vitest";
import { PROJECTS } from "../projects";
import {
  ALL_PROJECTS,
  getFeaturedProjects,
  getNextProject,
  getProjectBySlug,
  resolveProjectSlug,
} from "../project-registry";

describe("project registry", () => {
  it("keeps one ordered record per canonical slug", () => {
    expect(ALL_PROJECTS).toHaveLength(PROJECTS.length);
    expect(new Set(ALL_PROJECTS.map((project) => project.slug)).size).toBe(ALL_PROJECTS.length);

    for (let index = 1; index < ALL_PROJECTS.length; index += 1) {
      expect(ALL_PROJECTS[index - 1].order).toBeLessThan(ALL_PROJECTS[index].order);
    }
  });

  it("defines exactly the four featured projects from the copy reference", () => {
    expect(getFeaturedProjects().map((project) => project.slug)).toEqual([
      "pantas",
      "msl-network",
      "qr-studio",
      "kiosk-survey",
    ]);
  });

  it("centralizes legacy aliases and normalized lookup", () => {
    expect(resolveProjectSlug("sb-norala")).toBe("norala-sb-portal");
    expect(resolveProjectSlug("bettergov")).toBe("bettergov-ph");
    expect(resolveProjectSlug("GI_DAMAGE_CALCULATOR")).toBe("gi-damage-calculator");
    expect(getProjectBySlug("oppo-bot")?.slug).toBe("oppo-legend-cup-bot");
  });

  it("uses registry ordering for next-project navigation", () => {
    expect(getNextProject("pantas")?.slug).toBe("msl-network");
    expect(getNextProject("bettergov-ph")).toBeUndefined();
    expect(getNextProject("webp-unli")?.slug).toBe("pantas");
  });

  it("keeps current MSL bot facts and rejects stale project claims", () => {
    const project = getProjectBySlug("msl-network");
    expect(project).toBeDefined();
    expect(project?.title).toBe("MSL Network Bot");
    expect(project?.role).toBe("Developer");
    expect(project?.timeline).toBe("2026");
    expect(project?.stack.map((item) => item.name)).toEqual(
      expect.arrayContaining(["Python", "Discord.py", "MySQL", "aiomysql", "aiohttp", "Vercel", "Pterodactyl"]),
    );

    const serialized = JSON.stringify(project).toLowerCase();
    expect(serialized).not.toContain("registrar");
    expect(serialized).not.toContain("10,000+");
    expect(serialized).not.toContain("180+");
    expect(serialized).not.toContain("800 players");
    expect(serialized).not.toContain("90%");
    expect(serialized).not.toContain("2022 to present");
  });

  it("keeps corrected source-of-truth facts for projects that previously had overrides", () => {
    expect(getProjectBySlug("qr-studio")?.timeline).toBe("2024");
    expect(getProjectBySlug("kiosk-survey")?.timeline).toBe("2023 to 2024");
    expect(getProjectBySlug("ilocos-sur-esports-bot")?.timeline).toBe("2024");
    expect(getProjectBySlug("oppo-legend-cup-bot")?.timeline).toBe("2024 to 2025");
  });
});

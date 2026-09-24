import { describe, expect, it } from "vitest";
import { getProjectBySlug } from "../data/project-registry";

describe("Genshin wish counter project registration", () => {
  it("registers the read-only wish counter in Web & Tools", () => {
    const project = getProjectBySlug("genshin-wish-counter");

    expect(project).toBeDefined();
    expect(project?.title).toBe("Genshin Wish Counter");
    expect(project?.category).toBe("web");
    expect(project?.categoryLabel).toBe("Web & Tools");
  });
});

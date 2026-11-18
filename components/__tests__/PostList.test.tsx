import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostList, sectionChunks, splitLead } from "../design-v3/postText";
import { validateProject } from "../../lib/studio/server";
import paxSilica from "../../content/projects/pax-silica.json";

describe("post lists", () => {
  it("starts the list at the given paragraph", () => {
    const p = ["intro", "a", "b"];
    expect(sectionChunks(p)).toEqual([{ start: 0, items: p }]);
    expect(sectionChunks(p, undefined, { from: 1 })).toEqual([
      { start: 0, items: ["intro"] },
      { start: 1, items: ["a", "b"], list: true },
    ]);
    expect(sectionChunks(p, undefined, { from: 0 })).toEqual([{ start: 0, items: p, list: true }]);
    expect(sectionChunks(p, undefined, { from: 9 })).toEqual([{ start: 0, items: p }]);
  });

  it("keeps charts at their paragraph index", () => {
    const p = ["intro", "a", "b", "c"];
    expect(sectionChunks(p, [{ which: "ps-rnd", after: 3 }], { from: 1 })).toEqual([
      { start: 0, items: ["intro"] },
      { start: 1, items: ["a", "b"], list: true, chart: "ps-rnd" },
      { start: 3, items: ["c"], list: true },
    ]);
    expect(sectionChunks(p, [{ which: "ps-rnd", after: 1 }], { from: 2 })).toEqual([
      { start: 0, items: ["intro"], chart: "ps-rnd" },
      { start: 1, items: ["a"] },
      { start: 2, items: ["b", "c"], list: true },
    ]);
  });

  it("marks the lead phrase", () => {
    expect(splitLead("**Lead.** Rest.")).toEqual([{ text: "Lead.", lead: true }, { text: " Rest." }]);
    expect(splitLead("no marks ** here")).toEqual([{ text: "no marks ** here" }]);
  });

  it("renders bullets, lead color and raised citations", () => {
    const { container } = render(<PostList items={["**Lead.** Body.[21]", "Plain"]} style={{ fontSize: 17 }} />);
    expect(container.querySelectorAll("li").length).toBe(2);
    const lead = screen.getByText("Lead.");
    expect(lead.tagName).toBe("SPAN");
    expect(lead.style.color).toBe("var(--text-primary)");
    expect(container.textContent).not.toContain("**");
    const cite = screen.getByRole("link", { name: "Source 21" });
    expect(cite.closest("sup")?.className).toBe("v3cite");
  });

  it("validates list and the Pax Silica list", () => {
    const bad = { ...paxSilica, sections: [{ kind: "text", list: { from: -1 } }] };
    expect(validateProject(bad, "pax-silica").some((m) => m.includes("list"))).toBe(true);
    expect(validateProject(paxSilica, "pax-silica")).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CHARTS, Chart, chunkParas } from "../design-v3/charts";
import paxSilica from "../../content/projects/pax-silica.json";
import { PROJECT_FILES } from "../../content/projects";
import { validateProject } from "../../lib/studio/server";

describe("post charts", () => {
  it("renders each registered chart", () => {
    render(<><Chart which="ps-status" /><Chart which="ps-rnd" /><Chart which="ps-dost" /></>);
    expect(screen.getByText("Where Pax Silica stands")).toBeTruthy();
    expect(screen.getByRole("img", { name: /R&D spending as a share of GDP/ })).toBeTruthy();
    expect(screen.getByRole("img", { name: /DOST 2025/ })).toBeTruthy();
    expect(screen.getAllByText(/^Source/).length).toBe(2);
    expect(Object.keys(CHARTS).sort()).toEqual(["ps-dost", "ps-rnd", "ps-status"]);
  });

  it("draws nothing for an unknown chart", () => {
    const { container } = render(<Chart which="nope" />);
    expect(container.innerHTML).toBe("");
  });

  it("places each chart after the right number of paragraphs", () => {
    const p = ["a", "b", "c", "d"];
    expect(chunkParas(p)).toEqual([{ start: 0, items: p }]);
    expect(chunkParas(p, [{ which: "ps-dost", after: 3 }, { which: "ps-rnd", after: 2 }])).toEqual([
      { start: 0, items: ["a", "b"], chart: "ps-rnd" },
      { start: 2, items: ["c"], chart: "ps-dost" },
      { start: 3, items: ["d"] },
    ]);
    expect(chunkParas(p, [{ which: "ps-rnd", after: 4 }])).toEqual([
      { start: 0, items: p, chart: "ps-rnd" },
      { start: 4, items: [] },
    ]);
    expect(chunkParas(p, [{ which: "ps-rnd", after: 99 }, { which: "bogus", after: 1 }])[0].items).toEqual(p);
  });

  it("matches the Pax Silica post", () => {
    expect(PROJECT_FILES.map((f) => f.id)).toContain("pax-silica");
    expect(validateProject(paxSilica, "pax-silica")).toEqual([]);
    const sections = paxSilica.sections as { p: string[]; charts?: { which: string; after: number }[] }[];
    const used = sections.flatMap((s) => (s.charts || []).map((c) => c.which)).sort();
    expect(used).toEqual(["ps-dost", "ps-rnd", "ps-status"]);
    for (const s of sections) for (const c of s.charts || []) expect(c.after).toBeLessThanOrEqual(s.p.length);
  });
});

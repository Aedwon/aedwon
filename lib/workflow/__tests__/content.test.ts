import { describe, expect, it } from "vitest";
import raw from "@/content/workflow/page.json";
import { loadWorkflowPage } from "../load";
import { validateWorkflowPage, workflowProblems } from "../validate";
import { buildAgentText, promptParts } from "../agent-text";
import { parseInline } from "../inline";
import { routeEdges } from "../route";

describe("workflow content", () => {
  it("is valid", () => {
    expect(workflowProblems(raw)).toEqual([]);
    expect(() => loadWorkflowPage()).not.toThrow();
  });

  it("rejects broken content", () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const bad = structuredClone(raw) as Record<string, any>;
    bad.setup.picture.edges[0].to = "nobody";
    bad.task.parts[1].id = bad.task.parts[0].id;
    bad.beforeAfter.items = bad.beforeAfter.items.filter((i: any) => i.type !== "reply");
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const problems = workflowProblems(bad);
    expect(problems.some((p) => p.includes("is not a node"))).toBe(true);
    expect(problems.some((p) => p.includes("used twice"))).toBe(true);
    expect(problems.some((p) => p.includes("two replies"))).toBe(true);
    expect(() => validateWorkflowPage(bad)).toThrow(/Invalid workflow content/);
  });

  it("uses stand-ins for commit hashes in the before reply", () => {
    const page = loadWorkflowPage();
    const text = JSON.stringify(page);
    expect(text).not.toMatch(/\b[0-9a-f]{7}\b`/);
    expect(text).toContain("[hash]");
  });

  it("draws who works for whom exactly as the spec says", () => {
    const { nodes, edges } = loadWorkflowPage().setup.picture;
    const label = (id: string) => nodes.find((n) => n.id === id)!.label;
    const sentences = edges.map((e) => `${label(e.from)} ${e.kind} ${label(e.to)}${e.ends === "both" ? " (both ways)" : ""}${e.optional ? " (optional)" : ""}`);
    expect(sentences.sort()).toEqual(
      [
        "Aedwon talks Lead (both ways)",
        "Company policy feeds Lead",
        "Project playbook feeds Lead",
        "Lead asks Advisor (both ways)",
        "Lead delegates Implementation (both ways)",
        "Lead delegates Bulk (both ways)",
        "Lead calls Auditor (both ways) (optional)",
      ].sort(),
    );
    expect(nodes.find((n) => n.id === "auditor")?.outside).toBe(true);
  });

  it("draws the task in the order work happens, with the audit outside the line", () => {
    const { task } = loadWorkflowPage();
    expect(task.picture.line).toEqual([
      "top-down-approach",
      "scope-before-work",
      "standards-before-work",
      "decision-record",
      "proof-before-done",
      "who-may-sign-what",
      "process-improvement",
    ]);
    expect(task.picture.optional.map((o) => o.id)).toEqual(["outside-audit"]);
    expect(task.parts.map((p) => p.id)).toContain("outside-audit");
  });

  it("holds every prompt in the agent text", () => {
    const page = loadWorkflowPage();
    const text = buildAgentText(page);
    const prompts = promptParts(page);
    expect(prompts.length).toBe(11);
    for (const p of prompts) expect(text).toContain(p.prompt!);
  });

  it("parses links inside table cells", () => {
    expect(parseInline("a [b](https://x.y) c")).toEqual([{ text: "a " }, { text: "b", href: "https://x.y" }, { text: " c" }]);
  });
});

describe("edge routing", () => {
  const rect = (x: number, y: number) => ({ x, y, w: 200, h: 60 });

  it("routes sideways between columns and straight between a column's boxes", () => {
    const rects = { a: rect(0, 0), b: rect(400, 100), c: rect(400, 300) };
    const routed = routeEdges(rects, [
      { from: "a", to: "b", kind: "x", ends: "to" },
      { from: "b", to: "c", kind: "x", ends: "both" },
    ]);
    expect(routed[0].d.startsWith("M 200 30")).toBe(true);
    expect(routed[1].d).toBe("M 500 160 V 300");
    expect(routed[1].startArrow).toBe(true);
  });

  it("runs every edge down the left gutter when the boxes are stacked", () => {
    const rects = { a: rect(48, 0), b: rect(48, 100), c: rect(48, 200) };
    const routed = routeEdges(rects, [
      { from: "a", to: "b", kind: "x", ends: "to" },
      { from: "a", to: "c", kind: "x", ends: "to" },
    ]);
    expect(routed).toHaveLength(2);
    for (const r of routed) expect(r.d).toMatch(/^M 48 /);
  });
});

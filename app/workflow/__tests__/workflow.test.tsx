import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Workflow } from "../components/Workflow";
import { loadWorkflowPage } from "@/lib/workflow/load";
import { buildAgentText, promptParts } from "@/lib/workflow/agent-text";
import { parseReply, replyWords } from "@/lib/workflow/reply";
import { GET } from "../agent.txt/route";
import sitemap from "@/app/sitemap";

vi.mock("next/font/local", () => ({ default: () => ({ className: "font", variable: "font-var" }) }));

const page = loadWorkflowPage();
const flat = (s: string) => s.replace(/\s+/g, " ").trim();
const sectionOf = (id: string) => document.getElementById(id)!;

let writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("workflow layout", () => {
  it("renders every part with its approved paragraphs in order", () => {
    render(<Workflow page={page} />);
    const order = [
      page.mindset,
      page.treatment,
      ...page.setup.parts,
      ...page.task.parts,
      page.paste,
      page.beforeAfter,
      page.oneTask,
      page.rulesGrew,
    ];
    const ids = [...document.querySelectorAll("section.part")].map((s) => s.id);
    expect(ids).toEqual(order.map((s) => s.id));
    for (const part of [...page.setup.parts, ...page.task.parts]) {
      const text = flat(sectionOf(part.id).textContent ?? "");
      expect(sectionOf(part.id).querySelector("h3")?.textContent).toBe(part.title);
      for (const p of part.paragraphs) expect(text).toContain(flat(p));
      for (const l of part.lines ?? []) expect(text).toContain(flat(l));
    }
  });

  it("renders the three chapters and all approved section copy", () => {
    const { container } = render(<Workflow page={page} />);
    const chapters = [...document.querySelectorAll(".chapter h2")].map((h) => h.textContent);
    expect(chapters).toEqual(["Setup", "Workflow", "Examples"]);

    const text = flat(container.textContent ?? "");
    const expected = [
      page.title,
      page.line,
      page.snapshot.text,
      page.copyAll,
      ...page.mindset.paragraphs,
      ...page.treatment.paragraphs,
      ...page.paste.paragraphs,
      ...page.beforeAfter.paragraphs,
      ...page.beforeAfter.items.filter((i) => i.type === "quote").map((i) => i.text),
      ...page.oneTask.paragraphs,
      ...page.oneTask.steps.flatMap((s) => [`${s.lead} ${s.text}`, ...(s.quote ? [s.quote] : [])]),
      ...page.rulesGrew.items.flatMap((s) => [s.lead.replace(/\.$/, ""), s.text, ...(s.quote ? [s.quote] : [])]),
    ];
    for (const e of expected) expect(text).toContain(flat(e));
  });

  it("mounts the living company instrument with Setup roles and Workflow chat beats", () => {
    render(<Workflow page={page} />);
    const stage = document.querySelector(".stage")!;
    expect(stage.querySelector("#n-he")?.textContent).toContain("Aedwon");
    expect(stage.querySelector("#n-lead")?.textContent).toContain("Lead");
    expect(stage.querySelector("#n-aud")?.textContent).toContain("Auditor");
    expect(stage.querySelectorAll(".c-beat")).toHaveLength(8);
  });
});

describe("prompt blocks", () => {
  it("shows every prompt in full and copies the exact text", async () => {
    render(<Workflow page={page} />);
    for (const part of promptParts(page)) {
      const block = sectionOf(part.id).querySelector(".prompt") as HTMLElement;
      expect(block.querySelector("pre")?.textContent).toBe(part.prompt);
      fireEvent.click(within(block).getByRole("button"));
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(part.prompt));
      await within(block).findByRole("button", { name: `Copy the ${part.title} prompt` });
      expect(within(block).getByRole("button").textContent).toBe("Copied");
    }
  });

  it("copies every prompt with Copy for my agent", async () => {
    render(<Workflow page={page} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy for my agent" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toBe(buildAgentText(page));
    for (const p of promptParts(page)) expect(copied).toContain(p.prompt!);
  });
});

describe("before and after toggle", () => {
  it("renders both replies in full and switches cleanly between Before and After", async () => {
    render(<Workflow page={page} />);
    const replies = page.beforeAfter.items.filter((i) => i.type === "reply");
    const beforeBox = screen.getByRole("region", { name: "Before reply" });
    expect((beforeBox.textContent ?? "").replace(/\s+/g, "")).toBe(replyWords(replies[0].text).replace(/\s+/g, ""));
    expect(beforeBox.querySelector("h4")).not.toBeNull();
    expect(beforeBox.querySelector("ol li")).not.toBeNull();
    expect(beforeBox.querySelector("strong")).not.toBeNull();
    expect(beforeBox.querySelector("code")).not.toBeNull();
    expect(beforeBox.textContent).not.toMatch(/\*\*|###|`/);

    fireEvent.click(screen.getByRole("button", { name: "After" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "After" }).getAttribute("aria-pressed")).toBe("true"));
    const afterBox = screen.getByRole("region", { name: "After reply" });
    expect(afterBox.hidden).toBe(false);
    expect((afterBox.textContent ?? "").replace(/\s+/g, "")).toBe(replyWords(replies[1].text).replace(/\s+/g, ""));
  });
});

describe("reply reader", () => {
  it("reads headings, lists, rules, bold and code", () => {
    const blocks = parseReply("### Title\n\ntext **bold** and `code`\n\n1. one\n2. two\n\n---\n- a\n- b");
    expect(blocks.map((b) => b.t)).toEqual(["h", "p", "ol", "hr", "ul"]);
  });
});

describe("unlisted page", () => {
  it("serves every prompt as plain text", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toMatch(/^text\/plain/);
    const body = await res.text();
    for (const p of promptParts(page)) expect(body).toContain(p.prompt!);
  });

  it("tells search engines not to index it", async () => {
    const { metadata } = await import("../layout");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe("/workflow");
  });

  it("is absent from the sitemap", () => {
    expect(sitemap().some((e) => e.url.includes("/workflow"))).toBe(false);
  });
});

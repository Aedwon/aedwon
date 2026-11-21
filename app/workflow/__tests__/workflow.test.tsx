import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Workflow, tocGroups } from "../components/Workflow";
import { PROMPT_PREVIEW_LINES } from "../components/PromptBlock";
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

describe("reading layout", () => {
  it("shows every part as a section with its approved paragraphs, in the copy's order", () => {
    render(<Workflow page={page} />);
    const order = [page.mindset, page.treatment, ...page.setup.parts, ...page.task.parts, page.paste, page.beforeAfter, page.oneTask, page.rulesGrew];
    const ids = [...document.querySelectorAll("main > section")].map((s) => s.id);
    expect(ids).toEqual(order.map((s) => s.id));
    for (const part of [...page.setup.parts, ...page.task.parts]) {
      const text = flat(sectionOf(part.id).textContent ?? "");
      expect(sectionOf(part.id).querySelector("h2")?.textContent).toBe(part.title);
      for (const p of part.paragraphs) expect(text).toContain(flat(p));
      for (const l of part.lines ?? []) expect(text).toContain(flat(l));
    }
  });

  it("shows the approved text of the other sections", () => {
    const { container } = render(<Workflow page={page} />);
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
      ...page.rulesGrew.items.flatMap((s) => [`${s.lead} ${s.text}`, ...(s.quote ? [s.quote] : [])]),
    ];
    for (const e of expected) expect(text).toContain(flat(e));
  });

  it("shows both replies in full, set as the chat showed them", () => {
    render(<Workflow page={page} />);
    const replies = page.beforeAfter.items.filter((i) => i.type === "reply");
    const boxes = screen.getAllByRole("region", { name: "Reply" });
    expect(boxes).toHaveLength(2);
    boxes.forEach((box, i) => {
      expect(box.tabIndex).toBe(0);
      expect((box.textContent ?? "").replace(/\s+/g, "")).toBe(replyWords(replies[i].text).replace(/\s+/g, ""));
    });
    expect(boxes[0].querySelector("h3")).not.toBeNull();
    expect(boxes[0].querySelector("ol li")).not.toBeNull();
    expect(boxes[0].querySelector("strong")).not.toBeNull();
    expect(boxes[0].querySelector("code")).not.toBeNull();
    expect(boxes[0].textContent).not.toMatch(/\*\*|###|`/);
  });

  it("has no dropdown controls", () => {
    render(<Workflow page={page} />);
    expect(document.querySelectorAll("[aria-expanded]").length).toBe(document.querySelectorAll(".prompt-foot button").length);
    expect(document.querySelector(".chev")).toBeNull();
  });
});

describe("prompt blocks", () => {
  it("show short prompts whole and clip long ones to eight lines", () => {
    render(<Workflow page={page} />);
    for (const part of promptParts(page)) {
      const block = sectionOf(part.id).querySelector(".prompt")!;
      const shown = block.querySelector("pre")!.textContent;
      const lines = part.prompt!.split("\n");
      if (lines.length <= PROMPT_PREVIEW_LINES) {
        expect(shown).toBe(part.prompt);
        expect(block.querySelector(".prompt-foot")).toBeNull();
      } else {
        expect(shown).toBe(lines.slice(0, PROMPT_PREVIEW_LINES).join("\n"));
        expect(within(block as HTMLElement).getByRole("button", { name: "Show full prompt" })).toBeTruthy();
      }
    }
    expect(promptParts(page).some((p) => p.prompt!.split("\n").length > PROMPT_PREVIEW_LINES)).toBe(true);
  });

  it("expands in place and collapses again", () => {
    render(<Workflow page={page} />);
    const part = promptParts(page).find((p) => p.prompt!.split("\n").length > PROMPT_PREVIEW_LINES)!;
    const block = sectionOf(part.id).querySelector(".prompt") as HTMLElement;
    fireEvent.click(within(block).getByRole("button", { name: "Show full prompt" }));
    expect(block.querySelector("pre")!.textContent).toBe(part.prompt);
    const less = within(block).getByRole("button", { name: "Show less" });
    expect(less.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(less);
    expect(block.querySelector("pre")!.textContent).not.toBe(part.prompt);
  });

  it("copy the whole prompt even while it is clipped", async () => {
    render(<Workflow page={page} />);
    for (const part of promptParts(page)) {
      const block = sectionOf(part.id).querySelector(".prompt") as HTMLElement;
      fireEvent.click(within(block).getByRole("button", { name: "Copy" }));
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(part.prompt));
      await within(block).findByRole("button", { name: "Copied" });
    }
  });

  it("copy every prompt with Copy for my agent", async () => {
    render(<Workflow page={page} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy for my agent" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toBe(buildAgentText(page));
    for (const p of promptParts(page)) expect(copied).toContain(p.prompt!);
  });
});

describe("pictures link to sections", () => {
  it("makes every box a link to the section that explains it", () => {
    render(<Workflow page={page} />);
    const expected: Record<string, string> = {
      "Company policy": "company-policy",
      "Project playbook": "project-playbook",
      "The org chart": "the-org-chart",
      Codex: "codex",
      Tools: "tools",
      Aedwon: "mindset",
      Lead: "the-org-chart",
      Advisor: "the-org-chart",
      Implementation: "the-org-chart",
      Bulk: "the-org-chart",
      Auditor: "outside-audit",
    };
    const figures = document.querySelectorAll("figure.pic");
    expect(figures).toHaveLength(2);
    const links = [...figures[0].querySelectorAll("a.part")];
    expect(links.map((a) => a.querySelector(".nm")!.textContent).sort()).toEqual(Object.keys(expected).sort());
    for (const a of links) {
      const label = a.querySelector(".nm")!.textContent!;
      expect(a.getAttribute("href")).toBe(`#${expected[label]}`);
      expect(document.getElementById(expected[label])).not.toBeNull();
    }
    const taskLinks = [...figures[1].querySelectorAll("a.part")];
    expect(taskLinks).toHaveLength(page.task.parts.length);
    for (const part of page.task.parts) {
      expect(taskLinks.some((a) => a.getAttribute("href") === `#${part.id}` && a.querySelector(".nm")!.textContent === part.title)).toBe(true);
    }
    expect(figures[0].querySelector("[aria-expanded], .chev, button")).toBeNull();
  });

  it("scrolls to the section and moves focus to its heading", () => {
    render(<Workflow page={page} />);
    const link = document.querySelector('figure.pic a.part[href="#codex"]')!;
    fireEvent.click(link);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(document.activeElement).toBe(document.getElementById("codex-title"));
  });

  it("jumps at once when reduced motion is requested", () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia;
    render(<Workflow page={page} />);
    fireEvent.click(document.querySelector('figure.pic a.part[href="#tools"]')!);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    window.matchMedia = original;
  });
});

describe("contents list", () => {
  it("lists the parts in page order in groups", () => {
    const groups = tocGroups(page);
    expect(groups.map((g) => g.label)).toEqual([undefined, "Setup", "A task", "Examples"]);
    render(<Workflow page={page} />);
    const links = [...document.querySelectorAll("nav.toc a")].map((a) => a.getAttribute("href")!.slice(1));
    const sections = [...document.querySelectorAll("main > section")].map((s) => s.id);
    expect(links).toEqual(sections);
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

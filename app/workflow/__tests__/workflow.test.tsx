import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Workflow } from "../components/Workflow";
import { loadWorkflowPage } from "@/lib/workflow/load";
import { buildAgentText, promptParts } from "@/lib/workflow/agent-text";
import { GET } from "../agent.txt/route";
import sitemap from "@/app/sitemap";

vi.mock("next/font/local", () => ({ default: () => ({ className: "font", variable: "font-var" }) }));

const page = loadWorkflowPage();
const flat = (s: string) => s.replace(/\s+/g, " ").trim();

let writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});
afterEach(cleanup);

describe("workflow page", () => {
  it("shows the approved text of the always-visible sections", () => {
    const { container } = render(<Workflow page={page} />);
    const text = flat(container.textContent ?? "");
    const expected = [
      page.title,
      page.line,
      page.snapshot.text,
      page.copyAll,
      ...page.mindset.paragraphs,
      ...page.treatment.paragraphs,
      page.paste.title,
      ...page.paste.paragraphs,
      ...page.beforeAfter.paragraphs,
      ...page.beforeAfter.items.map((i) => i.text),
      ...page.oneTask.paragraphs,
      ...page.oneTask.steps.flatMap((s) => [`${s.lead} ${s.text}`, ...(s.quote ? [s.quote] : [])]),
      ...page.rulesGrew.items.flatMap((s) => [`${s.lead} ${s.text}`, ...(s.quote ? [s.quote] : [])]),
    ];
    for (const e of expected) expect(text).toContain(flat(e));
  });

  it("shows every part's paragraphs and prompt when it opens", () => {
    render(<Workflow page={page} />);
    for (const part of [...page.setup.parts, ...page.task.parts]) {
      const button = screen.getByRole("button", { name: new RegExp(`^${part.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
      if (button.getAttribute("aria-expanded") !== "true") fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("true");
      const region = screen.getByRole("region", { name: new RegExp(`^${part.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
      for (const p of part.paragraphs) expect(flat(region.textContent ?? "")).toContain(flat(p));
      for (const l of part.lines ?? []) expect(flat(region.textContent ?? "")).toContain(flat(l));
      if (part.prompt) expect(region.querySelector("pre")?.textContent).toBe(part.prompt);
    }
  });

  it("opens one part at a time in a group and closes it on a second click", () => {
    render(<Workflow page={page} />);
    const a = screen.getByRole("button", { name: /^Company policy/ });
    const b = screen.getByRole("button", { name: /^Codex/ });
    fireEvent.click(a);
    fireEvent.click(b);
    expect(a.getAttribute("aria-expanded")).toBe("false");
    expect(b.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(b);
    expect(b.getAttribute("aria-expanded")).toBe("false");
  });

  it("copies the exact prompt from each Copy button", async () => {
    render(<Workflow page={page} />);
    for (const part of promptParts(page)) {
      const button = screen.getByRole("button", { name: new RegExp(`^${part.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
      if (button.getAttribute("aria-expanded") !== "true") fireEvent.click(button);
      const region = screen.getByRole("region", { name: new RegExp(`^${part.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
      fireEvent.click(within(region).getByRole("button", { name: "Copy" }));
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(part.prompt));
      await within(region).findByRole("button", { name: "Copied" });
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

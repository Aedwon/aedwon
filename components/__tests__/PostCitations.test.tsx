import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Paras } from "../design-v3/studio/Editable";
import { LinkedText, parseSource, renderPara, splitCitations, splitUrls, isSourcesSection } from "../design-v3/citations";
import { hasHeroStage } from "../design-v3/heroStage";
import ProjectSpread from "../design-v3/ProjectSpread";
import { PROJECTS } from "../../lib/design-v3/data/projects";

describe("citations", () => {
  it("splits digit brackets only, including adjacent ones", () => {
    expect(splitCitations("a.[14] b[11][12] c [x] [1a]")).toEqual(["a.", { n: 14 }, " b", { n: 11 }, { n: 12 }, " c [x] [1a]"]);
    expect(splitCitations("plain")).toEqual(["plain"]);
  });

  it("parses a source line", () => {
    expect(parseSource("[3] Some entry. https://x.org")).toEqual({ n: 3, text: "Some entry. https://x.org" });
    expect(parseSource("No number")).toBeNull();
    expect(parseSource("[3]no space")).toBeNull();
    expect(isSourcesSection("Sources and further reading")).toBe(true);
    expect(isSourcesSection("The case")).toBe(false);
  });

  it("keeps trailing punctuation out of web addresses", () => {
    expect(splitUrls("See https://a.org/x). Then https://b.org.")).toEqual([
      { text: "See " }, { text: "https://a.org/x", url: "https://a.org/x" }, { text: "). Then " }, { text: "https://b.org", url: "https://b.org" }, { text: "." },
    ]);
    render(<LinkedText text="at https://a.org/x." />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("https://a.org/x");
  });

  it("renders raised links in body paragraphs", () => {
    const render1 = renderPara({ sources: false, style: {}, numWidth: 28, gap: 12 });
    const { container } = render(<>{render1("It was 0.19%.[14][15] Done.", 0)}</>);
    const links = container.querySelectorAll("sup.v3cite a");
    expect(links.length).toBe(2);
    expect(links[0].textContent).toBe("[14]");
    expect(links[0].getAttribute("aria-label")).toBe("Source 14");
    expect(container.textContent?.replace(/\u2060/g, "")).toBe("It was 0.19%.[14][15] Done.");
  });

  it("draws sources as rows with ids, and scrolls to the row on click", () => {
    const rows = ["[1] First https://a.org", "[2] Second"];
    const body = renderPara({ sources: false, style: {}, numWidth: 28, gap: 12 });
    const src = renderPara({ sources: true, style: {}, numWidth: 28, gap: 12 });
    const { container } = render(<div><p>{body("x[2]", 0)}</p>{rows.map((r, i) => src(r, i))}</div>);
    const row = container.querySelector("#source-2") as HTMLElement;
    expect(row).toBeTruthy();
    expect(container.querySelector("#source-1 a")?.getAttribute("href")).toBe("https://a.org");
    expect(row.textContent).toBe("[2]Second");
    const scrollIntoView = vi.fn();
    row.scrollIntoView = scrollIntoView;
    const animate = vi.fn();
    (row as unknown as { animate: unknown }).animate = animate;
    const notPrevented = fireEvent.click(screen.getByLabelText("Source 2"));
    expect(notPrevented).toBe(false); // preventDefault: the address hash stays alone
    expect(scrollIntoView).toHaveBeenCalled();
    expect(animate).toHaveBeenCalled();
  });

  it("keeps the section's paragraph offsets", () => {
    render(<Paras id="x" path="sections.0.p" items={["[5] Five", "[6] Six"]} start={4} pStyle={{}} renderPara={renderPara({ sources: true, style: {}, numWidth: 28, gap: 12 })} />);
    expect(document.getElementById("source-5")).toBeTruthy();
    expect(document.getElementById("source-6")).toBeTruthy();
  });
});

describe("post page hero", () => {
  it("drops the paper card only for posts without a real picture", () => {
    expect(hasHeroStage({ post: true })).toBe(false);
    expect(hasHeroStage({ post: true, hero: { src: "/a.webp" } })).toBe(true);
    expect(hasHeroStage({ post: false })).toBe(true);
    expect(hasHeroStage({})).toBe(true);
  });

  it("draws no paper card on a post's page, and keeps the hero elsewhere", () => {
    const post = PROJECTS.findIndex((p) => (p as unknown as { post?: boolean }).post);
    const work = PROJECTS.findIndex((p) => !(p as unknown as { post?: boolean }).post && p.media !== "paper");
    expect(post).toBeGreaterThanOrEqual(0);
    const a = render(<ProjectSpread bare open initialProject={post} />);
    expect(a.container.querySelector(".v3ps-hero")).toBeNull();
    expect(a.container.textContent).not.toMatch(/Read · /);
    a.unmount();
    const b = render(<ProjectSpread bare open initialProject={work} />);
    expect(b.container.querySelector(".v3ps-hero")).not.toBeNull();
  });
});

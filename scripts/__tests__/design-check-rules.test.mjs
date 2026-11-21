import { describe, expect, it } from "vitest";
import { RULE_IDS, contrastRatio, listExemptions, parseShadows, parseTokens, runRule, runRules } from "../design-check/rules.mjs";

// ---- fixture helpers ----

const NONE = { w: 0, style: "none", color: null };
function sides(w, style = "solid", color = [200, 200, 200, 1]) {
  return [0, 1, 2, 3].map(() => ({ w, style, color }));
}

function el(over = {}) {
  const base = {
    tag: "div",
    parent: null,
    cls: "",
    id: "",
    role: "",
    attrs: { ariaExpanded: false, ariaControls: false, ariaHaspopup: false, title: false, dataSignature: false },
    visible: true,
    ignore: "",
    textLen: 0,
    text: "",
    fontSize: 16,
    scale: 1,
    fontFamily: "Test Sans",
    mono: false,
    fontWeight: 400,
    textTransform: "none",
    letterSpacingEm: 0,
    lineHeightRatio: 1.4,
    color: [20, 20, 20, 1],
    bgOwn: null,
    bg: [[255, 255, 255, 1]],
    bgUnknown: false,
    opacity: 1,
    borders: [NONE, NONE, NONE, NONE],
    radius: 0,
    boxShadow: "",
    filter: "",
    backdropFilter: "",
    bgImage: "",
    bgImageRaw: "",
    stroke: null,
    fill: null,
    rect: { x: 0, y: 0, w: 200, h: 60 },
    display: "block",
    position: "static",
    interactive: false,
    inlineLink: false,
    inCode: false,
    inOrderedList: false,
    inNav: false,
    transitions: [],
    animations: [],
    spacing: { padding: [0, 0, 0, 0], margin: [0, 0, 0, 0], gap: [0, 0] },
    hiddenDetailChars: 0,
    childCount: 0,
    restChars: 0,
  };
  const out = { ...base, ...over };
  if (over.text !== undefined && over.textLen === undefined) out.textLen = over.text.length;
  if (out.textLen > 0 && out.restChars === 0) out.restChars = out.textLen;
  return out;
}

function view(name, elements, extra = {}) {
  const mobile = name === "mobile";
  return {
    name,
    width: mobile ? 390 : 1440,
    height: mobile ? 844 : 900,
    innerWidth: mobile ? 390 : 1440,
    innerHeight: mobile ? 844 : 900,
    scrollWidth: mobile ? 390 : 1440,
    elements,
    headings: [],
    cssRules: [],
    keyframes: [],
    settle: { settleMs: 0, infiniteRunning: [] },
    ...extra,
  };
}

function snap(elements, extra = {}, mobileExtra = {}) {
  return { url: "test", views: { desktop: view("desktop", elements, extra), mobile: view("mobile", elements, { ...extra, ...mobileExtra }) } };
}

const find = (id, s, opts) => runRule(id, s, opts);

// ---- helpers under test ----

describe("helpers", () => {
  it("computes WCAG contrast ratios", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1);
    expect(contrastRatio([119, 119, 119], [255, 255, 255])).toBeGreaterThan(4.4);
  });
  it("parses shadow layers", () => {
    const [l] = parseShadows("rgba(255, 170, 60, 0.22) 0px 12px 44px 0px");
    expect(l.blur).toBe(44);
    expect(l.color[0]).toBe(255);
  });
  it("has one rule per id and no duplicates", () => {
    expect(new Set(RULE_IDS).size).toBe(RULE_IDS.length);
    expect(RULE_IDS.length).toBeGreaterThanOrEqual(20);
  });
  it("runRules returns no findings for an empty clean page", () => {
    expect(runRules(snap([el({ tag: "p", text: "Hello there" })]))).toEqual([]);
  });
});

// ---- one failing and one passing case per rule ----

describe("contrast", () => {
  it("fails light gray text on white", () => {
    const f = find("contrast", snap([el({ tag: "p", text: "Faint", color: [170, 170, 170, 1] })]));
    expect(f.id).toBe("contrast");
    expect(f.severity).toBe("error");
    expect(f.count).toBe(1);
  });
  it("passes dark text on white, and 3 to 1 for large text", () => {
    expect(find("contrast", snap([el({ tag: "p", text: "Fine", color: [20, 20, 20, 1] })]))).toBeNull();
    expect(find("contrast", snap([el({ tag: "h1", text: "Big", fontSize: 32, color: [140, 140, 140, 1] })]))).toBeNull();
  });
  it("uses the worst gradient stop", () => {
    const e = el({ tag: "p", text: "On gradient", color: [255, 255, 255, 1], bg: [[0, 0, 0, 1], [255, 255, 255, 1]] });
    expect(find("contrast", snap([e]))).not.toBeNull();
  });
});

describe("min-text-size", () => {
  it("fails text under 12px, including scaled text at mobile", () => {
    expect(find("min-text-size", snap([el({ tag: "p", text: "Tiny", fontSize: 10 })])).count).toBeGreaterThan(0);
    const s = snap([el({ tag: "p", text: "Scaled", fontSize: 16, scale: 1 })]);
    s.views.mobile.elements = [el({ tag: "p", text: "Scaled", fontSize: 16, scale: 0.5 })];
    expect(find("min-text-size", s).examples[0]).toContain("mobile");
  });
  it("passes 12px and larger", () => {
    expect(find("min-text-size", snap([el({ tag: "p", text: "Ok", fontSize: 12 })]))).toBeNull();
  });
});

describe("budget-font-sizes", () => {
  it("fails with 11 distinct sizes, warns with 9", () => {
    const sizes = (n) => Array.from({ length: n }, (_, i) => el({ tag: "p", text: "x", fontSize: 12 + i * 3 }));
    expect(find("budget-font-sizes", snap(sizes(11))).severity).toBe("warn");
    expect(find("budget-font-sizes", snap(sizes(9))).severity).toBe("warn");
  });
  it("fails on half-pixel noise, passes on a short scale", () => {
    const noisy = [17, 17.5, 18, 18.5].map((s) => el({ tag: "p", text: "x", fontSize: s }));
    expect(find("budget-font-sizes", snap(noisy))).not.toBeNull();
    const clean = [13, 16, 20, 28, 40].map((s) => el({ tag: "p", text: "x", fontSize: s }));
    expect(find("budget-font-sizes", snap(clean))).toBeNull();
  });
});

describe("budget-font-families", () => {
  it("fails with three text families", () => {
    const els = ["A", "B", "C"].map((f) => el({ tag: "p", text: "x", fontFamily: f }));
    expect(find("budget-font-families", snap(els)).severity).toBe("warn");
  });
  it("passes with two text families and one monospace", () => {
    const els = [el({ tag: "p", text: "x", fontFamily: "A" }), el({ tag: "p", text: "x", fontFamily: "B" }), el({ tag: "p", text: "x", fontFamily: "M", mono: true })];
    expect(find("budget-font-families", snap(els))).toBeNull();
  });
});

describe("budget-radii", () => {
  const boxed = (r) => el({ radius: r, bgOwn: [240, 240, 240, 1], rect: { x: 0, y: 0, w: 300, h: 200 } });
  it("fails on radii one pixel apart", () => {
    expect(find("budget-radii", snap([boxed(12), boxed(13), boxed(14)])).severity).toBe("warn");
  });
  it("fails with nine distinct radii", () => {
    expect(find("budget-radii", snap([4, 8, 12, 16, 20, 24, 28, 32, 36].map(boxed))).severity).toBe("warn");
  });
  it("passes a short scale and ignores fully round shapes", () => {
    const round = el({ radius: 99, bgOwn: [0, 0, 0, 1], rect: { x: 0, y: 0, w: 10, h: 10 } });
    expect(find("budget-radii", snap([boxed(8), boxed(12), boxed(18), round]))).toBeNull();
  });
});

describe("budget-border-widths", () => {
  const b = (w) => el({ borders: sides(w) });
  it("fails with five widths", () => {
    expect(find("budget-border-widths", snap([0.5, 1, 1.5, 2, 3].map(b))).severity).toBe("warn");
  });
  it("passes with 1 and 2", () => {
    expect(find("budget-border-widths", snap([b(1), b(2)]))).toBeNull();
  });
});

describe("budget-shadows", () => {
  const sh = (n) => Array.from({ length: n }, (_, i) => el({ boxShadow: `rgba(0, 0, 0, 0.1) 0px ${i + 1}px 8px 0px` }));
  it("fails with six distinct shadows, warns with four", () => {
    expect(find("budget-shadows", snap(sh(6))).severity).toBe("warn");
    expect(find("budget-shadows", snap(sh(4))).severity).toBe("warn");
  });
  it("passes with three", () => {
    expect(find("budget-shadows", snap(sh(3)))).toBeNull();
  });
});

describe("accent-hues", () => {
  const colored = (c, n = 2) => Array.from({ length: n }, () => el({ tag: "p", text: "x", color: c }));
  it("fails with two accent families", () => {
    const f = find("accent-hues", snap([...colored([255, 179, 71, 1]), ...colored([94, 240, 196, 1])]));
    expect(f.severity).toBe("warn");
    expect(f.count).toBe(2);
  });
  it("passes with one accent, neutral tints and a status color", () => {
    const status = Array.from({ length: 2 }, () => el({ tag: "span", cls: "status-ok", text: "ok", color: [20, 160, 60, 1] }));
    const neutral = el({ tag: "p", text: "x", color: [244, 238, 227, 1] });
    expect(find("accent-hues", snap([...colored([11, 122, 104, 1]), neutral, ...status]))).toBeNull();
  });
  it("ignores a hue used by only one element", () => {
    expect(find("accent-hues", snap([...colored([11, 122, 104, 1]), ...colored([183, 156, 255, 1], 1)]))).toBeNull();
  });
});

describe("accent-hues with status tokens", () => {
  const tokens = parseTokens(":root{--accent:#0b7a68;--status-error:#c62828;--color-success:#2e7d32;--ink:#111111;}");
  const colored = (c) => Array.from({ length: 2 }, () => el({ tag: "p", text: "x", color: c }));
  const page = () => snap([...colored([11, 122, 104, 1]), ...colored([198, 40, 40, 1]), ...colored([46, 125, 50, 1])]);
  it("parses status colors by token name", () => {
    expect(tokens.statusColors).toEqual([[198, 40, 40], [46, 125, 50]]);
  });
  it("leaves token-defined status colors out of the accent count", () => {
    expect(find("accent-hues", page(), { tokens })).toBeNull();
  });
  it("still counts them without a token file, and says why", () => {
    const f = find("accent-hues", page());
    expect(f.severity).toBe("warn");
    expect(f.message).toContain("cannot be told apart");
  });
  it("still counts a non-status color that the token file defines", () => {
    const extra = [...page().views.desktop.elements, ...colored([183, 156, 255, 1])];
    expect(find("accent-hues", snap(extra), { tokens }).count).toBe(2);
  });
});

describe("exemptions", () => {
  const glowy = (over) => el({ boxShadow: "rgba(255, 170, 60, 0.3) 0px 18px 60px 0px", ...over });
  const page = (ignore) => [el({ ignore }), glowy({ parent: 0 }), glowy({ parent: 0 })];
  it("exempts the element and its descendants from the named rule only", () => {
    expect(find("glow", snap(page("glow")))).toBeNull();
    expect(find("glow", snap(page("contrast")))).not.toBeNull();
    const withText = [el({ ignore: "glow" }), el({ tag: "p", text: "Faint", color: [200, 200, 200, 1], parent: 0 })];
    expect(find("contrast", snap(withText))).not.toBeNull();
  });
  it("accepts several rule ids", () => {
    const els = [el({ ignore: "glow border-dashed" }), glowy({ parent: 0, borders: sides(1, "dashed") })];
    expect(find("glow", snap(els))).toBeNull();
    expect(find("border-dashed", snap(els))).toBeNull();
  });
  it("does not exempt elements outside the subtree", () => {
    const els = [el({ ignore: "glow" }), glowy({ parent: 0 }), glowy({})];
    expect(find("glow", snap(els)).count).toBe(1);
  });
  it("lists every exemption with the number of elements covered", () => {
    const { used, unknown } = listExemptions(snap(page("glow contrast")));
    expect(used.map((u) => [u.rule, u.covered])).toEqual([["glow", 3], ["contrast", 3]]);
    expect(unknown).toEqual([]);
  });
  it("makes an unknown rule id an error", () => {
    const f = runRules(snap(page("not-a-rule"))).find((x) => x.id === "exemption-unknown");
    expect(f.severity).toBe("error");
    expect(f.examples[0]).toContain("not-a-rule");
  });
  it("makes a known id produce no unknown finding", () => {
    expect(runRules(snap(page("glow"))).some((x) => x.id === "exemption-unknown")).toBe(false);
  });
});

describe("severity", () => {
  it("only the named rules can be errors", () => {
    const errors = ["contrast", "overflow-x", "eyebrow", "heading-numbering", "glow", "exemption-unknown"];
    const bad = [
      el({ tag: "p", text: "Tiny faint", fontSize: 9, fontWeight: 300, mono: true, color: [200, 200, 200, 1], borders: sides(2, "dashed"), radius: 22, interactive: true, rect: { x: 0, y: 0, w: 100, h: 44 } }),
    ];
    const s = snap(bad, { cssRules: [{ selector: ".a:hover", media: "", mediaActive: true, matches: 1, transform: "scale(1.5)" }] });
    for (const f of runRules(s)) if (f.severity === "error") expect(errors).toContain(f.id);
  });
});

describe("stylesheet rules count only when rendered", () => {
  const glowRule = (over) => ({ selector: ".card:hover", media: "", mediaActive: true, matches: 1, boxShadow: "0 0 20px rgba(255,170,60,.5)", ...over });
  it("counts a live state rule", () => {
    expect(find("glow", snap([el()], { cssRules: [glowRule({})] }))).not.toBeNull();
  });
  it("skips a rule whose selector matches nothing", () => {
    expect(find("glow", snap([el()], { cssRules: [glowRule({ matches: 0 })] }))).toBeNull();
  });
  it("skips a rule inside an inactive media query", () => {
    expect(find("glow", snap([el()], { cssRules: [glowRule({ media: "(min-width: 3000px)", mediaActive: false })] }))).toBeNull();
    const hover = { selector: ".card:hover", media: "(prefers-reduced-motion: no-preference)", mediaActive: false, matches: 1, transform: "scale(1.5)" };
    expect(find("hover-scale", snap([el()], { cssRules: [hover] }))).toBeNull();
  });
  it("budget-shadows ignores stylesheet rules", () => {
    const rules = Array.from({ length: 6 }, (_, i) => glowRule({ boxShadow: `0 ${i + 1}px 8px rgba(0,0,0,.1)` }));
    expect(find("budget-shadows", snap([el()], { cssRules: rules }))).toBeNull();
  });
});

describe("glow", () => {
  it("does not flag a zero-blur ring", () => {
    expect(find("glow", snap([el({ boxShadow: "rgba(255, 170, 60, 0.4) 0px 0px 0px 3px" })]))).toBeNull();
    const s = snap([el()], { cssRules: [{ selector: ".a:focus", media: "", mediaActive: true, matches: 1, boxShadow: "0 0 0 2px rgba(255,170,60,.6)" }] });
    expect(find("glow", s)).toBeNull();
  });
  it("fails on a colored shadow", () => {
    const f = find("glow", snap([el({ boxShadow: "rgba(255, 170, 60, 0.3) 0px 18px 60px 0px" })]));
    expect(f.severity).toBe("error");
  });
  it("fails on a colored drop-shadow filter and on a colored state rule", () => {
    expect(find("glow", snap([el({ tag: "path", filter: "drop-shadow(rgba(255, 179, 71, 0.85) 0px 0px 7px)" })]))).not.toBeNull();
    const s = snap([el()], { cssRules: [{ selector: ".node.on", media: "", matches: 1, boxShadow: "0 0 18px rgba(255,179,71,.5)" }] });
    expect(find("glow", s).examples[0]).toContain("state rule");
  });
  it("warns on a large neutral blur at rest and passes the same on a popover", () => {
    const big = "rgba(0, 0, 0, 0.1) 0px 12px 40px 0px";
    expect(find("glow", snap([el({ boxShadow: big })])).severity).toBe("warn");
    expect(find("glow", snap([el({ boxShadow: big, role: "dialog" })]))).toBeNull();
  });
  it("passes a small neutral shadow", () => {
    expect(find("glow", snap([el({ boxShadow: "rgba(0, 0, 0, 0.06) 0px 1px 2px 0px" })]))).toBeNull();
  });
});

describe("gradient-surface", () => {
  it("fails on a gradient background", () => {
    expect(find("gradient-surface", snap([el({ bgImage: "gradient", bgImageRaw: "linear-gradient(red, blue)" })])).severity).toBe("warn");
  });
  it("passes flat fills and photo backgrounds", () => {
    expect(find("gradient-surface", snap([el({ bgOwn: [10, 10, 10, 1] }), el({ bgImage: "image" })]))).toBeNull();
  });
});

describe("accent-bar", () => {
  const bar = () => el({ radius: 8, borders: [NONE, NONE, NONE, { w: 4, style: "solid", color: [255, 179, 71, 1] }] });
  it("fails on a left-bar callout", () => {
    expect(find("accent-bar", snap([bar()])).count).toBe(1);
  });
  it("passes a full 1px border", () => {
    expect(find("accent-bar", snap([el({ radius: 8, borders: sides(1) })]))).toBeNull();
  });
});

describe("border-dashed", () => {
  it("fails on a dashed border and a dotted border", () => {
    expect(find("border-dashed", snap([el({ borders: sides(1, "dashed") })])).severity).toBe("warn");
    expect(find("border-dashed", snap([el({ borders: sides(1, "dotted") })]))).not.toBeNull();
  });
  it("passes solid borders", () => {
    expect(find("border-dashed", snap([el({ borders: sides(1, "solid") })]))).toBeNull();
  });
});

describe("pill-shape", () => {
  const rect = { x: 0, y: 0, w: 160, h: 44 };
  it("fails on a pill button", () => {
    expect(find("pill-shape", snap([el({ tag: "button", text: "Copy", interactive: true, radius: 22, rect })])).severity).toBe("warn");
  });
  it("fails on a pill label with a border", () => {
    const label = el({ tag: "span", text: "Connected state", radius: 18, borders: sides(1), rect: { x: 0, y: 0, w: 140, h: 36 } });
    expect(find("pill-shape", snap([label]))).not.toBeNull();
  });
  it("passes rounded rectangles, small tags, dots and round icon buttons", () => {
    const ok = [
      el({ tag: "button", text: "Copy", interactive: true, radius: 12, rect }),
      el({ tag: "span", text: "New", radius: 10, borders: sides(1), rect: { x: 0, y: 0, w: 40, h: 20 } }),
      el({ tag: "i", radius: 6, bgOwn: [0, 0, 0, 1], rect: { x: 0, y: 0, w: 12, h: 12 } }),
      el({ tag: "button", interactive: true, radius: 23, rect: { x: 0, y: 0, w: 46, h: 46 } }),
    ];
    expect(find("pill-shape", snap(ok))).toBeNull();
  });
});

describe("eyebrow", () => {
  const heading = { index: 1, tag: "h2", text: "Pricing that makes sense", fontSize: 32, inOrderedList: false, badge: null };
  const above = (over) => ({ text: "OUR PROCESS", textLen: 11, words: 2, fontSize: 12, textTransform: "uppercase", letterSpacingEm: 0.1, gap: 8, tag: "span", cls: "", ...over });
  it("fails on a small uppercase label above a heading", () => {
    expect(find("eyebrow", snap([el()], { headings: [{ ...heading, above: above() }] })).severity).toBe("error");
  });
  it("fails on a small sentence-case label above a heading", () => {
    const a = above({ text: "How it works", textTransform: "none", letterSpacingEm: 0, fontSize: 13, words: 3, textLen: 12 });
    expect(find("eyebrow", snap([el()], { headings: [{ ...heading, above: a }] }))).not.toBeNull();
  });
  it("passes a full sentence, a far label, a body-size line, and no label", () => {
    const sentence = above({ text: "We build this carefully.", textTransform: "none", letterSpacingEm: 0, fontSize: 18, words: 4, textLen: 24 });
    const far = above({ gap: 80 });
    const body = above({ text: "Plain intro", textTransform: "none", letterSpacingEm: 0, fontSize: 18, words: 2, textLen: 11 });
    for (const a of [sentence, far, body, null]) expect(find("eyebrow", snap([el()], { headings: [{ ...heading, above: a }] }))).toBeNull();
  });
});

describe("heading-numbering", () => {
  const h = (text, over = {}) => ({ index: 0, tag: "h2", text, fontSize: 28, inOrderedList: false, badge: null, above: null, ...over });
  it("fails on a leading number, a part label, and a digits badge", () => {
    expect(find("heading-numbering", snap([el()], { headings: [h("01 Discovery")] })).severity).toBe("error");
    expect(find("heading-numbering", snap([el()], { headings: [h("Part 2 of the build")] }))).not.toBeNull();
    expect(find("heading-numbering", snap([el()], { headings: [h("Intake", { badge: { text: "3", inOrderedList: false } })] }))).not.toBeNull();
  });
  it("passes plain headings, numbers inside words, and a real ordered list", () => {
    for (const x of [h("Discovery"), h("3D renders"), h("2025 plans"), h("Step one", { inOrderedList: true }), h("Intake", { badge: { text: "3", inOrderedList: true } })]) {
      expect(find("heading-numbering", snap([el()], { headings: [x] }))).toBeNull();
    }
  });
});

describe("mono-outside-code", () => {
  it("warns on monospace body text", () => {
    expect(find("mono-outside-code", snap([el({ tag: "p", text: "A subtitle", mono: true, fontFamily: "Menlo" })])).severity).toBe("warn");
  });
  it("passes monospace inside a code block", () => {
    expect(find("mono-outside-code", snap([el({ tag: "pre", text: "npm test", mono: true, inCode: true })]))).toBeNull();
  });
});

describe("light-weight", () => {
  it("warns on weight 300", () => {
    expect(find("light-weight", snap([el({ tag: "p", text: "Thin", fontWeight: 300 })])).severity).toBe("warn");
  });
  it("passes weight 400", () => {
    expect(find("light-weight", snap([el({ tag: "p", text: "Normal" })]))).toBeNull();
  });
});

describe("infinite-animation", () => {
  const loop = { name: "pulse", duration: 1500, delay: 0, iterations: "infinite" };
  it("fails on an infinite animation", () => {
    expect(find("infinite-animation", snap([el({ animations: [loop] })])).severity).toBe("warn");
  });
  it("fails on a measured loop, and ignores a loop declared only in a hover rule", () => {
    const m = snap([el()], { settle: { settleMs: 0, infiniteRunning: [{ infinite: true, name: "bob", duration: 2000, selector: "div.card" }] } });
    expect(find("infinite-animation", m)).not.toBeNull();
    const s = snap([el()], { cssRules: [{ selector: ".dot:hover", media: "", mediaActive: true, matches: 1, animationName: "glow", animationIterationCount: "infinite" }] });
    expect(find("infinite-animation", s)).toBeNull();
  });
  it("passes a loading spinner and the one signature animation", () => {
    expect(find("infinite-animation", snap([el({ cls: "spinner", animations: [{ ...loop, name: "spin" }] })]))).toBeNull();
    const sig = el({ attrs: { dataSignature: true, ariaExpanded: false, ariaControls: false, ariaHaspopup: false, title: false }, animations: [loop] });
    expect(find("infinite-animation", snap([sig]))).toBeNull();
  });
});

describe("duration-band", () => {
  const t = (d) => ({ property: "opacity", duration: d, delay: 0, easing: "ease" });
  it("warns above 500 ms and below 70 ms", () => {
    expect(find("duration-band", snap([el({ transitions: [t(900)] })])).severity).toBe("warn");
    expect(find("duration-band", snap([el({ transitions: [t(600)] })])).severity).toBe("warn");
    expect(find("duration-band", snap([el({ transitions: [t(40)] })])).severity).toBe("warn");
  });
  it("passes 120 to 300 ms and skips the signature element", () => {
    expect(find("duration-band", snap([el({ transitions: [t(150), t(300)] })]))).toBeNull();
    const sig = el({ attrs: { dataSignature: true, ariaExpanded: false, ariaControls: false, ariaHaspopup: false, title: false }, transitions: [t(1500)] });
    expect(find("duration-band", snap([sig]))).toBeNull();
  });
  it("reads declared keyframe animations", () => {
    const s = snap([el()], { cssRules: [{ selector: ".ring", media: "", matches: 1, animationName: "ring", animationDuration: "0.9s" }] });
    expect(find("duration-band", s).severity).toBe("warn");
  });
});

describe("entrance-length", () => {
  it("fails when motion runs past 1500 ms and warns past 600 ms", () => {
    expect(find("entrance-length", snap([el()], { settle: { settleMs: 5000, infiniteRunning: [] } })).severity).toBe("warn");
    expect(find("entrance-length", snap([el()], { settle: { settleMs: 900, infiniteRunning: [] } })).severity).toBe("warn");
  });
  it("passes a quick settle", () => {
    expect(find("entrance-length", snap([el()], { settle: { settleMs: 300, infiniteRunning: [] } }))).toBeNull();
  });
});

describe("hover-scale", () => {
  const r = (selector, transform) => ({ selector, media: "", matches: 1, transform });
  it("fails on hover scale, selected scale and hover lift above 2px", () => {
    expect(find("hover-scale", snap([el()], { cssRules: [r(".card:hover", "scale(1.05)")] })).severity).toBe("warn");
    expect(find("hover-scale", snap([el()], { cssRules: [r(".node.on", "scale(1.045)")] }))).not.toBeNull();
    expect(find("hover-scale", snap([el()], { cssRules: [r(".card:hover", "translateY(-6px)")] }))).not.toBeNull();
  });
  it("passes press scale 0.97, a 2px lift, and reduced-motion rules", () => {
    expect(find("hover-scale", snap([el()], { cssRules: [r(".btn:active", "scale(0.97)"), r(".card:hover", "translateY(-2px)")] }))).toBeNull();
    expect(find("hover-scale", snap([el()], { cssRules: [{ ...r(".card:hover", "scale(1.2)"), media: "(prefers-reduced-motion: reduce)" }] }))).toBeNull();
  });
});

describe("overflow-x", () => {
  it("fails when the page scrolls sideways at 390", () => {
    const s = snap([el()], {}, { scrollWidth: 620 });
    expect(find("overflow-x", s).severity).toBe("error");
  });
  it("warns when elements run past the edge without scrolling", () => {
    const wide = el({ rect: { x: 0, y: 0, w: 600, h: 50 } });
    expect(find("overflow-x", snap([wide])).severity).toBe("warn");
  });
  it("passes a page that fits", () => {
    expect(find("overflow-x", snap([el({ rect: { x: 16, y: 0, w: 358, h: 50 } })]))).toBeNull();
  });
});

describe("target-size", () => {
  it("fails on a 16px icon button", () => {
    expect(find("target-size", snap([el({ tag: "button", interactive: true, rect: { x: 0, y: 0, w: 16, h: 16 } })])).severity).toBe("warn");
  });
  it("passes 24px and larger, and inline links", () => {
    expect(find("target-size", snap([el({ tag: "button", interactive: true, rect: { x: 0, y: 0, w: 24, h: 24 } })]))).toBeNull();
    expect(find("target-size", snap([el({ tag: "a", interactive: true, inlineLink: true, rect: { x: 0, y: 0, w: 60, h: 14 } })]))).toBeNull();
  });
});

describe("target-size-touch", () => {
  it("warns on a 40px button at phone width", () => {
    expect(find("target-size-touch", snap([el({ tag: "button", interactive: true, rect: { x: 0, y: 0, w: 120, h: 40 } })])).severity).toBe("warn");
  });
  it("passes 44px", () => {
    expect(find("target-size-touch", snap([el({ tag: "button", interactive: true, rect: { x: 0, y: 0, w: 120, h: 44 } })]))).toBeNull();
  });
});

describe("coverage", () => {
  it("every rule id has a test group in this file", () => {
    const wanted = [
      "contrast", "min-text-size", "budget-font-sizes", "budget-font-families", "budget-radii", "budget-border-widths", "budget-shadows",
      "accent-hues", "glow", "gradient-surface", "accent-bar", "border-dashed", "pill-shape", "eyebrow", "heading-numbering",
      "mono-outside-code", "light-weight", "infinite-animation", "duration-band", "entrance-length", "hover-scale", "overflow-x",
      "target-size", "target-size-touch",
    ];
    expect([...RULE_IDS].sort()).toEqual([...wanted].sort());
  });
});

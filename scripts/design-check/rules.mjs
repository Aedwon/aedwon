// Pure rules for the design check. Input is the snapshot from collect.mjs.
// No browser code here. Every rule returns a finding or null:
//   { id, severity: "error" | "warn", message, count, examples: string[] }
// Only contrast, overflow-x, eyebrow, heading-numbering, gradient-surface, glow,
// infinite-animation and an unknown exemption id are errors. Everything else warns.
// Thresholds marked "suggested" are not from a standard. See
// docs/design-principles.md for the standards and his taste.

export const THRESHOLDS = {
  contrastText: 4.5, // WCAG 2.0 AA 1.4.3
  contrastLarge: 3, // WCAG 2.0 AA 1.4.3
  largeTextPx: 24, // 18pt regular
  largeBoldPx: 18.66, // 14pt bold
  minTextPx: 12, // suggested
  fontSizesWarn: 8, // suggested
  radiiWarn: 5, // suggested
  borderWidthsWarn: 3, // suggested
  shadowsWarn: 3, // suggested
  maxNonMonoFamilies: 2, // suggested
  maxMonoFamilies: 1, // suggested
  glowBlurPx: 24, // suggested
  chromaMin: 0.12, // suggested: below this a color counts as neutral
  hueSpread: 30, // suggested cluster width in degrees
  durationWarnMs: 500, // NN/G ceiling
  durationFloorMs: 70, // Carbon's shortest token
  entranceWarnMs: 600, // suggested
  targetMinPx: 24, // WCAG 2.2 2.5.8
  targetTouchPx: 44, // Apple HIG default, suggested as a floor on touch
  hoverScaleMax: 1.02, // suggested
  hoverTranslateMaxPx: 2, // suggested
  eyebrowMaxWords: 5, // suggested
  eyebrowMaxChars: 40, // suggested
  eyebrowGapPx: 32, // suggested
  lightWeight: 400, // Apple HIG: avoid light weights
  radiusNearPx: 1, // suggested: two radii this close are not a deliberate scale
  radiusNearPairsError: 2, // suggested
  fontNearPx: 0.5, // suggested: half-pixel sizes next to each other are not a scale
  fontNearPairsWarn: 2, // suggested
};

function nearPairs(sortedValues, gap) {
  let n = 0;
  for (let i = 1; i < sortedValues.length; i++) if (sortedValues[i] - sortedValues[i - 1] <= gap) n++;
  return n;
}

// ---------- helpers ----------

export function luminance([r, g, b]) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

function over(top, base) {
  const ta = top[3] ?? 1;
  const ba = base[3] ?? 1;
  const a = ta + ba * (1 - ta);
  if (a === 0) return [0, 0, 0, 0];
  const mix = (i) => (top[i] * ta + base[i] * ba * (1 - ta)) / a;
  return [mix(0), mix(1), mix(2), a];
}

function chroma(c) {
  return (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;
}

export function hueOf([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

function isChromatic(c, min = THRESHOLDS.chromaMin) {
  return !!c && (c[3] ?? 1) >= 0.03 && chroma(c) >= min;
}

function view(snapshot, name) {
  return snapshot.views && snapshot.views[name];
}

function desktop(snapshot) {
  return view(snapshot, "desktop") || Object.values(snapshot.views || {})[0];
}

function describe(e, extra) {
  const cls = (e.cls || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).join(".");
  const base = `${e.tag}${cls ? "." + cls : ""}`;
  const text = e.text ? ` "${e.text.slice(0, 28)}"` : "";
  return `${base}${text}${extra ? " " + extra : ""}`;
}

function finding(id, severity, message, items, examplesFn) {
  if (!items || items.length === 0) return null;
  const examples = (examplesFn ? items.map(examplesFn) : items.map(String)).slice(0, 3);
  return { id, severity, message, count: items.length, examples };
}

function cssSize(v, e) {
  const s = (e.pseudoOf !== undefined && v.elements[e.pseudoOf] ? v.elements[e.pseudoOf].scale : e.scale) || 1;
  return { w: e.rect.w / s, h: e.rect.h / s, scale: s };
}

function renderedFont(v, e) {
  const s = (e.pseudoOf !== undefined && v.elements[e.pseudoOf] ? v.elements[e.pseudoOf].scale : e.scale) || 1;
  return e.fontSize * s;
}

function textEls(v) {
  return v.elements.filter((e) => e.visible && e.textLen > 0 && /\S/.test(e.text));
}

function splitTop(s) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of s || "") {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function parseColorString(str) {
  if (!str) return null;
  const rgb = str.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const p = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (p.length >= 3 && !p.some(Number.isNaN)) return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  const hex = str.match(/#([0-9a-f]{3,8})\b/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    if (h.length === 6 || h.length === 8) {
      const n = (i) => parseInt(h.slice(i, i + 2), 16);
      return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
    }
  }
  return null;
}

// Parses one box-shadow or drop-shadow layer into numbers and a color.
export function parseShadowLayer(layer) {
  const color = parseColorString(layer);
  const inset = /\binset\b/.test(layer);
  const stripped = layer.replace(/rgba?\([^)]*\)/g, " ").replace(/#[0-9a-f]{3,8}\b/gi, " ");
  const nums = (stripped.match(/-?\d*\.?\d+(?:px)?/g) || []).map(parseFloat);
  const [x = 0, y = 0, blur = 0, spread = 0] = nums;
  return { x, y, blur, spread, color, inset };
}

export function parseShadows(value) {
  if (!value) return [];
  return splitTop(value).map(parseShadowLayer);
}

function dropShadows(filter) {
  const out = [];
  const re = /drop-shadow\(((?:[^()]|\([^)]*\))*)\)/g;
  let m;
  while ((m = re.exec(filter || ""))) out.push(parseShadowLayer(m[1]));
  return out;
}

const STATUS_RE = /(^|[\s_-])(success|error|danger|warning|warn|status|valid|invalid|ok|fail|failed|alert|positive|negative|destructive)([\s_-]|$)/i;

// Stylesheet rules count only when their selector matches something on the page
// (state classes such as .on are ignored when matching) and their media query is active.
function liveCss(v) {
  return (v.cssRules || []).filter((r) => r.mediaActive !== false && r.matches > 0);
}

function isFloating(e) {
  if (e.position === "fixed") return true;
  if (["dialog", "tooltip", "menu", "listbox", "alertdialog"].includes(e.role)) return true;
  return /(popover|dropdown|modal|dialog|tooltip|menu|floating|toast)/i.test(e.cls || "");
}

function isFullRadius(e, v) {
  const { w, h } = cssSize(v, e);
  const m = Math.min(w, h);
  return m > 0 && e.radius >= m / 2 - 0.5;
}

function hasPaint(e) {
  const border = (e.borders || []).some((b) => b.w > 0 && b.style !== "none" && (b.color ? b.color[3] > 0 : true));
  return border || (e.bgOwn && e.bgOwn[3] > 0.02) || !!e.bgImage || !!e.boxShadow;
}

// ---------- rules ----------

const rules = [];
function rule(id, fn) {
  rules.push({ id, run: fn });
}

rule("contrast", (snap) => {
  const v = desktop(snap);
  const bad = [];
  for (const e of textEls(v)) {
    if (e.bgUnknown || !e.bg || e.bg.length === 0) continue;
    const large = e.fontSize >= THRESHOLDS.largeTextPx || (e.fontSize >= THRESHOLDS.largeBoldPx && e.fontWeight >= 700);
    const need = large ? THRESHOLDS.contrastLarge : THRESHOLDS.contrastText;
    const textColor = [e.color[0], e.color[1], e.color[2], (e.color[3] ?? 1) * (e.opacity ?? 1)];
    let worst = Infinity;
    for (const bg of e.bg) {
      const flat = over(textColor, [bg[0], bg[1], bg[2], 1]);
      worst = Math.min(worst, contrastRatio(flat, bg));
    }
    if (worst < need) bad.push({ e, ratio: worst, need });
  }
  return finding("contrast", "error", "Text below WCAG 2.0 AA contrast (4.5 to 1, or 3 to 1 for large text).", bad, (b) =>
    describe(b.e, `${b.ratio.toFixed(2)}:1, needs ${b.need}:1`),
  );
});

rule("min-text-size", (snap) => {
  const bad = [];
  for (const v of Object.values(snap.views)) {
    for (const e of textEls(v)) {
      if (e.inCode && e.fontSize >= 11) continue;
      const size = renderedFont(v, e);
      if (size < THRESHOLDS.minTextPx) bad.push({ e, size, vp: v.name });
    }
  }
  return finding("min-text-size", "warn", `Text smaller than ${THRESHOLDS.minTextPx}px as rendered.`, bad, (b) =>
    describe(b.e, `${b.size.toFixed(1)}px at ${b.vp}`),
  );
});

rule("budget-font-sizes", (snap) => {
  const v = desktop(snap);
  const sizes = new Map();
  for (const e of textEls(v)) {
    const k = Math.round(e.fontSize * 10) / 10;
    sizes.set(k, (sizes.get(k) || 0) + 1);
  }
  const n = sizes.size;
  const list = [...sizes.keys()].sort((a, b) => a - b);
  const pairs = nearPairs(list, THRESHOLDS.fontNearPx);
  const tooMany = n > THRESHOLDS.fontSizesWarn;
  const noisy = pairs >= THRESHOLDS.fontNearPairsWarn;
  if (!tooMany && !noisy) return null;
  return {
    id: "budget-font-sizes",
    severity: "warn",
    message: `${n} distinct font sizes, ${pairs} pairs within ${THRESHOLDS.fontNearPx}px of each other. Budget is ${THRESHOLDS.fontSizesWarn} sizes.`,
    count: n,
    examples: [list.join(", ") + " px"],
  };
});

rule("budget-font-families", (snap) => {
  const v = desktop(snap);
  const plain = new Set();
  const mono = new Set();
  for (const e of textEls(v)) (e.mono ? mono : plain).add(e.fontFamily);
  const over = plain.size > THRESHOLDS.maxNonMonoFamilies || mono.size > THRESHOLDS.maxMonoFamilies;
  if (!over) return null;
  return {
    id: "budget-font-families",
    severity: "warn",
    message: `${plain.size} text families and ${mono.size} monospace. Budget is ${THRESHOLDS.maxNonMonoFamilies} and ${THRESHOLDS.maxMonoFamilies}.`,
    count: plain.size + mono.size,
    examples: [[...plain, ...mono].join(", ")],
  };
});

rule("budget-radii", (snap) => {
  const v = desktop(snap);
  const set = new Map();
  for (const e of v.elements) {
    if (!e.visible || e.radius <= 0 || !hasPaint(e)) continue;
    // Circles and "infinite" radii (99px and up) are one shape. A pill built from a height-sized radius counts as its own value.
    const { w, h } = cssSize(v, e);
    if (e.radius >= 99 || (isFullRadius(e, v) && Math.abs(w - h) <= 2)) continue;
    const k = Math.round(e.radius);
    set.set(k, (set.get(k) || 0) + 1);
  }
  const n = set.size;
  const list = [...set.keys()].sort((a, b) => a - b);
  const pairs = nearPairs(list, THRESHOLDS.radiusNearPx);
  const noisy = pairs >= THRESHOLDS.radiusNearPairsError;
  if (n <= THRESHOLDS.radiiWarn && !noisy) return null;
  return {
    id: "budget-radii",
    severity: "warn",
    message: `${n} distinct corner radii, not counting fully round shapes, and ${pairs} pairs only ${THRESHOLDS.radiusNearPx}px apart. Budget is ${THRESHOLDS.radiiWarn}.`,
    count: n,
    examples: [list.join(", ") + " px"],
  };
});

rule("budget-border-widths", (snap) => {
  const v = desktop(snap);
  const set = new Set();
  for (const e of v.elements) {
    if (!e.visible) continue;
    for (const b of e.borders || []) if (b.w > 0 && b.style !== "none") set.add(Math.round(b.w * 100) / 100);
  }
  const n = set.size;
  if (n <= THRESHOLDS.borderWidthsWarn) return null;
  return {
    id: "budget-border-widths",
    severity: "warn",
    message: `${n} distinct border widths. Budget is ${THRESHOLDS.borderWidthsWarn}.`,
    count: n,
    examples: [[...set].sort((a, b) => a - b).join(", ") + " px"],
  };
});

rule("budget-shadows", (snap) => {
  const v = desktop(snap);
  const set = new Set();
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  for (const e of v.elements) {
    if (!e.visible) continue;
    if (e.boxShadow) set.add(norm(e.boxShadow));
    for (const d of dropShadows(e.filter)) set.add("drop:" + JSON.stringify(d));
  }
  const n = set.size;
  if (n <= THRESHOLDS.shadowsWarn) return null;
  return {
    id: "budget-shadows",
    severity: "warn",
    message: `${n} distinct shadows on rendered elements. Budget is ${THRESHOLDS.shadowsWarn}.`,
    count: n,
    examples: [...set].slice(0, 3).map((s) => (s.length > 70 ? s.slice(0, 70) + "..." : s)),
  };
});

rule("accent-hues", (snap, opts) => {
  const statusTokens = (opts && opts.tokens && opts.tokens.statusColors) || [];
  const hasTokens = !!(opts && opts.tokens);
  const v = desktop(snap);
  const entries = [];
  const add = (c, e) => {
    if (!c || (c[3] ?? 1) < 0.05 || chroma(c) < THRESHOLDS.chromaMin) return;
    if (statusTokens.some((t) => Math.abs(t[0] - c[0]) <= 2 && Math.abs(t[1] - c[1]) <= 2 && Math.abs(t[2] - c[2]) <= 2)) return;
    entries.push({ hue: hueOf(c), rgb: c, e });
  };
  for (const e of v.elements) {
    if (!e.visible || e.inCode) continue;
    if (STATUS_RE.test(e.cls || "") || STATUS_RE.test(e.id || "")) continue;
    if (e.textLen > 0) add(e.color, e);
    add(e.bgOwn, e);
    for (const b of e.borders || []) if (b.w > 0 && b.style !== "none") add(b.color, e);
    add(e.stroke, e);
    if (e.tag !== "svg") add(e.fill, e);
  }
  entries.sort((a, b) => a.hue - b.hue);
  const clusters = [];
  for (const en of entries) {
    const last = clusters[clusters.length - 1];
    if (last && en.hue - last.start <= THRESHOLDS.hueSpread) {
      last.items.push(en);
      last.end = en.hue;
    } else clusters.push({ start: en.hue, end: en.hue, items: [en] });
  }
  if (clusters.length > 1) {
    const first = clusters[0];
    const last = clusters[clusters.length - 1];
    if (first.start + 360 - last.end <= THRESHOLDS.hueSpread) {
      last.items.push(...first.items);
      clusters.shift();
    }
  }
  const real = clusters.filter((c) => new Set(c.items.map((i) => i.e)).size >= 2);
  if (real.length <= 1) return null;
  real.sort((a, b) => b.items.length - a.items.length);
  const note = hasTokens
    ? " Colors defined under status-like token names are left out."
    : " Without a token file (--tokens), status colors cannot be told apart from accents, so only status-like class names are skipped.";
  return finding(
    "accent-hues",
    "warn",
    `${real.length} chromatic hue families outside status colors. His projects use one accent, or none.${note}`,
    real,
    (c) => {
      const rep = c.items[0].rgb.slice(0, 3).map(Math.round).join(",");
      return `hue ${Math.round(c.start)}deg to ${Math.round(c.end)}deg, ${new Set(c.items.map((i) => i.e)).size} elements, e.g. rgb(${rep})`;
    },
  );
});

rule("glow", (snap) => {
  const v = desktop(snap);
  const items = [];
  for (const e of v.elements) {
    if (!e.visible) continue;
    const layers = [...parseShadows(e.boxShadow), ...dropShadows(e.filter)];
    for (const l of layers) {
      if (l.inset || l.blur === 0) continue; // zero blur is a ring, not a glow
      const chromatic = isChromatic(l.color);
      const bigResting = !chromatic && l.blur >= THRESHOLDS.glowBlurPx && !isFloating(e);
      if (chromatic) items.push({ where: "at rest", what: describe(e, `shadow ${l.blur}px blur, rgb(${l.color.slice(0, 3).map(Math.round)})`), severity: "error" });
      else if (bigResting) items.push({ where: "at rest", what: describe(e, `${l.blur}px blur shadow on a resting element`), severity: "warn" });
    }
  }
  for (const r of liveCss(v)) {
    const values = [r.boxShadow, r.filter].filter(Boolean);
    for (const val of values) {
      const layers = [...parseShadows(r.boxShadow === val ? val : ""), ...dropShadows(r.filter === val ? val : "")];
      if (layers.some((l) => !l.inset && l.blur > 0 && isChromatic(l.color))) {
        items.push({ where: "in a state rule", what: `${r.selector} ${val.slice(0, 50)}`, severity: "error" });
        break;
      }
    }
  }
  if (!items.length) return null;
  const errors = items.filter((i) => i.severity === "error");
  return {
    id: "glow",
    severity: errors.length ? "error" : "warn",
    message: "Colored glow, or a large blur on a resting element. His shadows are neutral and only on things that float.",
    count: items.length,
    examples: items.slice(0, 3).map((i) => `${i.what} (${i.where})`),
  };
});

rule("gradient-surface", (snap) => {
  const v = desktop(snap);
  const els = v.elements.filter((e) => e.visible && e.bgImage === "gradient");
  const items = els.length
    ? els.map((e) => describe(e, e.bgImageRaw.slice(0, 40)))
    : liveCss(v).filter((r) => /gradient/.test(r.backgroundImage || "")).map((r) => `${r.selector} ${r.backgroundImage.slice(0, 40)}`);
  return finding("gradient-surface", "error", "Gradient used as a surface or wash. His projects use flat fills.", items);
});

function isAccentBar(e) {
  const sides = e.borders || [];
  const on = sides.filter((b) => b.w >= 2 && b.style !== "none");
  const off = sides.filter((b) => b.w === 0 || b.style === "none");
  return on.length === 1 && off.length === 3 && e.radius > 0;
}

rule("accent-bar", (snap) => {
  const v = desktop(snap);
  const bad = v.elements.filter((e) => e.visible && isAccentBar(e));
  return finding("accent-bar", "warn", "Colored bar on one edge of a rounded block (the left-border callout).", bad, (e) => describe(e));
});

rule("border-dashed", (snap) => {
  const v = desktop(snap);
  const bad = v.elements.filter(
    (e) =>
      e.visible &&
      !["path", "line", "circle", "rect", "polyline", "polygon", "svg"].includes(e.tag) &&
      (e.borders || []).some((b) => b.w > 0 && (b.style === "dashed" || b.style === "dotted")),
  );
  return finding("border-dashed", "warn", "Dashed or dotted border. His interface borders are solid.", bad, (e) => describe(e));
});

rule("pill-shape", (snap) => {
  const v = desktop(snap);
  const bad = [];
  for (const e of v.elements) {
    if (!e.visible || e.radius <= 0 || e.pseudoOf !== undefined) continue;
    if (["input", "select", "textarea"].includes(e.tag) || ["switch", "checkbox", "radio"].includes(e.role)) continue;
    if (!isFullRadius(e, v)) continue;
    const { w, h } = cssSize(v, e);
    const roundish = Math.abs(w - h) <= 2;
    const hasText = e.textLen > 0;
    const button = e.interactive;
    const label = !button && hasText && hasPaint(e);
    if (!button && !label) continue;
    if (roundish && (!hasText || w <= 40)) continue; // dot, avatar, icon button, number badge
    if (label && h <= 24) continue; // small tag
    bad.push({ e, w, h });
  }
  return finding("pill-shape", "warn", "Pill-shaped button or label (radius of half the height or more).", bad, (b) =>
    describe(b.e, `${Math.round(b.w)}x${Math.round(b.h)}, radius ${b.e.radius}`),
  );
});

rule("eyebrow", (snap) => {
  const v = desktop(snap);
  const bad = [];
  for (const h of v.headings || []) {
    const a = h.above;
    if (!a) continue;
    if (a.words > THRESHOLDS.eyebrowMaxWords || a.textLen > THRESHOLDS.eyebrowMaxChars) continue;
    if (/[.?!]$/.test(a.text.trim())) continue;
    if (a.gap > THRESHOLDS.eyebrowGapPx) continue;
    const upper = a.textTransform === "uppercase" || (/[A-Z]{4,}/.test(a.text) && a.text === a.text.toUpperCase());
    const spaced = a.letterSpacingEm >= 0.06;
    const small = a.fontSize <= 15 && a.fontSize < h.fontSize * 0.75;
    if (upper || spaced || small) bad.push({ h, a });
  }
  return finding("eyebrow", "error", "Short small, uppercase or spaced label placed directly above a heading.", bad, (b) => `"${b.a.text}" above "${b.h.text.slice(0, 30)}"`);
});

const NUMBERED_RE = /^\s*(?:\(?0?\d{1,2}[.):\-–]\s*\S|0\d\s+\S|\d{1,2}\s*\/\s*\d{1,2}\b|(?:part|section|chapter|step|phase)\s+\d+\b|[IVX]{1,4}[.)]\s+\S)/i;

rule("heading-numbering", (snap) => {
  const v = desktop(snap);
  const bad = [];
  for (const h of v.headings || []) {
    if (h.inOrderedList) continue;
    if (NUMBERED_RE.test(h.text)) bad.push({ h, why: "starts with a number" });
    else if (h.badge && !h.badge.inOrderedList) bad.push({ h, why: `digits badge "${h.badge.text}" beside it` });
  }
  return finding("heading-numbering", "error", "Numbered heading or part title outside a real ordered list.", bad, (b) => `"${b.h.text.slice(0, 30)}" (${b.why})`);
});

rule("mono-outside-code", (snap) => {
  const v = desktop(snap);
  const bad = textEls(v).filter((e) => e.mono && !e.inCode);
  return finding("mono-outside-code", "warn", "Monospace text outside code or prompt blocks.", bad, (e) => describe(e, e.fontFamily));
});

rule("light-weight", (snap) => {
  const v = desktop(snap);
  const bad = textEls(v).filter((e) => e.fontWeight < THRESHOLDS.lightWeight);
  return finding("light-weight", "warn", "Font weight below 400. Apple HIG says to avoid light weights.", bad, (e) => describe(e, `weight ${e.fontWeight}`));
});

function signatureName(snap) {
  // One named signature animation is allowed.
  const v = desktop(snap);
  const names = new Set();
  for (const e of v.elements) if (e.attrs && e.attrs.dataSignature) for (const a of e.animations) names.add(a.name);
  for (const r of liveCss(v)) if (/\.signature\b|\[data-signature\]/.test(r.selector) && r.animationName) names.add(r.animationName);
  return names;
}

rule("infinite-animation", (snap) => {
  const v = desktop(snap);
  const sig = signatureName(snap);
  const loading = /(spin|load|skeleton|progress)/i;
  const found = new Map();
  for (const e of v.elements) {
    for (const a of e.animations) {
      if (a.iterations === "infinite" && !sig.has(a.name) && !loading.test(e.cls || "") && !loading.test(a.name)) found.set(a.name, describe(e, a.name));
    }
  }
  // Loops declared only in hover or state rules are not running at rest, so they are not counted.
  for (const i of (v.settle && v.settle.infiniteRunning) || []) {
    if (!sig.has(i.name) && !loading.test(i.selector || "") && !loading.test(i.name || "") && !/signature/.test(i.selector || "")) found.set(i.name || i.selector, `${i.selector} ${i.name}`);
  }
  const items = [...found.values()];
  return finding("infinite-animation", "error", "Animation that loops forever, outside a loading state and the one allowed signature animation.", items);
});

rule("duration-band", (snap) => {
  const v = desktop(snap);
  const sig = signatureName(snap);
  const items = [];
  for (const e of v.elements) {
    if (e.attrs && e.attrs.dataSignature) continue;
    for (const t of e.transitions) items.push({ d: t.duration, what: describe(e, `transition ${t.property} ${t.duration}ms`) });
    for (const a of e.animations) if (!sig.has(a.name) && a.iterations !== "infinite") items.push({ d: a.duration, what: describe(e, `animation ${a.name} ${a.duration}ms`) });
  }
  for (const r of liveCss(v)) {
    if (!r.animationDuration || /\.signature\b|\[data-signature\]/.test(r.selector)) continue;
    for (const d of r.animationDuration.split(",")) {
      const ms = d.trim().endsWith("ms") ? parseFloat(d) : parseFloat(d) * 1000;
      if (ms > 0) items.push({ d: ms, what: `${r.selector} animation ${r.animationName || ""} ${ms}ms` });
    }
  }
  const seen = new Set();
  const uniq = items.filter((i) => (seen.has(i.what) ? false : seen.add(i.what)));
  const tooLong = uniq.filter((i) => i.d > THRESHOLDS.durationWarnMs).sort((a, b) => b.d - a.d);
  const tooShort = uniq.filter((i) => i.d > 0 && i.d < THRESHOLDS.durationFloorMs);
  const all = [...tooLong, ...tooShort];
  if (!all.length) return null;
  return {
    id: "duration-band",
    severity: "warn",
    message: `Motion outside ${THRESHOLDS.durationFloorMs} to ${THRESHOLDS.durationWarnMs} ms. His UI motion is 120 to 300 ms.`,
    count: all.length,
    examples: all.slice(0, 3).map((i) => i.what),
  };
});

rule("entrance-length", (snap) => {
  const v = desktop(snap);
  const ms = (v.settle && v.settle.settleMs) || 0;
  if (ms <= THRESHOLDS.entranceWarnMs) return null;
  return {
    id: "entrance-length",
    severity: "warn",
    message: `Page motion kept running for ${ms} ms after load (measured up to 6000 ms). Budget is ${THRESHOLDS.entranceWarnMs} ms.`,
    count: 1,
    examples: [`${ms} ms`],
  };
});

function scaleOf(transform) {
  const out = [];
  const re = /scale(?:3d)?\(\s*([\d.]+)(?:\s*,\s*([\d.]+))?/g;
  let m;
  while ((m = re.exec(transform || ""))) {
    out.push(parseFloat(m[1]));
    if (m[2]) out.push(parseFloat(m[2]));
  }
  const s = /scale([XY])\(\s*([\d.]+)/g;
  while ((m = s.exec(transform || ""))) out.push(parseFloat(m[2]));
  return out;
}

function translateOf(transform) {
  const out = [];
  const re = /translate(?:[XY]|3d)?\(\s*(-?[\d.]+)px(?:\s*,\s*(-?[\d.]+)px)?/g;
  let m;
  while ((m = re.exec(transform || ""))) {
    out.push(Math.abs(parseFloat(m[1])));
    if (m[2]) out.push(Math.abs(parseFloat(m[2])));
  }
  return out;
}

const STATE_SELECTOR_RE = /:hover|:focus|:active|\.(on|active|selected|current|focused|is-active|open)\b/;

rule("hover-scale", (snap) => {
  const v = desktop(snap);
  const bad = [];
  for (const r of liveCss(v)) {
    if (!STATE_SELECTOR_RE.test(r.selector)) continue;
    if (/prefers-reduced-motion/.test(r.media || "")) continue;
    const t = `${r.transform || ""} ${r.scale ? "scale(" + r.scale.split(" ")[0] + ")" : ""}`;
    const scales = scaleOf(t).filter((s) => s > THRESHOLDS.hoverScaleMax);
    const moves = /:hover|:focus|:active/.test(r.selector) ? translateOf(t).filter((n) => n > THRESHOLDS.hoverTranslateMaxPx) : [];
    if (scales.length || moves.length) bad.push({ r, what: scales.length ? `scale ${Math.max(...scales)}` : `move ${Math.max(...moves)}px` });
  }
  return finding("hover-scale", "warn", "Hover, focus or selected state that scales parts above 1.02 or moves them more than 2px.", bad, (b) => `${b.r.selector} (${b.what})`);
});

rule("overflow-x", (snap) => {
  const m = view(snap, "mobile");
  if (!m) return null;
  if (m.scrollWidth > m.innerWidth + 1) {
    return { id: "overflow-x", severity: "error", message: `Page scrolls sideways at ${m.innerWidth}px wide.`, count: 1, examples: [`scroll width ${m.scrollWidth}px`] };
  }
  const wide = m.elements.filter((e) => e.visible && e.pseudoOf === undefined && e.rect.x + e.rect.w > m.innerWidth + 8 && e.rect.x < m.innerWidth);
  return finding("overflow-x", "warn", `Elements run past the right edge at ${m.innerWidth}px wide (the page may clip them).`, wide, (e) =>
    describe(e, `right edge ${Math.round(e.rect.x + e.rect.w)}px`),
  );
});

function targets(v) {
  return v.elements.filter((e) => e.visible && e.interactive && e.pseudoOf === undefined && !e.inlineLink && e.rect.x < v.innerWidth);
}

rule("target-size", (snap) => {
  const bad = [];
  for (const v of Object.values(snap.views)) {
    for (const e of targets(v)) {
      if (e.rect.w < THRESHOLDS.targetMinPx || e.rect.h < THRESHOLDS.targetMinPx) bad.push({ e, v });
    }
  }
  return finding("target-size", "warn", `Interactive target under ${THRESHOLDS.targetMinPx} by ${THRESHOLDS.targetMinPx} px as rendered (WCAG 2.2 2.5.8).`, bad, (b) =>
    describe(b.e, `${Math.round(b.e.rect.w)}x${Math.round(b.e.rect.h)} at ${b.v.name}`),
  );
});

rule("target-size-touch", (snap) => {
  const m = view(snap, "mobile");
  if (!m) return null;
  const bad = targets(m).filter((e) => e.rect.w >= THRESHOLDS.targetMinPx && e.rect.h >= THRESHOLDS.targetMinPx && (e.rect.w < THRESHOLDS.targetTouchPx || e.rect.h < THRESHOLDS.targetTouchPx));
  return finding("target-size-touch", "warn", `Interactive target under ${THRESHOLDS.targetTouchPx} by ${THRESHOLDS.targetTouchPx} px on the phone layout (suggested floor).`, bad, (e) =>
    describe(e, `${Math.round(e.rect.w)}x${Math.round(e.rect.h)}`),
  );
});

// ---------- tokens ----------

const STATUS_TOKEN_RE = /status|success|warn|danger|error|done|progress|failed/i;

export function parseTokens(cssText) {
  const css = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const colors = [];
  const statusColors = [];
  const re = /--([\w-]+)\s*:\s*([^;}]+)/g;
  let m;
  while ((m = re.exec(css))) {
    const name = m[1];
    const value = m[2].trim();
    let color = null;
    if (/^(#|rgb)/i.test(value)) color = parseColorString(value);
    const hsl = value.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i);
    if (hsl) {
      const h = parseFloat(hsl[1]) / 360;
      const sat = parseFloat(hsl[2]) / 100;
      const l = parseFloat(hsl[3]) / 100;
      const f = (n) => {
        const k = (n + h * 12) % 12;
        const a = sat * Math.min(l, 1 - l);
        return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
      };
      color = [f(0), f(8), f(4)];
    }
    if (!color) continue;
    colors.push(color.slice(0, 3));
    if (STATUS_TOKEN_RE.test(name)) statusColors.push(color.slice(0, 3));
  }
  return { colors, statusColors };
}

// ---------- exemptions ----------

export const IGNORE_ATTR = "data-design-check-ignore";

function ignoreIds(e) {
  return (e.ignore || "").split(/\s+/).filter(Boolean);
}

// Returns the indices of every element at or below `index`.
function subtreeOf(v, index) {
  const covered = [];
  v.elements.forEach((e, i) => {
    let p = i;
    while (p !== null && p !== undefined) {
      if (p === index) {
        covered.push(i);
        return;
      }
      p = v.elements[p].parent;
    }
  });
  return covered;
}

// Lists every exemption on the page: rule id, element and how many elements it covers.
export function listExemptions(snapshot) {
  const v = desktop(snapshot);
  const used = [];
  const unknown = [];
  if (!v) return { used, unknown };
  v.elements.forEach((e, i) => {
    for (const id of ignoreIds(e)) {
      if (!RULE_IDS.includes(id)) unknown.push({ rule: id, element: describe(e) });
      else used.push({ rule: id, element: describe(e), covered: subtreeOf(v, i).length, index: i });
    }
  });
  return { used, unknown };
}

function withoutIgnored(snapshot, ruleId) {
  const views = {};
  let any = false;
  for (const [name, v] of Object.entries(snapshot.views)) {
    const excluded = new Set();
    v.elements.forEach((e, i) => {
      if (ignoreIds(e).includes(ruleId)) {
        any = true;
        for (const j of subtreeOf(v, i)) excluded.add(j);
      }
    });
    if (!excluded.size) {
      views[name] = v;
      continue;
    }
    views[name] = {
      ...v,
      elements: v.elements.map((e, i) => (excluded.has(i) ? { ...e, visible: false, interactive: false } : e)),
      headings: (v.headings || []).filter((h) => !excluded.has(h.index)),
    };
  }
  return any ? { ...snapshot, views } : snapshot;
}

// ---------- runner ----------

export const RULE_IDS = rules.map((r) => r.id);

export function runRules(snapshot, options = {}) {
  const findings = [];
  for (const r of rules) {
    const f = r.run(withoutIgnored(snapshot, r.id), options);
    if (f) findings.push(f);
  }
  const { unknown } = listExemptions(snapshot);
  const bad = finding("exemption-unknown", "error", `An ${IGNORE_ATTR} names a rule id that does not exist.`, unknown, (u) => `${u.element} names "${u.rule}"`);
  if (bad) findings.push(bad);
  return findings;
}

export function runRule(id, snapshot, options = {}) {
  const r = rules.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown rule ${id}`);
  return r.run(withoutIgnored(snapshot, id), options);
}

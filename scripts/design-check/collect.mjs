// Opens a page with playwright-core at two viewports and returns a plain JSON
// snapshot. All measuring happens in the browser. Judging lives in rules.mjs.
import { chromium } from "playwright-core";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

export function toUrl(input) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(input)) return input;
  return pathToFileURL(path.resolve(input)).href;
}

// Runs inside the page. Must be self-contained (serialized by Playwright).
function measurePage() {
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "HEAD", "META", "LINK", "TITLE", "BR", "WBR", "DEFS", "CLIPPATH", "MASK", "LINEARGRADIENT", "RADIALGRADIENT", "STOP", "SYMBOL"]);
  const NATIVE_INTERACTIVE = new Set(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SUMMARY"]);
  const INTERACTIVE_ROLES = new Set(["button", "link", "checkbox", "radio", "switch", "tab", "menuitem", "option", "slider", "combobox", "textbox", "treeitem"]);

  function parseColor(str) {
    if (!str) return null;
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  }
  function over(top, base) {
    const a = top[3] + base[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    const mix = (i) => (top[i] * top[3] + base[i] * base[3] * (1 - top[3])) / a;
    return [mix(0), mix(1), mix(2), a];
  }
  function gradientStops(bgImage) {
    const out = [];
    const re = /rgba?\([^)]+\)/g;
    let m;
    while ((m = re.exec(bgImage))) {
      const c = parseColor(m[0]);
      if (c) out.push(c);
    }
    return out;
  }
  function round(n, d = 2) {
    const k = Math.pow(10, d);
    return Math.round(n * k) / k;
  }
  function px(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  function timeList(s) {
    return (s || "").split(",").map((t) => {
      t = t.trim();
      if (t.endsWith("ms")) return parseFloat(t);
      if (t.endsWith("s")) return parseFloat(t) * 1000;
      return 0;
    });
  }
  function splitTop(s) {
    const out = [];
    let depth = 0, cur = "";
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
  function firstFamily(ff) {
    const list = splitTop(ff).map((f) => f.replace(/^["']|["']$/g, ""));
    return list[0] || "";
  }

  // Effective background candidates behind an element (several for gradients).
  function backgroundCandidates(el) {
    const layers = []; // inner to outer, each an array of rgba candidates
    let unknown = false;
    let node = el;
    let base = null;
    while (node && node.nodeType === 1 && !base) {
      const cs = getComputedStyle(node);
      const img = cs.backgroundImage;
      if (img && img !== "none") {
        if (/url\(/.test(img)) unknown = true;
        const stops = gradientStops(img);
        if (stops.length) {
          if (stops.every((c) => c[3] >= 0.99)) base = stops;
          else layers.push(stops);
        }
      }
      if (!base) {
        const bg = parseColor(cs.backgroundColor) || [0, 0, 0, 0];
        if (bg[3] >= 0.99) base = [bg];
        else if (bg[3] > 0) layers.push([bg]);
      }
      node = node.parentElement;
    }
    let cands = base || [[255, 255, 255, 1]];
    for (let i = layers.length - 1; i >= 0; i--) {
      const next = [];
      for (const c of cands) for (const l of layers[i]) next.push(over(l, c));
      cands = next.slice(0, 16);
    }
    return { candidates: cands.map((c) => c.map((v, i) => (i < 3 ? Math.round(v) : round(v, 3)))), unknown };
  }

  function effectiveOpacity(el) {
    let o = 1;
    let n = el;
    while (n && n.nodeType === 1) {
      o *= parseFloat(getComputedStyle(n).opacity);
      n = n.parentElement;
    }
    return o;
  }

  function isMono(ff) {
    return /monospace|mono\b|menlo|consolas|courier|sf mono|fira code|jetbrains|ibm plex mono|source code/i.test(ff);
  }

  function isInteractive(el, cs) {
    if (NATIVE_INTERACTIVE.has(el.tagName)) {
      if (el.tagName === "A" && !el.hasAttribute("href")) return false;
      if (el.tagName === "INPUT" && el.type === "hidden") return false;
      return true;
    }
    const role = el.getAttribute("role");
    if (role && INTERACTIVE_ROLES.has(role)) return true;
    if (el.hasAttribute("tabindex") && el.tabIndex >= 0) return true;
    if (el.hasAttribute("onclick")) return true;
    if (cs.cursor === "pointer") {
      const p = el.parentElement;
      return !p || getComputedStyle(p).cursor !== "pointer";
    }
    return false;
  }

  const all = Array.from(document.querySelectorAll("body, body *"));
  const records = [];
  const indexOf = new Map();

  function record(el, pseudo) {
    const cs = pseudo ? getComputedStyle(el, pseudo) : getComputedStyle(el);
    if (pseudo) {
      const content = cs.content;
      if (!content || content === "none" || content === "normal") return null;
    }
    if (cs.display === "none") return null;
    const rect = el.getBoundingClientRect();
    const isSvgChild = el instanceof SVGElement;
    const offW = !isSvgChild && el.offsetWidth ? el.offsetWidth : 0;
    const scale = !pseudo && offW > 0 ? rect.width / offW : 1;
    const opacity = effectiveOpacity(el) * (pseudo ? parseFloat(cs.opacity) : 1);
    const visible =
      cs.visibility !== "hidden" &&
      opacity > 0.02 &&
      (rect.width > 0 || rect.height > 0) &&
      !(rect.right < 0 || rect.bottom < 0);

    let ownText = "";
    if (!pseudo) {
      for (const n of el.childNodes) if (n.nodeType === 3) ownText += n.textContent;
    } else {
      ownText = cs.content.replace(/^["']|["']$/g, "");
    }
    ownText = ownText.replace(/\s+/g, " ").trim();
    const textFill = isSvgChild ? cs.fill : cs.color;
    const color = parseColor(textFill) || parseColor(cs.color) || [0, 0, 0, 1];
    const bgInfo = ownText && visible ? backgroundCandidates(el) : { candidates: [], unknown: false };
    const borderSides = ["Top", "Right", "Bottom", "Left"].map((s) => ({
      w: px(cs["border" + s + "Width"]),
      style: cs["border" + s + "Style"],
      color: parseColor(cs["border" + s + "Color"]),
    }));
    const radii = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => cs["border" + c + "Radius"]);
    const radiusPx = Math.max(...radii.map((r) => (r.includes("%") ? (parseFloat(r) / 100) * Math.min(rect.width, rect.height) : px(r))));
    const ff = cs.fontFamily;
    const fontSize = px(cs.fontSize);
    const rec = {
      tag: (pseudo ? pseudo : el.tagName.toLowerCase()),
      parent: null,
      cls: typeof el.className === "string" ? el.className : el.getAttribute("class") || "",
      id: el.id || "",
      role: el.getAttribute("role") || "",
      attrs: {
        ariaExpanded: el.hasAttribute("aria-expanded"),
        ariaControls: el.hasAttribute("aria-controls"),
        ariaHaspopup: el.hasAttribute("aria-haspopup"),
        title: el.hasAttribute("title"),
        dataSignature: el.hasAttribute("data-signature") || (typeof el.className === "string" && /\bsignature\b/.test(el.className)),
      },
      visible,
      textLen: ownText.length,
      text: ownText.slice(0, 80),
      fontSize: round(fontSize),
      scale: round(scale, 3),
      fontFamily: firstFamily(ff),
      mono: isMono(firstFamily(ff)),
      fontWeight: parseInt(cs.fontWeight, 10) || 400,
      textTransform: cs.textTransform,
      letterSpacingEm: fontSize ? round(px(cs.letterSpacing) / fontSize, 3) : 0,
      lineHeightRatio: cs.lineHeight === "normal" ? 1.2 : fontSize ? round(px(cs.lineHeight) / fontSize, 2) : 0,
      color,
      bgOwn: parseColor(cs.backgroundColor),
      bg: bgInfo.candidates,
      bgUnknown: bgInfo.unknown,
      opacity: round(opacity, 3),
      borders: borderSides,
      radius: round(radiusPx),
      boxShadow: cs.boxShadow === "none" ? "" : cs.boxShadow,
      filter: cs.filter === "none" ? "" : cs.filter,
      backdropFilter: cs.backdropFilter && cs.backdropFilter !== "none" ? cs.backdropFilter : "",
      bgImage: cs.backgroundImage === "none" ? "" : /gradient/.test(cs.backgroundImage) ? "gradient" : "image",
      bgImageRaw: /gradient/.test(cs.backgroundImage) ? cs.backgroundImage.slice(0, 160) : "",
      stroke: isSvgChild ? parseColor(cs.stroke) : null,
      fill: isSvgChild ? parseColor(cs.fill) : null,
      rect: { x: round(rect.x), y: round(rect.y), w: round(rect.width), h: round(rect.height) },
      display: cs.display,
      position: cs.position,
      interactive: pseudo ? false : isInteractive(el, cs),
      inlineLink: el.tagName === "A" && cs.display === "inline",
      inCode: !pseudo && !!el.closest("pre, code, kbd, samp, textarea, [data-prompt], .prompt, .code"),
      inOrderedList: !pseudo && !!el.closest("ol"),
      inNav: !pseudo && !!el.closest("nav"),
      transitions: [],
      animations: [],
      spacing: {
        padding: [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)],
        margin: [px(cs.marginTop), px(cs.marginRight), px(cs.marginBottom), px(cs.marginLeft)],
        gap: [px(cs.rowGap), px(cs.columnGap)],
      },
      hiddenDetailChars: 0,
      childCount: el.children ? el.children.length : 0,
      restChars: 0,
    };

    const tProps = splitTop(cs.transitionProperty);
    const tDur = timeList(cs.transitionDuration);
    const tDel = timeList(cs.transitionDelay);
    const tEase = splitTop(cs.transitionTimingFunction);
    tProps.forEach((p, i) => {
      const dur = tDur[i % tDur.length] || 0;
      if (dur > 0) rec.transitions.push({ property: p, duration: dur, delay: tDel[i % tDel.length] || 0, easing: tEase[i % tEase.length] || "ease" });
    });
    const aNames = splitTop(cs.animationName);
    const aDur = timeList(cs.animationDuration);
    const aDel = timeList(cs.animationDelay);
    const aIter = splitTop(cs.animationIterationCount);
    aNames.forEach((n, i) => {
      if (n === "none") return;
      const dur = aDur[i % aDur.length] || 0;
      const iter = aIter[i % aIter.length];
      rec.animations.push({ name: n, duration: dur, delay: aDel[i % aDel.length] || 0, iterations: iter === "infinite" ? "infinite" : parseFloat(iter) || 1 });
    });
    return rec;
  }

  for (const el of all) {
    if (SKIP_TAGS.has(el.tagName.toUpperCase())) continue;
    const rec = record(el, null);
    if (!rec) continue;
    rec._el = el;
    indexOf.set(el, records.length);
    records.push(rec);
    for (const ps of ["::before", "::after"]) {
      const pr = record(el, ps);
      if (pr) {
        pr._el = el;
        pr.pseudoOf = records.length - 1;
        records.push(pr);
      }
    }
  }
  // parent links, rest chars, hidden detail
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (r.pseudoOf !== undefined) {
      r.parent = r.pseudoOf;
      continue;
    }
    let p = r._el.parentElement;
    while (p && !indexOf.has(p)) p = p.parentElement;
    r.parent = p ? indexOf.get(p) : null;
  }
  // text totals per element (visible rest vs hidden)
  for (let i = records.length - 1; i >= 0; i--) {
    const r = records[i];
    if (r.pseudoOf !== undefined) continue;
    const mine = r.visible ? r.textLen : 0;
    r.restChars += mine;
    if (!r.visible) r.hiddenDetailChars += r.textLen;
    if (r.parent !== null) {
      const p = records[r.parent];
      p.restChars += r.restChars;
      p.hiddenDetailChars += r.hiddenDetailChars;
    }
  }
  // elements that exist in DOM but are display:none also hold hidden detail
  for (const el of document.querySelectorAll("body *")) {
    if (indexOf.has(el)) continue;
    if (SKIP_TAGS.has(el.tagName.toUpperCase())) continue;
    const cs = getComputedStyle(el);
    if (cs.display !== "none") continue;
    let p = el.parentElement;
    while (p && !indexOf.has(p)) p = p.parentElement;
    if (!p) continue;
    const t = (el.textContent || "").replace(/\s+/g, " ").trim().length;
    if (!t) continue;
    // only count the outermost hidden element
    const parentHidden = el.parentElement && getComputedStyle(el.parentElement).display === "none";
    if (parentHidden) continue;
    let q = indexOf.get(p);
    while (q !== null && q !== undefined) {
      records[q].hiddenDetailChars += t;
      q = records[q].parent;
    }
  }

  // Headings with the visible text element just above them
  const headings = [];
  const textEls = records.filter((r) => r.visible && r.textLen > 0 && r.pseudoOf === undefined && !/^h[1-6]$/.test(r.tag));
  records.forEach((r, i) => {
    if (r.pseudoOf !== undefined) return;
    const isH = /^h[1-6]$/.test(r.tag) || r.role === "heading";
    if (!isH || !r.visible) return;
    const el = r._el;
    const fullText = (el.textContent || "").replace(/\s+/g, " ").trim();
    let above = null;
    let bestGap = Infinity;
    for (const t of textEls) {
      if (t._el === el || el.contains(t._el) || t._el.contains(el)) continue;
      const gap = r.rect.y - (t.rect.y + t.rect.h);
      if (gap < -2 || gap > 32) continue;
      const overlap = Math.min(t.rect.x + t.rect.w, r.rect.x + r.rect.w) - Math.max(t.rect.x, r.rect.x);
      if (overlap <= 0) continue;
      const leftAligned = Math.abs(t.rect.x - r.rect.x) <= 40;
      const centered = Math.abs(t.rect.x + t.rect.w / 2 - (r.rect.x + r.rect.w / 2)) <= 40;
      if (!leftAligned && !centered) continue;
      if (gap < bestGap) {
        bestGap = gap;
        above = t;
      }
    }
    // digits-only badge beside the heading
    let badge = null;
    for (const t of textEls) {
      if (!/^\s*\(?\d{1,3}[.)]?\s*$/.test(t.text)) continue;
      const vOverlap = Math.min(t.rect.y + t.rect.h, r.rect.y + r.rect.h) - Math.max(t.rect.y, r.rect.y);
      const hGap = Math.min(Math.abs(r.rect.x - (t.rect.x + t.rect.w)), Math.abs(t.rect.x - (r.rect.x + r.rect.w)));
      const sameParent = t.parent === r.parent || el.parentElement === t._el.parentElement;
      if (vOverlap > 0 && hGap <= 56 && sameParent) {
        badge = { text: t.text, inOrderedList: t.inOrderedList };
        break;
      }
    }
    headings.push({
      index: i,
      tag: r.tag,
      text: fullText.slice(0, 80),
      fontSize: r.fontSize,
      inOrderedList: r.inOrderedList,
      above: above
        ? { text: above.text, textLen: above.textLen, words: above.text.split(/\s+/).filter(Boolean).length, fontSize: above.fontSize, textTransform: above.textTransform, letterSpacingEm: above.letterSpacingEm, gap: round(bestGap), tag: above.tag, cls: above.cls }
        : null,
      badge,
    });
  });

  // Stylesheet scan: states and keyframes that are not on screen at rest
  const cssRules = [];
  function walkRules(rules, media) {
    for (const rule of rules) {
      if (rule.type === 1) {
        const s = rule.style;
        const props = {};
        const take = (k, v) => {
          if (v) props[k] = v;
        };
        take("transform", s.getPropertyValue("transform"));
        take("scale", s.getPropertyValue("scale"));
        take("boxShadow", s.getPropertyValue("box-shadow"));
        take("filter", s.getPropertyValue("filter"));
        take("backgroundImage", s.getPropertyValue("background-image") || (/gradient/.test(s.getPropertyValue("background")) ? s.getPropertyValue("background") : ""));
        take("animationName", s.getPropertyValue("animation-name"));
        take("animationDuration", s.getPropertyValue("animation-duration"));
        take("animationIterationCount", s.getPropertyValue("animation-iteration-count"));
        if (Object.keys(props).length) {
          let matches = 0;
          try {
            matches = document.querySelectorAll(rule.selectorText.replace(/::?(before|after|hover|focus|active|focus-visible|focus-within)/g, "")).length;
          } catch {
            matches = 0;
          }
          cssRules.push({ selector: rule.selectorText, media, matches, ...props });
        }
      } else if (rule.cssRules) {
        const m = rule.media ? rule.media.mediaText : media;
        walkRules(rule.cssRules, m || media);
      }
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      walkRules(sheet.cssRules, "");
    } catch {
      // cross-origin sheet
    }
  }
  const keyframes = [];
  function walkKeyframes(rules) {
    for (const rule of rules) {
      if (rule.type === 7) keyframes.push(rule.name);
      else if (rule.cssRules) walkKeyframes(rule.cssRules);
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      walkKeyframes(sheet.cssRules);
    } catch {
      // ignore
    }
  }

  const docEl = document.documentElement;
  const out = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollWidth: Math.max(docEl.scrollWidth, document.body ? document.body.scrollWidth : 0),
    elements: records.map((r) => {
      const copy = { ...r };
      delete copy._el;
      return copy;
    }),
    headings,
    cssRules,
    keyframes,
  };
  return out;
}

export async function collect(input, options = {}) {
  const url = toUrl(input);
  const executablePath = process.env.DESIGN_CHECK_CHROMIUM || undefined;
  const browser = await chromium.launch({ executablePath, headless: true });
  const snapshot = { url, collectedAt: new Date().toISOString(), views: {} };
  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      if (url.startsWith("file:") && !options.allowNetwork) {
        await page.route(/^https?:/, (route) => route.abort());
      }
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      // Sample running animations while the page settles to measure entrance length.
      const settle = await page.evaluate(async () => {
        const start = performance.now();
        const seen = new Map();
        let lastActive = 0;
        const limit = 6000;
        await new Promise((resolve) => {
          const tick = () => {
            const now = performance.now() - start;
            const anims = document.getAnimations();
            let active = false;
            for (const a of anims) {
              const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
              if (!t) continue;
              if (t.iterations === Infinity) {
                const target = a.effect.target;
                const key = "inf:" + (a.animationName || a.transitionProperty || "?") + ":" + (target ? target.tagName + "." + (target.className || "") : "");
                if (!seen.has(key)) seen.set(key, { infinite: true, name: a.animationName || "", duration: t.duration, selector: target ? target.tagName.toLowerCase() + (target.className && typeof target.className === "string" ? "." + target.className.trim().split(/\s+/).join(".") : "") : "" });
                continue;
              }
              if (a.playState === "running" || a.playState === "pending") {
                active = true;
                lastActive = now;
              }
            }
            if ((now > 600 && !active) || now > limit) return resolve();
            setTimeout(tick, 50);
          };
          tick();
        });
        return { settleMs: Math.round(lastActive), infiniteRunning: Array.from(seen.values()) };
      });
      await page.waitForTimeout(250);
      const measured = await page.evaluate(measurePage);
      snapshot.views[vp.name] = { name: vp.name, width: vp.width, height: vp.height, ...measured, settle };
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return snapshot;
}

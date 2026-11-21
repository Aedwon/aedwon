"use client";

import { useEffect, useRef } from "react";

type NodeId = "inbox" | "adv" | "pol" | "pb" | "he" | "lead" | "impl" | "bulk" | "aud";
type WireId = "heLead" | "advLead" | "polLead" | "pbLead" | "leadImpl" | "leadBulk" | "leadAud" | "inboxHe";
type ChatPart = "td" | "sc" | "st" | "dr" | "pf" | "au" | "sg" | "pi";
type SetupPart = "rest" | "policy" | "playbook" | "org" | "codex" | "tools";
type PartId = SetupPart | ChatPart;

interface NodeSpec {
  t: string;
  t2?: string;
  sub?: string;
  file?: string;
  rows?: string[];
  x: number;
  y: number;
  w: number;
}

interface WireEl {
  g: SVGGElement;
  p: SVGPathElement;
  pulse: SVGPathElement;
  c1: SVGCircleElement;
  c2: SVGCircleElement;
  ah: SVGPathElement;
  pts: [number, number][];
}

const W = 640;
const H = 700;
const NW = 420;
const NS = "http://www.w3.org/2000/svg";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_MOVE = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_SETTLE = "cubic-bezier(0.34, 1.32, 0.64, 1)";

const N: Record<NodeId, NodeSpec> = {
  he: { t: "Aedwon", x: 360, y: 24, w: 176 },
  inbox: { t: "T3Code", x: 16, y: 24, w: 224, rows: ["Claude Code", "Antigravity", "Codex"] },
  adv: { t: "Advisor", sub: "Fable 5.2, 6/6.2 Astra", x: 464, y: 120, w: 156 },
  lead: { t: "Lead", sub: "Opus 5.5, 4 Neon", x: 336, y: 236, w: 224 },
  pol: {
    t: "Company policy",
    t2: "Rule files",
    file: "- Under 150 words unless\n  I ask for depth.\n- Answer what I asked,\n  then stop.",
    x: 16,
    y: 176,
    w: 224,
  },
  pb: {
    t: "Project playbook",
    file: "- Always read AGENTS.md\n  first and other project\n  scaffolding files.",
    x: 16,
    y: 332,
    w: 224,
  },
  impl: { t: "Implementation", t2: "Workers", sub: '<b class="ui">Sonnet 5.5</b>, 4 Hydrogen, 6.1/6.2 Sol', x: 276, y: 404, w: 156 },
  bulk: { t: "Bulk", sub: "Haiku 5.5, 3.8 Flash, 6 Luna", x: 464, y: 404, w: 156 },
  aud: { t: "Auditor", sub: "Another vendor", x: 360, y: 612, w: 176 },
};

const ORDER: NodeId[] = ["inbox", "adv", "pol", "pb", "he", "lead", "impl", "bulk", "aud"];
const NN: Record<NodeId, { x: number; y: number; w: number }> = {
  he: { x: 232, y: 12, w: 108 },
  inbox: { x: 8, y: 12, w: 204 },
  adv: { x: 318, y: 76, w: 94 },
  lead: { x: 232, y: 186, w: 180 },
  pol: { x: 8, y: 66, w: 204 },
  pb: { x: 8, y: 204, w: 204 },
  impl: { x: 232, y: 328, w: 180 },
  bulk: { x: 232, y: 444, w: 180 },
  aud: { x: 8, y: 402, w: 204 },
};
const WIRE_IDS: WireId[] = ["heLead", "advLead", "polLead", "pbLead", "leadImpl", "leadBulk", "leadAud", "inboxHe"];
const WIRE_END: Record<WireId, [NodeId, NodeId]> = {
  heLead: ["he", "lead"],
  advLead: ["adv", "lead"],
  polLead: ["pol", "lead"],
  pbLead: ["pb", "lead"],
  leadImpl: ["lead", "impl"],
  leadBulk: ["lead", "bulk"],
  leadAud: ["lead", "aud"],
  inboxHe: ["inbox", "he"],
};
const DOCK_IDS: NodeId[] = ["pol", "he", "lead", "impl", "aud"];
const FOCUS: Record<SetupPart, NodeId[]> = {
  rest: ["he", "lead", "pol", "adv", "pb"],
  policy: ["pol", "lead", "he"],
  playbook: ["pb", "pol", "lead"],
  org: ["lead", "adv", "impl", "bulk"],
  codex: ["lead", "impl", "bulk", "aud"],
  tools: ["inbox", "he", "pol"],
};
const PHONE_FOCUS: Record<SetupPart, NodeId[]> = {
  rest: ["he", "pol", "pb", "adv", "lead"],
  policy: ["he", "pol", "lead"],
  playbook: ["pol", "pb", "lead"],
  org: ["lead", "impl", "bulk"],
  codex: ["lead", "impl", "bulk", "aud"],
  tools: ["inbox", "he"],
};
const PH: Record<NodeId, number> = { he: 76, inbox: 136, adv: 92, lead: 122, pol: 124, pb: 106, impl: 106, bulk: 106, aud: 92 };
const HOT: Partial<Record<SetupPart, WireId[]>> = {
  policy: ["polLead", "heLead"],
  playbook: ["pbLead", "polLead"],
  org: ["leadImpl", "leadBulk", "advLead"],
  codex: ["leadImpl", "leadBulk", "leadAud"],
  tools: ["inboxHe"],
};
const PARTS: ChatPart[] = ["td", "sc", "st", "dr", "pf", "au", "sg", "pi"];
const PART_ANCHOR: Record<ChatPart, string> = {
  td: "top-down-approach",
  sc: "scope-before-work",
  st: "standards-before-work",
  dr: "decision-record",
  pf: "proof-before-done",
  au: "outside-audit",
  sg: "who-may-sign-what",
  pi: "process-improvement",
};
const CHAT_ACTORS: Record<ChatPart, NodeId[]> = {
  td: ["he", "lead"],
  sc: ["lead", "he"],
  st: ["pol", "lead"],
  dr: ["pol", "he", "lead"],
  pf: ["lead", "impl", "he"],
  au: ["lead", "aud"],
  sg: ["lead", "he"],
  pi: ["he", "lead", "pol"],
};

const CHK_SVG = `<svg class="c-chk" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.2 L5.6 10.3 L11.5 3.8" pathLength="1"/></svg>`;
const DOT_RAIL_SVG = `<svg class="c-dotsvg" aria-hidden="true"><line x1="1" y1="0" x2="1" y2="100%"/></svg>`;

const BEATS: { id: ChatPart; html: () => string }[] = [
  {
    id: "td",
    html: () => `
      <div class="c-item c-from-he" data-dir="r">
        <div class="c-who">Aedwon</div>
        <div class="c-bubble">Make a page showing friends how I work with agents, with copyable prompts.</div>
      </div>
      <div class="c-item c-from-lead" data-dir="l">
        <div class="c-who">Lead <span class="c-badge">Brainstorm</span></div>
        <div class="c-bubble">Who reads this first, engineers or non-technical friends?</div>
      </div>
      <div class="c-item c-from-he" data-dir="r">
        <div class="c-who">Aedwon</div>
        <div class="c-bubble">Both. Keep explanations short and plain.</div>
      </div>
      <div class="c-item c-from-lead" data-dir="l">
        <div class="c-who">Lead <span class="c-badge strong">Spec plain-language section</span></div>
        <div class="c-bubble">
          Three chapters (Setup, Workflow, Examples). Each part explains the rule and gives a Copy button.
          <div class="c-split c-gate">
            <span class="c-gate-st">${CHK_SVG}Approved by Aedwon</span>
            <span>Lead writes plan next</span>
          </div>
        </div>
      </div>`,
  },
  {
    id: "sc",
    html: () => `
      <div class="c-item c-from-lead" data-dir="l" data-pause="300">
        <div class="c-who">Lead <span class="c-badge">End of brainstorm</span></div>
        <div class="c-bubble">
          Pick complexity before I write the spec.
          <div class="c-split c-opts">
            <div class="c-opt" data-opt="min"><span>Minimal</span><span>Text and copy buttons</span><span class="c-time">~1h</span></div>
            <div class="c-opt" data-opt="bal"><span>Balanced</span><span>Copy plus live diagram (Recommended)</span><span class="c-time">~3h</span></div>
            <div class="c-opt" data-opt="hrd"><span>Hardened</span><span>Admin studio and analytics</span><span class="c-time">~2d</span></div>
          </div>
        </div>
      </div>
      <div class="c-item c-from-he" data-dir="r" data-trigger="pick-bal">
        <div class="c-who">Aedwon</div>
        <div class="c-bubble">Balanced.</div>
      </div>`,
  },
  {
    id: "st",
    html: () => `
      <div class="c-item" data-dir="u">
        <div class="c-ev">
          <div class="c-ev-head">Rule files to Lead <span class="c-badge">Standards library</span></div>
          <div class="c-ev-body">Read <code>agent-standards/README.md</code> and <code>web-interface-design.md</code>.</div>
        </div>
      </div>
      <div class="c-item c-from-lead" data-dir="l">
        <div class="c-who">Lead <span class="c-badge">Added to spec</span></div>
        <div class="c-bubble">
          Fields touched: web interface design and typography.
          <div class="c-split c-sub">Standards applied: WCAG 2.0 AA contrast (4.5:1), Apple HIG layout, 120 to 300ms motion, reduced motion.</div>
        </div>
      </div>`,
  },
  {
    id: "dr",
    html: () => `
      <div class="c-item" data-dir="u">
        <div class="c-ev">
          <div class="c-ev-head">Lead updated Decision record <span class="c-badge">Rule files</span></div>
          <div class="c-dec">
            <div class="c-dec-row" data-stagger><span class="c-dec-tag"><i class="mk-sq"></i>Locked by Aedwon</span><span class="c-row-txt">Three chapters (Setup, Workflow, Examples).</span></div>
            <div class="c-dec-row" data-stagger><span class="c-dec-tag muted"><i class="mk-half"></i>Decided on delegation</span><span class="c-row-txt">Scroll drives the active beat.</span></div>
            <div class="c-dec-row" data-stagger><span class="c-dec-tag muted"><i class="mk-ring"></i>Open</span><span class="c-row-txt">Subdomain DNS setup.</span></div>
          </div>
        </div>
      </div>`,
  },
  {
    id: "pf",
    html: () => `
      <div class="c-item" data-dir="u">
        <div class="c-ev">
          <div class="c-ev-head">Lead briefed Workers <span class="c-badge">Impl &amp; bulk</span></div>
          <div class="c-ev-body">Build from the plan, then run tests and the design check.</div>
        </div>
      </div>
      <div class="c-item" data-dir="u">
        <div class="c-ev">
          <div class="c-ev-head">Workers returned proof <span class="c-badge strong">Output attached</span></div>
          <pre class="c-code"><code class="c-code-ln" data-stagger>design-check: 0 errors, 0 warnings</code><code class="c-code-ln" data-stagger>tests: 18 passed, 0 failed</code></pre>
        </div>
      </div>
      <div class="c-item c-from-lead" data-dir="l">
        <div class="c-who">Lead</div>
        <div class="c-bubble">Verified with output above. Ready for your UI check.</div>
      </div>
      <div class="c-item c-from-he" data-dir="r">
        <div class="c-who">Aedwon</div>
        <div class="c-bubble">Checking the rendered page now.</div>
      </div>`,
  },
  {
    id: "au",
    html: () => `
      <div class="c-item" data-dir="u">
        <div class="c-ev c-ev-audit">
          ${DOT_RAIL_SVG}
          <div class="c-ev-head">Lead called Auditor <span class="c-badge">Optional</span> <span class="c-badge">Another vendor</span></div>
          <div class="c-ev-body">Can run on spec, plan, or finished build. Sits outside the chain.</div>
        </div>
      </div>
      <div class="c-item" data-dir="u">
        <div class="c-ev c-ev-audit">
          ${DOT_RAIL_SVG}
          <div class="c-ev-head">Auditor report to Lead <span class="c-badge">Report only, never fixes</span></div>
          <ul class="c-ev-list">
            <li data-stagger>Phone view clips one label on narrow screens.</li>
            <li data-stagger>Reduced motion hides two status marks.</li>
          </ul>
        </div>
      </div>
      <div class="c-item c-from-lead" data-dir="l">
        <div class="c-who">Lead</div>
        <div class="c-bubble">Confirmed both findings. Fixing them myself and re-running the check.</div>
      </div>`,
  },
  {
    id: "sg",
    html: () => `
      <div class="c-item" data-dir="u">
        <div class="c-ev">
          <div class="c-ev-head"><i class="mk-ring ok"></i>Lead committed and pushed <span class="c-badge">Verified, no ask needed</span></div>
          <div class="c-ev-body">Checks passed on <code>feat/workflow-page</code>.</div>
        </div>
      </div>
      <div class="c-item c-from-lead" data-dir="l" data-pause="420">
        <div class="c-who">Lead <span class="c-badge strong">Needs approval</span></div>
        <div class="c-bubble">
          Ready to connect <code>workflow.aedwon.site</code> in DNS and publish live. Approve?
          <div class="c-split c-gate">
            <span class="c-gate-st"><i class="mk-ring" data-wait-dot></i><span data-wait-txt>Paused on public action</span></span>
            <span data-wait-sub>Waits for Aedwon</span>
          </div>
        </div>
      </div>
      <div class="c-item c-from-he" data-dir="r" data-trigger="approve-pub">
        <div class="c-who">Aedwon</div>
        <div class="c-bubble">Yes, publish it.</div>
      </div>`,
  },
  {
    id: "pi",
    html: () => `
      <div class="c-item c-from-he" data-dir="r">
        <div class="c-who">Aedwon</div>
        <div class="c-bubble">Second time a recommendation had no live sample.</div>
      </div>
      <div class="c-item c-from-lead" data-dir="l">
        <div class="c-who">Lead</div>
        <div class="c-bubble">Built the sample first. Logging your exact words and fixing the rule next.</div>
      </div>
      <div class="c-item" data-dir="u" data-trigger="loop-rule">
        <div class="c-ev">
          <div class="c-ev-head">Lead updated Rule files <span class="c-badge strong">Process improvement</span></div>
          <ul class="c-ev-list">
            <li data-stagger>Logged exact words and root cause in the archive.</li>
            <li data-stagger>Added required step: show a live sample before asking.</li>
          </ul>
        </div>
      </div>`,
  },
];

function orth(rawPts: [number, number][], r: number): string {
  let pts = rawPts.filter((q, i) => i === 0 || q[0] !== rawPts[i - 1][0] || q[1] !== rawPts[i - 1][1]);
  pts = pts.filter(
    (q, i) =>
      i === 0 ||
      i === pts.length - 1 ||
      !((pts[i - 1][0] === q[0] && q[0] === pts[i + 1][0]) || (pts[i - 1][1] === q[1] && q[1] === pts[i + 1][1])),
  );
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (i < pts.length - 1) {
      const [px, py] = pts[i - 1];
      const [nx, ny] = pts[i + 1];
      const l1 = Math.hypot(x - px, y - py);
      const l2 = Math.hypot(nx - x, ny - y);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const ax = x - ((x - px) / l1) * rr;
      const ay = y - ((y - py) / l1) * rr;
      const bx = x + ((nx - x) / l2) * rr;
      const by = y + ((ny - y) / l2) * rr;
      d += ` L${ax} ${ay} Q${x} ${y} ${bx} ${by}`;
    } else d += ` L${x} ${y}`;
  }
  return d;
}

/** Sticky living instrument: Setup org chart that morphs into Workflow's docked role bar and simulated chat. */
export function LivingInstrument() {
  const viewRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewEl = viewRef.current;
    const stageEl = stageRef.current;
    if (!viewEl || !stageEl) return;
    const view: HTMLDivElement = viewEl;
    const stage: HTMLDivElement = stageEl;

    stage.innerHTML = "";
    const RM = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const T = RM ? { fast: 0, base: 0, slow: 0, exit: 0 } : { fast: 150, base: 340, slow: 440, exit: 220 };
    let disposed = false;

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(() => {
          timers.delete(t);
          resolve();
        }, ms);
        timers.add(t);
      });

    const liveAnims = new Set<Animation>();
    const safeAnimate = (target: Element, kf: Keyframe[], opts: KeyframeAnimationOptions): Animation | null => {
      if (typeof (target as HTMLElement).animate !== "function") return null;
      const anim = (target as HTMLElement).animate(kf, opts);
      liveAnims.add(anim);
      anim.finished.then(
        () => liveAnims.delete(anim),
        () => liveAnims.delete(anim),
      );
      return anim;
    };
    const cancelLive = () => {
      liveAnims.forEach((a) => {
        try {
          a.cancel();
        } catch {}
      });
      liveAnims.clear();
    };

    const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html != null) e.innerHTML = html;
      return e;
    };
    const sv = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, String(attrs[k]));
      if (parent) parent.appendChild(e);
      return e;
    };

    const wires = sv("svg", { class: "wires", width: W, height: H, viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" }, stage);
    const marks = sv("g", {}, wires);
    const drawMarks = (sw: number) => {
      marks.innerHTML = "";
      for (let x = 40; x < sw - 12; x += 80) {
        for (let y = 40; y < H; y += 80) {
          if (!(x === 280 && y === 120)) sv("path", { class: "grid-mark", d: `M${x - 3} ${y}H${x + 3}M${x} ${y - 3}V${y + 3}` }, marks);
        }
      }
    };
    const frame = el("div", "frame", "<span>Chain</span>");
    stage.appendChild(frame);

    const W_EL = {} as Record<WireId, WireEl>;
    WIRE_IDS.forEach((id) => {
      const g = sv("g", {}, wires);
      const p = sv("path", id === "leadAud" ? { class: "dots" } : { pathLength: 1 }, g);
      const pulse = sv("path", { class: "pulse", pathLength: 1 }, g);
      const c1 = sv("circle", { r: 2.5 }, g);
      const c2 = sv("circle", { r: 2.5 }, g);
      const ah = sv("path", { class: "ah" }, g);
      W_EL[id] = { g, p, pulse, c1, c2, ah, pts: [] };
    });

    const dockWires = sv("svg", { class: "dock-wires", width: W, height: 84, viewBox: `0 0 ${W} 84`, "aria-hidden": "true" }, stage);
    const dockRule = sv("path", { class: "rule" }, dockWires);
    const dockAuditPath = sv("path", { class: "dots" }, dockWires);
    const dockAuditAh = sv("path", { class: "ah" }, dockWires);
    const dockLoopPath = sv("path", { pathLength: 1 }, dockWires);
    const dockLoopAh = sv("path", { class: "ah" }, dockWires);

    const NE = {} as Record<NodeId, HTMLDivElement>;
    ORDER.forEach((id) => {
      const d = N[id];
      const n = el("div", id === "inbox" ? "node gone" : "node");
      n.id = `n-${id}`;
      const t2 = d.t2 ? `<span class="t2">${d.t2}</span>` : "";
      let det = "";
      if (d.sub) det += `<div class="sub">${d.sub}</div>`;
      if (d.file) det += `<pre class="file">${d.file}</pre>`;
      if (d.rows) det += `<div class="rows">${d.rows.map((r) => `<div class="irow" data-r="${r}"><span>${r}</span><i></i></div>`).join("")}</div>`;
      n.innerHTML =
        `<div class="nt"><span class="t1${d.t2 ? " swap" : ""}">${d.t}</span>${t2}</div>` +
        (det ? `<div class="fold det"><div>${det}</div></div>` : "") +
        `<div class="fold trayfold"><div><div class="tray"></div></div></div>`;
      stage.appendChild(n);
      NE[id] = n;
    });
    const seat = el("div", "seat");
    stage.appendChild(seat);

    const chatClip = el("div", "chat-clip");
    stage.appendChild(chatClip);
    const chatCam = el("div", "chat-cam");
    chatClip.appendChild(chatCam);

    let narrow = false;
    let scene: "org" | "chat" = "org";
    let current: PartId | null = null;
    let runId = 0;
    let vw = 640;
    let vh = 700;
    let scale = 1;
    const geo = {} as Record<NodeId, { x: number; y: number; w: number }>;

    const dockX = (sw: number) => {
      const pad = 12;
      const gap = narrow ? 6 : 12;
      const hw = Math.floor((sw - pad * 2 - gap * 4) / 5);
      return { xs: DOCK_IDS.map((_, i) => pad + i * (hw + gap)), hw };
    };

    const nodeBox = (id: NodeId) => {
      const g = geo[id];
      return { x: g.x, y: g.y, w: g.w, h: NE[id].offsetHeight };
    };

    const wirePts = (id: WireId): [number, number][] => {
      const he = nodeBox("he");
      const ld = nodeBox("lead");
      const ad = nodeBox("adv");
      const po = nodeBox("pol");
      const pb = nodeBox("pb");
      const im = nodeBox("impl");
      const bu = nodeBox("bulk");
      const au = nodeBox("aud");
      const ib = nodeBox("inbox");
      const lc = ld.x + ld.w / 2;
      const lb = ld.y + ld.h;
      const ly = ld.y + 30;
      const my = Math.round((lb + im.y) / 2);
      if (narrow) {
        const gutter = Math.round((po.x + po.w + ld.x) / 2);
        switch (id) {
          case "heLead":
            return [
              [he.x + he.w / 2, he.y + he.h],
              [he.x + he.w / 2, ld.y],
            ];
          case "advLead":
            return [
              [ad.x + ad.w / 2, ad.y + ad.h],
              [ad.x + ad.w / 2, ld.y],
            ];
          case "polLead":
            return [
              [po.x + po.w, po.y + 20],
              [gutter, po.y + 20],
              [gutter, ly],
              [ld.x, ly],
            ];
          case "pbLead":
            return [
              [pb.x + pb.w, pb.y + 20],
              [gutter, pb.y + 20],
              [gutter, ly],
              [ld.x, ly],
            ];
          case "leadImpl":
            return [
              [he.x + he.w / 2, lb],
              [he.x + he.w / 2, im.y],
            ];
          case "leadBulk":
            return [
              [ld.x + ld.w, ld.y + 42],
              [NW - 4, ld.y + 42],
              [NW - 4, bu.y + 20],
              [bu.x + bu.w, bu.y + 20],
            ];
          case "leadAud":
            return [
              [ld.x, ld.y + 48],
              [gutter, ld.y + 48],
              [gutter, au.y + 20],
              [au.x + au.w, au.y + 20],
            ];
          case "inboxHe":
            return [
              [ib.x + ib.w, he.y + 20],
              [he.x, he.y + 20],
            ];
        }
      }
      switch (id) {
        case "heLead":
          return [
            [lc, he.y + he.h],
            [lc, ld.y],
          ];
        case "advLead":
          return [
            [ad.x + ad.w / 2, ad.y + ad.h],
            [ad.x + ad.w / 2, ld.y],
          ];
        case "polLead":
          return [
            [po.x + po.w, po.y + 20],
            [292, po.y + 20],
            [292, ly],
            [ld.x, ly],
          ];
        case "pbLead":
          return [
            [pb.x + pb.w, pb.y + 20],
            [292, pb.y + 20],
            [292, ly],
            [ld.x, ly],
          ];
        case "leadImpl":
          return [
            [lc - 48, lb],
            [lc - 48, my],
            [im.x + im.w / 2, my],
            [im.x + im.w / 2, im.y],
          ];
        case "leadBulk":
          return [
            [lc + 48, lb],
            [lc + 48, my],
            [bu.x + bu.w / 2, my],
            [bu.x + bu.w / 2, bu.y],
          ];
        case "leadAud":
          return [
            [lc, lb],
            [lc, au.y],
          ];
        case "inboxHe":
          return [
            [ib.x + ib.w, he.y + 20],
            [he.x, he.y + 20],
          ];
      }
    };

    const drawWires = () => {
      if (scene !== "org") return;
      WIRE_IDS.forEach((id) => {
        const w = W_EL[id];
        const pts = wirePts(id);
        w.pts = pts;
        const d = orth(pts, 10);
        w.p.setAttribute("d", d);
        w.pulse.setAttribute("d", d);
        const a = pts[0];
        const b = pts[pts.length - 1];
        w.c1.setAttribute("cx", String(a[0]));
        w.c1.setAttribute("cy", String(a[1]));
        if (id === "polLead" || id === "pbLead") {
          w.c2.setAttribute("r", "0");
          w.ah.setAttribute("d", `M${b[0]} ${b[1]} l-7 -3.5 v7 z`);
        } else {
          w.c2.setAttribute("r", "2.5");
          w.c2.setAttribute("cx", String(b[0]));
          w.c2.setAttribute("cy", String(b[1]));
          w.ah.setAttribute("d", "");
        }
      });
      const ld = nodeBox("lead");
      seat.classList.toggle("flat", narrow);
      if (narrow) {
        seat.style.left = `${ld.x + ld.w - 44}px`;
        seat.style.top = `${ld.y - 6}px`;
      } else {
        seat.style.left = `${ld.x + ld.w + 5}px`;
        seat.style.top = `${ld.y + 16}px`;
      }
    };

    let liveUntil = 0;
    let rafLive = 0;
    const loop = () => {
      if (disposed) return;
      drawWires();
      if (performance.now() < liveUntil) rafLive = requestAnimationFrame(loop);
    };
    const live = (ms: number) => {
      liveUntil = Math.max(liveUntil, performance.now() + ms);
      cancelAnimationFrame(rafLive);
      rafLive = requestAnimationFrame(loop);
    };

    const drawDockWires = () => {
      const sw = narrow ? vw : W;
      const { xs, hw } = dockX(sw);
      const svgH = narrow ? 68 : 78;
      dockWires.setAttribute("width", String(sw));
      dockWires.setAttribute("height", String(svgH));
      dockWires.setAttribute("viewBox", `0 0 ${sw} ${svgH}`);
      const leadCx = xs[2] + hw / 2;
      const audCx = xs[4] + hw / 2;
      const polCx = xs[0] + hw / 2;
      const topY = narrow ? 48 : 54;
      const dipY = narrow ? 56 : 65;
      const ruleY = narrow ? 65 : 75;
      dockRule.setAttribute("d", `M${narrow ? 12 : 4} ${ruleY} H${sw - (narrow ? 12 : 4)}`);
      const audD = orth(
        [
          [leadCx, topY],
          [leadCx, dipY],
          [audCx, dipY],
          [audCx, topY + 2],
        ],
        6,
      );
      dockAuditPath.setAttribute("d", audD);
      dockAuditAh.setAttribute("d", `M${audCx} ${topY} l-3.5 6 h7 z`);
      dockLoopPath.setAttribute("d", `M${polCx} ${ruleY} L${polCx} ${topY + 2}`);
      dockLoopAh.setAttribute("d", `M${polCx} ${topY} l-3.5 6 h7 z`);
      if (current !== "pi") {
        dockLoopPath.style.opacity = "0";
        dockLoopAh.style.opacity = "0";
      }
    };

    const stageH = () => (scene === "org" ? H : Math.ceil(vh / scale));
    const placeNodes = () => {
      const sw = narrow ? (scene === "org" ? NW : vw) : W;
      const { xs, hw } = dockX(sw);
      ORDER.forEach((id) => {
        const n = NE[id];
        const d = N[id];
        let g: { x: number; y: number; w: number };
        if (scene === "org") g = narrow ? { ...NN[id] } : { x: d.x, y: d.y, w: d.w };
        else {
          const i = DOCK_IDS.indexOf(id);
          g = i < 0 ? { x: d.x, y: d.y, w: d.w } : { x: xs[i], y: narrow ? 12 : 16, w: hw };
        }
        geo[id] = g;
        n.style.left = `${g.x}px`;
        n.style.top = `${g.y}px`;
        n.style.width = `${g.w}px`;
      });
      if (scene === "org") {
        Object.assign(
          frame.style,
          narrow
            ? { left: "222px", top: "64px", width: "194px", height: "534px", opacity: "1" }
            : { left: "260px", top: "104px", width: "368px", height: "488px", opacity: "1" },
        );
      } else {
        const l = xs[2] - 5;
        const r = xs[3] + hw + 5;
        const fy = narrow ? 7 : 10;
        const fh = narrow ? 46 : 49;
        Object.assign(frame.style, { left: `${l}px`, top: `${fy}px`, width: `${r - l}px`, height: `${fh}px`, opacity: "1" });
      }
    };

    const phoneHidden = (id: NodeId) => {
      if (!narrow || scene !== "org") return false;
      const key = (current && current in PHONE_FOCUS ? current : "rest") as SetupPart;
      return !PHONE_FOCUS[key].includes(id);
    };

    const measure = () => {
      narrow = window.innerWidth <= 900;
      stage.classList.toggle("narrow", narrow);
      vw = view.clientWidth || 640;
      vh = view.clientHeight || 700;
    };

    const applyCamera = () => {
      let s: number;
      let tx: number;
      let ty: number;
      if (scene === "org") {
        if (!narrow) {
          s = Math.min(1, vw / W, vh / H);
          tx = (vw - W * s) / 2;
          ty = Math.max(0, (vh - H * s) / 2);
        } else {
          const key = (current && current in PHONE_FOCUS ? current : "rest") as SetupPart;
          const ids = PHONE_FOCUS[key];
          let y0 = 1e9;
          let y1 = -1e9;
          ids.forEach((id) => {
            const g = NN[id];
            y0 = Math.min(y0, g.y);
            y1 = Math.max(y1, g.y + (PH[id] || 60));
          });
          if (current === "codex") y0 -= 38;
          s = vw / NW;
          tx = 0;
          ty = Math.round(vh / 2 - ((y0 + y1) / 2) * s);
          ty = Math.max(Math.round(vh - 8 - y1 * s), Math.min(ty, Math.round(8 - y0 * s)));
          ty = Math.min(ty, Math.round(8 - y0 * s));
        }
      } else {
        const sw = narrow ? vw : W;
        s = narrow ? 1 : Math.min(1, vw / sw);
        tx = (vw - sw * s) / 2;
        ty = 0;
      }
      scale = s || 1;
      const sw = narrow ? (scene === "org" ? NW : vw) : W;
      stage.style.width = `${sw}px`;
      wires.setAttribute("width", String(sw));
      wires.setAttribute("viewBox", `0 0 ${sw} ${H}`);
      drawMarks(sw);
      chatClip.style.width = `${sw}px`;
      chatClip.style.height = `${Math.max(200, stageH() - (narrow ? 68 : 78))}px`;
      stage.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
      stage.style.height = `${stageH()}px`;
    };

    const clearOrg = () => {
      stage.querySelectorAll(".chip, .outside").forEach((c) => c.remove());
      ORDER.forEach((id) => {
        const tr = NE[id].querySelector(".tray");
        if (tr) tr.innerHTML = "";
        NE[id].classList.remove("has-tray");
      });
      seat.classList.remove("on");
      WIRE_IDS.forEach((id) => {
        W_EL[id].pulse.style.opacity = "0";
      });
      NE.inbox.querySelectorAll<HTMLElement>(".irow").forEach((r) => {
        r.classList.remove("new");
        r.style.transform = "";
      });
      const rows = NE.inbox.querySelector(".rows");
      if (rows) {
        ["Claude Code", "Antigravity", "Codex"].forEach((k) => {
          const r = NE.inbox.querySelector(`.irow[data-r="${k}"]`);
          if (r) rows.appendChild(r);
        });
      }
      const ui = NE.impl.querySelector(".ui");
      if (ui) ui.classList.remove("lit");
    };

    const addTag = (id: NodeId, label: string, first?: boolean) => {
      const n = NE[id];
      const tr = n.querySelector(".tray")!;
      const t = el("span", "tag", label);
      if (first) tr.prepend(t);
      else tr.appendChild(t);
      n.classList.add("has-tray");
      live(T.base + 80);
      return t;
    };

    const tagCenter = (id: NodeId, t: HTMLElement): [number, number] => {
      const g = geo[id];
      return [g.x + 1 + t.offsetLeft + t.offsetWidth / 2, g.y + 1 + t.offsetTop + t.offsetHeight / 2];
    };

    const sampleWire = (wireId: WireId, reverse: boolean, endPt?: [number, number]): [number, number][] => {
      const p = W_EL[wireId].p;
      const pts: [number, number][] = [];
      if (typeof p.getTotalLength === "function" && typeof p.getPointAtLength === "function") {
        const total = p.getTotalLength();
        const N_SAMPLES = 22;
        for (let i = 0; i <= N_SAMPLES; i++) {
          const f = reverse ? 1 - i / N_SAMPLES : i / N_SAMPLES;
          const pt = p.getPointAtLength(total * f);
          pts.push([pt.x, pt.y]);
        }
      } else {
        const base = W_EL[wireId].pts.length ? W_EL[wireId].pts : wirePts(wireId);
        pts.push(...(reverse ? [...base].reverse() : base));
      }
      if (endPt) pts.push(endPt);
      return pts;
    };

    const pathKeyframes = (pts: [number, number][], launchScale: boolean): Keyframe[] => {
      const segs: number[] = [];
      let L = 0;
      for (let i = 1; i < pts.length; i++) {
        const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        segs.push(l);
        L += l;
      }
      let acc = 0;
      return pts.map((p, i) => {
        if (i) acc += segs[i - 1];
        const off = L ? acc / L : 0;
        const sc = launchScale ? (i === 0 ? 0.9 : 1) : 1;
        return { transform: `translate3d(${p[0]}px, ${p[1]}px, 0) translate(-50%, -50%) scale(${sc})`, offset: off };
      });
    };

    const pulseWire = (wireId: WireId, reverse: boolean, dur: number) => {
      if (RM) return;
      const w = W_EL[wireId];
      const from = reverse ? "-1" : "1";
      w.pulse.style.opacity = "1";
      safeAnimate(
        w.pulse,
        [
          { strokeDasharray: "0.28 1", strokeDashoffset: from, opacity: 0.95 },
          { strokeDasharray: "0.28 1", strokeDashoffset: reverse ? "0.28" : "-0.28", opacity: 0 },
        ],
        { duration: dur, easing: EASE, fill: "forwards" },
      );
    };

    const settleNode = (id: NodeId) => {
      if (RM) return;
      safeAnimate(NE[id], [{ transform: "scale(1)" }, { transform: "scale(1.015)", offset: 0.35 }, { transform: "scale(1)" }], {
        duration: 320,
        easing: EASE,
      });
    };

    const send = async (rid: number, label: string, wireId: WireId, reverse: boolean, to: NodeId, opts: { first?: boolean } = {}) => {
      const tag = addTag(to, label, opts.first);
      tag.style.visibility = "hidden";
      if (RM) {
        tag.style.visibility = "";
        return tag;
      }
      await wait(240);
      if (disposed || rid !== runId) return tag;
      drawWires();
      const end = tagCenter(to, tag);
      const all = sampleWire(wireId, reverse, end);
      const chip = el("div", "chip", label);
      stage.appendChild(chip);
      const L = all.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - all[i - 1][0], p[1] - all[i - 1][1]) : 0), 0);
      const dur = Math.round(Math.min(720, Math.max(480, L * 1.65)));
      pulseWire(wireId, reverse, dur);
      const a = safeAnimate(chip, pathKeyframes(all, true), { duration: dur, easing: EASE_MOVE, fill: "forwards" });
      if (a) await a.finished.catch(() => {});
      chip.remove();
      if (disposed || rid !== runId) return tag;
      tag.style.visibility = "";
      safeAnimate(
        tag,
        [
          { transform: "scale(0.92)", opacity: 0.55 },
          { transform: "scale(1.02)", opacity: 1, offset: 0.58 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 320, easing: EASE_SETTLE },
      );
      settleNode(to);
      return tag;
    };

    const DEMO: Partial<Record<SetupPart, (rid: number) => Promise<void>>> = {
      async policy(rid) {
        await send(rid, "Company policy", "polLead", false, "lead");
        if (disposed || rid !== runId) return;
        await wait(360);
        await send(rid, "Reply", "heLead", true, "he");
      },
      async playbook(rid) {
        const t = addTag("lead", "Company policy");
        await wait(320);
        if (disposed || rid !== runId) return;
        const beforeTop = t.getBoundingClientRect().top;
        await send(rid, "Project playbook", "pbLead", false, "lead", { first: true });
        if (disposed || rid !== runId) return;
        const afterTop = t.getBoundingClientRect().top;
        const dy = (beforeTop - afterTop) / scale;
        if (dy && !RM) safeAnimate(t, [{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: T.base, easing: EASE });
        t.classList.add("under");
      },
      async org(rid) {
        const a = send(rid, "Brief", "leadImpl", false, "impl");
        await wait(RM ? 0 : 140);
        if (disposed || rid !== runId) return;
        const b = send(rid, "Brief", "leadBulk", false, "bulk");
        await Promise.all([a, b]);
        if (disposed || rid !== runId) return;
        await wait(460);
        const c = send(rid, "Summary", "leadImpl", true, "lead");
        await wait(RM ? 0 : 160);
        if (disposed || rid !== runId) return;
        const d = send(rid, "Summary", "leadBulk", true, "lead");
        await Promise.all([c, d]);
      },
      async codex(rid) {
        const ld = nodeBox("lead");
        const y = ld.y + 30;
        seat.classList.add("on");
        await wait(RM ? 0 : 160);
        if (disposed || rid !== runId) return;
        if (!RM) {
          const chip = el("div", "chip", "Codex");
          stage.appendChild(chip);
          const start = narrow ? [ld.x + ld.w - 30, ld.y - 96] : [W + 30, y];
          const hit = narrow ? [ld.x + ld.w - 30, ld.y - 16] : [ld.x + ld.w + 26, y];
          const rest = narrow ? [ld.x + ld.w - 30, ld.y - 26] : [ld.x + ld.w + 42, y];
          const a = safeAnimate(
            chip,
            [
              { transform: `translate3d(${start[0]}px, ${start[1]}px, 0) translate(-50%,-50%)`, offset: 0 },
              { transform: `translate3d(${hit[0]}px, ${hit[1]}px, 0) translate(-50%,-50%) scale(0.95)`, offset: 0.58, easing: EASE_MOVE },
              { transform: `translate3d(${rest[0]}px, ${rest[1]}px, 0) translate(-50%,-50%) scale(1)`, offset: 1, easing: EASE_SETTLE },
            ],
            { duration: 640, fill: "forwards" },
          );
          if (a) await a.finished.catch(() => {});
          chip.remove();
        }
        if (disposed || rid !== runId) return;
        const out = el("span", "tag under outside", "Codex");
        out.style.position = "absolute";
        if (narrow) {
          out.style.left = `${ld.x + ld.w - 56}px`;
          out.style.top = `${ld.y - 36}px`;
        } else {
          out.style.left = `${ld.x + ld.w + 14}px`;
          out.style.top = `${y - 11}px`;
        }
        stage.appendChild(out);
        await wait(RM ? 0 : 280);
        for (const id of ["impl", "bulk", "aud"] as NodeId[]) {
          if (disposed || rid !== runId) return;
          const t = addTag(id, "Codex");
          if (!RM) {
            safeAnimate(t, [{ opacity: 0, transform: "translateX(12px) scale(0.95)" }, { opacity: 1, transform: "none" }], {
              duration: T.base,
              easing: EASE,
            });
          }
          await wait(RM ? 0 : 190);
        }
        if (disposed || rid !== runId) return;
        await wait(RM ? 0 : 220);
        const ui = NE.impl.querySelector(".ui");
        if (ui) ui.classList.add("lit");
      },
      async tools(rid) {
        await wait(RM ? 0 : 280);
        if (disposed || rid !== runId) return;
        const rows = NE.inbox.querySelector(".rows");
        const target = NE.inbox.querySelector<HTMLElement>('.irow[data-r="Codex"]');
        const items = Array.from(NE.inbox.querySelectorAll<HTMLElement>(".irow"));
        if (!rows || !target) return;
        const before = items.map((r) => r.getBoundingClientRect().top);
        target.classList.add("new");
        if (!RM) {
          const dot = target.querySelector("i");
          if (dot) {
            safeAnimate(dot, [{ transform: "scale(0.5)" }, { transform: "scale(1.28)", offset: 0.55 }, { transform: "scale(1)" }], {
              duration: 300,
              easing: EASE_SETTLE,
            });
          }
        }
        await wait(RM ? 0 : 380);
        if (disposed || rid !== runId) return;
        rows.prepend(target);
        const after = items.map((r) => r.getBoundingClientRect().top);
        items.forEach((r, i) => {
          const dy = (before[i] - after[i]) / scale;
          if (dy && !RM) safeAnimate(r, [{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: T.slow, delay: i * 45, easing: EASE, fill: "backwards" });
        });
        pulseWire("inboxHe", false, 480);
        settleNode("he");
      },
    };

    const setOrgPart = (part: SetupPart) => {
      clearOrg();
      const focus = part === "rest" ? null : FOCUS[part];
      ORDER.forEach((id) => {
        const n = NE[id];
        n.classList.remove("head", "spot", "dim");
        n.classList.toggle("gone", (id === "inbox" && part !== "tools") || phoneHidden(id));
        if (focus) n.classList.toggle("dim", !focus.includes(id));
      });
      if (focus) FOCUS[part].slice(0, 1).forEach((id) => NE[id].classList.add("spot"));
      WIRE_IDS.forEach((id) => {
        const on = (HOT[part] || []).includes(id);
        const w = W_EL[id];
        [w.p, w.c1, w.c2, w.ah].forEach((e) => e.classList.toggle("hot", on));
        w.g.style.opacity = (id === "inboxHe" && part !== "tools") || WIRE_END[id].some(phoneHidden) ? "0" : "1";
      });
    };

    const BEAT_EL = {} as Record<ChatPart, HTMLDivElement>;
    const buildChat = () => {
      chatCam.innerHTML = "";
      BEATS.forEach((b) => {
        const sec = el("div", "c-beat off", b.html());
        sec.dataset.part = b.id;
        sec.addEventListener("click", () => {
          if (!sec.classList.contains("past")) return;
          const target = document.getElementById(PART_ANCHOR[b.id]);
          if (target) target.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
        });
        chatCam.appendChild(sec);
        BEAT_EL[b.id] = sec;
      });
    };

    const setDockHighlight = (part: ChatPart) => {
      const active = CHAT_ACTORS[part] || [];
      DOCK_IDS.forEach((id) => {
        const n = NE[id];
        const on = active.includes(id);
        n.classList.toggle("spot", on && id !== "he");
        n.classList.toggle("dim", !on);
      });
      const audOn = part === "au";
      dockAuditPath.classList.toggle("hot", audOn);
      dockAuditAh.classList.toggle("hot", audOn);
      if (part !== "pi") {
        dockLoopPath.style.opacity = "0";
        dockLoopAh.style.opacity = "0";
        dockLoopPath.classList.remove("hot");
        dockLoopAh.classList.remove("hot");
      }
    };

    const positionChatCamera = (activePartId: ChatPart) => {
      const clipH = chatClip.clientHeight || 560;
      const ai = PARTS.indexOf(activePartId);
      const activeEl = BEAT_EL[activePartId];
      if (!activeEl || ai < 0) return;
      const activeBottom = activeEl.offsetTop + activeEl.offsetHeight;
      let anchorTop = activeEl.offsetTop;
      for (let i = ai - 1; i >= 0; i--) {
        const prev = BEAT_EL[PARTS[i]];
        if (activeBottom - prev.offsetTop <= clipH - 20) anchorTop = prev.offsetTop;
        else break;
      }
      let cy = Math.max(0, anchorTop - 4);
      if (activeEl.offsetHeight > clipH - 16) {
        const kids = Array.from(activeEl.querySelectorAll<HTMLElement>(".c-item"));
        let pick = activeEl.offsetTop;
        for (let k = kids.length - 1; k >= 0; k--) {
          const topK = kids[k].offsetTop;
          if (activeBottom - topK <= clipH - 12) pick = topK;
          else break;
        }
        cy = Math.max(0, pick - 6);
      }
      chatCam.style.transform = `translate3d(0, ${-cy}px, 0)`;
    };

    const settleBeatInstant = (id: ChatPart, ai: number) => {
      const sec = BEAT_EL[id];
      const bi = PARTS.indexOf(id);
      sec.querySelectorAll<HTMLElement>(".c-item").forEach((it) => {
        it.style.opacity = "";
        it.style.transform = "";
      });
      sec.querySelectorAll<HTMLElement>("[data-stagger]").forEach((s) => {
        s.style.opacity = "";
        s.style.transform = "";
      });
      sec.querySelectorAll<SVGPathElement>(".c-chk path").forEach((p) => {
        p.style.strokeDasharray = "none";
        p.style.strokeDashoffset = "0";
      });
      if (id === "sc") {
        const bal = sec.querySelector('[data-opt="bal"]');
        if (bal) bal.classList.toggle("picked", ai > bi);
      }
      if (id === "sg") {
        const dot = sec.querySelector("[data-wait-dot]");
        const txt = sec.querySelector("[data-wait-txt]");
        const sub = sec.querySelector("[data-wait-sub]");
        if (dot) dot.classList.toggle("ok", ai > bi);
        if (txt) txt.textContent = ai > bi ? "Approved by Aedwon" : "Paused on public action";
        if (sub) sub.textContent = ai > bi ? "Public action unlocked" : "Waits for Aedwon";
      }
      if (id === "pi" && ai > bi) {
        dockLoopPath.classList.add("hot");
        dockLoopAh.classList.add("hot");
        dockLoopPath.style.opacity = "1";
        dockLoopAh.style.opacity = "1";
        dockLoopPath.style.strokeDasharray = "none";
        dockLoopPath.style.strokeDashoffset = "0";
      }
    };

    const playChat = async (rid: number, part: ChatPart) => {
      const ai = PARTS.indexOf(part);
      setDockHighlight(part);

      PARTS.forEach((id, i) => {
        const sec = BEAT_EL[id];
        const vis = i <= ai;
        sec.classList.toggle("off", !vis);
        sec.classList.toggle("past", i < ai);
        if (i < ai) settleBeatInstant(id, ai);
      });

      const cur = BEAT_EL[part];
      const items = Array.from(cur.querySelectorAll<HTMLElement>(".c-item"));

      if (part === "sc") {
        const b = cur.querySelector('[data-opt="bal"]');
        if (b) b.classList.remove("picked");
      }
      if (part === "sg") {
        const d = cur.querySelector("[data-wait-dot]");
        const tx = cur.querySelector("[data-wait-txt]");
        const sb = cur.querySelector("[data-wait-sub]");
        if (d) d.classList.remove("ok");
        if (tx) tx.textContent = "Paused on public action";
        if (sb) sb.textContent = "Waits for Aedwon";
      }

      if (RM) {
        settleBeatInstant(part, ai + 1);
        positionChatCamera(part);
        return;
      }

      items.forEach((it) => {
        it.style.opacity = "0";
        const d = it.dataset.dir;
        it.style.transform = d === "r" ? "translate3d(14px, 6px, 0)" : d === "l" ? "translate3d(-14px, 6px, 0)" : "translate3d(0, 10px, 0)";
      });
      cur.querySelectorAll<HTMLElement>("[data-stagger]").forEach((s) => {
        s.style.opacity = "0";
        s.style.transform = "translate3d(0, 6px, 0)";
      });
      cur.querySelectorAll<SVGPathElement>(".c-chk path").forEach((p) => {
        p.style.strokeDasharray = "1";
        p.style.strokeDashoffset = "1";
      });

      positionChatCamera(part);
      await wait(240);
      if (disposed || rid !== runId) return;

      for (let k = 0; k < items.length; k++) {
        if (disposed || rid !== runId) return;
        const it = items[k];
        const d = it.dataset.dir;
        const startT = d === "r" ? "translate3d(14px, 6px, 0)" : d === "l" ? "translate3d(-14px, 6px, 0)" : "translate3d(0, 10px, 0)";
        it.style.opacity = "1";
        it.style.transform = "none";
        const anim = safeAnimate(
          it,
          [
            { opacity: 0, transform: startT },
            { opacity: 1, transform: "translate3d(0,0,0)" },
          ],
          { duration: 380, easing: EASE },
        );

        const stags = Array.from(it.querySelectorAll<HTMLElement>("[data-stagger]"));
        if (stags.length) {
          stags.forEach((s, si) => {
            s.style.opacity = "1";
            s.style.transform = "none";
            safeAnimate(
              s,
              [
                { opacity: 0, transform: "translate3d(0, 6px, 0)" },
                { opacity: 1, transform: "translate3d(0, 0, 0)" },
              ],
              { duration: 300, delay: 140 + si * 120, easing: EASE, fill: "backwards" },
            );
          });
        }

        const chk = it.querySelector(".c-chk path");
        if (chk) safeAnimate(chk, [{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], { duration: 380, delay: 220, easing: EASE, fill: "forwards" });

        if (it.dataset.trigger === "pick-bal") {
          await wait(260);
          if (disposed || rid !== runId) return;
          const bal = cur.querySelector('[data-opt="bal"]');
          if (bal) {
            bal.classList.add("picked");
            safeAnimate(bal, [{ transform: "scale(0.985)" }, { transform: "scale(1.012)", offset: 0.55 }, { transform: "scale(1)" }], {
              duration: 320,
              easing: EASE_SETTLE,
            });
          }
        }
        if (it.dataset.trigger === "approve-pub") {
          await wait(260);
          if (disposed || rid !== runId) return;
          const dot = cur.querySelector("[data-wait-dot]");
          const txt = cur.querySelector("[data-wait-txt]");
          const sub = cur.querySelector("[data-wait-sub]");
          if (dot) {
            dot.classList.add("ok");
            safeAnimate(dot, [{ transform: "scale(0.7)" }, { transform: "scale(1.3)", offset: 0.55 }, { transform: "scale(1)" }], {
              duration: 320,
              easing: EASE_SETTLE,
            });
          }
          if (txt) txt.textContent = "Approved by Aedwon";
          if (sub) sub.textContent = "Public action unlocked";
        }
        if (it.dataset.trigger === "loop-rule") {
          await wait(340);
          if (disposed || rid !== runId) return;
          dockLoopPath.classList.add("hot");
          dockLoopAh.classList.add("hot");
          dockLoopPath.style.opacity = "1";
          dockLoopAh.style.opacity = "1";
          safeAnimate(dockLoopPath, [{ strokeDasharray: "1", strokeDashoffset: "1" }, { strokeDasharray: "1", strokeDashoffset: "0" }], {
            duration: 420,
            easing: EASE,
            fill: "forwards",
          });
          safeAnimate(dockLoopAh, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, delay: 300, fill: "backwards" });
          await wait(360);
          if (disposed || rid !== runId) return;
          settleNode("pol");
        }

        if (anim) await anim.finished.catch(() => {});
        if (disposed || rid !== runId) return;
        if (k < items.length - 1) {
          const extraPause = it.dataset.pause ? +it.dataset.pause : 0;
          await wait(440 + extraPause);
        }
      }
    };

    const toChat = async () => {
      scene = "chat";
      stage.classList.add("scene-chat");
      clearOrg();
      wires.style.opacity = "0";
      ORDER.forEach((id) => {
        const n = NE[id];
        n.classList.remove("dim", "spot");
        n.classList.toggle("gone", !DOCK_IDS.includes(id));
        n.classList.add("head");
      });
      applyCamera();
      placeNodes();
      drawDockWires();
      await wait(RM ? 0 : T.slow);
    };

    const toOrg = () => {
      scene = "org";
      stage.classList.remove("scene-chat");
      PARTS.forEach((id) => BEAT_EL[id].classList.add("off"));
      ORDER.forEach((id) => NE[id].classList.remove("head", "gone"));
      wires.style.opacity = "1";
      applyCamera();
      placeNodes();
      live(T.slow + 100);
    };

    const go = async (part: PartId) => {
      if (part === current) return;
      cancelLive();
      current = part;
      const rid = ++runId;
      const isChat = (PARTS as string[]).includes(part);
      if (isChat) {
        const fresh = scene !== "chat";
        if (fresh) {
          await toChat();
          if (disposed || rid !== runId) return;
        }
        await playChat(rid, part as ChatPart);
      } else {
        if (scene !== "org") toOrg();
        const sp = part as SetupPart;
        setOrgPart(sp);
        applyCamera();
        live(T.slow + 100);
        const demo = DEMO[sp];
        if (demo) {
          await wait(RM ? 0 : T.base);
          if (disposed || rid !== runId) return;
          drawWires();
          void demo(rid);
        }
      }
    };

    const partEls = Array.from(document.querySelectorAll<HTMLElement>("[data-part]"));
    const activePart = (): PartId => {
      const ih = Math.min(window.innerHeight, 1000);
      const line = narrow ? 364 + Math.min(110, (ih - 364) * 0.28) : ih * 0.44;
      let p: PartId = "rest";
      for (const e of partEls) {
        const h = e.querySelector("h3") || e;
        if (h.getBoundingClientRect().top < line && e.dataset.part) p = e.dataset.part as PartId;
      }
      return p;
    };

    let ticking = false;
    let rafScroll = 0;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafScroll = requestAnimationFrame(() => {
        ticking = false;
        if (!disposed) void go(activePart());
      });
    };

    const signature = () => {
      const steps: [string, number][] = [
        ["he", 0],
        ["w:heLead", 160],
        ["lead", 380],
        ["frame", 520],
        ["w:leadImpl", 560],
        ["w:leadBulk", 640],
        ["impl", 760],
        ["bulk", 840],
        ["w:advLead", 900],
        ["adv", 980],
        ["w:leadAud", 940],
        ["aud", 1080],
        ["pol", 1060],
        ["pb", 1140],
        ["w:polLead", 1200],
        ["w:pbLead", 1260],
      ];
      if (RM) return;
      steps.forEach(([k, t]) => {
        if (k.startsWith("w:")) {
          const w = W_EL[k.slice(2) as WireId];
          w.g.setAttribute("data-signature", "");
          if (w.p.classList.contains("dots")) {
            safeAnimate(w.g, [{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: t, fill: "backwards", easing: EASE });
          } else {
            safeAnimate(w.p, [{ strokeDasharray: "1", strokeDashoffset: "1" }, { strokeDasharray: "1", strokeDashoffset: "0" }], {
              duration: 360,
              delay: t,
              fill: "backwards",
              easing: EASE,
            });
            [w.c1, w.c2, w.ah].forEach((e) =>
              safeAnimate(e, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, delay: t + (e === w.c1 ? 0 : 260), fill: "backwards" }),
            );
          }
        } else {
          const e = k === "frame" ? frame : NE[k as NodeId];
          e.setAttribute("data-signature", "");
          const dy = k === "aud" ? -10 : 10;
          safeAnimate(e, [{ opacity: 0, transform: `translate3d(0,${dy}px,0) scale(0.985)` }, { opacity: 1, transform: "none" }], {
            duration: k === "frame" ? 400 : 340,
            delay: t,
            fill: "backwards",
            easing: EASE,
          });
        }
      });
      safeAnimate(marks, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1180, fill: "backwards" });
    };

    const relayout = () => {
      if (disposed) return;
      measure();
      applyCamera();
      placeNodes();
      drawWires();
      drawDockWires();
      if (scene === "chat" && current && (PARTS as string[]).includes(current)) positionChatCamera(current as ChatPart);
    };

    measure();
    buildChat();
    current = "rest";
    setOrgPart("rest");
    applyCamera();
    placeNodes();
    drawWires();
    drawDockWires();
    signature();

    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    let rz: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (rz) clearTimeout(rz);
      rz = setTimeout(relayout, 120);
    };
    window.addEventListener("resize", onResize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) {
          drawWires();
          drawDockWires();
        }
      });
    }
    const initTimer = setTimeout(onScroll, 60);
    timers.add(initTimer);

    return () => {
      disposed = true;
      cancelLive();
      cancelAnimationFrame(rafLive);
      cancelAnimationFrame(rafScroll);
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      if (rz) clearTimeout(rz);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="inst" id="inst">
      <div className="view" ref={viewRef} role="region" aria-label="Living picture of the company and workflow">
        <div className="stage" ref={stageRef} />
      </div>
    </div>
  );
}

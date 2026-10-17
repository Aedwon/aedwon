'use client';

// AboutVolumes: the About shelf ("Volumes") and its six books
// (spec/about-books.md, ported from AboutVolumes.dc.html, dark canonical).
//
// Structure per the spec: ONE requestAnimationFrame loop advances scalars held in
// refs (open progress p, hover springs, mouse smoothing, turn/settle clocks), then
// a pure per-frame pass writes CSS transforms and shade opacities straight to the
// DOM. No setState per frame, no CSS transitions for §3.1-3.9 of the spec.
// Books dim through black .shade overlays on each face, never through opacity,
// because opacity would flatten the preserve-3d context (spec §7.1).

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import BookPage from './BookPage';
import type { AboutVolumesHandle, Req } from './contracts';
import { VOLUMES, type BookPageDef, type Volume } from '@/lib/design-v3/data/volumes';
import { useTheme } from '@/lib/design-v3/theme';

const LAST = VOLUMES.length - 1;
const HH = 600; // book height
const S0 = 0.92; // shelf scale
const GAP = 12;

// ---------------------------------------------------------------- math (AV:289-322)

const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }; // easeInOutCubic
const ease2 = (x: number) => { x = cl(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }; // easeInOutQuad
const back = (x: number) => { x = cl(x); const c = 1.25; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }; // easeOutBack
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = Math.PI / 180;

// one light, up and to the left, slightly in front (AV:302)
const Lx = -0.38, Ly = -0.58, Lz = 0.72, Ln = Math.hypot(Lx, Ly, Lz);

type Rot = (x: number, y: number, z: number) => [number, number, number];
// Z, then Y, then X -- matches the CSS rotateX() rotateY() rotateZ() order (AV:305-308)
const mkR = (rx: number, ry: number, rz: number): Rot => {
  const cx = Math.cos(rx * rad), sx = Math.sin(rx * rad), cy = Math.cos(ry * rad), sy = Math.sin(ry * rad), cz = Math.cos(rz * rad), sz = Math.sin(rz * rad);
  return (x, y, z) => {
    const x1 = cz * x - sz * y, y1 = sz * x + cz * y;
    const x2 = cy * x1 + sy * z, z2 = -sy * x1 + cy * z;
    return [x2, cx * y1 - sx * z2, sx * y1 + cx * z2];
  };
};
// the returned value is the .shade opacity (black overlay)
const shadeOf = (nx: number, ny: number, nz: number, R: Rot, k: number, dim: number) => {
  const v = R(nx, ny, nz);
  const lit = Math.max(0, (v[0] * Lx + v[1] * Ly + v[2] * Lz) / Ln);
  const sh = (1 - lit) * k;
  return (1 - (1 - sh) * (1 - (dim || 0))).toFixed(3);
};

// ---------------------------------------------------------------- geometry (AV:206-209)

// shelf positions: each spine's on-screen width is D*0.92, centred on the artboard
const SX = (() => {
  const widths = VOLUMES.map((v) => v.D * S0);
  let x = 720 - (widths.reduce((a, w) => a + w, 0) + GAP * (widths.length - 1)) / 2 + 30;
  return VOLUMES.map((v, i) => { const sx = x + widths[i] / 2; x += widths[i] + GAP; return sx; });
})();

interface Pose { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number; cover: number }
const POSE_KEYS = ['x', 'y', 'z', 'rx', 'ry', 'rz', 's', 'cover'] as const;

// AV:342, exact function order and precision
const tfOf = (P: Pose) =>
  `translate3d(${(P.x - 210).toFixed(2)}px, ${(P.y - 300).toFixed(2)}px, ${P.z.toFixed(2)}px) rotateX(${P.rx.toFixed(3)}deg) rotateY(${P.ry.toFixed(3)}deg) rotateZ(${P.rz.toFixed(3)}deg) scale(${P.s.toFixed(4)})`;

// the intro's first-frame pose: every book starts 420px below rest, fully dimmed
const INIT_TF = SX.map((sx) => tfOf({ x: sx, y: 780 - HH * S0 / 2 + 420, z: -210 * S0, rx: 0, ry: 100, rz: 0, s: S0, cover: 0 }));

// ---------------------------------------------------------------- page data helpers (AV:356)

const pgOf = (v: Volume, i: number): BookPageDef =>
  v.all[i] || { kind: 'end', vol: v.n, nextVol: '', nextTitle: '' };

const idleRead = (v: Volume, s: number) => ({
  L: pgOf(v, 2 * s),
  R: pgOf(v, 2 * s + 1),
  A: pgOf(v, 2 * s + 1),
  B: pgOf(v, Math.min(v.all.length - 1, 2 * s + 2)),
});

// ---------------------------------------------------------------- styles (AV:12-28)

// prototype helmet rules; theme-dependent colours read tokens. Scoped to .v3av.
const AV_CSS = `
.mono{font-family:'Geist Mono',monospace}
.v3av .nlink{color:var(--text-secondary);text-decoration:none;transition:color .2s ease}
.v3av .nlink:hover{color:var(--text-primary)}
.v3av .ctl{transition:scale .3s cubic-bezier(.34,1.56,.64,1),background-color .2s ease,opacity .2s ease}
.v3av .ctl:hover{background-color:var(--surface-control-hover)}
.v3av .ctl:active{scale:.94}
.v3av a:focus-visible,.v3av button:focus-visible{outline:2px solid var(--text-primary);outline-offset:3px}
.face{position:absolute;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-sizing:border-box}
.shade{position:absolute;inset:0;background:#000;pointer-events:none}
.edge{background-color:#E4E2DB;background-image:repeating-linear-gradient(to bottom,#E4E2DB 0px,#E4E2DB 2px,#cfcdc5 2px,#cfcdc5 3px)}
.edgeV{background-color:#E4E2DB;background-image:repeating-linear-gradient(to right,#E4E2DB 0px,#E4E2DB 2px,#cfcdc5 2px,#cfcdc5 3px)}
.hit{position:absolute;padding:0;border:none;background:transparent;cursor:pointer}
.v3av .hit:focus-visible{outline:2px solid var(--text-primary);outline-offset:4px}
.pagehit{cursor:pointer}
`;

// ---------------------------------------------------------------- component

export interface AboutVolumesProps {
  bare?: boolean;
  initialOpenReq?: Req;
  onScrollOut?: (dy: number) => void;
  onOpen?: (o: '' | 'book' | 'contact') => void;
  hintSize?: string;
}

interface Turn { from: number; to: number; dir: 1 | -1; fast: boolean; t: number }

// Discrete render state. Continuous values live in st (refs) and are written to the
// DOM per frame; this state only changes at event boundaries (open/close/turn),
// so the 14+ mounted BookPages re-render a handful of times per turn, not per frame.
interface Disc {
  active: number | null;
  pending: number | null;
  leafOn: boolean; // the leaf stays mounted while reading so a turn starts instantly
  barAt: number; // the spread the reading bar names (turn target while turning)
  L: BookPageDef; // page under the cover hinge (left)
  R: BookPageDef; // page on the right stack
  A: BookPageDef; // leaf front (right-side page it lifts)
  B: BookPageDef; // leaf back (left-side page it lays down)
}

interface BookRefs {
  root: HTMLDivElement | null;
  back: HTMLDivElement | null;
  spine: HTMLDivElement | null;
  hinge: HTMLDivElement | null;
  inside: HTMLDivElement | null;
  stack: HTMLDivElement | null;
  cast: HTMLSpanElement | null;
  leaf: HTMLDivElement | null;
  shBack: HTMLSpanElement | null;
  shSpine: HTMLSpanElement | null;
  shFore: HTMLSpanElement | null;
  shTop: HTMLSpanElement | null;
  shBottom: HTMLSpanElement | null;
  shFront: HTMLSpanElement | null;
  shInside: HTMLSpanElement | null;
  strips: (HTMLDivElement | null)[]; // 6, t1..t6
  faces: (HTMLDivElement | null)[]; // 12, front+back per strip (leaf-face opacity only)
  fshade: (HTMLSpanElement | null)[]; // 12, s{k}a / s{k}b
}

const mkRefs = (): BookRefs => ({
  root: null, back: null, spine: null, hinge: null, inside: null, stack: null, cast: null, leaf: null,
  shBack: null, shSpine: null, shFore: null, shTop: null, shBottom: null, shFront: null, shInside: null,
  strips: [], faces: [], fshade: [],
});

interface Api {
  okForm(): boolean;
  openVol(i: number, spread?: number): void;
  close(): void;
  startTurn(to: number): void;
  forward(): void;
  backward(): void;
  goPage(pageIndex: number): void;
  shelveIt(): void;
}

const AboutVolumes = forwardRef<AboutVolumesHandle, AboutVolumesProps>(function AboutVolumes(props, ref) {
  const { bare = false, initialOpenReq, onScrollOut, onOpen, hintSize } = props;
  void hintSize;
  const { theme } = useTheme();

  // ---- loop state (AV:210-216, in refs; advanced per frame, never via setState)
  const st = useRef({
    active: null as number | null,
    pending: null as number | null,
    pendingSpread: 0,
    p: 0, pt: 0, // open progress 0..1 and its target; linear clock, dt/1.9 per second
    spread: 0,
    turn: null as Turn | null,
    settle: null as Turn | null, // the finished turn, fading out over 0.16s
    queue: [] as number[],
    hov: VOLUMES.map(() => 0),
    hovT: VOLUMES.map(() => 0),
    m: { x: 0, y: 0 },
    ms: { x: 0, y: 0 },
    t0: 0, last: 0, raf: 0,
    reduced: false, // prefers-reduced-motion, read once on mount
    shelving: false, shelvedAt: null as number | null,
    wa: 0, wl: false, wt: null as ReturnType<typeof setTimeout> | null,
    lastO: null as '' | 'book' | 'contact' | null,
    swapped: false, // has the leaf fade-in hand-off fired for the current turn
    leafMounted: false, // mirror of disc.leafOn, to detect the crossing
  }).current;

  const [dv, setDv] = useState<Disc>(() => ({ active: null, pending: null, leafOn: false, barAt: 0, ...idleRead(VOLUMES[0], 0) }));
  const [clock, setClock] = useState('');
  const [form, setForm] = useState({ name: '', mail: '', msg: '', title: '' });

  // refs mirrored for the per-frame pass and for effects
  const formRef = useRef(form); formRef.current = form;
  const vRef = useRef(VOLUMES); vRef.current = VOLUMES;
  const cbs = useRef({ onScrollOut, onOpen }); cbs.current = { onScrollOut, onOpen };
  const kLightRef = useRef(0.5); kLightRef.current = theme === 'light' ? 0.26 : 0.5;

  // Vol. 06's running heads follow the title the visitor typed (AV:405)
  const V = useMemo(() => {
    const myTitle = form.title.trim();
    return VOLUMES.map((v, i) => (i === LAST && myTitle ? { ...v, all: v.all.map((pp) => ({ ...pp, running: myTitle })) } : v));
  }, [form.title]);
  useEffect(() => { vRef.current = V; }, [V]);

  const okForm = useCallback(() => {
    const f = formRef.current;
    return !!(f.name.trim() && f.msg.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.mail.trim()));
  }, []);
  const fm = useMemo(() => ({ ...form, ready: okForm() }), [form, okForm]);

  // ---- imperative behaviour (AV:258-287, 311, 405-431)
  const apiRef = useRef<Api>(null as unknown as Api);
  function openVol(i: number, spread = 0) {
    st.shelvedAt = null;
    if (st.active == null) {
      st.active = i; st.spread = spread; st.turn = null; st.queue = []; st.pt = 1; st.hovT[i] = 0;
      const v = vRef.current[i];
      setDv((d) => ({ ...d, active: i, pending: null, leafOn: false, barAt: spread, ...idleRead(v, spread) }));
    } else if (i !== st.active) {
      st.pending = i; st.pendingSpread = spread; st.turn = null; st.queue = []; st.pt = 0;
      const v = vRef.current[st.active];
      setDv((d) => ({ ...d, pending: i, leafOn: false, barAt: st.spread, ...idleRead(v, st.spread) }));
    }
  }
  function close() {
    st.pending = null; st.turn = null; st.queue = []; st.pt = 0;
    if (st.active != null) {
      const v = vRef.current[st.active];
      setDv((d) => ({ ...d, pending: null, barAt: st.spread, ...idleRead(v, st.spread) }));
    } else {
      setDv((d) => (d.pending == null ? d : { ...d, pending: null }));
    }
  }
  function startTurn(to: number) {
    if (st.active == null) return;
    const v = vRef.current[st.active]; if (!v) return;
    const from = st.turn ? st.turn.to : st.spread;
    if (to < 0 || to >= v.spreads || to === from) return;
    st.settle = null;
    st.turn = { from, to, dir: to > from ? 1 : -1, fast: Math.abs(to - from) > 1, t: 0 };
    st.swapped = false;
    // A/B are known at turn start; L/R keep showing the from pages until the leaf
    // has faded in over them (the loop swaps one of them at t >= 0.06)
    setDv((d) => ({
      ...d,
      A: st.turn!.dir > 0 ? pgOf(v, 2 * from + 1) : pgOf(v, 2 * to + 1),
      B: st.turn!.dir > 0 ? pgOf(v, 2 * to) : pgOf(v, 2 * from),
      barAt: to,
    }));
  }
  function forward() {
    if (!(st.active != null && st.p >= 0.999)) return;
    const v = vRef.current[st.active];
    const at = st.turn ? st.turn.to : st.spread;
    if (at >= v.spreads - 1) { if (st.active < LAST) openVol(st.active + 1); return; }
    if (st.turn) { if (st.queue.length < 2) st.queue.push(at + 1); } else startTurn(at + 1);
  }
  function backward() {
    if (!(st.active != null && st.p >= 0.999)) return;
    const at = st.turn ? st.turn.to : st.spread;
    if (at <= 0) return;
    if (st.turn) { if (st.queue.length < 2) st.queue.push(at - 1); } else startTurn(at - 1);
  }
  function goPage(pageIndex: number) {
    if (!(st.active != null && st.p >= 0.999)) return;
    const to = Math.floor(pageIndex / 2);
    if (st.turn) st.queue = [to]; else startTurn(to); // a long jump is one fast leaf turn
  }
  // NOTE for the build: post to a form endpoint here (Formspree, Resend, etc.) before shelving
  function shelveIt() {
    if (!okForm() || st.shelving || st.active !== LAST) return;
    st.spread = 0; st.turn = null; st.queue = []; st.shelving = true; st.shelvedAt = null;
    const v = vRef.current[st.active];
    setDv((d) => ({ ...d, barAt: 0, ...idleRead(v, 0) }));
    close();
  }
  apiRef.current = { okForm, openVol, close, startTurn, forward, backward, goPage, shelveIt };

  const setField = useCallback((k: 'name' | 'mail' | 'msg' | 'title', val: string) => {
    setForm((f) => ({ ...f, [k]: val }));
  }, []);
  const again = useCallback(() => {
    setForm((f) => ({ ...f, msg: '', title: '' })); // keeps name and mail; running heads reset via V
    apiRef.current.openVol(LAST);
  }, []);
  const fwdClick = useCallback(() => apiRef.current.forward(), []);
  const backPageClick = useCallback(() => apiRef.current.backward(), []);
  const goPageCb = useCallback((pgIndex: number) => apiRef.current.goPage(pgIndex), []);
  const nextVolCb = useCallback(() => { const a = st.active; if (a != null && a < LAST) apiRef.current.openVol(a + 1); }, [st]);
  const shelveCb = useCallback(() => apiRef.current.shelveIt(), []);

  // ---- refs to every node the per-frame pass writes to
  const rootRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hitRefs = useRef<(HTMLButtonElement | null)[]>(VOLUMES.map(() => null));
  const bookRefs = useRef<BookRefs[]>(VOLUMES.map(() => mkRefs()));

  // ---- the per-frame pass (renderVals, AV:288-437), writing to the DOM directly
  function renderFrame(now: number) {
    const T = (now - st.t0) / 1000;
    const p = st.p;
    const A = st.active;
    const openK = cl(p * 1.4);
    const sinceShelf = st.shelvedAt == null ? 9 : (now - st.shelvedAt) / 1000;
    const wob = sinceShelf < 0.6 ? Math.sin(Math.PI * sinceShelf / 0.6) * (1 - sinceShelf / 0.6) : 0;
    const kLight = kLightRef.current;

    let arx = 0, ary = 0; // the active book's rounded rx/ry, for the leaf shading (AV:360)
    for (let i = 0; i <= LAST; i++) {
      const v = VOLUMES[i];
      const br = bookRefs.current[i];
      if (!br) continue;
      // §3.1 intro: books rise onto the shelf, one after another, dimmed by their shades
      const intro = st.reduced ? 1 : back((T - 0.15 - i * 0.08) / 0.9);
      const h = st.hov[i];
      // §3.2 shelf pose: spine out; hovered books slide out and tip toward you
      let P: Pose = { x: SX[i], y: 780 - HH * S0 / 2 + (1 - intro) * 420, z: -210 * S0 + 70 * h, rx: -7 * h, ry: 100, rz: 0, s: S0, cover: 0 };
      P.y -= 22 * h;
      if (i === LAST) { P.rz += 3 * wob; P.y -= 6 * wob; } else if (i === LAST - 1) P.rz -= 1.4 * wob; // §3.8 shelved wobble
      let dim = 1 - cl(intro * 1.4);
      if (A != null && i === A) {
        // §3.3 open path: shelf → pulled out → open spread, linear p, eased channels
        const a = ease(p / 0.52), b2 = ease2((p - 0.44) / 0.56);
        const C: Pose = { x: 720, y: 468, z: 150, rx: 7, ry: -26, rz: 0, s: 1, cover: 0 };
        const O: Pose = { x: 930 + st.ms.x * 4, y: 500, z: 20, rx: 13 - st.ms.y * 2, ry: st.ms.x * 2.5, rz: 0, s: 1, cover: -176 };
        const k1 = {} as Pose;
        POSE_KEYS.forEach((key) => { k1[key] = lerp(P[key], C[key], a); });
        k1.y -= Math.sin(Math.PI * a) * 80; k1.z += Math.sin(Math.PI * a) * 90; k1.rz = Math.sin(Math.PI * a) * -6;
        const k2 = {} as Pose;
        POSE_KEYS.forEach((key) => { k2[key] = lerp(k1[key], O[key], b2); });
        k2.cover = -176 * ease((p - 0.5) / 0.5) + (p > 0.5 ? Math.sin(Math.PI * cl((p - 0.5) / 0.5)) * -4 : 0);
        P = k2; dim = 0;
        arx = parseFloat(P.rx.toFixed(3)); ary = parseFloat(P.ry.toFixed(3));
      } else if (A != null) {
        // step back so the open book never cuts through them
        dim = Math.max(dim, 0.9 * openK); P.y += 60 * openK; P.z -= 520 * openK;
      }
      const R = mkR(P.rx, P.ry, P.rz);
      const cv = P.cover * rad;
      const fx = Math.sin(cv), fz = Math.cos(cv);
      // light-toned volumes get a lighter front/spine key in the light theme (spec §6)
      const lightBook = v.ink === '#0a0a0c';
      const kf = lightBook ? kLight : 0.6;
      const ks = lightBook ? kLight : 0.62;

      if (br.root) br.root.style.transform = tfOf(P);
      if (br.hinge) br.hinge.style.transform = `rotateY(${P.cover.toFixed(3)}deg)`;
      // once a book lies open, its spine and back sit exactly on the hinge line; drawing
      // them there makes the gutter shimmer (spec §7.3)
      const solid = A != null && i === A && p > 0.9 ? 'hidden' : 'visible';
      if (br.back) br.back.style.visibility = solid;
      if (br.shBack) br.shBack.style.opacity = shadeOf(0, 0, -1, R, 0.6, dim);
      if (br.spine) br.spine.style.visibility = solid;
      if (br.shSpine) br.shSpine.style.opacity = shadeOf(-1, 0, 0, R, ks, dim);
      if (br.shFore) br.shFore.style.opacity = shadeOf(1, 0, 0, R, 0.55, dim);
      if (br.shTop) br.shTop.style.opacity = shadeOf(0, -1, 0, R, 0.5, dim);
      if (br.shBottom) br.shBottom.style.opacity = shadeOf(0, 1, 0, R, 0.6, dim);
      if (br.shFront) br.shFront.style.opacity = shadeOf(fx, 0, fz, R, kf, dim);
      if (br.shInside) br.shInside.style.opacity = shadeOf(-fx, 0, -fz, R, 0.26, dim);
    }

    // §3.6 the turning leaf: transforms and per-strip shading for the open book
    const ready = st.active != null && st.p >= 0.999;
    const settling = !st.turn && !!st.settle;
    const tr = st.turn || (st.settle ? { ...st.settle, t: 1 } : null);
    const A2 = st.active;
    // leaf shading reads the active book's rounded rx/ry back from its transform, rz ignored
    const RBox = A2 != null ? mkR(arx, ary, 0) : mkR(0, 0, 0);
    let pe = 'none';
    let fo = '0.000', ls = 'scale(0.982)', vis = 'hidden';
    let castOp = '0.000', castVis = 'hidden', castW = '0px';
    if (tr && A2 != null) {
      const e = ease(tr.t);
      const ang = tr.dir > 0 ? -176 * e : -176 * (1 - e);
      const lift = Math.sin(Math.PI * e);
      // the free edge lags behind the spine, so the page curls as it goes over
      const bend = lift * 6.5 * (tr.dir > 0 ? 1 : -1);
      // where the leaf is between the two stacks: 0 = lying on the right page, 1 = on the left
      const fL = -ang / 176;
      const flatA = parseFloat(shadeOf(0, 0, 1, RBox, 0.45, 0));
      // the leaf's front is shaded relative to a page lying flat, so it matches the page
      // it lifts off and lands on
      const shA = (g: number) => { const r = g * rad; return Math.max(0, parseFloat(shadeOf(Math.sin(r), 0, Math.cos(r), RBox, 0.45, 0)) - flatA).toFixed(3); };
      const shB = (g: number) => { const r = g * rad; return shadeOf(-Math.sin(r), 0, -Math.cos(r), RBox, 0.26, 0); };
      fo = (settling ? 1 - cl(st.settle!.t) : cl(tr.t / 0.06)).toFixed(3);
      ls = `scale(${(0.982 + 0.018 * fL).toFixed(5)})`;
      vis = 'visible';
      pe = settling && ready ? 'auto' : 'none';
      castVis = lift > 0.01 ? 'visible' : 'hidden';
      castOp = (lift * 0.9).toFixed(3);
      castW = `${(40 + 300 * (1 - Math.abs(ang + 88) / 88)).toFixed(0)}px`;
      const br = bookRefs.current[A2];
      if (br) {
        for (let k = 1; k <= 6; k++) {
          const g = ang + (k - 1) * bend;
          const strip = br.strips[k - 1];
          if (strip) strip.style.transform = k === 1
            ? `translateZ(${(-2.8 + 3.1 * fL + lift * 10).toFixed(3)}px) rotateY(${ang.toFixed(3)}deg)`
            : `rotateY(${bend.toFixed(3)}deg)`;
          const fa = br.faces[(k - 1) * 2], fb = br.faces[(k - 1) * 2 + 1];
          if (fa) fa.style.opacity = fo;
          if (fb) fb.style.opacity = fo;
          const sha = br.fshade[(k - 1) * 2], shb = br.fshade[(k - 1) * 2 + 1];
          if (sha) sha.style.opacity = shA(g);
          if (shb) shb.style.opacity = shB(g);
        }
      }
    } else if (A2 != null) {
      pe = ready ? 'auto' : 'none';
      const br = bookRefs.current[A2];
      if (br) {
        for (let k = 1; k <= 6; k++) {
          const strip = br.strips[k - 1];
          if (strip) strip.style.transform = 'none';
          const fa = br.faces[(k - 1) * 2], fb = br.faces[(k - 1) * 2 + 1];
          if (fa) fa.style.opacity = '0';
          if (fb) fb.style.opacity = '0';
        }
      }
    }
    if (A2 != null) {
      const br = bookRefs.current[A2];
      if (br) {
        if (br.leaf) { br.leaf.style.transform = ls; br.leaf.style.visibility = vis; }
        if (br.stack) br.stack.style.pointerEvents = pe;
        if (br.inside) br.inside.style.pointerEvents = pe;
        if (br.cast) { br.cast.style.width = castW; br.cast.style.opacity = castOp; br.cast.style.visibility = castVis; }
      }
    }

    // §2D layers: room step-back (AV:410), done block (AV:407), reading bar (AV:400), hits
    if (roomRef.current) {
      roomRef.current.style.opacity = (1 - 0.7 * openK).toFixed(3);
      roomRef.current.style.translate = `0 ${(openK * 18).toFixed(1)}px`;
    }
    const dDone = st.shelvedAt == null || st.active != null ? 0 : 1 - Math.pow(1 - cl((sinceShelf - 0.1) / 0.5), 3);
    if (doneRef.current) {
      doneRef.current.style.opacity = dDone.toFixed(3);
      doneRef.current.style.translate = `0 ${((1 - dDone) * 14).toFixed(1)}px`;
      doneRef.current.style.pointerEvents = dDone > 0.5 ? 'auto' : 'none';
    }
    const bk = st.active != null ? cl((p - 0.85) / 0.15) : 0;
    if (barRef.current) {
      barRef.current.style.opacity = bk.toFixed(3);
      barRef.current.style.translate = `-50% ${((1 - bk) * 16).toFixed(1)}px`;
      barRef.current.style.pointerEvents = ready ? 'auto' : 'none';
    }
    const hpe = st.active == null ? 'auto' : 'none';
    for (let i = 0; i <= LAST; i++) { const el = hitRefs.current[i]; if (el) el.style.pointerEvents = hpe; }
  }

  // ---- the one rAF loop (AV:232-255) + wheel handling (AV:221-229)
  useEffect(() => {
    st.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    st.t0 = performance.now();
    st.last = st.t0;
    const root = rootRef.current;

    const onWheel = (e: WheelEvent) => {
      if (st.active == null) {
        if (cbs.current.onScrollOut) { e.preventDefault(); cbs.current.onScrollOut(e.deltaY); }
        return;
      }
      e.preventDefault();
      if (st.wt) clearTimeout(st.wt);
      st.wt = setTimeout(() => { st.wl = false; st.wa = 0; }, 220);
      if (st.wl) return;
      st.wa = (st.wa || 0) + e.deltaY + e.deltaX;
      if (Math.abs(st.wa) > 40) { if (st.wa > 0) apiRef.current.forward(); else apiRef.current.backward(); st.wl = true; st.wa = 0; }
    };
    root?.addEventListener('wheel', onWheel, { passive: false });

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
      // §3.4 mouse parallax, smoothed
      st.ms.x += (st.m.x - st.ms.x) * Math.min(1, dt * 3);
      st.ms.y += (st.m.y - st.ms.y) * Math.min(1, dt * 3);
      // §3.3 open / close progress: linear p, dt/1.9 per second, both directions
      const d = Math.sign(st.pt - st.p);
      if (st.reduced) st.p = st.pt;
      else if (d) { st.p += (d * dt) / 1.9; if ((d > 0 && st.p > st.pt) || (d < 0 && st.p < st.pt)) st.p = st.pt; }
      // close landing: swap to a pending volume, or release the shelf
      if (st.p === 0 && st.pt === 0 && st.active != null) {
        if (st.pending != null) {
          st.active = st.pending; st.pending = null;
          st.spread = st.pendingSpread || 0; st.pendingSpread = 0; st.pt = 1;
          const v = vRef.current[st.active];
          setDv((dd) => ({ ...dd, active: st.active, pending: null, leafOn: false, barAt: st.spread, ...idleRead(v, st.spread) }));
        } else {
          st.active = null;
          if (st.shelving) { st.shelving = false; st.shelvedAt = now; }
          setDv((dd) => ({ ...dd, active: null, pending: null, leafOn: false }));
        }
      }
      // §3.2 hover springs
      for (let i = 0; i <= LAST; i++) { const t = st.hovT[i]; st.hov[i] += (t - st.hov[i]) * Math.min(1, dt * 9); }
      // §3.6 after landing, the leaf rests on the stack and dissolves into the page beneath
      if (st.settle) { st.settle.t += dt / 0.16; if (st.settle.t >= 1) st.settle = null; }
      // page turn; the next queued item starts in the same frame
      if (st.turn) {
        st.turn.t += st.reduced ? 1 : dt / (st.turn.fast ? 0.55 : 0.95);
        if (!st.swapped && st.turn.t >= 0.06) {
          // the leaf has faded in over an identical page; now swap the page beneath it
          st.swapped = true;
          const v = st.active != null ? vRef.current[st.active] : VOLUMES[0];
          if (st.turn.dir > 0) setDv((dd) => ({ ...dd, R: pgOf(v, 2 * st.turn!.to + 1) }));
          else setDv((dd) => ({ ...dd, L: pgOf(v, 2 * st.turn!.to) }));
        }
        if (st.turn.t >= 1) {
          const done = st.turn;
          st.spread = done.to;
          st.settle = null; // snap the leaf out: L/R already show the new page, so fading causes a visible pop
          st.turn = null;
          const v = st.active != null ? vRef.current[st.active] : VOLUMES[0];
          setDv((dd) => ({ ...dd, L: pgOf(v, 2 * done.to), R: pgOf(v, 2 * done.to + 1), barAt: done.to }));
          if (st.queue.length) startTurn(st.queue.shift()!);
        }
      }
      // the leaf mounts as soon as the book has fully opened, and stays mounted while reading
      const wantLeaf = st.active != null && (st.p >= 0.999 || !!st.turn);
      if (wantLeaf !== st.leafMounted) { st.leafMounted = wantLeaf; setDv((dd) => ({ ...dd, leafOn: wantLeaf })); }
      // §2.1 onOpen, on change only
      const o = st.active === LAST || st.pending === LAST ? 'contact' : (st.active != null ? 'book' : '');
      if (o !== st.lastO) { st.lastO = o; cbs.current.onOpen?.(o); }

      renderFrame(now);
      st.raf = requestAnimationFrame(loop);
    };
    st.raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(st.raf);
      if (st.wt) clearTimeout(st.wt);
      root?.removeEventListener('wheel', onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // §2.1 start behaviour: the host asks for a volume on mount; 'contact' → NaN → the last
  // volume, after 1100ms (0 with reduced motion)
  useEffect(() => {
    if (!initialOpenReq || !initialOpenReq.v) return;
    const n = parseInt(initialOpenReq.v.split('#')[0], 10);
    const idx = Number.isNaN(n) ? LAST : n;
    const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const id = setTimeout(() => apiRef.current.openVol(idx), reduced ? 0 : 1100);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manila clock, shown in the room and on the contact page
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useImperativeHandle(ref, () => ({
    // each Req is a fresh command (the nonce makes repeats fire); 'contact' → NaN → last volume
    openReq(req: Req) { const n = parseInt(req.v.split('#')[0], 10); apiRef.current.openVol(Number.isNaN(n) ? LAST : n); },
    closeReq(req: Req) { void req; apiRef.current.close(); },
  }), []);

  // ---- derived copy (per discrete render, not per frame)
  const myTitle = form.title.trim();
  const titleOf = (v: Volume, i: number) => (i === LAST && myTitle ? myTitle : v.title);
  const fsOf = (t: string) => (t.length > 12 ? '18px' : t.length > 9 ? '22px' : '27px');
  const cfsOf = (t: string) => (t.length > 16 ? '34px' : '46px');

  const vBar = dv.active != null ? V[dv.active] : V[0];
  const at = dv.barAt;
  const first = 2 * at;
  const lastP = Math.min(vBar.all.length - 1, 2 * at + 1);
  const isLast = at >= vBar.spreads - 1;
  const nextV = V[(dv.active == null ? 0 : dv.active) + 1];
  const barText = `Vol. ${vBar.n} · ${titleOf(vBar, dv.active == null ? 0 : dv.active)}${vBar.contact ? '' : ` · ${first === 0 ? 'Contents' : `pp. ${first}${lastP > first ? `–${lastP}` : ''}`} / ${vBar.all.length - 1}`}`;
  const cNav = dv.active === LAST || dv.pending === LAST;
  const doneLine = `Vol. 06, ${myTitle || 'Next volume'}, is on the shelf. I’ll write back to ${form.mail.trim() || 'you'}, usually within [a day].`;

  // a leaf strip: 70px wide, nested in the previous strip so the angles accumulate (AV:89-108)
  const renderStrip = (i: number, k: number): React.ReactNode => (
    <div
      key={k}
      ref={(el) => { bookRefs.current[i].strips[k - 1] = el; }}
      style={{ position: 'absolute', left: k === 1 ? 0 : 70, top: 0, width: 70, height: 600, transformOrigin: '0 50%', transformStyle: 'preserve-3d' }}
    >
      <div className="face" ref={(el) => { bookRefs.current[i].faces[(k - 1) * 2] = el; }} style={{ inset: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -(k - 1) * 70, top: 0, width: 420, height: 600 }}>
          <BookPage page={dv.A} side="right" clock={clock} form={fm} onField={setField} onShelve={shelveCb} />
        </div>
        <span className="shade" ref={(el) => { bookRefs.current[i].fshade[(k - 1) * 2] = el; }} />
      </div>
      <div className="face" ref={(el) => { bookRefs.current[i].faces[(k - 1) * 2 + 1] = el; }} style={{ inset: 0, transform: 'rotateY(180deg)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -(6 - k) * 70, top: 0, width: 420, height: 600 }}>
          <BookPage page={dv.B} side="left" clock={clock} form={fm} onField={setField} onShelve={shelveCb} />
        </div>
        <span className="shade" ref={(el) => { bookRefs.current[i].fshade[(k - 1) * 2 + 1] = el; }} />
      </div>
      {k < 6 && renderStrip(i, k + 1)}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className="v3av"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        st.m = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
      }}
      onMouseLeave={() => { st.m = { x: 0, y: 0 }; }}
      style={{
        position: 'relative', width: 1440, height: 900, overflow: 'hidden',
        background: bare ? 'transparent' : 'var(--room-bg)', color: 'var(--text-primary)',
        fontFamily: "'Geist', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
        perspective: 2600, perspectiveOrigin: '50% 46%',
      }}
    >
      <style>{AV_CSS}</style>

      {/* the room: a shelf, a small stack, a bookend (AV:33-43; §7 shelf tokens) */}
      <div ref={roomRef} aria-hidden style={{ position: 'absolute', inset: 0, opacity: 1, translate: '0 0px' }}>
        <div style={{ position: 'absolute', left: 300, width: 840, top: 780, height: 2, background: 'var(--shelf-top-edge)' }} />
        <div style={{ position: 'absolute', left: 300, width: 840, top: 782, height: 16, background: 'var(--shelf-front)', boxShadow: 'var(--shelf-front-shadow)' }} />
        <div style={{ position: 'absolute', left: 310, width: 820, top: 798, height: 26, background: 'var(--shelf-under)' }} />
        <div style={{ position: 'absolute', left: 340, top: 744, width: 150, height: 36, borderRadius: 3, background: 'var(--shelf-lying1)', borderTop: '1px solid var(--shelf-lying1-top)' }} />
        <div style={{ position: 'absolute', left: 350, top: 712, width: 134, height: 32, borderRadius: 3, background: 'var(--shelf-lying2)', borderTop: '1px solid var(--shelf-lying2-top)' }} />
        <div style={{ position: 'absolute', left: 346, top: 686, width: 142, height: 26, borderRadius: 3, background: 'var(--shelf-lying3)', borderTop: '1px solid var(--shelf-lying3-top)', boxShadow: 'var(--shelf-lying3-inset)' }} />
        <div style={{ position: 'absolute', left: 1004, top: 600, width: 14, height: 180, background: 'var(--shelf-bookend)', borderLeft: '1px solid var(--shelf-bookend-left)' }} />
        <div style={{ position: 'absolute', left: 1004, top: 766, width: 64, height: 14, background: 'var(--shelf-bookend)' }} />
        <span className="mono" style={{ position: 'absolute', right: 300, top: 846, fontSize: 12, color: 'var(--text-label)' }}>Manila · {clock}</span>
      </div>

      {/* the books, all in one 3D space (AV:46) */}
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
        {VOLUMES.map((v, i) => {
          const hd = v.D / 2;
          const spL = 210 - hd;
          const tbT = 300 - hd;
          const t = titleOf(v, i);
          return (
            <div
              key={i}
              ref={(el) => { bookRefs.current[i].root = el; }}
              style={{ position: 'absolute', left: 0, top: 0, width: 420, height: 600, transformStyle: 'preserve-3d', transform: INIT_TF[i], opacity: 1 }}
            >
              {/* back cover */}
              <div
                className="face"
                ref={(el) => { bookRefs.current[i].back = el; }}
                style={{ left: 0, top: 0, width: 420, height: 600, transform: `rotateY(180deg) translateZ(${hd}px)`, background: v.tone, borderRadius: '3px 6px 6px 3px' }}
              >
                <span className="shade" ref={(el) => { bookRefs.current[i].shBack = el; }} />
              </div>

              {/* spine */}
              <div
                className="face"
                ref={(el) => { bookRefs.current[i].spine = el; }}
                style={{ left: spL, top: 0, width: v.D, height: 600, transform: 'rotateY(-90deg) translateZ(210px)', background: v.tone, color: v.ink, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0 20px', overflow: 'hidden' }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', opacity: 0.7 }}>VOL.</span>
                  <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em' }}>{v.n}</span>
                </span>
                <span style={{ width: '64%', height: 1, background: 'currentColor', opacity: 0.28 }} />
                <span style={{ writingMode: 'vertical-rl', fontSize: fsOf(t), fontWeight: 800, letterSpacing: '0.03em', whiteSpace: 'nowrap', maxHeight: 360, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>
                <span style={{ width: '64%', height: 1, background: 'currentColor', opacity: 0.28 }} />
                <span className="mono" style={{ writingMode: 'vertical-rl', fontSize: 10.5, letterSpacing: '0.22em', opacity: 0.7 }}>AEDWON</span>
                <span className="shade" ref={(el) => { bookRefs.current[i].shSpine = el; }} />
              </div>

              {/* page edges */}
              <div className="face edge" style={{ left: spL, top: 5, width: v.D, height: 590, transform: 'rotateY(90deg) translateZ(206px)' }}>
                <span className="shade" ref={(el) => { bookRefs.current[i].shFore = el; }} />
              </div>
              <div className="face edgeV" style={{ left: 4, top: tbT, width: 412, height: v.D, transform: 'rotateX(90deg) translateZ(297px)' }}>
                <span className="shade" ref={(el) => { bookRefs.current[i].shTop = el; }} />
              </div>
              <div className="face edgeV" style={{ left: 4, top: tbT, width: 412, height: v.D, transform: 'rotateX(-90deg) translateZ(297px)' }}>
                <span className="shade" ref={(el) => { bookRefs.current[i].shBottom = el; }} />
              </div>

              {/* the front: pages, cover on its hinge, and a turning leaf (AV:66) */}
              <div style={{ position: 'absolute', inset: 0, transform: `translateZ(${hd}px)`, transformStyle: 'preserve-3d' }}>
                {dv.active === i && (
                  <div
                    className="pagehit"
                    ref={(el) => { bookRefs.current[i].stack = el; }}
                    onClick={fwdClick}
                    style={{ position: 'absolute', left: 0, top: 0, width: 420, height: 600, transformOrigin: '0 50%', transform: 'translateZ(-3px) scale(0.982)', pointerEvents: 'none' }}
                  >
                    <BookPage page={dv.R} side="right" onGo={goPageCb} onNextVol={nextVolCb} clock={clock} form={fm} onField={setField} onShelve={shelveCb} />
                    <span className="shade" style={{ opacity: 0 }} />
                    {/* cast shadow of the turning leaf on the page beneath (AV:71) */}
                    <span aria-hidden ref={(el) => { bookRefs.current[i].cast = el; }} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 0, background: 'linear-gradient(to right, rgba(0,0,0,.32), rgba(0,0,0,0))', pointerEvents: 'none' }} />
                  </div>
                )}
                <div
                  ref={(el) => { bookRefs.current[i].hinge = el; }}
                  style={{ position: 'absolute', inset: 0, transformOrigin: '0 50%', transform: 'rotateY(0.000deg)', transformStyle: 'preserve-3d' }}
                >
                  <div className="face" style={{ inset: 0, background: v.tone, color: v.ink, borderRadius: '3px 6px 6px 3px', padding: '44px 40px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span aria-hidden style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 1, background: 'currentColor', opacity: 0.14 }} />
                    <span className="mono" style={{ fontSize: 12, letterSpacing: '0.22em', opacity: 0.7 }}>AEDWON</span>
                    <span style={{ marginTop: 'auto', fontSize: 150, fontWeight: 800, letterSpacing: '-0.075em', lineHeight: 0.86 }}>{v.n}</span>
                    <span style={{ fontSize: cfsOf(t), fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.02, overflowWrap: 'anywhere' }}>{t}</span>
                    <span className="shade" ref={(el) => { bookRefs.current[i].shFront = el; }} />
                  </div>
                  <div
                    className="face pagehit"
                    ref={(el) => { bookRefs.current[i].inside = el; }}
                    onClick={backPageClick}
                    style={{ inset: 0, transform: 'rotateY(180deg)', pointerEvents: 'none', background: 'var(--paper-bg)', borderRadius: '6px 3px 3px 6px', overflow: 'hidden' }}
                  >
                    {dv.active === i && (
                      <BookPage page={dv.L} side="left" onGo={goPageCb} onNextVol={nextVolCb} clock={clock} form={fm} onField={setField} onShelve={shelveCb} />
                    )}
                    <span className="shade" ref={(el) => { bookRefs.current[i].shInside = el; }} />
                  </div>
                </div>
                {/* the turning leaf, in six hinged strips so the paper bends as it turns;
                    kept mounted so a turn starts instantly (AV:87-110) */}
                {dv.active === i && dv.leafOn && (
                  <div
                    ref={(el) => { bookRefs.current[i].leaf = el; }}
                    style={{ position: 'absolute', left: 0, top: 0, width: 420, height: 600, transformOrigin: '0 50%', transform: 'scale(0.982)', transformStyle: 'preserve-3d', pointerEvents: 'none', visibility: 'hidden' }}
                  >
                    {renderStrip(i, 1)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* once your volume is back on the shelf (AV:117-121) */}
      <div ref={doneRef} aria-live="polite" style={{ position: 'absolute', left: 96, width: 330, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, opacity: 0, translate: '0 14px', pointerEvents: 'none' }}>
        <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>Shelved.</span>
        <span style={{ fontSize: 16.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{doneLine}</span>
        <button className="ctl" type="button" onClick={again} style={{ marginTop: 6, height: 44, padding: '0 18px', borderRadius: 12, border: '1px solid var(--line-hairline-2)', background: 'transparent', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer' }}>Write another</button>
      </div>

      {/* shelf hit areas: pick a volume (AV:124-126, 411-418) */}
      {VOLUMES.map((v, i) => {
        const w = v.D * S0;
        const hgt = HH * S0;
        return (
          <button
            key={i}
            className="hit"
            ref={(el) => { hitRefs.current[i] = el; }}
            onClick={() => apiRef.current.openVol(i)}
            onMouseEnter={() => { if (st.active == null) st.hovT[i] = 1; }}
            onMouseLeave={() => { st.hovT[i] = 0; }}
            onFocus={() => { if (st.active == null) st.hovT[i] = 1; }}
            onBlur={() => { st.hovT[i] = 0; }}
            aria-label={`Volume ${v.n}: ${titleOf(v, i)}`}
            style={{ left: `${SX[i] - w / 2 - 4}px`, top: `${780 - hgt - 30}px`, width: `${w + 8}px`, height: `${hgt + 30}px`, pointerEvents: 'auto' }}
          />
        );
      })}

      {/* reading controls (AV:129-135) */}
      <div
        ref={barRef}
        style={{ position: 'absolute', left: '50%', bottom: 26, translate: '-50% 16px', display: 'flex', alignItems: 'center', gap: 4, padding: 4, borderRadius: 14, background: 'var(--glass-panel-84)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', border: '1px solid var(--line-panel)', opacity: 0, pointerEvents: 'none' }}
      >
        <button className="ctl" onClick={() => apiRef.current.backward()} aria-label="Previous page" style={{ width: 44, height: 44, borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 17, cursor: 'pointer', opacity: at > 0 ? 1 : 0.35 }}>←</button>
        <span className="mono" aria-live="polite" style={{ minWidth: 260, textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{barText}</span>
        <button className="ctl" onClick={() => apiRef.current.forward()} aria-label={isLast ? 'Next volume' : 'Next page'} style={{ height: 44, minWidth: 44, padding: '0 12px', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer' }}>{isLast ? (nextV ? `Vol. ${nextV.n} →` : '→') : '→'}</button>
        <span style={{ width: 1, height: 22, background: 'var(--line-divider)', margin: '0 4px' }} />
        <button className="ctl" onClick={() => apiRef.current.close()} style={{ height: 44, padding: '0 14px', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer' }}>Back to shelf</button>
      </div>

      {/* nav (AV:138-146): the Room renders its own, so this is hidden when bare */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 84, padding: '0 56px', visibility: bare ? 'hidden' : 'visible', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-room-72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', textDecoration: 'none' }}>Aedwon</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 14 }}>
          <Link className="nlink" href="/">Wall</Link>
          <Link className="nlink" href="/index">Index</Link>
          <span aria-hidden style={{ width: 1, height: 16, background: 'var(--line-divider)' }} />
          <button className="nlink" onClick={() => { if (st.active === LAST) apiRef.current.close(); }} aria-current={cNav ? 'false' : 'page'} style={{ border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', padding: 0, color: cNav ? 'var(--text-secondary)' : 'var(--text-primary)' }}>About</button>
          <button className="nlink" onClick={() => apiRef.current.openVol(LAST)} aria-current={cNav ? 'page' : 'false'} style={{ border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', padding: 0, color: cNav ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Contact</button>
        </div>
      </div>
    </div>
  );
});

export default AboutVolumes;

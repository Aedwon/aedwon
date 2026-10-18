'use client';

// WallIndex2: Wall, Fold and Index (spec/wall-index.md).
// Ported verbatim from WallIndex2.dc.html. Every spring constant, easing and
// timing below comes from that file; coordinates live on the 1440x900 artboard.

import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState,
} from 'react';
import MediaBlock, { type MediaKind } from './MediaBlock';
import { DARK_MARKS, ICON, LOGO, TYPEICON } from '@/lib/design-v3/data/icons';
import { PROJECTS, type Project } from '@/lib/design-v3/data/projects';
import type { Req, WallIndex2Handle } from './contracts';
import type { Theme } from '@/lib/design-v3/theme';

const R0 = 240;
// same wall, fixed arrangement: three columns balanced by height, no two of a kind stacked
const COLS = [[0, 13, 1, 7, 15, 5], [2, 14, 3, 9, 16, 6], [4, 8, 10, 12, 11]];
const GAP = 48;
const H: Record<string, number> = { phone: 370, tv: 330, web: 325, discord: 325, term: 300, data: 300, repo: 260, paper: 300 };

// five kinds, the way a visitor thinks about them (WallIndex2:309-316)
const KIND: { label: string; types: string[] }[] = [
  { label: 'Apps', types: ['Mobile app', 'Android TV'] },
  { label: 'Bots', types: ['Discord bot'] },
  { label: 'Web', types: ['Website redesign', 'Web tool', 'Civic tech'] },
  { label: 'Tools', types: ['Developer tooling', 'Data system'] },
  { label: 'Open source', types: ['Open source'] },
  { label: 'Writing', types: ['Writing'] },
];
const KINDICON = ['phone', 'bot', 'web', 'term', 'repo', 'pen'];

// brand marks that are near-invisible on the dark wall get the text colour instead
// (tokens.md §8; use the ProjectSpread values for both)

const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const out = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = Math.PI / 180;

interface WallIndex2Props {
  bare?: boolean;
  dim?: number;
  wallColor?: string;
  view?: 'wall' | 'index';
  motion?: 'slide' | 'cascade' | 'swap';
  mode?: 'soft' | 'follow' | 'overview';
  initialViewReq?: Req;
  escBlocked?: boolean;
  theme?: Theme;
  hintSize?: string;
  onOpen?: (i: number) => void;
  onFocus?: (i: number) => void;
  onPeek?: (p: number) => void;
}

interface Spring { y: number; v: number; init?: number }

const WallIndex2 = forwardRef<WallIndex2Handle, WallIndex2Props>(function WallIndex2(props, ref) {
  const {
    bare = false, wallColor = 'var(--room-bg)', view = 'index', motion = 'swap', mode = 'follow',
    initialViewReq, escBlocked = false, theme = 'dark', hintSize,
    onOpen, onFocus, onPeek,
  } = props;
  void initialViewReq; void hintSize;

  const P: Project[] = PROJECTS;
  const N = P.length;
  const NW = P.filter((p) => p.media !== 'paper').length; // writing lives in the Index only

  const rootRef = useRef<HTMLDivElement>(null);
  const ixRef = useRef<HTMLDivElement>(null);
  const rowEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const groupEls = useRef<(HTMLDivElement | null)[]>([]);
  const tileEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const pvEls = useRef<(HTMLDivElement | null)[]>([]);
  const bandRef = useRef<HTMLDivElement>(null);
  const bandInnerRef = useRef<HTMLDivElement>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);
  const qdRef = useRef<HTMLDivElement>(null);
  const qHintRef = useRef<HTMLSpanElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const capNRef = useRef<HTMLSpanElement>(null);
  const capNameRef = useRef<HTMLSpanElement>(null);
  const capTypeRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const tickEls = useRef<(HTMLButtonElement | null)[]>([]);
  const pvBoxRef = useRef<HTMLDivElement>(null);
  const pvYRef = useRef<HTMLDivElement>(null);
  const pvNameRef = useRef<HTMLSpanElement>(null);
  const pvLineRef = useRef<HTMLSpanElement>(null);
  const emptyRef = useRef<HTMLSpanElement>(null);

  // ---- derived data (constructor)
  const kindOf = useMemo(() => P.map((p) => KIND.findIndex((g) => g.types.indexOf(p.type) >= 0)), [P]);
  const bp = useMemo(() => {
    const arr: { x: number; y: number }[] = [];
    COLS.forEach((list, c) => {
      const total = list.reduce((a, i) => a + H[P[i].media], 0) + GAP * (list.length - 1);
      let y = 450 - total / 2 + [70, 20, 0][c];
      list.forEach((i) => { const h = H[P[i].media]; arr[i] = { x: 720 + (c - 1) * 568, y: y + h / 2 }; y += h + GAP; });
    });
    for (let i = 0; i < N; i++) if (!arr[i]) arr[i] = { x: 720, y: 99999 };
    return arr;
  }, [P, N]);
  const bounds = useMemo(() => {
    const ys = bp.filter((b) => b.y < 90000).map((b) => b.y);
    const minY = Math.min(...ys) + 60, maxY = Math.max(...ys) - 60;
    return { minY, maxY, midY: (minY + maxY) / 2 };
  }, [bp]);

  const stackOf = useMemo(() => P.map((p) => {
    if (p.media === 'repo') return { logos: [LOGO.GitHub], text: p.links[0]?.label ?? '' };
    const parts = p.stack;
    return { logos: parts.map((n) => LOGO[n]).filter(Boolean), text: parts.filter((n) => !LOGO[n]).join(' · ') };
  }), [P]);

  const postMeta = useMemo(() => {
    const m: Record<string, { date: string; mins: string }> = {};
    P.forEach((p) => {
      if (p.media !== 'paper') return;
      const f = (k: string) => p.facts.find((fk) => fk.k === k)?.v ?? '';
      m[p.id] = { date: f('Published'), mins: f('Reading time').replace(/ read$/i, '') };
    });
    return m;
  }, [P]);

  // ---- mutable scene state
  const s = useRef({
    k: view !== 'wall' ? 1 : 0, kt: view !== 'wall' ? 1 : 0,
    sort: 'featured' as 'featured' | 'name' | 'type',
    filt: null as number | null,
    q: '',
    ih: null as number | null,
    pvLast: 0,
    rs: {} as Record<string, Spring>, tg: {} as Record<string, number | null>, pend: {} as Record<string, { y: number; at: number } | null>,
    vs: {} as Record<number, number>, gs: {} as unknown, gop: {} as Record<number, number>,
    sig: null as string | null, visNow: [] as number[],
    chg: null as null | { sig: string; t0: number; prevM: Record<number, number>; prevGM: Record<number, number>; moved: Record<number, boolean>; rank: Record<number, number>; grank: Record<number, number>; ty: Record<number, number | null>; gy: Record<number, number | null> },
    cy0: {} as Record<number, number>, gy0: {} as Record<number, number>, mm: {} as Record<number, number>, gm: {} as Record<number, number>,
    dim: 0,
    O: [720, 470] as [number, number], ax0: 34, az0: -18,
    cy: 0, tCy: 0, vel: 0,
    zl: 1, zv: 0,
    su: {} as Record<number, { u: number; v: number }>, hs: {} as Record<number, number>, ops: {} as Record<number, number>,
    m: { x: 0, y: 0 }, ms: { x: 0, y: 0 }, scrollY: 0, lastInput: 0,
    capId: null as number | null, capAt: 0, capLast: 0,
    t0: 0, last: 0, reduced: false, raf: 0,
    over: 0, overAt: 0, pk: 0,
    magY: null as number | null,
    hr: null as number | null, hk: 0, leaving: false,
    drag: null as null | { sx: number; sy: number; c0: number; moved: boolean; lt: number; lp: number; v: number },
    suppress: false,
    lastReq: '' as string,
    hover: null as number | null,
    cur: null as number | null, leaveAt: null as number | null, // the committed hover: it holds through the gaps between tiles for a moment
    amt: [] as number[], gAmt: 0, // per tile focus amount (0..1), and the wall dim amount
    lastF: null as number | null,
    pvY: null as null | { y: number; v: number }, pvA: 0,
    ihHold: null as number | null, ihLeave: null as number | null, // the row the preview follows: it holds for a beat when the pointer leaves
    pvTxtId: null as number | null, pvTxtOut: null as number | null, pvTxtIn: null as number | null, // the preview's words change in two soft steps
    pvo: {} as Record<number, number>,
    // per-frame output stash
    ixTotal: 0, near: 0, zoomedOut: false,
  }).current;

  // discrete React state: only what templates read structurally
  const [viewState, setViewState] = useState(view !== 'wall' ? 1 : 0);
  const [filt, setFilt] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'featured' | 'name' | 'type'>('featured');
  const [countInfo, setCountInfo] = useState({ vis: N, total: N });
  const [colHeadState, setColHead] = useState('BUILT WITH');
  const [emptyMsg, setEmptyMsg] = useState('');

  // sync discrete mirrors of ref state for handlers
  useEffect(() => { s.filt = filt; }, [filt, s]);
  useEffect(() => { s.q = q; }, [q, s]);
  useEffect(() => { s.sort = sort; }, [sort, s]);

  useImperativeHandle(ref, () => ({
    viewReq(req: Req) { applyViewReq(req); },
    setDim(dim: number) { s.dim = dim; },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const applyViewReq = (req: Req) => {
    const vr = req.v + '#' + req.n;
    if (vr === s.lastReq) return;
    s.lastReq = vr;
    const v0 = req.v.split('#')[0], want = (v0.replace('!', '') === 'index' ? 1 : 0) as 0 | 1;
    if (want !== s.kt || (want === 1 && s.leaving)) {
      const instant = v0.indexOf('!') >= 0;
      s.leaving = false;
      if (want === 0 && s.kt === 1 && s.k > 0.5 && !instant) s.leaving = true;
      else s.kt = want;
      s.ih = null; s.vel = 0;
      if (instant) { s.kt = want; s.k = want; s.su = {}; s.hr = want; }
      setViewState(want);
      s.hover = null;
    } // '!' = switch while out of sight, no fold
  };

  // ---- wheel (WallIndex2:397-407)
  const peekAdd = (d: number) => { if (!onPeek || d <= 0) return; s.over += d; s.overAt = performance.now(); };
  const wheel = useCallback((e: WheelEvent) => {
    let d0 = e.deltaY; if (e.deltaMode === 1) d0 *= 16;
    if (s.kt === 1) { const ix = ixRef.current; if (ix && ix.scrollTop + ix.clientHeight >= ix.scrollHeight - 2) peekAdd(d0); return; } // index: normal page scroll
    if (s.tCy >= bounds.maxY - 2 && d0 > 0 && !s.zoomedOut) peekAdd(d0);
    e.preventDefault();
    s.lastInput = performance.now();
    if (e.ctrlKey && mode === 'overview') { return; } // overview not built
    if (s.zoomedOut) return;
    let d = e.deltaY + e.deltaX; if (e.deltaMode === 1) d *= 16;
    s.tCy += d * 1.15; s.vel = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, onPeek, bounds.maxY]);

  // ---- key (WallIndex2:408-419); gated while a project page is open (decision)
  const key = useCallback((e: KeyboardEvent) => {
    if (s.kt !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
    if (escBlocked) return;
    const t = e.target; if (t && ((t as HTMLElement).tagName === 'INPUT' || (t as HTMLElement).tagName === 'TEXTAREA')) return;
    if (e.key === 'Escape') { if (s.q) setQ(''); else setFilt(null); return; }
    if (e.key === 'Backspace') { if (s.q) { setQ(s.q.slice(0, -1)); e.preventDefault(); } return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const vis = s.visNow; if (!vis.length) return; e.preventDefault();
      let r = vis.indexOf(s.ih as number); r = r < 0 ? 0 : Math.max(0, Math.min(vis.length - 1, r + (e.key === 'ArrowDown' ? 1 : -1)));
      const el = rowEls.current[vis[r]]; if (el) el.focus(); s.ih = vis[r]; return;
    }
    if (e.key.length === 1 && /[0-9A-Za-z .\-]/.test(e.key)) { if (e.key === ' ' && !s.q) return; setQ((s.q + e.key).slice(0, 22)); e.preventDefault(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escBlocked]);

  useEffect(() => {
    s.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    s.t0 = performance.now(); s.last = s.t0; s.lastInput = s.t0;
    s.cy = bounds.minY + 140; s.tCy = s.cy; // (WallIndex2:347)
    const root = rootRef.current;
    if (root) root.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', key);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000); s.last = now;
      s.ms.x += (s.m.x - s.ms.x) * 0.05; s.ms.y += (s.m.y - s.ms.y) * 0.05;
      const dir = Math.sign(s.kt - s.k);
      if (s.reduced) s.k = s.kt;
      else if (dir) { s.k += dir * dt / 1.5; if ((dir > 0 && s.k > s.kt) || (dir < 0 && s.k < s.kt)) s.k = s.kt; }
      if (!s.drag) {
        s.tCy += s.vel * dt; s.vel *= Math.pow(0.03, dt);
        // past the top or bottom: ease back, like the end of a page
        const c = Math.max(bounds.minY, Math.min(bounds.maxY, s.tCy));
        if (c !== s.tCy) { s.tCy += (c - s.tCy) * Math.min(1, dt * 10); s.vel *= 0.8; }
        // soft magnet: once you stop, the nearest project drifts to the middle (never while you're moving)
        if (mode !== 'follow' && now - s.lastInput > 450 && Math.abs(s.vel) < 40 && s.hover == null && s.magY != null) s.tCy += (s.magY - s.tCy) * Math.min(1, dt * 3);
      }
      const f = s.reduced ? 1 : 1 - Math.pow(s.drag ? 1e-6 : 3e-4, dt);
      s.cy += (s.tCy - s.cy) * f;
      const zt = s.zoomedOut ? 0 : 1;
      if (s.reduced) s.zl = zt; else { s.zv += ((zt - s.zl) * 120 - s.zv * 20) * dt; s.zl += s.zv * dt; }
      if (onPeek) {
        if (s.over && now - s.overAt > 420) { s.over *= Math.pow(0.05, dt); if (s.over < 1) s.over = 0; }
        const pk = Math.min(1, s.over / 700);
        if (Math.abs(pk - s.pk) > 0.002 || (pk === 0 && s.pk)) { s.pk = pk; onPeek(pk); }
        if (pk >= 1) s.over = 0;
      }
      frame(dt, now);
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(s.raf);
      window.removeEventListener('keydown', key);
      if (root) root.removeEventListener('wheel', wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheel, key, mode]);

  // ---- glide to a project (rail tick / zoom)
  const glideTo = (i: number) => {
    s.tCy = Math.max(bounds.minY, Math.min(bounds.maxY, bp[i].y)); s.vel = 0; s.lastInput = performance.now();
  };

  // ---- pointer drag along the tilted columns (WallIndex2:647-674)
  const scale = () => { const r = rootRef.current?.getBoundingClientRect(); return r && r.width ? 1440 / r.width : 1; };
  const down = (e: React.PointerEvent) => {
    if (s.kt !== 0 || s.k > 0.01 || s.zoomedOut || (e.button != null && e.button > 0)) return;
    if (e.target instanceof Element && e.target.closest('button, .v3nlink')) return;
    const sc = scale();
    s.drag = { sx: e.clientX * sc, sy: e.clientY * sc, c0: s.tCy, moved: false, lt: performance.now(), lp: s.tCy, v: 0 };
    s.vel = 0; s.lastInput = performance.now();
  };
  const move = (e: React.PointerEvent) => {
    const d = s.drag; if (!d) return;
    const sc = scale(), dx = e.clientX * sc - d.sx, dy = e.clientY * sc - d.sy;
    if (!d.moved && Math.hypot(dx, dy) > 6) { d.moved = true; s.hover = null; }
    if (!d.moved) return;
    // along the tilted columns: undo the wall's turn and tilt
    const a = 18 * Math.PI / 180;
    const along = (Math.sin(a) * dx + Math.cos(a) * dy) / (0.9 * Math.cos(34 * Math.PI / 180));
    let c = d.c0 - along;
    if (c < bounds.minY) c = bounds.minY - (bounds.minY - c) * 0.35;
    if (c > bounds.maxY) c = bounds.maxY + (c - bounds.maxY) * 0.35;
    const now = performance.now(); d.v = d.v * 0.6 + ((c - d.lp) / Math.max(0.001, (now - d.lt) / 1000)) * 0.4; d.lp = c; d.lt = now;
    s.tCy = c; s.lastInput = now;
  };
  const up = () => {
    const d = s.drag; if (!d) return;
    s.drag = null; s.lastInput = performance.now();
    if (!d.moved) return;
    s.suppress = true; setTimeout(() => { s.suppress = false; }, 0);
    s.vel = Math.max(-3000, Math.min(3000, d.v));
  };
  const lean = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    s.m = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
  };
  const unlean = () => { s.m = { x: 0, y: 0 }; };
  const onIxScroll = (e: React.UIEvent) => { s.scrollY = (e.currentTarget as HTMLDivElement).scrollTop; };

  // ---- the frame (WallIndex2:421-620), verbatim math, DOM writes
  function frame(dt: number, now: number) {
    const T = s.reduced ? 99 : (now - s.t0) / 1000;
    const k = s.k, mo = mode, h = s.hover, onWall = k < 0.001;
    const zl = s.zl;
    const dts = s.reduced ? 0 : dt || 0;
    const q0 = s.q.trim().toLowerCase();
    const hay = (i: number) => (P[i].name + ' ' + P[i].type + ' ' + stackOf[i].text + ' ' + KIND[kindOf[i]].label).toLowerCase();
    const match = (i: number) => (s.filt == null || kindOf[i] === s.filt) && (!q0 || hay(i).indexOf(q0) >= 0);
    const order = P.map((_, i) => i);
    if (s.sort === 'name') order.sort((a, b) => P[a].name.localeCompare(P[b].name));
    if (s.sort === 'type') order.sort((a, b) => kindOf[a] - kindOf[b] || a - b);
    const vis = order.filter(match); s.visNow = vis;
    const ty: Record<number, number> = {}, gy: Record<number, number> = {}, gOn: Record<number, number> = {};
    let yy = 0, lastK = -1;
    vis.forEach((i) => {
      if (s.sort === 'type' && kindOf[i] !== lastK) {
        lastK = kindOf[i];
        if (yy > 0) yy += 22; gy[lastK] = yy; gOn[lastK] = vis.filter((j) => kindOf[j] === lastK).length; yy += 58;
      }
      ty[i] = yy; yy += 60;
    });
    s.ixTotal = yy;
    const sig = s.sort + '|' + s.filt + '|' + s.q;
    if (sig !== s.sig) {
      // rows set off one after another, top first, so the reorder reads as a ripple instead of a jump
      const first = s.sig == null; s.sig = sig;
      vis.forEach((i, r) => { s.pend[i] = { y: ty[i], at: first ? 0 : now + Math.min(r * 12, 120) }; });
      KIND.forEach((_, g) => {
        const gi = vis.findIndex((j) => kindOf[j] === g);
        if (gy[g] != null && gi >= 0) s.pend['g' + g] = { y: gy[g], at: first ? 0 : now + Math.min(gi * 12, 120) };
      });
      // discrete UI reads of the visible set
      setCountInfo({ vis: vis.length, total: N });
      const papersOnly = vis.length > 0 && vis.every((i) => P[i].media === 'paper');
      setColHead(s.filt === KIND.length - 1 || papersOnly ? 'TOPIC' : 'BUILT WITH');
      setEmptyMsg(vis.length ? '' : q0 ? `Nothing matches \u201c${s.q.trim()}\u201d. Try a type, like bots.` : 'Nothing here yet.');
    }
    const spring = (key2: string | number, t: number, kS: number, kD: number) => {
      let sp = s.rs[key2]; if (!sp || !dts) { sp = s.rs[key2] = { y: t, v: 0 }; return sp; }
      sp.v += ((t - sp.y) * kS - sp.v * kD) * dts; sp.y += sp.v * dts; return sp;
    };
    const step = (key2: string | number) => { const pd = s.pend[key2]; if (pd && now >= pd.at) { s.tg[key2] = pd.y; s.pend[key2] = null; } return s.tg[key2]; };
    P.forEach((_, i) => {
      if (s.tg[i] == null) s.tg[i] = ty[i] != null ? ty[i] : i * 60;
      const tRow = step(i);
      if (tRow != null) spring(i, tRow, 260, 32); // critically damped: arrives, no bounce
      if (!s.rs[i].init) s.rs[i] = { y: s.tg[i] as number, v: 0, init: 1 };
      const vt = vis.indexOf(i) >= 0 ? 1 : 0;
      const w = s.vs[i] == null ? vt : s.vs[i];
      s.vs[i] = dts ? w + (vt - w) * Math.min(1, dts * 14) : vt;
    });
    KIND.forEach((_, g) => {
      const key2 = 'g' + g; if (s.tg[key2] == null) s.tg[key2] = gy[g] != null ? gy[g] : 0;
      const tGrp = step(key2);
      if (tGrp != null) spring(key2, tGrp, 260, 32);
      if ((s.gop[g] || 0) < 0.02 && gy[g] != null) { s.tg[key2] = gy[g]; s.pend[key2] = null; s.rs[key2] = { y: gy[g], v: 0 }; } // a heading appears where it belongs
      const gt = gOn[g] ? 1 : 0; const w = s.gop[g] == null ? gt : s.gop[g];
      s.gop[g] = dts ? w + (gt - w) * Math.min(1, dts * 9) : gt;
    });
    if (motion !== 'slide') {
      const MO = motion;
      if (s.chg == null || s.chg.sig !== sig) {
        const first = s.chg == null;
        const prevM: Record<number, number> = {}, prevGM: Record<number, number> = {}, moved: Record<number, boolean> = {}, rank: Record<number, number> = {}, grank: Record<number, number> = {};
        P.forEach((_, i) => { prevM[i] = s.mm[i] == null ? 0 : s.mm[i]; if (first || s.cy0[i] == null) s.cy0[i] = ty[i] != null ? ty[i] : i * 60; });
        KIND.forEach((_, g) => { prevGM[g] = s.gm[g] || 0; if (first && gy[g] != null) s.gy0[g] = gy[g]; });
        P.forEach((_, i) => { moved[i] = MO === 'cascade' || ty[i] == null || prevM[i] < 0.99 || Math.abs(ty[i] - s.cy0[i]) > 0.5; });        // the stagger counts only rows that actually change, so it stays quick
        let r = 0; vis.forEach((i) => { if (moved[i]) rank[i] = r++; else rank[i] = 0; });
        KIND.forEach((_, g) => { const f = vis.find((j) => kindOf[j] === g); grank[g] = f != null ? Math.max(0, rank[f] - 0.5) : 0; });
        s.chg = { sig, t0: first ? now - 1e4 : now, prevM, prevGM, moved, rank, grank, ty: { ...ty }, gy: { ...gy } };
      }
      const c = s.chg, OUT = 0.1, IN = 0.22, ST = MO === 'cascade' ? 0.026 : 0.018, ss = (now - c.t0) / 1000;
      P.forEach((_, i) => {
        const on = c.ty[i] != null; let m: number, dy = 0;
        if (!c.moved[i]) m = on ? 1 : 0;
        else if (ss < OUT) m = c.prevM[i] * (1 - ss / OUT);
        else { if (on) s.cy0[i] = c.ty[i] as number; const f2 = on ? out((ss - OUT - c.rank[i] * ST) / IN) : 0; m = f2; dy = (1 - f2) * 6; }
        s.mm[i] = m; s.vs[i] = m; s.rs[i] = { y: s.cy0[i] + dy, v: 0, init: 1 };
      });
      KIND.forEach((_, g) => {
        const on = c.gy[g] != null, same = on && MO === 'swap' && c.prevGM[g] > 0.99 && s.gy0[g] === c.gy[g];
        let m: number;
        if (same) m = 1;
        else if (ss < OUT) m = c.prevGM[g] * (1 - ss / OUT);
        else if (!on) m = 0;
        else { s.gy0[g] = c.gy[g] as number; m = out((ss - OUT - c.grank[g] * ST) / IN); }
        s.gm[g] = m; s.gop[g] = m; s.rs['g' + g] = { y: s.gy0[g] != null ? s.gy0[g] : 0, v: 0 };
      });
    }
    if (s.ih != null) s.pvLast = s.ih;
    // the frozen header waits until the rows have landed, and leaves first on the way back
    {
      const want = s.kt === 1 && k >= 0.9 && !s.leaving ? 1 : 0;
      if (s.hr == null || !dts) s.hr = want; else s.hr = want ? Math.min(1, s.hr + dts / 0.45) : Math.max(0, s.hr - dts / 0.38);
      const x = s.hr; s.hk = x * x * (3 - 2 * x);
      // once the header has gone, the rows set off back to the wall
      if (s.leaving && s.hr <= 0.2) { s.leaving = false; s.kt = 0; }
    }
    const pp = ease(k / 0.8);
    // in the room, heading down to the shelf: the wall of work tips back and away, like looking down past it
    const dm = Math.max(0, Math.min(1, s.dim));
    // heading to About the camera comes level: the wall's tilt and roll ease out as it slides away, so the straight-on shelf
    // arrives in the same view instead of the wall tipping over on its own
    const dl = Math.max(0, Math.min(1, dm / 0.4)), lv = 1 - dl * dl * (3 - 2 * dl); // level by the time the camera is 40% of the way
    const ax = lerp(s.ax0 - s.ms.y * 3 + (1 - zl) * -10, 0, pp) * lv;
    const ay = lerp(s.ms.x * 3, 0, pp) * lv, az = lerp(s.az0 + (1 - zl) * 8, 0, pp) * lv, S = lerp(lerp(0.52, 0.9, zl), 1, pp);
    const rot = (x: number, y: number, z: number): [number, number, number] => {
      const cx = Math.cos(ax * rad), sx = Math.sin(ax * rad), cy_ = Math.cos(ay * rad), sy = Math.sin(ay * rad), cz = Math.cos(az * rad), sz = Math.sin(az * rad);
      const x1 = cz * x - sz * y, y1 = sz * x + cz * y;
      const x2 = cy_ * x1 + sy * z, z2 = -sy * x1 + cy_ * z;
      return [x2, cx * y1 - sx * z2, sx * y1 + cx * z2];
    };
    const camY = lerp(bounds.midY, s.cy, zl);
    // first pass: where each tile lands on screen, to find the one nearest the middle
    const O = s.O;
    const scr = bp.map((b) => { const p = rot(b.x - O[0], b.y - camY, 0); return { X: O[0] + S * p[0], Y: O[1] + S * p[1] }; });
    let near = 0, nd = 1e12;
    scr.forEach((p, i) => { const d = (p.X - 720) ** 2 + ((p.Y - 480) * 1.4) ** 2; if (d < nd) { nd = d; near = i; } });
    s.magY = bp[near].y;
    const zoomedOut = zl < 0.5; s.zoomedOut = zoomedOut;
    // Hover intent: moving to another tile switches at once; leaving every tile keeps the last one for a beat, so crossing
    // a gap or a brief slip off the edge neither dims nor brightens the wall.
    const dragMoved = !!(s.drag && s.drag.moved);
    if (dragMoved) { s.cur = null; s.leaveAt = null; }
    else if (h != null) { s.cur = h; s.leaveAt = null; }
    else if (s.cur != null) {
      if (s.leaveAt == null) s.leaveAt = now;
      if (now - s.leaveAt >= 200) { s.cur = null; s.leaveAt = null; }
    }
    const focus = s.cur != null ? s.cur : (mo === 'follow' || zoomedOut ? null : near);
    if (onFocus) { const f = k > 0.5 ? s.ih : (focus != null ? focus : near); if (f !== s.lastF) { s.lastF = f; onFocus(f == null ? -1 : f); } }
    // tiles
    P.forEach((p, i) => {
      const type = p.media as MediaKind, hh = H[type];
      const intro = out((T - 0.15 - (i % 4) * 0.12 - Math.floor(i / 4) * 0.15) / 1.3);
      // gentle emphasis only: no blur, the others stay readable
      const isF = focus === i;
      const dimTo = mo === 'follow' ? 0.5 : 0.62;
      // one focus amount per tile drives its opacity, size and lift together, quick to rise and slower to settle
      const stepA = (v: number, on: boolean, up: number, dn: number) => (s.reduced ? (on ? 1 : 0) : Math.max(0, Math.min(1, v + (on ? dts / up : -dts / dn))));
      const smooth = (x: number) => x * x * (3 - 2 * x);
      const onF = onWall && isF && !dragMoved;
      const A = smooth((s.amt[i] = stepA(s.amt[i] || 0, onF, 0.11, 0.24)));
      const Gd = smooth((s.gAmt = i === 0 ? stepA(s.gAmt, onWall && focus != null && !dragMoved, 0.15, 0.32) : s.gAmt));
      s.ops[i] = onWall ? 1 - (1 - dimTo) * Gd * (1 - A) : 1;
      s.hs[i] = 1 + 0.035 * A;
      const isPost = p.media === 'paper';
      const w = { x: isPost ? 160 : bp[i].x, y: isPost ? 2400 : bp[i].y - camY + O[1] + (1 - intro) * 140, z: 24 * (onWall ? A : 0), op: isPost ? 0 : s.ops[i] * intro };
      const ut = ease((k - 0.024 * i) / 0.58); // every tile, even the 17th, lands exactly on its row
      let su = s.su[i];
      if (!su || dt === 0 || s.reduced) su = s.su[i] = { u: ut, v: 0 };
      else { su.v += ((ut - su.u) * 230 - su.v * 23) * dt; su.u += su.v * dt; }
      const u = su.u, uc = cl(u);
      const sl = Math.min(80 / 520, 50 / hh);
      const rowY = R0 + s.rs[i].y + 30 - s.scrollY;
      const vsv = s.vs[i];
      const PVy = Math.max(300, Math.min(560, s.ih != null ? R0 + s.rs[s.ih].y + 30 - s.scrollY : rowY));
      const L = { x: lerp(160, 1206, 0), y: lerp(rowY, PVy, 0) }; // pvp = 0 (dead code, kept faithful)
      const lift = 0;
      const x = lerp(w.x, L.x, u), y = lerp(w.y, L.y, u), z = lerp(w.z, 0, u) + Math.sin(Math.PI * uc) * 180 + lift * uc;
      const sc = lerp(s.hs[i], lerp(sl, 300 / 520, 0) * (0.92 + 0.08 * vsv), u);
      const op = lerp(w.op, vsv, uc);
      const r = Math.sin(Math.PI * uc) * (i % 2 ? 7 : -7);
      const P3 = rot(x - O[0], y - O[1], z);
      const X = O[0] + S * P3[0], Y = O[1] + S * P3[1], Z = S * P3[2];
      const el = tileEls.current[i]; if (el) {
        el.style.transform = `translate3d(${(X - 260).toFixed(2)}px, ${(Y - hh / 2).toFixed(2)}px, ${Z.toFixed(1)}px) rotateX(${ax.toFixed(3)}deg) rotateY(${ay.toFixed(3)}deg) rotateZ(${(az + r).toFixed(3)}deg) scale(${(S * sc).toFixed(4)})`;
        el.style.opacity = op.toFixed(3);
        el.style.pointerEvents = op > 0.3 && k < 0.5 ? 'auto' : 'none';
        el.style.filter = 'none';
      }
    });
    const rowAt = (j: number) => { const q2 = out((k - 0.36 - 0.016 * j) / 0.3) * out((T - 0.2 - 0.018 * j) / 0.45); return { q: q2, op: q2 }; };
    // rows
    P.forEach((r0, i) => {
      const rk = vis.indexOf(i), a2 = rowAt(rk < 0 ? i : rk), w = s.vs[i];
      const el = rowEls.current[i]; if (el) {
        el.style.transform = `translate(0px, ${(R0 + s.rs[i].y + (1 - a2.q) * 8).toFixed(2)}px) perspective(700px) rotateX(0deg)`;
        el.style.opacity = (a2.q * w).toFixed(3);
        el.style.pointerEvents = w > 0.5 && k > 0.5 ? 'auto' : 'none';
        el.tabIndex = w > 0.5 ? 0 : -1;
        const line = el.querySelector<HTMLElement>('[data-line]');
        if (line) line.style.scale = `${a2.q.toFixed(3)} 1`;
      }
    });
    // group headings
    KIND.forEach((_, g) => {
      const el = groupEls.current[g]; if (el) {
        el.style.transform = `translateY(${(R0 + s.rs['g' + g].y).toFixed(2)}px)`;
        el.style.opacity = (s.gop[g] * rowAt(0).q).toFixed(3);
        el.style.pointerEvents = s.gop[g] > 0.5 && k > 0.5 ? 'auto' : 'none';
        const rule = el.querySelector<HTMLElement>('[data-rule]');
        if (rule) rule.style.scale = `${(s.gop[g] * rowAt(0).q).toFixed(3)} 1`;
      }
    });
    // preview
    {
      const pl = s.pvLast != null ? s.pvLast : 0;
      const ph = Math.round(H[P[pl].media] * 0.5769);
      // Moving from one row to the next switches at once; leaving every row keeps the last for 160ms, so the preview does not blink out between rows.
      if (s.ih != null) { s.ihHold = s.ih; s.ihLeave = null; }
      else if (s.ihHold != null) { if (s.ihLeave == null) s.ihLeave = now; if (now - s.ihLeave >= 160) { s.ihHold = null; s.ihLeave = null; } }
      const want = s.ihHold != null && k > 0.98 ? 1 : 0;
      const yT = Math.max(110, Math.min(900 - ph - 110, R0 + s.rs[pl].y + 30 - s.scrollY - ph / 2));
      if (s.pvY == null || s.pvA < 0.02) s.pvY = { y: yT, v: 0 };
      else if (dts) { s.pvY.v += ((yT - s.pvY.y) * 120 - s.pvY.v * 20) * dts; s.pvY.y += s.pvY.v * dts; }
      s.pvA = dts ? s.pvA + (want - s.pvA) * Math.min(1, dts * (want ? 10 : 7)) : want;
      P.forEach((_, i) => { const t = i === pl ? 1 : 0; const o = s.pvo[i] == null ? t : s.pvo[i]; s.pvo[i] = dts ? o + (t - o) * Math.min(1, dts * 12) : t; });
      const box = pvBoxRef.current;
      if (box) {
        box.style.transform = `translateY(${s.pvY.y.toFixed(1)}px) scale(${(0.985 + 0.015 * s.pvA).toFixed(4)})`;
        box.style.opacity = (s.pvA * cl(k * 2 - 1)).toFixed(3);
      }
      if (pvYRef.current) pvYRef.current.style.height = ph + 'px';
      // the name and line fade down, change, and rise again, instead of swapping while the picture is still crossfading
      if (s.pvTxtId == null || s.reduced) s.pvTxtId = pl;
      if (pl !== s.pvTxtId && s.pvTxtOut == null) s.pvTxtOut = now;
      let txA = 1;
      if (s.pvTxtOut != null) {
        const x = (now - s.pvTxtOut) / 90;
        if (x >= 1) { s.pvTxtId = pl; s.pvTxtOut = null; s.pvTxtIn = now; } else txA = 1 - x;
      }
      if (s.pvTxtOut == null && s.pvTxtIn != null) { const x = (now - s.pvTxtIn) / 200; if (x >= 1) s.pvTxtIn = null; else txA = out(x); }
      const tid = s.pvTxtId;
      if (pvNameRef.current) { pvNameRef.current.textContent = P[tid].name; pvNameRef.current.style.opacity = txA.toFixed(3); pvNameRef.current.style.translate = `0 ${((1 - txA) * 5).toFixed(1)}px`; }
      if (pvLineRef.current) { pvLineRef.current.textContent = P[tid].desc; pvLineRef.current.style.opacity = txA.toFixed(3); pvLineRef.current.style.translate = `0 ${((1 - txA) * 5).toFixed(1)}px`; }
      P.forEach((_, i) => {
        const el = pvEls.current[i]; if (!el) return;
        el.style.opacity = s.pvo[i].toFixed(3);
        el.style.visibility = s.pvo[i] > 0.01 ? 'visible' : 'hidden';
      });
    }
    const ui = out((T - 1.1) / 0.8), kc = cl(k * 2.5), chromeK = 1 - cl(s.dim * 6);
    // header band
    if (bandRef.current) {
      bandRef.current.style.opacity = String(+(s.hk * out((T - 0.2) / 0.45)).toFixed(3));
      bandRef.current.style.pointerEvents = s.k > 0.5 ? 'auto' : 'none';
    }
    if (bandInnerRef.current) bandInnerRef.current.style.translate = `0 ${((1 - s.hk) * -8).toFixed(2)}px`;
    if (filterRowRef.current) {
      const qOn = s.q.length > 0;
      filterRowRef.current.style.opacity = qOn ? '0' : '1';
      filterRowRef.current.style.translate = `0 ${qOn ? '-10px' : '0px'}`;
      filterRowRef.current.style.pointerEvents = qOn ? 'none' : 'auto';
    }
    if (qdRef.current) {
      const qOn = s.q.length > 0;
      qdRef.current.style.opacity = qOn ? '1' : '0';
      qdRef.current.style.translate = `0 ${qOn ? '0px' : '10px'}`;
    }
    if (qHintRef.current) qHintRef.current.style.opacity = s.q.length > 0 ? '0' : '1';
    if (ixRef.current) ixRef.current.style.pointerEvents = k > 0.5 ? 'auto' : 'none';
    // caption follows whatever is in focus; it re-enters softly when that changes
    if (focus !== s.capId) { s.capId = focus; s.capAt = now; if (focus != null) s.capLast = focus; }
    const ce = out((now - s.capAt) / 300);
    const shown = focus != null ? focus : s.capLast;
    const capOp = focus != null ? ce : 1 - ce;
    if (capRef.current) {
      capRef.current.style.opacity = String(+((shown != null ? ui * (1 - kc) * capOp * chromeK : 0)).toFixed(3));
      capRef.current.style.translate = `0 ${(focus != null ? (1 - ce) * 8 : 0).toFixed(1)}px`;
    }
    if (capNRef.current) capNRef.current.textContent = shown != null ? String(shown + 1).padStart(2, '0') + ' / ' + NW : '';
    if (capNameRef.current) capNameRef.current.textContent = shown != null ? P[shown].name : '';
    if (capTypeRef.current) capTypeRef.current.textContent = shown != null ? (P[shown].desc || P[shown].type) : ''; // the short description, not the type
    // rail
    {
      const inView = scr.map((p) => p.X > 0 && p.X < 1440 && p.Y > 84 && p.Y < 900);
      if (railRef.current) {
        railRef.current.style.opacity = (ui * (1 - kc) * chromeK).toFixed(3);
        railRef.current.style.pointerEvents = kc < 0.5 && chromeK > 0.5 ? 'auto' : 'none';
      }
      P.slice(0, NW).forEach((p, i) => {
        const el = tickEls.current[i]; if (!el) return;
        const line = el.querySelector<HTMLElement>('.tl');
        const cur = i === focus;
        el.setAttribute('aria-current', cur ? 'true' : 'false');
        if (line) {
          line.style.width = cur ? '32px' : inView[i] && !zoomedOut ? '18px' : '12px';
          line.style.background = cur ? 'var(--text-primary)' : inView[i] && !zoomedOut ? 'var(--text-label)' : 'var(--line-hover)';
        }
      });
    }
    // empty message
    if (emptyRef.current) emptyRef.current.style.opacity = vis.length ? '0' : '1';
  }

  // ---- static render: rows, tiles, groups, ticks, previews (children never re-render)
  const logoColor = (t: string) => (DARK_MARKS.has(t) ? (theme === 'light' ? '#111114' : '#EDEDED') : LOGO[t]?.c);
  const counts = KIND.map((_, gi) => P.filter((__, i) => kindOf[i] === gi).length);
  const kindBtns = [{ label: 'All', n: String(N), on: filt == null, g: null as number | null }].concat(
    KIND.map((g, gi) => ({ label: g.label, n: String(counts[gi]), on: filt === gi, g: gi as number | null })),
  ).map((c) => ({ ...c, aria: c.label + ', ' + c.n, col: c.on ? 'var(--text-primary)' : 'var(--line-frame)', icon: ICON[c.g == null ? 'all' : KINDICON[c.g]] as string, lo: c.on ? 1 : 0, ly: c.on ? '0px' : ((c.g == null ? -1 : c.g) < (filt == null ? -1 : filt) ? '-18px' : '18px') }));

  const colHead = colHeadState;

  return (
    <div
      ref={rootRef}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}
      onMouseMove={lean} onMouseLeave={unlean}
      style={{
        position: 'relative', width: 1440, height: 900, overflow: 'hidden', background: bare ? 'transparent' : 'var(--room-bg)',
        color: 'var(--text-primary)', fontFamily: "'Geist', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
        perspective: 2200, perspectiveOrigin: '50% 45%',
        touchAction: viewState === 1 ? 'pan-y' : 'none',
        userSelect: viewState === 1 ? 'auto' : 'none', WebkitUserSelect: viewState === 1 ? 'auto' : 'none',
        cursor: viewState === 1 ? 'auto' : (s.drag && s.drag.moved ? 'grabbing' : 'default'),
      }}
    >
      {/* INDEX */}
      <div ref={ixRef} onScroll={onIxScroll} className="v3ix" style={{ position: 'absolute', inset: 0, scrollPaddingTop: 180, overflowY: 'auto', overflowX: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'relative', height: R0 + s.ixTotal + 140 }}>
          {/* type headings, when sorted by type */}
          {KIND.map((g, gi) => (
            <div key={gi} ref={(el) => { groupEls.current[gi] = el; }} style={{ position: 'absolute', left: 120, width: 880, top: 0, height: 58, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', padding: '0 0 12px 112px', pointerEvents: 'none' }}>
              <button
                className="v3gh"
                onClick={() => setFilt(filt === gi ? null : gi)}
                aria-label={'Show only ' + g.label}
                style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em' }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICON[KINDICON[gi]]} /></svg>
                {g.label}
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, fontWeight: 400, letterSpacing: 0, color: 'var(--text-label)' }}>{g.types.length}</span>
              </button>
              <span data-rule aria-hidden style={{ position: 'absolute', left: 112, right: 0, bottom: 0, height: 1, background: 'var(--line-divider-alt)', transformOrigin: '0 50%', scale: '0 1' }} />
            </div>
          ))}

          {/* the rows: one per project, they move, they never re-render */}
          {P.map((p, i) => {
            const type = p.media as MediaKind;
            const isPost = type === 'paper';
            return (
              <a
                key={p.id}
                className="v3row"
                href={isPost ? `/writing/${p.id}` : `/work/${p.id}`}
                data-i={i}
                onClick={(e) => { if (s.suppress) { e.preventDefault(); return; } if (onOpen) { e.preventDefault(); onOpen(i); } }}
                onMouseEnter={() => { s.ih = i; }}
                onMouseLeave={() => { if (s.ih === i) s.ih = null; }}
                onFocus={() => { s.ih = i; }}
                onBlur={() => { if (s.ih === i) s.ih = null; }}
                ref={(el) => { rowEls.current[i] = el; }}
                style={{ position: 'absolute', left: 100, width: 920, top: 0, height: 60, padding: '0 20px', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '80px minmax(0, 1fr) 170px 230px 24px', columnGap: 32, alignItems: 'center', color: 'inherit', textDecoration: 'none', borderRadius: 8, transformOrigin: '50% 0', pointerEvents: 'none', opacity: 0 }}
              >
                <span />
                <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', minWidth: 0 }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flex: 'none' }}><path d={ICON[TYPEICON[p.type]]} /></svg>
                  <span className="v3tyl" style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, whiteSpace: 'nowrap' }}>{p.type}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  {stackOf[i].logos.map((g2) => (
                    <span key={g2.t} title={g2.t} style={{ display: 'flex', flex: 'none' }}>
                      <svg className="v3lg" width={g2.w ?? 18} height={g2.h ?? 18} viewBox={g2.vb ?? '0 0 24 24'} role="img" aria-label={g2.t} style={{ '--b': logoColor(g2.t) } as React.CSSProperties}><path d={g2.d} /></svg>
                    </span>
                  ))}
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stackOf[i].text}</span>
                </span>
                <span className="v3arr" aria-hidden style={{ textAlign: 'right', color: 'var(--text-primary)' }}>→</span>
                <span data-line aria-hidden style={{ position: 'absolute', left: 20, right: 20, bottom: 0, height: 1, background: 'var(--line-hairline)', transformOrigin: '0 50%', scale: '0 1' }} />
              </a>
            );
          })}

          <span ref={emptyRef} style={{ position: 'absolute', left: 232, top: 262, fontSize: 17, color: 'var(--text-secondary)', opacity: 0 }}>{emptyMsg}</span>
        </div>
      </div>

      {/* the preview: it fades in beside the list and glides to whichever row you're on */}
      <div aria-hidden style={{ position: 'absolute', left: 1060, width: 300, top: 0, pointerEvents: 'none' }}>
        {/* the loop drives this box's glide, scale and fade (the wrapper must stay opaque or the preview never shows) */}
        <div ref={pvBoxRef} style={{ opacity: 0, transformOrigin: '0 50%' }}>
          <div ref={pvYRef} style={{ position: 'relative', width: 300, transition: 'height .35s cubic-bezier(.22,1,.36,1)' }}>
            {P.map((p, i) => (
              <div key={p.id} ref={(el) => { pvEls.current[i] = el; }} style={{ position: 'absolute', left: 0, top: 0, width: 520, transformOrigin: '0 0', scale: '0.5769', opacity: 0, visibility: 'hidden' }}>
                <MediaBlock
                  kind={p.media as MediaKind}
                  name={p.name}
                  repo={p.media === 'repo' ? stackOf[i].text : undefined}
                  desc={p.media === 'repo' ? p.desc : undefined}
                  date={postMeta[p.id]?.date}
                  mins={postMeta[p.id]?.mins}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span ref={pvNameRef} style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }} />
            <span ref={pvLineRef} style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-secondary)' }} />
          </div>
        </div>
      </div>

      {/* TILES: each places itself; together they read as one surface */}
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
        {P.map((p, i) => {
          const type = p.media as MediaKind;
          const isPost = type === 'paper';
          return (
            <a
              key={p.id}
              className="v3tile"
              href={isPost ? `/writing/${p.id}` : `/work/${p.id}`}
              draggable={false}
              aria-label={p.name + ', ' + p.type}
              onClick={(e) => {
                if (s.suppress) { e.preventDefault(); return; }
                if (onOpen) { e.preventDefault(); onOpen(i); }
              }}
              onMouseEnter={() => { if (!(s.drag && s.drag.moved)) s.hover = i; }}
              onMouseLeave={() => { s.hover = null; }}
              ref={(el) => { tileEls.current[i] = el; }}
              style={{ position: 'absolute', left: 0, top: 0, width: 520, display: 'block', color: 'inherit', textDecoration: 'none', transformOrigin: '50% 50%', pointerEvents: 'none', cursor: 'pointer' }}
            >
              <MediaBlock
                kind={type}
                name={p.name}
                repo={type === 'repo' ? stackOf[i].text : undefined}
                desc={type === 'repo' ? p.desc : undefined}
                date={postMeta[p.id]?.date}
                mins={postMeta[p.id]?.mins}
              />
            </a>
          );
        })}
      </div>

      {/* frozen while the list scrolls: the type filter and the column heads */}
      <div ref={bandRef} style={{ position: 'absolute', left: 0, top: 0, width: 1040, height: 240, background: wallColor, opacity: 0, pointerEvents: 'none' }}>
        <div ref={bandInnerRef} style={{ position: 'absolute', inset: 0 }}>
          {/* types: pick one and the rest fold away. Or just start typing */}
          <div style={{ position: 'absolute', left: 120, right: 40, top: 112, height: 56 }}>
            <div ref={filterRowRef} role="group" aria-label="Show a type" style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: 56, display: 'flex', alignItems: 'center', gap: 14 }}>
                {kindBtns.map((c) => (
                  <button
                    key={c.label}
                    className="v3kd"
                    onClick={() => setFilt(c.g)}
                    aria-pressed={c.on ? 'true' : 'false'}
                    aria-label={c.aria}
                    style={{ '--c': c.col, position: 'relative', width: 64, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' } as React.CSSProperties}
                  >
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flex: 'none' }}><path d={c.icon} /></svg>
                    <sup aria-hidden style={{ marginLeft: 5, fontFamily: "'Geist Mono', monospace", fontSize: 11, fontWeight: 400, verticalAlign: 12 }}>{c.n}</sup>
                    <span className="v3kdt" aria-hidden style={{ left: 13 }}>{c.label}</span>
                  </button>
                ))}
              </div>
              <span className="v3kind-line" aria-hidden style={{ position: 'absolute', left: 0, top: 50, width: 26, height: 1.5, background: 'var(--text-primary)', borderRadius: 1, translate: `${(filt == null ? 0 : filt + 1) * 78}px 0` }} />
              <div aria-hidden style={{ position: 'absolute', left: 548, top: 0, height: 56, width: 260, overflow: 'hidden', pointerEvents: 'none' }}>
                {kindBtns.map((c) => (
                  <span key={c.label} className="v3kind-name" style={{ position: 'absolute', left: 0, top: 0, lineHeight: '56px', whiteSpace: 'nowrap', fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', opacity: c.lo, translate: `0 ${c.ly}` }}>{c.label}</span>
                ))}
              </div>
            </div>
            <div aria-live="polite" ref={qdRef} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'baseline', gap: 20, opacity: 0, translate: '0 10px', pointerEvents: 'none' }}>
              <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: '56px', whiteSpace: 'pre' }}>{q}<span className="v3caret" /></span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'var(--text-label)' }}>{countInfo.vis === 1 ? '1 project · esc to clear' : countInfo.vis + ' projects · esc to clear'}</span>
            </div>
            <span ref={qHintRef} style={{ position: 'absolute', right: 0, top: 22, fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'var(--text-tertiary)' }}>type to find</span>
          </div>

          {/* column heads: click one to sort by it, again to go back */}
          <div style={{ position: 'absolute', left: 120, width: 880, top: 196, height: 30, display: 'grid', gridTemplateColumns: '80px minmax(0, 1fr) 170px 230px 24px', columnGap: 32, alignItems: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 11.5, letterSpacing: '0.06em', color: 'var(--text-label)' }}>
            <span />
            <button className="v3sh" onClick={() => setSort(sort === 'name' ? 'featured' : 'name')} aria-pressed={sort === 'name' ? 'true' : 'false'} style={{ '--c': sort === 'name' ? 'var(--text-primary)' : 'var(--text-label)', justifySelf: 'start', position: 'relative', height: 30 } as React.CSSProperties}>
              {sort === 'name' ? 'PROJECT · A–Z' : 'PROJECT'}
              <span aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 2, height: 1.5, background: 'var(--text-primary)', transformOrigin: '0 50%', scale: `${sort === 'name' ? 1 : 0} 1`, transition: 'scale .45s cubic-bezier(.34,1.56,.64,1)' }} />
            </button>
            <button className="v3sh" onClick={() => setSort(sort === 'type' ? 'featured' : 'type')} aria-pressed={sort === 'type' ? 'true' : 'false'} style={{ '--c': sort === 'type' ? 'var(--text-primary)' : 'var(--text-label)', justifySelf: 'start', position: 'relative', height: 30 } as React.CSSProperties}>
              {sort === 'type' ? 'TYPE · GROUPED' : 'TYPE'}
              <span aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 2, height: 1.5, background: 'var(--text-primary)', transformOrigin: '0 50%', scale: `${sort === 'type' ? 1 : 0} 1`, transition: 'scale .45s cubic-bezier(.34,1.56,.64,1)' }} />
            </button>
            <span>{colHead}</span>
            <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{countInfo.vis === countInfo.total ? String(countInfo.total) : countInfo.vis + ' / ' + countInfo.total}</span>
          </div>

          <span aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: 240, height: 20, background: `linear-gradient(${wallColor}, var(--room-bg-0))`, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* what's in focus (or under the pointer), always in the same spot */}
      <div ref={capRef} aria-live="polite" style={{ position: 'absolute', left: 56, bottom: 52, display: 'flex', flexDirection: 'column', gap: 6, opacity: 0, pointerEvents: 'none' }}>
        <span ref={capNRef} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12.5, color: 'var(--text-label)' }} />
        <span ref={capNameRef} style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em' }} />
        <span ref={capTypeRef} style={{ maxWidth: 560, fontSize: 15, lineHeight: 1.45, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} />
      </div>

      {/* where you are: one tick per project */}
      <div ref={railRef} role="group" aria-label="Projects" style={{ position: 'absolute', right: 40, top: '50%', translate: '0 -50%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: 0, pointerEvents: 'none' }}>
        {P.slice(0, NW).map((p, i) => (
          <button
            key={p.id}
            className="v3tick"
            onClick={() => glideTo(i)}
            aria-label={p.name}
            aria-current="false"
            ref={(el) => { tickEls.current[i] = el; }}
            style={{ position: 'relative', height: 44, width: 56, padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <span className="v3tn" aria-hidden style={{ position: 'absolute', right: 64, whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text-primary)', opacity: 0, translate: '6px 0' }}>{p.name}</span>
            <span className="tl" style={{ display: 'block', height: 1.5, width: 12, background: 'var(--line-hover)', borderRadius: 1, transition: 'width .2s ease, background-color .2s ease' }} />
          </button>
        ))}
      </div>
    </div>
  );
});

export default WallIndex2;

'use client';

// Mobile: the 390x844 phone build (spec/phone.md). Ported verbatim from
// Mobile.dc.html with the data wired to lib/design-v3/data (projects.py port).
// One rAF loop advances the scalars (turn/pan/opening/closing, wall drum, fades);
// per-frame values are written to DOM refs, discrete structure comes from state.
// The simulated keyboard of the prototype is removed (owner decision): the real
// keyboard height comes from window.visualViewport.

import { useTheme } from '@/lib/design-v3/theme';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import MediaBlock, { type MediaKind } from './MediaBlock';
import SystemViz from './SystemViz';
import { flushSync } from 'react-dom';
import BookPage from './BookPage';
import { DARK_MARKS, FICON, ICON, LOGO, TYPEICON } from '@/lib/design-v3/data/icons';
import { PROJECTS, type Project, type Section } from '@/lib/design-v3/data/projects';
import { VOLUMES, type BookPageDef } from '@/lib/design-v3/data/volumes';

const MOB_W = 390;
const MOB_H = 844;

// five kinds + All (Mobile.dc.html / generators/mobile.py:5)
const KINDS: [string, string, string[] | null][] = [
  ['All', 'all', null],
  ['Apps', 'phone', ['Mobile app', 'Android TV']],
  ['Bots', 'bot', ['Discord bot']],
  ['Web', 'web', ['Website redesign', 'Web tool', 'Civic tech']],
  ['Tools', 'term', ['Developer tooling', 'Data system']],
  ['Open source', 'repo', ['Open source']],
  ['Writing', 'pen', ['Writing']],
];

// the phone wall's order: alternating kinds and depths, no two of a kind adjacent (mobile.py:398)
const WALL_ORDER = [0, 2, 4, 13, 1, 8, 14, 3, 10, 7, 15, 9, 12, 5, 16, 11, 6];

const HH: Record<string, number> = { phone: 370, tv: 330, web: 325, discord: 325, term: 300, data: 300, repo: 260, paper: 300 };

const cl = (x: number) => Math.max(0, Math.min(1, x));
const out = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const ease = (x: number) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const OPEN_PRE = 1150; // ms: the volume lifts out of the stack, stands up and turns its cover to you; then the cover turn runs
const CLOSE_PRE = 1000; // ms: the closed volume turns back to its spine, lies down and slides into the stack
const BOOK_W = 340, BOOK_H = 486; // the book at reading size, as the board shows it
const seg = (u: number, a: number, b: number) => ease((u - a) / (b - a));
// Pose of the proxy book at progress u (0 = lying in the stack, 1 = cover to you at the board). The book's centre is the
// origin; we keep the centre of its nearest face on z = 0, so both ends match the flat pieces they hand over to.
function bookPose(u: number, r: { x: number; y: number; w: number; h: number }) {
  const ss = r.w / BOOK_H; // stack scale: the spine's length is the book's height
  const dk = r.h / ss; // thickness at reading size
  const stand = seg(u, 0.14, 0.62);
  const turn = seg(u, 0.5, 0.93);
  const sc = ss + (1 - ss) * stand;
  const th = 90 * (1 - turn);
  const rad = (th * Math.PI) / 180;
  const sx = r.x + r.w / 2, sy = r.y + r.h / 2;
  const lift = 64 * seg(u, 0, 0.24) * (1 - seg(u, 0.46, 0.82));
  return {
    px: sx + (195 - sx) * stand, py: sy + (335 - sy) * stand,
    pz: -sc * ((BOOK_W / 2) * Math.sin(rad) + (dk / 2) * Math.cos(rad)) + lift,
    phi: -90 * (1 - stand), th, sc, ss, dk,
  };
}
const FX_SLIDE = 620, FX_FADE = 380; // ms: Wall/Index to About and back, and Wall to Index
const HOLD_MS = 170; // a landed leaf fades out over this long, so the page beneath settles in instead of popping

type Screen = 'wall' | 'index' | 'project' | 'shelf' | 'book';

export interface MobileHandle { noop?: boolean }

function sceneFromPath(pathname: string): { screen: Screen; pi: number; contact: boolean } {
  if (pathname === '/index') return { screen: 'index', pi: 0, contact: false };
  if (pathname === '/about') return { screen: 'shelf', pi: 0, contact: false };
  if (pathname === '/contact') return { screen: 'shelf', pi: 0, contact: true };
  const m = /^\/(work|writing)\/([^/]+)\/?$/.exec(pathname);
  if (m) {
    const pi = PROJECTS.findIndex((p) => p.id === decodeURIComponent(m[2]));
    if (pi >= 0) return { screen: 'project', pi, contact: false };
  }
  return { screen: 'wall', pi: 0, contact: false };
}

function pathFor(screen: Screen, p: Project | undefined, contact: boolean): string {
  if (screen === 'index') return '/index';
  if (screen === 'project' && p) return (p.type === 'Writing' ? '/writing/' : '/work/') + p.id;
  if (screen === 'shelf') return contact ? '/contact' : '/about';
  return '/';
}

interface Turn { from: number; to: number; then: 'L' | 'R' | null; dur: number; t0: number; x0: number }

const Mobile = forwardRef<MobileHandle, { initialPath: string; height?: number }>(function Mobile({ initialPath, height = MOB_H }, ref) {
  // Screens are drawn for 844 tall. A taller or shorter phone moves the centred content by half the difference, within limits.
  const { theme, toggle } = useTheme();
  const dy = Math.max(-30, Math.min(60, (height - MOB_H) / 2));
  const P: Project[] = PROJECTS;
  const V = VOLUMES;
  const n = P.length;
  useImperativeHandle(ref, () => ({}), []);

  const init = useRef(sceneFromPath(initialPath)).current;
  const rootRef = useRef<HTMLDivElement>(null);
  const wallScrollRef = useRef<HTMLDivElement>(null);
  const projScrollRef = useRef<HTMLDivElement>(null);

  // ---- discrete state
  const [screen, setScreen] = useState<Screen>(init.screen === 'project' ? 'project' : init.screen === 'book' ? 'shelf' : init.screen);
  const [pi, setPi] = useState(init.pi);
  const [from, setFrom] = useState<Screen>(init.screen === 'project' ? 'wall' : 'shelf');
  const [filt, setFilt] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [vol, setVol] = useState(0);
  const [sp, setSp] = useState(0);
  const [side, setSide] = useState<'L' | 'R'>('L');
  const [turn, setTurn] = useState<Turn | null>(null);
  const [hold, setHold] = useState<Turn | null>(null); // the finished turn, while its leaf fades out
  const [leaving, setLeaving] = useState<Screen | null>(null); // the screen on its way out, kept mounted while it transitions
  const [pan, setPan] = useState<{ from: number; t0: number } | null>(null);
  const [opening, setOpening] = useState<{ i: number; t0: number } | null>(null);
  const [closing, setClosing] = useState<{ t0: number } | null>(null);
  const [kb, setKb] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [cur, setCur] = useState(0);
  const [focus, setFocus] = useState(0); // wall drum focus
  const [form, setForm] = useState({ name: '', mail: '', msg: '', title: '' });

  // ---- mutable scene for the loop
  const s = useRef({
    turn: null as Turn | null, hold: null as { tr: Turn; t0: number } | null, shut: null as { t0: number } | null, fx: null as { from: Screen; to: Screen; t0: number; dur: number } | null, pan: null as { from: number; t0: number } | null,
    opening: null as { i: number; t0: number } | null, closing: null as { t0: number } | null,
    kb: false, kbField: null as { top: number; bottom: number } | null, kbDy: 0, kbH: 0,
    wf: 0, back0: 0, reduced: false, raf: 0, last: 0,
    sp: 0, side: 'L' as 'L' | 'R', vol: 0,
    screen: init.screen === 'project' ? 'project' : init.screen === 'book' ? 'shelf' : (init.screen as Screen),
    lastPos: -1, lastEnds: '',
  }).current;

  useEffect(() => { s.turn = turn; }, [turn, s]);
  useEffect(() => { s.pan = pan; }, [pan, s]);
  useEffect(() => { s.opening = opening; }, [opening, s]);
  useEffect(() => { s.closing = closing; }, [closing, s]);
  useEffect(() => { s.kb = kb; }, [kb, s]);
  useEffect(() => { s.sp = sp; }, [sp, s]);
  useEffect(() => { s.side = side; }, [side, s]);
  useEffect(() => { s.vol = vol; }, [vol, s]);
  useEffect(() => { s.screen = screen; }, [screen, s]);

  // ---- transitions between Wall, Index and About (Room's camera, in mobile: the wall slides up and fades while the
  // shelf rises from below; Wall and Index crossfade)
  const wallLayerRef = useRef<HTMLDivElement>(null);
  const indexLayerRef = useRef<HTMLDivElement>(null);
  const shelfLayerRef = useRef<HTMLDivElement>(null);
  const prevScreen = useRef<Screen>(screen);
  const fxLayer = (sc: Screen) => (sc === 'wall' ? wallLayerRef.current : sc === 'index' ? indexLayerRef.current : sc === 'shelf' ? shelfLayerRef.current : null);
  const applyFx = (now: number) => {
    const fx = s.fx; if (!fx) return;
    const p = ease((now - fx.t0) / fx.dur);
    const o = fxLayer(fx.from), n = fxLayer(fx.to);
    const set = (el: HTMLElement | null, y: number, op: number) => { if (!el) return; el.style.transform = `translateY(${y.toFixed(2)}px)`; el.style.opacity = op.toFixed(3); el.style.pointerEvents = 'none'; };
    if (fx.from === 'shelf' || fx.to === 'shelf') {
      if (fx.to === 'shelf') { set(o, -0.45 * MOB_H * p, 1 - cl((p - 0.15) / 0.6)); set(n, MOB_H * (1 - p), 1); }
      else { set(o, MOB_H * p, 1); set(n, -0.45 * MOB_H * (1 - p), cl((p - 0.25) / 0.6)); }
    } else { set(o, -10 * p, 1 - p); set(n, 10 * (1 - p), p); }
  };
  useLayoutEffect(() => {
    const prev = prevScreen.current; prevScreen.current = screen;
    const inSet = (x: Screen) => x === 'wall' || x === 'index' || x === 'shelf';
    if (prev !== screen && inSet(prev) && inSet(screen) && !s.reduced) {
      s.fx = { from: prev, to: screen, t0: performance.now(), dur: prev === 'shelf' || screen === 'shelf' ? FX_SLIDE : FX_FADE };
      setLeaving(prev);
    } else { s.fx = null; setLeaving(null); }
  }, [screen, s]);
  // once the outgoing layer is mounted, place both layers at the start pose before the first paint
  useLayoutEffect(() => { if (leaving && s.fx) applyFx(s.fx.t0); });

  // ---- URL sync (client shell owns history)
  const push = useCallback((path: string) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
  }, []);

  const go = useCallback((sc: Screen, extra?: Record<string, unknown>) => {
    setScreen(sc); setTocOpen(false);
    if (extra) Object.assign(s, extra);
    push(pathFor(sc, undefined, false));
  }, [push, s]);

  const openProject = useCallback((i: number) => {
    setPi(i);
    setFrom((f) => (s.screen === 'project' ? f : s.screen));
    setScreen('project'); setTocOpen(false); setCur(0);
    swapAtRef.current = performance.now();
    if (projScrollRef.current) projScrollRef.current.scrollTop = 0;
    push(pathFor('project', P[i], false));
  }, [P, push, s]);

  // ---- the book (Mobile:418-432), verbatim
  // URL sync (client shell owns history)
  const camXRef = useRef<() => number>(() => 0);
  const busy = useCallback(() => !!(s.turn || s.opening || s.closing || s.kb), [s]);
  const sx = useCallback((sd: 'L' | 'R') => (sd === 'L' ? 365 : 25), []); // where the spine sits on screen
  // camX (Mobile:428-431), verbatim
  const camX = useCallback(() => {
    const now = performance.now();
    if (s.turn) { const e = ease((now - s.turn.t0) / s.turn.dur), fwd = s.turn.to > s.turn.from; return s.turn.x0 + ((fwd ? 365 : 25) - s.turn.x0) * e; }
    if (s.pan) { const t = cl((now - s.pan.t0) / 450), e = 1 - Math.pow(1 - t, 3); return s.pan.from + (sx(s.side) - s.pan.from) * e; }
    return sx(s.side);
  }, [s, sx]);
  useEffect(() => { camXRef.current = camX; }, [camX]);
  const panTo = useCallback((sd: 'L' | 'R') => {
    if (sd === s.side) return;
    setSide(sd); setPan({ from: camX(), t0: performance.now() });
  }, [s, camX]);
  const turnTo = useCallback((to: number, then?: 'L' | 'R') => {
    if (!s.turn) setTurn({ from: s.sp, to, t0: performance.now(), dur: s.sp < 0 ? 1050 : 900, then: then ?? null, x0: camXRef.current() });
  }, [s]);
  const next = useCallback(() => {
    if (busy()) return;
    const v = V[s.vol];
    if (s.side === 'L') return panTo('R');
    if (s.sp < v.all.length / 2 - 1) turnTo(s.sp + 1);
  }, [busy, V, s, panTo, turnTo]);
  const prev = useCallback(() => {
    if (busy()) return;
    if (s.side === 'R') return panTo('L');
    if (s.sp > 0) turnTo(s.sp - 1);
  }, [busy, s, panTo, turnTo]);
  const goPage = useCallback((i: number) => {
    if (busy()) return;
    const spd = Math.floor(i / 2), sd = i % 2 ? 'R' : 'L';
    if (spd === s.sp) panTo(sd); else turnTo(spd, sd);
  }, [busy, s, panTo, turnTo]);

  const stackRect = useCallback((i: number) => {
    const Hh = [67, 54, 61, 77, 51, 45], W = [326, 312, 334, 304, 320, 298], O = [-4, 6, -2, 3, -6, 2];
    let y = 652 - Hh.reduce((a, h) => a + h, 0);
    for (let k = 0; k < i; k++) y += Hh[k];
    return { x: 195 - W[i] / 2 + O[i], y, w: W[i], h: Hh[i] };
  }, []);

  const openVol = useCallback((i: number) => {
    if (s.opening || s.shut) return;
    setScreen('shelf'); setVol(i); setOpening({ i, t0: performance.now() }); setClosing(null); setKb(false);
    push(i === V.length - 1 ? '/contact' : '/about');
  }, [s, V.length, push]);

  const closeBook = useCallback(() => {
    if (s.closing) return;
    setClosing({ t0: performance.now() }); setKb(false);
    const a = document.activeElement as HTMLElement | null; if (a && a.blur) a.blur();
  }, [s]);

  // ---- refs for per-frame DOM writes
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const capRef = useRef<HTMLDivElement>(null);
  const capNRef = useRef<HTMLSpanElement>(null);
  const capNameRef = useRef<HTMLSpanElement>(null);
  const capTypeRef = useRef<HTMLSpanElement>(null);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const projInnerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null); // the book perspective board (translate dy)
  const bookRootRef = useRef<HTMLDivElement>(null); // opacity + drop
  const headRef = useRef<HTMLDivElement>(null);
  const ctlRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<HTMLSpanElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const boardXRef = useRef<HTMLDivElement>(null); // the 680px spread, translate x = camX - 340
  const lEdgeRef = useRef<HTMLSpanElement>(null);
  const rEdgeRef = useRef<HTMLSpanElement>(null);
  const castRRef = useRef<HTMLSpanElement>(null);
  const castLRef = useRef<HTMLSpanElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([]); // s1a..s6b (12)
  const stkRef = useRef<HTMLDivElement>(null);
  const hint1Ref = useRef<HTMLSpanElement>(null);
  const hint2Ref = useRef<HTMLSpanElement>(null);
  const bookBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const moRef = useRef<HTMLDivElement>(null);
  const moBookRef = useRef<HTMLDivElement>(null);
  const moShadowRef = useRef<HTMLDivElement>(null);
  const moShCoverRef = useRef<HTMLSpanElement>(null);
  const moShSpineRef = useRef<HTMLSpanElement>(null);

  // ---- mount: reduced motion, rAF loop, visualViewport, focus tracking
  useEffect(() => {
    s.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    s.last = performance.now();
    // wall scroll restore fix (decision, phone spec): scrollTop = wf*180 on mount
    if (wallScrollRef.current) wallScrollRef.current.scrollTop = s.wf * 180;

    const onFin = (e: FocusEvent) => {
      const root = rootRef.current, t = e.target as HTMLElement | null;
      if (!root || !t || !root.contains(t) || !/^(INPUT|TEXTAREA)$/.test(t.tagName) || s.screen !== 'book') return;
      const rr = root.getBoundingClientRect(), k = rr.width / 390, r = t.getBoundingClientRect(), d = s.kbDy || 0;
      s.kbField = { top: (r.top - rr.top) / k - d, bottom: (r.bottom - rr.top) / k - d };
      setKb(true);
    };
    const onFout = () => setKb(false);
    document.addEventListener('focusin', onFin);
    document.addEventListener('focusout', onFout);

    // real keyboard height (decision: visualViewport replaces the simulated keyboard)
    const vv = window.visualViewport;
    let kbH = 0;
    const onVV = () => { if (vv) kbH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); };
    if (vv) { vv.addEventListener('resize', onVV); vv.addEventListener('scroll', onVV); onVV(); }

    const loop = (now: number) => {
      s.last = now;
      // keyboard height, corrected for the letterbox scale (k = screen px per design px)
      if (s.kb) {
        const rr2 = rootRef.current ? rootRef.current.getBoundingClientRect() : null;
        const kr = rr2 && rr2.width ? rr2.width / 390 : 1;
        s.kbH = vv ? kbH / kr : 0;
      } else s.kbH = 0;
      // finish whatever the book is doing (Mobile:439-442)
      if (s.turn && (s.reduced || now - s.turn.t0 > s.turn.dur)) {
        const tr = s.turn; s.turn = null;
        const endSide = tr.to > tr.from ? 'L' : 'R';
        s.sp = tr.to; s.side = endSide;
        s.pan = null;
        const thenPan = !!(tr.then && tr.then !== endSide);
        if (thenPan) { s.pan = { from: sx(endSide), t0: now }; s.side = tr.then!; }
        s.hold = s.reduced || tr.to < 0 ? null : { tr, t0: now };
        // commit the new spread before this frame hides the leaf, or one frame shows the old page
        flushSync(() => {
          setTurn(null); setHold(s.hold ? tr : null); setSp(tr.to); setSide(endSide); setPan(null);
          if (thenPan) { setPan({ from: sx(endSide), t0: now }); setSide(tr.then!); }
        });
      }
      if (s.hold && (s.turn || now - s.hold.t0 > HOLD_MS)) { s.hold = null; setHold(null); }
      if (s.pan && now - s.pan.t0 > 450) { s.pan = null; setPan(null); }
      if (s.opening && (s.reduced || now - s.opening.t0 > OPEN_PRE)) {
        const i = s.opening.i; s.opening = null;
        s.screen = 'book'; s.vol = i;
        if (s.reduced) { s.sp = 0; s.side = 'L'; }
        else { s.sp = -1; s.side = 'R'; s.turn = { from: -1, to: 0, then: null, t0: now, dur: 1050, x0: 25 }; }
        // the book screen must be up in this same frame, because the proxy book is hidden below
        flushSync(() => {
          setOpening(null); setScreen('book'); setVol(i);
          if (s.reduced) { setSp(0); setSide('L'); } else { setSp(-1); setSide('R'); setTurn(s.turn); }
        });
      }
      // closing: turn the leaf back to the cover, then the closed book lies down in the stack
      if (s.closing && !s.shut && !s.turn) {
        if (s.reduced) { s.closing = null; setClosing(null); setScreen('shelf'); s.screen = 'shelf'; s.sp = -1; setSp(-1); }
        else if (s.sp >= 0) { s.turn = { from: s.sp, to: -1, then: null, t0: now, dur: s.sp > 0 ? 750 : 1050, x0: camXRef.current() }; flushSync(() => setTurn(s.turn)); }
        else { s.shut = { t0: now }; s.screen = 'shelf'; flushSync(() => setScreen('shelf')); }
      }
      if (s.shut && now - s.shut.t0 > CLOSE_PRE) { s.shut = null; s.closing = null; setClosing(null); push('/about'); }
      if (s.fx) {
        if (now - s.fx.t0 >= s.fx.dur) {
          const n = fxLayer(s.fx.to);
          if (n) { n.style.transform = ''; n.style.opacity = ''; n.style.pointerEvents = ''; }
          s.fx = null; setLeaving(null);
        } else applyFx(now);
      }

      // wall drum: which tile is in focus
      const wf = Math.max(0, Math.min(WALL_ORDER.length - 1, s.wf)), focusI = Math.round(wf);
      WALL_ORDER.forEach((i, k) => {
        const el = tileRefs.current[k]; if (!el) return;
        const d = k - wf, ad = Math.abs(d), ang = Math.max(-2.6, Math.min(2.6, d)) * 30;
        const q = P[i], h = Math.round(HH[q.media] * Math.min(300 / 520, 220 / HH[q.media]));
        el.style.top = (340 + 390 * Math.sin((ang * Math.PI) / 180)).toFixed(1) + 'px';
        el.style.height = h + 'px';
        el.style.transform = `rotateX(${(-ang).toFixed(2)}deg) scale(${(1 - 0.08 * ad).toFixed(4)})`;
        el.style.opacity = Math.max(0, 1 - 0.5 * ad).toFixed(3);
        el.style.visibility = ad < 2 ? 'visible' : 'hidden';
        el.style.zIndex = String(20 - Math.round(ad * 4));
      });
      if (focusI !== focusRef.current) { focusRef.current = focusI; setFocus(focusI); }
      // caption follows the drum; it fades as you cross between two
      if (capRef.current) capRef.current.style.opacity = Math.max(0.25, 1 - 1.5 * Math.abs(wf - focusI)).toFixed(3);

      // project fade-in
      const fo = s.reduced ? 1 : out((now - (swapAtRef.current || -1e9)) / 380);
      if (projInnerRef.current) projInnerRef.current.style.opacity = fo.toFixed(3);

      // ---- the book, per frame
      const v = V[s.vol], blank: BookPageDef = { kind: 'end', vol: v.n, nextVol: '', nextTitle: '' };
      const pg = (i: number) => v.all[i] || blank;
      const sh = (g: number) => (0.42 * (1 - Math.cos(g)) / 2).toFixed(3), shb = (g: number) => (0.26 * (1 + Math.cos(g)) / 2).toFixed(3); // 0 at rest, to match the unshaded static page
      const tr = s.turn;
      let cov = false;
      if (tr) {
        const e = ease((now - tr.t0) / tr.dur), fwd = tr.to > tr.from, a = fwd ? tr.from : tr.to, b = fwd ? tr.to : tr.from;
        cov = a < 0;
        const ang = fwd ? -180 * e : -180 * (1 - e), lift = Math.sin(Math.PI * e), bend = lift * (cov ? 3 : 6.5) * (fwd ? 1 : -1);
        for (let k = 1; k <= 6; k++) {
          const g = ((ang + (k - 1) * bend) * Math.PI) / 180;
          const strip = stripRefs.current[k - 1]; if (strip) strip.style.transform = k === 1 ? `translateZ(${(lift * 8).toFixed(2)}px) rotateY(${ang.toFixed(3)}deg)` : `rotateY(${bend.toFixed(3)}deg)`;
          const sa = shadeRefs.current[(k - 1) * 2], sb = shadeRefs.current[(k - 1) * 2 + 1];
          if (sa) sa.style.opacity = sh(g); if (sb) sb.style.opacity = shb(g);
        }
        const c = Math.cos((ang * Math.PI) / 180) * 340;
        if (c > 0) { if (castRRef.current) { castRRef.current.style.opacity = (lift * 0.9).toFixed(3); castRRef.current.style.width = Math.round(c + 50) + 'px'; } if (castLRef.current) castLRef.current.style.opacity = '0'; }
        else { if (castLRef.current) { castLRef.current.style.opacity = cov ? '0' : (lift * 0.9).toFixed(3); castLRef.current.style.width = Math.round(-c + 50) + 'px'; castLRef.current.style.left = Math.round(340 + c - 50) + 'px'; } if (castRRef.current) castRRef.current.style.opacity = '0'; }
        if (leafRef.current) { leafRef.current.style.visibility = 'visible'; leafRef.current.style.opacity = '1'; }
        if (lEdgeRef.current) lEdgeRef.current.style.visibility = cov ? 'hidden' : 'visible';
        leafPagesRef.current = { cov, A: cov ? blank : pg(2 * a + 1), B: pg(2 * b) };
      } else {
        const closed = s.sp < 0;
        cov = closed;
        const hd = s.hold, landedFwd = !!hd && hd.tr.to > hd.tr.from;
        for (let k = 1; k <= 6; k++) {
          // a forward leaf rests turned over on the left; a backward one lies flat on the right
          const strip = stripRefs.current[k - 1]; if (strip) strip.style.transform = landedFwd ? (k === 1 ? 'rotateY(-180deg)' : 'rotateY(0deg)') : 'none';
          const sa = shadeRefs.current[(k - 1) * 2], sb = shadeRefs.current[(k - 1) * 2 + 1];
          if (sa) sa.style.opacity = '0'; if (sb) sb.style.opacity = '0';
        }
        if (castRRef.current) castRRef.current.style.opacity = '0';
        if (castLRef.current) castLRef.current.style.opacity = '0';
        if (leafRef.current) {
          leafRef.current.style.visibility = closed || hd ? 'visible' : 'hidden';
          leafRef.current.style.opacity = hd ? (1 - cl((now - hd.t0) / HOLD_MS)).toFixed(3) : '1';
        }
        if (lEdgeRef.current) lEdgeRef.current.style.visibility = closed ? 'hidden' : 'visible';
      }
      // page block thickness
      const spreads = v.all.length / 2;
      // follows the turn, so the page block grows as the leaf goes over instead of jumping when it lands
      const spPos = tr ? Math.max(0, tr.from) + (tr.to - Math.max(0, tr.from)) * ease((now - tr.t0) / tr.dur) : Math.max(0, s.sp);
      const readF = spPos / Math.max(1, spreads - 1);
      if (lEdgeRef.current) { lEdgeRef.current.style.width = (2 + 4 * readF).toFixed(1) + 'px'; lEdgeRef.current.style.left = (-(2 + 4 * readF)).toFixed(1) + 'px'; }
      if (rEdgeRef.current) {
        rEdgeRef.current.style.width = (6 - 4 * readF).toFixed(1) + 'px';
        // the closed book has no page block to show; it grows in as the cover opens and out as it closes
        const eT = tr ? ease((now - tr.t0) / tr.dur) : 0;
        rEdgeRef.current.style.opacity = (tr ? (tr.to < 0 ? 1 - eT : tr.from < 0 ? eT : 1) : s.sp < 0 ? 0 : 1).toFixed(3);
      }
      // camera
      if (boardXRef.current) boardXRef.current.style.left = (camX() - 340).toFixed(1) + 'px';
      // keyboard lift: the field bottom sits 18px above the keyboard, the field top never above y 70.
      // The real viewport height stands in for the artboard's 844 (production rule, phone spec 4.4).
      let dy = 0;
      if (s.kb && s.kbField) {
        const f = s.kbField;
        const rr3 = rootRef.current ? rootRef.current.getBoundingClientRect() : null;
        const kr3 = rr3 && rr3.width ? rr3.width / 390 : 1;
        const vhD = window.innerHeight / kr3;
        dy = Math.min(0, vhD - s.kbH - 18 - f.bottom); if (f.top + dy < 70) dy = Math.min(0, 70 - f.top);
      }
      s.kbDy = dy;
      if (boardRef.current) boardRef.current.style.translate = `0 ${dy.toFixed(1)}px`;
      if (headRef.current) headRef.current.style.opacity = s.kb || s.closing ? '0' : '1';
      if (ctlRef.current) { ctlRef.current.style.opacity = s.kb || s.closing ? '0' : '1'; ctlRef.current.style.pointerEvents = s.kb || s.closing ? 'none' : 'auto'; }
      const pgi = tr
        ? 2 * tr.to + (tr.to > tr.from ? (tr.then === 'R' ? 1 : 0) : tr.then === 'L' ? 0 : 1)
        : Math.max(0, s.sp) * 2 + (s.side === 'R' ? 1 : 0);
      if (posRef.current && pgi !== s.lastPos) { s.lastPos = pgi; posRef.current.textContent = pgi + 1 + ' / ' + v.all.length; }
      const atFirst = s.sp <= 0 && s.side === 'L', atLast = s.sp >= spreads - 1 && s.side === 'R';
      const ends = (atFirst ? 'f' : '') + (atLast ? 'l' : '');
      if (ends !== s.lastEnds) {
        s.lastEnds = ends;
        if (prevBtnRef.current) prevBtnRef.current.style.color = atFirst ? 'var(--line-hover)' : 'var(--text-primary)';
        if (nextBtnRef.current) nextBtnRef.current.style.color = atLast ? 'var(--line-hover)' : 'var(--text-primary)';
      }
      // ---- the shelf stack, and the proxy book that stands up out of it (and lies back down into it)
      const op = s.opening, shut = s.shut;
      const pu = op ? cl((now - op.t0) / OPEN_PRE) : shut ? 1 - cl((now - shut.t0) / CLOSE_PRE) : -1; // -1: no proxy
      const pi = op ? op.i : s.vol;
      const back = s.back0 ? out((now - s.back0) / 380) : 1;
      const rest = pu >= 0 ? (1 - seg(pu, 0, 0.3)).toFixed(3) : '1'; // the others in the stack step back while the book is out
      if (stkRef.current) stkRef.current.style.opacity = pu >= 0 ? '1' : back.toFixed(3);
      if (hint1Ref.current) hint1Ref.current.style.opacity = rest;
      if (hint2Ref.current) hint2Ref.current.style.opacity = rest;
      V.forEach((b, i) => {
        const el = bookBtnRefs.current[i]; if (!el) return;
        el.style.translate = '0px 0';
        el.style.opacity = pu >= 0 ? (i === pi ? '0' : rest) : '1';
      });
      if (moRef.current) moRef.current.style.visibility = pu >= 0 ? 'visible' : 'hidden';
      if (pu >= 0) {
        const P = bookPose(pu, stackRect(pi));
        if (moBookRef.current) moBookRef.current.style.transform = `translate3d(${P.px.toFixed(2)}px, ${P.py.toFixed(2)}px, ${P.pz.toFixed(2)}px) rotateZ(${P.phi.toFixed(3)}deg) rotateY(${P.th.toFixed(3)}deg) scale3d(${P.sc.toFixed(4)}, ${P.sc.toFixed(4)}, ${P.sc.toFixed(4)})`;
        if (moShadowRef.current) moShadowRef.current.style.opacity = seg(pu, 0.72, 1).toFixed(3);
        // light falls on the cover and the spine as each faces you
        const r = (P.th * Math.PI) / 180;
        if (moShCoverRef.current) moShCoverRef.current.style.opacity = (0.4 * Math.sin(r)).toFixed(3);
        if (moShSpineRef.current) moShSpineRef.current.style.opacity = (0.3 * Math.cos(r)).toFixed(3);
      }

      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(s.raf);
      document.removeEventListener('focusin', onFin);
      document.removeEventListener('focusout', onFout);
      if (vv) { vv.removeEventListener('resize', onVV); vv.removeEventListener('scroll', onVV); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ~ [as-built] scenes unmount; the wall re-enters without a Mobile remount, re-apply the restore there too
  useEffect(() => {
    if (screen === 'wall' && wallScrollRef.current) wallScrollRef.current.scrollTop = s.wf * 180;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const focusRef = useRef(0);
  const swapAtRef = useRef(-1e9);
  const leafPagesRef = useRef<{ cov: boolean; A: BookPageDef; B: BookPageDef }>({ cov: true, A: { kind: 'end', vol: '', nextVol: '', nextTitle: '' }, B: VOLUMES[0].all[0] });

  // ---- popstate
  useEffect(() => {
    const onPop = () => {
      const sc = sceneFromPath(window.location.pathname);
      if (sc.screen === 'project') openProject(sc.pi);
      else if (sc.screen === 'shelf') { setScreen('shelf'); if (sc.contact && s.vol !== V.length - 1) openVol(V.length - 1); }
      else { setScreen(sc.screen); }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // /contact deep open (like the Contact tab): the last volume opens by itself
  useEffect(() => {
    if (init.contact) { const t = setTimeout(() => openVol(V.length - 1), 700); return () => clearTimeout(t); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- derived data
  const p = P[pi], nx = P[(pi + 1) % n];
  const secs = ((p.sections || []) as Section[]).map((sec, i) => ({ ...sec, kind: sec.kind || 'text', id: `ms${i}`, hasFig: !!sec.fig, fig: sec.fig || '' }));
  const vis = P.map((_, i) => i).filter((i) => (filt == null || KINDS[filt + 1][2]!.indexOf(P[i].type) >= 0) && (!q.trim() || (P[i].name + ' ' + P[i].type + ' ' + (P[i].stack || []).join(' ')).toLowerCase().indexOf(q.trim().toLowerCase()) >= 0));
  const v = V[vol];
  const spreads = v.all.length / 2;
  const pgiRender = turn ? (turn.to > turn.from ? 2 * turn.to + (turn.then === 'R' ? 1 : 0) : 2 * turn.to + (turn.then === 'L' ? 0 : 1)) : Math.max(0, sp) * 2 + (side === 'R' ? 1 : 0);
  const atFirstR = sp <= 0 && side === 'L', atLastR = sp >= spreads - 1 && side === 'R';
  const idle = !turn;
  const closedIdle = idle && sp < 0;
  const coverTurn = !!turn && (turn.from < 0 || turn.to < 0); // nothing lies under the cover's inside until it lands
  const pg = (i: number) => v.all[i] || { kind: 'end', vol: v.n, nextVol: '', nextTitle: '' };
  // structural pages for the static L/R boards and the leaf faces
  const lt = turn ?? hold; // the leaf keeps its pages while it fades out after landing
  const covNow = lt ? Math.min(lt.from, lt.to) < 0 : closedIdle; // a turn to or from the cover carries the cover on its front
  const aNow = lt ? (lt.to > lt.from ? lt.from : lt.to) : -1;
  const bNow = lt ? (lt.to > lt.from ? lt.to : lt.from) : 0;
  const leafA = covNow ? { kind: 'end', vol: v.n, nextVol: '', nextTitle: '' } : pg(2 * aNow + 1);
  const leafB = pg(2 * bNow);
  const staticL = closedIdle ? { kind: 'end', vol: v.n, nextVol: '', nextTitle: '' } : pg(2 * Math.max(0, sp));
  const staticR = pg(2 * Math.max(0, sp) + 1);
  const tabIdx = ({ wall: 0, index: 1, project: from === 'index' ? 1 : 0, shelf: vol === V.length - 1 && (opening || closing) ? 3 : 2, book: vol === V.length - 1 ? 3 : 2 } as Record<Screen, number>)[screen];
  const showBack = screen === 'project' || screen === 'book';
  const clock = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' });
  const logoColor = (t: string) => (DARK_MARKS.has(t) ? 'var(--text-primary)' : (LOGO[t]?.c ?? undefined));
  const stackText = p.stackText || (p.stack || []).filter((st) => !LOGO[st]).join(' · ');
  const details = (() => {
    const o: { label: string; v: string; icon?: string; dot?: string; status?: boolean }[] = p.post ? [] : [{ label: 'Platform', v: p.facts.find((f) => f.k === 'Platform')?.v || p.type, icon: ICON[TYPEICON[p.type]] }];
    p.facts.forEach((f) => {
      const k = f.k, val = f.v;
      if (k === 'Platform') return;
      if (k === 'Status') { const st = (val || '').toLowerCase(); o.push({ label: 'Status', v: val, dot: /live|shipped/.test(st) ? '#4ADE80' : /pre-launch|prototype|beta/.test(st) ? '#F0B45A' : '#61616A', status: true }); return; }
      o.push({ label: k, v: val, icon: ICON[FICON[FICON_KEYS[k] || 'target']] });
    });
    return o;
  })();
  const postMeta = (q2: Project) => {
    const f = (k: string) => q2.facts.find((fk) => fk.k === k)?.v ?? '';
    return { date: q2.media === 'paper' ? f('Published') : '', mins: q2.media === 'paper' ? f('Reading time').replace(/ read$/i, '') : '' };
  };

  const onWallScroll = (e: React.UIEvent) => { s.wf = (e.currentTarget as HTMLDivElement).scrollTop / 180; };
  const onProjScroll = (e: React.UIEvent) => {
    const sc = e.currentTarget as HTMLDivElement;
    let c = 0; secs.forEach((sec, i) => { const el = document.getElementById(sec.id); if (el && el.offsetTop - 300 <= sc.scrollTop) c = i; });
    if (c !== cur) setCur(c);
  };
  const swDown = (e: React.PointerEvent) => { const t = e.target as HTMLElement; if (/^(INPUT|TEXTAREA|BUTTON|A)$/.test(t.tagName)) { swipeRef.current = null; return; } swipeRef.current = { x: e.clientX, y: e.clientY }; };
  const swUp = (e: React.PointerEvent) => {
    const s0 = swipeRef.current; swipeRef.current = null; if (!s0) return;
    const dx = e.clientX - s0.x, dy2 = e.clientY - s0.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy2) * 1.4) { if (dx < 0) next(); else prev(); }
  };
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  // book structural pages for the leaf faces (recomputed when a turn starts/ends)
  useEffect(() => { leafPagesRef.current = { cov: covNow, A: leafA, B: leafB }; });

  // the six nested strips of the turning leaf (Mobile:291-310): each child sits at
  // left 70 inside its parent, so the per-strip rotateY(bend) angles add up
  const leafStrip = (k: number): React.ReactElement => (
    <div
      key={k}
      ref={(el) => { stripRefs.current[k] = el; }}
      style={{ position: 'absolute', left: k === 0 ? 0 : 70, top: 0, width: 70, height: 600, transformOrigin: '0 50%', transformStyle: 'preserve-3d' }}
    >
      <div className="v3face" style={{ inset: '0 -1px 0 0', overflow: 'hidden' }}>
        {covNow
          ? <div style={{ position: 'absolute', left: -(k * 70), top: 0, width: 420, height: 600, boxSizing: 'border-box', padding: '44px 40px', background: v.tone, color: v.ink, display: 'flex', flexDirection: 'column' }}>
              <span style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 1, background: 'currentColor', opacity: 0.14 }} />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, letterSpacing: '0.22em', opacity: 0.7 }}>AEDWON</span>
              <span style={{ marginTop: 'auto', fontSize: 150, fontWeight: 800, letterSpacing: '-0.075em', lineHeight: 0.86 }}>{v.n}</span>
              <span style={{ fontSize: v.title.length > 9 ? 54 : 64, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.02, overflowWrap: 'anywhere' }}>{v.title}</span>
            </div>
          : <div style={{ position: 'absolute', left: -(k * 70), top: 0, width: 420, height: 600 }}><BookPage page={leafA} side="right" clock={clock} form={form} /></div>}
        <span className="v3shade" ref={(el) => { shadeRefs.current[k * 2] = el; }} style={{ opacity: 0 }} />
      </div>
      <div className="v3face" style={{ inset: '0 -1px 0 0', transform: 'rotateY(180deg)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -350 + k * 70, top: 0, width: 420, height: 600 }}><BookPage page={leafB} side="left" clock={clock} form={form} /></div>
        <span className="v3shade" ref={(el) => { shadeRefs.current[k * 2 + 1] = el; }} style={{ opacity: 0 }} />
      </div>
      {k < 5 ? leafStrip(k + 1) : null}
    </div>
  );

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative', width: MOB_W, height: height, overflow: 'hidden', color: 'var(--text-primary)',
        fontFamily: "'Geist', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
        backgroundColor: 'var(--room-bg)',
        backgroundImage: 'radial-gradient(circle, rgba(237,237,237,0.075) 1px, transparent 1.6px)',
        backgroundSize: '26px 26px', backgroundPosition: `0 0px`,
      }}
    >
      {/* ===== WALL: a vertical drum. Scrolling turns it; whichever project reaches the middle is chosen. ===== */}
      {(screen === 'wall' || leaving === 'wall') && (
        <div ref={wallLayerRef} style={{ position: 'absolute', inset: 0 }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, perspective: 900, perspectiveOrigin: '50% 340px', pointerEvents: 'none', translate: `0 ${dy}px` }}>
            {WALL_ORDER.map((i, k) => {
              const q2 = P[i], meta = postMeta(q2);
              return (
                <div key={q2.id} ref={(el) => { tileRefs.current[k] = el; }} style={{ position: 'absolute', left: 45, top: 340, width: 300, height: 220, translate: '0 -50%', borderRadius: 10, overflow: 'hidden', opacity: 0 }}>
                  <div style={{ position: 'relative', width: 300, height: '100%', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: '50%', top: '50%', width: 520, translate: '-50% -50%', scale: '0.5769' }}>
                      <MediaBlock kind={q2.media as MediaKind} name={q2.name} repo={q2.media === 'repo' ? q2.links[0]?.label : undefined} desc={q2.media === 'repo' ? q2.desc : undefined} date={meta.date} mins={meta.mins} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* the scroller only carries the snapping and the taps; it draws nothing */}
          <div ref={wallScrollRef} className="v3ms" onScroll={onWallScroll} style={{ position: 'absolute', inset: 0, overflowY: 'auto', scrollSnapType: 'y mandatory', scrollPaddingBottom: 164 }}>
            <div style={{ height: 250 }} />
            {WALL_ORDER.map((i, k) => (
              <button
                key={P[i].id}
                className="v3tbtn"
                type="button"
                aria-label={P[i].name + ', ' + P[i].type}
                onClick={() => { if (k === Math.round(s.wf)) openProject(i); else if (wallScrollRef.current) wallScrollRef.current.scrollTo({ top: k * 180, behavior: s.reduced ? 'auto' : 'smooth' }); }}
                onFocus={() => { if (wallScrollRef.current && Math.round(s.wf) !== k) wallScrollRef.current.scrollTo({ top: k * 180, behavior: s.reduced ? 'auto' : 'smooth' }); }}
                style={{ display: 'block', width: 300, height: 180, margin: '0 auto', scrollSnapAlign: 'center', scrollSnapStop: 'always' }}
              />
            ))}
            <div style={{ height: 414 }} />
          </div>
          {/* where you are among all of them, like the rail on the desktop wall */}
          <div aria-hidden style={{ position: 'absolute', right: 10, top: 272, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, pointerEvents: 'none' }}>
            {WALL_ORDER.map((i, k) => (
              <span key={P[i].id} ref={(el) => { railRefs.current[k] = el; }} style={{ display: 'block', height: 1.5, width: k === focus ? 14 : 6, background: k === focus ? 'var(--text-primary)' : 'var(--line-hover)', transition: 'width .25s ease, background-color .25s ease' }} />
            ))}
          </div>
          <div aria-live="polite" ref={capRef} style={{ position: 'absolute', left: 22, right: 22, bottom: 96, display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'none' }}>
            <span ref={capNRef} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: 'var(--text-label)' }}>{String(focus + 1).padStart(2, '0')} / {WALL_ORDER.length}</span>
            <span ref={capNameRef} style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em' }}>{P[WALL_ORDER[focus]].name}</span>
            <span ref={capTypeRef} style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{P[WALL_ORDER[focus]].desc || P[WALL_ORDER[focus]].type}</span>
          </div>
        </div>
      )}

      {/* ===== INDEX ===== */}
      {(screen === 'index' || leaving === 'index') && (
        <div ref={indexLayerRef} style={{ position: 'absolute', inset: 0 }}>
        <div className="v3ms" style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
          <div style={{ padding: '76px 22px 110px' }}>
            <div role="group" aria-label="Show a type" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', height: 48 }}>
              {KINDS.map((k, gi) => {
                const on = gi === 0 ? filt == null : filt === gi - 1;
                return (
                  <button key={k[0]} className="v3tbtn" type="button" aria-pressed={on ? 'true' : 'false'} aria-label={k[0]} onClick={() => setFilt(gi === 0 ? null : gi - 1)} style={{ '--c': on ? 'var(--text-primary)' : 'var(--line-frame)', width: 46, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 } as React.CSSProperties}>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICON[k[1]]} /></svg>
                    <sup style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, verticalAlign: 10 }}>{gi === 0 ? n : P.filter((q2) => k[2]!.indexOf(q2.type) >= 0).length}</sup>
                  </button>
                );
              })}
              <span aria-hidden style={{ position: 'absolute', left: 0, bottom: 2, width: 22, height: 1.5, background: 'var(--text-primary)', translate: `${((filt == null ? 0 : filt + 1) * ((346 - 46) / 6)) + 15}px 0`, transition: 'translate .5s cubic-bezier(.34,1.3,.64,1)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 }}>
              <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.035em' }}>{filt == null ? 'All projects' : KINDS[filt + 1][0]}</span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: 'var(--text-label)' }}>{vis.length === n ? String(n) : vis.length + ' / ' + n}</span>
            </div>
            <label style={{ position: 'relative', display: 'block', marginTop: 10 }}>
              <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Find a project</span>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--text-label)" strokeWidth={1.6} strokeLinecap="round" aria-hidden style={{ position: 'absolute', left: 0, top: 13 }}><path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5l-4.5-4.5" /></svg>
              <input className="v3field" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder="Find a project" type="search" />
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {vis.map((i) => {
                const q2 = P[i], meta = postMeta(q2);
                return (
                  <button key={q2.id} className="v3tbtn" type="button" onClick={() => openProject(i)} style={{ '--c': 'var(--text-primary)', display: 'grid', gridTemplateColumns: '64px minmax(0, 1fr) 24px', gap: 14, alignItems: 'center', minHeight: 60, borderBottom: '1px solid var(--line-hairline)', textAlign: 'left' } as React.CSSProperties}>
                    <div style={{ position: 'relative', width: 64, height: 40, overflow: 'hidden', borderRadius: 4, background: 'var(--dev-screen)' }}>
                      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 520, translate: '-50% -50%', scale: Math.min(64 / 520, 40 / HH[q2.media]).toFixed(4) }}>
                        <MediaBlock kind={q2.media as MediaKind} name={q2.name} repo={q2.media === 'repo' ? q2.links[0]?.label : undefined} desc={q2.media === 'repo' ? q2.desc : undefined} date={meta.date} mins={meta.mins} />
                      </div>
                    </div>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q2.name}</span>
                      <span style={{ fontSize: 12.5, color: 'var(--text-label)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q2.topic || q2.stackText || (q2.stack || []).join(' · ')}</span>
                    </span>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--text-label)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICON[TYPEICON[q2.type]]} /></svg>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* ===== PROJECT: the left page on top, then the work and the story ===== */}
      {screen === 'project' && (
        <>
          <div ref={projScrollRef} className="v3ms" onScroll={onProjScroll} style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--room-bg)' }}>
            <div ref={projInnerRef} style={{ padding: '72px 22px 120px', display: 'flex', flexDirection: 'column', opacity: 0 }}>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.05 }}>{p.name}</h1>
              <p style={{ margin: '12px 0 0', fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{p.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 18 }}>
                {(p.stack || []).map((st) => LOGO[st] && (
                  <svg key={st} className="v3lg" width={LOGO[st].w ?? 18} height={LOGO[st].h ?? 18} viewBox={LOGO[st].vb ?? '0 0 24 24'} role="img" aria-label={st}><path d={LOGO[st].d} fill={logoColor(st)} /></svg>
                ))}
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'var(--text-label)' }}>{stackText}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 11, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--line-hairline)' }}>
                {details.map((d) => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--text-strong)', minWidth: 0 }}>
                    <span style={{ display: 'flex', flex: 'none', width: 16, height: 16, color: 'var(--text-label)' }}>
                      {d.status
                        ? <span style={{ margin: 4, width: 8, height: 8, borderRadius: 99, background: d.dot }} />
                        : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d.icon} /></svg>}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{d.label}: </span>{d.v}
                    </span>
                  </div>
                ))}
              </div>
              {(p.links || []).slice(0, 1).map((l) => (
                <a key={l.href} href={l.href} style={{ marginTop: 18, fontSize: 15, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: 'var(--line-underline)' }}>{l.label} ↗</a>
              ))}
              <div style={{ marginTop: 26, borderRadius: 10, background: 'var(--surface-media)' }}>
                <div style={{ position: 'relative', width: 346, height: Math.round(HH[p.media] * Math.min(346 / 520, 240 / HH[p.media]) + 28), overflow: 'hidden' }}>
                  {p.hero?.src
                    // eslint-disable-next-line @next/next/no-img-element -- already re-encoded to WebP by the studio upload
                    ? <img src={p.hero.src} alt={p.hero.alt || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                    : (
                      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 520, translate: '-50% -50%', scale: Math.min(346 / 520, 240 / HH[p.media]).toFixed(4) }}>
                        <MediaBlock kind={p.media as MediaKind} name={p.name} repo={p.media === 'repo' ? p.links[0]?.label : undefined} desc={p.media === 'repo' ? p.desc : undefined} date={postMeta(p).date} mins={postMeta(p).mins} />
                      </div>
                    )}
                </div>
              </div>
              {p.hero?.src && p.hero.caption && <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-label)' }}>{p.hero.caption}</p>}
              {p.depth === 'case' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
                  {(p.points || []).map((k) => (
                    <div key={k.h} style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid var(--line-divider)' }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>{k.h}</span>
                      <span style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{k.p}</span>
                    </div>
                  ))}
                </div>
              )}
              {secs.map((sec) => (
                <section key={sec.id} id={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 40 }}>
                  {sec.h && <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{sec.h}</h2>}
                  {(sec.p || []).map((para: string, j: number) => (
                    <p key={j} style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{para}</p>
                  ))}
                  {sec.img?.src && (
                    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- already re-encoded to WebP by the studio upload */}
                      <img src={sec.img.src} alt={sec.img.alt || ''} style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 420, objectFit: 'contain', borderRadius: 10, background: 'var(--surface-media)' }} />
                      {sec.img.caption && <figcaption style={{ fontSize: 13, color: 'var(--text-label)' }}>{sec.img.caption}</figcaption>}
                    </figure>
                  )}
                  {sec.hasFig && !sec.img?.src && (
                    <div style={{ height: 220, borderRadius: 10, background: 'var(--surface-media)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 11, color: 'var(--text-label)', textAlign: 'center', padding: '0 16px' }}>{sec.fig}</div>
                  )}
                  {sec.kind === 'systems' && ((sec as { items?: { h: string; p: string[]; which: string; vh: string }[] }).items || []).map((it: { h: string; p: string[]; which: string; vh: string }, k: number) => (
                    <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 22, borderTop: '1px solid var(--line-hairline)' }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{it.h}</h3>
                      {(it.p || []).map((qq: string, j2: number) => (
                        <p key={j2} style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{qq}</p>
                      ))}
                      <div style={{ position: 'relative', width: 346, height: (parseInt(it.vh, 10) * 0.5767).toFixed(0) + 'px', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, width: 600, transformOrigin: '0 0', scale: '0.5767' }}>
                          <SystemViz which={it.which} hintSize="600px,370px" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {sec.kind === 'status' && ((sec as { cols?: { h: string; items: string[] }[] }).cols || []).map((col: { h: string; items: string[] }, k: number) => (
                    <div key={k} style={{ display: 'flex', flexDirection: 'column', paddingTop: 10, borderTop: '1px solid var(--line-divider)', fontSize: 14.5, lineHeight: 1.7 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-label)', paddingBottom: 4 }}>{col.h}</span>
                      {col.items.map((li, j3) => <span key={j3} style={{ color: 'var(--text-strong)' }}>{li}</span>)}
                    </div>
                  ))}
                </section>
              ))}
              <button
                className="v3tbtn"
                type="button"
                onClick={() => openProject((pi + 1) % n)}
                style={{ '--c': 'var(--text-primary)', marginTop: 56, paddingTop: 18, borderTop: '1px solid var(--line-track)', display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' } as React.CSSProperties}
              >
                <span style={{ fontSize: 13, color: 'var(--text-label)' }}>Next project</span>
                <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em' }}>{nx.name} →</span>
              </button>
            </div>
          </div>
          {/* contents: a small square in the corner shows where you are; tap it for the parts */}
          {secs.length > 1 && (
            <>
              <button
                className="v3tbtn"
                type="button"
                aria-label="Contents"
                aria-expanded={tocOpen ? 'true' : 'false'}
                onClick={() => setTocOpen(!tocOpen)}
                style={{ '--c': 'var(--text-primary)', position: 'absolute', right: 18, bottom: 26, width: 48, height: 48, borderRadius: 12, background: 'var(--glass-panel-90)', border: '1px solid var(--line-hairline-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as React.CSSProperties}
              >
                {secs.map((_, i) => (
                  <span key={i} style={{ display: 'block', height: 1.5, width: i === cur ? 20 : 12, background: i === cur ? 'var(--text-primary)' : 'var(--line-underline)', borderRadius: 1 }} />
                ))}
              </button>
              <div aria-hidden={!tocOpen} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 12px 30px', borderRadius: '16px 16px 0 0', background: 'var(--glass-panel-97)', borderTop: '1px solid var(--line-hairline-2)', translate: `0 ${tocOpen ? '0px' : '110%'}`, transition: 'translate .4s cubic-bezier(.22,1,.36,1)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                {secs.map((sec, i) => (
                  <button
                    key={sec.id}
                    className="v3tbtn"
                    type="button"
                    onClick={() => { const el = document.getElementById(sec.id); if (el && projScrollRef.current) projScrollRef.current.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' }); setTocOpen(false); }}
                    style={{ '--c': i === cur ? 'var(--text-primary)' : 'var(--text-label)', display: 'block', width: '100%', minHeight: 48, padding: '0 12px', textAlign: 'left', fontSize: 16 } as React.CSSProperties}
                  >
                    {sec.h || 'Introduction'}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ===== SHELF: volumes lie in a stack, spines out ===== */}
      {(screen === 'shelf' || leaving === 'shelf') && (
        <div ref={shelfLayerRef} style={{ position: 'absolute', inset: 0, translate: `0 ${dy}px` }}>
          <div ref={stkRef} style={{ position: 'absolute', inset: 0 }}>
            <span ref={hint1Ref} style={{ position: 'absolute', left: 0, right: 0, top: 214, textAlign: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: 'var(--text-label)' }}>Six volumes</span>
            {V.map((b, i) => {
              const r = stackRect(i);
              return (
                <button
                  key={b.n}
                  ref={(el) => { bookBtnRefs.current[i] = el; }}
                  className="v3tbtn"
                  type="button"
                  aria-label={`Volume ${b.n}: ${b.title}`}
                  onClick={() => openVol(i)}
                  style={{ '--c': b.ink, position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: 'border-box', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 3, background: b.tone, boxShadow: 'var(--shadow-spine-phone)', textAlign: 'left' } as React.CSSProperties}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 30, flex: 'none' }}>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 8.5, letterSpacing: '0.14em', opacity: 0.7 }}>VOL.</span>
                    <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>{b.n}</span>
                  </span>
                  <span style={{ width: 1, height: '46%', background: 'currentColor', opacity: 0.28, flex: 'none' }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: r.h < 50 ? 15 : 17, fontWeight: 800, letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</span>
                  <span style={{ width: 1, height: '46%', background: 'currentColor', opacity: 0.28, flex: 'none' }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 8.5, letterSpacing: '0.22em', opacity: 0.7, flex: 'none' }}>AEDWON</span>
                </button>
              );
            })}
            <div style={{ position: 'absolute', left: 18, right: 18, top: 652, height: 2, background: 'var(--line-shelf-top)' }} />
            <div style={{ position: 'absolute', left: 18, right: 18, top: 654, height: 12, background: 'var(--surface-sunken)' }} />
            <span ref={hint2Ref} style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontSize: 14, color: 'var(--text-label)' }}>Tap a volume to open it</span>
          </div>
          {/* the chosen volume, as a small 3D box: it stands up out of the stack and turns its cover to you (and back) */}
          <div ref={moRef} aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 390, height: 700, perspective: 1700, perspectiveOrigin: '195px 335px', pointerEvents: 'none', visibility: 'hidden' }}>
            <div ref={moShadowRef} style={{ position: 'absolute', left: 25, top: 92, width: BOOK_W, height: BOOK_H, borderRadius: '3px 6px 6px 3px', boxShadow: 'var(--shadow-book-phone)', opacity: 0 }} />
            {(() => {
              const mi = V[vol], mr = stackRect(vol), mss = mr.w / BOOK_H, mdk = mr.h / mss;
              const paper = '#E4E2DB';
              return (
                <div ref={moBookRef} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
                  {/* cover */}
                  <div className="v3face" style={{ left: -BOOK_W / 2, top: -BOOK_H / 2, width: BOOK_W, height: BOOK_H, transform: `translateZ(${mdk / 2}px)`, background: mi.tone, color: mi.ink, borderRadius: '3px 6px 6px 3px', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: 420, height: 600, scale: '0.8095', transformOrigin: '0 0', boxSizing: 'border-box', padding: '44px 40px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 1, background: 'currentColor', opacity: 0.14 }} />
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, letterSpacing: '0.22em', opacity: 0.7 }}>AEDWON</span>
                      <span style={{ marginTop: 'auto', fontSize: 150, fontWeight: 800, letterSpacing: '-0.075em', lineHeight: 0.86 }}>{mi.n}</span>
                      <span style={{ fontSize: mi.title.length > 9 ? 54 : 64, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.02, overflowWrap: 'anywhere' }}>{mi.title}</span>
                    </div>
                    <span ref={moShCoverRef} className="v3shade" style={{ opacity: 0 }} />
                  </div>
                  {/* back cover */}
                  <div className="v3face" style={{ left: -BOOK_W / 2, top: -BOOK_H / 2, width: BOOK_W, height: BOOK_H, transform: `translateZ(${-mdk / 2}px) rotateY(180deg)`, background: mi.tone, borderRadius: '3px 6px 6px 3px' }} />
                  {/* spine: laid out as in the stack, turned to read down the spine once the book stands */}
                  <div className="v3face" style={{ left: -mdk / 2, top: -BOOK_H / 2, width: mdk, height: BOOK_H, transform: `translateX(${-BOOK_W / 2}px) rotateY(-90deg)`, background: mi.tone, color: mi.ink, borderRadius: 3, overflow: 'hidden', boxShadow: 'var(--shadow-spine-phone)' }}>
                    <div style={{ position: 'absolute', left: '50%', top: '50%', width: mr.w, height: mr.h, transform: `translate(-50%, -50%) rotate(90deg) scale(${(1 / mss).toFixed(4)})`, boxSizing: 'border-box', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 30, flex: 'none' }}>
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 8.5, letterSpacing: '0.14em', opacity: 0.7 }}>VOL.</span>
                        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>{mi.n}</span>
                      </span>
                      <span style={{ width: 1, height: '46%', background: 'currentColor', opacity: 0.28, flex: 'none' }} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: mr.h < 50 ? 15 : 17, fontWeight: 800, letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mi.title}</span>
                      <span style={{ width: 1, height: '46%', background: 'currentColor', opacity: 0.28, flex: 'none' }} />
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 8.5, letterSpacing: '0.22em', opacity: 0.7, flex: 'none' }}>AEDWON</span>
                    </div>
                    <span ref={moShSpineRef} className="v3shade" style={{ opacity: 0 }} />
                  </div>
                  {/* page edges: fore-edge, top and bottom */}
                  <div className="v3face v3edgeV" style={{ left: -mdk / 2, top: -BOOK_H / 2 + 5, width: mdk, height: BOOK_H - 10, transform: `translateX(${BOOK_W / 2}px) rotateY(90deg)` }} />
                  <div className="v3face" style={{ left: -BOOK_W / 2 + 4, top: -mdk / 2, width: BOOK_W - 8, height: mdk, transform: `translateY(${-BOOK_H / 2}px) rotateX(90deg)`, background: `repeating-linear-gradient(to bottom, ${paper} 0px, ${paper} 2px, #cfcdc5 2px, #cfcdc5 3px)` }} />
                  <div className="v3face" style={{ left: -BOOK_W / 2 + 4, top: -mdk / 2, width: BOOK_W - 8, height: mdk, transform: `translateY(${BOOK_H / 2}px) rotateX(-90deg)`, background: `repeating-linear-gradient(to bottom, ${paper} 0px, ${paper} 2px, #cfcdc5 2px, #cfcdc5 3px)` }} />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===== BOOK: an open book, read one page at a time ===== */}
      {screen === 'book' && (
        <div ref={bookRootRef} style={{ position: 'absolute', inset: 0, translate: `0 ${dy}px` }}>
          <div ref={headRef} style={{ opacity: 0, position: 'absolute', left: 0, right: 0, top: 64, textAlign: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'var(--text-label)', transition: 'opacity .25s ease' }}>Vol. {v.n} · {v.title}</div>
          <div ref={boardRef} onPointerDown={swDown} onPointerUp={swUp} style={{ position: 'absolute', left: 0, top: 0, width: 390, height: 700, perspective: 1700, perspectiveOrigin: '195px 335px', transition: 'translate .38s cubic-bezier(.22,1,.36,1)', touchAction: 'pan-y' }}>
            <div ref={boardXRef} style={{ position: 'absolute', left: 25, top: 92, width: 680, height: 486, transformStyle: 'preserve-3d' }}>
              {/* the page block: thickness under each side, more on the side you've read */}
              <span aria-hidden className="v3edgeV" ref={lEdgeRef} style={{ position: 'absolute', left: -2, top: 3, width: 2, height: 480, visibility: closedIdle ? 'hidden' : 'visible', borderRadius: '2px 0 0 2px' }} />
              <span aria-hidden className="v3edgeV" ref={rEdgeRef} style={{ position: 'absolute', left: 680, top: 3, width: 6, height: 480, borderRadius: '0 2px 2px 0' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, width: 340, height: 486, overflow: 'hidden', borderRadius: '3px 0 0 3px', visibility: closedIdle || coverTurn ? 'hidden' : 'visible', boxShadow: 'var(--shadow-book-phone)' }}>
                <div style={{ width: 420, height: 600, transformOrigin: '0 0', scale: '0.8095' }}>
                  <BookPage page={staticL} side="left" clock={clock} form={form} onField={(k, val) => setForm((f) => ({ ...f, [k]: val }))} onShelve={() => { setForm((f) => ({ ...f, msg: '' })); closeBook(); }} onGo={goPage} onNextVol={() => { if (vol < V.length - 1) { setScreen('shelf'); openVol(vol + 1); } }} />
                </div>
              </div>
              <div style={{ position: 'absolute', left: 340, top: 0, width: 340, height: 486, overflow: 'hidden', borderRadius: '0 3px 3px 0', boxShadow: 'var(--shadow-book-phone)' }}>
                <div style={{ width: 420, height: 600, transformOrigin: '0 0', scale: '0.8095' }}>
                  <BookPage page={staticR} side="right" clock={clock} form={form} onField={(k, val) => setForm((f) => ({ ...f, [k]: val }))} onShelve={() => { setForm((f) => ({ ...f, msg: '' })); closeBook(); }} onGo={goPage} onNextVol={() => { if (vol < V.length - 1) { setScreen('shelf'); openVol(vol + 1); } }} />
                </div>
                <span aria-hidden ref={castRRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.30), rgba(0,0,0,0))', opacity: 0, pointerEvents: 'none' }} />
              </div>
              <span aria-hidden ref={castLRef} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 486, background: 'linear-gradient(270deg, rgba(0,0,0,.30), rgba(0,0,0,0))', opacity: 0, pointerEvents: 'none' }} />
              {/* the turning leaf (or the cover), hinged at the spine, in six nested strips so it curls */}
              <div ref={leafRef} aria-hidden style={{ position: 'absolute', left: 340, top: 0, width: 420, height: 600, transformOrigin: '0 0', scale: '0.8095', transformStyle: 'preserve-3d', pointerEvents: 'none', visibility: 'hidden' }}>
                {leafStrip(0)}
              </div>
            </div>
          </div>
          <div ref={ctlRef} style={{ opacity: 0, position: 'absolute', left: 20, right: 20, top: 612, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'opacity .25s ease' }}>
            <button ref={prevBtnRef} className="v3tbtn" type="button" aria-label="Previous page" onClick={prev} style={{ '--c': atFirstR ? 'var(--line-hover)' : 'var(--text-primary)', width: 48, height: 48, fontSize: 20 } as React.CSSProperties}>←</button>
            <span ref={posRef} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'var(--text-secondary)' }}>{pgiRender + 1} / {v.all.length}</span>
            <button ref={nextBtnRef} className="v3tbtn" type="button" aria-label="Next page" onClick={next} style={{ '--c': atLastR ? 'var(--line-hover)' : 'var(--text-primary)', width: 48, height: 48, fontSize: 20 } as React.CSSProperties}>→</button>
          </div>
        </div>
      )}

      {/* ===== top bar ===== */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 56, padding: '0 10px 0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--glass-room-80)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>Aedwon</span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {showBack && (
            <button className="v3tbtn" type="button" onClick={() => (screen === 'book' ? closeBook() : go(from))} style={{ '--c': 'var(--text-primary)', height: 44, padding: '0 12px', fontSize: 15 } as React.CSSProperties}>{screen === 'book' ? 'Close' : 'Back'}</button>
          )}
          <button className="v3tbtn" type="button" onClick={toggle} aria-label={theme === 'light' ? 'Switch to dark' : 'Switch to light'} style={{ '--c': 'var(--text-label)', width: 44, height: 44 } as React.CSSProperties}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={theme === 'light' ? 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z' : 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4'} />
            </svg>
          </button>
        </span>
      </div>

      {/* ===== bottom bar: the same four as the desktop nav, and the same travelling line ===== */}
      <nav aria-label="Main" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 74, padding: '0 12px 14px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'var(--glass-room-86)', borderTop: '1px solid var(--line-hairline)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', translate: `0 ${screen === 'project' || screen === 'book' ? '100%' : '0px'}`, transition: 'translate .4s cubic-bezier(.22,1,.36,1)' }}>
        {['Wall', 'Index', 'About', 'Contact'].map((label, i) => (
          <button key={label} className="v3tbtn" type="button" aria-current={i === tabIdx ? 'page' : 'false'} onClick={() => (i === 0 ? go('wall') : i === 1 ? go('index') : i === 2 ? (screen === 'book' ? closeBook() : go('shelf')) : screen === 'book' && vol === V.length - 1 ? undefined : openVol(V.length - 1))} style={{ '--c': i === tabIdx ? 'var(--text-primary)' : 'var(--text-label)', width: 82, height: 48, fontSize: 14.5 } as React.CSSProperties}>{label}</button>
        ))}
        <span aria-hidden style={{ position: 'absolute', left: 0, top: 46, width: 26, height: 1.5, background: 'var(--text-primary)', translate: `${(12 + (366 / 4) * tabIdx + (366 / 4 - 26) / 2).toFixed(1)}px 0`, transition: 'translate .55s cubic-bezier(.34,1.3,.64,1)' }} />
      </nav>
    </div>
  );
});

// FI keys, verbatim from generators/mobile.py:15
const FICON_KEYS: Record<string, string> = { Published: 'calendar', 'Reading time': 'clock', Topic: 'tag', Role: 'person', Year: 'calendar', Timeline: 'calendar', Client: 'building', Scale: 'people', 'Ran for': 'clock', Hosting: 'server', Event: 'flag', Contribution: 'commit', For: 'target', Runs: 'browser' };

export default Mobile;

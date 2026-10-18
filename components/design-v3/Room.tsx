'use client';

// Room: the whole desktop page (spec/room.md). One 1440x900 frame; camera between
// the Wall/Index (WallIndex2) and the shelf (AboutVolumes, 740px below), with the
// project layer (ProjectSpread), one shared nav and the points canvas on top.
// All animation constants are ported verbatim from Room.dc.html.

import { useEffect, useMemo, useRef, useState } from 'react';
import WallIndex2 from './WallIndex2';
import AboutVolumes from './AboutVolumes';
import ProjectSpread from './ProjectSpread';
import { PROJECTS } from '@/lib/design-v3/data/projects';
import type { AboutVolumesHandle, ProjectSpreadHandle, Req, WallIndex2Handle } from './contracts';
import { useTheme, type Theme } from '@/lib/design-v3/theme';
const ROOM_W = 1440;
const ROOM_H = 900;

// ---------------------------------------------------------------- URL <-> scene

type Scene =
  | { kind: 'wall' }
  | { kind: 'index' }
  | { kind: 'project'; i: number }
  | { kind: 'shelf' }
  | { kind: 'contact' };

function sceneFromPath(pathname: string): Scene {
  if (pathname === '/index') return { kind: 'index' };
  if (pathname === '/about') return { kind: 'shelf' };
  if (pathname === '/contact') return { kind: 'contact' };
  const m = /^\/(work|writing)\/([^/]+)\/?$/.exec(pathname);
  if (m) {
    const i = PROJECTS.findIndex((p) => p.id === decodeURIComponent(m[2]));
    if (i >= 0) return { kind: 'project', i };
  }
  return { kind: 'wall' };
}

function pathForScene(s: Scene): string {
  switch (s.kind) {
    case 'wall': return '/';
    case 'index': return '/index';
    case 'project': {
      const p = PROJECTS[s.i];
      return (p.type === 'Writing' ? '/writing/' : '/work/') + p.id;
    }
    case 'shelf': return '/about';
    case 'contact': return '/contact';
  }
}

const D = 740; // the shelf hangs 740px below the top of the wall of work

// Dark/light canvas + colour pairs (room.md §5.2). Motion constants are identical.
const DOT = {
  dark: { rgb: '237,237,237', base: 0.075, boost: 0.33 },
  light: { rgb: '17,17,20', base: 0.11, boost: 0.3 },
} as const;


// Nav underline anchor x positions (Room:131)
const X = { wall: 1052, index: 1124, about: 1220, contact: 1292 } as const;

export default function Room({ initialPath }: { initialPath: string }) {
  const { theme } = useTheme();

  // ---- instance state (Room:68-79). Continuous values live in refs.
  const initial = useMemo(() => sceneFromPath(initialPath), [initialPath]);
  const startShelf = initial.kind === 'shelf' || initial.kind === 'contact';
  const startI = initial.kind === 'project' ? initial.i : -1;

  const rootRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);
  const wallWrapRef = useRef<HTMLDivElement>(null);
  const shelfWrapRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const navRefs = { wall: useRef<HTMLButtonElement>(null), index: useRef<HTMLButtonElement>(null), about: useRef<HTMLButtonElement>(null), contact: useRef<HTMLButtonElement>(null) };

  const wall2 = useRef<WallIndex2Handle>(null);
  const volumes = useRef<AboutVolumesHandle>(null);
  const spread = useRef<ProjectSpreadHandle>(null);

  const s = useRef({
    c: startShelf ? 1 : 0, cv: 0, cT: startShelf ? 1 : 0,
    pW: 0, pS: 0, pSAt: 0,
    view: 'wall' as 'wall' | 'index',
    shelfSel: (initial.kind === 'contact' ? 'contact' : 'about') as 'about' | 'contact',
    bookOpen: false,
    pOpen: startI >= 0, po: startI >= 0 ? 1 : 0, pn: 0,
    n: 0,
    mx: -999, my: -999, mxs: -999, mys: -999, bk: 0, focus: -1,
    reduced: false, last: 0, raf: 0,
  }).current;

  // discrete open state, for children props (Esc/arrow gating)
  const [projOpen, setProjOpen] = useState(startI >= 0);
  const nonce = useRef(1);

  const sendReq = (v: string): Req => ({ v, n: ++nonce.current });

  // ---- navigation <-> URL
  const push = (path: string) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
  };

  const toWall = (view: 'wall' | 'index', doPush = true) => {
    s.pOpen = false; setProjOpen(false);
    if (s.bookOpen) volumes.current?.closeReq(sendReq('close'));
    const away = s.c > 0.5;
    s.cT = 0; s.pS = 0; s.view = view;
    wall2.current?.viewReq(sendReq(away ? view + '!' : view));
    if (doPush) push(pathForScene({ kind: view }));
  };

  const toShelf = (contact: boolean, doPush = true) => {
    s.pOpen = false; setProjOpen(false);
    s.cT = 1; s.pW = 0;
    if (contact) { s.shelfSel = 'contact'; volumes.current?.openReq(sendReq('contact')); }
    else if (s.bookOpen) volumes.current?.closeReq(sendReq('close'));
    if (doPush) push(pathForScene({ kind: contact ? 'contact' : 'shelf' }));
  };

  const openProject = (i: number, doPush = true) => {
    s.pn += 1;
    spread.current?.openReq({ v: String(i), n: s.pn });
    s.pOpen = true; setProjOpen(true);
    if (doPush) push(pathForScene({ kind: 'project', i }));
  };

  const closeProject = (doPush = true) => {
    s.pOpen = false; setProjOpen(false);
    if (doPush) push(s.view === 'index' ? '/index' : '/');
  };

  // ---- popstate: apply the scene the URL now describes
  useEffect(() => {
    const apply = (sc: Scene) => {
      if (sc.kind === 'project') { openProject(sc.i, false); return; }
      if (sc.kind === 'wall' || sc.kind === 'index') {
        if (s.cT === 1) { toWall(sc.kind, false); return; } // away → instant view switch
        if (s.view !== sc.kind) { toWall(sc.kind, false); return; }
        if (s.pOpen) closeProject(false);
        return;
      }
      if (sc.kind === 'shelf') { if (s.shelfSel === 'contact' || s.cT !== 1) toShelf(false, false); else if (s.pOpen) closeProject(false); return; }
      if (sc.kind === 'contact') { toShelf(true, false); return; }
    };
    const onPop = () => apply(sceneFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- the frame loop (Room:86-100), verbatim math, DOM writes instead of setState
  useEffect(() => {
    s.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    s.last = performance.now();
    const dotc = theme === 'light' ? DOT.light : DOT.dark;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000); s.last = now;
      if (s.pS && now - s.pSAt > 420) { s.pS *= Math.pow(0.05, dt); if (s.pS < 0.002) s.pS = 0; }
      const tgt = s.cT === 0 ? 0.35 * s.pW : 1 - 0.3 * s.pS;
      if (s.reduced) s.c = s.cT;
      else { s.cv += ((tgt - s.c) * 48 - s.cv * 14) * dt; s.c += s.cv * dt; }
      if (dotc) drawDots(dt, dotc);
      s.po = s.reduced ? (s.pOpen ? 1 : 0) : Math.max(0, Math.min(1, s.po + (s.pOpen ? 1 : -1) * dt / (s.pOpen ? 0.55 : 0.42)));
      render();
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(s.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Esc: closes the project only (decision: scoped, not the prototype's global reach)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && s.pOpen) closeProject(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- dots canvas (Room:104-118), verbatim
  function drawDots(dt: number, dotc: { rgb: string; base: number; boost: number }) {
    const cv = dotsRef.current; if (!cv) return;
    const g = cv.getContext('2d'); if (!g) return;
    g.clearRect(0, 0, ROOM_W, ROOM_H);
    s.mxs += (s.mx - s.mxs) * Math.min(1, dt * 10); s.mys += (s.my - s.mys) * Math.min(1, dt * 10);
    const S = 30, off = (((-740 * s.c * 0.55) % S) + S) % S; // the points drift with the wall, a little slower (they're on the wall, behind the work)
    const band = s.view === 'index' && s.c < 0.5 ? 1 : 0;
    s.bk += (band - s.bk) * Math.min(1, dt * 6);
    for (let y = off - S; y < ROOM_H + S; y += S) for (let x = 15; x < ROOM_W; x += S) {
      const dx = x - s.mxs, dy = y - s.mys, d = Math.sqrt(dx * dx + dy * dy);
      const w = Math.max(0, 1 - d / 200), e = w * w * (3 - 2 * w);
      let a = (dotc.base + dotc.boost * e) * (1 - 0.75 * (s.po || 0)); // while you read a project, the wall's points rest
      if (x < 1040 && y < 262) a *= 1 - s.bk; // under the Index's frozen header there's no wall to see
      const push = (5 * e) / Math.max(d, 1);
      g.fillStyle = `rgba(${dotc.rgb},${a.toFixed(3)})`;
      g.beginPath(); g.arc(x + dx * push, y + dy * push, 1 + 0.6 * e, 0, 6.283); g.fill();
    }
  }

  // ---- camera-driven properties (Room:122-195), verbatim formulas
  function render() {
    const cl = (x: number) => Math.max(0, Math.min(1, x));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const c = s.c, cc = cl(c);
    const poE = s.po * s.po * (3 - 2 * s.po);

    const wallEl = wallWrapRef.current, shelfEl = shelfWrapRef.current, pjEl = projRef.current;
    if (wallEl) {
      wallEl.style.transform = `translateY(${(-0.55 * D * c).toFixed(2)}px) scale(${(1 - 0.035 * poE).toFixed(4)})`;
      wallEl.style.opacity = String(+(((1 - cl((c - 0.08) / 0.34)) * (1 - poE)).toFixed(3))); // the wall is gone by c = 0.42
      wallEl.style.maskImage = c < 0.002 ? 'none' : `linear-gradient(to bottom, #000 0, #000 38%, rgba(0,0,0,${(1 - cl(c * 5)).toFixed(3)}) 88%)`;
      (wallEl.style as unknown as Record<string, string>).webkitMaskImage = c < 0.002 ? 'none' : `linear-gradient(to bottom, #000 0, #000 38%, rgba(0,0,0,${(1 - cl(c * 5)).toFixed(3)}) 88%)`;
      wallEl.style.visibility = c > 0.999 ? 'hidden' : 'visible';
      wallEl.style.pointerEvents = c < 0.5 && !s.pOpen ? 'auto' : 'none';
      wallEl.setAttribute('aria-hidden', c < 0.5 ? 'false' : 'true');
    }
    if (shelfEl) {
      // in two beats: the wall levels out and leaves first, then the shelf rises (leaning back, settling upright)
      const st = cl((c - 0.3) / 0.7), se = st * st * (3 - 2 * st);
      shelfEl.style.transform = `translateY(${(D * (1 - se)).toFixed(2)}px) rotateX(${(18 * (1 - se) * (1 - se)).toFixed(2)}deg)`;
      shelfEl.style.visibility = se < 0.001 ? 'hidden' : 'visible';
      shelfEl.style.pointerEvents = c < 0.5 ? 'none' : 'auto';
      shelfEl.setAttribute('aria-hidden', c < 0.5 ? 'true' : 'false');
    }
    if (pjEl) {
      pjEl.style.opacity = poE.toFixed(3);
      pjEl.style.translate = `0 ${((1 - poE) * 26).toFixed(1)}px`;
      pjEl.style.visibility = s.po > 0.001 ? 'visible' : 'hidden';
      pjEl.style.pointerEvents = s.pOpen ? 'auto' : 'none';
      pjEl.setAttribute('aria-hidden', s.pOpen ? 'false' : 'true');
    }
    wall2.current?.setDim(cc);

    // nav underline: driven only by the camera; it jumps within a group
    const top = X[s.view], bottom = X[s.shelfSel];
    if (underlineRef.current) underlineRef.current.style.translate = `${(lerp(top, bottom, cc) - 14).toFixed(2)}px 0`;

    // nav lit state flips at c = 0.5 (the .3s colour ease is CSS)
    const near = c < 0.5;
    const on = 'var(--text-primary)', off = 'var(--text-label)';
    const set = (ref: React.RefObject<HTMLElement | null>, lit: boolean, cur: boolean) => {
      if (!ref.current) return;
      ref.current.style.color = lit ? on : off;
      ref.current.setAttribute('aria-current', cur ? 'page' : 'false');
    };
    set(navRefs.wall, near && s.view === 'wall', near && s.view === 'wall');
    set(navRefs.index, near && s.view === 'index', near && s.view === 'index');
    set(navRefs.about, !near && s.shelfSel === 'about', !near && s.shelfSel === 'about');
    set(navRefs.contact, !near && s.shelfSel === 'contact', !near && s.shelfSel === 'contact');
  }

  const track = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    s.mx = ((e.clientX - r.left) * ROOM_W) / r.width;
    s.my = ((e.clientY - r.top) * ROOM_H) / r.height;
    if (s.mxs < -900) { s.mxs = s.mx; s.mys = s.my; }
  };
  const untrack = () => { s.mx = -999; s.my = -999; };

  return (
    <div
      ref={rootRef}
      onMouseMove={track}
      onMouseLeave={untrack}
      style={{
        position: 'relative', width: ROOM_W, height: ROOM_H, overflow: 'hidden',
        background: 'var(--room-bg)', color: 'var(--text-primary)',
        fontFamily: "'Geist', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
        perspective: 1800, perspectiveOrigin: '50% 50%',
      }}
    >
      {/* B · a field of points on the wall that wakes up where your cursor is */}
      <canvas ref={dotsRef} width={ROOM_W} height={ROOM_H} aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: ROOM_W, height: ROOM_H, pointerEvents: 'none' }} />

      {/* the wall of work */}
      <div ref={wallWrapRef} style={{ position: 'absolute', left: 0, top: 0, width: ROOM_W, height: ROOM_H, transformOrigin: '50% 100%' }}>
        <WallIndex2
          ref={wall2}
          bare
          dim={0}
          wallColor="var(--room-bg)"
          view={initial.kind === 'index' ? 'index' : 'wall'}
          motion="swap"
          initialViewReq={initial.kind === 'index' ? { v: 'index', n: 1 } : undefined}
          escBlocked={projOpen}
          onOpen={(i) => openProject(i)}
          onFocus={(i) => { s.focus = i; }}
          onPeek={(p) => { if (s.cT !== 0) return; s.pW = p; if (p >= 1) toShelf(false); }}
          hintSize="1440px,900px"
        />
      </div>

      {/* the shelf, mounted on the same wall, just below */}
      <div ref={shelfWrapRef} style={{ position: 'absolute', left: 0, top: 0, width: ROOM_W, height: ROOM_H, transformOrigin: '50% 0', visibility: 'hidden' }}>
        {/* A · the books' shadow on the wall (light from the upper left) */}
        <span aria-hidden style={{ position: 'absolute', left: 556, top: 262, width: 470, height: 516, borderRadius: 6, background: 'var(--room-shadow-book, rgba(0,0,0,0.5))', filter: 'blur(26px)', opacity: 0, transition: 'opacity .5s ease' }} />
        <AboutVolumes
          ref={volumes}
          bare
          initialOpenReq={initial.kind === 'contact' ? { v: 'contact', n: 1 } : undefined}
          onScrollOut={(dy) => {
            if (s.cT !== 1) return;
            s.pS = Math.max(0, s.pS - dy / 700); s.pSAt = performance.now();
            if (s.pS >= 1) toWall(s.view);
          }}
          onOpen={(o) => { s.bookOpen = !!o; s.shelfSel = o === 'contact' ? 'contact' : 'about'; }}
          hintSize="1440px,900px"
        />
      </div>

      {/* a project: it comes forward as the wall steps back; Back returns you to the same spot on the wall */}
      <div ref={projRef} aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0, visibility: 'hidden' }}>
        <ProjectSpread
          ref={spread}
          bare
          open={projOpen}
          initialProject={startI >= 0 ? startI : undefined}
          initialOpenReq={startI >= 0 ? { v: String(startI), n: 1 } : undefined}
          onBack={() => closeProject()}
          hintSize="1440px,900px"
        />
      </div>

      {/* one nav for the whole room; its line travels with you */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 84, background: 'var(--nav-glass)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}>
        <button className="v3rn" onClick={() => toWall('wall')} style={{ '--c': 'var(--text-primary)', position: 'absolute', left: 44, top: 20, width: 'auto', fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' } as React.CSSProperties}>Aedwon</button>
        <button ref={navRefs.wall} className="v3rn" onClick={() => toWall('wall')} style={{ '--c': 'var(--text-label)', position: 'absolute', left: 1016, top: 20 } as React.CSSProperties}>Wall</button>
        <button ref={navRefs.index} className="v3rn" onClick={() => toWall('index')} style={{ '--c': 'var(--text-label)', position: 'absolute', left: 1088, top: 20 } as React.CSSProperties}>Index</button>
        <span aria-hidden style={{ position: 'absolute', left: 1172, top: 34, width: 1, height: 16, background: 'var(--line-divider)' }} />
        <button ref={navRefs.about} className="v3rn" onClick={() => toShelf(false)} style={{ '--c': 'var(--text-label)', position: 'absolute', left: 1184, top: 20 } as React.CSSProperties}>About</button>
        <button ref={navRefs.contact} className="v3rn" onClick={() => toShelf(true)} style={{ '--c': 'var(--text-label)', position: 'absolute', left: 1256, top: 20 } as React.CSSProperties}>Contact</button>
        <span ref={underlineRef} aria-hidden style={{ position: 'absolute', left: 0, top: 58, width: 28, height: 1.5, background: 'var(--text-primary)', translate: `${X.wall - 14}px 0` }} />
        <ThemeLink theme={theme} />
      </div>
    </div>
  );
}

function ThemeLink({ theme }: { theme: Theme }) {
  const { toggle } = useTheme();
  return (
    <button
      className="v3rn"
      onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); }}
      aria-label={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
      style={{ '--c': 'var(--text-label)', position: 'absolute', left: 1384, top: 20, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={theme === 'light'
          ? 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z'
          : 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4'} />
      </svg>
    </button>
  );
}

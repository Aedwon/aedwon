'use client';

// Moments: the first-load screen and the 404 (spec/moments.md). One component with
// prop `which`. All animation constants are ported verbatim from Moments.dc.html;
// the loading bar tracks real document load with the spec's relative offsets (§1.2
// production notes) and plays once.

import { useEffect, useRef } from 'react';
import UI from '@/content/site/ui.json';
import Link from 'next/link';
import { useTheme, type Theme } from '@/lib/design-v3/theme';


// Points colours (tokens.md §6 role map). Dark is the source formula; light swaps
// rgb + base/boost (0.11 / 0.30) with the same grid, radius, push and wave. Canvas
// fills are explicit rgb strings from the spec.
const DOT = {
  dark: { rgb: '237,237,237', base: 0.12, boost: 0.3 },
  light: { rgb: '17,17,20', base: 0.17, boost: 0.27 },
} as const;

type Dotc = { rgb: string; base: number; boost: number };

const cl = (x: number) => Math.max(0, Math.min(1, x));
const out = (x: number) => 1 - Math.pow(1 - cl(x), 3); // clamped ease-out cubic (Moments:99)

// Hover and focus for the buttons and links (Moments.dc.html:14-17), tokenised.
const CSS = `
.v3mo a:focus-visible{outline:2px solid var(--text-primary);outline-offset:3px}
.v3mo .mb{transition:background-color .2s ease,border-color .2s ease,color .2s ease}
.v3mo .mb:hover{border-color:var(--line-hover);background-color:var(--surface-hover)}
.v3mo .mb.pri:hover{background-color:var(--fill-inverse-hover)}
`;

export interface MomentsProps {
  which: 'loading' | '404';
  theme?: 'dark' | 'light';
  w?: number; // stage size, default the 1440x900 desktop frame; the phone passes 390 x its height
  h?: number;
}

export default function Moments({ which, theme: themeProp, w: W = 1440, h: H = 900 }: MomentsProps) {
  const CX = W / 2, CY = H / 2, phone = W < 700;
  const { theme: ctxTheme } = useTheme();
  const theme: Theme = themeProp ?? ctxTheme;

  const dotsRef = useRef<HTMLCanvasElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const swingRef = useRef<HTMLDivElement>(null);

  // Continuous values live in refs (Moments:69). p is load progress 0→1; tDone is
  // the moment progress hits 1, and the exit/points/nav are offset from it.
  const s = useRef({
    t0: -1, p: 0, tDone: -1, loaded: false,
    mx: -999, my: -999, mxs: -999, mys: -999,
    last: 0, raf: 0,
  }).current;

  // The window load event lifts the progress cap to 1 (spec §1.2 production notes).
  useEffect(() => {
    if (which !== 'loading') return;
    const onLoad = () => { s.loaded = true; };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One rAF loop drives the canvas and the DOM values (Moments:73-75).
  useEffect(() => {
    const is404 = which === '404';
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dotc: Dotc = theme === 'light' ? DOT.light : DOT.dark;
    if (s.t0 < 0) s.t0 = performance.now();

    // Reduced motion: every transition jumps to its end state and the points are a
    // plain static grid, drawn once (owner decision, spec §3).
    if (reduced) {
      const g = dotsRef.current?.getContext('2d');
      if (g) {
        g.clearRect(0, 0, W, H);
        for (let y = 15; y < H; y += 30) for (let x = 15; x < W; x += 30) {
          g.fillStyle = `rgba(${dotc.rgb},${dotc.base})`;
          g.beginPath(); g.arc(x, y, 1, 0, 6.283); g.fill();
        }
      }
      if (stackRef.current) { stackRef.current.style.opacity = '0'; stackRef.current.style.scale = '0.96'; }
      if (barRef.current) barRef.current.style.scale = '1 1';
      if (navRef.current) navRef.current.style.opacity = '1';
      if (swingRef.current) swingRef.current.style.rotate = '-7deg';
      return;
    }

    s.last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000); s.last = now;
      const t = (performance.now() - s.t0) / 1000;

      // Ring radius (Moments:86): on the 404 the whole field is on (R = 9999); on the
      // load screen the ring expands from the centre, starting at t_done + 0.2 (board: 1.6).
      let R = 9999;
      if (!is404) {
        // Progress chases a cap set by document.readyState; the load event (or
        // readyState 'complete') lifts the cap to 1, so it never stalls just short.
        // Once it is effectively done it snaps to 1 and t_done is fixed.
        const cap = s.loaded || document.readyState === 'complete' ? 1 : document.readyState === 'interactive' ? 0.75 : 0.4;
        if (s.p < 1) {
          s.p += (cap - s.p) * Math.min(1, dt * 4);
          if (cap >= 1 && s.p >= 0.98) s.p = 1;
          if (s.p >= 1 && s.tDone < 0) s.tDone = t;
        }
        const tDone = s.tDone < 0 ? Infinity : s.tDone;
        R = Math.max(0, t - (tDone + 0.2)) * 900;
      }

      // Points canvas (Moments:87-96), verbatim formulas.
      const g = dotsRef.current?.getContext('2d');
      if (g) {
        g.clearRect(0, 0, W, H);
        s.mxs += (s.mx - s.mxs) * Math.min(1, dt * 10); s.mys += (s.my - s.mys) * Math.min(1, dt * 10);
        for (let y = 15; y < H; y += 30) for (let x = 15; x < W; x += 30) {
          const r = Math.hypot(x - CX, y - CY), on = Math.max(0, Math.min(1, (R - r) / 160));
          if (on <= 0) continue;
          const dx = x - s.mxs, dy = y - s.mys, d = Math.sqrt(dx * dx + dy * dy), w = Math.max(0, 1 - d / 200), e = w * w * (3 - 2 * w);
          const wave = is404 ? 0 : Math.max(0, 1 - Math.abs(R - r - 40) / 90) * 0.35;
          const a = (dotc.base + dotc.boost * e + wave) * on;
          const push = (5 * e) / Math.max(d, 1);
          g.fillStyle = `rgba(${dotc.rgb},${a.toFixed(3)})`;
          g.beginPath(); g.arc(x + dx * push, y + dy * push, 1 + 0.6 * e, 0, 6.283); g.fill();
        }
      }

      // Load-screen channels (Moments:106), offsets relative to t_done.
      if (!is404) {
        const tDone = s.tDone < 0 ? Infinity : s.tDone;
        const gone = out((t - tDone - 0.1) / 0.5); // exit begins at t_done + 0.1 (board: 1.5)
        if (stackRef.current) {
          stackRef.current.style.opacity = (out(t / 0.4) * (1 - gone)).toFixed(3);
          stackRef.current.style.scale = (1 - 0.04 * gone).toFixed(4);
        }
        if (barRef.current) barRef.current.style.scale = `${out(s.p).toFixed(3)} 1`;
        if (navRef.current) navRef.current.style.opacity = out((t - tDone - 0.6) / 0.6).toFixed(3); // board: 2.0–2.6
      }

      // The 404 frame sways from its nail (Moments:107).
      if (is404 && swingRef.current) {
        swingRef.current.style.rotate = `${(-7 + Math.sin((now / 1000) * 1.15) * 1.3).toFixed(3)}deg`;
      }

      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(s.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, which]);

  // Pointer tracking into the 1440×900 design space (Moments:108-109).
  const track = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    s.mx = ((e.clientX - r.left) * W) / r.width;
    s.my = ((e.clientY - r.top) * H) / r.height;
    if (s.mxs < -900) { s.mxs = s.mx; s.mys = s.my; }
  };
  const untrack = () => { s.mx = -999; s.my = -999; };

  return (
    <div
      className="v3mo"
      onMouseMove={track}
      onMouseLeave={untrack}
      style={{
        position: 'relative', width: W, height: H, overflow: 'hidden',
        background: 'var(--room-bg)', color: 'var(--text-primary)',
        fontFamily: "'Geist', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{CSS}</style>

      <canvas ref={dotsRef} width={W} height={H} aria-hidden style={{ position: 'absolute', inset: 0, width: W, height: H, pointerEvents: 'none' }} />

      {which === 'loading' ? (
        <>
          {/* centre stack: the name and a hairline that fills with real load progress */}
          <div ref={stackRef} style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: 0, scale: '1' }}>
            <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.035em' }}>{UI.loader.name}</span>
            <span aria-hidden style={{ position: 'relative', width: 120, height: 1, background: 'var(--line-track)', overflow: 'hidden' }}>
              <span ref={barRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'var(--fill-inverse)', transformOrigin: '0 50%', scale: '0 1' }} />
            </span>
          </div>

          {/* a stand-in nav that fades in where the Room nav takes over (spec §1.1) */}
          <div ref={navRef} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: phone ? 56 : 84, padding: phone ? '0 22px' : '0 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>{UI.nav.brand}</span>
            {!phone && <div style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 14, color: 'var(--text-label)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{UI.nav.wall}</span>
              <span>{UI.nav.index}</span>
              <span aria-hidden style={{ width: 1, height: 16, background: 'var(--line-divider)' }} />
              <span>{UI.nav.about}</span>
              <span>{UI.nav.contact}</span>
            </div>}
          </div>

          {/* the note slot exists but has no copy in the source (moments.md §1.1) */}
          <span aria-hidden style={{ position: 'absolute', left: 56, bottom: 40, fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'var(--text-tertiary)' }} />
        </>
      ) : (
        <>
          {/* nav, static and fully visible; no link is current (spec §2.1) */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 84, padding: '0 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', textDecoration: 'none' }}>{UI.nav.brand}</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 14, color: 'var(--text-label)' }}>
              <span>{UI.nav.wall}</span>
              <span>{UI.nav.index}</span>
              <span aria-hidden style={{ width: 1, height: 16, background: 'var(--line-divider)' }} />
              <span>{UI.nav.about}</span>
              <span>{UI.nav.contact}</span>
            </div>
          </div>

          {/* the picture: the clean outline of where the frame hung straight, the frame
             swinging from its nail, and the nail (spec §2.2) */}
          <div aria-hidden style={{ position: 'absolute', left: 540, top: 196, width: 360, height: 230, boxSizing: 'border-box', borderRadius: 4, border: '1.5px dashed var(--line-underline)', background: 'var(--surface-frame)' }} />
          <div ref={swingRef} aria-hidden style={{ position: 'absolute', left: 540, top: 146, width: 360, height: 280, transformOrigin: '180px 4px', rotate: '-7deg' }}>
            <svg width={360} height={56} viewBox="0 0 360 56" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
              <path d="M180 4 L22 52 M180 4 L338 52" stroke="var(--text-label)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', left: 0, top: 50, width: 360, height: 230, boxSizing: 'border-box', padding: 14, borderRadius: 3, background: 'var(--surface-404-frame)', border: '1px solid var(--line-frame)', boxShadow: 'var(--shadow-frame)' }}>
              <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', border: '1px solid var(--line-underline)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 46, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-404)' }}>404</span>
              </div>
            </div>
          </div>
          <span aria-hidden style={{ position: 'absolute', left: 716, top: 146, width: 8, height: 8, borderRadius: 99, background: 'var(--text-hover-soft)', boxShadow: 'var(--shadow-nail)' }} />

          <div style={{ position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.05 }}>{UI.notFound.title}</h1>
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <Link className="mb pri" href="/" style={{ height: 46, padding: '0 20px', display: 'flex', alignItems: 'center', borderRadius: 12, background: 'var(--fill-inverse)', color: 'var(--text-on-inverse)', fontSize: 14.5, fontWeight: 600, textDecoration: 'none' }}>{UI.notFound.home}</Link>
              <Link className="mb" href="/index" style={{ height: 46, padding: '0 20px', display: 'flex', alignItems: 'center', borderRadius: 12, border: '1px solid var(--line-hairline-2)', color: 'var(--text-primary)', fontSize: 14.5, textDecoration: 'none' }}>{UI.notFound.index}</Link>
            </div>
            {/* the same recovery points agents get in the markdown 404 */}
            <nav aria-label="For agents" style={{ display: 'flex', gap: 16, marginTop: 6, fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>
              <a href="/llms.txt" style={{ color: 'var(--text-label)', textDecoration: 'none' }}>llms.txt</a>
              <a href="/sitemap.xml" style={{ color: 'var(--text-label)', textDecoration: 'none' }}>sitemap.xml</a>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

// Named alias for the 404 route.
export function Moments404(props: Omit<MomentsProps, 'which'>) {
  return <Moments {...props} which="404" />;
}

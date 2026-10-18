'use client';

// Site shell: theme provider, desktop/phone switch (breakpoint 1024px, decided with
// the owner), the uniform-scale letterbox frame, and the first-load moment.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Room from './Room';
import Mobile from './Mobile';
import dynamic from 'next/dynamic';
import Moments from './Moments';
import { currentTheme, setTheme, THEME_KEY, ThemeContext, type Theme } from '@/lib/design-v3/theme';

export const BREAKPOINT = 1024; // decision: desktop frame at >=1024px, phone below

// ---- external stores: the data-theme attribute and the breakpoint media query
const themeListeners = new Set<() => void>();
function subscribeTheme(cb: () => void) {
  themeListeners.add(cb);
  const mo = new MutationObserver(() => themeListeners.forEach((l) => l()));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-v3'] });
  return () => { themeListeners.delete(cb); mo.disconnect(); };
}
export function useThemeAttr(): Theme {
  return useSyncExternalStore(subscribeTheme, currentTheme, () => 'dark');
}

const bpListeners = new Set<() => void>();
function subscribeBreakpoint(cb: () => void) {
  const mq = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
  bpListeners.add(cb);
  mq.addEventListener('change', cb);
  return () => { bpListeners.delete(cb); mq.removeEventListener('change', cb); };
}
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeBreakpoint,
    () => window.matchMedia(`(min-width: ${BREAKPOINT}px)`).matches,
    () => true, // SSR assumes the desktop frame (corrected after mount)
  );
}

const PHONE_MIN_H = 740, PHONE_MAX_H = 960;

// Uniform scale + letterbox (decision). The 1440x900 (or 390x844) stage keeps its
// layout at every window size; the room colour fills the letterbox.
export function Stage({
  w, h, fit = 'box', children,
}: { w: number; h: number; fit?: 'box' | 'width'; children: React.ReactNode | ((h: number) => React.ReactNode) }) {
  const [box, setBox] = useState<{ s: number; x: number; y: number; h: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (fit === 'width') {
        // Phone: fill the width, and let the stage take whatever height the screen has (never under MIN_H design px).
        const s = Math.min(vw / w, vh / PHONE_MIN_H);
        const sh = Math.min(PHONE_MAX_H, vh / s);
        setBox({ s, x: (vw - w * s) / 2, y: Math.max(0, (vh - sh * s) / 2), h: sh });
        return;
      }
      const s = Math.min(vw / w, vh / h);
      setBox({ s, x: (vw - w * s) / 2, y: (vh - h * s) / 2, h });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [w, h, fit]);
  const sh = box ? box.h : h;
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--room-bg)' }}>
      <div
        style={{
          // first client render must match the server: no window reads in render
          position: 'absolute', left: box ? box.x : 0, top: box ? box.y : 0,
          width: w, height: sh,
          transform: box ? `scale(${box.s})` : undefined, transformOrigin: '0 0',
          visibility: box ? 'visible' : 'hidden',
        }}
      >
        {typeof children === 'function' ? children(sh) : children}
      </div>
    </div>
  );
}

const LoadedCtx = createContext(true);

// The local studio (edit projects on the page): development only, so it never reaches the production bundle.
const Studio = process.env.NODE_ENV === 'development' ? dynamic(() => import('./studio/StudioUI'), { ssr: false }) : null;

export default function Site({ initialPath }: { initialPath: string }) {
  const theme = useThemeAttr();
  const toggle = useCallback(() => {
    setTheme(currentTheme() === 'light' ? 'dark' : 'light');
  }, []);

  // With no saved choice, follow the device's light/dark setting live (a tap on the toggle saves a choice and stops this).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const follow = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch { /* private mode */ }
      if (saved === 'dark' || saved === 'light') return;
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', follow);
    return () => mq.removeEventListener('change', follow);
  }, []);

  const themeCtx = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  const desktop = useIsDesktop();

  // first visit: the loading moment; later visits go straight in (spec/moments.md)
  const [firstLoad, setFirstLoad] = useState<boolean | null>(null);
  useEffect(() => {
    const decide = () => {
      let seen = false;
      try { seen = sessionStorage.getItem('aedwon-loaded') === '1'; } catch { /* private mode */ }
      if (seen) { setFirstLoad(false); return; }
      setFirstLoad(true);
      const done = () => {
        try { sessionStorage.setItem('aedwon-loaded', '1'); } catch { /* ignore */ }
        window.setTimeout(() => setFirstLoad(false), 900);
      };
      if (document.readyState === 'complete') done();
      else window.addEventListener('load', done, { once: true });
    };
    const t = window.setTimeout(decide, 0);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <ThemeContext.Provider value={themeCtx}>
      <LoadedCtx.Provider value={firstLoad !== false}>
        <Stage w={desktop ? 1440 : 390} h={desktop ? 900 : 844} fit={desktop ? 'box' : 'width'}>
          {(sh) => (
            <>
              {desktop ? <Room initialPath={initialPath} /> : <Mobile initialPath={initialPath} height={sh} />}
              {firstLoad ? (
                <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
                  <Moments which="loading" w={desktop ? 1440 : 390} h={desktop ? 900 : sh} />
                </div>
              ) : null}
            </>
          )}
        </Stage>
        {Studio ? <Studio /> : null}
      </LoadedCtx.Provider>
    </ThemeContext.Provider>
  );
}

export function useLoaded() { return useContext(LoadedCtx); }

// The 404 moment (root not-found.tsx); same frame as the rest of the site.
export function NotFound() {
  const desktop = useIsDesktop();
  return (
    <Stage w={desktop ? 1440 : 390} h={desktop ? 900 : 844}>
      <Moments which="404" />
    </Stage>
  );
}

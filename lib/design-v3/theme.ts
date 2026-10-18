'use client';

import { createContext, useContext } from 'react';

// Theme behaviour per spec/tokens.md §13 (production rules):
// 1. First visit follows prefers-color-scheme.
// 2. An explicit click of the sun/moon is remembered and wins on later visits.
// Coexistence: legacy v2 pages store 'default'/'discord'/'neobrutalist' plus
// 'aedwon-mode' under the same key. v3 stores 'dark'/'light' and wins once the
// visitor toggles; until then legacy visitors get their resolved look on v3
// pages through the data-v3 attribute.

export const THEME_KEY = 'aedwon-theme';

export type Theme = 'dark' | 'light';

// Inline script for <head>: sets data-theme before first paint.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var m=localStorage.getItem('aedwon-mode');var sysDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);return;}if(t==='neobrutalist'||t==='discord'||t==='default'){var mode=(m==='system'||m==='light'||m==='dark')?m:'dark';var eff=t==='discord'?'dark':t==='neobrutalist'?'light':(mode==='system'?(sysDark?'dark':'light'):mode);document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-mode',eff);document.documentElement.setAttribute('data-v3',eff);return;}document.documentElement.setAttribute('data-theme',sysDark?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return document.documentElement.getAttribute('data-v3') === 'light' ? 'light' : 'dark';
}

export function setTheme(t: Theme) {
  try {
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.removeAttribute('data-v3');
  } catch {
    document.documentElement.setAttribute('data-theme', t);
  }
}

// React context for the current theme
export interface ThemeCtx { theme: Theme; toggle: (e?: { clientX: number; clientY: number }) => void }
export const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} });

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}

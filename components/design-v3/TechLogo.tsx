'use client';

import type { CSSProperties } from 'react';
import { DARK_MARKS, LOGO } from '@/lib/design-v3/data/icons';
import { TECH_RESOURCES } from '@/lib/design-v3/data/tech-logos';
import { useTheme, type Theme } from '@/lib/design-v3/theme';

const aliases: Record<string, string> = { 'Tailwind CSS': 'Tailwind', TailwindCSS: 'Tailwind', GoogleSheets: 'Google Sheets', Sheets: 'Google Sheets', 'discord.py': 'Discord', 'Vercel Analytics': 'Vercel', purchases_flutter: 'RevenueCat' };
const keyOf = (name: string) => aliases[name] ?? name;
// Legacy Drift geometry is a SQLite proxy, not a dedicated Drift mark.
const excludedMarks = new Set(['Drift']);
export const hasTechLogo = (name: string) => !excludedMarks.has(keyOf(name)) && Boolean(TECH_RESOURCES[keyOf(name)] || LOGO[keyOf(name)]);

const css = `
.v3-tech-logo{position:relative;display:inline-block;flex:none;vertical-align:middle;outline-offset:4px}
.v3-tech-logo> .v3-tech-layer{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:opacity .25s ease}
.v3-tech-logo>.v3-tech-muted{opacity:1}
.v3-tech-logo>.v3-tech-brand{opacity:0}
.v3-tech-logo:hover>.v3-tech-brand,.v3-tech-logo:focus>.v3-tech-brand,.v3-tech-logo[data-appearance="brand"]>.v3-tech-brand{opacity:1}
.v3-tech-logo:hover>.v3-tech-muted,.v3-tech-logo:focus>.v3-tech-muted,.v3-tech-logo[data-appearance="brand"]>.v3-tech-muted{opacity:0}
@media(hover:none),(pointer:coarse){.v3-tech-logo>.v3-tech-brand{opacity:1}.v3-tech-logo>.v3-tech-muted{opacity:0}}
@media(prefers-reduced-motion:reduce){.v3-tech-logo>.v3-tech-layer{transition:none}}
`;

/** Full upstream artwork stays intact. Catalog monochrome marks use their approved color through a mask. */
export function TechLogo({ name, size = 18, appearance = 'muted', theme: override, paper = false }: {
  name: string; size?: number; appearance?: 'muted' | 'brand'; theme?: Theme; paper?: boolean;
}) {
  const { theme: siteTheme } = useTheme();
  const theme = paper ? 'light' : override ?? siteTheme;
  const key = keyOf(name);
  const resource = TECH_RESOURCES[key];
  const inline = LOGO[key];
  if (!hasTechLogo(name)) return null;
  const src = resource && ((theme === 'light' ? resource.lightSrc : resource.darkSrc) ?? resource.src);
  const color = resource
    ? ((theme === 'light' ? resource.lightColor : resource.darkColor) ?? resource.color)
    : DARK_MARKS.has(key) ? (theme === 'light' ? '#111114' : '#EDEDED') : inline.c;
  const width = resource ? size * resource.ratio : Number(inline.w ?? 18) * size / 18;
  const height = resource ? size : Number(inline.h ?? 18) * size / 18;
  const mask = src ? { mask: `url("${src}") center / contain no-repeat`, WebkitMask: `url("${src}") center / contain no-repeat` } : {};
  const title = name === 'discord.py' ? 'discord.py (Discord platform mark)'
    : name === 'Vercel Analytics' ? 'Vercel Analytics (Vercel platform mark)'
    : name === 'purchases_flutter' ? 'purchases_flutter (RevenueCat SDK)' : name;
  return <span className="v3-tech-logo" role="img" aria-label={name} title={title} tabIndex={appearance === 'muted' ? 0 : undefined} data-appearance={appearance}
    style={{ width, height }}>
    <style>{css}</style>
    {resource ? <>
      <span aria-hidden="true" className="v3-tech-layer v3-tech-muted" style={{ ...mask, background: theme === 'light' ? '#6A6A72' : '#8A8A93' } as CSSProperties} />
      {color ? <span aria-hidden="true" className="v3-tech-layer v3-tech-brand" style={{ ...mask, background: color } as CSSProperties} />
        // SVG images preserve gradients, multiple paths, strokes and the approved wordmark variant.
        // eslint-disable-next-line @next/next/no-img-element
        : <img aria-hidden="true" alt="" className="v3-tech-layer v3-tech-brand" src={src} draggable={false} />}
    </> : <>
      <svg aria-hidden="true" className="v3-tech-layer v3-tech-muted" viewBox={inline.vb ?? '0 0 24 24'} fill={theme === 'light' ? '#6A6A72' : '#8A8A93'}><path d={inline.d} /></svg>
      <svg aria-hidden="true" className="v3-tech-layer v3-tech-brand" viewBox={inline.vb ?? '0 0 24 24'} fill={color}><path d={inline.d} /></svg>
    </>}
  </span>;
}

// The figures a written post can show between paragraphs, by the name used in a section's `charts` list
// ({ which, after }: `after` is how many of the section's paragraphs come before the figure).
import type { ReactNode } from 'react';
import RndChart from './RndChart';
import DostChart from './DostChart';
import StatusChart from './StatusChart';

export const CHARTS: Record<string, () => ReactNode> = {
  'ps-status': StatusChart,
  'ps-rnd': RndChart,
  'ps-dost': DostChart,
};

export const isChart = (which: string) => Object.prototype.hasOwnProperty.call(CHARTS, which);

export function Chart({ which }: { which: string }) {
  const C = isChart(which) ? CHARTS[which] : null;
  return C ? <C /> : null;
}

export interface ChartSpec { which: string; after: number }
export interface ParaChunk { start: number; items: string[]; chart?: string }

// Cuts a section's paragraphs where its figures go. Each chunk is some paragraphs and then at most one figure.
// `start` is the index of the chunk's first paragraph in the section, so edits still hit the right paragraph.
// The last chunk has no figure, and is there even when empty, so the studio's "+ paragraph" has a home.
export function chunkParas(p: string[], charts?: ChartSpec[]): ParaChunk[] {
  const list = (charts || [])
    .filter((c) => c && isChart(c.which))
    .map((c, order) => ({ which: c.which, after: Math.min(Math.max(Math.trunc(Number(c.after)) || 0, 0), p.length), order }))
    .sort((a, b) => a.after - b.after || a.order - b.order);
  const out: ParaChunk[] = [];
  let at = 0;
  for (const c of list) {
    out.push({ start: at, items: p.slice(at, c.after), chart: c.which });
    at = c.after;
  }
  out.push({ start: at, items: p.slice(at) });
  return out;
}

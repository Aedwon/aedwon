// The About books. Each book's own text lives in content/site/about-0N.json (edited from the local studio);
// this file only adds what is derived: the contents page, the folios, the closing page and the spread count
// (the pass from v3-design/reference/generators/volumes_js.txt).

import a1 from '@/content/site/about-01.json';
import a2 from '@/content/site/about-02.json';
import a3 from '@/content/site/about-03.json';
import a4 from '@/content/site/about-04.json';
import a5 from '@/content/site/about-05.json';
import a6 from '@/content/site/about-06.json';

export interface BookPageDef {
  t?: string;
  kind?: string;
  eyebrow?: string;
  title?: string;
  titleSize?: string;
  body?: string;
  meta?: string;
  tech?: { name: string; detail: string; logo?: string }[];
  slot?: string;
  caption?: string;
  big?: string;
  bigSize?: string;
  org?: string;
  roles?: { title: string; dates: string; desc: string }[];
  toc?: { title: string; page: number; n: string }[];
  vol?: string;
  running?: string;
  folio?: string;
  nextVol?: string;
  nextTitle?: string;
  // which file and which entry this page came from, so the studio can edit it in place
  src?: { id: string; i: number };
  [k: string]: unknown;
}

export interface Volume {
  id: string;
  n: string;
  title: string;
  tone: string;
  ink: string;
  D: number;
  pages: BookPageDef[];
  all: BookPageDef[];
  spreads: number;
  contact?: boolean;
}

interface RawVolume { id: string; n: string; title: string; tone: string; ink: string; D: number; contact?: boolean; nextVolumeLink?: boolean; pages: BookPageDef[] }

const RAW = [a1, a2, a3, a4, a5, a6] as unknown as RawVolume[];

// page 0 of every volume (inside the cover) is its contents; the last spread closes the volume
export const VOLUMES: Volume[] = RAW.map((v, vi) => {
  const body: BookPageDef[] = v.pages.map((p, i) => ({ ...p, vol: v.n, running: v.title, src: { id: v.id, i } }));
  let all: BookPageDef[];
  if (v.contact) all = body;
  else {
    const toc = body.map((p, i) => ({ title: (p.t || p.title || p.org || p.big) as string, page: i + 1, n: String(i + 1).padStart(2, '0') }));
    all = [{ kind: 'contents', vol: v.n, title: v.title, toc, src: { id: v.id, i: -1 } }, ...body];
  }
  if (all.length % 2) { const nx = v.nextVolumeLink === false ? undefined : RAW[vi + 1]; all.push({ kind: 'end', vol: v.n, nextVol: nx ? nx.n : '', nextTitle: nx ? nx.title : '' }); }
  all.forEach((p, i) => { if (i > 0 && p.kind !== 'end') p.folio = String(i).padStart(2, '0'); });
  return { id: v.id, n: v.n, title: v.title, tone: v.tone, ink: v.ink, D: v.D, contact: v.contact, pages: v.pages, all, spreads: all.length / 2 };
});

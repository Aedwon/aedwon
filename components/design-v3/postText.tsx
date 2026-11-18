// Bulleted lists in written posts. A text section with `list: { from: n }` draws its paragraphs from index n on as
// one list. In an item, "**lead phrase**" is shown in the primary text color. Citations still become raised links.
// This module is separate so Room.tsx and Mobile.tsx can keep a single export.
import type { CSSProperties, ReactNode } from 'react';
import { CitedText } from './citations';
import { chunkParas, type ChartSpec } from './charts';

export interface SectionChunk { start: number; items: string[]; chart?: string; list?: boolean }

// Like chunkParas, and also marks the paragraphs from `list.from` on as list items. A chunk that straddles `from`
// is split in two, and its figure (if any) stays after the list part. Without a usable `list` this is chunkParas.
export function sectionChunks(p: string[], charts?: ChartSpec[], list?: { from: number }): SectionChunk[] {
  const chunks: SectionChunk[] = chunkParas(p, charts);
  const n = Number(list?.from);
  if (!list || !Number.isInteger(n) || n < 0) return chunks;
  const out: SectionChunk[] = [];
  chunks.forEach((c) => {
    const end = c.start + c.items.length;
    if (end <= n) { out.push(c); return; }
    if (c.start >= n) { out.push({ ...c, list: true }); return; }
    out.push({ start: c.start, items: c.items.slice(0, n - c.start) });
    out.push({ ...c, start: n, items: c.items.slice(n - c.start), list: true });
  });
  return out;
}

export type LeadPiece = { text: string; lead?: boolean };

// Cuts an item into the lead phrases marked with ** and the text between them. An unpaired ** stays as text.
export function splitLead(text: string): LeadPiece[] {
  const out: LeadPiece[] = [];
  let at = 0;
  for (const m of text.matchAll(/\*\*([^*]+?)\*\*/g)) {
    if (m.index! > at) out.push({ text: text.slice(at, m.index) });
    out.push({ text: m[1], lead: true });
    at = m.index! + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

export function ListItemText({ text }: { text: string }) {
  return (
    <>
      {splitLead(text).map((x, i) => x.lead
        ? <span key={i} style={{ color: 'var(--text-primary)' }}><CitedText text={x.text} /></span>
        : <CitedText key={i} text={x.text} />)}
    </>
  );
}

// The list in read mode. `style` is the renderer's body paragraph style (size, line height, color).
export function PostList({ items, style }: { items: string[]; style: CSSProperties }): ReactNode {
  return (
    <ul style={{ ...style, margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((t, i) => (
        <li key={i} style={{ position: 'relative', paddingLeft: 22 }}>
          <span aria-hidden style={{ position: 'absolute', left: 4, top: '.78em', width: 6, height: 6, borderRadius: '50%', background: 'var(--text-label)' }} />
          <ListItemText text={t} />
        </li>
      ))}
    </ul>
  );
}

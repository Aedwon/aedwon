// Citations in written posts: "[14]" in a paragraph becomes a small raised link to the matching source line, and
// the last section ("Sources and further reading") draws each "[n] entry" line as a row with that id.
// This module is separate so Room.tsx and Mobile.tsx can keep a single export.
import { Fragment, type CSSProperties, type MouseEvent, type ReactNode } from 'react';

export const CITE_CSS = `
.v3cite{font-size:.72em;line-height:0;margin-left:1px}
.v3cite a{font-family:'Geist Mono',monospace;color:var(--text-label);text-decoration:none}
.v3cite a:hover{color:var(--text-primary);text-decoration:underline}
.v3src-a{color:inherit;text-decoration:underline;text-underline-offset:4px;text-decoration-color:var(--line-underline);transition:text-decoration-color .2s ease,color .2s ease}
.v3src-a:hover{color:var(--text-primary);text-decoration-color:var(--text-primary)}
`;

const HIGHLIGHT = 'color-mix(in srgb, var(--text-primary) 7%, transparent)';

export type CitePiece = string | { n: number };

// Cuts a paragraph into plain text and citation marks. Only digits between square brackets count.
export function splitCitations(text: string): CitePiece[] {
  const out: CitePiece[] = [];
  let at = 0;
  for (const m of text.matchAll(/\[(\d{1,4})\]/g)) {
    if (m.index! > at) out.push(text.slice(at, m.index));
    out.push({ n: Number(m[1]) });
    at = m.index! + m[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

// "[3] The entry." -> { n: 3, text: "The entry." }. Anything else is not a source line.
export function parseSource(text: string): { n: number; text: string } | null {
  const m = /^\[(\d{1,4})\]\s+([\s\S]*)$/.exec(text);
  return m ? { n: Number(m[1]), text: m[2] } : null;
}

export const isSourcesSection = (h?: string) => /^sources\b/i.test((h || '').trim());

export const sourceId = (n: number) => `source-${n}`;

// Cuts a source entry into plain text and web addresses (trailing punctuation stays outside the link).
export function splitUrls(text: string): { text: string; url?: string }[] {
  const out: { text: string; url?: string }[] = [];
  let at = 0;
  for (const m of text.matchAll(/https?:\/\/[^\s<>"]+/g)) {
    const url = m[0].replace(/[.,;:!?)\]]+$/, '');
    if (m.index! > at) out.push({ text: text.slice(at, m.index) });
    out.push({ text: url, url });
    at = m.index! + url.length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

// The nearest ancestor that scrolls (the desktop right page, the phone's project scroller).
function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}

// Scrolls the source line into view inside whatever scrolls, then lights it for a moment.
// A click handler instead of the address hash, so the app's own routing is not disturbed.
export function goToSource(e: MouseEvent<HTMLElement>, n: number) {
  e.preventDefault();
  const from = e.currentTarget;
  const sc = scrollParent(from);
  const root: ParentNode = sc || document;
  const row = root.querySelector<HTMLElement>(`[id="${sourceId(n)}"]`);
  if (!row) return;
  const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sc) {
    const sr = sc.getBoundingClientRect(), rr = row.getBoundingClientRect();
    // the phone and desktop layouts are drawn scaled: screen pixels from getBoundingClientRect, scroll pixels unscaled
    const k = sc.clientHeight > 0 && sr.height > 0 ? sr.height / sc.clientHeight : 1;
    const top = sc.scrollTop + (rr.top - sr.top) / k - Math.min(140, sc.clientHeight * 0.3);
    sc.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
  } else row.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  if (typeof row.animate === 'function') {
    row.animate([{ background: HIGHLIGHT }, { background: HIGHLIGHT, offset: 0.35 }, { background: 'transparent' }], { duration: 1600, easing: 'ease-out' });
  }
}

// Body text with its citation marks as raised links.
export function CitedText({ text }: { text: string }) {
  const parts = splitCitations(text);
  if (parts.length === 1 && typeof parts[0] === 'string') return <>{text}</>;
  return (
    <>
      {parts.map((x, i) => typeof x === 'string'
        ? x
        // the word joiner keeps a mark on the same line as the text before it
        : <Fragment key={i}>{'\u2060'}<sup className="v3cite"><a href={`#${sourceId(x.n)}`} aria-label={`Source ${x.n}`} onClick={(e) => goToSource(e, x.n)}>[{x.n}]</a></sup></Fragment>)}
    </>
  );
}

// A source entry with its web addresses made clickable.
export function LinkedText({ text }: { text: string }) {
  return (
    <>
      {splitUrls(text).map((x, i) => x.url
        ? <a key={i} className="v3src-a" href={x.url} target="_blank" rel="noopener noreferrer">{x.text}</a>
        : x.text)}
    </>
  );
}

// One paragraph in read mode. In the sources section a "[n] entry" line becomes a row; elsewhere it is a paragraph with citations.
export function renderPara(opts: { sources: boolean; style: CSSProperties; numWidth: number; gap: number }) {
  return function Para(text: string, key: number): ReactNode {
    const src = opts.sources ? parseSource(text) : null;
    if (!src) return <p key={key} style={opts.style}><CitedText text={text} /></p>;
    return (
      <p
        key={key}
        id={sourceId(src.n)}
        style={{ ...opts.style, display: 'flex', gap: opts.gap, padding: '6px 8px', borderRadius: 6 }}
      >
        <span style={{ fontFamily: "'Geist Mono', monospace", color: 'var(--text-label)', flex: 'none', width: opts.numWidth }}>[{src.n}]</span>
        <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}><LinkedText text={src.text} /></span>
      </p>
    );
  };
}


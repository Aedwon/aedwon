'use client';

// Editing controls for the local studio. Each one renders exactly the plain content when the studio is
// off (always, in production), and becomes editable in place when the studio is on (localhost dev only).
import { createElement, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Img } from '@/lib/design-v3/data/projects';
import { useStudio } from './store';

type Tag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div' | 'figcaption';

const quiet = (p: Promise<unknown>) => { p.catch(() => {}); };

// The studio's calls, but only while editing is on and the dev-only studio has loaded.
function useApi() {
  const s = useStudio();
  return s.editing ? s.api : null;
}

// A line of text. Click to edit; Enter or clicking away saves; Escape puts it back.
// With optional, clearing the text removes the field from the file instead of saving an empty string.
// placeholder shows (in edit mode only) while the text is empty.
export function Ed({ id, path, value, as = 'span', style, className, optional, placeholder }: {
  id: string; path: string; value: string; as?: Tag; style?: CSSProperties; className?: string;
  optional?: boolean; placeholder?: string;
}) {
  const api = useApi();
  if (!api) return createElement(as, { style, className }, value);
  return createElement(as, {
    key: value, // a saved edit arrives as a new value and remounts the text cleanly
    style,
    className: 'studio-ed' + (className ? ' ' + className : ''),
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: true,
    'data-ph': placeholder,
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const next = e.currentTarget.innerText.replace(/ /g, ' ').replace(/\s*\n+\s*/g, ' ').trim();
      if (next !== value) quiet(api.saveOp(id, optional && next === '' ? { op: 'unset', path } : { op: 'set', path, value: next }));
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
      else if (e.key === 'Escape') { e.stopPropagation(); e.currentTarget.textContent = value; e.currentTarget.blur(); }
    },
  }, value);
}

// The paragraphs of a section or item, with remove and add controls while editing.
export function Paras({ id, path, items, pStyle }: { id: string; path: string; items: string[]; pStyle: CSSProperties }) {
  const api = useApi();
  if (!api) return <>{items.map((t, q) => <p key={q} style={pStyle}>{t}</p>)}</>;
  return (
    <>
      {items.map((t, q) => (
        <div key={q} className="studio-row">
          <Ed id={id} path={`${path}.${q}`} value={t} as="p" style={pStyle} />
          <button type="button" className="studio-x" title="Remove this paragraph" onClick={() => quiet(api.saveOp(id, { op: 'remove', path, index: q }))}>×</button>
        </div>
      ))}
      <button type="button" className="studio-add" onClick={() => quiet(api.saveOp(id, { op: 'insert', path, index: items.length, value: '[Body copy.]' }))}>+ paragraph</button>
    </>
  );
}

// A picture slot. Shows the picture when there is one, otherwise the placeholder you pass as children.
// While editing: drop a file on it or choose one, edit its alt text, replace or remove it.
export function ImageSlot({ id, slot, img, fit = 'contain', frame, imgStyle, children }: {
  id: string; slot: string; img?: Img | null; fit?: 'contain' | 'cover';
  frame?: CSSProperties; imgStyle?: CSSProperties; children?: ReactNode;
}) {
  const api = useApi();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const picture: ReactNode = img?.src
    // eslint-disable-next-line @next/next/no-img-element -- already re-encoded to WebP by the studio upload
    ? <img src={img.src} alt={img.alt || ''} width={img.w} height={img.h} draggable={false} style={{ display: 'block', width: '100%', height: '100%', objectFit: fit, ...imgStyle }} />
    : children;
  if (!api) return frame ? <div style={frame}>{picture}</div> : <>{picture}</>;
  const send = (file?: File | null) => { if (file) quiet(api.uploadImage(id, slot, file)); };
  return (
    <div
      className="studio-slot"
      data-over={over || undefined}
      style={{ position: 'relative', ...frame }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); send(e.dataTransfer.files[0]); }}
    >
      {picture}
      <div className="studio-slot-ui" data-empty={!img?.src || undefined}>
        <button type="button" className="studio-btn" onClick={() => input.current?.click()}>{img?.src ? 'Replace image' : 'Drop an image here, or choose one'}</button>
        {img?.src && (
          <>
            <input
              key={img.src + (img.alt || '')}
              className="studio-alt"
              placeholder="Alt text: what is in this picture?"
              defaultValue={img.alt || ''}
              onBlur={(e) => { if (e.target.value !== (img.alt || '')) quiet(api.saveOp(id, { op: 'set', path: slot + '.alt', value: e.target.value })); }}
            />
            <button
              type="button"
              className="studio-btn studio-btn-quiet"
              onClick={() => quiet(api.saveOp(id, slot.startsWith('shots.') ? { op: 'set', path: slot, value: null } : { op: 'unset', path: slot }))}
            >Remove</button>
          </>
        )}
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" hidden onChange={(e) => { send(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </div>
  );
}

// Move, remove, or give a figure to one section.
export function SectionTools({ id, index, count, hasFigure }: { id: string; index: number; count: number; hasFigure: boolean }) {
  const api = useApi();
  if (!api) return null;
  return (
    <div className="studio-tools">
      <button type="button" className="studio-btn studio-btn-quiet" disabled={index === 0} title="Move up" onClick={() => quiet(api.saveOp(id, { op: 'move', path: 'sections', from: index, to: index - 1 }))}>↑</button>
      <button type="button" className="studio-btn studio-btn-quiet" disabled={index === count - 1} title="Move down" onClick={() => quiet(api.saveOp(id, { op: 'move', path: 'sections', from: index, to: index + 1 }))}>↓</button>
      {!hasFigure && <button type="button" className="studio-btn studio-btn-quiet" onClick={() => quiet(api.saveOp(id, { op: 'set', path: `sections.${index}.fig`, value: '[Figure]' }))}>+ image</button>}
      <button
        type="button"
        className="studio-btn studio-btn-quiet"
        onClick={() => { if (window.confirm('Remove this section?')) quiet(api.saveOp(id, { op: 'remove', path: 'sections', index })); }}
      >Remove section</button>
    </div>
  );
}

// The links under the description. Plain anchors normally (only the first `limit` show on the page);
// while editing, every link is editable, with its address behind the arrow, a remove button, and "+ link".
export function Links({ id, links, limit }: { id: string; links: { label: string; href: string }[]; limit: number }) {
  const api = useApi();
  const [open, setOpen] = useState<number | null>(null);
  if (!api) {
    return <>{links.slice(0, limit).map((l) => <a key={l.href + l.label} className="v3ps-ul" href={l.href} style={{ fontSize: 15, color: 'var(--text-primary)' }}>{l.label} ↗</a>)}</>;
  }
  return (
    <>
      {links.map((l, i) => (
        <span key={i} className="studio-link" style={{ opacity: i >= limit ? 0.5 : 1 }} title={i >= limit ? `Only the first ${limit} links show on the page` : undefined}>
          <Ed id={id} path={`links.${i}.label`} value={l.label} style={{ fontSize: 15, color: 'var(--text-primary)' }} />
          <button type="button" className="studio-btn studio-btn-quiet" style={{ height: 24, padding: '0 8px' }} title="Edit the address" onClick={() => setOpen(open === i ? null : i)}>↗</button>
          <button type="button" className="studio-btn studio-btn-quiet" style={{ height: 24, padding: '0 8px' }} title="Remove this link" onClick={() => quiet(api.saveOp(id, { op: 'remove', path: 'links', index: i }))}>×</button>
          {open === i && (
            <input
              autoFocus
              className="studio-alt"
              style={{ position: 'absolute', left: 0, top: '100%', marginTop: 6, width: 280, zIndex: 5 }}
              defaultValue={l.href}
              placeholder="https://"
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); else if (e.key === 'Escape') { e.stopPropagation(); setOpen(null); } }}
              onBlur={(e) => { const v = e.target.value.trim(); setOpen(null); if (v !== l.href) quiet(api.saveOp(id, { op: 'set', path: `links.${i}.href`, value: v })); }}
            />
          )}
        </span>
      ))}
      <button type="button" className="studio-add" onClick={() => quiet(api.saveOp(id, { op: 'insert', path: 'links', index: links.length, value: { label: '[Link]', href: 'https://' } }))}>+ link</button>
    </>
  );
}

export function AddSection({ id, count }: { id: string; count: number }) {
  const api = useApi();
  if (!api) return null;
  return (
    <div style={{ paddingTop: 40 }}>
      <button type="button" className="studio-add" onClick={() => quiet(api.saveOp(id, { op: 'insert', path: 'sections', index: count, value: { kind: 'text', h: '[Heading]', p: ['[Body copy.]'] } }))}>+ Add a section</button>
    </div>
  );
}

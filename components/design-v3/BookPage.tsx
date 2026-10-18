'use client';

// BookPage: one side of one leaf, 420x600 of paper (BookPage.dc.html).
// Standalone-mountable (the phone build renders it at other sizes); paper colours
// are theme-independent (spec/about-books.md §6), so they read the --paper-* tokens.
//
// Props contract (BookPage.dc.html:143, exported below):
// - page      one entry of a Volume's `all` list; a blank text page when omitted.
// - side      which side of the gutter this page lies on ('left' | 'right');
//             sets the gutter gradient and the running head/folio alignment.
// - onGo      contents rows call it with the target page index.
// - onNextVol the end-page "Vol. NN · Title →" button.
// - clock     Manila time, shown on the contact page.
// - form      shared Vol. 06 form state ({ name, mail, msg, title, ready }); the
//             parent owns it, so every page of the volume renders the same values.
// - onField   typing in any form field ('name' | 'mail' | 'msg' | 'title').
// - onShelve  the "Close and shelve" button.

import { memo, useEffect, useRef, useState } from 'react';
import type { BookPageDef } from '@/lib/design-v3/data/volumes';
import { Ed, LogoSlot } from './studio/Editable';
import { useStudio } from './studio/store';

export interface BookPageProps {
  page?: BookPageDef | null;
  side?: 'left' | 'right';
  onGo?: (page: number) => void;
  onNextVol?: () => void;
  clock?: string;
  form?: { name?: string; mail?: string; msg?: string; title?: string; ready?: boolean };
  onField?: (key: 'name' | 'mail' | 'msg' | 'title', value: string) => void;
  onShelve?: () => void;
}

// The prototype keeps these rules in the page helmet (BP:14-30); paper colours
// read the --paper-* tokens, which are identical in both themes.
const BP_CSS = `
.bp-link{transition:background-color .2s ease}
.bp-link:hover{background-color:var(--paper-hover)}
.bp-link:hover .bp-ar{translate:3px 0}
.bp-ar{transition:translate .3s cubic-bezier(.34,1.56,.64,1)}
.bp-btn{transition:scale .3s cubic-bezier(.34,1.56,.64,1)}
.bp-btn:active{scale:.96}
.bp-link:focus-visible,.bp-btn:focus-visible{outline:2px solid var(--paper-ink);outline-offset:2px}
.bp-fld{display:block;width:100%;box-sizing:border-box;border:none;border-bottom:1.5px solid var(--paper-field);background:transparent;color:var(--paper-ink);font-family:'Geist',system-ui,sans-serif;font-size:18px;line-height:1.5;padding:3px 0 6px;outline:none;transition:border-color .2s ease}
.bp-fld:focus{border-bottom-color:var(--paper-ink)}
.bp-fld::placeholder{color:var(--paper-placeholder)}
textarea.bp-fld:focus{background-color:var(--paper-focus)}
.bp-ttl{display:block;width:100%;box-sizing:border-box;border:none;border-bottom:1.5px dashed var(--paper-field-title);background:transparent;color:var(--paper-ink);font-family:'Geist',system-ui,sans-serif;font-size:40px;font-weight:800;letter-spacing:-0.045em;line-height:1.1;padding:0 0 6px;outline:none}
.bp-ttl:focus{border-bottom-color:var(--paper-ink);border-bottom-style:solid}
.bp-ttl::placeholder{color:var(--paper-placeholder-title)}
.bp-shelve{transition:background-color .15s ease,opacity .25s ease}
.bp-shelve:active{background:#2a2a30}
.bp-shelve:focus-visible{outline:2px solid var(--paper-ink);outline-offset:3px}
`;

interface ListItem { a: string; b: string }

const MONO = "'Geist Mono', monospace";

function BookPage({ page, side = 'right', onGo, onNextVol, clock, form, onField, onShelve }: BookPageProps) {
  const p = page || { kind: 'text', eyebrow: 'CHAPTER', title: 'Page', body: '', titleSize: '44px' };
  const sd = side === 'left' ? 'left' : 'right';
  const [copied, setCopied] = useState(false);
  const ct = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (ct.current) clearTimeout(ct.current); }, []);

  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  // While the studio is editing, text on the page is editable in place (and clicking it must not turn the page).
  const { editing } = useStudio();
  const sid = p.src?.id, si = p.src?.i ?? -1;
  const E = (path: string, value: string, style: React.CSSProperties) => {
    if (!sid || si < 0) return <span style={style}>{value}</span>;
    const node = <Ed id={sid} path={`pages.${si}.${path}`} value={value} style={style} />;
    return editing ? <span style={{ display: 'contents' }} onClick={stop}>{node}</span> : node;
  };
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { if (navigator.clipboard) navigator.clipboard.writeText('aerol.balayon@gmail.com'); } catch { /* swallowed */ }
    setCopied(true);
    if (ct.current) clearTimeout(ct.current);
    ct.current = setTimeout(() => setCopied(false), 1800);
  };

  const f = form || {};
  const ok = !!f.ready;
  const is = (k: string) => p.kind === k;
  const toc = p.toc || [];
  const items = p.items as ListItem[] | undefined;
  const orgs = p.orgs as string[] | undefined;
  const cols = (p.cols as number | undefined) ?? 1;
  const quickTitle = p.quickTitle as string | undefined;
  // the three spaces in the source collapse to one (no white-space:pre); reproduce what renders
  const footText = p.folio
    ? (sd === 'left' ? `${p.folio}   ${p.running || ''}` : `${p.running || ''}   ${p.folio}`)
    : '';

  return (
    <div
      style={{
        position: 'relative', width: 420, height: 600, boxSizing: 'border-box',
        padding: '44px 40px 52px', background: 'var(--paper-bg)', color: 'var(--paper-ink)',
        fontFamily: "'Geist', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
        display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
      }}
    >
      <style>{BP_CSS}</style>

      {/* contents: the inside of the cover */}
      {is('contents') && (
        <>
          {sid ? (editing ? <span style={{ display: 'contents' }} onClick={stop}><Ed id={sid} path="title" value={p.title || ''} style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1 }} /></span> : <Ed id={sid} path="title" value={p.title || ''} style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1 }} />) : <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1 }}>{p.title}</span>}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {toc.map((t) => (
              <button
                key={t.n}
                className="bp-link"
                onClick={(e) => { e.stopPropagation(); onGo?.(t.page); }}
                style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '11px 6px', margin: '0 -6px', border: 'none', borderTop: '1px solid var(--paper-rule)', background: 'none', color: 'var(--paper-ink)', fontFamily: 'inherit', fontSize: 15.5, textAlign: 'left', cursor: 'pointer' }}
              >
                <span style={{ flex: 1 }}>{t.title}</span>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: 'var(--paper-meta)' }}>{t.n}</span>
                <span className="bp-ar" aria-hidden style={{ color: 'var(--paper-meta)' }}>→</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* a big statement */}
      {is('big') && (
        <>
          {E('big', p.big || '', { marginTop: 'auto', fontSize: p.bigSize, fontWeight: 800, letterSpacing: '-0.065em', lineHeight: 0.88 })}
          {E('body', p.body || '', { fontSize: 18, lineHeight: 1.5, color: 'var(--paper-body)' })}
        </>
      )}

      {/* a heading and a paragraph */}
      {is('text') && (
        <>
          {E('title', p.title || '', { fontSize: p.titleSize, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.02 })}
          {E('body', p.body || '', { fontSize: 17, lineHeight: 1.6, color: 'var(--paper-body)' })}
          {(p.meta || editing) && E('meta', p.meta || '', { marginTop: 'auto', fontFamily: MONO, fontSize: 11.5, color: 'var(--paper-meta)' })}
        </>
      )}

      {/* a photo */}
      {is('photo') && (
        <>
          <div style={{ flex: 1, border: '1.5px dashed var(--paper-slot)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 12, color: 'var(--paper-meta)', rotate: '-1deg' }}>{E('slot', p.slot || '', {})}</div>
          {E('caption', p.caption || '', { fontFamily: MONO, fontSize: 11.5, color: 'var(--paper-meta)' })}
        </>
      )}

      {/* a list */}
      {is('list') && (
        <>
          {E('title', p.title || '', { fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 })}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
            {items?.map((it, i) => (
              <span key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: '1px solid var(--paper-rule)', fontSize: 16 }}>
                {E(`items.${i}.a`, it.a, {})}
                {E(`items.${i}.b`, it.b, { fontFamily: MONO, fontSize: 11.5, color: 'var(--paper-meta)', textAlign: 'right' })}
              </span>
            ))}
          </div>
        </>
      )}

      {/* one company */}
      {is('org') && (
        <>
          {sid && si >= 0
            ? <LogoSlot id={sid} path={`pages.${si}.logo`} value={p.logo as string | undefined} label={p.org || ''} box={{ height: 64, border: '1.5px dashed var(--paper-slot)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} />
            : <div style={{ height: 64, border: '1.5px dashed var(--paper-slot)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 11, color: 'var(--paper-meta)' }}>{`[${p.org || ''} logo]`}</div>}
          {E('org', p.org || '', { fontSize: 32, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.02 })}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(p.roles || []).map((r, i) => (
              <span key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 12, borderTop: '1px solid var(--paper-rule)' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  {E(`roles.${i}.title`, r.title, { fontSize: 15.5, fontWeight: 700 })}
                  {E(`roles.${i}.dates`, r.dates, { fontFamily: MONO, fontSize: 11, color: 'var(--paper-meta)', whiteSpace: 'nowrap' })}
                </span>
                {E(`roles.${i}.desc`, r.desc, { fontSize: 14, lineHeight: 1.5, color: 'var(--paper-body)' })}
              </span>
            ))}
          </div>
        </>
      )}

      {/* a guild category */}
      {is('guild') && (
        <>
          {E('title', p.title || '', { fontSize: 34, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.02 })}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: 'minmax(0, 1fr)', gap: 10, marginTop: 6 }}>
            {orgs?.map((o, i) => (
              <span key={i} style={{ border: '1.5px dashed var(--paper-slot)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center', padding: 10 }}>
                {sid && si >= 0
                  ? <LogoSlot id={sid} path={`pages.${si}.logos.${i}`} value={(p.logos as string[] | undefined)?.[i]} label={o} box={{ height: 44, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }} />
                  : <span style={{ fontFamily: MONO, fontSize: 10.5, color: 'var(--paper-meta)' }}>[logo]</span>}
                {E(`orgs.${i}`, o, { fontSize: 14, fontWeight: 600 })}
                {E(`blurbs.${i}`, (p.blurbs as string[] | undefined)?.[i] || '[what you built for them]', { fontFamily: MONO, fontSize: 10.5, color: 'var(--paper-meta)' })}
              </span>
            ))}
          </div>
        </>
      )}

      {/* something I'm reading or watching */}
      {is('read') && (
        <>
          <div style={{ alignSelf: 'center', width: 200, aspectRatio: '2 / 3', border: '1.5px dashed var(--paper-slot)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 11, color: 'var(--paper-meta)', rotate: '1.5deg' }}>[cover]</div>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {E('rtitle', (p.rtitle as string | undefined) || '[title]', { fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' })}
            {E('t', p.t || '', { fontSize: 15, color: 'var(--paper-body)' })}
          </span>
          {E('why', (p.why as string | undefined) || '[Why you like it, in a sentence.]', { fontSize: 15, lineHeight: 1.55, color: 'var(--paper-body)' })}
        </>
      )}

      {/* inside the cover of the next volume: you title it */}
      {is('titleit') && (
        <div onClick={stop} style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: '-0.075em', lineHeight: 0.86 }}>{p.vol}</span>
          <input
            className="bp-ttl"
            value={f.title || ''}
            onChange={(e) => onField?.('title', e.target.value)}
            placeholder="Title this volume"
            aria-label="Title this volume"
            maxLength={28}
          />
          <span style={{ fontSize: 15, color: 'var(--paper-meta)' }}>{`by ${(f.name || '').trim() || 'you'} and Aerol`}</span>
        </div>
      )}

      {/* chapter 1: what you'd like to build */}
      {is('write') && (
        <div onClick={stop} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0 }}>
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>Chapter 1</span>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13, color: 'var(--paper-meta)' }}>Your name</span>
            <input className="bp-fld" value={f.name || ''} onChange={(e) => onField?.('name', e.target.value)} placeholder="Maria Santos" autoComplete="name" />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13, color: 'var(--paper-meta)' }}>Where I can reach you</span>
            <input className="bp-fld" type="email" value={f.mail || ''} onChange={(e) => onField?.('mail', e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minHeight: 0 }}>
            <span style={{ fontSize: 13, color: 'var(--paper-meta)' }}>What we&apos;d build</span>
            <textarea
              className="bp-fld"
              value={f.msg || ''}
              onChange={(e) => onField?.('msg', e.target.value)}
              placeholder="A booking app for our clinic, in time for…"
              style={{ flex: 1, resize: 'none', borderBottom: 'none', lineHeight: '30px', paddingTop: 0, backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 29px, var(--paper-rule) 29px, var(--paper-rule) 30px)' }}
            />
          </label>
          <button
            className="bp-shelve"
            type="button"
            onClick={(e) => { e.stopPropagation(); onShelve?.(); }}
            aria-disabled={!ok}
            style={{ height: 52, flex: 'none', border: 'none', borderRadius: 10, background: 'var(--paper-ink)', color: 'var(--paper-bg)', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: ok ? 'pointer' : 'default', opacity: ok ? 1 : 0.35 }}
          >
            Close and shelve
          </button>
        </div>
      )}

      {/* contact */}
      {is('contact') && (
        <>
          {!!quickTitle && <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>{quickTitle}</span>}
          <span style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--paper-body)' }}>For software projects or community infrastructure. I&apos;m in Manila; it&apos;s {clock} here.</span>
          <button
            className="bp-btn"
            onClick={copy}
            style={{ marginTop: 'auto', position: 'relative', overflow: 'hidden', height: 56, border: 'none', background: 'var(--paper-ink)', color: 'var(--paper-bg)', fontFamily: MONO, fontSize: 14, cursor: 'pointer' }}
          >
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', translate: copied ? '0 -100%' : '0 0%', transition: 'translate .45s cubic-bezier(.34,1.56,.64,1)' }}>aerol.balayon@gmail.com</span>
            <span aria-live="polite" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', translate: copied ? '0 0%' : '0 100%', transition: 'translate .45s cubic-bezier(.34,1.56,.64,1)' }}>Copied ✓</span>
          </button>
          <a className="bp-btn" href="https://github.com/" onClick={stop} style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--paper-ink)', color: 'var(--paper-ink)', fontSize: 15, textDecoration: 'none' }}>GitHub</a>
          <a className="bp-btn" href="https://linkedin.com/" onClick={stop} style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--paper-ink)', color: 'var(--paper-ink)', fontSize: 15, textDecoration: 'none' }}>LinkedIn</a>
        </>
      )}

      {/* end of a volume */}
      {is('end') && (
        <>
          <span style={{ margin: 'auto 0', textAlign: 'center', fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', color: 'var(--paper-meta)' }}>— END OF VOLUME {p.vol} —</span>
          {!!p.nextTitle && (
            <button
              className="bp-link"
              onClick={(e) => { e.stopPropagation(); onNextVol?.(); }}
              style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1.5px solid var(--paper-ink)', background: 'none', color: 'var(--paper-ink)', fontFamily: 'inherit', fontSize: 15, cursor: 'pointer' }}
            >
              Vol. {p.nextVol} · {p.nextTitle}{' '}<span className="bp-ar" aria-hidden>→</span>
            </button>
          )}
        </>
      )}

      {/* running head and folio */}
      <span style={{ position: 'absolute', left: 40, right: 40, bottom: 20, display: 'flex', justifyContent: sd === 'left' ? 'flex-start' : 'flex-end', gap: 12, fontFamily: MONO, fontSize: 10.5, color: 'var(--paper-placeholder)' }}>{footText}</span>
      {/* the gutter: paper curves into the spine */}
      <span
        aria-hidden
        style={{
          position: 'absolute', top: 0, bottom: 0, width: 46,
          ...(sd === 'left' ? { right: 0 } : { left: 0 }),
          background: `linear-gradient(${sd === 'left' ? 'to left' : 'to right'}, rgba(0,0,0,.16), rgba(0,0,0,0))`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default memo(BookPage);

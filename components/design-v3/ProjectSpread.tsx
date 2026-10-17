'use client';

// ProjectSpread (spread layout): the left page stays put while the right page
// swaps. Ported verbatim from ProjectSpread.dc.html (code wins over spec);
// animation constants verbatim: 420ms easeOutCubic swap, per-element delays.
// Differences from the prototype: data comes from lib/design-v3/data/projects,
// hero mocks reuse MediaBlock, section jump targets use element refs instead of
// DOM ids, arrow keys fire only while `open` (Escape is handled by Room), and
// the swap runs as a self-cancelling rAF tween writing to refs (no setState
// per frame).

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { ProjectSpreadHandle, Req } from './contracts';
import { PROJECTS } from '@/lib/design-v3/data/projects';
import { LOGO, ICON, TYPEICON, FI, FICON, DARK_MARKS } from '@/lib/design-v3/data/icons';
import MediaBlock, { type MediaKind } from './MediaBlock';
import { AddSection, Ed, ImageSlot, Paras, SectionTools } from './studio/Editable';
import { useStudio } from './studio/store';
import SystemViz from './SystemViz';
import { useTheme } from '@/lib/design-v3/theme';

export interface ProjectSpreadProps {
  bare?: boolean;
  open?: boolean;
  initialProject?: number;
  initialOpenReq?: Req;
  onBack?: () => void;
  hintSize?: string;
}

// projects.ts carries extra fields the generator emits (post/repo/stackText/
// topic/mins/date) and shape-erased facts/points; cast once, here.
type FullProject = Omit<import('@/lib/design-v3/data/projects').Project, 'facts' | 'points'> & {
  facts: { k: string; v: string }[];
  points: { h: string; p: string }[];
  stackText?: string;
  post?: boolean;
  repo?: string;
  topic?: string;
  mins?: string;
  date?: string;
};

interface Sec {
  kind: string;
  h?: string;
  p?: string[];
  fig?: string;
  img?: import('@/lib/design-v3/data/projects').Img;
  items?: { h: string; which: string; vh: string; p: string[] }[];
  cols?: { h: string; items: string[] }[];
  link?: { label: string; href: string };
}

const mono = { fontFamily: "'Geist Mono', monospace" } as const;

// Logos whose brand mark is the dark page colour; they read as the fg colour in
// dark and flip to near-black in light (same pattern as WallIndex2.tsx:575).

const CSS = `
.v3ps-ps{scrollbar-width:none}.v3ps-ps::-webkit-scrollbar{width:0}
.v3ps-ul{text-decoration:underline;text-underline-offset:4px;text-decoration-color:var(--line-underline);transition:text-decoration-color .2s ease}
.v3ps-ul:hover{text-decoration-color:var(--text-primary)}
.v3ps-lg path{fill:var(--text-label);transition:fill .3s ease}
.v3ps-lg:hover path,.v3ps-stackrow:hover .v3ps-lg path{fill:var(--b)}
.v3ps-tb{border:none;background:none;padding:0;font-family:inherit;cursor:pointer;color:var(--text-secondary);transition:color .2s ease}
.v3ps-tb:hover{color:var(--text-primary)}
.v3ps-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.v3ps-tip{position:relative}
.v3ps-tip::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 10px);translate:-50% 4px;padding:5px 9px;border-radius:6px;background:var(--fill-inverse);color:var(--text-on-inverse);font:500 12px 'Geist',system-ui,sans-serif;letter-spacing:0;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s ease,translate .25s cubic-bezier(.22,1,.36,1);z-index:9}
.v3ps-tip:hover::after{opacity:1;translate:-50% 0}
.v3ps-rail .v3ps-railpanel{opacity:0;pointer-events:none;translate:12px -50%;transition:opacity .2s ease,translate .35s cubic-bezier(.22,1,.36,1)}
.v3ps-rail .v3ps-ticks{transition:opacity .2s ease}
.v3ps-rail:hover .v3ps-railpanel,.v3ps-rail:focus-within .v3ps-railpanel{opacity:1;pointer-events:auto;translate:0 -50%}
.v3ps-rail:hover .v3ps-ticks,.v3ps-rail:focus-within .v3ps-ticks{opacity:0}
.v3ps-rl{display:block;width:100%;border:none;background:none;padding:9px 14px;border-radius:8px;font-family:inherit;font-size:14px;text-align:left;cursor:pointer;color:var(--c);white-space:nowrap;transition:background-color .15s ease,color .15s ease}
.v3ps-rl:hover{background:var(--surface-control-hover);color:var(--text-primary)}
.v3ps a:focus-visible,.v3ps button:focus-visible{outline:2px solid var(--text-primary);outline-offset:3px}
`;

// Hero fit (ProjectSpread renderVals.fit): scale inside the 864x520 stage.
const HH: Record<string, number> = { phone: 370, tv: 330, web: 325, discord: 325, term: 300, data: 300, repo: 260, paper: 300 };

const out = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

const ProjectSpread = forwardRef<ProjectSpreadHandle, ProjectSpreadProps>(function ProjectSpread(
  { bare, open, initialProject, initialOpenReq, onBack },
  ref,
) {
  const { theme } = useTheme();
  const dark = theme !== 'light';

  const [pi, setPi] = useState(() => initialProject ?? 0);
  const [cur, setCur] = useState(0);

  // DOM refs
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const secEls = useRef<(HTMLElement | null)[]>([]);

  // animation + request bookkeeping
  const dirRef = useRef(1);
  const swapAtRef = useRef(-1e9);
  const lastReqRef = useRef(-1);
  const openRef = useRef(!!open);
  const reducedRef = useRef(false);
  const piRef = useRef(pi);
  const goRef = useRef<(d: number) => void>(() => {});
  const rafRef = useRef(0);

  piRef.current = pi;
  openRef.current = !!open;

  const p = PROJECTS[pi] as unknown as FullProject;
  const secs = (p.sections || []) as unknown as Sec[];
  const { editing } = useStudio();

  const applySwapAt = (now: number) => {
    const f = reducedRef.current ? 1 : out((now - swapAtRef.current) / 420);
    const so = f.toFixed(3);
    if (leftRef.current) leftRef.current.style.opacity = so;
    const r = rightRef.current;
    if (r) {
      r.style.opacity = so;
      r.style.translate = '0 ' + ((1 - f) * 14).toFixed(1) + 'px';
    }
  };

  const kickTween = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      applySwapAt(now);
      rafRef.current = reducedRef.current || now - swapAtRef.current >= 420 ? 0 : requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const go = (d: number) => {
    const n = PROJECTS.length;
    dirRef.current = d;
    swapAtRef.current = performance.now();
    setCur(0);
    setPi((v) => {
      const j = (v + d + n) % n;
      piRef.current = j;
      return j;
    });
    const sc = scrollerRef.current;
    if (sc) sc.scrollTop = 0;
    applySwapAt(swapAtRef.current); // paint the cut at f = 0, before React commits
    kickTween();
  };
  goRef.current = go;

  // openReq: dedup by nonce; same index is a no-op (no fade, no scroll reset)
  const consumeReq = (req: Req) => {
    if (lastReqRef.current === req.n) return;
    lastReqRef.current = req.n;
    const j = parseInt(req.v, 10);
    if (Number.isNaN(j) || j === piRef.current) return;
    dirRef.current = 1;
    swapAtRef.current = performance.now();
    setCur(0);
    setPi(j);
    piRef.current = j;
    const sc = scrollerRef.current;
    if (sc) sc.scrollTop = 0;
    applySwapAt(swapAtRef.current);
    kickTween();
  };

  const onScroll = () => {
    const sc = scrollerRef.current;
    if (!sc) return;
    let c = 0;
    secEls.current.forEach((el, i) => {
      if (el && el.offsetTop - 260 <= sc.scrollTop) c = i;
    });
    if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) c = secs.length - 1;
    setCur((prev) => (prev === c ? prev : c));
  };

  const jump = (i: number) => {
    const el = secEls.current[i];
    const sc = scrollerRef.current;
    if (el && sc) sc.scrollTo({ top: el.offsetTop - 100, behavior: reducedRef.current ? 'auto' : 'smooth' });
  };

  useLayoutEffect(() => {
    reducedRef.current = !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (initialOpenReq) consumeReq(initialOpenReq);
    else applySwapAt(performance.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrow keys fire only while open; Escape is handled by Room.
  useEffect(() => {
    if (!openRef.current) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'ArrowRight') goRef.current(1);
      else if (e.key === 'ArrowLeft') goRef.current(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useImperativeHandle(ref, () => ({
    openReq: (req: Req) => consumeReq(req),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  // ---- derived values for the current project ----
  const nx = PROJECTS[(pi + 1) % PROJECTS.length] as unknown as FullProject;
  const pv = PROJECTS[(pi - 1 + PROJECTS.length) % PROJECTS.length] as unknown as FullProject;
  const backText = p.post ? '\u2190 Back to the index' : '\u2190 Back to the wall';
  const kindIcon = ICON[TYPEICON[p.type]] || '';
  const heroScale = Math.min((864 - 140) / 520, (520 - 80) / (HH[p.media] || 300), 1.6).toFixed(4);
  const logos = (p.stack || []).map((s) => LOGO[s]).filter(Boolean)
    .map((g) => ({ ...g, w2: (Number(g.w) * 22 / 18).toFixed(1), h2: (Number(g.h) * 22 / 18).toFixed(1) }));
  const stackText = p.stackText || (p.stack || []).filter((s) => !LOGO[s]).join(' \u00b7 ');
  const stackAria = 'Built with ' + ((p.stack || []).join(', ') || p.stackText || '');
  const links = (p.links || []).slice(0, 2);
  const isCase = p.depth === 'case';
  const isNote = p.depth === 'note';
  const hasToc = secs.length > 1;
  const points = p.points;

  type Detail = { label: string; v: string; icon?: string; dot?: string; ring?: string; fi?: number };
  const details: Detail[] = (() => {
    const rows: Detail[] = p.post
      ? []
      : [{ label: 'Platform', v: p.facts.find((f) => f.k === 'Platform')?.v || p.type, icon: kindIcon, fi: p.facts.findIndex((f) => f.k === 'Platform') >= 0 ? p.facts.findIndex((f) => f.k === 'Platform') : undefined }];
    p.facts.forEach((f) => {
      if (f.k === 'Platform') return;
      if (f.k === 'Status') {
        const s = (f.v || '').toLowerCase();
        const live = /live|shipped|running/.test(s);
        const wip = /pre-launch|prototype|beta|progress/.test(s);
        rows.push({
          label: 'Status', v: f.v, fi: p.facts.indexOf(f),
          dot: live ? 'var(--status-live)' : wip ? 'var(--status-wip)' : 'var(--status-none)',
          ring: live ? 'var(--status-live-ring)' : wip ? 'var(--status-wip-ring)' : 'var(--status-none-ring)',
        });
        return;
      }
      rows.push({ label: f.k, v: f.v, icon: FICON[FI[f.k] || 'target'], fi: p.facts.indexOf(f) });
    });
    return rows;
  })();

  return (
    <div
      className="v3ps"
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: bare ? 'transparent' : 'var(--room-bg)', color: 'var(--text-primary)', fontFamily: "'Geist', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased' }}
    >
      <style>{CSS}</style>

      {/* nav (Room renders the real one; hidden while bare, per the prototype) */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 84, padding: '0 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-room-78)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', zIndex: 5, visibility: bare ? 'hidden' : 'visible' }}>
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>Aedwon</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 14, color: 'var(--text-label)' }}>
          <span style={{ color: 'var(--text-primary)' }}>Wall</span><span>Index</span>
          <span style={{ width: 1, height: 16, background: 'var(--line-divider)' }} />
          <span>About</span><span>Contact</span>
        </div>
      </div>

      {/* left page: stays put. Who it is, what it is, what it's made of; then the details as glanceable icons */}
      <div ref={leftRef} style={{ position: 'absolute', left: 56, top: 108, bottom: 36, width: 392, display: 'flex', flexDirection: 'column', opacity: 1 }}>
        <button className="v3ps-tb" type="button" onClick={onBack} style={{ alignSelf: 'flex-start', fontSize: 14, height: 32, marginBottom: 22 }}>{backText}</button>
        <Ed id={p.id} path="name" value={p.name} as="h1" style={{ margin: 0, fontSize: 46, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1.02 }} />
        <Ed id={p.id} path="desc" value={p.desc} as="p" style={{ margin: '16px 0 0', fontSize: 16.5, lineHeight: 1.6, color: 'var(--text-secondary)' }} />
        {/* built with: the logos, named on hover */}
        <div aria-label={stackAria} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, marginTop: 22, minHeight: 24 }}>
          {logos.map((g) => (
            <span key={g.t} className="v3ps-tip" data-tip={g.t} style={{ display: 'flex', flex: 'none' }}>
              <svg
                className="v3ps-lg"
                width={g.w2}
                height={g.h2}
                viewBox={g.vb || '0 0 24 24'}
                role="img"
                aria-label={g.t}
                style={{ '--b': DARK_MARKS.has(g.t) ? (dark ? '#EDEDED' : '#111114') : (g.c || 'var(--text-label)') } as CSSProperties}
              >
                <path d={g.d} />
              </svg>
            </span>
          ))}
          {p.stackText
            ? <Ed id={p.id} path="stackText" value={p.stackText} style={{ ...mono, fontSize: 12.5, color: 'var(--text-label)' }} />
            : <span style={{ ...mono, fontSize: 12.5, color: 'var(--text-label)' }}>{stackText}</span>}
        </div>
        {/* the details: an icon and the fact, nothing else to read; hover an icon for what it means */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 30, paddingTop: 22, borderTop: '1px solid var(--line-hairline)' }}>
          {details.map((d, i) => (
            <div key={d.label + i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 14.5, lineHeight: 1.35, color: 'var(--text-strong)' }}>
              <span className="v3ps-tip" data-tip={d.label} style={{ display: 'flex', flex: 'none', width: 18, height: 18, color: 'var(--text-label)' }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ display: d.icon ? 'block' : 'none' }}><path d={d.icon || ''} /></svg>
                <span style={{ display: d.dot ? 'block' : 'none', margin: 5, width: 8, height: 8, borderRadius: 99, background: d.dot || 'transparent', boxShadow: d.ring ? '0 0 0 3px ' + d.ring : undefined }} />
              </span>
              <span><span className="v3ps-sr">{d.label}: </span>{d.fi !== undefined ? <Ed id={p.id} path={`facts.${d.fi}.v`} value={d.v} /> : d.v}</span>
            </div>
          ))}
        </div>
        {/* where to go: the main link, and the source as a mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 26, minHeight: 22 }}>
          {links.map((l) => (
            <a key={l.href + l.label} className="v3ps-ul" href={l.href} style={{ fontSize: 15, color: 'var(--text-primary)' }}>{l.label} ↗</a>
          ))}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
          <button className="v3ps-tb" type="button" onClick={() => go(-1)} style={{ fontSize: 14, textAlign: 'left' }}>← {pv.name}</button>
          <button className="v3ps-tb" type="button" onClick={() => go(1)} style={{ fontSize: 14, textAlign: 'right' }}>{nx.name} →</button>
        </div>
      </div>

      {/* right page: the work, and the story if there is one */}
      <div ref={scrollerRef} className="v3ps-ps" onScroll={onScroll} style={{ position: 'absolute', left: 520, right: 0, top: 0, bottom: 0, overflowY: 'auto' }}>
        <div ref={rightRef} style={{ padding: '108px 56px 120px 0', opacity: 1 }}>
          {/* hero stage */}
          <div style={{ position: 'relative', height: 520, borderRadius: 12, background: 'var(--surface-media)', overflow: 'hidden' }}>
            <ImageSlot id={p.id} slot="hero" img={p.hero} frame={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', left: '50%', top: '50%', width: 520, translate: '-50% -50%', scale: heroScale }}>
                <MediaBlock
                  kind={p.media as MediaKind}
                  name={p.name}
                  repo={p.repo}
                  desc={p.desc}
                  date={p.date}
                  mins={p.mins}
                />
              </div>
            </ImageSlot>
          </div>
          {isNote && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 16 }}>
              {[0, 1].map((n) => (
                <ImageSlot key={n} id={p.id} slot={`shots.${n}`} img={p.shots?.[n]} frame={{ height: 300, borderRadius: 12, background: 'var(--surface-media)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--text-figure)' }}>{n === 0 ? '[a detail]' : '[another detail]'}</div>
                </ImageSlot>
              ))}
            </div>
          )}
          {/* case points: the 48px wrapper is always there so the rhythm holds */}
          <div style={{ paddingTop: 48 }}>
            {isCase && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 32 }}>
                {points.map((k, i) => (
                  <div key={k.h + i} style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16, borderTop: '1px solid var(--line-divider)' }}>
                    <Ed id={p.id} path={`points.${i}.h`} value={k.h} style={{ fontSize: 17, fontWeight: 600 }} />
                    <Ed id={p.id} path={`points.${i}.p`} value={k.p} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            {secs.map((s, i) => (
              <section
                key={(s.h || '') + i}
                ref={(el) => { secEls.current[i] = el; }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 56, position: 'relative' }}
              >
                <SectionTools id={p.id} index={i} count={secs.length} hasFigure={!!(s.fig || s.img)} />
                <Ed id={p.id} path={`sections.${i}.h`} value={s.h || ''} as="h2" style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680, fontSize: 17, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                  <Paras id={p.id} path={`sections.${i}.p`} items={s.p || []} pStyle={{ margin: 0 }} />
                </div>
                {(s.fig || s.img) && (
                  <figure style={{ margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <ImageSlot id={p.id} slot={`sections.${i}.img`} img={s.img} frame={{ borderRadius: 12, background: 'var(--surface-media)', overflow: 'hidden' }} imgStyle={{ height: 'auto', maxHeight: 560 }}>
                      <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--text-figure)', textAlign: 'center', padding: '0 24px' }}>{s.fig}</div>
                    </ImageSlot>
                    {s.img
                      ? (s.img.caption || editing) && <Ed id={p.id} path={`sections.${i}.img.caption`} value={s.img.caption || ''} as="figcaption" style={{ fontSize: 13.5, color: 'var(--text-label)' }} />
                      : <figcaption style={{ fontSize: 13.5, color: 'var(--text-label)' }}>[Caption: what this shows.]</figcaption>}
                  </figure>
                )}
                {s.kind === 'systems' && (
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
                    {(s.items || []).map((it, k) => (
                      <div key={it.h + k} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '40px 0', borderTop: '1px solid var(--line-hairline)' }}>
                        <Ed id={p.id} path={`sections.${i}.items.${k}.h`} value={it.h} as="h3" style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 680, fontSize: 15.5, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                          <Paras id={p.id} path={`sections.${i}.items.${k}.p`} items={it.p || []} pStyle={{ margin: 0 }} />
                        </div>
                        {/* holder must not clip: the viz runs 3px taller than vh by design */}
                        <div style={{ height: it.vh, marginTop: 8 }}>
                          <SystemViz which={it.which} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {s.kind === 'status' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px 32px', fontSize: 15, lineHeight: 1.7, marginTop: 8 }}>
                      {(s.cols || []).map((col, k) => (
                        <div key={col.h + k} style={{ display: 'flex', flexDirection: 'column', paddingTop: 12, borderTop: '1px solid var(--line-divider)' }}>
                          <Ed id={p.id} path={`sections.${i}.cols.${k}.h`} value={col.h} style={{ fontSize: 14, color: 'var(--text-label)', paddingBottom: 6 }} />
                          {col.items.map((li, li2) => <Ed key={li2} id={p.id} path={`sections.${i}.cols.${k}.items.${li2}`} value={li} style={{ color: 'var(--text-strong)' }} />)}
                        </div>
                      ))}
                    </div>
                    <a className="v3ps-ul" href={s.link?.href || '#'} style={{ alignSelf: 'flex-start', marginTop: 8, fontSize: 16, color: 'var(--text-primary)' }}>{s.link?.label}</a>
                  </>
                )}
              </section>
            ))}
            <AddSection id={p.id} count={secs.length} />
          </div>
        </div>
      </div>

      {/* contents: hidden at the right edge as ticks, one per part (like the wall's rail). Come close and they open into names */}
      {hasToc && (
        <nav className="v3ps-rail" aria-label="On this page" style={{ position: 'absolute', right: 0, top: '50%', translate: '0 -50%', padding: '24px 22px 24px 60px', zIndex: 6 }}>
          <div className="v3ps-ticks" aria-hidden style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            {secs.map((s, i) => (
              <span key={i} style={{ display: 'block', height: 1.5, width: i === cur ? 26 : 14, background: i === cur ? 'var(--text-primary)' : 'var(--line-hover)', borderRadius: 1, transition: 'width .45s cubic-bezier(.34,1.56,.64,1), background-color .3s ease' }} />
            ))}
          </div>
          <div className="v3ps-railpanel" style={{ position: 'absolute', right: 14, top: '50%', translate: '0 -50%', minWidth: 230, padding: '10px 6px', borderRadius: 12, background: 'var(--glass-panel-92)', border: '1px solid var(--line-panel)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-panel)' }}>
            {secs.map((s, i) => (
              <button
                key={i}
                className="v3ps-rl"
                type="button"
                onClick={() => jump(i)}
                aria-current={i === cur ? 'true' : 'false'}
                style={{ '--c': i === cur ? 'var(--text-primary)' : 'var(--text-label)' } as CSSProperties}
              >
                {s.h}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
});

export default ProjectSpread;

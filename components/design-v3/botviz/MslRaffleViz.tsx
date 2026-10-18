'use client';

// MslRaffleViz: the weekly booster raffle. Example data only; the rules shown
// (MSL filter, Pool A first, one slot each, extras to the fewest excess wins,
// UNVERIFIED rows last) are what the cog does.

import { useLayoutEffect, useRef } from 'react';
import { Caption, mono, putCaption, usePaused, useVizClock, type Pal } from '../SystemViz';

const NAMES = ['Sunday draw starts', 'MSL boosters removed', 'Pool A fills first', 'One slot each', 'Extra slots, fewest wins', 'Export splits files'];
const LABELS = ['Sun 8 AM PHT', 'MSL removed', 'Pool A first', 'One slot each', 'Example: 2 extra', 'UNVERIFIED rows last'];

// Example boosters. pool: 0 none (MSL, removed), 1 Pool A, 2 Pool B.
const BOOSTERS = [
  { id: '0412', tix: 8, msl: true, pool: 0 },
  { id: '1177', tix: 1, msl: false, pool: 1 },
  { id: '2093', tix: 4, msl: false, pool: 1 },
  { id: '3340', tix: 1, msl: true, pool: 0 },
  { id: '4518', tix: 1, msl: false, pool: 2 },
  { id: '5602', tix: 4, msl: false, pool: 1 },
];
// Winners in draw order: Pool A first, then Pool B. Slots 5 and 6 are the extras.
const SLOT_IDS = ['2093', '5602', '1177', '4518', '4518', '2093'];
const EXC_IDS = ['2093', '5602', '1177', '4518'];

export default function MslRaffleViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const labelRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const rowAt = (i: number) => (el: HTMLDivElement | null) => { if (el) rows.current[i] = el; };
  const badges = useRef<(HTMLSpanElement | null)[]>([]);
  const badgeAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) badges.current[i] = el; };
  const slots = useRef<(HTMLSpanElement | null)[]>([]);
  const slotAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) slots.current[i] = el; };
  const excWrap = useRef<HTMLDivElement>(null);
  const exc = useRef<(HTMLSpanElement | null)[]>([]);
  const excAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) exc.current[i] = el; };
  const files = useRef<(HTMLDivElement | null)[]>([]);
  const fileAt = (i: number) => (el: HTMLDivElement | null) => { if (el) files.current[i] = el; };
  const lastRowRef = useRef<HTMLSpanElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = NAMES.length;
    const STEP = 3600;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;

    // How many of the six slots are filled, and which rows hold a win.
    let filled = 0;
    if (a === 3) filled = Math.min(4, Math.floor(p / 0.2));
    else if (a === 4) filled = 4 + (p >= 0.25 ? 1 : 0) + (p >= 0.6 ? 1 : 0);
    else if (a >= 5) filled = 6;
    const won = new Set(SLOT_IDS.slice(0, Math.min(filled, 4)));

    if (labelRef.current) labelRef.current.textContent = LABELS[a];
    if (dotRef.current) dotRef.current.style.background = a === 0 ? P.live : P.under;
    if (countRef.current) countRef.current.textContent = a >= 1 ? 'example: 36 left' : 'example: 40 eligible';

    BOOSTERS.forEach((b, i) => {
      const row = rows.current[i], badge = badges.current[i];
      const removed = b.msl && a >= 1;
      const inPool = !b.msl && a >= 2;
      if (row) {
        row.style.opacity = removed ? '0.3' : '1';
        row.style.transform = removed ? 'translateX(-10px)' : 'translateX(0px)';
        row.style.borderColor = won.has(b.id) ? P.fg : inPool && b.pool === 1 ? P.frame : P.div;
        row.style.textDecoration = removed ? 'line-through' : 'none';
      }
      if (badge) {
        badge.textContent = b.msl ? 'MSL' : b.pool === 1 ? 'A' : 'B';
        badge.style.opacity = b.msl || inPool ? '1' : '0';
        badge.style.color = b.pool === 1 && inPool ? P.fg : P.lbl;
      }
    });

    SLOT_IDS.forEach((id, i) => {
      const el = slots.current[i];
      if (!el) return;
      const on = i < filled;
      el.textContent = on ? id : '';
      el.style.borderColor = on ? (i >= 4 ? P.live : P.fg) : P.div;
    });

    if (excWrap.current) {
      excWrap.current.style.opacity = a >= 4 ? '1' : '0';
    }
    const extra = Math.max(0, filled - 4);
    EXC_IDS.forEach((id, i) => {
      const el = exc.current[i];
      if (!el) return;
      const v = (extra >= 1 && id === SLOT_IDS[4] ? 1 : 0) + (extra >= 2 && id === SLOT_IDS[5] ? 1 : 0);
      el.textContent = id + ' · ' + v;
      el.style.color = v > 0 ? P.fg : P.lbl;
    });

    [0, 1].forEach((i) => {
      const el = files.current[i];
      if (!el) return;
      const on = a >= 5;
      el.style.opacity = on ? '1' : '0';
      el.style.transform = on ? 'translateY(0px)' : 'translateY(8px)';
      el.style.borderColor = on && p > 0.2 ? P.fg : P.div;
    });
    if (lastRowRef.current) lastRowRef.current.style.clipPath = a >= 5 && p > 0.35 ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)';

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), NAMES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const bar = (w: string) => <span style={{ display: 'block', height: 4, width: w, borderRadius: 2, background: P.div }} />;

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <span style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 8, ...mono, fontSize: 11.5, color: P.fg }}>
          <span ref={dotRef} style={{ width: 7, height: 7, borderRadius: 99, background: P.under, transition: 'background-color .3s ease' }} />
          <span ref={labelRef} style={{ whiteSpace: 'nowrap' }} />
        </span>

        {BOOSTERS.map((b, i) => (
          <div key={b.id} ref={rowAt(i)} style={{ position: 'absolute', left: 0, top: 28 + i * 30, width: '40%', height: 26, boxSizing: 'border-box', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${P.div}`, borderRadius: 6, ...mono, fontSize: 11, color: P.sec, transition: 'opacity .5s ease, transform .6s cubic-bezier(.22,1,.36,1), border-color .3s ease' }}>
            <span>{'#' + b.id}</span>
            <span style={{ color: P.lbl }}>{'×' + b.tix}</span>
            <span ref={badgeAt(i)} style={{ width: 24, textAlign: 'right', opacity: 0, transition: 'opacity .4s ease, color .3s ease' }} />
          </div>
        ))}

        <span ref={countRef} style={{ position: 'absolute', left: '46%', top: 29, ...mono, fontSize: 11, fontStyle: 'italic', color: P.lbl, whiteSpace: 'nowrap' }} />
        <span style={{ position: 'absolute', left: '46%', top: 56, fontSize: 11, color: P.lbl, whiteSpace: 'nowrap' }}>slots, 100 Diamonds each</span>
        {SLOT_IDS.map((_, i) => (
          <span
            key={i}
            ref={slotAt(i)}
            style={{ position: 'absolute', left: `calc(46% + ${(i % 3) * 18}%)`, top: 76 + Math.floor(i / 3) * 30, width: '16%', height: 24, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.div}`, borderRadius: 6, ...mono, fontSize: 11, color: P.fg, transition: 'border-color .3s ease' }}
          />
        ))}

        <div ref={excWrap} style={{ position: 'absolute', left: '46%', top: 142, width: '54%', opacity: 0, transition: 'opacity .5s ease' }}>
          <span style={{ display: 'block', fontSize: 11, color: P.lbl, marginBottom: 6, whiteSpace: 'nowrap' }}>excess wins this draw</span>
          <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 8px', ...mono, fontSize: 10.5 }}>
            {EXC_IDS.map((_, i) => (
              <span key={i} ref={excAt(i)} style={{ color: P.lbl, whiteSpace: 'nowrap' }} />
            ))}
          </span>
        </div>

        {['msl.csv', 'non-msl.csv'].map((name, i) => (
          <div key={name} ref={fileAt(i)} style={{ position: 'absolute', left: i === 0 ? 0 : '52%', top: 222, width: '48%', height: 70, boxSizing: 'border-box', padding: '8px 10px', border: `1px solid ${P.div}`, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 7, opacity: 0, transform: 'translateY(8px)', transition: 'opacity .5s ease, transform .6s cubic-bezier(.22,1,.36,1), border-color .3s ease' }}>
            <span style={{ ...mono, fontSize: 11, color: P.fg }}>{name}</span>
            {bar('85%')}
            {bar('60%')}
            {i === 1 ? (
              <span ref={lastRowRef} style={{ ...mono, fontSize: 10, color: P.lbl, lineHeight: 1, clipPath: 'inset(0 100% 0 0)', transition: 'clip-path .7s cubic-bezier(.65,0,.35,1)' }}>UNVERIFIED</span>
            ) : bar('70%')}
          </div>
        ))}
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}

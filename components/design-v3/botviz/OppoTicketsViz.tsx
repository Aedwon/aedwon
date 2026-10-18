'use client';

// OppoTicketsViz: the OPPO ticket flow. Six phases on one rAF clock writing to
// DOM refs (no setState per frame; only `paused` is state).
// Facts: oppo-tickets fact sheet. The 10 minute check and the 24 h / 48 h
// thresholds are real. Names and the clock values on stage are examples.

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { Caption, clamp01, easeInOut, mono, putCaption, useVizClock, usePaused, type Pal } from '../SystemViz';

const NAMES = ['Pick a category', 'Private channel opens', 'Unclaimed timers run', 'League Ops claims', 'Close and transcript', 'Five-star rating DM'];
const STEP = 3800;
const TAGS = ['LO', 'TE', 'CR', 'GN'];

export default function OppoTicketsViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);
  const R = useRef<Record<string, HTMLElement | null>>({});
  const rf = (k: string) => (el: HTMLElement | null) => { R.current[k] = el; };
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = NAMES.length;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;
    const g = (k: string) => R.current[k];
    const set = (k: string, s: Partial<CSSStyleDeclaration>) => { const el = g(k); if (el) Object.assign(el.style, s); };
    const text = (k: string, s: string) => { const el = g(k); if (el && el.textContent !== s) el.textContent = s; };
    const lit = (on: boolean) => ({ borderColor: on ? P.fg : P.div, color: on ? P.fg : P.lbl });

    // panel: button, then category chips, then the form
    set('create', lit(a === 0 && p > 0.1 && p < 0.35));
    TAGS.forEach((_, i) => set('tag' + i, lit(a === 0 && p > 0.55 && i === 1)));
    set('panel', { borderColor: a === 0 ? P.fg : P.div });
    set('form', { opacity: a === 0 && p > 0.75 ? '1' : '0.45' });

    // private channel
    const open = a >= 1 && a < 4;
    const gone = a === 4 && p > 0.7 || a === 5;
    set('chan', { borderColor: open || (a === 4 && !gone) ? P.fg : P.div, opacity: gone ? '0.35' : '1' });
    text('chanName', gone ? 'Channel deleted' : a >= 1 ? '[te]-username' : 'Ticket channel');
    set('chanName', { color: a >= 1 && !gone ? P.fg : P.lbl });
    set('chanSub', { opacity: a >= 1 && p > (a === 1 ? 0.35 : 0) ? '1' : '0.45' });

    // unclaimed timers: 0 to 48 hours inside phase 3, frozen afterwards
    const h = a < 2 ? 0 : a === 2 ? 48 * easeInOut(clamp01(p / 0.8)) : 48;
    const hh = Math.floor(h);
    const mm = Math.floor((h - hh) * 60);
    text('clock', hh + 'h ' + String(mm).padStart(2, '0') + 'm');
    set('fill', { width: (h / 48 * 100).toFixed(1) + '%' });
    const claimed = a >= 3;
    set('timers', { borderColor: a === 2 ? P.fg : P.div, opacity: claimed ? '0.5' : '1' });
    set('clock', { color: a === 2 ? P.fg : P.lbl });
    text('every', claimed ? 'claimed, no pings' : 'check every 10 min');
    set('al1', { color: h >= 24 ? P.fg : P.lbl });
    set('al2', { color: h >= 48 ? P.fg : P.lbl });

    // claim
    const esc = (a === 2 && h >= 48) || a === 3;
    const done = (a === 3 && p > 0.25) || a >= 4;
    set('claim', { borderColor: a === 3 ? P.fg : P.div });
    set('claimBtn', lit(a === 3 && p > 0.1));
    text('claimBtn', done ? 'Claimed' : 'Claim');
    text('claimSub', done ? 'League Ops (example)' : esc ? 'League Ops can claim now' : 'Admins, category role');
    set('claimSub', { color: done ? P.sec : P.lbl });

    // close, transcript, rating
    const closeOn = a === 4 && p > 0.05;
    const trOn = a === 4 && p > 0.4;
    const rateOn = a === 5;
    set('bClose', { borderColor: closeOn ? P.fg : P.div });
    set('bTr', { borderColor: trOn ? P.fg : P.div });
    set('bRate', { borderColor: rateOn ? P.fg : P.div });
    set('tClose', { color: closeOn ? P.fg : P.lbl });
    set('tTr', { color: trOn ? P.fg : P.lbl });
    set('tRate', { color: rateOn ? P.fg : P.lbl });
    const arrow1 = a === 4 && p > 0.3;
    const arrow2 = a === 5 && p > 0.05;
    set('ar1', { clipPath: arrow1 || a === 5 ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' });
    set('ar2', { clipPath: arrow2 ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' });
    const stars = a === 5 ? Math.min(4, Math.floor(clamp01((p - 0.2) / 0.5) * 4 + 0.001)) : 0;
    for (let i = 0; i < 5; i++) set('s' + i, { color: i < stars ? P.fg : P.under });

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), NAMES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const box: CSSProperties = { position: 'absolute', boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 8, transition: 'border-color .3s ease, opacity .4s ease' };
  const pill: CSSProperties = { padding: '3px 9px', border: `1px solid ${P.div}`, borderRadius: 6, fontSize: 11.5, color: P.lbl, transition: 'border-color .3s ease, color .3s ease' };
  const arrow = (key: string, left: string): CSSProperties & { k: string } => ({ k: key, position: 'absolute', left, width: '5%', top: 236, height: 9, clipPath: 'inset(0 100% 0 0)', transition: 'clip-path .5s cubic-bezier(.65,0,.35,1)' });
  const arr = (key: string, left: string) => {
    const { k, ...st } = arrow(key, left);
    return (
      <span key={k} ref={rf(k)} style={st}>
        <span style={{ position: 'absolute', left: 0, right: 4, top: 4, height: 1, background: P.fg }} />
        <span style={{ position: 'absolute', right: 0, top: 1, width: 0, height: 0, borderLeft: `5px solid ${P.fg}`, borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
      </span>
    );
  };
  const title = (k: string, s: string): React.ReactNode => <span ref={rf(k)} style={{ display: 'block', fontSize: 12, color: P.lbl, transition: 'color .3s ease' }}>{s}</span>;

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <div ref={rf('panel')} style={{ ...box, left: 0, width: '46%', top: 0, height: 86 }}>
          <span ref={rf('create')} style={{ ...pill, position: 'absolute', left: 10, top: 10 }}>Create Ticket</span>
          <span style={{ position: 'absolute', left: 10, top: 40, display: 'flex', gap: 5 }}>
            {TAGS.map((tg, i) => (
              <span key={tg} ref={rf('tag' + i)} style={{ ...pill, ...mono, fontSize: 11, padding: '2px 6px' }}>{tg}</span>
            ))}
          </span>
          <span ref={rf('form')} style={{ position: 'absolute', left: 10, top: 66, fontSize: 11, color: P.sec, opacity: 0.45, transition: 'opacity .3s ease' }}>Subject, Description</span>
        </div>

        <div ref={rf('chan')} style={{ ...box, left: 0, width: '46%', top: 98, height: 98 }}>
          <span style={{ position: 'absolute', left: 10, top: 9, right: 10 }}>
            <span ref={rf('chanName')} style={{ display: 'block', ...mono, fontSize: 11.5, color: P.lbl }}>Ticket channel</span>
          </span>
          <span ref={rf('chanSub')} style={{ position: 'absolute', left: 10, right: 10, top: 32, fontSize: 11, lineHeight: 1.4, color: P.sec, opacity: 0.45, transition: 'opacity .4s ease' }}>Private: creator, bot, category role, support role</span>
        </div>

        <div ref={rf('timers')} style={{ ...box, left: '54%', width: '46%', top: 0, height: 104 }}>
          <span ref={rf('every')} style={{ position: 'absolute', left: 10, top: 10, fontSize: 11, color: P.lbl }} />
          <span ref={rf('clock')} style={{ position: 'absolute', right: 10, top: 8, ...mono, fontSize: 12, color: P.lbl }} />
          <span style={{ position: 'absolute', left: 10, right: 10, top: 36, height: 3, borderRadius: 2, background: P.track }}>
            <span ref={rf('fill')} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', borderRadius: 2, background: P.fg }} />
            <span style={{ position: 'absolute', left: '50%', top: -4, width: 1, height: 11, background: P.frame }} />
            <span style={{ position: 'absolute', right: 0, top: -4, width: 1, height: 11, background: P.frame }} />
            <span style={{ position: 'absolute', left: '50%', top: 10, transform: 'translateX(-50%)', ...mono, fontSize: 9.5, color: P.lbl }}>24h</span>
            <span style={{ position: 'absolute', right: 0, top: 10, ...mono, fontSize: 9.5, color: P.lbl }}>48h</span>
          </span>
          <span ref={rf('al1')} style={{ position: 'absolute', left: 10, top: 66, fontSize: 11, color: P.lbl, transition: 'color .3s ease' }}>24h: role pinged</span>
          <span ref={rf('al2')} style={{ position: 'absolute', left: 10, top: 83, fontSize: 11, color: P.lbl, transition: 'color .3s ease' }}>48h: League Ops too</span>
        </div>

        <div ref={rf('claim')} style={{ ...box, left: '54%', width: '46%', top: 116, height: 80 }}>
          <span ref={rf('claimBtn')} style={{ ...pill, position: 'absolute', left: 10, top: 10 }}>Claim</span>
          <span ref={rf('claimSub')} style={{ position: 'absolute', left: 10, right: 10, top: 42, fontSize: 11, lineHeight: 1.4, color: P.lbl }} />
        </div>

        <div ref={rf('bClose')} style={{ ...box, left: 0, width: '30%', top: 212, height: 56, padding: '9px 10px' }}>
          {title('tClose', 'Close')}
          <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: P.lbl }}>pick a reason</span>
        </div>
        {arr('ar1', '32.5%')}
        <div ref={rf('bTr')} style={{ ...box, left: '35%', width: '30%', top: 212, height: 56, padding: '9px 10px' }}>
          {title('tTr', 'Transcript')}
          <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: P.lbl }}>to log, DM</span>
        </div>
        {arr('ar2', '67.5%')}
        <div ref={rf('bRate')} style={{ ...box, left: '70%', width: '30%', top: 212, height: 56, padding: '9px 10px' }}>
          {title('tRate', 'Rating DM')}
          <span style={{ display: 'flex', marginTop: 3, ...mono, fontSize: 12 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} ref={rf('s' + i)} style={{ color: P.under }}>{'★'}</span>
            ))}
          </span>
        </div>

        <span style={{ position: 'absolute', left: 0, top: 278, fontSize: 11, fontStyle: 'italic', color: P.lbl }}>example names and times</span>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}

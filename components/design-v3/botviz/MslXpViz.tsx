'use client';

// MslXpViz: chat, reaction and voice XP pile up in memory, caps stop extra XP,
// a 60 second timer runs out and one batch write moves the pile into the database
// (multiplier applied on write), the level ring moves and an alert posts.
// Event Points stay on their own path. One rAF clock writes straight to DOM refs.

import { useLayoutEffect, useRef } from 'react';
import { Caption, clamp01, easeInOut, easeOut, mono, putCaption, usePaused, useVizClock, type Pal } from '../SystemViz';

const NAMES = ['Activity fills memory', 'Caps block extra XP', 'Sixty second flush', 'Multiplier applies on write', 'Alert posts', 'Event Points stay separate'];

// 0 idle, 1 done, 2 lit, 3 live (green)
type St = 0 | 1 | 2 | 3;
const sBorder = (P: Pal, s: St) => [P.div, P.frame, P.fg, P.live][s];
const sText = (P: Pal, s: St) => [P.lbl, P.sec, P.fg, P.fg][s];

const SRC = [
  { t: 'Chat', top: 0 },
  { t: 'Reaction', top: 40 },
  { t: 'Voice', top: 80 },
];
const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;
const fmt = (v: number) => v.toLocaleString('en-US');

const box = (P: Pal, extra: React.CSSProperties): React.CSSProperties => ({
  position: 'absolute', boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 6, ...mono, fontSize: 11, color: P.lbl,
  transition: 'border-color .3s ease, color .3s ease', ...extra,
});
const centered: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' };

export default function MslXpViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const srcBox = useRef<(HTMLDivElement | null)[]>([]);
  const srcBoxAt = (i: number) => (el: HTMLDivElement | null) => { if (el) srcBox.current[i] = el; };
  const srcLine = useRef<(HTMLSpanElement | null)[]>([]);
  const srcLineAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) srcLine.current[i] = el; };
  const memRef = useRef<HTMLDivElement>(null);
  const memNumRef = useRef<HTMLSpanElement>(null);
  const memFillRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const capRef = useRef<HTMLSpanElement>(null);
  const flushLineRef = useRef<HTMLSpanElement>(null);
  const packetRef = useRef<HTMLSpanElement>(null);
  const dbRef = useRef<HTMLDivElement>(null);
  const dbNumRef = useRef<HTMLSpanElement>(null);
  const multRef = useRef<HTMLSpanElement>(null);
  const ringArcRef = useRef<SVGCircleElement>(null);
  const ringNumRef = useRef<HTMLSpanElement>(null);
  const alertLineRef = useRef<HTMLSpanElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const epLineRef = useRef<HTMLSpanElement>(null);
  const epRef = useRef<HTMLDivElement>(null);
  const notXpRef = useRef<HTMLSpanElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = NAMES.length;
    const STEP = 3600;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;
    const win = (lo: number, hi: number) => p >= lo && p < hi;

    // sources: lit windows per phase. In phase 1 the reaction lamp turns red (cap reached).
    const lit = [false, false, false];
    let capped = false;
    if (a === 0) {
      lit[0] = win(0.05, 0.3); lit[1] = win(0.3, 0.55); lit[2] = win(0.55, 0.8);
    } else if (a === 1) {
      lit[0] = win(0.1, 0.3); lit[2] = win(0.5, 0.7); capped = p >= 0.15;
    }
    SRC.forEach((_, i) => {
      const isCap = i === 1 && capped;
      const col = isCap ? P.red : lit[i] ? P.fg : P.div;
      const b = srcBox.current[i], ln = srcLine.current[i];
      if (b) { b.style.borderColor = col; b.style.color = isCap ? P.red : lit[i] ? P.fg : P.lbl; }
      if (ln) ln.style.background = isCap || lit[i] ? col : P.div;
    });
    if (capRef.current) capRef.current.style.opacity = a === 1 && p >= 0.15 ? '1' : '0';

    // pending counter and the 60 second timer
    let pending = 0;
    if (a === 0) pending = Math.round(37 * easeOut((p - 0.05) / 0.85));
    else if (a === 1) pending = 37 + Math.round(4 * easeInOut((p - 0.2) / 0.6));
    else if (a === 2) pending = p < 0.8 ? 41 : Math.round(41 * (1 - easeInOut((p - 0.8) / 0.15)));
    else pending = Math.round(((a - 3) + p) * 3);
    let secs = 60;
    if (a <= 2) secs = Math.round(60 * (1 - clamp01((a + p) / 2.7)));
    else secs = 60 - Math.floor(((a - 3) + p) * 4);
    if (memNumRef.current) memNumRef.current.textContent = String(pending);
    if (memFillRef.current) memFillRef.current.style.width = (clamp01(pending / 50) * 100).toFixed(1) + '%';
    if (timerRef.current) timerRef.current.textContent = 'flush in ' + secs + ' s';
    const flushing = a === 2 && p >= 0.7 && p < 0.97;
    const memSt: St = a <= 1 ? (pending > 0 ? 2 : 0) : a === 2 ? 2 : 1;
    if (memRef.current) { memRef.current.style.borderColor = sBorder(P, memSt); memRef.current.style.color = sText(P, memSt); }

    // flush: a packet crosses from memory to the database
    const k = a === 2 ? easeInOut((p - 0.72) / 0.23) : 0;
    if (flushLineRef.current) flushLineRef.current.style.background = flushing ? P.fg : P.div;
    if (packetRef.current) {
      packetRef.current.style.left = (68 + 8 * k).toFixed(2) + '%';
      packetRef.current.style.opacity = k > 0 && k < 1 ? '1' : '0';
    }

    // database total, multiplier on write
    const dbTotal = a < 3 ? 12480 : a === 3 ? 12480 + Math.round(72 * easeOut((p - 0.15) / 0.5)) : 12552;
    if (dbNumRef.current) dbNumRef.current.textContent = fmt(dbTotal);
    const dbSt: St = a === 2 && p >= 0.85 ? 2 : a === 3 ? 2 : 0;
    if (dbRef.current) { dbRef.current.style.borderColor = sBorder(P, dbSt); dbRef.current.style.color = sText(P, dbSt); }
    if (multRef.current) multRef.current.style.opacity = a === 3 && p > 0.1 ? '1' : '0';

    // level ring: fills to the next level, then the level number turns over
    let prog = 0.62;
    if (a === 3) prog = 0.62 + 0.38 * easeInOut((p - 0.2) / 0.6);
    else if (a >= 5 || (a === 4 && p > 0.05)) prog = 0.05;
    else if (a === 4) prog = 1;
    const lvl = a < 4 || (a === 4 && p <= 0.05) ? 11 : 12;
    if (ringArcRef.current) ringArcRef.current.style.strokeDashoffset = (RING_C * (1 - prog)).toFixed(2);
    if (ringNumRef.current) ringNumRef.current.textContent = 'Lv ' + lvl;

    // alert card
    const alSt: St = a === 4 ? (p > 0.25 ? 2 : 0) : a >= 5 ? 1 : 0;
    if (alertRef.current) { alertRef.current.style.borderColor = sBorder(P, alSt); alertRef.current.style.color = sText(P, alSt); }
    if (alertLineRef.current) alertLineRef.current.style.clipPath = `inset(0 ${((1 - (a === 4 ? easeInOut(p / 0.25) : a > 4 ? 1 : 0)) * 100).toFixed(1)}% 0 0)`;

    // Event Points, separate path
    const quizSt: St = a === 5 && p > 0.05 ? 2 : 0;
    const epSt: St = a === 5 && p > 0.45 ? 3 : 0;
    if (quizRef.current) { quizRef.current.style.borderColor = sBorder(P, quizSt); quizRef.current.style.color = sText(P, quizSt); }
    if (epRef.current) { epRef.current.style.borderColor = sBorder(P, epSt); epRef.current.style.color = sText(P, epSt); }
    if (epLineRef.current) epLineRef.current.style.clipPath = `inset(0 ${((1 - (a === 5 ? easeInOut((p - 0.1) / 0.3) : 0)) * 100).toFixed(1)}% 0 0)`;
    if (notXpRef.current) notXpRef.current.style.opacity = a === 5 && p > 0.5 ? '1' : '0';

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), NAMES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const hline = (left: string, top: number, w: string): React.CSSProperties => ({ position: 'absolute', left, top, width: w, height: 1, background: P.div });
  const lbl = (extra: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', ...mono, fontSize: 11, color: P.lbl, whiteSpace: 'nowrap', ...extra });

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        {SRC.map((s, i) => (
          <div key={s.t}>
            <div ref={srcBoxAt(i)} style={box(P, { ...centered, left: 0, top: s.top, width: '26%', height: 30 })}>{s.t}</div>
            <span ref={srcLineAt(i)} style={hline('26%', s.top + 15, '8%')} />
          </div>
        ))}
        <span ref={capRef} style={lbl({ left: 0, top: 118, color: P.red, opacity: 0, transition: 'opacity .3s ease' })}>Cap reached</span>

        <div ref={memRef} style={box(P, { left: '34%', top: 0, width: '34%', height: 112 })}>
          <span style={lbl({ left: 8, top: 8, fontSize: 10.5, color: 'inherit' })}>Pending memory</span>
          <span ref={memNumRef} style={lbl({ left: 8, top: 26, fontSize: 24, color: P.fg })}>0</span>
          <span style={{ position: 'absolute', left: 8, top: 58, fontSize: 10.5, fontStyle: 'italic', color: P.lbl }}>example</span>
          <span style={{ position: 'absolute', left: 8, right: 8, top: 76, height: 5, borderRadius: 3, background: P.track }}>
            <span ref={memFillRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', borderRadius: 3, background: P.fg }} />
          </span>
          <span ref={timerRef} style={lbl({ left: 8, top: 92, color: P.sec })}>flush in 60 s</span>
        </div>

        <span ref={flushLineRef} style={hline('68%', 56, '8%')} />
        <span ref={packetRef} style={{ position: 'absolute', left: '68%', top: 52, width: 9, height: 9, marginLeft: -4.5, borderRadius: 2, background: P.fg, opacity: 0 }} />

        <div ref={dbRef} style={box(P, { left: '76%', top: 0, width: '24%', height: 112 })}>
          <span style={lbl({ left: 8, top: 8, fontSize: 10.5, color: 'inherit' })}>Database</span>
          <span ref={dbNumRef} style={lbl({ left: 8, top: 30, fontSize: 16, color: P.fg })}>12,480</span>
          <span style={lbl({ left: 8, top: 54, fontSize: 10.5 })}>XP stored</span>
          <span style={{ position: 'absolute', left: 8, top: 70, fontSize: 10.5, fontStyle: 'italic', color: P.lbl }}>example</span>
        </div>

        <span ref={multRef} style={lbl({ left: '34%', top: 124, opacity: 0, transition: 'opacity .3s ease' })}>Example: x1.75</span>

        <svg width={64} height={64} viewBox="0 0 64 64" style={{ position: 'absolute', left: '76%', top: 142, transform: 'rotate(-90deg)' }}>
          <circle cx={32} cy={32} r={RING_R} fill="none" stroke={P.track} strokeWidth={4} />
          <circle ref={ringArcRef} cx={32} cy={32} r={RING_R} fill="none" stroke={P.fg} strokeWidth={4} strokeDasharray={RING_C} strokeDashoffset={RING_C * 0.38} strokeLinecap="round" />
        </svg>
        <span ref={ringNumRef} style={lbl({ left: '76%', top: 142, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.fg })}>Lv 11</span>
        <span style={{ position: 'absolute', left: '76%', top: 210, fontSize: 10.5, fontStyle: 'italic', color: P.lbl }}>example</span>

        <span ref={alertLineRef} style={{ ...hline('68%', 174, '8%'), background: P.sep, clipPath: 'inset(0 100% 0 0)' }} />
        <div ref={alertRef} style={box(P, { left: '24%', top: 152, width: '44%', height: 44, padding: '6px 8px' })}>
          <span style={{ display: 'block', fontSize: 10.5, color: 'inherit' }}>Alert</span>
          <span style={{ display: 'block', marginTop: 4, color: 'inherit', whiteSpace: 'nowrap' }}>Example: Level 12</span>
        </div>

        <div ref={quizRef} style={box(P, { ...centered, left: 0, top: 244, width: '20%', height: 34 })}>Quiz</div>
        <span ref={epLineRef} style={{ ...hline('20%', 261, '8%'), background: P.sep, clipPath: 'inset(0 100% 0 0)' }} />
        <div ref={epRef} style={box(P, { ...centered, left: '28%', top: 244, width: '34%', height: 34 })}>Event Points</div>
        <span ref={notXpRef} style={lbl({ left: '66%', top: 253, opacity: 0, transition: 'opacity .3s ease' })}>Not XP</span>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}

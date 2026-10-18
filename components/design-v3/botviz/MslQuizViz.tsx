'use client';

// MslQuizViz: a session opens the channel, a question posts with a 20 second
// window, members TYPE the answer (no buttons), faster answers score more, the
// result is revealed, round scores add up over 10 rounds, then payouts post and
// the channel locks. One rAF clock writes straight to DOM refs.

import { useLayoutEffect, useRef } from 'react';
import { Caption, clamp01, easeInOut, mono, putCaption, usePaused, useVizClock, type Pal } from '../SystemViz';

const NAMES = ['Channel opens', 'Question posts', 'Speed sets points', 'Result revealed', 'Session total builds', 'Payouts post'];

// 0 idle, 1 done, 2 lit, 3 live (green)
type St = 0 | 1 | 2 | 3;
const sBorder = (P: Pal, s: St) => [P.div, P.frame, P.fg, P.live][s];
const sText = (P: Pal, s: St) => [P.lbl, P.sec, P.fg, P.fg][s];

// Example typed answers. Points follow round(1000 x (1 - t / 20)).
const ANSWERS = [
  { who: 'ana', t: 5, bar: 40 },
  { who: 'ben', t: 8, bar: 52 },
  { who: 'cy', t: 14, bar: 30 },
].map((r) => ({ ...r, pts: Math.round(1000 * (1 - r.t / 20)) }));
const TIERS = ['1st 150 EP', '2nd 100 EP', '3rd 75 EP', 'Rest 50 EP'];
const fmt = (v: number) => v.toLocaleString('en-US');

const box = (P: Pal, extra: React.CSSProperties): React.CSSProperties => ({
  position: 'absolute', boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 6, ...mono, fontSize: 11, color: P.lbl,
  transition: 'border-color .3s ease, color .3s ease', ...extra,
});
const lbl = (P: Pal, extra: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', ...mono, fontSize: 10.5, color: P.lbl, whiteSpace: 'nowrap', ...extra });

export default function MslQuizViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const clockRef = useRef<HTMLDivElement>(null);
  const clockLineRef = useRef<HTMLSpanElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const lockTxtRef = useRef<HTMLSpanElement>(null);
  const qRef = useRef<HTMLDivElement>(null);
  const roundRef = useRef<HTMLSpanElement>(null);
  const timerTxtRef = useRef<HTMLSpanElement>(null);
  const timerFillRef = useRef<HTMLSpanElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLSpanElement | null)[]>([]);
  const rowAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) rows.current[i] = el; };
  const resRef = useRef<HTMLDivElement>(null);
  const scorers = useRef<(HTMLSpanElement | null)[]>([]);
  const scorerAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) scorers.current[i] = el; };
  const ansRef = useRef<HTMLSpanElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const cells = useRef<(HTMLSpanElement | null)[]>([]);
  const cellAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) cells.current[i] = el; };
  const chips = useRef<(HTMLDivElement | null)[]>([]);
  const chipAt = (i: number) => (el: HTMLDivElement | null) => { if (el) chips.current[i] = el; };
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = NAMES.length;
    const STEP = 3800;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;
    const setBox = (el: HTMLElement | null, s: St) => { if (el) { el.style.borderColor = sBorder(P, s); el.style.color = sText(P, s); } };

    // clock and channel lock
    setBox(clockRef.current, a === 0 ? 2 : 1);
    if (clockLineRef.current) clockLineRef.current.style.clipPath = `inset(0 ${((1 - (a === 0 ? easeInOut((p - 0.15) / 0.25) : 1)) * 100).toFixed(1)}% 0 0)`;
    const unlocked = (a === 0 && p > 0.4) || (a >= 1 && !(a === 5 && p > 0.6));
    setBox(lockRef.current, unlocked ? 3 : a === 5 ? 1 : 0);
    if (lockTxtRef.current) lockTxtRef.current.textContent = unlocked ? 'Channel unlocked' : 'Channel locked';

    // question card and the 20 second window
    const tw = a === 2 ? 20 * clamp01(p / 0.9) : a > 2 ? 20 : 0; // seconds into the window
    const left = Math.ceil(20 - tw);
    const k = a === 4 ? Math.floor(easeInOut(p / 0.9) * 10) : a === 5 ? 10 : 0;
    const round = Math.max(1, k);
    setBox(qRef.current, a === 1 || (a === 2 && p < 0.95) || a === 4 ? 2 : a === 0 ? 0 : 1);
    if (roundRef.current) roundRef.current.textContent = 'Round ' + round + ' / 10';
    if (timerTxtRef.current) {
      timerTxtRef.current.textContent = left + ' s';
      timerTxtRef.current.style.color = a >= 1 && a <= 2 ? P.fg : P.lbl;
    }
    if (timerFillRef.current) {
      timerFillRef.current.style.width = (a === 0 ? 100 : (left / 20) * 100).toFixed(1) + '%';
      timerFillRef.current.style.background = a >= 1 && a <= 2 ? P.fg : P.under;
    }

    // typed answers arrive; speed sets points
    setBox(chatRef.current, a === 2 ? 2 : a > 2 ? 1 : 0);
    ANSWERS.forEach((r, i) => {
      const el = rows.current[i];
      if (!el) return;
      const on = tw >= r.t;
      el.style.opacity = on ? '1' : '0';
      el.style.transform = `translateY(${on ? 0 : 6}px)`;
    });

    // result card: scorers first, then the answer
    setBox(resRef.current, a === 3 ? (p > 0.1 ? 2 : 0) : a > 3 ? 1 : 0);
    scorers.current.forEach((el) => { if (el) el.style.opacity = a > 3 || (a === 3 && p > 0.1) ? '1' : '0'; });
    if (ansRef.current) {
      const on = a === 3 && p > 0.5;
      ansRef.current.style.borderColor = on ? P.live : a > 3 ? P.frame : P.div;
      ansRef.current.style.color = on ? P.fg : a > 3 ? P.sec : P.lbl;
    }

    // session total builds over 10 rounds
    const frac = a === 4 ? easeInOut(p / 0.9) : a > 4 ? 1 : 0;
    if (totalRef.current) totalRef.current.textContent = 'Example: ' + fmt(Math.round(2140 * frac)) + ' pts';
    cells.current.forEach((el, i) => { if (el) el.style.background = i < k ? P.fg : 'transparent'; });

    // payouts, then the channel locks again
    chips.current.forEach((el, i) => setBox(el, a === 5 && p > 0.1 + 0.15 * i ? 2 : 0));

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), NAMES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const centered: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' };

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <div ref={clockRef} style={box(P, { ...centered, left: 0, top: 0, width: '42%', height: 34 })}>12:00 and 20:00 PHT</div>
        <span ref={clockLineRef} style={{ position: 'absolute', left: '42%', top: 17, width: '6%', height: 1, background: P.sep, clipPath: 'inset(0 100% 0 0)' }} />
        <div ref={lockRef} style={box(P, { ...centered, left: '48%', top: 0, width: '52%', height: 34 })}>
          <span ref={lockTxtRef}>Channel locked</span>
        </div>

        <div ref={qRef} style={box(P, { left: 0, top: 52, width: '100%', height: 54 })}>
          <span ref={roundRef} style={lbl(P, { left: 12, top: 8, color: 'inherit' })}>Round 1 / 10</span>
          <span ref={timerTxtRef} style={lbl(P, { right: 12, top: 8, fontSize: 11.5, color: P.lbl })}>20 s</span>
          <span style={{ position: 'absolute', left: 12, top: 24, fontSize: 12, fontStyle: 'italic', color: P.lbl }}>Example question</span>
          <span style={{ position: 'absolute', left: 12, right: 12, top: 43, height: 3, borderRadius: 2, background: P.track }}>
            <span ref={timerFillRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', borderRadius: 2, background: P.under }} />
          </span>
        </div>

        <div ref={chatRef} style={box(P, { left: 0, top: 120, width: '64%', height: 96 })}>
          <span style={lbl(P, { left: 10, top: 6, color: 'inherit' })}>typed answers</span>
          <span style={{ position: 'absolute', right: 10, top: 6, fontSize: 10.5, fontStyle: 'italic', color: P.lbl }}>example</span>
          {ANSWERS.map((r, i) => (
            <span key={r.who} ref={rowAt(i)} style={{ position: 'absolute', left: 10, right: 10, top: 28 + i * 20, height: 16, display: 'flex', alignItems: 'center', gap: 8, opacity: 0, transform: 'translateY(6px)', transition: 'opacity .3s ease, transform .4s ease' }}>
              <span style={{ width: 22, ...mono, fontSize: 10.5, color: P.sec }}>{r.who}</span>
              <span style={{ width: r.bar, height: 5, borderRadius: 3, background: P.div }} />
              <span style={{ marginLeft: 'auto', ...mono, fontSize: 10.5, color: P.fg, whiteSpace: 'nowrap' }}>{r.t} s {'·'} {r.pts}</span>
            </span>
          ))}
        </div>

        <div ref={resRef} style={box(P, { left: '68%', top: 120, width: '32%', height: 96 })}>
          <span style={lbl(P, { left: 8, top: 6, color: 'inherit' })}>Result</span>
          {[80, 64, 48].map((w, i) => (
            <span key={w} ref={scorerAt(i)} style={{ position: 'absolute', left: 8, top: 28 + i * 11, width: w + '%', height: 4, borderRadius: 2, background: P.div, opacity: 0, transition: 'opacity .3s ease' }} />
          ))}
          <span ref={ansRef} style={{ position: 'absolute', left: 8, right: 8, top: 66, height: 20, boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 10.5, color: P.lbl, transition: 'border-color .3s ease, color .3s ease' }}>Answer</span>
        </div>

        <span style={lbl(P, { left: 0, top: 224, fontSize: 11 })}>Session total</span>
        <span ref={totalRef} style={lbl(P, { right: 0, top: 224, fontSize: 11, color: P.sec })}>Example: 0 pts</span>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 246, height: 8, display: 'flex', gap: 4 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} ref={cellAt(i)} style={{ flex: 1, boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 2, background: 'transparent' }} />
          ))}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 264, height: 30, display: 'flex', gap: 6 }}>
          {TIERS.map((tt, i) => (
            <div key={tt} ref={chipAt(i)} style={{ ...box(P, { ...centered, position: 'relative', flex: 1, height: 30, fontSize: 10.5 }) }}>{tt}</div>
          ))}
        </div>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}

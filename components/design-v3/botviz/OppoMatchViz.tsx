'use client';

// OppoMatchViz: match day in the Oppo bot. A marshal starts a match (BO1, BO3 or
// BO5), logs a game result, and the bot opens a five-minute acknowledgement
// window. Both teams type "I acknowledge", or the bot fills the missing slot
// itself at five minutes. A dispute pauses the clock. Team names, scores and
// timer digits are examples. One rAF clock writes straight to DOM refs.

import { useLayoutEffect, useRef } from 'react';
import { Caption, clamp01, easeInOut, mono, putCaption, useVizClock, usePaused, type Pal } from '../SystemViz';

const PHASES = [
  'Marshal starts the match',
  'Marshal logs a result',
  'Both teams acknowledge',
  'Dispute pauses the timer',
  'Marshal resolves the dispute',
  'Five minutes, auto-ack',
];

const WINDOW = 300; // five minutes, in seconds
const BO = ['BO1', 'BO3', 'BO5'];

type Ack = '' | 'ack' | 'auto';
type TState = 'idle' | 'run' | 'pause' | 'done';

const fmt = (s: number) => {
  const r = Math.max(0, Math.round(s));
  return Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
};

export default function OppoMatchViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const cmdRef = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLSpanElement | null)[]>([]);
  const chipAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) chips.current[i] = el; };
  const resultRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const disputeRef = useRef<HTMLDivElement>(null);
  const timerBoxRef = useRef<HTMLDivElement>(null);
  const timerTxtRef = useRef<HTMLSpanElement>(null);
  const timerStateRef = useRef<HTMLSpanElement>(null);
  const timerFillRef = useRef<HTMLSpanElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const rows = useRef<(HTMLSpanElement | null)[]>([]); // per row: [dot, text]
  const rowAt = (i: number, k: number) => (el: HTMLSpanElement | null) => { if (el) rows.current[i * 2 + k] = el; };
  const arrowA = useRef<HTMLSpanElement>(null);
  const arrowB = useRef<HTMLSpanElement>(null);
  const pausedTotalRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = PHASES.length;
    const STEP = 3400;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;

    // step 1: best-of chips sweep, then settle on BO3 (the default)
    const sel = a === 0 ? (p < 0.22 ? 0 : p < 0.44 ? 2 : 1) : 1;
    if (cmdRef.current) cmdRef.current.style.borderColor = a === 0 ? P.fg : P.div;
    BO.forEach((_, i) => {
      const el = chips.current[i];
      if (!el) return;
      const on = i === sel;
      el.style.borderColor = on ? (a === 0 ? P.fg : P.frame) : P.div;
      el.style.color = on ? P.fg : P.lbl;
    });

    // result card
    const game = a <= 2 ? 1 : 2;
    const hasResult = a >= 1;
    if (resultRef.current) resultRef.current.style.borderColor = a === 1 || a === 3 ? P.fg : P.div;
    if (gameRef.current) gameRef.current.textContent = hasResult ? 'Game ' + game : 'Game';
    if (scoreRef.current) {
      scoreRef.current.textContent = hasResult ? (game === 1 ? 'TNC 1 - 0 BTK' : 'BTK 0 - 1 TNC') : 'waiting';
      scoreRef.current.style.color = hasResult ? P.fg : P.lbl;
    }

    // timer
    let rem = WINDOW;
    let state: TState = 'idle';
    if (a === 1) { rem = WINDOW - 80 * p; state = 'run'; }
    if (a === 2) { rem = 220 - 30 * clamp01(p / 0.6); state = p >= 0.6 ? 'done' : 'run'; }
    if (a === 3) {
      if (p < 0.5) { rem = WINDOW - 149 * (p / 0.5); state = 'run'; } else { rem = 151; state = 'pause'; }
    }
    if (a === 4) {
      if (p < 0.15) { rem = 151; state = 'pause'; } else { rem = 151 - 60 * ((p - 0.15) / 0.85); state = 'run'; }
    }
    if (a === 5) { rem = 91 * (1 - easeInOut(clamp01(p / 0.8))); state = p >= 0.8 ? 'done' : 'run'; }
    const tColor = state === 'pause' ? P.red : state === 'done' ? P.live : state === 'run' ? P.fg : P.lbl;
    if (timerBoxRef.current) timerBoxRef.current.style.borderColor = state === 'idle' ? P.div : tColor;
    if (timerTxtRef.current) {
      timerTxtRef.current.textContent = fmt(rem);
      timerTxtRef.current.style.color = tColor;
    }
    if (timerStateRef.current) timerStateRef.current.textContent = { idle: 'waiting', run: 'running', pause: 'paused', done: 'stopped' }[state];
    if (timerFillRef.current) {
      timerFillRef.current.style.width = (state === 'idle' ? 0 : ((WINDOW - rem) / WINDOW) * 100).toFixed(1) + '%';
      timerFillRef.current.style.background = tColor;
    }

    // acknowledgements
    let slots: [Ack, Ack] = ['', ''];
    if (a === 2) slots = [p > 0.25 ? 'ack' : '', p > 0.6 ? 'ack' : ''];
    if (a === 5) slots = [p > 0.2 ? 'ack' : '', p >= 0.8 ? 'auto' : ''];
    const count = slots.filter(Boolean).length;
    if (chatRef.current) chatRef.current.style.borderColor = a === 2 || a === 5 ? P.fg : P.div;
    if (countRef.current) countRef.current.textContent = 'Acks ' + count + '/2';
    const teams = ['TNC', 'BTK'];
    slots.forEach((s, i) => {
      const dot = rows.current[i * 2], txt = rows.current[i * 2 + 1];
      if (dot) {
        dot.style.background = s ? (s === 'ack' ? P.live : P.fg) : 'transparent';
        dot.style.borderColor = s ? (s === 'ack' ? P.live : P.fg) : P.under;
      }
      if (txt) {
        txt.textContent = s === 'ack' ? teams[i] + ': I acknowledge' : s === 'auto' ? 'System (Auto-ack)' : 'waiting';
        txt.style.color = s ? P.fg : P.lbl;
      }
    });

    // dispute button
    const filing = a === 3 && p >= 0.5;
    const resolved = a === 4 && p < 0.2;
    if (disputeRef.current) {
      disputeRef.current.style.borderColor = filing ? P.red : resolved ? P.live : P.div;
      disputeRef.current.style.color = filing ? P.red : resolved ? P.live : P.lbl;
      disputeRef.current.textContent = resolved ? 'Resolved' : 'File Dispute';
    }

    // arrows
    const reveal = (el: HTMLSpanElement | null, on: boolean) => {
      if (!el) return;
      el.style.clipPath = on ? 'inset(0 0 0 0)' : 'inset(0 100% 100% 0)';
      el.style.transition = on ? 'clip-path .6s cubic-bezier(.65,0,.35,1)' : 'clip-path .3s ease-in';
    };
    reveal(arrowA.current, a >= 1);
    reveal(arrowB.current, a >= 2);

    // paused total and status label
    const showPaused = (a === 4 && p >= 0.2) || a === 5;
    if (pausedTotalRef.current) {
      pausedTotalRef.current.textContent = 'Paused total 42 s';
      pausedTotalRef.current.style.opacity = showPaused ? '1' : '0';
    }
    let status = '';
    if (a === 0) status = 'Match starts.';
    if (a === 1) status = 'Game 1 posted.';
    if (a === 2) status = p < 0.6 ? 'I acknowledge.' : 'Game 1 final.';
    if (a === 3) status = p < 0.5 ? 'Game 2 posted.' : 'Timer paused.';
    if (a === 4) status = p < 0.2 ? 'Timer paused.' : 'Timer resumed.';
    if (a === 5) status = p < 0.8 ? 'One team missing.' : 'Result final.';
    if (statusRef.current) statusRef.current.textContent = status;

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), PHASES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const box = { position: 'absolute', boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 8, transition: 'border-color .3s ease, color .3s ease' } as const;

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <div ref={cmdRef} style={{ ...box, left: 0, top: 0, width: '46%', height: 84, padding: '10px 12px' }}>
          <span style={{ ...mono, fontSize: 12, color: P.fg }}>/match_start</span>
          <span style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {BO.map((b, i) => (
              <span key={b} ref={chipAt(i)} style={{ ...mono, fontSize: 11, padding: '3px 7px', borderRadius: 4, border: `1px solid ${P.div}`, color: P.lbl, transition: 'border-color .25s ease, color .25s ease' }}>{b}</span>
            ))}
          </span>
        </div>

        <div ref={resultRef} style={{ ...box, left: 0, top: 100, width: '46%', height: 78, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, color: P.lbl }}>Result</span>
          <span ref={gameRef} style={{ ...mono, fontSize: 11, color: P.sec }}>Game</span>
          <span ref={scoreRef} style={{ ...mono, fontSize: 12, color: P.lbl, whiteSpace: 'nowrap' }}>waiting</span>
        </div>

        <div ref={disputeRef} style={{ ...box, left: 0, top: 192, width: '46%', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, color: P.lbl }}>File Dispute</div>

        <div ref={timerBoxRef} style={{ ...box, left: '54%', top: 0, width: '46%', height: 84, padding: '10px 12px' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, color: P.lbl }}>Ack window</span>
            <span ref={timerStateRef} style={{ ...mono, fontSize: 10.5, color: P.lbl }}>waiting</span>
          </span>
          <span ref={timerTxtRef} style={{ display: 'block', ...mono, fontSize: 22, marginTop: 4, color: P.lbl }}>5:00</span>
          <span style={{ display: 'block', position: 'relative', height: 3, borderRadius: 2, background: P.track, marginTop: 8 }}>
            <span ref={timerFillRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.0%', borderRadius: 2, background: P.fg }} />
          </span>
        </div>

        <div ref={chatRef} style={{ ...box, left: '54%', top: 100, width: '46%', height: 116, padding: '10px 12px' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: P.lbl }}>Ack chat</span>
            <span ref={countRef} style={{ ...mono, fontSize: 10.5, color: P.sec }}>Acks 0/2</span>
          </span>
          {[0, 1].map((i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 26 }}>
              <span ref={rowAt(i, 0)} style={{ width: 9, height: 9, flexShrink: 0, boxSizing: 'border-box', borderRadius: 99, border: `1px solid ${P.under}`, background: 'transparent', transition: 'background-color .25s ease, border-color .25s ease' }} />
              <span ref={rowAt(i, 1)} style={{ minWidth: 0, fontSize: 11.5, color: P.lbl, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>waiting</span>
            </span>
          ))}
        </div>

        <span ref={arrowA} style={{ position: 'absolute', left: '23%', top: 84, width: 1, height: 16, background: P.sep, clipPath: 'inset(0 100% 100% 0)' }} />
        <span ref={arrowB} style={{ position: 'absolute', left: '46%', top: 132, width: '8%', height: 1, background: P.sep, clipPath: 'inset(0 100% 100% 0)' }} />

        <span ref={pausedTotalRef} style={{ position: 'absolute', left: 0, top: 234, ...mono, fontSize: 11.5, color: P.sec, opacity: 0, transition: 'opacity .4s ease' }}>Paused total 42 s</span>
        <span ref={statusRef} style={{ position: 'absolute', left: 0, top: 255, fontSize: 13, color: P.sec }} />

        <span style={{ position: 'absolute', left: 0, top: 278, fontSize: 11, fontStyle: 'italic', color: P.lbl }}>example teams and times</span>
        <span style={{ position: 'absolute', right: 0, top: 278, fontSize: 11, color: P.lbl }}>bot checks every 5 s</span>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}

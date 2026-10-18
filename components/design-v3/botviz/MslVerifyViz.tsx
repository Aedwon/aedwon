'use client';

// MslVerifyViz: the member verification flow. A button opens a form, two checks
// run, the sheet cache is matched on UID plus server, roles are granted, and the
// cache reloads every six hours without granting anything. One rAF clock writes
// straight to DOM refs; only `paused` is React state.

import { useLayoutEffect, useRef } from 'react';
import { Caption, clamp01, easeInOut, mono, putCaption, usePaused, useVizClock, type Pal } from '../SystemViz';

const NAMES = ['Member opens the form', 'Checks run in order', 'Sheet matches the pair', 'Account linked', 'MSL role if matched', 'Six-hour cache reload'];

// 0 idle, 1 done, 2 lit, 3 live (green)
type St = 0 | 1 | 2 | 3;
const sBorder = (P: Pal, s: St) => [P.div, P.frame, P.fg, P.live][s];
const sText = (P: Pal, s: St) => [P.lbl, P.sec, P.fg, P.fg][s];

const NODES = [
  { t: 'Verify', l: '0%', top: 0, w: '26%', h: 40 },
  { t: 'Form: 4 fields', l: '34%', top: 0, w: '66%', h: 40 },
  { t: 'Digits check', l: '0%', top: 76, w: '48%', h: 36 },
  { t: 'UID unused', l: '52%', top: 76, w: '48%', h: 36 },
  { t: 'Sheet cache', l: '0%', top: 140, w: '100%', h: 36 },
  { t: 'Verified role', l: '0%', top: 204, w: '30%', h: 36 },
  { t: 'Verified set', l: '35%', top: 204, w: '30%', h: 36 },
  { t: 'MSL role', l: '70%', top: 204, w: '30%', h: 36 },
];

// x/y in the stage; dir h = left to right, v = top to bottom. sa/sp/d = start phase, start progress, span.
const ARROWS = [
  { l: '26%', top: 20, len: '8%', dir: 'h', sa: 0, sp: 0.15, d: 0.2 },
  { l: '50%', top: 40, len: 36, dir: 'v', sa: 1, sp: 0, d: 0.12 },
  { l: '48%', top: 94, len: '4%', dir: 'h', sa: 1, sp: 0.3, d: 0.15 },
  { l: '50%', top: 112, len: 28, dir: 'v', sa: 2, sp: 0, d: 0.15 },
  { l: '50%', top: 176, len: 28, dir: 'v', sa: 3, sp: 0, d: 0.15 },
  { l: '30%', top: 222, len: '5%', dir: 'h', sa: 3, sp: 0.2, d: 0.12 },
  { l: '65%', top: 222, len: '5%', dir: 'h', sa: 4, sp: 0, d: 0.2 },
] as const;

export default function MslVerifyViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const nodeAt = (i: number) => (el: HTMLDivElement | null) => { if (el) nodes.current[i] = el; };
  const arrows = useRef<(HTMLSpanElement | null)[]>([]);
  const arrowAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) arrows.current[i] = el; };
  const markNumRef = useRef<HTMLSpanElement>(null);
  const markUidRef = useRef<HTMLSpanElement>(null);
  const checkLblRef = useRef<HTMLSpanElement>(null);
  const sheetLblRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const timerRowRef = useRef<HTMLDivElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = NAMES.length;
    const STEP = 3400;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;

    const st: St[] = [
      a === 0 ? (p > 0.05 ? 2 : 0) : 1,
      a === 0 ? (p > 0.3 ? 2 : 0) : 1,
      a === 0 ? 0 : a === 1 ? (p < 0.1 ? 0 : p < 0.45 ? 2 : 1) : 1,
      a === 1 ? (p > 0.45 ? 2 : 0) : a > 1 ? 1 : 0,
      a < 2 ? 0 : a === 2 ? (p > 0.15 ? 2 : 0) : a === 5 ? 2 : 1,
      a < 3 ? 0 : a === 3 ? (p > 0.2 ? 3 : 0) : a === 4 ? 3 : 1,
      a < 3 ? 0 : a === 3 ? (p > 0.35 ? 3 : 0) : a === 4 ? 3 : 1,
      a < 4 ? 0 : a === 4 ? (p > 0.2 ? 3 : 0) : 1,
    ];
    st.forEach((s, i) => {
      const el = nodes.current[i];
      if (!el) return;
      el.style.borderColor = sBorder(P, s);
      el.style.color = sText(P, s);
    });

    ARROWS.forEach((ar, i) => {
      const el = arrows.current[i];
      if (!el) return;
      const k = a > ar.sa ? 1 : a === ar.sa ? easeInOut((p - ar.sp) / ar.d) : 0;
      el.style.clipPath = ar.dir === 'h' ? `inset(0 ${((1 - k) * 100).toFixed(1)}% 0 0)` : `inset(0 0 ${((1 - k) * 100).toFixed(1)}% 0)`;
    });

    if (markNumRef.current) markNumRef.current.textContent = (a === 1 && p > 0.2) || a > 1 ? '✓' : '';
    if (markUidRef.current) markUidRef.current.textContent = (a === 1 && p > 0.55) || a > 1 ? '✓' : '';
    if (checkLblRef.current) checkLblRef.current.style.opacity = a === 1 && p > 0.5 ? '1' : '0';
    if (sheetLblRef.current) {
      sheetLblRef.current.textContent = a === 2 ? 'UID plus server' : a === 5 ? 'Cache only' : '';
      sheetLblRef.current.style.opacity = (a === 2 && p > 0.15) || (a === 5 && p > 0.1) ? '1' : '0';
    }
    if (countRef.current) {
      let txt = '';
      if (a === 3 && p > 0.35) txt = p > 0.5 ? 'Example: 1,204 verified' : 'Example: 1,203 verified';
      if (a === 4 && p > 0.2) txt = 'Example: pair matched';
      countRef.current.textContent = txt;
      countRef.current.style.opacity = txt ? '1' : '0';
    }
    if (timerRowRef.current) timerRowRef.current.style.opacity = a === 5 ? String(clamp01(p / 0.15)) : '0';

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), NAMES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const boxStyle = (i: number): React.CSSProperties => ({
    position: 'absolute', left: NODES[i].l, top: NODES[i].top, width: NODES[i].w, height: NODES[i].h, boxSizing: 'border-box',
    border: `1px solid ${P.div}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    ...mono, fontSize: 11, color: P.lbl, whiteSpace: 'nowrap', transition: 'border-color .3s ease, color .3s ease',
  });

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        {ARROWS.map((ar, i) => (
          <span
            key={i}
            ref={arrowAt(i)}
            style={{
              position: 'absolute', left: ar.l, top: ar.top, background: P.sep,
              width: ar.dir === 'h' ? ar.len : 1, height: ar.dir === 'h' ? 1 : ar.len,
              clipPath: ar.dir === 'h' ? 'inset(0 100% 0 0)' : 'inset(0 0 100% 0)',
            }}
          />
        ))}

        {NODES.map((nd, i) => (
          <div key={nd.t} ref={nodeAt(i)} style={i === 4 ? { ...boxStyle(i), justifyContent: 'space-between', padding: '0 12px' } : boxStyle(i)}>
            {i === 4 ? (
              <>
                <span>{nd.t}</span>
                <span ref={sheetLblRef} style={{ opacity: 0, transition: 'opacity .3s ease' }} />
              </>
            ) : i === 2 ? (
              <>
                <span>{nd.t}</span>
                <span ref={markNumRef} />
              </>
            ) : i === 3 ? (
              <>
                <span>{nd.t}</span>
                <span ref={markUidRef} />
              </>
            ) : (
              nd.t
            )}
          </div>
        ))}

        <span ref={checkLblRef} style={{ position: 'absolute', left: 'calc(50% + 8px)', top: 119, ...mono, fontSize: 11, color: P.lbl, opacity: 0, whiteSpace: 'nowrap', transition: 'opacity .3s ease' }}>Example: UID free</span>
        <span ref={countRef} style={{ position: 'absolute', left: 0, right: 0, top: 248, textAlign: 'center', ...mono, fontSize: 11, color: P.sec, opacity: 0, transition: 'opacity .3s ease' }} />
        <div ref={timerRowRef} style={{ position: 'absolute', left: 0, right: 0, top: 274, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: 0 }}>
          <span style={{ ...mono, fontSize: 12, color: P.sec }}>Reload in 05:58</span>
          <span style={{ fontSize: 11, fontStyle: 'italic', color: P.lbl }}>example</span>
        </div>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}

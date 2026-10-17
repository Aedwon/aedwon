'use client';

// SystemViz: the five Pantas system visuals (roadmap, study, content, insights,
// pro). Ported verbatim from SystemViz.dc.html; all motion constants, curves and
// step timings are unchanged, run from one rAF clock per visual writing to DOM
// refs (no setState per frame; only `paused` is state).
//
// The prototype is dark-only; light was designed from spec/tokens.md role rules.
// Dark keeps the prototype's literal hexes (byte-identical); light maps them:
//
//   #0c0c0e  sheet background, split dividers, boxes  -> var(--surface-media)
//   #0c0c0e  text sitting on a filled chip            -> var(--text-on-inverse)
//   #ededed  primary text + filled chips/bars         -> var(--text-primary)
//   #a1a1aa  secondary text                           -> var(--text-secondary)
//   #8a8a93  labels, day names, ticks                 -> var(--text-label)
//   #1f1f24  timer tracks, caption rule               -> var(--line-track)
//   #26262c  default day borders, idle tiles          -> var(--line-hairline-2)
//   #2a2a30  skeleton bars, mocks hairline            -> var(--line-divider)
//   #3a3a42  separators, dashed lines, phone borders  -> var(--line-hover)
//   #4a4a52  inactive choices, pause underline        -> var(--line-underline)
//   #6b6b73  arcs, "said" borders, 25 s marker        -> var(--line-frame)
//   #2e2e35  RevenueCat/server idle borders, off line -> var(--line-bezel)
//   #16161a  content card bodies                      -> var(--surface-sunken)
//   #55555d  "new questions" fill                     -> var(--line-hover)
//   #18181b  off-day border                           -> var(--line-hairline)
//   #1a1a1e  content column rules                     -> var(--line-hairline)
//   #111114  off-day hatch stripe                     -> var(--line-hairline)
//   rgba(237,237,237,.55/.22)  insight bands          -> rgba(17,17,20,.55/.22)
//   #4ade80  right/fast, live                         -> var(--status-live)
//   #f2555a  wrong/slow, gap arrow                    -> #f2555a (unchanged;
//             no red token exists in §2.4 — TODO(owner): pick a light red)

import { useLayoutEffect, useRef, useState, type RefObject, type ReactNode } from 'react';
import { useTheme } from '@/lib/design-v3/theme';

interface Pal {
  bg: string;      // sheet background / punched-through dividers
  fg: string;      // primary text + filled chips and bars
  onFill: string;  // text sitting on a filled chip
  sec: string;     // secondary text
  lbl: string;     // labels, ticks, day names
  red: string;     // wrong / gap
  track: string;   // timer tracks, caption rule
  hair2: string;   // default day borders, idle tiles
  offBorder: string; // off-day border
  colRule: string;   // content column rules
  hatchStripe: string; // off-day hatch stripe
  div: string;     // skeleton bars, mocks hairline
  sep: string;     // separators, dashed lines, phone borders, content idle borders
  under: string;   // inactive choices, pause underline
  frame: string;   // arcs, "said" borders, 25 s marker
  bezel: string;   // RC/server idle borders, off line
  sunken: string;  // content card bodies
  newQ: string;    // "new questions" fill
  live: string;    // right/fast green
  band1: string;   // insight band, first half
  band2: string;   // insight band, second half
}

const DARK: Pal = {
  bg: '#0c0c0e', fg: '#ededed', onFill: '#0c0c0e', sec: '#a1a1aa', lbl: '#8a8a93', red: '#f2555a',
  track: '#1f1f24', hair2: '#26262c', offBorder: '#18181b', colRule: '#1a1a1e', hatchStripe: '#111114',
  div: '#2a2a30', sep: '#3a3a42', under: '#4a4a52', frame: '#6b6b73', bezel: '#2e2e35',
  sunken: '#16161a', newQ: '#55555d', live: '#4ade80',
  band1: 'rgba(237,237,237,0.55)', band2: 'rgba(237,237,237,0.22)',
};

const LIGHT: Pal = {
  bg: 'var(--surface-media)', fg: 'var(--text-primary)', onFill: 'var(--text-on-inverse)',
  sec: 'var(--text-secondary)', lbl: 'var(--text-label)', red: '#f2555a',
  track: 'var(--line-track)', hair2: 'var(--line-hairline-2)', offBorder: 'var(--line-hairline)',
  colRule: 'var(--line-hairline)', hatchStripe: 'var(--line-hairline)',
  div: 'var(--line-divider)', sep: 'var(--line-hover)', under: 'var(--line-underline)',
  frame: 'var(--line-frame)', bezel: 'var(--line-bezel)', sunken: 'var(--surface-sunken)',
  newQ: 'var(--line-hover)', live: 'var(--status-live)',
  band1: 'rgba(17,17,20,0.55)', band2: 'rgba(17,17,20,0.22)',
};

const mono = { fontFamily: "'Geist Mono', monospace" } as const;

const clamp01 = (k: number) => Math.max(0, Math.min(1, k));
const easeInOut = (k: number) => { k = clamp01(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const easeOut = (k: number) => 1 - Math.pow(1 - clamp01(k), 3);

const PH: Record<string, string[]> = {
  roadmap: ['Read the inputs', 'Plan the stretch', 'Order topics', 'Size each day', 'Add reviews', 'Place the mock', 'Split into sittings', 'Freeze today'],
  study: ['Try 1', 'Try 2', 'Try 3', 'Try 4'],
  content: ['Written', 'Checked and blind-solved', 'Sent back, fixed', 'Approved', 'Figure added', 'Shipped in the app'],
  insights: ['early', 'forming', 'clear'],
  pro: ['Signed in', 'Pro on this phone', 'Server confirms Pro', 'Up to date', 'A new answer', 'Pro ends'],
};

// One clock per visual, driven by the display's frame rate (SystemViz 223-241).
// Reduced motion: the loop never starts; a representative still is applied once.
// Each visual computes its own a/p from the clock inside its apply function.
function useVizClock(elapsed: RefObject<number>, raf: RefObject<number>, applyRef: RefObject<() => void>, pausedRef: RefObject<boolean>, reducedRef: RefObject<boolean>, onReduced: () => void) {
  useLayoutEffect(() => {
    const reduced = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reducedRef.current = reduced;
    if (reduced) { onReduced(); applyRef.current?.(); return; }
    applyRef.current?.();
    let last = 0;
    const loop = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(now - last, 100); // cap: a background tab must not jump the clock
      last = now;
      if (!pausedRef.current) elapsed.current += dt;
      applyRef.current?.();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function Caption({ P, numRef, nameRef, paused, onToggle }: { P: Pal; numRef: RefObject<HTMLSpanElement | null>; nameRef: RefObject<HTMLSpanElement | null>; paused: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, paddingTop: 12, borderTop: '1px solid ' + P.track }}>
      <span style={{ fontSize: 13, color: P.sec }}>
        <span ref={numRef} style={{ ...mono, fontSize: 11, color: P.lbl }} />
        {'\u00a0\u00a0'}
        <span ref={nameRef} />
      </span>
      <button onClick={onToggle} style={{ minHeight: 44, padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13, color: P.sec, textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: P.under, cursor: 'pointer' }}>
        {paused ? 'Play' : 'Pause'}
      </button>
    </div>
  );
}

// Play/Pause is the only React state in a visual; the ref mirrors it for the loop.
function usePaused() {
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const toggle = () => setPaused((v) => {
    pausedRef.current = !v;
    return !v;
  });
  return { paused, pausedRef, toggle, setPaused };
}

interface CaptionRefs {
  num: RefObject<HTMLSpanElement | null>;
  name: RefObject<HTMLSpanElement | null>;
}

// Shared caption applier.
function putCaption(refs: CaptionRefs, num: string, name: string) {
  if (refs.num.current) refs.num.current.textContent = num;
  if (refs.name.current) refs.name.current.textContent = name;
}

// ---------------------------------------------------------------- ROADMAP

const RM_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const RM_RO = [9, 10, 11, 12]; // study.slice(-4): the review-only stretch
const RM_MOCK = 11;

function RoadmapViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const orderRef = useRef<HTMLSpanElement>(null);
  const bracketRef = useRef<HTMLSpanElement>(null);
  const colRef = useRef<HTMLDivElement>(null); // today's column border
  const topRef = useRef<HTMLSpanElement>(null);
  const mockLabelRef = useRef<HTMLSpanElement>(null);
  // per col: [les, new, splitA, splitB, rev, mock]
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const barAt = (i: number, k: number) => (el: HTMLSpanElement | null) => { if (el) bars.current[i * 6 + k] = el; };
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = PH.roadmap.length;
    const STEP = 2400;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;
    void p;

    for (let i = 0; i < 14; i++) {
      const off = i % 7 === 6;
      const isRo = RM_RO.includes(i);
      const learn = !off && !isRo;
      const today = i === 0;
      let top = '';
      if (today && a >= 6) top = '5 \u00b7 10 \u00b7 20';
      if (today && a >= 7) top = 'today \u00b7 frozen';
      const g = (k: number) => bars.current[i * 6 + k];
      const les = g(0), nw = g(1), sa = g(2), sb = g(3), rev = g(4), mock = g(5);
      if (les) les.style.height = learn && a >= 3 ? '14px' : '0px';
      if (nw) nw.style.height = learn && a >= 3 ? '42px' : '0px';
      if (sa) sa.style.height = today && a >= 6 ? '2px' : '0px';
      if (sb) sb.style.height = today && a >= 6 ? '2px' : '0px';
      if (rev) {
        rev.style.height = !off && a >= 4 ? Math.min(40, 12 + i * 3) + 'px' : '0px';
        rev.style.border = !off && a >= 4 ? '1px solid ' + P.sec : '0 solid transparent';
      }
      if (mock) mock.style.height = i === RM_MOCK && a >= 5 ? '32px' : '0px';
      if (i === RM_MOCK && mockLabelRef.current) mockLabelRef.current.textContent = a >= 5 ? 'MOCK' : '';
      if (i === 0) {
        if (colRef.current) colRef.current.style.borderColor = a >= 7 ? P.fg : off ? P.offBorder : P.hair2;
        if (topRef.current) {
          topRef.current.textContent = top;
          topRef.current.style.display = top ? 'block' : 'none';
        }
      }
    }

    if (orderRef.current) {
      orderRef.current.style.opacity = a >= 2 ? '1' : '0';
      orderRef.current.style.transform = a >= 2 ? 'translateX(0px)' : 'translateX(-12px)';
    }
    if (bracketRef.current) {
      bracketRef.current.style.opacity = a >= 1 ? '1' : '0';
      bracketRef.current.style.clipPath = a >= 1 ? 'inset(-20px 0 0 0)' : 'inset(-20px 50% 0 50%)';
    }
    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), PH.roadmap[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gap: 5, height: 22 }}>
            <span ref={orderRef} style={{ gridColumn: '1 / 10', gridRow: 1, alignSelf: 'end', fontSize: 11, fontStyle: 'italic', color: P.sec, whiteSpace: 'nowrap', opacity: 0, transform: 'translateX(-12px)', transition: 'opacity .6s ease, transform .9s cubic-bezier(.22,1,.36,1)' }}>{'weakest topics first \u2192'}</span>
            <span ref={bracketRef} style={{ gridRow: 1, gridColumn: `${RM_RO[0] + 1} / ${RM_RO[RM_RO.length - 1] + 2}`, borderTop: `1px solid ${P.lbl}`, borderLeft: `1px solid ${P.lbl}`, borderRight: `1px solid ${P.lbl}`, height: 6, marginTop: 16, opacity: 0, clipPath: 'inset(-20px 50% 0 50%)', transition: 'opacity .4s ease, clip-path .8s cubic-bezier(.65,0,.35,1)', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '50%', top: -17, transform: 'translateX(-50%)', fontSize: 11, fontStyle: 'italic', color: P.sec, whiteSpace: 'nowrap' }}>review only</span>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gap: 5, height: 190 }}>
            {Array.from({ length: 14 }, (_, i) => {
              const off = i % 7 === 6;
              return (
                <div key={i} ref={i === 0 ? colRef : undefined} style={{ position: 'relative', boxSizing: 'border-box', border: `1px solid ${off ? P.offBorder : P.hair2}`, borderRadius: 3, padding: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 3, background: off ? `repeating-linear-gradient(135deg, ${P.hatchStripe} 0 4px, ${P.bg} 4px 8px)` : 'transparent', transition: 'border-color .4s ease' }}>
                  {i === 0 && (
                    <span ref={topRef} style={{ position: 'absolute', left: 0, top: -1, transform: 'translateY(-100%)', paddingBottom: 4, fontSize: 10.5, color: P.fg, whiteSpace: 'nowrap', display: 'none' }} />
                  )}
                  <span ref={barAt(i, 5)} style={{ height: '0px', background: P.fg, borderRadius: 2, transition: `height .8s cubic-bezier(.22,1,.36,1) ${i * 45}ms`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: P.onFill, overflow: 'hidden' }}>
                    {i === RM_MOCK && <span ref={mockLabelRef} />}
                  </span>
                  <span ref={barAt(i, 4)} style={{ height: '0px', boxSizing: 'border-box', border: '0 solid transparent', borderRadius: 2, transition: `height .8s cubic-bezier(.22,1,.36,1) ${i * 45}ms` }} />
                  <span ref={barAt(i, 1)} style={{ height: '0px', background: P.newQ, borderRadius: 2, transition: `height .8s cubic-bezier(.22,1,.36,1) ${i * 45}ms`, position: 'relative', overflow: 'hidden' }}>
                    <span ref={barAt(i, 2)} style={{ position: 'absolute', left: 0, right: 0, top: '33%', height: '0px', background: P.bg }} />
                    <span ref={barAt(i, 3)} style={{ position: 'absolute', left: 0, right: 0, top: '66%', height: '0px', background: P.bg }} />
                  </span>
                  <span ref={barAt(i, 0)} style={{ height: '0px', background: P.fg, borderRadius: 2, transition: `height .8s cubic-bezier(.22,1,.36,1) ${i * 45}ms` }} />
                  {off && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontStyle: 'italic', color: P.lbl }}>off</span>}
                </div>
              );
            })}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderLeft: `1px solid ${P.fg}`, paddingLeft: 6 }}><span style={{ fontSize: 11.5, fontWeight: 600 }}>Exam</span></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gap: 5, ...mono, fontSize: 10, color: P.lbl, textAlign: 'center' }}>
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} style={{ color: i === 0 ? P.fg : P.lbl }}>{RM_NAMES[i % 7]}</span>
            ))}
            <span />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', paddingTop: 4, fontSize: 11.5, color: P.lbl }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: P.fg }} />lessons</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: P.newQ }} />new questions</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, boxSizing: 'border-box', borderRadius: 2, border: `1px solid ${P.sec}` }} />reviews</span>
          </div>
        </div>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}

export default function SystemViz({ which, hintSize }: { which: string; hintSize?: string }) {
  void hintSize;
  const { theme } = useTheme();
  const P = theme === 'light' ? LIGHT : DARK;
  let body: ReactNode;
  if (which === 'study') body = <StudyViz P={P} />;
  else if (which === 'content') body = <ContentViz P={P} />;
  else if (which === 'insights') body = <InsightsViz P={P} />;
  else if (which === 'pro') body = <ProViz P={P} />;
  else body = <RoadmapViz P={P} />;
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: P.bg, color: P.fg, fontFamily: "'Geist', system-ui, sans-serif", display: 'flex', flexDirection: 'column', gap: 16 }}>
      {body}
    </div>
  );
}

// ---------------------------------------------------------------- STUDY

// Four attempts at the same question; intervals are examples, not scheduler output.
const TRIES = [
  { right: true, secs: 12, rating: 'Good', gap: 3, outcome: 'Right, under 25 s. Back in 3 days.' },
  { right: true, secs: 38, rating: 'Hard', gap: 4, outcome: 'Right, but slow. Back a little sooner.' },
  { right: false, secs: 9, rating: 'Again', gap: 1, outcome: 'Wrong. Back tomorrow.' },
  { right: true, secs: 14, rating: 'Good', gap: 5, outcome: 'Right again. The gap grows.' },
];
const ST_DAYS = TRIES.reduce<number[]>((acc, tr) => { acc.push(acc[acc.length - 1] + tr.gap); return acc; }, [0]);
const ST_XS = ST_DAYS.map((d) => (d / 15) * 100);
const ST_CHOICES_W = ['70%', '55%', '80%', '45%'];

function StudyViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const timerFillRef = useRef<HTMLSpanElement>(null);
  const secsRef = useRef<HTMLSpanElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]); // per choice: [ring-dot, bar, mark]
  const dotAt = (i: number, k: number) => (el: HTMLSpanElement | null) => { if (el) dots.current[i * 3 + k] = el; };
  const ratings = useRef<(HTMLSpanElement | null)[]>([]);
  const ratingAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) ratings.current[i] = el; };
  const outcomeRef = useRef<HTMLSpanElement>(null);
  const arcDots = useRef<(HTMLSpanElement | null)[]>([]); // per timeline dot: [dot, label]
  const arcDotAt = (i: number, k: number) => (el: HTMLSpanElement | null) => { if (el) arcDots.current[i * 2 + k] = el; };
  const arcs = useRef<(HTMLSpanElement | null)[]>([]);
  const arcAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) arcs.current[i] = el; };
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = PH.study.length;
    const STEP = 3800;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;

    const cur = TRIES[a];
    const answered = p >= 0.38;
    const rated = p >= 0.5;
    const placed = p >= 0.6;
    const secs = answered ? cur.secs : Math.round(cur.secs * easeOut(p / 0.38));
    const GREEN = P.live, RED = P.red;
    const chosen = cur.right ? 1 : 3;
    const shown = (k: number) => k === 0 || k - 1 < a || (k - 1 === a && placed);

    if (cardRef.current) cardRef.current.style.borderColor = answered ? (cur.right ? GREEN : RED) : P.div;
    const timerColor = secs > 25 ? P.sec : P.fg;
    if (timerFillRef.current) {
      timerFillRef.current.style.width = (Math.min(secs, 40) / 40 * 100).toFixed(1) + '%';
      timerFillRef.current.style.background = timerColor;
    }
    if (secsRef.current) {
      secsRef.current.textContent = String(secs) + ' s';
      secsRef.current.style.color = timerColor;
    }
    for (let i = 0; i < 4; i++) {
      const isChosen = answered && i === chosen;
      const showCorrect = answered && !cur.right && i === 1;
      const col = isChosen ? (cur.right ? GREEN : RED) : showCorrect ? GREEN : P.under;
      const d = dots.current[i * 3], bar = dots.current[i * 3 + 1], mark = dots.current[i * 3 + 2];
      if (d) {
        d.style.borderColor = col;
        d.style.background = isChosen ? col : 'transparent';
        d.style.transform = `scale(${isChosen ? 1.35 : 1})`;
      }
      if (bar) bar.style.background = isChosen || showCorrect ? col : P.div;
      if (mark) {
        mark.textContent = isChosen ? (cur.right ? '\u2713' : '\u2717') : showCorrect ? '\u2713' : '';
        mark.style.color = col;
      }
    }
    ['Again', 'Hard', 'Good', 'Easy'].forEach((r, i) => {
      const el = ratings.current[i];
      if (!el) return;
      const on = rated && r === cur.rating;
      el.style.color = r === 'Easy' ? P.under : on ? P.fg : P.lbl;
      el.style.borderBottomColor = on ? P.fg : 'transparent';
    });
    if (outcomeRef.current) {
      outcomeRef.current.textContent = cur.outcome;
      outcomeRef.current.style.opacity = placed ? '1' : '0';
      outcomeRef.current.style.transform = `translateY(${placed ? '0px' : '6px'})`;
    }
    ST_DAYS.forEach((_, i) => {
      const on = shown(i);
      const dot = arcDots.current[i * 2], label = arcDots.current[i * 2 + 1];
      if (dot) {
        dot.style.opacity = on ? '1' : '0';
        dot.style.transform = `scale(${on ? 1 : 0.2})`;
        // the dot lands right as its arc finishes drawing
        dot.style.transition = on
          ? 'opacity .2s ease .55s, transform .55s cubic-bezier(.34,1.56,.64,1) .55s'
          : 'opacity .3s ease, transform .3s ease';
      }
      if (label) {
        label.style.opacity = on ? '1' : '0';
        label.style.transform = `translate(-50%, ${on ? '0px' : '6px'})`;
        label.style.transition = on
          ? 'opacity .4s ease .7s, transform .6s cubic-bezier(.22,1,.36,1) .7s'
          : 'opacity .3s ease, transform .3s ease';
      }
    });
    ST_DAYS.slice(1).forEach((_, i) => {
      const el = arcs.current[i];
      if (!el) return;
      const on = shown(i + 1);
      el.style.clipPath = on ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)';
      el.style.transition = on ? 'clip-path .7s cubic-bezier(.65,0,.35,1)' : 'clip-path .35s ease-in';
    });

    const stepName = cur.right ? (cur.secs > 25 ? 'Right, slow \u2192 Hard' : 'Right, fast \u2192 Good') : 'Wrong \u2192 Again';
    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), stepName);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <div ref={cardRef} style={{ position: 'absolute', left: 0, top: 0, width: '44%', boxSizing: 'border-box', padding: 14, border: `1px solid ${P.div}`, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8, transition: 'border-color .3s ease' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, height: 3, borderRadius: 2, background: P.track, position: 'relative' }}>
              <span ref={timerFillRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.0%', borderRadius: 2, background: P.fg }} />
              <span style={{ position: 'absolute', left: '62.5%', top: -4, width: 1, height: 11, background: P.frame }} />
              <span style={{ position: 'absolute', left: '62.5%', top: 9, transform: 'translateX(-50%)', ...mono, fontSize: 9.5, color: P.lbl }}>25 s</span>
            </span>
            <span style={{ width: 34, textAlign: 'right', ...mono, fontSize: 11.5 }}>
              <span ref={secsRef} style={{ color: P.fg }}>0 s</span>
            </span>
          </span>
          <span style={{ height: 6, width: '90%', borderRadius: 3, background: P.div, marginTop: 12 }} />
          <span style={{ height: 6, width: '60%', borderRadius: 3, background: P.div, marginBottom: 4 }} />
          {ST_CHOICES_W.map((w, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span ref={dotAt(i, 0)} style={{ width: 9, height: 9, flexShrink: 0, borderRadius: 99, boxSizing: 'border-box', border: `1px solid ${P.under}`, background: 'transparent', transform: 'scale(1)', transition: 'background-color .25s ease, border-color .25s ease, transform .5s cubic-bezier(.34,1.56,.64,1)' }} />
              <span ref={dotAt(i, 1)} style={{ height: 5, width: w, borderRadius: 3, background: P.div, transition: 'background-color .3s ease' }} />
              <span ref={dotAt(i, 2)} style={{ fontSize: 11, color: P.under }} />
            </span>
          ))}
        </div>
        <div style={{ position: 'absolute', left: '52%', top: 0, display: 'flex', gap: 14, ...mono, fontSize: 11.5 }}>
          {['Again', 'Hard', 'Good', 'Easy'].map((r, i) => (
            <span key={r} ref={ratingAt(i)} style={{ color: P.lbl, borderBottom: '1px solid transparent', paddingBottom: 3, transition: 'color .3s ease, border-color .3s ease' }}>{r}</span>
          ))}
        </div>
        <span ref={outcomeRef} style={{ position: 'absolute', left: '52%', top: 40, fontSize: 12.5, lineHeight: 1.6, color: P.sec, opacity: 0, transform: 'translateY(6px)', transition: 'opacity .45s ease, transform .6s cubic-bezier(.22,1,.36,1)' }}>{TRIES[0].outcome}</span>
        {ST_DAYS.slice(1).map((_, i) => {
          const w = ST_XS[i + 1] - ST_XS[i];
          const h = Math.min(80, 16 + w * 1.7);
          return (
            <span
              key={i}
              ref={arcAt(i)}
              style={{ position: 'absolute', left: ST_XS[i] + '%', width: w + '%', top: (240 - h) + 'px', height: h + 'px', boxSizing: 'border-box', border: `1px solid ${P.frame}`, borderBottom: 'none', borderRadius: '50% 50% 0 0 / 100% 100% 0 0', clipPath: 'inset(0 100% 0 0)', transition: 'clip-path .35s ease-in' }}
            />
          );
        })}
        <span style={{ position: 'absolute', left: 0, right: 0, top: 240, height: 1, background: P.sep }} />
        {ST_DAYS.map((d, i) => (
          <span key={'d' + i}>
            <span ref={arcDotAt(i, 0)} style={{ position: 'absolute', left: ST_XS[i] + '%', top: 235, width: 11, height: 11, marginLeft: -5.5, borderRadius: 99, background: P.fg, opacity: i === 0 ? 1 : 0, transform: `scale(${i === 0 ? 1 : 0.2})`, transition: 'opacity .3s ease, transform .3s ease' }} />
            <span ref={arcDotAt(i, 1)} style={{ position: 'absolute', left: ST_XS[i] + '%', top: 214, transform: 'translate(-50%, 6px)', ...mono, fontSize: 10.5, color: P.sec, opacity: i === 0 ? 1 : 0, transition: 'opacity .3s ease, transform .3s ease' }}>{i === 0 ? 'now' : '+' + TRIES[i - 1].gap + 'd'}</span>
          </span>
        ))}
        {([['today', 0], ['+5 d', 33.3], ['+10 d', 66.7], ['+15 d', 100]] as [string, number][]).map(([tt, x], i) => (
          <span key={tt} style={{ position: 'absolute', left: x + '%', top: 254, transform: i === 0 ? 'none' : i === 3 ? 'translateX(-100%)' : 'translateX(-50%)', ...mono, fontSize: 10, color: P.lbl }}>{tt}</span>
        ))}
        <span style={{ position: 'absolute', left: 0, top: 278, fontSize: 11, fontStyle: 'italic', color: P.lbl }}>example intervals</span>
        <span style={{ position: 'absolute', right: 0, top: 278, fontSize: 11, fontStyle: 'italic', color: P.lbl }}>per-student tuning: planned</span>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}
// ---------------------------------------------------------------- CONTENT

const CT_N = 8;
const CT_BACK = [2, 6];
const CT_FIG = 4;

function ContentViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const colHeads = useRef<(HTMLSpanElement | null)[]>([]);
  const colHeadAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) colHeads.current[i] = el; };
  const appBorderRef = useRef<HTMLSpanElement>(null);
  const laneBorderRef = useRef<HTMLSpanElement>(null);
  const laneColorRef = useRef<HTMLSpanElement>(null);
  // per card: [card, lineA, lineB]
  const cards = useRef<(HTMLSpanElement | null)[]>([]);
  const cardAt = (i: number, k: number) => (el: HTMLSpanElement | null) => { if (el) cards.current[i * 3 + k] = el; };
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = PH.content.length;
    const STEP = 2400;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;

    const colOf = (i: number): number | 'lane' => {
      if (a === 0) return 0;
      if (a === 1) return CT_BACK.includes(i) ? 0 : 1;
      if (a === 2) return 1;
      if (a === 3) return i === CT_FIG ? 'lane' : 2;
      if (a === 4) return i === CT_FIG && p < 0.4 ? 'lane' : 2;
      return 3;
    };
    const cols = Array.from({ length: CT_N }, (_, i) => colOf(i));
    const activeCol = [0, 1, 1, 2, 2, 3][a];

    cols.forEach((c, i) => {
      const red = CT_BACK.includes(i) && (a === 1 || (a === 2 && p < 0.3));
      const lane = c === 'lane';
      const approved = !lane && typeof c === 'number' && c >= 2;
      const slot = lane ? 0 : cols.slice(0, i).filter((x) => x === c).length;
      const card = cards.current[i * 3], lineA = cards.current[i * 3 + 1], lineB = cards.current[i * 3 + 2];
      if (card) {
        card.style.left = lane ? '50%' : (c as number) * 25 + '%';
        card.style.top = lane ? '240px' : (30 + slot * 25) + 'px';
        card.style.border = `1px ${lane ? 'dashed' : 'solid'} ${red ? P.red : lane ? P.lbl : approved ? P.fg : P.sep}`;
        card.style.background = approved ? P.fg : lane || red ? 'transparent' : P.sunken;
        card.style.opacity = a === 0 ? (p > (i / CT_N) * 0.6 ? '1' : '0') : '1';
        card.style.transform = `scale(${a === 0 ? (p > (i / CT_N) * 0.6 ? 1 : 0.6) : 1})`;
      }
      if (lineA) lineA.style.background = approved ? P.lbl : red ? P.red : P.under;
      if (lineB) lineB.style.background = approved ? P.lbl : red ? P.red : P.under;
    });

    ['Written', 'Checked', 'Approved', 'In the app'].forEach((tt, i) => {
      const el = colHeads.current[i];
      if (el) el.style.color = i === activeCol ? P.fg : P.lbl;
    });
    if (appBorderRef.current) appBorderRef.current.style.borderColor = a === 5 ? P.fg : 'transparent';
    if (laneBorderRef.current) laneBorderRef.current.style.borderColor = a === 3 || a === 4 ? P.lbl : P.hair2;
    if (laneColorRef.current) laneColorRef.current.style.color = a === 3 || a === 4 ? P.fg : P.lbl;

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), PH.content[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        {['Written', 'Checked', 'Approved', 'In the app'].map((tt, i) => (
          <div key={tt} style={{ position: 'absolute', left: i * 25 + '%', top: 0, width: '25%', height: 300, boxSizing: 'border-box', borderLeft: i === 0 ? 'none' : `1px solid ${P.colRule}`, paddingLeft: 12 }}>
            <span ref={colHeadAt(i)} style={{ fontSize: 12, color: i === 0 ? P.fg : P.lbl, transition: 'color .3s ease' }}>{tt}</span>
          </div>
        ))}
        <span ref={appBorderRef} style={{ position: 'absolute', left: '75%', top: -2, width: '25%', height: 286, boxSizing: 'border-box', border: '1px solid transparent', borderRadius: 8, transition: 'border-color .5s ease' }} />
        <span ref={laneBorderRef} style={{ position: 'absolute', left: '50%', top: 236, width: 'calc(25% - 12px)', marginLeft: 6, height: 30, boxSizing: 'border-box', border: `1px dashed ${P.hair2}`, borderRadius: 6, transition: 'border-color .3s ease' }} />
        <span ref={laneColorRef} style={{ position: 'absolute', left: '50%', top: 272, marginLeft: 12, fontSize: 11, fontStyle: 'italic', color: P.lbl, transition: 'color .3s ease' }}>needs a figure</span>
        {Array.from({ length: CT_N }, (_, i) => (
          <span
            key={i}
            ref={cardAt(i, 0)}
            style={{ position: 'absolute', left: '0%', top: (30 + i * 25) + 'px', width: 'calc(25% - 24px)', marginLeft: 12, height: 22, boxSizing: 'border-box', borderRadius: 4, border: `1px solid ${P.sep}`, background: P.sunken, opacity: 0, transform: 'scale(0.6)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', transition: `left .75s cubic-bezier(.34,1.25,.64,1) ${i * 50}ms, top .75s cubic-bezier(.34,1.25,.64,1) ${i * 50}ms, background-color .35s ease ${i * 50}ms, border-color .35s ease ${i * 50}ms, opacity .35s ease, transform .5s cubic-bezier(.34,1.56,.64,1)` }}
          >
            <span ref={cardAt(i, 1)} style={{ height: 3, width: '40%', borderRadius: 2, background: P.under }} />
            <span ref={cardAt(i, 2)} style={{ height: 3, width: '22%', borderRadius: 2, background: P.under }} />
          </span>
        ))}
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}
// ---------------------------------------------------------------- INSIGHTS

// Example student, CSE Professional mocks (170 items, 85 per half).
// True habit is fixed: ~82% first half, ~71% second half. Each row = correct
// answers [first half, second half] in one mock.
const INS_MOCKS = [[70, 60], [69, 61], [70, 60], [69, 60], [70, 61], [70, 60], [69, 60]];
const INS_DAYS = [2, 6, 9, 13, 17, 21, 25];
const INS_HALF = 85;
const INS_HABIT = [0.82, 0.71];
const INS_PRE = 1800, INS_MOCK_DUR = 1500, INS_HOLD = 2800;
const INS_TOTAL = INS_PRE + INS_MOCKS.length * INS_MOCK_DUR + INS_HOLD;
// shared accuracy scale (ranges narrow around a fixed true habit)
const INS_SCALE_L = 34;
const INS_X = (v: number) => Math.max(0, Math.min(100, (v - 0.6) / 0.3 * 100));
const inScale = (v: number) => `calc(${INS_SCALE_L}px + (100% - ${INS_SCALE_L}px) * ${(INS_X(v) / 100).toFixed(4)})`;
const widthOf = (a1: number, b1: number) => `calc((100% - ${INS_SCALE_L}px) * ${((INS_X(b1) - INS_X(a1)) / 100).toFixed(4)})`;
const INS_REASONS = ['Finish one full length mock', 'Enough answers to judge, but the ranges still overlap.', 'The ranges no longer overlap.'];

function InsightsViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const states = useRef<(HTMLSpanElement | null)[]>([]);
  const stateAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) states.current[i] = el; };
  const reasonRef = useRef<HTMLSpanElement>(null);
  // per col: [pct, n, ...60 dots]
  const colEls = useRef<(HTMLSpanElement | null)[]>([]);
  const colElAt = (c: number, k: number) => (el: HTMLSpanElement | null) => { if (el) colEls.current[c * 62 + k] = el; };
  // per lane: [band, mid]
  const lanes = useRef<(HTMLSpanElement | null)[]>([]);
  const laneAt = (c: number, k: number) => (el: HTMLSpanElement | null) => { if (el) lanes.current[c * 2 + k] = el; };
  const sentenceRef = useRef<HTMLSpanElement>(null);
  const gapRef = useRef<HTMLSpanElement>(null);
  const mocks = useRef<(HTMLSpanElement | null)[]>([]);
  const mockAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) mocks.current[i] = el; };
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = PH.insights.length;
    void n;
    const el = elapsed.current;
    // reduced motion shows the settled end state: every mock taken, ranges clear
    const ti = reduced ? INS_TOTAL - 1 : el % INS_TOTAL;

    let m = 0, q = 1;
    if (ti >= INS_PRE) {
      const idx = Math.floor((ti - INS_PRE) / INS_MOCK_DUR);
      if (idx >= INS_MOCKS.length) { m = INS_MOCKS.length; q = 1; }
      else { m = idx + 1; q = easeInOut(((ti - INS_PRE) % INS_MOCK_DUR) / (INS_MOCK_DUR * 0.6)); }
    }
    const done = q >= 1 ? m : m - 1;
    const sum = (k: number, side: number) => INS_MOCKS.slice(0, k).reduce((s, r) => s + r[side], 0);
    const nAns = done * INS_HALF;
    const c = [sum(done, 0), sum(done, 1)];
    const p = c.map((x) => (nAns ? x / nAns : 0));
    // Ranges drawn at ~84% so that "ranges stop overlapping" matches a 95% two-proportion z-test.
    const half = p.map((x) => (nAns ? 1.405 * Math.sqrt(x * (1 - x) / nAns) : 0));
    let state = 0;
    if (done > 0) {
      const pp = (c[0] + c[1]) / (2 * nAns);
      const z = (p[0] - p[1]) / Math.sqrt(pp * (1 - pp) * (2 / nAns));
      state = Math.abs(z) >= 1.96 ? 2 : 1;
    }
    const partial = m > done ? q : 0;

    ['early', 'forming', 'clear'].forEach((s, i) => {
      const e = states.current[i];
      if (!e) return;
      e.style.color = i === state ? P.fg : P.lbl;
      e.style.borderBottomColor = i === state ? P.fg : 'transparent';
    });
    if (reasonRef.current) reasonRef.current.textContent = INS_REASONS[state];

    for (let side = 0; side < 2; side++) {
      const answers = done * INS_HALF + Math.round(partial * INS_HALF);
      const correct = c[side] + Math.round(partial * (m > 0 ? INS_MOCKS[m - 1][side] : 0));
      const dotsShown = Math.round(answers / 10);
      const filled = Math.round(correct / 10);
      const pct = colEls.current[side * 62], nEl = colEls.current[side * 62 + 1];
      if (pct) pct.textContent = nAns ? String(Math.round(p[side] * 100)) + '%' : '\u2014';
      if (nEl) nEl.textContent = String(answers);
      // fixed 60 slots so each new dot can pop in instead of the grid re-rendering
      for (let i = 0; i < 60; i++) {
        const d = colEls.current[side * 62 + 2 + i];
        if (!d) continue;
        d.style.background = i < filled ? P.fg : 'transparent';
        d.style.opacity = i < dotsShown ? '1' : '0';
        d.style.transform = `scale(${i < dotsShown ? 1 : 0.2})`;
      }
      const band = lanes.current[side * 2], mid = lanes.current[side * 2 + 1];
      if (band) {
        band.style.left = inScale(p[side] - half[side]);
        band.style.width = widthOf(p[side] - half[side], p[side] + half[side]);
        band.style.opacity = nAns ? '1' : '0';
      }
      if (mid) {
        mid.style.left = inScale(p[side]);
        mid.style.opacity = nAns ? '1' : '0';
      }
    }

    if (sentenceRef.current) {
      sentenceRef.current.style.opacity = state === 2 ? '1' : '0';
      sentenceRef.current.style.transform = `translateY(${state === 2 ? '0px' : '8px'})`;
    }
    if (gapRef.current) gapRef.current.textContent = String(Math.round((p[0] - p[1]) * 100)) + '%';
    INS_DAYS.forEach((_, i) => {
      const e = mocks.current[i];
      if (!e) return;
      e.style.borderColor = i < m ? P.fg : P.sep;
      e.style.background = i < done ? P.fg : 'transparent';
      e.style.transform = `scale(${i < m ? 1.15 : 1})`;
    });

    // the example caption replaces the step counter entirely
    putCaption({ num: captionNumRef, name: captionNameRef }, '', 'Example student \u00b7 CSE mocks, 170 items each');
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 340 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Stamina <span style={{ fontWeight: 400, color: P.lbl }}>first half vs. second half</span></span>
          <span style={{ ...mono, fontSize: 11, color: P.lbl }}>Pro</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 14px', fontSize: 12.5 }}>
          <span style={{ display: 'flex', gap: 10, ...mono, fontSize: 11.5 }}>
            {['early', 'forming', 'clear'].map((s, i) => (
              <span key={s} ref={stateAt(i)} style={{ color: P.lbl, borderBottom: '1px solid transparent', paddingBottom: 2, transition: 'color .3s ease, border-color .3s ease' }}>{s}</span>
            ))}
          </span>
          <span ref={reasonRef} style={{ color: P.sec }} />
        </div>

        {/* the two columns */}
        {[0, 1].map((side) => (
          <div key={side} style={{ position: 'absolute', left: side === 0 ? '0%' : '54%', top: 66, width: '46%', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 92 }}>
              <span style={{ fontSize: 12, color: P.lbl }}>{side === 0 ? 'first half' : 'second half'}</span>
              <span ref={colElAt(side, 0)} style={{ ...mono, fontSize: 26, letterSpacing: '-0.02em', color: P.fg }}>{'\u2014'}</span>
              <span style={{ fontSize: 10.5, color: P.lbl }}>answers so far: <span ref={colElAt(side, 1)}>0</span></span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: 128, paddingTop: 4 }}>
              {Array.from({ length: 60 }, (_, i) => (
                <span key={i} ref={colElAt(side, 2 + i)} style={{ width: 7, height: 7, boxSizing: 'border-box', borderRadius: 99, border: `1px solid ${P.sec}`, background: 'transparent', opacity: 0, transform: 'scale(0.2)', transition: 'opacity .25s ease, transform .45s cubic-bezier(.34,1.56,.64,1), background-color .3s ease' }} />
              ))}
            </div>
          </div>
        ))}

        {/* shared accuracy scale: ranges narrow around a fixed true habit */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 158, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: P.lbl }}>
          <span>accuracy · range of what this could be</span>
          <span>┆ true habit (example)</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 180, height: 52 }}>
          {[0, 1].map((side) => (
            <span key={side}>
              <span style={{ position: 'absolute', left: 0, top: side * 26 + 2 + 'px', fontSize: 10.5, color: P.lbl, lineHeight: '12px' }}>{side === 0 ? '1st' : '2nd'}</span>
              <span style={{ position: 'absolute', left: inScale(INS_HABIT[side]), top: side * 26 - 3 + 'px', height: 18, borderLeft: `1px dashed ${P.lbl}` }} />
              <span ref={laneAt(side, 0)} style={{ position: 'absolute', left: '0%', width: '0%', top: side * 26 + 2 + 'px', height: 8, borderRadius: 2, background: side === 0 ? P.band1 : P.band2, opacity: 0, transition: 'left 1s cubic-bezier(.22,1,.36,1), width 1s cubic-bezier(.22,1,.36,1), opacity .5s ease' }} />
              <span ref={laneAt(side, 1)} style={{ position: 'absolute', left: '0%', top: side * 26 - 1 + 'px', width: 2, height: 14, marginLeft: -1, background: P.fg, opacity: 0, transition: 'left 1s cubic-bezier(.22,1,.36,1), opacity .5s ease' }} />
            </span>
          ))}
        </div>
        {([['60%', 0.6], ['70%', 0.7], ['80%', 0.8], ['90%', 0.9]] as [string, number][]).map(([t2, v]) => (
          <span key={t2} style={{ position: 'absolute', left: inScale(v), top: 234, transform: 'translateX(-50%)', ...mono, fontSize: 10, color: P.lbl }}>{t2}</span>
        ))}

        {/* the sentence, only when clear */}
        <span ref={sentenceRef} style={{ position: 'absolute', left: 0, top: 260, fontSize: 13.5, color: P.fg, opacity: 0, transform: 'translateY(8px)', transition: 'opacity .6s ease, transform .8s cubic-bezier(.22,1,.36,1)' }}>
          <span style={{ color: P.red }}>↓</span> Accuracy drops <span ref={gapRef} style={{ color: P.red }}>0%</span> in the second half of a mock.
        </span>

        {/* mocks taken over 28 days */}
        <span style={{ position: 'absolute', left: 0, top: 292, fontSize: 11, color: P.lbl }}>mocks taken</span>
        <span style={{ position: 'absolute', left: 84, right: 0, top: 299, height: 1, background: P.div }} />
        <div style={{ position: 'absolute', left: 84, right: 0, top: 292, height: 40 }}>
          {INS_DAYS.map((d, i) => (
            <span key={i} ref={mockAt(i)} style={{ position: 'absolute', left: d / 28 * 100 + '%', top: 3, width: 9, height: 9, marginLeft: -4.5, boxSizing: 'border-box', borderRadius: 2, border: `1px solid ${P.sep}`, background: 'transparent', transform: 'scale(1)', transition: 'background-color .3s ease, border-color .3s ease, transform .5s cubic-bezier(.34,1.56,.64,1)' }} />
          ))}
          <span style={{ position: 'absolute', left: 0, top: 18, ...mono, fontSize: 10, color: P.lbl }}>day 0</span>
          <span style={{ position: 'absolute', left: '50%', top: 18, transform: 'translateX(-50%)', ...mono, fontSize: 10, color: P.lbl }}>day 14</span>
          <span style={{ position: 'absolute', right: 0, top: 18, ...mono, fontSize: 10, color: P.lbl }}>day 28</span>
        </div>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}
// ---------------------------------------------------------------- PRO

// 0 signed in \u00b7 1 Pro on the phone (activating) \u00b7 2 server confirms, first upload
// 3 up to date, second phone catches up \u00b7 4 a new answer, 5 s wait, upload \u00b7 5 Pro ends, backup stops

function ProViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  // per check: [chip, mark]
  const checks = useRef<(HTMLSpanElement | null)[]>([]);
  const checkAt = (i: number, k: number) => (el: HTMLSpanElement | null) => { if (el) checks.current[i * 2 + k] = el; };
  const rcRef = useRef<HTMLSpanElement>(null);
  const rcTextRef = useRef<HTMLSpanElement>(null);
  const svRef = useRef<HTMLSpanElement>(null);
  const svTextRef = useRef<HTMLSpanElement>(null);
  const cpRef = useRef<HTMLSpanElement>(null);
  const lineLRef = useRef<HTMLSpanElement>(null);
  const lineRRef = useRef<HTMLSpanElement>(null);
  const boxBorders = useRef<(HTMLDivElement | null)[]>([]); // only the backup box's border animates
  // per box: 12 tiles
  const tiles = useRef<(HTMLSpanElement | null)[]>([]);
  const tileAt = (b: number, i: number) => (el: HTMLSpanElement | null) => { if (el) tiles.current[b * 12 + i] = el; };
  const packets = useRef<(HTMLSpanElement | null)[]>([]);
  const packetAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) packets.current[i] = el; };
  const statusRef = useRef<HTMLSpanElement>(null);
  const waitRowRef = useRef<HTMLDivElement>(null);
  const waitBarRef = useRef<HTMLSpanElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = PH.pro.length;
    const STEP = 2800;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? 3 : Math.floor(t / STEP); // reduced shows "up to date"
    const p = reduced ? 1 : (t % STEP) / STEP;

    const signed = a > 0 || p > 0.3;
    const proOn = (a > 1 || (a === 1 && p > 0.72)) && !(a === 5 && p > 0.25);
    const flag = (a > 2 || (a === 2 && p > 0.68)) && !(a === 5 && p > 0.25);
    const on = signed && proOn && flag;
    const pulse = 0.55 + 0.45 * Math.cos(elapsed.current / 180);
    let status = 'off', statusOp = 1;
    if (a === 1 && p > 0.72) { status = 'activating\u2026'; statusOp = pulse; }
    if (a === 2) { status = p > 0.68 ? 'syncing' : 'activating\u2026'; statusOp = p > 0.68 ? 1 : pulse; }

    // Pro confirmation dot: phone \u2192 RevenueCat \u2192 phone (step 1), RevenueCat \u2192 server \u2192 phone (step 2)
    let cpX = '52px', cpY = '72px', cpOp = 0;
    const toRc = (k: number) => { cpX = `calc(52px + (50% - 147px) * ${k.toFixed(4)})`; cpY = (72 - 25 * k) + 'px'; };
    const rcToSv = (k: number) => { cpX = `calc(50% - 95px + ${(190 * k).toFixed(1)}px)`; cpY = '47px'; };
    const svToPhone = (k: number) => { cpX = `calc(52px + (50% + 43px) * ${(1 - k).toFixed(4)})`; cpY = (47 + 25 * k) + 'px'; };
    if (a === 1) {
      if (p < 0.35) { toRc(easeInOut(p / 0.35)); cpOp = 1; }
      else if (p < 0.72) { toRc(1 - easeInOut((p - 0.35) / 0.37)); cpOp = 1; }
    }
    if (a === 2) {
      if (p < 0.33) { rcToSv(easeInOut(p / 0.33)); cpOp = 1; }
      else if (p < 0.68) { svToPhone(easeInOut((p - 0.33) / 0.35)); cpOp = 1; }
    }
    const rcSaid = (a === 1 && p > 0.35) || (a >= 2 && !(a === 5 && p > 0.25));
    const rcBusy = (a === 1 && p > 0.25 && p < 0.5) || (a === 2 && p < 0.1);
    const svSet = (a === 2 && p > 0.33) || (a > 2 && !(a === 5 && p > 0.25));
    const svBusy = a === 2 && p > 0.25 && p < 0.45;
    if (a === 3) status = p < 0.55 ? 'syncing' : 'up to date \u2713';
    if (a === 4) status = p > 0.55 && p < 0.95 ? 'syncing' : 'up to date \u2713';
    if (a === 5) status = p > 0.25 ? 'off \u00b7 data stays on this phone' : 'up to date \u2713';

    // how many answers each place holds
    const mine = a === 5 || (a === 4 && p > 0.08) ? 9 : 8;
    let cloud = 0;
    if (a === 2) cloud = Math.round(8 * easeInOut((p - 0.72) / 0.26));
    if (a === 3) cloud = 8;
    if (a === 4) cloud = p > 0.75 ? 9 : 8;
    if (a === 5) cloud = 9;
    let other = 0;
    if (a === 3) other = Math.round(8 * easeInOut((p - 0.1) / 0.5));
    if (a === 4) other = p > 0.95 ? 9 : 8;
    if (a === 5) other = 9;
    const tileVals = [mine, cloud, other];

    // packets travel along the line: left segment = phone \u2192 backup, right segment = backup \u2192 second phone
    const leftSeg = (k: number) => `calc(104px + (50% - 166px) * ${clamp01(k).toFixed(4)})`;
    const rightSeg = (k: number) => `calc(50% + 62px + (50% - 166px) * ${clamp01(k).toFixed(4)})`;
    const packetVals = [0, 1, 2].map((i) => {
      const off = i * 0.15;
      if (a === 2) { const k = easeInOut((p - 0.7 - off * 0.5) / 0.2); return { left: leftSeg(k), op: k > 0 && k < 1 ? 1 : 0 }; }
      if (a === 3) { const k = easeInOut((p - off) / 0.4); return { left: rightSeg(k), op: k > 0 && k < 1 ? 1 : 0 }; }
      if (a === 4 && i === 0) {
        if (p < 0.75) { const k = easeInOut((p - 0.55) / 0.2); return { left: leftSeg(k), op: k > 0 && k < 1 ? 1 : 0 }; }
        const k = easeInOut((p - 0.75) / 0.2); return { left: rightSeg(k), op: k > 0 && k < 1 ? 1 : 0 };
      }
      return { left: '0px', op: 0 };
    });

    const check = (t2: string, ok: boolean) => ({ t: t2, mark: ok ? '\u2713' : '', bg: ok ? P.fg : 'transparent', border: ok ? P.fg : P.under, color: ok ? P.fg : P.lbl, s: ok ? 1 : 0.9 });
    const checkVals = [check('Signed in with Google', signed), check('Pro on this phone', proOn), check('Pro confirmed by server', flag)];
    checkVals.forEach((ck, i) => {
      const chip = checks.current[i * 2], mark = checks.current[i * 2 + 1];
      if (chip) {
        chip.style.background = ck.bg;
        chip.style.borderColor = ck.border;
        chip.style.transform = `scale(${ck.s})`;
      }
      if (mark) {
        mark.textContent = ck.mark;
        mark.style.color = P.onFill;
      }
      const span = chip?.parentElement;
      if (span) span.style.color = ck.color;
    });
    if (rcRef.current) {
      rcRef.current.style.borderColor = rcBusy ? P.fg : rcSaid ? P.frame : P.bezel;
      rcRef.current.style.color = rcBusy || rcSaid ? P.fg : P.lbl;
    }
    if (rcTextRef.current) rcTextRef.current.textContent = rcSaid ? 'RevenueCat \u00b7 Pro' : 'RevenueCat';
    if (svRef.current) {
      svRef.current.style.borderColor = svBusy ? P.fg : svSet ? P.frame : P.bezel;
      svRef.current.style.color = svBusy || svSet ? P.fg : P.lbl;
    }
    if (svTextRef.current) svTextRef.current.textContent = svSet ? 'server \u00b7 pro \u2713' : 'server';
    if (cpRef.current) {
      cpRef.current.style.left = cpX;
      cpRef.current.style.top = cpY;
      cpRef.current.style.opacity = String(cpOp);
    }
    for (const el of [lineLRef.current, lineRRef.current]) {
      if (!el) continue;
      el.style.borderTopStyle = on ? 'solid' : 'dashed';
      el.style.borderTopColor = on ? P.lbl : P.bezel;
    }
    tileVals.forEach((count, b) => {
      const bx = boxBorders.current[b];
      if (b === 1 && bx) bx.style.borderColor = on ? P.lbl : P.bezel;
      for (let i = 0; i < 12; i++) {
        const tl = tiles.current[b * 12 + i];
        if (!tl) continue;
        tl.style.background = i < count ? P.fg : 'transparent';
        tl.style.borderColor = i < count ? P.fg : P.hair2;
        tl.style.transform = `scale(${i < count ? 1 : 0.85})`;
      }
    });
    packetVals.forEach((pk, i) => {
      const e = packets.current[i];
      if (!e) return;
      e.style.left = pk.left;
      e.style.opacity = String(pk.op);
    });
    if (statusRef.current) {
      statusRef.current.textContent = status;
      statusRef.current.style.color = status.indexOf('off') === 0 ? P.lbl : P.fg;
      statusRef.current.style.opacity = statusOp.toFixed(2);
    }
    if (waitRowRef.current) waitRowRef.current.style.opacity = a === 4 && p < 0.7 ? '1' : '0';
    if (waitBarRef.current) waitBarRef.current.style.width = (clamp01((p - 0.08) / 0.47) * 100).toFixed(1) + '%';

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), PH.pro[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const BOXES = [
    { label: 'this phone', left: '0%', ml: '0px', top: 72, w: 104, h: 160, r: 16, border: `1.5px solid ${P.sep}` },
    { label: 'backup', left: '50%', ml: '-62px', top: 92, w: 124, h: 120, r: 10, border: `1px solid ${P.bezel}` },
    { label: 'other phone', left: 'calc(100% - 104px)', ml: '0px', top: 72, w: 104, h: 160, r: 16, border: `1.5px solid ${P.sep}` },
  ];

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 26px' }}>
          {['Signed in with Google', 'Pro on this phone', 'Pro confirmed by server'].map((t, i) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 13, color: P.lbl, transition: 'color .3s ease' }}>
              <span ref={checkAt(i, 0)} style={{ width: 16, height: 16, boxSizing: 'border-box', borderRadius: 4, border: `1px solid ${P.under}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, transform: 'scale(0.9)', transition: 'background-color .25s ease, border-color .25s ease, transform .5s cubic-bezier(.34,1.56,.64,1)' }}>
                <span ref={checkAt(i, 1)} />
              </span>
              {t}
            </span>
          ))}
        </div>

        {/* Pro confirmation: the phone asks RevenueCat; RevenueCat tells the server; the server's flag comes back to the phone */}
        <span ref={rcRef} style={{ position: 'absolute', left: 'calc(50% - 150px)', top: 34, width: 110, height: 26, boxSizing: 'border-box', border: `1px solid ${P.bezel}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 11, color: P.lbl, transition: 'border-color .3s ease, color .3s ease' }}><span ref={rcTextRef}>RevenueCat</span></span>
        <span style={{ position: 'absolute', left: 'calc(50% - 40px)', right: 'calc(50% - 40px)', top: 47, borderTop: `1px dashed ${P.sep}` }} />
        <span ref={svRef} style={{ position: 'absolute', left: 'calc(50% + 40px)', top: 34, width: 110, height: 26, boxSizing: 'border-box', border: `1px solid ${P.bezel}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 11, color: P.lbl, transition: 'border-color .3s ease, color .3s ease' }}><span ref={svTextRef}>server</span></span>
        <span ref={cpRef} style={{ position: 'absolute', left: '52px', top: '72px', width: 9, height: 9, margin: '-4.5px 0 0 -4.5px', borderRadius: 99, background: P.fg, opacity: 0 }} />

        {/* the two lines: dashed while backup is off, solid once all three checks pass */}
        <span ref={lineLRef} style={{ position: 'absolute', left: 104, right: 'calc(50% + 62px)', top: 152, borderTop: `1px dashed ${P.bezel}`, transition: 'border-color .4s ease' }} />
        <span ref={lineRRef} style={{ position: 'absolute', left: 'calc(50% + 62px)', right: 104, top: 152, borderTop: `1px dashed ${P.bezel}`, transition: 'border-color .4s ease' }} />

        {BOXES.map((bx, b) => (
          <div
            key={bx.label}
            ref={b === 1 ? (el) => { if (el) boxBorders.current[1] = el; } : undefined}
            style={{ position: 'absolute', left: bx.left, top: bx.top, width: bx.w, height: bx.h, marginLeft: bx.ml, boxSizing: 'border-box', border: bx.border, borderRadius: bx.r, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 12, background: P.bg, transition: 'border-color .4s ease' }}
          >
            <span style={{ ...mono, fontSize: 10.5, color: P.lbl }}>{bx.label}</span>
            <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 12px)', gap: 6 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} ref={tileAt(b, i)} style={{ width: 12, height: 12, boxSizing: 'border-box', borderRadius: 3, border: `1px solid ${P.hair2}`, background: 'transparent', transform: 'scale(0.85)', transition: 'background-color .3s ease, border-color .3s ease, transform .5s cubic-bezier(.34,1.56,.64,1)' }} />
              ))}
            </span>
          </div>
        ))}

        {[0, 1, 2].map((i) => (
          <span key={i} ref={packetAt(i)} style={{ position: 'absolute', left: '0px', top: 148, width: 9, height: 9, marginLeft: -4.5, borderRadius: 2, background: P.fg, opacity: 0 }} />
        ))}

        {/* status of the backup on this phone */}
        <span style={{ position: 'absolute', left: 0, top: 248, ...mono, fontSize: 12, color: P.lbl }}>backup: <span ref={statusRef} style={{ color: P.lbl, opacity: 1 }}>off</span></span>
        <div ref={waitRowRef} style={{ position: 'absolute', left: 0, right: 0, top: 274, display: 'flex', alignItems: 'center', gap: 12, opacity: 0, transition: 'opacity .3s ease' }}>
          <span style={{ width: 104, height: 3, borderRadius: 2, background: P.track, position: 'relative', overflow: 'hidden' }}>
            <span ref={waitBarRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.0%', background: P.fg }} />
          </span>
          <span style={{ fontSize: 11.5, color: P.lbl }}>uploads 5 s after the last change</span>
        </div>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}

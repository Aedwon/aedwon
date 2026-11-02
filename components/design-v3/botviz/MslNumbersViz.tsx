'use client';

// The MSL server in numbers: a members curve that draws itself when it scrolls into view, then the counts under it.
// It shows the saved snapshot (lib/design-v3/data/msl-stats.json, refreshed with scripts/pull-msl-stats.mjs)
// and swaps in the daily numbers from /api/msl-stats when that answers. Aggregates only.

import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { mono, easeInOut, easeOut, type Pal } from '../SystemViz';
import snapshot from '@/lib/design-v3/data/msl-stats.json';
import { isMslStats, type MslStats } from '@/lib/msl-stats';
import { useTheme } from '@/lib/design-v3/theme';

const nf = new Intl.NumberFormat('en-US');
const DAY_MS = 86400000;
const DRAW_MS = 3200;
const NARROW_BELOW = 520;
const stamp = (date: string) => Date.parse(date + 'T00:00:00Z');
const fmtDate = (t: number, o: Intl.DateTimeFormatOptions) => new Date(t).toLocaleDateString('en-US', { ...o, timeZone: 'UTC' });

// Smooth line that never overshoots the data (monotone cubic). `at` reads the curve's y for any x.
function smooth(pts: [number, number][]) {
  const n = pts.length;
  const dx: number[] = [], m: number[] = [], t: number[] = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (2 * m[i - 1] * m[i]) / (m[i - 1] + m[i]);
  let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += 'C' + (pts[i][0] + h).toFixed(1) + ' ' + (pts[i][1] + t[i] * h).toFixed(1) + ' ' + (pts[i + 1][0] - h).toFixed(1) + ' ' + (pts[i + 1][1] - t[i + 1] * h).toFixed(1) + ' ' + pts[i + 1][0].toFixed(1) + ' ' + pts[i + 1][1].toFixed(1);
  }
  const at = (x: number) => {
    let i = 0;
    while (i < n - 2 && x > pts[i + 1][0]) i++;
    const h = dx[i], u = Math.max(0, Math.min(1, (x - pts[i][0]) / h));
    return (2 * u ** 3 - 3 * u ** 2 + 1) * pts[i][1] + (u ** 3 - 2 * u ** 2 + u) * h * t[i] + (-2 * u ** 3 + 3 * u ** 2) * pts[i + 1][1] + (u ** 3 - u ** 2) * h * t[i + 1];
  };
  return { d, at };
}

export default function MslNumbersViz({ P }: { P: Pal }) {
  const { theme } = useTheme();
  const accent = theme === 'light' ? '#A16207' : '#F2C419';
  const clipId = 'msl-reveal-' + useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<MslStats>(snapshot as MslStats);
  const [narrow, setNarrow] = useState(false);
  const [k, setK] = useState(0);
  const [hf, setHf] = useState<number | null>(null); // pointer position along the chart, 0 to 1
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    fetch('/api/msl-stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (live && isMslStats(j)) setStats(j); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => { const w = el.clientWidth; setNarrow(w > 0 && w < NARROW_BELOW); };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Plays once, when enough of the chart is on screen to watch the line draw. Reduced motion, or no IntersectionObserver, shows the end state.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      setK(1);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / DRAW_MS);
        setK(p);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const { current, curve: points } = stats.members;
  const t = stats.totals;
  const W = narrow ? 358 : 800, H = narrow ? 230 : 320, plotH = H - 24;
  const firstT = stamp(points[0].date);
  const span = Math.max(1, Math.round((stamp(points[points.length - 1].date) - firstT) / DAY_MS));
  const peak = Math.max(...points.map((p) => p.members));
  const top = Math.max(40000, Math.ceil((peak * 1.1) / 10000) * 10000);
  const X = (day: number) => (day / span) * W;
  const Y = (v: number) => plotH - (v / top) * (plotH - 8);
  const line = smooth(points.map((p): [number, number] => [X(Math.round((stamp(p.date) - firstT) / DAY_MS)), Y(p.members)]));
  const grid: number[] = [];
  for (let v = 10000; v < top; v += 10000) grid.push(v);

  // Ticks sit on month starts and each label is centered in its month. The first label starts at 0, the last ends at W.
  const monthStarts: { label: string; day: number }[] = [{ label: fmtDate(firstT, { month: 'short' }), day: 0 }];
  const f0 = new Date(firstT);
  for (let ym = f0.getUTCFullYear() * 12 + f0.getUTCMonth() + 1; ; ym++) {
    const day = Math.round((Date.UTC(Math.floor(ym / 12), ym % 12, 1) - firstT) / DAY_MS);
    if (day > span) break;
    monthStarts.push({ label: fmtDate(Date.UTC(Math.floor(ym / 12), ym % 12, 1), { month: 'short' }), day });
  }
  const months = monthStarts.map((m, n, all) => {
    const last = n === all.length - 1;
    const mid = n === 0 ? 0 : last ? W : (X(m.day) + X(all[n + 1].day)) / 2;
    return { label: m.label, tick: X(m.day), left: (mid / W) * 100, shift: n === 0 ? 0 : last ? -100 : -50 };
  }).filter((_, i) => !narrow || i % 2 === 0);

  const draw = easeInOut(k / 0.72);
  const tipX = W * draw;
  const tipY = line.at(tipX);
  const tipValue = ((plotH - tipY) / (plotH - 8)) * top;
  const arrive = (k - 0.72) / 0.28;
  const rise = (start: number) => { const e = easeOut((k - start) / 0.26); return { opacity: e, transform: `translateY(${((1 - e) * 10).toFixed(1)}px)` }; };
  const hover = hf === null ? 0 : hf * W;
  const readLabel = hf === null ? 'Members' : fmtDate(firstT + Math.round(hf * span) * DAY_MS, { month: 'short', day: 'numeric', year: 'numeric' });
  const readValue = hf !== null
    ? Math.min(current, Math.round(((plotH - line.at(hover)) / (plotH - 8)) * top))
    : k >= 0.72 ? current : Math.min(current, Math.round(tipValue));

  const growth = points[0].members > 0 ? Math.round(current / points[0].members) + 'x' : '';
  const monthsIn = Math.floor(span / 30.44);
  const lastT = stamp(points[points.length - 1].date);
  const ariaLabel = `Members grew from about ${nf.format(Math.round(points[0].members / 100) * 100)} in ${fmtDate(firstT, { month: 'long', year: 'numeric' })} to ${nf.format(current)} in ${fmtDate(lastT, { month: 'long', year: 'numeric' })}`;

  const stat = (label: string, target: number, suffix: string) => ({ label, target, suffix });
  const statsRow = [
    stat('peak active in one day', Math.round(t.peakActive / 1000), 'K'),
    stat('messages sent', Math.floor(t.messages / 1000), 'K+'),
    stat('reactions', Math.floor(t.reactions / 1000), 'K+'),
    stat('hours in voice', Math.floor(t.voiceHours / 1000), 'K+'),
  ];
  const featuresRow: [string, number][] = [['days with quizzes', t.quizDays], ['raffles held', t.raffles], ['events held', t.events], ['members verified', stats.members.verified]];
  const more: [string, string][] = [
    ['Peak messages in one day', nf.format(t.peakMessages)], ['Peak in voice in one day', nf.format(t.peakVoice)],
    ['Correct quiz answers', nf.format(t.correctAnswers)], ['Event sign-ups', nf.format(t.eventSignups)],
    ['Raffle entries', nf.format(t.raffleEntries)], ['Member referrals', nf.format(t.referrals)],
    ['Support tickets handled', nf.format(t.tickets)], ['Support rating', t.supportRating > 0 ? t.supportRating + ' of 5' : 'n/a'],
  ];

  const scrub = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width > 0) setHf(Math.max(0, Math.min(0.999, (e.clientX - r.left) / r.width)));
  };
  const cols = narrow ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))';
  const area = line.d + 'L' + W + ' ' + plotH + 'L0 ' + plotH + 'Z';
  const areaOpacity = 0.11 * easeOut((k - 0.3) / 0.5);

  return (
    <div ref={rootRef} style={{ display: 'flex', flexDirection: 'column', gap: 22, width: '100%', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, minHeight: narrow ? 92 : 126 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 14, color: P.sec }}>{readLabel}</span>
          <span style={{ fontSize: narrow ? 64 : 104, lineHeight: 1, fontWeight: 600, letterSpacing: '-0.045em', fontVariantNumeric: 'tabular-nums' }}>{nf.format(readValue)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, textAlign: 'right', ...rise(0.62) }}>
          <span style={{ fontSize: narrow ? 30 : 44, lineHeight: 1, fontWeight: 600, letterSpacing: '-0.03em', color: accent }}>{growth}</span>
          <span style={{ fontSize: 13, color: P.sec }}>{`in ${monthsIn} months`}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={ariaLabel} onPointerMove={scrub} onPointerLeave={() => setHf(null)} style={{ display: 'block', touchAction: 'pan-y', cursor: 'crosshair', overflow: 'visible' }}>
        {grid.map((v) => <line key={v} x1={0} x2={W} y1={Y(v).toFixed(1)} y2={Y(v).toFixed(1)} stroke={P.track} strokeWidth={1} />)}
        <clipPath id={clipId}><rect x={0} y={0} width={(W * draw + 2).toFixed(1)} height={H} /></clipPath>
        <g clipPath={`url(#${clipId})`}>
          <path d={area} fill={accent} opacity={areaOpacity.toFixed(3)} />
          <path d={line.d} fill="none" stroke={accent} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
        </g>
        <line x1={0} x2={W} y1={plotH} y2={plotH} stroke={P.sep} strokeWidth={1} />
        {months.map((m) => <line key={m.label + m.tick} x1={m.tick.toFixed(1)} x2={m.tick.toFixed(1)} y1={plotH} y2={plotH + 5} stroke={P.sep} strokeWidth={1} />)}
        {k > 0.005 && (
          <>
            <circle cx={tipX.toFixed(1)} cy={tipY.toFixed(1)} r={(4 + 16 * easeOut(arrive)).toFixed(1)} fill="none" stroke={accent} strokeWidth={1.5} opacity={arrive > 0 && arrive < 1 ? (0.7 * (1 - arrive)).toFixed(2) : '0'} />
            <circle cx={tipX.toFixed(1)} cy={tipY.toFixed(1)} r={4} fill={accent} />
          </>
        )}
        {hf !== null && (
          <>
            <line x1={hover.toFixed(1)} x2={hover.toFixed(1)} y1={0} y2={plotH} stroke={P.sep} strokeWidth={1} />
            <circle cx={hover.toFixed(1)} cy={line.at(hover).toFixed(1)} r={4.5} fill={P.bg} stroke={accent} strokeWidth={2} />
          </>
        )}
      </svg>
      <div aria-hidden="true" style={{ position: 'relative', height: 18, marginTop: -20, pointerEvents: 'none' }}>
        {months.map((m) => (
          <span key={m.label + m.tick} style={{ position: 'absolute', top: 0, left: m.left.toFixed(2) + '%', transform: `translateX(${m.shift}%)`, ...mono, fontSize: 12, lineHeight: '18px', color: P.sec }}>{m.label}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '20px 16px', paddingTop: 18, borderTop: '1px solid ' + P.track }}>
        {statsRow.map((s, n) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, ...rise(0.58 + n * 0.05) }}>
            <span style={{ fontSize: 30, lineHeight: 1, fontWeight: 600, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{Math.round(s.target * easeOut((k - 0.58 - n * 0.05) / 0.26)) + s.suffix}</span>
            <span style={{ fontSize: 13, lineHeight: 1.35, color: P.sec }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, paddingTop: 16, borderTop: '1px solid ' + P.track }}>
        {featuresRow.map(([label, v], n) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3, ...rise(0.64 + n * 0.03) }}>
            <span style={{ ...mono, fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>{nf.format(Math.round(v * easeOut((k - 0.64 - n * 0.03) / 0.26)))}</span>
            <span style={{ fontSize: 12, color: P.lbl }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, lineHeight: 1.55, color: P.lbl }}>Updated daily.</span>
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: 0, border: 'none', background: 'none', color: P.fg, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            {open ? 'Less' : 'More'}
            <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true" style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform .25s ease' }}><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        {open && (
          <div style={{ display: 'grid', gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: '0 28px' }}>
            {more.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: '9px 0', borderTop: '1px solid ' + P.track }}>
                <span style={{ fontSize: 13, color: P.sec }}>{label}</span>
                <span style={{ ...mono, fontSize: 13, whiteSpace: 'nowrap' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

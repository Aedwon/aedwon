'use client';

// DOST's 2025 budget at each stage: what it asked for, what the executive proposed, what Congress enacted.
import { useRef, useState } from 'react';
import ChartFigure, { useInnerWidth, useTip } from './ChartFrame';

const ROWS: { label: string; v: number; muted?: boolean }[] = [
  { label: 'Requested by DOST (as reported by PNA)', v: 49.25, muted: true },
  { label: 'Executive proposal to Congress (NEP)', v: 28.46 },
  { label: 'Final budget (GAA)', v: 28.68 },
];
const ROW_H = 34, GAP = 30, MAX = 50, BAR_H = 14;
const H = ROWS.length * (ROW_H + GAP) + 4;

export default function DostChart() {
  const frame = useRef<HTMLDivElement>(null);
  const W = useInnerWidth(frame);
  const tip = useTip(frame);
  const [hover, setHover] = useState<number | null>(null);
  const x = (v: number) => ((W - 70) * v) / MAX;
  const r = 4;
  return (
    <ChartFigure
      title="DOST's 2025 budget at each stage"
      sub="New appropriations, billions of pesos"
      caption="Sources: PNA (September 24, 2024) for the request, FY2025 NEP p. 129, FY2025 GAA p. 228. Department-wide, nominal pesos, not R&D only."
      frameRef={frame}
    >
      <svg className="v3ch-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="DOST 2025: requested 49.25 billion pesos, executive proposal 28.46 billion pesos, final budget 28.68 billion pesos in new appropriations.">
        {ROWS.map((row, i) => {
          const y0 = i * (ROW_H + GAP), top = y0 + 18, w = x(row.v);
          const d = `M0,${top} H${w - r} Q${w},${top} ${w},${top + r} V${top + BAR_H - r} Q${w},${top + BAR_H} ${w - r},${top + BAR_H} H0 Z`;
          const move = (e: React.PointerEvent) => { setHover(i); tip.show(e, <>{row.label}: <b>₱{row.v.toFixed(2)}B</b></>); };
          const leave = () => { setHover(null); tip.hide(); };
          return (
            <g key={row.label}>
              <text x={0} y={y0 + 12} className="v3ch-note">{row.label}</text>
              <path d={d} className={(row.muted ? 'v3ch-muted' : 'v3ch-bar') + (hover === i && !row.muted ? ' v3ch-bar-on' : '')} />
              <rect x={0} y={y0} width={W} height={ROW_H + 6} fill="transparent" onPointerMove={move} onPointerDown={move} onPointerLeave={leave} />
              <text x={w + 10} y={top + 11.5} className="v3ch-val" pointerEvents="none">₱{row.v.toFixed(2)}B</text>
            </g>
          );
        })}
      </svg>
      <div className="v3ch-gap">The cut happened before the budget reached Congress. The final budget was about 58% of the request.</div>
      {tip.node}
    </ChartFigure>
  );
}

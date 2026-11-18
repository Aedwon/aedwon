'use client';

// R&D spending as a share of GDP, 2018 to 2022, against the 1% target in the Philippine Development Plan.
import { useRef, useState } from 'react';
import ChartFigure, { useInnerWidth, useTip } from './ChartFrame';

const GERD: [string, number][] = [['2018', 0.32], ['2019', 0.26], ['2020', 0.28], ['2021', 0.15], ['2022', 0.19]];
const TICKS: [number, string][] = [[0, '0'], [0.25, '0.25%'], [0.5, '0.5%'], [0.75, '0.75%'], [1, '1%']];
const H = 250, L = 34, R = 8, T = 10, B = 26, MAX = 1.1;

export default function RndChart() {
  const frame = useRef<HTMLDivElement>(null);
  const W = useInnerWidth(frame);
  const tip = useTip(frame);
  const [hover, setHover] = useState<number | null>(null);
  const y = (v: number) => T + (H - T - B) * (1 - v / MAX);
  const step = (W - L - R) / GERD.length;
  const bw = Math.min(44, step * 0.42);
  const r = 4;
  return (
    <ChartFigure
      title="R&D spending as a share of GDP"
      sub="Philippines, all sectors, 2018 to 2022"
      caption="Source: DOST Compendium of S&T Statistics (March 2026), Table 13. The 1% line is the Philippine Development Plan's target for 2028."
      frameRef={frame}
    >
      <svg className="v3ch-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="R&D spending as a share of GDP: 2018 0.32%, 2019 0.26%, 2020 0.28%, 2021 0.15%, 2022 0.19%. Target 1%.">
        {TICKS.map(([v, label]) => (
          <g key={v}>
            {v > 0 && v < 1 && <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="v3ch-grid" />}
            <text x={L - 8} y={y(v) + 4} textAnchor="end" className="v3ch-tick">{label}</text>
          </g>
        ))}
        <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} className="v3ch-base" />
        <line x1={L} x2={W - R} y1={y(1)} y2={y(1)} className="v3ch-target" />
        <text x={W - R} y={y(1) - 8} textAnchor="end" className="v3ch-note">Development Plan target for 2028: 1%</text>
        {GERD.map(([yr, v], i) => {
          const cx = L + step * (i + 0.5), top = y(v), x0 = cx - bw / 2, x1 = cx + bw / 2;
          const d = `M${x0},${y(0)} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x1 - r} Q${x1},${top} ${x1},${top + r} V${y(0)} Z`;
          const move = (e: React.PointerEvent) => { setHover(i); tip.show(e, <>{yr}: <b>{v.toFixed(2)}%</b> of GDP</>); };
          const leave = () => { setHover(null); tip.hide(); };
          return (
            <g key={yr}>
              <rect x={cx - step / 2} y={T} width={step} height={H - T - B} fill="transparent" onPointerMove={move} onPointerDown={move} onPointerLeave={leave} />
              <path d={d} className={hover === i ? 'v3ch-bar v3ch-bar-on' : 'v3ch-bar'} pointerEvents="none" />
              {(i === 0 || i === GERD.length - 1) && <text x={cx} y={top - 7} textAnchor="middle" className="v3ch-val">{v.toFixed(2)}%</text>}
              <text x={cx} y={H - 6} textAnchor="middle" className="v3ch-tick">{yr}</text>
            </g>
          );
        })}
      </svg>
      {tip.node}
    </ChartFigure>
  );
}

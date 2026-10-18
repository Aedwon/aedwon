// The Marwie bot tile: the course site's pixel cloud mascot on its sky. The mascot bobs and blinks,
// the white clouds drift right to left, all in CSS (see .v3ms in tokens.css). It plays on hover, or while `live`, and never under reduced motion.

const cloud = (u: number, fill: string, eyes = false) => {
  const r = (x: number, y: number, w: number, h: number, f: string, k: string) => <rect key={k} x={x * u} y={y * u} width={w * u} height={h * u} fill={f} />;
  return (
    <>
      {r(2, 0, 3, 1, fill, 'a')}{r(6, 0, 2, 1, fill, 'b')}{r(1, 1, 8, 1, fill, 'c')}{r(0, 2, 10, 3, fill, 'd')}{r(1, 5, 8, 1, fill, 'e')}
      {eyes ? <g className="v3ms-eyes">{r(3, 2, 1, 2, '#fff', 'l')}{r(6, 2, 1, 2, '#fff', 'r')}</g> : null}
    </>
  );
};

// u: pixel size, y: height on the tile, o: opacity, dur: seconds to cross, ph: how far along it starts (0 to 1)
const CLOUDS = [
  { u: 7, y: 26, o: 0.95, dur: 26, ph: 0.25 },
  { u: 9, y: 166, o: 0.8, dur: 38, ph: 0.7 },
  { u: 5, y: 72, o: 0.85, dur: 20, ph: 0.92 },
  { u: 6, y: 200, o: 0.7, dur: 32, ph: 0.1 },
];

export default function MarwieSky({ h = 260, live = false }: { h?: number; live?: boolean }) {
  return (
    <div className="v3ms" data-live={live || undefined} role="img" aria-label="The Marwie cloud mascot floating over a drifting sky" style={{ width: 520, height: h }}>
      <svg viewBox="0 0 520 260" width="520" height={h} preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden>
        <defs>
          <linearGradient id="v3ms-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe6fa" /><stop offset="0.45" stopColor="#e2f0fc" /><stop offset="1" stopColor="#edf5fd" />
          </linearGradient>
        </defs>
        <rect width="520" height="260" fill="url(#v3ms-sky)" />
        {CLOUDS.map((c, i) => {
          const dist = 520 + c.u * 10 + 20;
          return (
            <g key={i} transform={`translate(520 ${c.y})`} opacity={c.o}>
              <g className="v3ms-drift" style={{ ['--dist' as string]: `${dist}px`, animationDuration: `${c.dur}s`, animationDelay: `${-c.dur * c.ph}s` }}>{cloud(c.u, '#fff')}</g>
            </g>
          );
        })}
        <g transform="translate(170 76)"><g className="v3ms-bob">{cloud(18, '#7DB9E8', true)}</g></g>
      </svg>
    </div>
  );
}

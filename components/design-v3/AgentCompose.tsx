// AI Agent Config: three layers of policy go into one render step, one instruction file comes out per agent.
// Idle it sits still. It plays on hover (wall tile, index preview) and loops while `live` (the project page).
// The animation lives in tokens.css under .v3ac so it respects prefers-reduced-motion.

const IN_Y = [59, 130, 201];
const inPath = (y: number) => (y === 130 ? 'M124 130H224' : `M124 ${y}C175 ${y} 190 130 224 130`);
const outPath = (y: number) => (y === 130 ? 'M296 130H396' : `M296 130C330 130 345 ${y} 396 ${y}`);
const INPUTS = ['core/', 'rules/', 'overlays/'];
const OUTPUTS = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md'];

export default function AgentCompose({ h = 260, live = false }: { h?: number; live?: boolean }) {
  return (
    <div className="v3ac" data-live={live || undefined} role="img" aria-label="Shared policy, project rules and overlays flow into a render step that writes AGENTS.md, CLAUDE.md and GEMINI.md" style={{ width: 520, height: h }}>
      <svg viewBox="0 0 520 260" width="520" height={h} preserveAspectRatio="xMidYMid meet" aria-hidden>
        <g className="v3ac-in">
          {IN_Y.map((y) => <path key={`w${y}`} className="v3ac-wire" d={inPath(y)} />)}
          {IN_Y.map((y) => <path key={`f${y}`} className="v3ac-flow" d={inPath(y)} />)}
          {IN_Y.map((y, i) => <circle key={`d${y}`} className="v3ac-dot v3ac-dot-i" r="2.5" style={{ offsetPath: `path('${inPath(y)}')`, ['--d' as string]: `${i * 0.25}s` }} />)}
        </g>
        <g className="v3ac-out">
          {IN_Y.map((y) => <path key={`w${y}`} className="v3ac-wire" d={outPath(y)} />)}
          {IN_Y.map((y) => <path key={`f${y}`} className="v3ac-flow" d={outPath(y)} />)}
          {IN_Y.map((y, i) => <circle key={`d${y}`} className="v3ac-dot v3ac-dot-o" r="2.5" style={{ offsetPath: `path('${outPath(y)}')`, ['--d' as string]: `${i * 0.25}s` }} />)}
        </g>
        <circle className="v3ac-ring" cx="260" cy="130" r="40" />
        <circle className="v3ac-core" cx="260" cy="130" r="26" />
        <text className="v3ac-lbl" x="260" y="134" textAnchor="middle" style={{ fill: '#ffe2b3' }}>render</text>
        <text className="v3ac-sub" x="260" y="198" textAnchor="middle">validate, then diff</text>
        {INPUTS.map((t, i) => (
          <g key={t} className="v3ac-icard">
            <rect className="v3ac-card" x="28" y={IN_Y[i] - 15} width="96" height="30" rx="6" />
            <text className="v3ac-lbl" x="76" y={IN_Y[i] + 4} textAnchor="middle">{t}</text>
          </g>
        ))}
        {OUTPUTS.map((t, i) => (
          <g key={t} className="v3ac-ocard" style={{ ['--d' as string]: `${i * 0.25}s` }}>
            <rect className="v3ac-card" x="396" y={IN_Y[i] - 15} width="96" height="30" rx="6" />
            <text className="v3ac-lbl" x="444" y={IN_Y[i] + 4} textAnchor="middle">{t}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

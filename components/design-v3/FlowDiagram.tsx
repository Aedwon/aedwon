// A small animated flow diagram, drawn from a spec in lib/design-v3/data/flows.ts.
// Idle it sits still. It plays on hover (wall tile, index preview) and loops while `live` (the project page).
// The look and the animation live in tokens.css under .v3fd, and respect prefers-reduced-motion.

import type { FlowSpec, FlowNode } from '@/lib/design-v3/data/flows';

const NODE_W = 104;
const NODE_H = 34;
const STEP = 0.8; // seconds between one hop and the next

function anchors(a: FlowNode, b: FlowNode) {
  const aw = a.w ?? NODE_W, bw = b.w ?? NODE_W;
  if (b.x > a.x + aw / 2) {
    // left to right: out of the right side, into the left side
    const x1 = a.x + aw / 2, y1 = a.y, x2 = b.x - bw / 2, y2 = b.y;
    const dx = Math.max(24, (x2 - x1) / 2);
    return `M${x1} ${y1}C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
  }
  if (b.x < a.x - aw / 2) {
    // right to left, the loop back
    const x1 = a.x - aw / 2, y1 = a.y, x2 = b.x + bw / 2, y2 = b.y;
    const dx = Math.max(24, (x1 - x2) / 2);
    return `M${x1} ${y1}C${x1 - dx} ${y1} ${x2 + dx} ${y2} ${x2} ${y2}`;
  }
  // same column: bottom of one to the top of the next
  const down = b.y > a.y;
  const y1 = a.y + (down ? NODE_H / 2 : -NODE_H / 2), y2 = b.y + (down ? -NODE_H / 2 : NODE_H / 2);
  return `M${a.x} ${y1}L${b.x} ${y2}`;
}

export default function FlowDiagram({ spec, h = 260, live = false }: { spec: FlowSpec; h?: number; live?: boolean }) {
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const edges = spec.edges.map((e) => ({ ...e, d: anchors(byId.get(e.from)!, byId.get(e.to)!), tone: byId.get(e.from)!.tone === 'a' ? 'a' : byId.get(e.to)!.tone ?? 'a' }));
  const litAt = new Map<string, number>(); // the first hop that reaches a node lights it
  edges.forEach((e) => { const t = e.step * STEP + 0.85; if (!litAt.has(e.to) || t < litAt.get(e.to)!) litAt.set(e.to, t); });
  return (
    <div className="v3fd" data-live={live || undefined} role="img" aria-label={spec.label} style={{ width: 520, height: h }}>
      <svg viewBox="0 0 520 260" width="520" height={h} preserveAspectRatio="xMidYMid meet" aria-hidden>
        {edges.map((e, i) => <path key={`w${i}`} className="v3fd-wire" d={e.d} />)}
        {edges.map((e, i) => <path key={`f${i}`} className={`v3fd-flow v3fd-t-${e.tone}`} d={e.d} />)}
        {edges.map((e, i) => (
          <circle key={`d${i}`} className={`v3fd-dot v3fd-t-${e.tone}`} r="2.5" style={{ offsetPath: `path('${e.d}')`, ['--d' as string]: `${e.step * STEP}s` }} />
        ))}
        {spec.nodes.map((n) => {
          const w = n.w ?? NODE_W;
          return (
            <g key={n.id} className={`v3fd-node v3fd-t-${n.tone ?? 'a'}${litAt.has(n.id) ? ' v3fd-lit' : ''}`} style={{ ['--l' as string]: `${litAt.get(n.id) ?? 0}s` }}>
              <rect className="v3fd-card" x={n.x - w / 2} y={n.y - NODE_H / 2} width={w} height={NODE_H} rx="6" />
              <text className="v3fd-lbl" x={n.x} y={n.sub ? n.y - 2 : n.y + 4} textAnchor="middle">{n.label}</text>
              {n.sub ? <text className="v3fd-sub" x={n.x} y={n.y + 11} textAnchor="middle">{n.sub}</text> : null}
            </g>
          );
        })}
        {spec.caption ? <text className="v3fd-cap" x="260" y="248" textAnchor="middle">{spec.caption}</text> : null}
      </svg>
    </div>
  );
}

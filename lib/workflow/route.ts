import type { OrgEdge } from "./types";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoutedEdge {
  key: string;
  from: string;
  to: string;
  d: string;
  startArrow: boolean;
  endArrow: boolean;
  optional: boolean;
}

type Side = "left" | "right" | "top" | "bottom";
type Pt = { x: number; y: number };

const n1 = (v: number) => Math.round(v * 10) / 10;
const sign = (v: number) => (v < 0 ? -1 : 1);

/** Horizontal, vertical, horizontal path with rounded corners. */
function hvh(a: Pt, b: Pt, xm: number): string {
  const dy = b.y - a.y;
  if (Math.abs(dy) < 1) return `M ${n1(a.x)} ${n1(a.y)} H ${n1(b.x)}`;
  const s1 = sign(xm - a.x);
  const s2 = sign(b.x - xm);
  const sy = sign(dy);
  const r = Math.max(0, Math.min(8, Math.abs(dy) / 2, Math.abs(xm - a.x), Math.abs(b.x - xm)));
  return [
    `M ${n1(a.x)} ${n1(a.y)}`,
    `H ${n1(xm - s1 * r)}`,
    `Q ${n1(xm)} ${n1(a.y)} ${n1(xm)} ${n1(a.y + sy * r)}`,
    `V ${n1(b.y - sy * r)}`,
    `Q ${n1(xm)} ${n1(b.y)} ${n1(xm + s2 * r)} ${n1(b.y)}`,
    `H ${n1(b.x)}`,
  ].join(" ");
}

/** Vertical, horizontal, vertical path with rounded corners. */
function vhv(a: Pt, b: Pt): string {
  const dx = b.x - a.x;
  if (Math.abs(dx) < 1) return `M ${n1(a.x)} ${n1(a.y)} V ${n1(b.y)}`;
  const ym = (a.y + b.y) / 2;
  const s1 = sign(ym - a.y);
  const s2 = sign(b.y - ym);
  const sx = sign(dx);
  const r = Math.max(0, Math.min(8, Math.abs(dx) / 2, Math.abs(ym - a.y), Math.abs(b.y - ym)));
  return [
    `M ${n1(a.x)} ${n1(a.y)}`,
    `V ${n1(ym - s1 * r)}`,
    `Q ${n1(a.x)} ${n1(ym)} ${n1(a.x + sx * r)} ${n1(ym)}`,
    `H ${n1(b.x - sx * r)}`,
    `Q ${n1(b.x)} ${n1(ym)} ${n1(b.x)} ${n1(ym + s2 * r)}`,
    `V ${n1(b.y)}`,
  ].join(" ");
}

function point(r: Rect, side: Side, f: number): Pt {
  switch (side) {
    case "left":
      return { x: r.x, y: r.y + r.h * f };
    case "right":
      return { x: r.x + r.w, y: r.y + r.h * f };
    case "top":
      return { x: r.x + r.w * f, y: r.y };
    default:
      return { x: r.x + r.w * f, y: r.y + r.h };
  }
}

const cx = (r: Rect) => r.x + r.w / 2;
const cy = (r: Rect) => r.y + r.h / 2;

interface Plan {
  edge: OrgEdge;
  index: number;
  fromSide: Side;
  toSide: Side;
}

/**
 * Turns measured boxes and the edge list into SVG paths.
 * Wide layout: edges leave from the side that faces the other box.
 * Column layout (every box has the same left edge): edges run down a gutter on the left.
 */
export function routeEdges(rects: Record<string, Rect>, edges: OrgEdge[]): RoutedEdge[] {
  const ids = Object.keys(rects);
  if (ids.length === 0) return [];
  const column = ids.every((id) => Math.abs(rects[id].x - rects[ids[0]].x) < 2);

  const plans: Plan[] = [];
  edges.forEach((edge, index) => {
    const a = rects[edge.from];
    const b = rects[edge.to];
    if (!a || !b) return;
    let fromSide: Side;
    let toSide: Side;
    if (column) {
      fromSide = "left";
      toSide = "left";
    } else if (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0) {
      const down = cy(a) < cy(b);
      fromSide = down ? "bottom" : "top";
      toSide = down ? "top" : "bottom";
    } else {
      const right = cx(a) < cx(b);
      fromSide = right ? "right" : "left";
      toSide = right ? "left" : "right";
    }
    plans.push({ edge, index, fromSide, toSide });
  });

  // Spread anchors that share one side of one box, ordered by where the other end is.
  const groups = new Map<string, { plan: Plan; end: "from" | "to"; other: number }[]>();
  for (const plan of plans) {
    const add = (id: string, side: Side, end: "from" | "to", otherId: string) => {
      const o = rects[otherId];
      const other = side === "left" || side === "right" ? cy(o) : cx(o);
      const key = `${id}:${side}`;
      groups.set(key, [...(groups.get(key) ?? []), { plan, end, other }]);
    };
    add(plan.edge.from, plan.fromSide, "from", plan.edge.to);
    add(plan.edge.to, plan.toSide, "to", plan.edge.from);
  }
  const frac = new Map<string, number>();
  for (const list of groups.values()) {
    list.sort((p, q) => p.other - q.other || p.plan.index - q.plan.index);
    list.forEach((item, i) => frac.set(`${item.plan.index}:${item.end}`, (i + 1) / (list.length + 1)));
  }

  // Column layout: give each edge its own lane in the gutter.
  const lanes = new Map<number, number>();
  if (column) {
    const order = [...ids].sort((p, q) => rects[p].y - rects[q].y);
    const span = (p: Plan) => {
      const i = order.indexOf(p.edge.from);
      const j = order.indexOf(p.edge.to);
      return [Math.min(i, j), Math.max(i, j)] as const;
    };
    const taken: (readonly [number, number])[][] = [];
    [...plans]
      .sort((p, q) => span(p)[1] - span(p)[0] - (span(q)[1] - span(q)[0]) || p.index - q.index)
      .forEach((plan) => {
        const [lo, hi] = span(plan);
        let lane = 0;
        while ((taken[lane] ?? []).some(([c, d]) => lo < d && c < hi)) lane++;
        (taken[lane] ??= []).push([lo, hi]);
        lanes.set(plan.index, lane);
      });
  }

  const minX = Math.min(...ids.map((id) => rects[id].x));
  return plans.map((plan) => {
    const a = rects[plan.edge.from];
    const b = rects[plan.edge.to];
    const pa = point(a, plan.fromSide, frac.get(`${plan.index}:from`) ?? 0.5);
    const pb = point(b, plan.toSide, frac.get(`${plan.index}:to`) ?? 0.5);
    let d: string;
    if (column) {
      const lx = minX - 12 - (lanes.get(plan.index) ?? 0) * 11;
      d = hvh(pa, pb, lx);
    } else if (plan.fromSide === "left" || plan.fromSide === "right") {
      d = hvh(pa, pb, (pa.x + pb.x) / 2);
    } else {
      d = vhv(pa, pb);
    }
    return {
      key: `${plan.edge.from}-${plan.edge.to}`,
      from: plan.edge.from,
      to: plan.edge.to,
      d,
      startArrow: plan.edge.ends === "both",
      endArrow: true,
      optional: !!plan.edge.optional,
    };
  });
}

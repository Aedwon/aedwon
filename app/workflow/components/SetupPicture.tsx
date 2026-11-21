"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { SetupContent } from "@/lib/workflow/types";
import { routeEdges } from "@/lib/workflow/route";
import type { RoutedEdge, Rect } from "@/lib/workflow/route";
import { NodeLink } from "./NodeLink";

/** Who works for whom. Every box links to the section that explains it. Connections come from the content file. */
export function SetupPicture({ setup }: { setup: SetupContent }) {
  const { picture, parts } = setup;
  const wrap = useRef<HTMLDivElement>(null);
  const cells = useRef(new Map<string, HTMLDivElement>());
  const [routes, setRoutes] = useState<RoutedEdge[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const markId = useId().replace(/:/g, "");

  const measure = useCallback(() => {
    const w = wrap.current;
    if (!w) return;
    const wr = w.getBoundingClientRect();
    const rects: Record<string, Rect> = {};
    cells.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      rects[id] = { x: r.left - wr.left, y: r.top - wr.top, w: r.width, h: r.height };
    });
    const next = routeEdges(rects, picture.edges);
    setRoutes((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [picture.edges]);

  useLayoutEffect(() => {
    const first = requestAnimationFrame(measure);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (wrap.current) ro?.observe(wrap.current);
    cells.current.forEach((el) => ro?.observe(el));
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(first);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const arrow = (kind: "rest" | "lit") => (
    <marker id={`${markId}-${kind}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
      <path className={`mk mk-${kind}`} d="M1.5 1.5 L6.5 4 L1.5 6.5" />
    </marker>
  );

  return (
    <figure className="pic" aria-label={setup.label}>
      <div className="org" ref={wrap}>
        <svg className="conns" aria-hidden="true" focusable="false">
          <defs>
            {arrow("rest")}
            {arrow("lit")}
          </defs>
          {routes.map((r) => {
            const lit = hover !== null && (r.from === hover || r.to === hover);
            const mark = `url(#${markId}-${lit ? "lit" : "rest"})`;
            return (
              <g key={r.key} className={`conn${lit ? " lit" : ""}`}>
                <path className="line" d={r.d} markerEnd={mark} markerStart={r.startArrow ? mark : undefined} />
              </g>
            );
          })}
        </svg>
        {picture.nodes.map((n) => (
          <div
            key={n.id}
            className={`part-cell org-cell node-${n.id}`}
            style={{ "--c": n.grid[0], "--r": n.grid[1] } as CSSProperties}
            ref={(el) => {
              if (el) cells.current.set(n.id, el);
              else cells.current.delete(n.id);
            }}
          >
            <NodeLink to={n.to} label={n.label} sub={n.sub} outside={n.outside} onHover={(on) => setHover(on ? n.id : null)} />
          </div>
        ))}
      </div>
      <div className="extras">
        {picture.extras.map((id) => {
          const p = parts.find((x) => x.id === id)!;
          return (
            <div key={id} className="part-cell">
              <NodeLink to={p.id} label={p.title} />
            </div>
          );
        })}
      </div>
    </figure>
  );
}

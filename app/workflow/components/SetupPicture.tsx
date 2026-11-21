"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { SetupContent } from "@/lib/workflow/types";
import { routeEdges } from "@/lib/workflow/route";
import type { RoutedEdge, Rect } from "@/lib/workflow/route";
import { PartGroup, PartNode, usePartGroup } from "./PartGroup";

function Org({ picture, parts }: { picture: SetupContent["picture"]; parts: SetupContent["parts"] }) {
  const { openId } = usePartGroup();
  const wrap = useRef<HTMLDivElement>(null);
  const cells = useRef(new Map<string, HTMLDivElement>());
  const [routes, setRoutes] = useState<RoutedEdge[]>([]);
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

  const litNodes = new Set(picture.nodes.filter((n) => n.part && n.part === openId).map((n) => n.id));
  const arrow = (kind: "rest" | "lit") => (
    <marker id={`${markId}-${kind}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
      <path className={`mk mk-${kind}`} d="M1.5 1.5 L6.5 4 L1.5 6.5" />
    </marker>
  );

  return (
    <div className="org pic" ref={wrap}>
      <svg className="conns" aria-hidden="true" focusable="false">
        <defs>
          {arrow("rest")}
          {arrow("lit")}
        </defs>
        {routes.map((r) => {
          const lit = litNodes.has(r.from) || litNodes.has(r.to);
          const mark = `url(#${markId}-${lit ? "lit" : "rest"})`;
          return (
            <g key={r.key} className={`conn${lit ? " lit" : ""}`}>
              <path className="line" d={r.d} markerEnd={mark} markerStart={r.startArrow ? mark : undefined} />
            </g>
          );
        })}
      </svg>
      {picture.nodes.map((n) => {
        const part = n.part ? parts.find((p) => p.id === n.part) : undefined;
        const style = { "--c": n.grid[0], "--r": n.grid[1] } as CSSProperties;
        return (
          <div
            key={n.id}
            className={`part-cell org-cell node-${n.id}`}
            style={style}
            ref={(el) => {
              if (el) cells.current.set(n.id, el);
              else cells.current.delete(n.id);
            }}
          >
            {part ? (
              <PartNode part={part} sub={n.sub} outside={n.outside} />
            ) : (
              <div className={`part${n.outside ? " outside" : ""}`}>
                <span className="nm">{n.label}</span>
                {n.sub ? <span className="sb">{n.sub}</span> : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SetupPicture({ setup }: { setup: SetupContent }) {
  const drawn = new Set(setup.picture.nodes.map((n) => n.part).filter(Boolean));
  const extras = setup.parts.filter((p) => !drawn.has(p.id));
  return (
    <PartGroup label={setup.label} parts={setup.parts}>
      <Org picture={setup.picture} parts={setup.parts} />
      <div className="extras pic">
        {extras.map((p) => (
          <div key={p.id} className="part-cell">
            <PartNode part={p} />
          </div>
        ))}
      </div>
    </PartGroup>
  );
}

'use client';

// Shared pieces for the figures in a written post: the framed card, a tooltip that follows the pointer,
// and a width reader so the SVG is drawn in real pixels (text keeps its size on a phone).
// The look lives in tokens.css under .v3ch.

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

export const DEFAULT_W = 636;

// The width of an element, in pixels. Starts at the desktop width so the server HTML has a sensible size.
export function useInnerWidth(ref: RefObject<HTMLElement | null>, initial = DEFAULT_W) {
  const [w, setW] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // clientWidth includes the card's padding; the SVG only gets the content box
    const read = () => {
      const cs = getComputedStyle(el);
      const n = Math.round(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
      if (n > 0) setW(n);
    };
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

export interface TipApi {
  node: ReactNode;
  show: (e: { clientX: number; clientY: number }, text: ReactNode) => void;
  hide: () => void;
}

// A tooltip placed inside a position:relative frame.
export function useTip(frame: RefObject<HTMLElement | null>): TipApi {
  const el = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: ReactNode } | null>(null);
  const [left, setLeft] = useState(0);
  useLayoutEffect(() => {
    if (!tip || !el.current || !frame.current) return;
    setLeft(Math.max(0, Math.min(tip.x + 12, frame.current.clientWidth - el.current.offsetWidth - 8)));
  }, [tip, frame]);
  const show = useCallback((e: { clientX: number; clientY: number }, text: ReactNode) => {
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top - 34, text });
  }, [frame]);
  const hide = useCallback(() => setTip(null), []);
  const node = (
    <div ref={el} className="v3ch-tip" style={{ left: tip ? left : 0, top: tip ? tip.y : 0, opacity: tip ? 1 : 0 }}>{tip?.text}</div>
  );
  return { node, show, hide };
}

// The card with a title and a subtitle, and an optional caption under it.
export default function ChartFigure({ title, sub, caption, frameRef, children }: {
  title: string; sub: string; caption?: string; frameRef?: RefObject<HTMLDivElement | null>; children: ReactNode;
}) {
  return (
    <figure className="v3ch">
      <div className="v3ch-frame" ref={frameRef}>
        <div className="v3ch-title">{title}</div>
        <div className="v3ch-sub">{sub}</div>
        {children}
      </div>
      {caption && <figcaption className="v3ch-cap">{caption}</figcaption>}
    </figure>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { jumpTo } from "./jump";

export interface TocGroup {
  label?: string;
  items: { id: string; title: string }[];
}

/** Sticky contents list. The current section has heavier weight and a 1px rule. Hidden on narrow screens. */
export function Toc({ groups }: { groups: TocGroup[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (typeof IntersectionObserver === "undefined") return;
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.set(e.target.id, e.boundingClientRect.top);
          else seen.delete(e.target.id);
        }
        const first = ids.find((id) => seen.has(id));
        if (first) setCurrent(first);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [groups]);

  function onClick(e: MouseEvent<HTMLAnchorElement>, id: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (jumpTo(id)) {
      e.preventDefault();
      setCurrent(id);
    }
  }

  return (
    <nav className="toc" aria-label="Contents">
      {groups.map((g, i) => (
        <div className="toc-group" key={i}>
          {g.label ? <p className="toc-label">{g.label}</p> : null}
          <ul>
            {g.items.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} aria-current={current === item.id ? "location" : undefined} onClick={(e) => onClick(e, item.id)}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

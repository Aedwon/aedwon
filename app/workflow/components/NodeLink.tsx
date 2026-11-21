"use client";

import type { MouseEvent } from "react";
import { jumpTo } from "./jump";

interface Props {
  to: string;
  label: string;
  sub?: string;
  outside?: boolean;
  onHover?: (on: boolean) => void;
}

/** A box in a picture. Every box is a link to the section that explains it. */
export function NodeLink({ to, label, sub, outside, onHover }: Props) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (jumpTo(to)) e.preventDefault();
  }
  return (
    <a
      href={`#${to}`}
      className={`part${outside ? " outside" : ""}`}
      onClick={onClick}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
    >
      <span className="nm">{label}</span>
      {sub ? <span className="sb">{sub}</span> : null}
    </a>
  );
}

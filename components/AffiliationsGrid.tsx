"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AFFILIATION_GROUPS, type AffiliationBadge } from "@/lib/data/affiliations";
import { useTheme } from "@/components/ThemeContext";

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

interface AffiliationRowProps {
  items: AffiliationBadge[];
  getLogoSrc: (badge: AffiliationBadge) => string;
  showTooltip: (element: HTMLElement, tooltip: string) => void;
  hideTooltip: () => void;
  isNeobrutalist: boolean;
}

function AffiliationRow({
  items,
  getLogoSrc,
  showTooltip,
  hideTooltip,
  isNeobrutalist,
}: AffiliationRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const checkScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const next = {
      left: element.scrollLeft > 3,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 3,
    };
    setEdges((current) =>
      current.left === next.left && current.right === next.right ? current : next,
    );
  }, []);

  const scheduleCheck = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      checkScroll();
    });
  }, [checkScroll]);

  useEffect(() => {
    checkScroll();
    const element = scrollRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", scheduleCheck);
      return () => window.removeEventListener("resize", scheduleCheck);
    }

    const observer = new ResizeObserver(scheduleCheck);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [checkScroll, scheduleCheck]);

  return (
    <div className="relative group/track w-full">
      {!isNeobrutalist && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-[var(--bg-canvas)] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${edges.left ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
      )}

      <div
        ref={scrollRef}
        onScroll={scheduleCheck}
        className={`flex flex-nowrap items-center gap-[12px] overflow-x-auto no-scrollbar scroll-smooth py-1 ${isNeobrutalist ? "gap-[14px]" : ""}`}
      >
        {items.map((badge) => {
          const width = badge.width || 82;
          return (
            <figure
              key={badge.name}
              tabIndex={0}
              aria-label={badge.tooltip}
              onMouseEnter={(event) => showTooltip(event.currentTarget, badge.tooltip)}
              onMouseLeave={hideTooltip}
              onFocus={(event) => showTooltip(event.currentTarget, badge.tooltip)}
              onBlur={hideTooltip}
              className={`h-[80px] flex items-center justify-center p-[6px] transition-all relative shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] ${
                isNeobrutalist
                  ? "rounded-none border-[2.5px] border-black bg-white shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] hover:-translate-y-0.5"
                  : "transition-transform duration-150 hover:-translate-y-0.5"
              }`}
              style={{ width: `${width + (isNeobrutalist ? 16 : 0)}px` }}
            >
              <img
                src={getLogoSrc(badge)}
                alt={badge.name}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={`max-w-full max-h-full object-contain transition-all duration-200 ${badge.adaptive && !isNeobrutalist ? "logo-adaptive" : ""}`}
              />
            </figure>
          );
        })}
      </div>

      {!isNeobrutalist && (
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-[var(--bg-canvas)] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${edges.right ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function AffiliationsGrid() {
  const { isNeobrutalist, resolvedMode } = useTheme();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const showTooltip = useCallback((element: HTMLElement, text: string) => {
    const rect = element.getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const getLogoSrc = useCallback(
    (badge: AffiliationBadge) => {
      const lightVariant = isNeobrutalist || resolvedMode === "light";
      if (badge.name === "MOONTON") return lightVariant ? "/logos/moonton-light.svg" : "/logos/moonton-dark.svg";
      if (badge.name === "Dark League Studios") return lightVariant ? "/logos/dls-light.svg" : "/logos/dls-dark.svg";
      if (badge.name === "Estudyante Esports") return lightVariant ? "/logos/estudyante-esports-light.svg" : "/logos/estudyante-esports-dark.svg";
      return badge.logo;
    },
    [isNeobrutalist, resolvedMode],
  );

  return (
    <section id="affiliations" className="relative">
      <h2 className={`text-[18px] mb-1 ${isNeobrutalist ? "font-black text-black" : "font-semibold text-[var(--text-primary)] font-[var(--font-heading)]"}`}>
        Affiliations &amp; Partners
      </h2>
      <p className={`text-[13.5px] mb-5 ${isNeobrutalist ? "text-black font-medium" : "text-[var(--text-muted)]"}`}>
        Entities and brand partners I&apos;ve built software or run operations for:
      </p>

      <div className="space-y-6">
        {AFFILIATION_GROUPS.map((group) => (
          <div key={group.category}>
            <div className={`text-[11px] uppercase tracking-wider mb-2.5 ${isNeobrutalist ? "text-white font-black bg-black inline-block px-2.5 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000000]" : "font-mono font-semibold text-[var(--text-dim)]"}`}>
              {group.category}
            </div>
            <AffiliationRow
              items={group.items}
              getLogoSrc={getLogoSrc}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              isNeobrutalist={isNeobrutalist}
            />
          </div>
        ))}
      </div>

      {tooltip && typeof document !== "undefined" && createPortal(
        <div
          role="tooltip"
          className={`fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-full px-2.5 py-1 text-[11px] whitespace-nowrap ${
            isNeobrutalist
              ? "rounded-none border-2 border-black bg-black text-white font-black shadow-[2.5px_2.5px_0px_rgba(0,0,0,0.5)]"
              : "font-mono font-semibold rounded bg-[#09090B] text-[#FAFAFA] dark:bg-[#FFFFFF] dark:text-[#09090B] shadow-xl border border-white/10 dark:border-black/10"
          }`}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>,
        document.body,
      )}
    </section>
  );
}

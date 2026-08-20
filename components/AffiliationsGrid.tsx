"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AFFILIATION_GROUPS, AffiliationBadge } from "@/lib/data/affiliations";
import { useTheme } from "@/components/ThemeContext";

interface AffiliationRowProps {
  items: AffiliationBadge[];
  getLogoSrc: (badge: AffiliationBadge) => string;
  onHoverBadge: (e: React.MouseEvent<HTMLDivElement>, tooltip: string) => void;
  onLeaveBadge: () => void;
  isNeobrutalist: boolean;
}

function AffiliationRow({
  items,
  getLogoSrc,
  onHoverBadge,
  onLeaveBadge,
  isNeobrutalist,
}: AffiliationRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 3);
  }, []);

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScroll]);

  return (
    <div className="relative group/track w-full">
      {/* Left Edge Blur Overlay - Only in default theme */}
      {!isNeobrutalist && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-[var(--bg-canvas)] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Horizontal scrollable track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex flex-nowrap items-center gap-[12px] overflow-x-auto no-scrollbar scroll-smooth py-1 ${
          isNeobrutalist ? "gap-[14px]" : ""
        }`}
      >
        {items.map((badge, bIdx) => {
          const w = badge.width || 82;
          const src = getLogoSrc(badge);

          return (
            <div
              key={bIdx}
              onMouseEnter={(e) => onHoverBadge(e, badge.tooltip)}
              onMouseLeave={onLeaveBadge}
              className={`h-[80px] flex items-center justify-center p-[6px] transition-all cursor-pointer relative shrink-0 ${
                isNeobrutalist
                  ? "rounded-none border-[2.5px] border-black bg-white shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px]"
                  : "transition-transform duration-150 hover:-translate-y-0.5"
              }`}
              style={{
                width: `${w + (isNeobrutalist ? 16 : 0)}px`,
              }}
              title={badge.tooltip}
            >
              <img
                src={src}
                alt={badge.name}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={`max-w-full max-h-full object-contain transition-all duration-200 ${
                  badge.adaptive && !isNeobrutalist ? "logo-adaptive" : ""
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Right Edge Blur Overlay - Only in default theme */}
      {!isNeobrutalist && (
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-[var(--bg-canvas)] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function AffiliationsGrid() {
  const { theme, resolvedMode } = useTheme();
  const isNeobrutalist = theme === "neobrutalist";

  const [hoveredBadge, setHoveredBadge] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    tooltip: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredBadge({
      text: tooltip,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredBadge(null);
  };

  const getLogoSrc = (badge: AffiliationBadge) => {
    if (isNeobrutalist) {
      if (badge.name === "MOONTON") return "/logos/moonton-light.svg";
      if (badge.name === "Dark League Studios") return "/logos/dls-light.svg";
      if (badge.name === "Estudyante Esports") return "/logos/estudyante-esports-light.svg";
      return badge.logo;
    }

    const isDark = resolvedMode === "dark";
    if (badge.name === "MOONTON") {
      return isDark ? "/logos/moonton-dark.svg" : "/logos/moonton-light.svg";
    }
    if (badge.name === "Dark League Studios") {
      return isDark ? "/logos/dls-dark.svg" : "/logos/dls-light.svg";
    }
    if (badge.name === "Estudyante Esports") {
      return isDark
        ? "/logos/estudyante-esports-dark.svg"
        : "/logos/estudyante-esports-light.svg";
    }
    return badge.logo;
  };

  return (
    <section id="affiliations" className="relative">
      <h2
        className={`text-[18px] mb-1 ${
          isNeobrutalist
            ? "font-black text-black"
            : "font-semibold text-[var(--text-primary)] font-[var(--font-heading)]"
        }`}
      >
        Affiliations &amp; Partners
      </h2>
      <p
        className={`text-[13.5px] mb-5 ${
          isNeobrutalist ? "text-black font-medium" : "text-[var(--text-muted)]"
        }`}
      >
        Entities and brand partners I&apos;ve built software or run operations for:
      </p>

      <div className="space-y-6">
        {AFFILIATION_GROUPS.map((group, idx) => (
          <div key={idx}>
            <div
              className={`text-[11px] uppercase tracking-wider mb-2.5 ${
                isNeobrutalist
                  ? "text-white font-black bg-black inline-block px-2.5 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000000]"
                  : "font-mono font-semibold text-[var(--text-dim)]"
              }`}
            >
              {group.category}
            </div>

            <AffiliationRow
              items={group.items}
              getLogoSrc={getLogoSrc}
              onHoverBadge={handleMouseEnter}
              onLeaveBadge={handleMouseLeave}
              isNeobrutalist={isNeobrutalist}
            />
          </div>
        ))}
      </div>

      {/* Unclipped Global Floating Tooltip */}
      {hoveredBadge && (
        <div
          className={`fixed pointer-events-none z-[100] transform -translate-x-1/2 -translate-y-full px-2.5 py-1 text-[11px] whitespace-nowrap transition-opacity duration-150 ${
            isNeobrutalist
              ? "rounded-none border-2 border-black bg-black text-white font-black shadow-[2.5px_2.5px_0px_rgba(0,0,0,0.5)]"
              : "font-mono font-semibold rounded bg-[#09090B] text-[#FAFAFA] dark:bg-[#FFFFFF] dark:text-[#09090B] shadow-xl border border-white/10 dark:border-black/10"
          }`}
          style={{
            left: `${hoveredBadge.x}px`,
            top: `${hoveredBadge.y}px`,
          }}
        >
          {hoveredBadge.text}
        </div>
      )}
    </section>
  );
}

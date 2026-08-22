"use client";

import React, { useState, useRef } from "react";
import { EXPERIENCES } from "@/lib/data/experience";
import { useTheme } from "./ThemeContext";

export default function ExperienceDossier() {
  const [activeEntityId, setActiveEntityId] = useState(EXPERIENCES[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  let isNeobrutalist = false;

  try {
    const themeContext = useTheme();
    isNeobrutalist = themeContext.theme === "neobrutalist";
  } catch {
    isNeobrutalist = false;
  }

  const activeEntity =
    EXPERIENCES.find((e) => e.id === activeEntityId) || EXPERIENCES[0];

  const handleTabChange = (id: string) => {
    setActiveEntityId(id);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  return (
    <section id="experience">
      <h2
        className={`text-[18px] mb-4 ${
          isNeobrutalist ? "text-black font-black" : "font-semibold text-[var(--text-primary)] font-[var(--font-heading)]"
        }`}
      >
        Experience
      </h2>

      {/* Dossier Container */}
      <div
        className={`grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[210px_1fr] md:grid-rows-1 bg-[var(--bg-card)] overflow-hidden h-[350px] transition-all ${
          isNeobrutalist
            ? "rounded-none border-[3px] border-black shadow-[6px_6px_0px_#000000] bg-white"
            : "rounded-[var(--card-radius)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)]"
        }`}
      >
        {/* Left: Entity Navigation */}
        <div
          className={`flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-2.5 md:p-3 shrink-0 gap-1.5 ${
            isNeobrutalist
              ? "bg-[#F4F4F5] border-b md:border-b-0 md:border-r-[3px] border-black"
              : "bg-transparent border-b md:border-b-0 md:border-r border-[var(--border-subtle)]"
          }`}
        >
          {EXPERIENCES.map((entity) => {
            const isActive = activeEntityId === entity.id;

            if (isNeobrutalist) {
              return (
                <button
                  key={entity.id}
                  onClick={() => handleTabChange(entity.id)}
                  className={`text-left px-3 py-2 text-[13px] transition-all whitespace-nowrap md:whitespace-normal cursor-pointer select-none ${
                    isActive
                      ? "bg-[#FFE600] text-black font-black border-2 border-black shadow-[3px_3px_0px_#000000] rounded-none active:translate-x-[1px] active:translate-y-[1px]"
                      : "bg-white text-black font-bold border-2 border-black/60 hover:bg-[#FEF08A] hover:border-black rounded-none"
                  }`}
                >
                  {entity.shortName}
                </button>
              );
            }

            return (
              <button
                key={entity.id}
                onClick={() => handleTabChange(entity.id)}
                className={`text-left px-3 py-2 rounded-lg text-[13px] transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                  isActive
                    ? "bg-black/[0.08] dark:bg-white/[0.08] text-[var(--text-primary)] font-semibold shadow-xs"
                    : "text-[var(--text-muted)] font-medium hover:text-[var(--text-primary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                }`}
              >
                {entity.shortName}
              </button>
            );
          })}
        </div>

        {/* Right: Scrollable Roles Stack */}
        <div
          ref={scrollRef}
          className={`min-h-0 p-6 overflow-y-auto ${
            isNeobrutalist ? "bg-white" : "dossier-scroll-viewport"
          }`}
        >
          <div className="space-y-5">
            {activeEntity.roles.map((role, idx) => (
              <div
                key={idx}
                className={`space-y-1.5 pb-5 last:border-none last:pb-0 ${
                  isNeobrutalist
                    ? "border-b-2 border-black/20"
                    : "border-b border-[var(--border-subtle)]"
                }`}
              >
                <div className="flex justify-between items-baseline gap-4">
                  <h3
                    className={`text-[14.5px] min-w-0 ${
                      isNeobrutalist
                        ? "font-black text-black"
                        : "font-semibold text-[var(--text-primary)]"
                    }`}
                  >
                    {role.title}
                  </h3>
                  <span
                    className={`text-[11.5px] whitespace-nowrap shrink-0 ${
                      isNeobrutalist
                        ? "bg-black text-white font-black px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000]"
                        : "text-[var(--text-dim)] font-mono"
                    }`}
                  >
                    {role.period}
                  </span>
                </div>
                <p
                  className={`text-[13px] leading-[1.65] ${
                    isNeobrutalist
                      ? "text-black font-medium"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

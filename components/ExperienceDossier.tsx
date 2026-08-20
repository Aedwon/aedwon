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
        className={`text-[18px] font-semibold mb-4 font-[var(--font-heading)] ${
          isNeobrutalist ? "text-black font-extrabold" : "text-[var(--text-primary)]"
        }`}
      >
        Experience
      </h2>

      {/* Dossier Container */}
      <div
        className={`grid grid-cols-1 md:grid-cols-[210px_1fr] bg-[var(--bg-card)] overflow-hidden h-[350px] transition-all ${
          isNeobrutalist
            ? "rounded-none border-[3px] border-black shadow-[5px_5px_0px_#000000]"
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
                  className={`text-left px-3 py-2 text-[13px] font-mono transition-all whitespace-nowrap md:whitespace-normal cursor-pointer select-none ${
                    isActive
                      ? "bg-[#FFE600] text-black font-extrabold border-2 border-black shadow-[2px_2px_0px_#000000] rounded-none active:translate-x-[1px] active:translate-y-[1px]"
                      : "bg-white text-black font-bold border-2 border-black/50 hover:bg-[#FEF08A] hover:text-black rounded-none"
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
          className={`p-6 overflow-y-auto ${
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
                        ? "font-mono font-extrabold text-black"
                        : "font-semibold text-[var(--text-primary)]"
                    }`}
                  >
                    {role.title}
                  </h3>
                  <span
                    className={`text-[11.5px] font-mono whitespace-nowrap shrink-0 ${
                      isNeobrutalist
                        ? "bg-black text-white font-bold px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]"
                        : "text-[var(--text-dim)]"
                    }`}
                  >
                    {role.period}
                  </span>
                </div>
                <p
                  className={`text-[13px] leading-[1.55] ${
                    isNeobrutalist
                      ? "text-black/85 font-mono"
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

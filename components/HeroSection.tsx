"use client";

import React from "react";
import { useTheme } from "./ThemeContext";

export default function HeroSection() {
  const { theme } = useTheme();
  const isNeobrutalist = theme === "neobrutalist";

  if (isNeobrutalist) {
    return (
      <section className="space-y-4">
        {/* Brutalist Status Sticker Strip */}
        <div className="flex gap-2.5 flex-wrap items-center">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold bg-[#BBF7D0] dark:bg-[#14532D] text-black dark:text-[#BBF7D0] px-2.5 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFE600] uppercase tracking-wider select-none">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] dark:bg-[#4ADE80] animate-pulse" />
            STATUS: OPEN FOR WORK
          </span>
          <span className="inline-flex items-center font-mono text-[11px] font-bold bg-[#FBCFE8] dark:bg-[#831843] text-black dark:text-[#FBCFE8] px-2.5 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFE600] uppercase tracking-wider select-none">
            UP DILIMAN CS
          </span>
          <span className="inline-flex items-center font-mono text-[11px] font-bold bg-[#FED7AA] dark:bg-[#7C2D12] text-black dark:text-[#FED7AA] px-2.5 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFE600] uppercase tracking-wider select-none">
            DOST SCHOLAR
          </span>
        </div>

        {/* Industrial Uppercase Headline */}
        <h1 className="text-[25px] sm:text-[28px] font-extrabold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.3] font-[var(--font-heading)] uppercase">
          Aerol (Aedwon) — Software Engineer &amp; Builder
        </h1>

        {/* High-Contrast Grounded Bio */}
        <p className="text-[14.5px] leading-[1.65] text-[var(--text-muted)] max-w-[720px] font-mono">
          I studied Computer Science at UP Diliman on a DOST Merit Scholarship, following high school at Philippine Science High School. I build client-side software, offline-first tools, and tournament infrastructure.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-[25px] sm:text-[27px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.35] mb-2.5 font-[var(--font-heading)]">
        I&apos;m Aerol. You might also know me as Aedwon.
      </h1>
      <p className="text-[15px] leading-[1.6] text-[var(--text-muted)] max-w-[720px]">
        I studied Computer Science at UP Diliman on a DOST Merit Scholarship, following high school at Philippine Science High School. I like building things :)
      </p>
    </section>
  );
}

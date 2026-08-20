"use client";

import React from "react";
import { useTheme } from "./ThemeContext";

export default function HeroSection() {
  const { theme } = useTheme();
  const isNeobrutalist = theme === "neobrutalist";

  if (isNeobrutalist) {
    return (
      <section className="p-6 sm:p-7 bg-[var(--bg-card)] border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#FFE600] rounded-none">
        <h1 className="text-[25px] sm:text-[27px] font-extrabold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.35] mb-3 font-[var(--font-heading)]">
          I&apos;m Aerol. You might also know me as Aedwon.
        </h1>
        <p className="text-[14.5px] sm:text-[15px] leading-[1.65] text-[var(--text-muted)] max-w-[720px] font-mono">
          I studied Computer Science at UP Diliman on a DOST Merit Scholarship, following high school at Philippine Science High School. I like building things :)
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

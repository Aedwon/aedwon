"use client";

import React from "react";
import { Mail } from "lucide-react";
import { useTheme } from "./ThemeContext";

export default function Footer() {
  let isNeobrutalist = false;
  try {
    const themeContext = useTheme();
    isNeobrutalist = themeContext.theme === "neobrutalist";
  } catch {
    isNeobrutalist = false;
  }

  return (
    <footer
      className={`mt-20 pt-10 pb-12 ${
        isNeobrutalist
          ? "border-t-[3px] border-black"
          : "border-t border-[var(--border-subtle)]"
      }`}
    >
      <div className="mb-10">
        <h2
          className={`text-[17px] mb-2 ${
            isNeobrutalist
              ? "font-black text-black"
              : "font-semibold text-[var(--text-primary)] font-[var(--font-heading)]"
          }`}
        >
          Contact
        </h2>
        <p
          className={`text-[14.5px] mb-5 ${
            isNeobrutalist ? "text-black font-medium" : "text-[var(--text-muted)]"
          }`}
        >
          Get in touch for software projects or community infrastructure:
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-3 text-[13.5px]">
          {/* Email */}
          <a
            href="mailto:aerol.balayon@gmail.com"
            className={`inline-flex items-center gap-2 transition-all ${
              isNeobrutalist
                ? "font-black text-black bg-white border-2 border-black px-3.5 py-1.5 shadow-[3px_3px_0px_#000000] rounded-none hover:bg-[#FFE600] active:translate-x-[2px] active:translate-y-[2px]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] group"
            }`}
          >
            <Mail className="w-4 h-4 opacity-80" />
            <span>aerol.balayon@gmail.com</span>
            <span className={isNeobrutalist ? "font-black" : "text-[var(--text-dim)]"}>↗</span>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/Aedwon"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 transition-all ${
              isNeobrutalist
                ? "font-black text-black bg-white border-2 border-black px-3.5 py-1.5 shadow-[3px_3px_0px_#000000] rounded-none hover:bg-[#FFE600] active:translate-x-[2px] active:translate-y-[2px]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] group"
            }`}
          >
            <svg className="w-4 h-4 fill-current opacity-80" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>/Aedwon</span>
            <span className={isNeobrutalist ? "font-black" : "text-[var(--text-dim)]"}>↗</span>
          </a>

          {/* Discord */}
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 transition-all ${
              isNeobrutalist
                ? "font-black text-black bg-white border-2 border-black px-3.5 py-1.5 shadow-[3px_3px_0px_#000000] rounded-none hover:bg-[#FFE600] active:translate-x-[2px] active:translate-y-[2px]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] group"
            }`}
          >
            <svg className="w-4 h-4 fill-current opacity-80" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>@aedwon</span>
            <span className={isNeobrutalist ? "font-black" : "text-[var(--text-dim)]"}>↗</span>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/in/aedwon"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 transition-all ${
              isNeobrutalist
                ? "font-black text-black bg-white border-2 border-black px-3.5 py-1.5 shadow-[3px_3px_0px_#000000] rounded-none hover:bg-[#FFE600] active:translate-x-[2px] active:translate-y-[2px]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] group"
            }`}
          >
            <svg className="w-4 h-4 fill-current opacity-80" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span>/in/aedwon</span>
            <span className={isNeobrutalist ? "font-black" : "text-[var(--text-dim)]"}>↗</span>
          </a>
        </div>
      </div>

      <div
        className={`flex justify-between items-center text-[12px] pt-4 ${
          isNeobrutalist
            ? "border-t-2 border-black text-black font-black"
            : "border-t border-[var(--border-subtle)] font-mono text-[var(--text-dim)]"
        }`}
      >
        <span>© {new Date().getFullYear()} Aerol (Aedwon)</span>
        <span>Built with Next.js &amp; React</span>
      </div>
    </footer>
  );
}

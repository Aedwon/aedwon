"use client";

import { useTheme } from "./ThemeContext";

interface StateLabelProps {
  text?: string;
  showDot?: boolean;
}

export function StateLabel({ text = "NOW BOOKING · TAKING ONE AT A TIME", showDot = true }: StateLabelProps) {
  const { theme } = useTheme();

  return (
    <div className={`inline-flex items-center gap-2 font-mono text-micro tracking-widest uppercase ${theme === "minimalist" ? "opacity-70" : "opacity-80"}`}>
      {showDot && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${theme === "minimalist" ? "bg-ink" : "bg-green-500"} animate-ping`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${theme === "minimalist" ? "bg-ink" : "bg-green-500"}`} />
        </span>
      )}
      <span>{text}</span>
    </div>
  );
}

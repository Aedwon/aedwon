"use client";

import React from "react";
import Link from "next/link";
import { ProjectItem } from "@/lib/data/projects";
import { TechIcon } from "./TechIcons";
import { useTheme } from "./ThemeContext";

// Saturated Neo-Brutalist Light Mode Color Blocks per Project
const NEOBRUTALIST_LIGHT_COLORS: Record<string, string> = {
  pantas: "#FEF08A", // yellow
  "msl-network": "#BBF7D0", // lime
  "qr-studio": "#FBCFE8", // pink
  "kiosk-survey": "#DDD6FE", // lilac
  "norala-sb-portal": "#BAE6FD", // cyan
  "bettergov-ph": "#FED7AA", // orange
  "pso-scoring-model": "#FEF08A", // yellow
  "msl-collegiate-cup-bot": "#BBF7D0", // lime
  "ilocos-sur-esports-bot": "#BAE6FD", // cyan
  "oppo-legend-cup-bot": "#FED7AA", // orange
  "gi-damage-calculator": "#DDD6FE", // lilac
  "ai-agent-framework": "#FBCFE8", // pink
};

export function ProjectArt({ slug, brandColor }: { slug: string; brandColor: string }) {
  let isLight = false;
  let isNeobrutalist = false;

  try {
    const themeContext = useTheme();
    isLight = themeContext.resolvedMode === "light";
    isNeobrutalist = themeContext.theme === "neobrutalist";
  } catch {
    isLight = false;
    isNeobrutalist = false;
  }

  // Theme-calibrated stroke colors
  const colorMap: Record<string, { dark: string; light: string }> = {
    pantas: { dark: "#60A5FA", light: "#2563EB" },
    "msl-network": { dark: "#818CF8", light: "#4F46E5" },
    "qr-studio": { dark: "#FB7185", light: "#E11D48" },
    "kiosk-survey": { dark: "#A78BFA", light: "#7C3AED" },
    "norala-sb-portal": { dark: "#10B981", light: "#059669" },
    "bettergov-ph": { dark: "#34D399", light: "#059669" },
    "pso-scoring-model": { dark: "#F59E0B", light: "#D97706" },
    "msl-collegiate-cup-bot": { dark: "#6366F1", light: "#4338CA" },
    "ilocos-sur-esports-bot": { dark: "#06B6D4", light: "#0891B2" },
    "oppo-legend-cup-bot": { dark: "#14B8A6", light: "#0D9488" },
    "gi-damage-calculator": { dark: "#38BDF8", light: "#0284C7" },
    "ai-agent-framework": { dark: "#F43F5E", light: "#E11D48" },
  };

  const strokeColor = isNeobrutalist
    ? isLight
      ? "#000000"
      : "#FFFFFF"
    : colorMap[slug]
    ? isLight
      ? colorMap[slug].light
      : colorMap[slug].dark
    : brandColor || (isLight ? "#2563EB" : "#60A5FA");

  const iconProps = {
    className: `hiroki-art-icon transition-transform duration-200 group-hover:scale-105 ${
      isNeobrutalist ? "" : "drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
    }`,
    width: 54,
    height: 54,
    strokeWidth: isNeobrutalist ? 2.25 : 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  switch (slug) {
    case "pantas":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      );
    case "msl-network":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "qr-studio":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <rect width="5" height="5" x="3" y="3" rx="1" />
          <rect width="5" height="5" x="16" y="3" rx="1" />
          <rect width="5" height="5" x="3" y="16" rx="1" />
          <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
          <path d="M21 21v.01" />
        </svg>
      );
    case "kiosk-survey":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <rect width="20" height="15" x="2" y="3" rx="2" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      );
    case "norala-sb-portal":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <path d="M3 21h18" />
          <path d="M5 21V10" />
          <path d="M19 21V10" />
          <path d="M9 21V10" />
          <path d="M15 21V10" />
          <path d="M2 10h20L12 3z" />
        </svg>
      );
    case "bettergov-ph":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "pso-scoring-model":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    case "msl-collegiate-cup-bot":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
          <path d="M6 4h12v5a6 6 0 0 1-12 0V4z" />
        </svg>
      );
    case "ilocos-sur-esports-bot":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
          <path d="m13 19 6-6" />
          <path d="m16 16 3 3" />
          <path d="m19 21 2-2" />
        </svg>
      );
    case "oppo-legend-cup-bot":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <rect width="14" height="20" x="5" y="2" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case "gi-damage-calculator":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <path d="M16 10h.01" />
          <path d="M12 10h.01" />
          <path d="M8 10h.01" />
          <path d="M12 14h.01" />
          <path d="M8 14h.01" />
          <path d="M12 18h.01" />
          <path d="M8 18h.01" />
        </svg>
      );
    case "ai-agent-framework":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24" stroke={strokeColor}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        </svg>
      );
  }
}

export default function ProjectCard({
  project,
  external = false,
  href,
}: {
  project: ProjectItem;
  external?: boolean;
  href?: string;
}) {
  const targetHref = href || `/projects/${project.slug}`;
  let isNeobrutalist = false;
  let isLight = false;

  try {
    const themeContext = useTheme();
    isNeobrutalist = themeContext.theme === "neobrutalist";
    isLight = themeContext.resolvedMode === "light";
  } catch {
    isNeobrutalist = false;
    isLight = false;
  }

  const neobrutalistBg = isLight
    ? NEOBRUTALIST_LIGHT_COLORS[project.slug] || "#FEF08A"
    : "#18181B";

  const content = (
    <>
      {/* 1. Art Stage */}
      <div
        className={`h-[110px] w-full flex items-center justify-center mb-5 ${
          isNeobrutalist
            ? "border-b-2 border-black dark:border-white/25 pb-2"
            : ""
        }`}
      >
        <ProjectArt slug={project.slug} brandColor={project.brandColor} />
      </div>

      {/* 2. Card Title */}
      <h3
        className={`text-[16.5px] font-semibold mb-1.5 font-[var(--font-heading)] tracking-[-0.01em] ${
          isNeobrutalist ? "text-[var(--text-primary)] font-extrabold" : "text-[var(--text-primary)]"
        }`}
      >
        {project.title}
      </h3>

      {/* 3. Card Description */}
      <p
        className={`text-[13px] leading-[1.5] mb-[18px] flex-grow ${
          isNeobrutalist ? "text-[var(--text-muted)] font-mono" : "text-[var(--text-muted)]"
        }`}
      >
        {project.summary}
      </p>

      {/* 4. Card Bottom Row */}
      <div className="flex justify-between items-center pt-1.5 mt-auto">
        <div className="flex gap-1.5 items-center flex-wrap">
          {project.stack.slice(0, 4).map((tech, idx) => (
            <div
              key={idx}
              data-tooltip={tech.name}
              className={`has-tooltip tech-badge h-[26px] w-[26px] flex items-center justify-center transition-all ${
                isNeobrutalist
                  ? "rounded-none bg-[var(--bg-card)] text-[var(--text-primary)] border-[1.5px] border-black dark:border-white shadow-[1.5px_1.5px_0px_#000000] dark:shadow-[1.5px_1.5px_0px_#FFE600] hover:bg-[#FFE600] hover:text-black"
                  : "rounded-[6px] bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.09] dark:hover:bg-white/[0.12] border border-transparent hover:border-black/[0.06] dark:hover:border-white/[0.12] hover:-translate-y-0.5"
              }`}
            >
              <TechIcon name={tech.name} colored={!isNeobrutalist} />
            </div>
          ))}
        </div>
        <span
          className={`text-[14px] transition-all group-hover:translate-x-1 ${
            isNeobrutalist
              ? "font-mono font-bold text-[var(--text-primary)] px-2 py-0.5 border border-black dark:border-white bg-[var(--bg-card)]"
              : "text-[var(--text-arrow)] group-hover:text-[var(--text-primary)]"
          }`}
        >
          {external ? "↗" : "→"}
        </span>
      </div>
    </>
  );

  const containerClasses = isNeobrutalist
    ? `group flex flex-col p-[24px_22px_20px] rounded-none border-[3px] border-black dark:border-white transition-all duration-150 relative hover:z-20 cursor-pointer ${
        isLight
          ? "shadow-[5px_5px_0px_#000000] hover:shadow-[7px_7px_0px_#000000] hover:-translate-y-1 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#000000]"
          : "shadow-[5px_5px_0px_#FFE600] hover:shadow-[7px_7px_0px_#FFFFFF] hover:-translate-y-1 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#FFE600]"
      }`
    : `group flex flex-col p-[24px_22px_20px] rounded-[var(--card-radius)] glow-${project.glowColor} shadow-[var(--card-shadow)] hover:shadow-[var(--card-hover-shadow)] transition-all duration-200 hover:-translate-y-1 relative hover:z-20 cursor-pointer`;

  const containerStyle = isNeobrutalist ? { backgroundColor: neobrutalistBg } : undefined;

  if (external) {
    return (
      <a
        href={targetHref}
        target="_blank"
        rel="noopener noreferrer"
        className={containerClasses}
        style={containerStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={targetHref} className={containerClasses} style={containerStyle}>
      {content}
    </Link>
  );
}

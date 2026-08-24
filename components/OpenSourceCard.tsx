import Link from "next/link";
import { OPEN_SOURCE_PROJECTS, type OpenSourceProject } from "@/lib/data/open-source";

export function OpenSourceArt({ project }: { project: OpenSourceProject }) {
  const common = "transition-transform duration-200 group-hover:scale-105";

  if (project.id === "microsoft-aspire") {
    return (
      <div
        aria-label="Microsoft"
        role="img"
        className={`grid grid-cols-2 gap-[3px] w-[54px] h-[54px] ${common}`}
      >
        <span className="bg-[#f25022]" />
        <span className="bg-[#7fba00]" />
        <span className="bg-[#00a4ef]" />
        <span className="bg-[#ffb900]" />
      </div>
    );
  }

  if (project.id === "opensre") {
    return (
      <svg
        className={`${common} drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)]`}
        width="58"
        height="58"
        viewBox="0 0 64 64"
        fill="none"
        aria-label="OpenSRE"
        role="img"
      >
        <circle cx="32" cy="32" r="23" stroke={project.brandColor} strokeWidth="3" />
        <circle cx="32" cy="32" r="10" stroke={project.brandColor} strokeWidth="3" opacity="0.55" />
        <path d="M9 32h13l5-9 9 19 6-10h13" stroke={project.brandColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (project.id === "dockroute") {
    return (
      <svg
        className={`${common} drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)]`}
        width="58"
        height="58"
        viewBox="0 0 64 64"
        fill="none"
        aria-label="DockRoute"
        role="img"
      >
        <circle cx="15" cy="16" r="6" stroke={project.brandColor} strokeWidth="3" />
        <circle cx="49" cy="48" r="6" stroke={project.brandColor} strokeWidth="3" />
        <path d="M21 16h11c9 0 9 13 0 13h-4c-9 0-9 13 0 13h15" stroke={project.brandColor} strokeWidth="3" strokeLinecap="round" />
        <path d="m39 37 5 5-5 5" stroke={project.brandColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg
      className={`${common} drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)]`}
      width="58"
      height="58"
      viewBox="0 0 64 64"
      fill="none"
      aria-label="BetterGov PH"
      role="img"
    >
      <path d="M32 7 52 14v15c0 13-8.5 22.5-20 28C20.5 51.5 12 42 12 29V14L32 7Z" stroke={project.brandColor} strokeWidth="3" strokeLinejoin="round" />
      <path d="m23 32 6 6 13-14" stroke={project.brandColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OpenSourceCard({ project }: { project: OpenSourceProject }) {
  return (
    <Link
      href={project.pageHref}
      className={`group flex flex-col p-[24px_22px_20px] rounded-[var(--card-radius)] glow-${project.glowColor} shadow-[var(--card-shadow)] hover:shadow-[var(--card-hover-shadow)] transition-all duration-200 hover:-translate-y-1 relative hover:z-20 cursor-pointer`}
    >
      <div className="h-[110px] w-full flex items-center justify-center mb-5">
        <OpenSourceArt project={project} />
      </div>

      <h3 className="text-[17px] tracking-tight text-[var(--text-primary)] font-semibold font-[var(--font-heading)]">
        {project.name}
      </h3>
      <p className="mt-1 text-[11px] font-mono text-[var(--text-dim)]">
        {project.repository}
      </p>

      <p className="text-[13px] leading-[1.6] mt-2.5 mb-[18px] flex-grow text-[var(--text-muted)]">
        {project.summary}
      </p>

      <div className="flex justify-end items-end pt-1.5 mt-auto">
        <span className="text-[14px] text-[var(--text-arrow)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all">
          →
        </span>
      </div>
    </Link>
  );
}

export function OpenSourceGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {OPEN_SOURCE_PROJECTS.map((project) => (
        <OpenSourceCard key={project.id} project={project} />
      ))}
    </div>
  );
}

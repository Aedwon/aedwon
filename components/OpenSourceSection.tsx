import Link from "next/link";
import { OPEN_SOURCE_PROJECTS } from "@/lib/data/open-source";

const cardClass =
  "group block h-full rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]";

export default function OpenSourceSection() {
  return (
    <section id="open-source" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]">
            Open source
          </h2>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--text-dim)]">
            Recent upstream pull requests. Status checked August 24, 2026.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPEN_SOURCE_PROJECTS.map((project) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14.5px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)] group-hover:text-[var(--accent)] transition-colors">
                    {project.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-mono text-[var(--text-dim)]">
                    {project.repository}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-[var(--border-subtle)] bg-black/[0.03] dark:bg-white/[0.05] px-2 py-0.5 text-[10.5px] font-mono text-[var(--text-muted)]">
                  {project.statusLabel}
                </span>
              </div>

              <p className="mt-3 text-[13px] leading-[1.55] text-[var(--text-muted)]">
                {project.summary}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-mono text-[var(--text-dim)]">
                <span>{project.pullRequests.map((pr) => `#${pr.number}`).join(" · ")}</span>
                <span className="group-hover:text-[var(--text-primary)] transition-colors">
                  {project.external ? "View upstream ↗" : "View contribution →"}
                </span>
              </div>
            </>
          );

          return project.external ? (
            <a
              key={project.id}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cardClass}
            >
              {content}
            </a>
          ) : (
            <Link key={project.id} href={project.href} className={cardClass}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

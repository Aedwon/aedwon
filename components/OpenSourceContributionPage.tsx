import Link from "next/link";
import type { OpenSourceProject } from "@/lib/data/open-source";
import { OpenSourceArt } from "@/components/OpenSourceCard";

function getStatusColor(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("merged")) {
    return "color-mix(in srgb, var(--text-primary) 58%, #4f8a5f 42%)";
  }
  if (normalized.includes("draft")) {
    return "color-mix(in srgb, var(--text-primary) 58%, #8b7447 42%)";
  }
  if (normalized.includes("open")) {
    return "color-mix(in srgb, var(--text-primary) 58%, #527895 42%)";
  }

  return "var(--text-primary)";
}

function StatusText({ status }: { status: string }) {
  const color = getStatusColor(status);

  return (
    <span className="inline-flex items-center gap-2 font-medium" style={{ color }}>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{status}</span>
    </span>
  );
}

export default function OpenSourceContributionPage({
  project,
}: {
  project: OpenSourceProject;
}) {
  return (
    <div className="space-y-8 max-w-[760px] mx-auto">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
        >
          ← Back to all projects
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-[580px]">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[var(--text-dim)] mb-2">
              Open source contribution
            </p>
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] tracking-[-0.02em] font-[var(--font-heading)]">
              {project.name}
            </h1>
            <p className="mt-3 text-[15.5px] leading-[1.6] text-[var(--text-muted)]">
              {project.summary}
            </p>
          </div>

          <div className="flex gap-3 text-[13px] font-mono">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Website ↗
              </a>
            )}
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:underline"
            >
              Upstream repo ↗
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-[var(--border-subtle)]">
          <div>
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--text-dim)] block mb-1">
              Role
            </span>
            <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
              Upstream PR author
            </span>
          </div>
          <div>
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--text-dim)] block mb-1">
              Repository
            </span>
            <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
              {project.repository}
            </span>
          </div>
          <div>
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--text-dim)] block mb-1">
              Status
            </span>
            <span className="text-[13.5px]">
              <StatusText status={project.statusLabel} />
            </span>
          </div>
        </div>
      </header>

      <div className="h-[150px] flex items-center justify-center py-2">
        <div className="scale-125">
          <OpenSourceArt project={project} />
        </div>
      </div>

      <article className="space-y-10 text-[14.5px] sm:text-[15px] leading-[1.75] text-[var(--text-muted)]">
        <section className="space-y-4">
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)] border-b border-[var(--border-subtle)] pb-1.5">
            Submitted work
          </h2>

          <div className="space-y-6">
            {project.pullRequests.map((pr) => (
              <div key={pr.number} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-mono text-[var(--text-dim)]">
                      PR #{pr.number}
                    </p>
                    <h3 className="mt-1 text-[14.5px] font-semibold text-[var(--text-primary)]">
                      {pr.title}
                    </h3>
                  </div>
                  <span className="shrink-0 text-[11px] font-mono">
                    <StatusText status={pr.status} />
                  </span>
                </div>
                <p>{pr.summary}</p>
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-[12px] font-mono text-[var(--accent)] hover:underline"
                >
                  View pull request ↗
                </a>
              </div>
            ))}
          </div>
        </section>

        {project.reviewNotes?.length ? (
          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)] border-b border-[var(--border-subtle)] pb-1.5">
              Review history
            </h2>
            {project.reviewNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)] border-b border-[var(--border-subtle)] pb-1.5">
            Scope
          </h2>
          <p>
            This page documents work I submitted to the upstream repository and its current review state. It does not imply ownership or maintainership of {project.name}, and open or draft pull requests are not presented as merged work.
          </p>
        </section>
      </article>
    </div>
  );
}

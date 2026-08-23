import Link from "next/link";
import { BETTERGOV_PROJECT, getOpenSourceProject } from "@/lib/data/open-source";

export default function BetterGovContributionPage() {
  const contribution = getOpenSourceProject("bettergov-ph");
  if (!contribution) return null;

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
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] tracking-[-0.02em] font-[var(--font-heading)]">
                BetterGov PH
              </h1>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border-subtle)] text-[var(--text-dim)]">
                Open source
              </span>
            </div>
            <p className="mt-3 max-w-[660px] text-[15.5px] leading-[1.6] text-[var(--text-muted)]">
              {BETTERGOV_PROJECT.tagline}
            </p>
          </div>

          <div className="flex gap-3 text-[13px] font-mono">
            <a
              href="https://bettergov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              bettergov.ph ↗
            </a>
            <a
              href="https://github.com/bettergovph/bettergov"
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
              bettergovph/bettergov
            </span>
          </div>
          <div>
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--text-dim)] block mb-1">
              Current status
            </span>
            <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
              2 open PRs
            </span>
          </div>
        </div>
      </header>

      <article className="space-y-10 text-[14.5px] sm:text-[15px] leading-[1.75] text-[var(--text-muted)]">
        <section className="space-y-4">
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)]">
              Current pull requests
            </h2>
            <p className="mt-1 text-[12px] text-[var(--text-dim)]">
              Status checked August 24, 2026. Neither pull request is presented here as merged.
            </p>
          </div>

          <div className="space-y-3">
            {contribution.pullRequests.map((pr) => (
              <a
                key={pr.number}
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-mono text-[var(--text-dim)]">PR #{pr.number}</p>
                    <h3 className="mt-1 text-[14.5px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {pr.title}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[10.5px] font-mono text-[var(--text-muted)]">
                    {pr.status}
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--text-muted)]">
                  {pr.summary}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)] border-b border-[var(--border-subtle)] pb-1.5">
            Review history
          </h2>
          <p>
            The first documentation submission, PR #707, was closed without merge. A maintainer asked for the change to be recreated from current upstream main. PR #744 is that clean revision, limited to the contributor documentation update. I count #707 and #744 as one contribution thread, not two separate contributions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)] border-b border-[var(--border-subtle)] pb-1.5">
            Scope
          </h2>
          <p>
            I do not own or maintain BetterGov. This page documents the changes I submitted to the upstream repository and their current review state. The project website and upstream repository are linked above for the BetterGov project itself.
          </p>
        </section>
      </article>
    </div>
  );
}

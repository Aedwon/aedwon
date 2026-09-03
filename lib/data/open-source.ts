import type { ProjectItem } from "@/lib/data/projects";

export type PullRequestState = "draft" | "open" | "merged" | "closed";
export type PullRequestReviewState =
  | "pending"
  | "approved"
  | "changes_requested"
  | "not_applicable";

export interface PullRequestRelease {
  version: string;
  releasedAt?: string;
}

export interface UpstreamPullRequest {
  number: number;
  title: string;
  state: PullRequestState;
  reviewState: PullRequestReviewState;
  release?: PullRequestRelease;
  url: string;
  summary: string;
}

export interface OpenSourceProject {
  id: string;
  name: string;
  repository: string;
  repositoryUrl: string;
  projectUrl?: string;
  pageHref: string;
  summary: string;
  statusLabel: string;
  statusChecked: string;
  glowColor: "blue" | "purple" | "pink" | "violet" | "green" | "amber" | "cyan";
  brandColor: string;
  pullRequests: UpstreamPullRequest[];
  reviewNotes?: string[];
}

export function getPullRequestStatusLabel(
  pullRequest: Pick<UpstreamPullRequest, "state" | "reviewState" | "release">,
): string {
  if (pullRequest.state === "merged" && pullRequest.release) {
    return `Released · ${pullRequest.release.version}`;
  }

  if (pullRequest.state === "merged") return "Merged";
  if (pullRequest.state === "draft") return "Draft PR";
  if (pullRequest.state === "closed") return "Closed";
  if (pullRequest.reviewState === "approved") return "Approved";
  if (pullRequest.reviewState === "changes_requested") return "Changes requested";
  return "Open PR";
}

export function validateOpenSourceProjects(projects: unknown[]): string[] {
  const errors: string[] = [];
  const seenPullRequests = new Set<string>();

  for (const project of projects) {
    if (!project || typeof project !== "object") {
      errors.push("project record must be an object");
      continue;
    }

    const projectRecord = project as Record<string, unknown>;
    const repository =
      typeof projectRecord.repository === "string" ? projectRecord.repository : "";
    const pullRequests = Array.isArray(projectRecord.pullRequests)
      ? projectRecord.pullRequests
      : [];

    for (const pullRequest of pullRequests) {
      if (!pullRequest || typeof pullRequest !== "object") {
        errors.push(`${repository || "unknown repository"}: pull request record must be an object`);
        continue;
      }

      const record = pullRequest as Record<string, unknown>;
      const number = typeof record.number === "number" ? record.number : NaN;
      const identity = `${repository}#${String(record.number)}`;

      if (seenPullRequests.has(identity)) {
        errors.push(`${identity}: duplicate pull request`);
      }
      seenPullRequests.add(identity);

      if (record.release && record.state !== "merged") {
        errors.push(`${identity}: release requires merged state`);
      }

      const expectedUrl = Number.isFinite(number)
        ? `https://github.com/${repository}/pull/${number}`
        : null;
      if (!expectedUrl || record.url !== expectedUrl) {
        errors.push(`${identity}: URL does not match repository/number`);
      }
    }
  }

  return errors;
}

export const OPEN_SOURCE_PROJECTS: OpenSourceProject[] = [
  {
    id: "microsoft-aspire",
    name: "Microsoft Aspire",
    repository: "microsoft/aspire",
    repositoryUrl: "https://github.com/microsoft/aspire",
    projectUrl: "https://aspire.dev",
    pageHref: "/projects/contributions/microsoft-aspire",
    summary: "Code-first tooling for building, observing, and deploying distributed applications.",
    statusLabel: "Draft PR",
    statusChecked: "2026-08-24",
    glowColor: "blue",
    brandColor: "#00A4EF",
    pullRequests: [
      {
        number: 19614,
        title: "fix(cli): show resource command help for invalid arguments",
        state: "draft",
        reviewState: "pending",
        url: "https://github.com/microsoft/aspire/pull/19614",
        summary: "Shows resolved command help after invalid command-specific arguments without changing the machine-readable load-arguments path.",
      },
    ],
    reviewNotes: [
      "The current draft includes the fixes requested in review around output ordering, end-to-end coverage, and the machine-readable `--load-arguments` path. Upstream workflows are waiting for repository approval before CI can run on the latest head.",
    ],
  },
  {
    id: "opensre",
    name: "OpenSRE",
    repository: "Tracer-Cloud/opensre",
    repositoryUrl: "https://github.com/Tracer-Cloud/opensre",
    pageHref: "/projects/contributions/opensre",
    summary: "Open-source toolkit for building AI SRE agents for observability, incident response, and remediation.",
    statusLabel: "1 released · 1 closed PR",
    statusChecked: "2026-09-03",
    glowColor: "purple",
    brandColor: "#818CF8",
    pullRequests: [
      {
        number: 5634,
        title: "feat(victoria_logs): add citeable query evidence",
        state: "merged",
        reviewState: "approved",
        release: { version: "v0.1.2026.8.31", releasedAt: "2026-08-31" },
        url: "https://github.com/Tracer-Cloud/opensre/pull/5634",
        summary: "Adds a VictoriaLogs evidence mapper and focused regression coverage, with repeated-query behavior removed after review identified an unsupported aggregation path.",
      },
      {
        number: 5959,
        title: "feat(cloudwatch): add citeable Lambda inspection evidence",
        state: "closed",
        reviewState: "pending",
        url: "https://github.com/Tracer-Cloud/opensre/pull/5959",
        summary: "Adds compact citeable evidence for successful AWS Lambda inspections while excluding environment variables, source contents, ARNs, and other sensitive or oversized fields.",
      },
    ],
    reviewNotes: [
      "Reviewer feedback on PR #5634 identified an unsupported repeated-query aggregation path. I removed that behavior and kept the contribution focused on the evidence-mapping path supported by the existing implementation.",
      "PR #5634 passed the upstream CI and synthetic deterministic test suites, received a 5/5 Greptile confidence score with no blocking failure reported, and was merged upstream on August 30, 2026. The merged commit shipped in OpenSRE v0.1.2026.8.31 on August 31, 2026.",
      "PR #5959 passed upstream CI, Synthetic Deterministic Tests, the interactive-shell workflow, and reached Greptile 5/5 on head `35bbe29bfd9f8d0459836eb8ac8b9dba08fb23a0`. Maintainer cerencamkiran closed the draft without merge on September 3, 2026 and did not leave an explanatory maintainer comment, so the portfolio records the closure without inferring a reason.",
    ],
  },
  {
    id: "dockroute",
    name: "DockRoute",
    repository: "Dockroute/Dockroute",
    repositoryUrl: "https://github.com/Dockroute/Dockroute",
    projectUrl: "https://www.dockroute.dev",
    pageHref: "/projects/contributions/dockroute",
    summary: "External-DNS for plain Docker hosts, keeping DNS records aligned with container routes.",
    statusLabel: "Released · v0.3.2",
    statusChecked: "2026-08-24",
    glowColor: "cyan",
    brandColor: "#06B6D4",
    pullRequests: [
      {
        number: 41,
        title: "docs: document warning troubleshooting",
        state: "merged",
        reviewState: "approved",
        release: { version: "v0.3.2" },
        url: "https://github.com/Dockroute/Dockroute/pull/41",
        summary: "Documents current warning patterns against the source and explains the matching label, environment, DNS, ingress, and ownership remedies.",
      },
    ],
    reviewNotes: [
      "The maintainer checked all twelve documented warning strings against the implementation, approved the change, and merged it on August 24, 2026. The contribution shipped in DockRoute v0.3.2.",
    ],
  },
  {
    id: "bettergov-ph",
    name: "BetterGov PH",
    repository: "bettergovph/bettergov",
    repositoryUrl: "https://github.com/bettergovph/bettergov",
    projectUrl: "https://bettergov.ph",
    pageHref: "/projects/bettergov-ph",
    summary: "Open-source effort building a better national website for the Philippines.",
    statusLabel: "1 approved · 1 open PR",
    statusChecked: "2026-09-03",
    glowColor: "green",
    brandColor: "#34D399",
    pullRequests: [
      {
        number: 706,
        title: "feat: add government acronym tooltip wrapper",
        state: "open",
        reviewState: "pending",
        url: "https://github.com/bettergovph/bettergov/pull/706",
        summary: "Adds a reusable React wrapper for Philippine government acronyms using Radix UI tooltips, backed by acronym data and tests.",
      },
      {
        number: 744,
        title: "docs: align PR instructions with pull request template",
        state: "open",
        reviewState: "approved",
        url: "https://github.com/bettergovph/bettergov/pull/744",
        summary: "Recreates the documentation-only contribution on current upstream main after maintainer feedback and aligns CONTRIBUTING guidance with the repository PR template.",
      },
    ],
    reviewNotes: [
      "Maintainer KishonShrill put PR #706 on standby on July 31, 2026 because they did not yet have a clear place to use the feature. The PR remains open, so its lifecycle state stays open instead of being recorded as rejected or closed.",
      "The first documentation submission, PR #707, was closed without merge. A maintainer asked for the change to be recreated from current upstream main. PR #744 is that clean revision, limited to the contributor documentation update. I count #707 and #744 as one contribution thread, not two separate contributions.",
      "Maintainer KishonShrill approved PR #744 on September 1, 2026. The PR remains open upstream, so the portfolio records it as approved but not merged.",
    ],
  },
];

export const BETTERGOV_PROJECT: ProjectItem = {
  slug: "bettergov-ph",
  title: "BetterGov PH",
  tagline: "Upstream BetterGov work covering a government-acronym tooltip and contributor documentation.",
  category: "civic",
  categoryLabel: "Civic Tech",
  tier: "focused",
  role: "Upstream PR Author",
  timeline: "2026",
  featured: false,
  order: 7,
  glowColor: "green",
  brandColor: "#34D399",
  icon: "shield-check",
  platforms: [{ name: "Web", icon: "web" }],
  stack: [
    { name: "TypeScript", icon: "typescript" },
    { name: "React", icon: "react" },
    { name: "Radix UI", icon: "radix" },
    { name: "Markdown", icon: "markdown" },
  ],
  liveUrl: "https://bettergov.ph",
  githubUrl: "https://github.com/bettergovph/bettergov/pulls?q=is%3Apr+author%3AAedwon",
  summary: "Two open upstream BetterGov PRs. PR #706 is on maintainer standby, while PR #744 has maintainer approval and is awaiting merge.",
  problem: "This entry documents submitted upstream work to bettergovph/bettergov. I do not own or maintain BetterGov. PR #706 remains open but is on maintainer standby, while PR #744 is maintainer-approved and still open.",
  architecture: [],
  results: "PR #744 received maintainer approval on September 1, 2026 and remains open upstream. PR #706 remains open and has been on maintainer standby since July 31, 2026. The earlier documentation PR #707 was closed without merge and was replaced by #744 after maintainer feedback.",
  articleSections: [
    {
      title: "Government acronym tooltip",
      paragraphs: [
        "PR #706 adds a reusable `TextWithAcronyms` React component that wraps known Philippine government acronyms with Radix UI tooltips. The pull request also adds the acronym data and focused tests.",
        "The pull request remains open upstream. On July 31, 2026, maintainer KishonShrill put it on standby because they did not yet have a clear place to use the feature, so this portfolio records it as submitted work instead of shipped BetterGov functionality.",
      ],
    },
    {
      title: "Contributor documentation after maintainer feedback",
      paragraphs: [
        "The first documentation PR, #707, updated the CONTRIBUTING guidance but was closed without merge. A maintainer asked for a fresh revision based on current upstream main. PR #744 recreates only that documentation change and aligns the contribution instructions with the repository's actual pull request template.",
        "PR #744 received maintainer approval on September 1, 2026 and remains open upstream. I count #707 and #744 as one contribution thread, not two separate contributions.",
      ],
    },
    {
      title: "Current scope",
      paragraphs: [
        "I do not own or maintain BetterGov. This page records the changes I submitted upstream and their review state. The BetterGov website and repository links remain available for the project itself.",
      ],
    },
  ],
};

export function getOpenSourceProject(id: string): OpenSourceProject | undefined {
  return OPEN_SOURCE_PROJECTS.find((project) => project.id === id);
}

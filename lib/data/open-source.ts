import type { ProjectItem } from "@/lib/data/projects";

export interface UpstreamPullRequest {
  number: number;
  title: string;
  status: "Open PR" | "Draft PR" | "Merged";
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
        status: "Draft PR",
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
    statusLabel: "Open PR",
    statusChecked: "2026-08-28",
    glowColor: "purple",
    brandColor: "#818CF8",
    pullRequests: [
      {
        number: 5634,
        title: "feat(victoria_logs): add citeable query evidence",
        status: "Open PR",
        url: "https://github.com/Tracer-Cloud/opensre/pull/5634",
        summary: "Adds a VictoriaLogs evidence mapper and focused regression coverage, with repeated-query behavior removed after review identified an unsupported aggregation path.",
      },
    ],
    reviewNotes: [
      "Reviewer feedback identified an unsupported repeated-query aggregation path. I removed that behavior and kept the contribution focused on the evidence-mapping path supported by the existing implementation.",
      "The current head has a 5/5 Greptile confidence score with no blocking failure reported and is ready for review. The upstream GitHub Actions workflows are still waiting for repository approval before they can run.",
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
    statusLabel: "Merged · v0.3.2",
    statusChecked: "2026-08-24",
    glowColor: "cyan",
    brandColor: "#06B6D4",
    pullRequests: [
      {
        number: 41,
        title: "docs: document warning troubleshooting",
        status: "Merged",
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
    statusLabel: "2 open PRs",
    statusChecked: "2026-08-24",
    glowColor: "green",
    brandColor: "#34D399",
    pullRequests: [
      {
        number: 706,
        title: "feat: add government acronym tooltip wrapper",
        status: "Open PR",
        url: "https://github.com/bettergovph/bettergov/pull/706",
        summary: "Adds a reusable React wrapper for Philippine government acronyms using Radix UI tooltips, backed by acronym data and tests.",
      },
      {
        number: 744,
        title: "docs: align PR instructions with pull request template",
        status: "Open PR",
        url: "https://github.com/bettergovph/bettergov/pull/744",
        summary: "Recreates the documentation-only contribution on current upstream main after maintainer feedback and aligns CONTRIBUTING guidance with the repository PR template.",
      },
    ],
    reviewNotes: [
      "The first documentation submission, PR #707, was closed without merge. A maintainer asked for the change to be recreated from current upstream main. PR #744 is that clean revision, limited to the contributor documentation update. I count #707 and #744 as one contribution thread, not two separate contributions.",
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
  summary: "Two open upstream BetterGov PRs covering a reusable government-acronym tooltip component and contributor documentation aligned with the repository's PR template.",
  problem: "This entry documents submitted upstream work to bettergovph/bettergov. I do not own or maintain BetterGov, and neither current pull request is presented as merged.",
  architecture: [],
  results: "PR #706 and PR #744 are open upstream as of August 24, 2026. The earlier documentation PR #707 was closed without merge and was replaced by #744 after maintainer feedback.",
  articleSections: [
    {
      title: "Government acronym tooltip",
      paragraphs: [
        "PR #706 adds a reusable `TextWithAcronyms` React component that wraps known Philippine government acronyms with Radix UI tooltips. The pull request also adds the acronym data and focused tests.",
        "The pull request is open upstream. It has not been merged, so this portfolio treats it as submitted work instead of shipped BetterGov functionality.",
      ],
    },
    {
      title: "Contributor documentation after maintainer feedback",
      paragraphs: [
        "The first documentation PR, #707, updated the CONTRIBUTING guidance but was closed without merge. A maintainer asked for a fresh revision based on current upstream main. PR #744 recreates only that documentation change and aligns the contribution instructions with the repository's actual pull request template.",
        "PR #744 is open upstream. I count #707 and #744 as one contribution thread, not two separate contributions.",
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

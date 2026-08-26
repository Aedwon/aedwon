import { PROJECTS, type ProjectItem } from "@/lib/data/projects";
import { AI_AGENT_CONFIG_PROJECT } from "@/lib/data/ai-agent-config";
import { BETTERGOV_PROJECT } from "@/lib/data/open-source";

export type RegisteredProject = ProjectItem;

export const PROJECT_ALIASES = {
  "sb-norala": "norala-sb-portal",
  bettergov: "bettergov-ph",
  "psysc-scorer": "pso-scoring-model",
  "msl-bot": "msl-collegiate-cup-bot",
  "ilocos-sur-bot": "ilocos-sur-esports-bot",
  "oppo-bot": "oppo-legend-cup-bot",
  "gi-calculator": "gi-damage-calculator",
  "agent-framework": "ai-agent-framework",
  "ai-agent-config": "ai-agent-framework",
} as const satisfies Record<string, string>;

export const UNDER_CONSTRUCTION_PROJECT_SLUGS = new Set([
  "pso-scoring-model",
  "gi-damage-calculator",
]);

const PORTFOLIO_PROJECTS = PROJECTS.map((project) => {
  if (project.slug === "bettergov-ph") return BETTERGOV_PROJECT;
  if (project.slug === "ai-agent-framework") return AI_AGENT_CONFIG_PROJECT;
  return project;
});

export const ALL_PROJECTS: RegisteredProject[] = [...PORTFOLIO_PROJECTS].sort(
  (a, b) => a.order - b.order,
);

const PROJECTS_BY_SLUG = new Map(
  ALL_PROJECTS.map((project) => [project.slug, project] as const),
);

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const NORMALIZED_PROJECT_SLUGS = new Map(
  ALL_PROJECTS.map((project) => [normalizeSlug(project.slug), project.slug] as const),
);

export function resolveProjectSlug(slug: string): string | undefined {
  if (PROJECTS_BY_SLUG.has(slug)) return slug;

  const aliased = PROJECT_ALIASES[slug as keyof typeof PROJECT_ALIASES];
  if (aliased) return aliased;

  return NORMALIZED_PROJECT_SLUGS.get(normalizeSlug(slug));
}

export function getProjectBySlug(slug: string): RegisteredProject | undefined {
  const resolvedSlug = resolveProjectSlug(slug);
  return resolvedSlug ? PROJECTS_BY_SLUG.get(resolvedSlug) : undefined;
}

export function getFeaturedProjects(): RegisteredProject[] {
  return ALL_PROJECTS.filter((project) => project.featured);
}

export function getCaseStudyProjects(): RegisteredProject[] {
  return ALL_PROJECTS;
}

export function isProjectIndexable(slug: string): boolean {
  return !UNDER_CONSTRUCTION_PROJECT_SLUGS.has(slug);
}

export function getNextProject(slug: string): RegisteredProject | undefined {
  const projects = getCaseStudyProjects();
  if (projects.length === 0) return undefined;

  const resolvedSlug = resolveProjectSlug(slug);
  const index = projects.findIndex((project) => project.slug === resolvedSlug);
  if (index < 0) return undefined;

  return projects[(index + 1) % projects.length];
}

import type { ProjectItem } from "@/lib/data/projects";

export const AI_AGENT_CONFIG_PROJECT: ProjectItem = {
  slug: "ai-agent-framework",
  title: "AI Agent Config",
  tagline:
    "Portable policy and workflow system for coding agents that keeps canonical rules provider-neutral and renders thin adapters for each environment.",
  category: "web",
  categoryLabel: "Web & Tools",
  tier: "focused",
  role: "Creator & Maintainer",
  timeline: "2026 to Present",
  featured: false,
  order: 12,
  glowColor: "pink",
  brandColor: "#F43F5E",
  icon: "terminal",
  platforms: [{ name: "CLI & IDE Tooling", icon: "server" }],
  stack: [
    { name: "Python", icon: "python" },
    { name: "Markdown", icon: "markdown" },
    { name: "JSON", icon: "json" },
    { name: "YAML", icon: "yaml" },
  ],
  githubUrl: "https://github.com/Aedwon/ai-agent-config",
  summary:
    "Portable configuration system for coding agents that composes shared policy, project rules, and selected workflows into provider-specific instruction files.",
  problem:
    "Agent instructions tend to become tied to one provider or get copied between repositories until the copies drift. AI Agent Config keeps the durable policy in one provider-neutral system and makes each project's selected configuration explicit.",
  architecture: [],
  results:
    "The public v2 repository can initialize adoption manifests, validate the configuration tree, render selected rules to a staging directory, and compare generated output against an explicit target before anything is installed.",
  articleSections: [
    {
      title: "Keeping the rules provider-neutral",
      paragraphs: [
        "The canonical rules do not live in `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or another provider-owned entry file. `core/` holds the universal contract, while project rules, project-type overlays, workflows, and optional personal preferences stay in separate layers. Provider entry files are generated projections of that selected policy instead of becoming the source of truth themselves.",
        "The adapters are deliberately thin. The current repository can render project instructions for Codex, Claude Code, Gemini CLI, Google Antigravity IDE, or a generic agent entry point. Switching providers changes where the instructions are discovered. It does not silently replace the policy body that the project selected.",
      ],
    },
    {
      title: "Adopting only as much structure as a project needs",
      paragraphs: [
        "The setup is split into four adoption levels. A minimal project can use only the universal baseline. Normal projects add project-owned rules and a project-type overlay. Agent-heavy repositories can opt into planning, delegation, worktrees, deeper review, and other workflows. Provider-native or global configuration is kept as a separate level because it has a wider blast radius.",
        "Levels 2 and 3 use an explicit JSON manifest. The renderer reads that manifest and composes the universal core with the project's own rules, selected overlays, and selected workflows. A private profile can be supplied separately for preferences such as tone or verbosity, but it sits below project rules and cannot grant mutation authority.",
      ],
    },
    {
      title: "Staging changes before installation",
      paragraphs: [
        "The tooling uses Python's standard library and keeps configuration changes explicit. `init` creates the adoption manifest, `validate` checks the repository, `render` writes the selected configuration under a user-supplied staging root, and `diff` compares that generated output with a user-supplied target. The normal path ends with a reviewable file in staging, not an automatic write into a provider's configuration directory.",
        "That boundary is intentional. The renderer does not discover a home directory, copy credentials, manage provider caches, or install plug-ins. It also rejects output below the source tree and checks for path or symlink escapes. The project treats instruction files as behavioral context, while provider-native permissions and sandboxing remain responsible for controls that need technical enforcement.",
      ],
    },
  ],
};

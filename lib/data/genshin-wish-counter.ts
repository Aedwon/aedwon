import type { ProjectItem } from "./projects";

export const GENSHIN_WISH_COUNTER_PROJECT: ProjectItem = {
  slug: "genshin-wish-counter",
  title: "Genshin Wish Counter",
  tagline: "Read-only dashboard for my Genshin Impact wish history, pity, and 50/50 results.",
  category: "web",
  categoryLabel: "Web & Tools",
  tier: "focused",
  role: "Creator & Developer",
  timeline: "2026",
  featured: false,
  order: 14,
  glowColor: "blue",
  brandColor: "#60A5FA",
  icon: "sparkles",
  platforms: [{ name: "Web", icon: "web" }],
  stack: [
    { name: "Next.js 16", icon: "nextjs" },
    { name: "React 19", icon: "react" },
    { name: "TypeScript", icon: "typescript" },
    { name: "Vitest", icon: "test" },
  ],
  githubUrl: "https://github.com/Aedwon/aedwon",
  summary: "Read-only portfolio dashboard for my Genshin Impact wish history, with pity, 50/50 state, and five-star pull statistics derived from static normalized records.",
  problem: "I wanted a small personal wish counter inside my portfolio without turning the site into a public tracker or storing temporary HoYoVerse credentials.",
  architecture: [],
  results: "The page is designed to render my saved wish history as a compact read-only dashboard. Real statistics are published only after the normalized history is imported.",
};

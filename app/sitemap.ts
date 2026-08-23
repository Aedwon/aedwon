import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/data/blogs";
import { OPEN_SOURCE_PROJECTS } from "@/lib/data/open-source";
import { getCaseStudyProjects } from "@/lib/data/project-registry";
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getCaseStudyProjects().map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: SITE_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: project.featured ? 0.85 : 0.7,
  }));

  const contributionRoutes: MetadataRoute.Sitemap = OPEN_SOURCE_PROJECTS
    .filter((project) => project.id !== "bettergov-ph")
    .map((project) => ({
      url: new URL(project.pageHref, SITE_URL).toString(),
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blogs/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...projectRoutes, ...contributionRoutes, ...blogRoutes];
}

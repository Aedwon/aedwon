import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Site from "@/components/design-v3/Site";
import { PROJECTS } from "@/lib/design-v3/data/projects";
import { SITE_URL } from "@/lib/site-content";
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, PERSON_JSON_LD_REF, serializeJsonLd } from "@/lib/seo";

const posts = () => PROJECTS.filter((p) => p.type === "Writing");
const findPost = (slug: string) => posts().find((p) => p.id === slug);
// "Aug 24, 2026" -> an ISO date; undefined while a post still carries a placeholder date
const isoDate = (date?: string) => { const t = date ? Date.parse(date) : NaN; return Number.isNaN(t) ? undefined : new Date(t).toISOString(); };

// Every Writing entry is statically renderable.
export function generateStaticParams() {
  return posts().map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return { title: "Post Not Found", robots: { index: false } };
  return buildPageMetadata({
    title: `${post.name} | Aerol (Aedwon)`,
    description: post.desc,
    path: `/writing/${post.id}`,
    type: "article",
    publishedTime: isoDate(post.date),
  });
}

export default async function WritingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const path = `/writing/${post.id}`;
  const jsonLd = serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${absoluteUrl(path)}#article`,
        headline: post.name,
        description: post.desc,
        url: absoluteUrl(path),
        mainEntityOfPage: absoluteUrl(path),
        datePublished: isoDate(post.date),
        author: PERSON_JSON_LD_REF,
        image: `${SITE_URL}/opengraph-image`,
        keywords: (post.topic ?? "").split(" · ").filter(Boolean),
        inLanguage: "en",
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Writing", path: "/index" },
        { name: post.name, path },
      ]),
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Site initialPath={path} />
    </>
  );
}

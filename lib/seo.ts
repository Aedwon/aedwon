import type { Metadata } from "next";
import { PERSON_NAME, SITE_NAME, SITE_URL } from "@/lib/site-content";

const SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${PERSON_NAME}`,
} as const;

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  article?: boolean;
  publishedTime?: string;
  robots?: Metadata["robots"];
}

export function buildPageMetadata({
  title,
  description,
  path,
  article = false,
  publishedTime,
  robots,
}: PageMetadataOptions): Metadata {
  const openGraph: Metadata["openGraph"] = article
    ? {
        title,
        description,
        url: path,
        siteName: SITE_NAME,
        type: "article",
        publishedTime,
        authors: [`${SITE_URL}/about`],
        images: [SOCIAL_IMAGE],
      }
    : {
        title,
        description,
        url: path,
        siteName: SITE_NAME,
        type: "website",
        images: [SOCIAL_IMAGE],
      };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    robots,
  };
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  } as const;
}

export const PERSON_JSON_LD_REF = { "@id": `${SITE_URL}/#person` } as const;

/** @vitest-environment node */

import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import { metadata as cropperMetadata } from "../logo-cropper/layout";
import { metadata as sizingMetadata } from "../logo-sizing/layout";
import {
  PERSON_JSON_LD,
  SITE_URL,
  WEBSITE_JSON_LD,
} from "@/lib/site-content";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import { isProjectIndexable } from "@/lib/data/project-registry";

describe("SEO metadata contracts", () => {
  it("uses www.aedwon.com as the single canonical origin", () => {
    expect(SITE_URL).toBe("https://www.aedwon.com");
    expect(absoluteUrl("/projects/pantas")).toBe(
      "https://www.aedwon.com/projects/pantas",
    );
    expect(PERSON_JSON_LD).toMatchObject({
      "@id": "https://www.aedwon.com/#person",
      url: SITE_URL,
    });
    expect(WEBSITE_JSON_LD).toMatchObject({
      "@id": "https://www.aedwon.com/#website",
      url: SITE_URL,
      author: { "@id": "https://www.aedwon.com/#person" },
    });
  });

  it("builds complete page-specific Open Graph and Twitter metadata", () => {
    const publishedTime = "2026-08-24T00:00:00.000Z";
    const metadata = buildPageMetadata({
      title: "Example article — Aerol (Aedwon)",
      description: "An example description.",
      path: "/blogs/example",
      type: "article",
      publishedTime,
    });

    expect(metadata.alternates).toEqual({ canonical: "/blogs/example" });
    expect(metadata.openGraph).toMatchObject({
      title: "Example article — Aerol (Aedwon)",
      description: "An example description.",
      url: "/blogs/example",
      siteName: "Aedwon",
      type: "article",
      publishedTime,
      authors: [`${SITE_URL}/about`],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Example article — Aerol (Aedwon)",
      description: "An example description.",
      images: ["/opengraph-image"],
    });
  });

  it("builds absolute breadcrumb URLs on the canonical host", () => {
    expect(
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: "Pantas", path: "/projects/pantas" },
      ]),
    ).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, item: "https://www.aedwon.com/" },
        { position: 2, item: "https://www.aedwon.com/projects" },
        { position: 3, item: "https://www.aedwon.com/projects/pantas" },
      ],
    });
  });

  it("keeps thin project placeholders and internal logo tools out of search", () => {
    expect(isProjectIndexable("pantas")).toBe(true);
    expect(isProjectIndexable("pso-scoring-model")).toBe(false);
    expect(isProjectIndexable("gi-damage-calculator")).toBe(false);
    expect(cropperMetadata.robots).toEqual({ index: false, follow: false });
    expect(sizingMetadata.robots).toEqual({ index: false, follow: false });
  });

  it("permanently redirects the apex host to www", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/:path*",
          has: [{ type: "host", value: "aedwon.com" }],
          destination: "https://www.aedwon.com/:path*",
          permanent: true,
        }),
      ]),
    );
  });
});

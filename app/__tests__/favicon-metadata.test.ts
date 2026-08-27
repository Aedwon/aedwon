import { describe, it, expect } from "vitest";
import { metadata } from "../layout";
import manifest from "../manifest";
import { PERSON_JSON_LD, SITE_URL, WEBSITE_JSON_LD } from "../../lib/site-content";

describe("Metadata and Manifest Verification", () => {
  it("exports complete homepage identity metadata", () => {
    expect(metadata.title).toBe("Aedwon — Aerol Balayon");
    expect(metadata.metadataBase?.toString()).toBe(`${SITE_URL}/`);
    expect(metadata.alternates).toMatchObject({ canonical: "/" });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "/",
      siteName: "Aedwon",
    });
    expect(metadata.openGraph?.images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "/opengraph-image" }),
      ]),
    );
  });

  it("uses Person and WebSite JSON-LD for the personal portfolio", () => {
    expect(PERSON_JSON_LD["@type"]).toBe("Person");
    expect(PERSON_JSON_LD.name).toBe("Aerol Balayon");
    expect(PERSON_JSON_LD.alternateName).toBe("Aedwon");
    expect(PERSON_JSON_LD.url).toBe(SITE_URL);
    expect(PERSON_JSON_LD["@id"]).toBe(`${SITE_URL}/#person`);
    expect("address" in PERSON_JSON_LD).toBe(false);

    expect(WEBSITE_JSON_LD).toMatchObject({
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      author: { "@id": `${SITE_URL}/#person` },
    });
  });

  it("exports manifest with correct branding", () => {
    const data = manifest();
    expect(data.name).toBe("Aedwon");
    expect(data.short_name).toBe("Aedwon");
    expect(data.theme_color).toBe("#18181B");
    expect(data.background_color).toBe("#18181B");
  });
});

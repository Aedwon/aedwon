import TrustPage from "@/components/TrustPage";
import { ABOUT_CONTENT, SITE_URL } from "@/lib/site-content";
import {
  absoluteUrl,
  buildPageMetadata,
  PERSON_JSON_LD_REF,
  serializeJsonLd,
} from "@/lib/seo";

const title = "About — Aerol Balayon (Aedwon)";

export const metadata = buildPageMetadata({
  title,
  description: ABOUT_CONTENT.description,
  path: "/about",
  type: "profile",
});

const profilePageJsonLd = serializeJsonLd({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/about#profile-page`,
  url: absoluteUrl("/about"),
  name: title,
  description: ABOUT_CONTENT.description,
  mainEntity: PERSON_JSON_LD_REF,
  inLanguage: "en",
});

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: profilePageJsonLd }}
      />
      <TrustPage content={ABOUT_CONTENT} />
    </>
  );
}

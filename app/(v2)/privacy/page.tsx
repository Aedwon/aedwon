import TrustPage from "@/components/TrustPage";
import { PRIVACY_CONTENT } from "@/lib/site-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Privacy — Aedwon",
  description: PRIVACY_CONTENT.description,
  path: "/privacy",
});

export default function PrivacyPage() {
  return <TrustPage content={PRIVACY_CONTENT} />;
}

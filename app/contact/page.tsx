import TrustPage from "@/components/TrustPage";
import { CONTACT_CONTENT } from "@/lib/site-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contact — Aerol Balayon (Aedwon)",
  description: CONTACT_CONTENT.description,
  path: "/contact",
});

export default function ContactPage() {
  return <TrustPage content={CONTACT_CONTENT} />;
}

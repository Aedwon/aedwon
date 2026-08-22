import type { Metadata } from "next";
import TrustPage from "@/components/TrustPage";
import { CONTACT_CONTENT } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact — Aerol Balayon (Aedwon)",
  description: CONTACT_CONTENT.description,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Aerol Balayon (Aedwon)",
    description: CONTACT_CONTENT.description,
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return <TrustPage content={CONTACT_CONTENT} />;
}

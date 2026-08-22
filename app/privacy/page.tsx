import type { Metadata } from "next";
import TrustPage from "@/components/TrustPage";
import { PRIVACY_CONTENT } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Privacy — Aedwon",
  description: PRIVACY_CONTENT.description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy — Aedwon",
    description: PRIVACY_CONTENT.description,
    url: "/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <TrustPage content={PRIVACY_CONTENT} />;
}

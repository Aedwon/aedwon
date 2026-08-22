import type { Metadata } from "next";
import TrustPage from "@/components/TrustPage";
import { ABOUT_CONTENT } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About — Aerol Balayon (Aedwon)",
  description: ABOUT_CONTENT.description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Aerol Balayon (Aedwon)",
    description: ABOUT_CONTENT.description,
    url: "/about",
    type: "profile",
  },
};

export default function AboutPage() {
  return <TrustPage content={ABOUT_CONTENT} />;
}

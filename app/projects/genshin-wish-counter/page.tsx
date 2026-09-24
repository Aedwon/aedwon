import type { Metadata } from "next";
import GenshinWishCounterPage from "@/components/GenshinWishCounterPage";
import { GENSHIN_WISHES } from "@/lib/data/genshin-wishes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Genshin Wish Counter — Aerol (Aedwon)",
  description: "Aerol's read-only Genshin Impact wish history dashboard with pity and five-star pull statistics.",
  path: "/projects/genshin-wish-counter",
});

export default function GenshinWishCounterProjectPage() {
  return <GenshinWishCounterPage wishes={GENSHIN_WISHES} />;
}

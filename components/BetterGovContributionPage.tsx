import OpenSourceContributionPage from "@/components/OpenSourceContributionPage";
import { getOpenSourceProject } from "@/lib/data/open-source";

export default function BetterGovContributionPage() {
  const contribution = getOpenSourceProject("bettergov-ph");
  if (!contribution) return null;

  return <OpenSourceContributionPage project={contribution} />;
}

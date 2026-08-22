import HeroSection from "@/components/HeroSection";
import FeaturedProjects from "@/components/FeaturedProjects";
import OpenSourceSection from "@/components/OpenSourceSection";
import AffiliationsGrid from "@/components/AffiliationsGrid";
import ExperienceDossier from "@/components/ExperienceDossier";
import AboutSection from "@/components/AboutSection";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <HeroSection />
      <FeaturedProjects />
      <OpenSourceSection />
      <AffiliationsGrid />
      <ExperienceDossier />
      <AboutSection />
    </div>
  );
}

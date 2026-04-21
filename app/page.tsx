import HeroSection from "@/components/HeroSection";
import ServicesStatusStrip from "@/components/ServicesStatusStrip";
import TwoOfferSplit from "@/components/TwoOfferSplit";
import FeaturedProjects from "@/components/FeaturedProjects";
import HowItWorks from "@/components/HowItWorks";
import WhoThisIsFor from "@/components/WhoThisIsFor";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ServicesStatusStrip />
      <TwoOfferSplit />
      <FeaturedProjects />
      <HowItWorks />
      <WhoThisIsFor />
      <FAQ />
      <CTASection />
    </main>
  );
}

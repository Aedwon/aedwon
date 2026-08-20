"use client";

import React from "react";
import { useTheme } from "@/components/ThemeContext";
import HeroSection from "@/components/HeroSection";
import FeaturedProjects from "@/components/FeaturedProjects";
import OpenSourceSection from "@/components/OpenSourceSection";
import AffiliationsGrid from "@/components/AffiliationsGrid";
import ExperienceDossier from "@/components/ExperienceDossier";
import AboutSection from "@/components/AboutSection";
import DiscordHeroSection from "@/components/DiscordHeroSection";

export default function HomePage() {
  const { theme } = useTheme();

  if (theme === "discord") {
    return <DiscordHeroSection />;
  }

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

import { CapabilitiesMarquee } from "@/components/sections/CapabilitiesMarquee";
import { CtaHorizonSection } from "@/components/sections/CtaHorizonSection";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ServicesShowcaseSection } from "@/components/sections/ServicesShowcaseSection";
import { getFeaturedProjects } from "@/lib/portfolio-repository";

export const revalidate = 3600;

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <>
      <HeroSection />
      <CapabilitiesMarquee />
      <FeaturedWorkSection projects={featuredProjects} />
      <ServicesShowcaseSection />
      <ProcessSection />
      <CtaHorizonSection />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Info } from "lucide-react";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { CtaHorizonSection } from "@/components/sections/CtaHorizonSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getPortfolioProjects } from "@/lib/portfolio-repository";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Portfolio & Case Studies",
  description:
    "Explore ORBIT's dynamic creative portfolio across Videography, Photography, Graphic Design, Motion Graphics, and Event Experiences.",
};

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();
  const hasPlaceholders = projects.some((p) => p.isPlaceholder);

  return (
    <>
      <section className="relative bg-[#F5F8F8] pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[360px] orbit-grid-bg opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Dynamic Portfolio Archive"
            title="Crafted For Live Stages, Global Feeds & Sold-Out Rooms"
            description="Browse our work across Videography, Photography, Graphic Design, Motion Graphics, and Event Experiences—powered by Cloudinary adaptive media delivery."
          />

          {hasPlaceholders && (
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#39A959]/30 bg-white px-5 py-4 text-xs leading-relaxed text-[#486369] shadow-xs">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-[#074E5B]"
                aria-hidden="true"
              />
              <p>
                <strong className="font-semibold text-[#08242B]">
                  Placeholder Showcase Mode:
                </strong>{" "}
                The portfolio items below are clearly labeled placeholder
                projects spanning all 5 categories. Add live rows to{" "}
                <code className="font-semibold text-[#074E5B]">
                  portfolio_projects
                </code>{" "}
                in Supabase with Cloudinary media IDs or URLs to publish new
                projects automatically—without modifying frontend code.
              </p>
            </div>
          )}

          <div className="mt-10">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse rounded-3xl border border-[#074E5B]/10 bg-white" />
              }
            >
              <PortfolioGrid projects={projects} />
            </Suspense>
          </div>
        </div>
      </section>

      <CtaHorizonSection
        heading="Want Us To Direct Your Next Event?"
        description="Tell us about your upcoming festival, launch, conference, or campaign and we'll prepare a custom production treatment."
      />
    </>
  );
}

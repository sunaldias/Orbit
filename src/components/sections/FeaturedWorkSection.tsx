import Link from "next/link";
import { ArrowUpRight, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getServiceName } from "@/data/services";
import { formatEventDate } from "@/lib/utils";
import { getCategoryLabel } from "@/schemas/portfolio";
import type { PortfolioProject } from "@/types/database";

interface FeaturedWorkSectionProps {
  projects: PortfolioProject[];
}

export function FeaturedWorkSection({ projects }: FeaturedWorkSectionProps) {
  const hasPlaceholders = projects.some((p) => p.isPlaceholder);

  return (
    <section className="relative bg-[#F5F8F8] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeader
            eyebrow="Selected Productions"
            title="Flagship Work Across Stages, Screens & Campaigns"
            description="Every frame, motion flyer, and visual system is engineered to elevate live experiences and convert audiences long before doors open."
          />
          <Button href="/portfolio" variant="outline" size="md">
            View Full Portfolio
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {hasPlaceholders && (
          <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#074E5B]/14 bg-white px-4 py-2 font-[family-name:var(--font-tagline)] text-[11px] text-[#486369] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#39A959]" aria-hidden="true" />
            Showing clearly labeled placeholder showcase projects — ready to swap with live ORBIT productions via Supabase &amp; Cloudinary.
          </div>
        )}

        <div className="mt-10 grid gap-7 lg:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.08}>
              <Link
                href={`/portfolio/${project.slug}`}
                className="group block overflow-hidden rounded-3xl border border-[#074E5B]/12 bg-white shadow-[0_14px_40px_-28px_rgba(7,78,91,0.22)] orbit-card-glow"
              >
                <div className="relative">
                  <MediaFrame
                    publicId={project.thumbnail}
                    videoSource={project.mediaUrl}
                    fallbackSrc={project.fallbackThumbnailSrc}
                    alt={project.title}
                    mediaType={project.primaryMediaType}
                    accentTone={project.accentTone}
                    priority={index < 2}
                    showVideoBadge
                    aspectClassName="aspect-[16/10]"
                  />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {project.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#D6F80B] px-2.5 py-0.5 font-[family-name:var(--font-tagline)] text-[10px] font-bold tracking-wider text-[#072B33] uppercase shadow-sm">
                        <Star className="h-2.5 w-2.5 fill-[#072B33]" aria-hidden="true" />
                        Featured
                      </span>
                    )}
                    {project.isPlaceholder && (
                      <span className="rounded-full border border-white/25 bg-[#08242B]/80 px-3 py-0.5 font-[family-name:var(--font-tagline)] text-[10px] font-medium tracking-[0.14em] text-white/90 uppercase backdrop-blur-md">
                        Sample Placeholder
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-[0.16em] text-[#6C848A] uppercase">
                    <span className="text-[#074E5B]">
                      {getCategoryLabel(project.category)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {formatEventDate(project.projectDate)}
                    </span>
                  </div>

                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold leading-snug text-[#08242B] transition-colors group-hover:text-[#074E5B]">
                    {project.title}
                  </h3>

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#486369]">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#074E5B]/10 pt-5">
                    <div className="flex flex-wrap gap-2">
                      {project.serviceSlugs.slice(0, 3).map((slug) => (
                        <span
                          key={slug}
                          className="rounded-full border border-[#074E5B]/12 bg-[#F5F8F8] px-3 py-1 font-[family-name:var(--font-tagline)] text-[11px] font-medium text-[#074E5B]"
                        >
                          {getServiceName(slug)}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#074E5B] transition-transform duration-200 group-hover:translate-x-1">
                      Case Study
                      <ArrowUpRight className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

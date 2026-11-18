"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Calendar, Filter, Star } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { cn, formatEventDate } from "@/lib/utils";
import {
  getCategoryLabel,
  isValidPortfolioCategory,
  PORTFOLIO_CATEGORIES,
} from "@/schemas/portfolio";
import type {
  MasonryAspectRatio,
  PortfolioCategorySlug,
  PortfolioProject,
} from "@/types/database";

interface PortfolioGridProps {
  projects: PortfolioProject[];
}

const ASPECT_CLASSES: Record<MasonryAspectRatio, string> = {
  wide: "aspect-[16/9]",
  landscape: "aspect-[16/10]",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
};

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const featuredOnly = searchParams.get("featured") === "true";

  const activeCategory: "all" | PortfolioCategorySlug = isValidPortfolioCategory(
    categoryParam
  )
    ? categoryParam
    : "all";

  const categoryCounts = useMemo(() => {
    const counts = new Map<PortfolioCategorySlug, number>();
    for (const project of projects) {
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }
    return counts;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (activeCategory !== "all" && project.category !== activeCategory) {
        return false;
      }
      if (featuredOnly && !project.isFeatured) {
        return false;
      }
      return true;
    });
  }, [projects, activeCategory, featuredOnly]);

  const updateFilter = (
    nextCategory: "all" | PortfolioCategorySlug,
    nextFeatured = featuredOnly
  ) => {
    const next = new URLSearchParams();
    if (nextCategory !== "all") {
      next.set("category", nextCategory);
    }
    if (nextFeatured) {
      next.set("featured", "true");
    }
    const query = next.toString();
    router.replace(query ? `/portfolio?${query}` : "/portfolio", {
      scroll: false,
    });
  };

  return (
    <div>
      {/* Dynamic 5-Category Filter Bar */}
      <div className="flex flex-col gap-5 rounded-3xl border border-[#074E5B]/12 bg-white p-5 shadow-[0_14px_38px_-28px_rgba(7,78,91,0.18)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.2em] text-[#486369] uppercase">
            <Filter className="h-3.5 w-3.5 text-[#39A959]" aria-hidden="true" />
            Filter by Category
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-pressed={featuredOnly}
              onClick={() => updateFilter(activeCategory, !featuredOnly)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-[family-name:var(--font-tagline)] text-[11px] font-semibold transition-all cursor-pointer",
                featuredOnly
                  ? "border-[#39A959] bg-[#D6F80B] text-[#072B33]"
                  : "border-[#074E5B]/15 bg-[#F5F8F8] text-[#486369] hover:border-[#074E5B]/40 hover:text-[#08242B]"
              )}
            >
              <Star className="h-3 w-3" aria-hidden="true" />
              Featured Only
            </button>

            <span className="font-[family-name:var(--font-tagline)] text-xs text-[#6C848A]">
              <strong className="text-[#074E5B]">{filteredProjects.length}</strong>{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
            </span>
          </div>
        </div>

        {/* 5 Canonical Category Tabs */}
        <div
          role="tablist"
          aria-label="Portfolio categories"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => updateFilter("all")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeCategory === "all"
                ? "bg-[#074E5B] text-white shadow-sm"
                : "border border-[#074E5B]/14 bg-[#F5F8F8] text-[#08242B] hover:border-[#39A959] hover:bg-white"
            )}
          >
            All Categories
            <span
              className={cn(
                "font-[family-name:var(--font-tagline)] text-[10px]",
                activeCategory === "all" ? "text-[#D6F80B]" : "text-[#6C848A]"
              )}
            >
              {projects.length}
            </span>
          </button>

          {PORTFOLIO_CATEGORIES.map((category) => {
            const selected = activeCategory === category.slug;
            const count = categoryCounts.get(category.slug) ?? 0;
            return (
              <button
                key={category.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => updateFilter(category.slug)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
                  selected
                    ? "bg-[#074E5B] text-white shadow-sm"
                    : "border border-[#074E5B]/14 bg-[#F5F8F8] text-[#08242B] hover:border-[#39A959] hover:bg-white"
                )}
              >
                {category.label}
                <span
                  className={cn(
                    "font-[family-name:var(--font-tagline)] text-[10px]",
                    selected ? "text-[#D6F80B]" : "text-[#6C848A]"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Masonry Grid (1 col Mobile, 2 cols Tablet, 3 cols Desktop) */}
      {filteredProjects.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-[#074E5B]/12 bg-white p-12 text-center shadow-sm">
          <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
            No projects match this filter yet.
          </p>
          <p className="mt-2 text-sm text-[#486369]">
            Reset filters to view all published ORBIT portfolio categories.
          </p>
          <button
            type="button"
            onClick={() => updateFilter("all", false)}
            className="mt-6 rounded-full bg-[#074E5B] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#0A6271]"
          >
            Show All Projects
          </button>
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
                className="break-inside-avoid"
              >
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-[#074E5B]/12 bg-white shadow-[0_14px_38px_-28px_rgba(7,78,91,0.2)] orbit-card-glow"
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
                      aspectClassName={ASPECT_CLASSES[project.aspectRatio]}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Top-Left Badges */}
                    <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
                      {project.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#D6F80B] px-2.5 py-0.5 font-[family-name:var(--font-tagline)] text-[10px] font-bold tracking-wider text-[#072B33] uppercase shadow-sm">
                          <Star className="h-2.5 w-2.5 fill-[#072B33]" aria-hidden="true" />
                          Featured
                        </span>
                      )}
                      {project.isPlaceholder && (
                        <span className="rounded-full border border-white/20 bg-[#08242B]/80 px-2.5 py-0.5 font-[family-name:var(--font-tagline)] text-[10px] tracking-wider text-white/90 uppercase backdrop-blur-md">
                          Sample
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-[0.14em] uppercase">
                      <span className="text-[#074E5B]">
                        {getCategoryLabel(project.category)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-normal text-[#6C848A]">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {formatEventDate(project.projectDate)}
                      </span>
                    </div>

                    <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold leading-snug text-[#08242B] transition-colors group-hover:text-[#074E5B]">
                      {project.title}
                    </h2>

                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#486369]">
                      {project.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#074E5B]/10 pt-4 text-xs">
                      <span className="font-[family-name:var(--font-tagline)] text-[11px] text-[#6C848A]">
                        ID: {project.id.slice(0, 12)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#074E5B] transition-transform duration-200 group-hover:translate-x-1">
                        View Project
                        <ArrowUpRight className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

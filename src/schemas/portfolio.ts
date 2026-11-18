import { z } from "zod";
import type { PortfolioCategoryMeta, PortfolioCategorySlug } from "../types/database.ts";

export const PORTFOLIO_CATEGORIES: PortfolioCategoryMeta[] = [
  {
    slug: "videography",
    label: "Videography",
    shortDescription:
      "Multi-cam 4K/6K cinema event coverage, aftermovies, and launch trailers.",
  },
  {
    slug: "photography",
    label: "Photography",
    shortDescription:
      "Editorial stills, live press selects, and atmospheric concert & keynote coverage.",
  },
  {
    slug: "graphic-design",
    label: "Graphic Design",
    shortDescription:
      "High-impact event branding, print & digital flyers, credentials, and visual systems.",
  },
  {
    slug: "motion-graphics",
    label: "Motion Graphics",
    shortDescription:
      "3D motion flyers, kinetic typography, broadcast lower thirds, and logo stings.",
  },
  {
    slug: "event-experiences",
    label: "Event Experiences",
    shortDescription:
      "Full-scale LED stage visual worlds, creative direction, and integrated live shows.",
  },
];

export const PORTFOLIO_CATEGORY_SLUGS = PORTFOLIO_CATEGORIES.map((c) => c.slug) as [
  PortfolioCategorySlug,
  ...PortfolioCategorySlug[],
];

export const CATEGORY_BY_SLUG = new Map<PortfolioCategorySlug, PortfolioCategoryMeta>(
  PORTFOLIO_CATEGORIES.map((cat) => [cat.slug, cat])
);

export function getCategoryLabel(slug: PortfolioCategorySlug): string {
  return CATEGORY_BY_SLUG.get(slug)?.label ?? slug;
}

export function isValidPortfolioCategory(
  value: string | null | undefined
): value is PortfolioCategorySlug {
  if (!value) return false;
  return CATEGORY_BY_SLUG.has(value as PortfolioCategorySlug);
}

/**
 * Generates clean SEO-friendly URL slugs from any project title.
 */
export function toSeoSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export const portfolioProjectSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  title: z.string().min(2).max(180),
  category: z.enum(PORTFOLIO_CATEGORY_SLUGS),
  description: z.string().min(10).max(2000),
  thumbnail: z.string().min(1).max(600),
  mediaUrl: z.string().min(1).max(600),
  primaryMediaType: z.enum(["image", "video"]),
  aspectRatio: z.enum(["landscape", "portrait", "square", "wide"]).default("landscape"),
  projectDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isFeatured: z.boolean(),
});

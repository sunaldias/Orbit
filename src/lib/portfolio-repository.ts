import { unstable_cache } from "next/cache";
import { DEMO_PORTFOLIO_PROJECTS } from "@/data/portfolio";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import { isValidPortfolioCategory } from "@/schemas/portfolio";
import type {
  MasonryAspectRatio,
  PortfolioCategorySlug,
  PortfolioProject,
  ProjectMediaItem,
  ProjectMetric,
} from "@/types/database";

export const PORTFOLIO_CACHE_TAG = "orbit-portfolio";

interface RawProjectRow {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  client_name: string;
  event_type: string;
  location: string | null;
  summary: string;
  challenge: string;
  solution: string;
  cover_public_id: string;
  thumbnail_url?: string | null;
  media_url?: string | null;
  showreel_public_id: string | null;
  primary_media_type: "image" | "video";
  aspect_ratio?: string | null;
  accent_tone: "lime" | "green" | "teal";
  event_date: string | null;
  is_featured: boolean;
  highlights: ProjectMetric[] | null;
  seo_title: string | null;
  seo_description: string | null;
  project_media?: Array<{
    id: string;
    cloudinary_public_id: string;
    resource_type: "image" | "video";
    alt_text: string;
    caption: string | null;
    width: number;
    height: number;
    duration_sec: number | null;
    sort_order: number;
  }>;
  project_services?: Array<{
    services: { slug: string } | { slug: string }[] | null;
  }>;
}

function normalizeAspectRatio(value?: string | null): MasonryAspectRatio {
  if (
    value === "landscape" ||
    value === "portrait" ||
    value === "square" ||
    value === "wide"
  ) {
    return value;
  }
  return "landscape";
}

function mapRowToProject(row: RawProjectRow): PortfolioProject {
  const serviceSlugs: string[] = [];
  for (const rel of row.project_services ?? []) {
    if (Array.isArray(rel.services)) {
      for (const s of rel.services) {
        if (s?.slug) serviceSlugs.push(s.slug);
      }
    } else if (rel.services?.slug) {
      serviceSlugs.push(rel.services.slug);
    }
  }

  const media: ProjectMediaItem[] = (row.project_media ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      id: m.id,
      cloudinaryPublicId: m.cloudinary_public_id,
      mediaUrl: m.cloudinary_public_id,
      resourceType: m.resource_type,
      altText: m.alt_text,
      caption: m.caption ?? undefined,
      width: m.width,
      height: m.height,
      durationSec: m.duration_sec,
      sortOrder: m.sort_order,
    }));

  const category: PortfolioCategorySlug = isValidPortfolioCategory(row.category)
    ? row.category
    : "event-experiences";

  const thumbnail = row.thumbnail_url?.trim() || row.cover_public_id;
  const mediaUrl =
    row.media_url?.trim() ||
    row.showreel_public_id?.trim() ||
    row.cover_public_id;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category,
    description: row.summary,
    thumbnail,
    mediaUrl,
    primaryMediaType: row.primary_media_type,
    aspectRatio: normalizeAspectRatio(row.aspect_ratio),
    projectDate: row.event_date ?? "2026-01-01",
    isFeatured: row.is_featured,
    clientName: row.client_name,
    eventType: row.event_type,
    location: row.location ?? "International",
    challenge: row.challenge,
    solution: row.solution,
    accentTone: row.accent_tone,
    isPlaceholder: false,
    serviceSlugs,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    media,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

async function fetchPublishedProjectsUncached(): Promise<PortfolioProject[]> {
  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return DEMO_PORTFOLIO_PROJECTS;
  }

  try {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select(
        `
        id, slug, title, category, client_name, event_type, location, summary, challenge, solution,
        cover_public_id, thumbnail_url, media_url, showreel_public_id, primary_media_type, aspect_ratio,
        accent_tone, event_date, is_featured, highlights, seo_title, seo_description,
        project_media (
          id, cloudinary_public_id, resource_type, alt_text, caption, width, height, duration_sec, sort_order
        ),
        project_services (
          services ( slug )
        )
      `
      )
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("event_date", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEMO_PORTFOLIO_PROJECTS;
    }

    return (data as unknown as RawProjectRow[]).map(mapRowToProject);
  } catch {
    return DEMO_PORTFOLIO_PROJECTS;
  }
}

/**
 * Cached dynamic portfolio loader.
 * New projects added in Supabase appear automatically after ISR revalidation
 * or immediately when `/api/portfolio/revalidate` is triggered—zero frontend changes required.
 */
export const getPortfolioProjects = unstable_cache(
  fetchPublishedProjectsUncached,
  ["orbit-portfolio-projects"],
  {
    revalidate: 3600,
    tags: [PORTFOLIO_CACHE_TAG],
  }
);

export async function getPortfolioProjectsByCategory(
  category: PortfolioCategorySlug
): Promise<PortfolioProject[]> {
  const all = await getPortfolioProjects();
  return all.filter((project) => project.category === category);
}

export async function getFeaturedProjects(): Promise<PortfolioProject[]> {
  const all = await getPortfolioProjects();
  const featured = all.filter((p) => p.isFeatured);
  return featured.length > 0 ? featured.slice(0, 4) : all.slice(0, 4);
}

export async function getProjectBySlug(
  slug: string
): Promise<PortfolioProject | null> {
  const all = await getPortfolioProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

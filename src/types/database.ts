export type ServicePillar = "motion-film" | "capture-visuals" | "brand-design";

export type PortfolioCategorySlug =
  | "videography"
  | "photography"
  | "graphic-design"
  | "motion-graphics"
  | "event-experiences";

export type MasonryAspectRatio = "landscape" | "portrait" | "square" | "wide";

export interface PortfolioCategoryMeta {
  slug: PortfolioCategorySlug;
  label: string;
  shortDescription: string;
}

export interface ServiceItem {
  id?: string;
  slug: string;
  name: string;
  pillar: ServicePillar;
  tagline: string;
  shortDescription: string;
  deliverables: string[];
  turnaround: string;
  sortOrder: number;
}

export interface ProjectMediaItem {
  id: string;
  cloudinaryPublicId: string;
  mediaUrl?: string;
  fallbackSrc?: string;
  resourceType: "image" | "video";
  altText: string;
  caption?: string;
  width: number;
  height: number;
  durationSec?: number | null;
  sortOrder: number;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface PortfolioProject {
  /** Unique identifier (UUID in Supabase or stable ID in fallback dataset) */
  id: string;
  /** SEO-friendly URL slug (used at /portfolio/[slug]) */
  slug: string;
  /** Project title */
  title: string;
  /** Canonical portfolio category */
  category: PortfolioCategorySlug;
  /** Primary description shown on cards and case study hero */
  description: string;
  /** Cloudinary public_id or full Cloudinary URL for optimized thumbnail delivery */
  thumbnail: string;
  /** Local fallback image path when Cloudinary env is not configured */
  fallbackThumbnailSrc?: string;
  /** Primary Cloudinary public_id or full Cloudinary URL for image or video playback */
  mediaUrl: string;
  /** Whether the primary media is an image or video */
  primaryMediaType: "image" | "video";
  /** Masonry grid aspect ratio hint for natural editorial layout */
  aspectRatio: MasonryAspectRatio;
  /** Project / event date (ISO YYYY-MM-DD) */
  projectDate: string;
  /** Whether project appears in Featured sections */
  isFeatured: boolean;

  // Extended agency case study metadata
  clientName: string;
  eventType: string;
  location: string;
  challenge: string;
  solution: string;
  accentTone: "lime" | "green" | "teal";
  isPlaceholder?: boolean;
  serviceSlugs: string[];
  highlights: ProjectMetric[];
  media: ProjectMediaItem[];
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export type InquiryStatus = "new" | "reviewing" | "quoted" | "booked" | "archived";
export type EmailDeliveryStatus = "pending" | "sent" | "failed";

export interface InquiryRecord {
  id: string;
  reference_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  selected_services: string[];
  event_name: string;
  event_date: string | null;
  event_location: string | null;
  budget_range: string;
  project_details: string;
  reference_link: string | null;
  source_page: string | null;
  status: InquiryStatus;
  email_status: EmailDeliveryStatus;
  client_ack_status: EmailDeliveryStatus;
  email_error: string | null;
  idempotency_key: string | null;
  submission_fingerprint: string | null;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
}

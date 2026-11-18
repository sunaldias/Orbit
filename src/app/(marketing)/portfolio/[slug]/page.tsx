import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Info,
  MapPin,
  Star,
  User,
} from "lucide-react";
import { CaseStudyGallery } from "@/components/portfolio/CaseStudyGallery";
import { CloudinaryVideoPlayer } from "@/components/portfolio/CloudinaryVideoPlayer";
import { CtaHorizonSection } from "@/components/sections/CtaHorizonSection";
import { Button } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SITE_CONFIG } from "@/data/navigation";
import { getServiceName } from "@/data/services";
import {
  getCloudinaryOgImageUrl,
  getCloudinaryVideoUrl,
} from "@/lib/cloudinary";
import {
  getPortfolioProjects,
  getProjectBySlug,
} from "@/lib/portfolio-repository";
import { formatEventDate } from "@/lib/utils";
import { serializeJsonLd } from "@/lib/security";
import { getCategoryLabel } from "@/schemas/portfolio";

export const dynamicParams = true;
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getPortfolioProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const ogImage = getCloudinaryOgImageUrl(project.thumbnail);

  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.description,
    alternates: {
      canonical: `/portfolio/${project.slug}`,
    },
    openGraph: {
      title: project.seoTitle || `${project.title} | ORBIT`,
      description: project.seoDescription || project.description,
      type: "article",
      url: `${SITE_CONFIG.url}/portfolio/${project.slug}`,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
  };
}

export default async function PortfolioProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const allProjects = await getPortfolioProjects();
  const related = allProjects
    .filter((p) => p.slug !== project.slug)
    .sort((a, b) =>
      a.category === project.category && b.category !== project.category ? -1 : 0
    )
    .slice(0, 2);

  const primaryService = project.serviceSlugs[0] || "creative-direction";
  const categoryLabel = getCategoryLabel(project.category);
  const ogImage = getCloudinaryOgImageUrl(project.thumbnail);
  const resolvedVideoUrl =
    project.primaryMediaType === "video"
      ? getCloudinaryVideoUrl(project.mediaUrl)
      : null;

  const structuredData =
    project.primaryMediaType === "video"
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: project.title,
          description: project.description,
          uploadDate: project.projectDate,
          ...(ogImage ? { thumbnailUrl: ogImage } : {}),
          ...(resolvedVideoUrl ? { contentUrl: resolvedVideoUrl } : {}),
          creator: {
            "@type": "Organization",
            name: SITE_CONFIG.legalName,
          },
        }
      : {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.description,
          datePublished: project.projectDate,
          genre: categoryLabel,
          ...(ogImage ? { image: ogImage } : {}),
          creator: {
            "@type": "Organization",
            name: SITE_CONFIG.legalName,
          },
          url: `${SITE_CONFIG.url}/portfolio/${project.slug}`,
        };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      <article className="bg-[#F5F8F8] pt-28 pb-20 sm:pt-36">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {/* Breadcrumb / Back Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-wider text-[#074E5B] uppercase transition-colors hover:text-[#39A959]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Portfolio
            </Link>
            <span className="font-[family-name:var(--font-tagline)] text-[11px] text-[#6C848A]">
              PROJECT ID: {project.id}
            </span>
          </div>

          {project.isPlaceholder && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#39A959]/30 bg-white px-5 py-3.5 text-xs text-[#486369] shadow-xs">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-[#074E5B]"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-[#08242B]">
                  Placeholder Case Study:
                </strong>{" "}
                Sample production metadata and concept visuals are shown until
                live ORBIT projects are published in Supabase &amp; Cloudinary.
              </span>
            </div>
          )}

          {/* Header Block */}
          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/portfolio?category=${project.category}`}
                className="rounded-full border border-[#074E5B]/20 bg-white px-3.5 py-1 font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-[0.16em] text-[#074E5B] uppercase transition-colors hover:border-[#39A959] hover:bg-[#074E5B] hover:text-white"
              >
                {categoryLabel}
              </Link>
              {project.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D6F80B] px-3 py-1 font-[family-name:var(--font-tagline)] text-[10px] font-bold tracking-wider text-[#072B33] uppercase">
                  <Star className="h-3 w-3 fill-[#072B33]" aria-hidden="true" />
                  Featured
                </span>
              )}
              {project.isPlaceholder && (
                <span className="rounded-full border border-[#074E5B]/15 bg-[#EDF3F3] px-2.5 py-1 font-[family-name:var(--font-tagline)] text-[10px] tracking-[0.14em] text-[#486369] uppercase">
                  Sample Placeholder
                </span>
              )}
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[#08242B] sm:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#486369] sm:text-xl">
              {project.description}
            </p>

            {/* Metadata Strip */}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-y border-[#074E5B]/12 py-5 text-sm text-[#486369]">
              <div className="inline-flex items-center gap-2">
                <User className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
                <span>Client:</span>
                <strong className="font-semibold text-[#08242B]">
                  {project.clientName}
                </strong>
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
                <span>Location:</span>
                <strong className="font-semibold text-[#08242B]">
                  {project.location}
                </strong>
              </div>
              <div className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
                <span>Project Date:</span>
                <strong className="font-semibold text-[#08242B]">
                  {formatEventDate(project.projectDate)}
                </strong>
              </div>
            </div>
          </header>

          {/* Hero Media: Full Cloudinary Video Player OR High-Res Optimized Image */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-[#074E5B]/15 bg-[#081A1F] shadow-[0_24px_60px_-30px_rgba(7,78,91,0.35)]">
            {project.primaryMediaType === "video" ? (
              <CloudinaryVideoPlayer
                mediaSource={project.mediaUrl}
                thumbnailSource={project.thumbnail}
                fallbackPosterSrc={project.fallbackThumbnailSrc}
                title={project.title}
                aspectClassName="aspect-[16/9]"
              />
            ) : (
              <MediaFrame
                publicId={project.mediaUrl || project.thumbnail}
                fallbackSrc={project.fallbackThumbnailSrc}
                alt={project.title}
                mediaType="image"
                accentTone={project.accentTone}
                priority
                aspectClassName="aspect-[16/9]"
                sizes="(max-width: 1200px) 100vw, 1152px"
              />
            )}
          </div>

          {/* Impact Metrics */}
          {project.highlights.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {project.highlights.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-[#074E5B]/12 bg-white p-5 shadow-xs"
                >
                  <p className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-gradient-teal sm:text-3xl">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-[#486369]">{metric.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Narrative: Challenge & Execution + Services Used */}
          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <div>
                <h2 className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
                  01 / The Creative Challenge
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#2D484E] sm:text-lg">
                  {project.challenge}
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
                  02 / The ORBIT Execution
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#2D484E] sm:text-lg">
                  {project.solution}
                </p>
              </div>
            </div>

            <aside className="rounded-3xl border border-[#074E5B]/12 bg-white p-6 shadow-sm lg:col-span-4 lg:self-start">
              <h2 className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#08242B] uppercase">
                Deliverable Disciplines
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.serviceSlugs.map((serviceSlug) => (
                  <Link
                    key={serviceSlug}
                    href={`/booking?service=${serviceSlug}`}
                    className="rounded-full border border-[#074E5B]/15 bg-[#F5F8F8] px-3 py-1.5 font-[family-name:var(--font-tagline)] text-[11px] font-semibold text-[#074E5B] transition-colors hover:border-[#39A959] hover:bg-[#074E5B] hover:text-white"
                  >
                    {getServiceName(serviceSlug)}
                  </Link>
                ))}
              </div>
              <div className="mt-7 border-t border-[#074E5B]/10 pt-6">
                <p className="text-sm text-[#486369]">
                  Planning a similar production or stage experience?
                </p>
                <Button
                  href={`/booking?service=${primaryService}`}
                  size="md"
                  className="mt-4 w-full"
                >
                  Book Similar Production
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </aside>
          </div>

          {/* Interactive Media Gallery */}
          {project.media.length > 0 && (
            <section className="mt-16 border-t border-[#074E5B]/12 pt-14">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#08242B] sm:text-3xl">
                Production Stills &amp; Video Frames
              </h2>
              <p className="mt-2 text-sm text-[#486369]">
                Click any frame to open the keyboard-accessible full-screen
                viewer and video player.
              </p>
              <div className="mt-8">
                <CaseStudyGallery
                  items={project.media}
                  fallbackSrc={project.fallbackThumbnailSrc}
                  accentTone={project.accentTone}
                />
              </div>
            </section>
          )}

          {/* Related Productions */}
          {related.length > 0 && (
            <section className="mt-20 border-t border-[#074E5B]/12 pt-14">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#08242B]">
                  More From ORBIT
                </h2>
                <Link
                  href="/portfolio"
                  className="font-[family-name:var(--font-tagline)] text-xs font-semibold text-[#074E5B] uppercase hover:text-[#39A959]"
                >
                  All Portfolio →
                </Link>
              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/portfolio/${item.slug}`}
                    className="group overflow-hidden rounded-3xl border border-[#074E5B]/12 bg-white shadow-sm orbit-card-glow"
                  >
                    <MediaFrame
                      publicId={item.thumbnail}
                      videoSource={item.mediaUrl}
                      fallbackSrc={item.fallbackThumbnailSrc}
                      alt={item.title}
                      mediaType={item.primaryMediaType}
                      accentTone={item.accentTone}
                      showVideoBadge
                      aspectClassName="aspect-[16/9]"
                    />
                    <div className="p-6">
                      <p className="font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-wider text-[#074E5B] uppercase">
                        {getCategoryLabel(item.category)}
                      </p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B] group-hover:text-[#074E5B]">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <CtaHorizonSection
        ctaHref={`/booking?service=${primaryService}`}
        ctaLabel="Request a Similar Scope"
      />
    </>
  );
}

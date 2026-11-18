"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { CloudinaryVideoPlayer } from "@/components/portfolio/CloudinaryVideoPlayer";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { ProjectMediaItem } from "@/types/database";

interface CaseStudyGalleryProps {
  items: ProjectMediaItem[];
  fallbackSrc?: string;
  accentTone?: "lime" | "green" | "teal";
}

export function CaseStudyGallery({
  items,
  fallbackSrc,
  accentTone = "lime",
}: CaseStudyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % items.length
        );
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + items.length) % items.length
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, items.length]);

  if (items.length === 0) return null;

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item, idx) => (
          <figure
            key={item.id}
            className="group overflow-hidden rounded-3xl border border-[#074E5B]/12 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Inspect media: ${item.altText}`}
              className="relative block w-full text-left cursor-pointer"
            >
              <MediaFrame
                publicId={item.cloudinaryPublicId}
                videoSource={item.mediaUrl ?? item.cloudinaryPublicId}
                fallbackSrc={item.fallbackSrc ?? fallbackSrc}
                alt={item.altText}
                mediaType={item.resourceType}
                accentTone={accentTone}
                showVideoBadge
                aspectClassName="aspect-[16/10]"
              />
              <span className="absolute bottom-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#08242B]/80 text-white transition-all group-hover:bg-[#D6F80B] group-hover:text-[#072B33]">
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>

            {item.caption && (
              <figcaption className="px-5 py-4 text-xs leading-relaxed text-[#486369]">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Accessible Cinema Lightbox Modal */}
      {activeItem && activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Media preview lightbox"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#08242B]/92 p-4 backdrop-blur-xl sm:p-8"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[#0A181C]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <span className="font-[family-name:var(--font-tagline)] text-xs text-white/75">
                Frame {activeIndex + 1} / {items.length} ·{" "}
                <span className="uppercase text-[#D6F80B]">
                  {activeItem.resourceType}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                aria-label="Close preview"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white hover:border-[#D6F80B] hover:text-[#D6F80B] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              {activeItem.resourceType === "video" ? (
                <CloudinaryVideoPlayer
                  mediaSource={activeItem.mediaUrl ?? activeItem.cloudinaryPublicId}
                  fallbackPosterSrc={activeItem.fallbackSrc ?? fallbackSrc}
                  title={activeItem.altText}
                  aspectClassName="aspect-[16/9]"
                />
              ) : (
                <MediaFrame
                  publicId={activeItem.cloudinaryPublicId}
                  fallbackSrc={activeItem.fallbackSrc ?? fallbackSrc}
                  alt={activeItem.altText}
                  mediaType="image"
                  accentTone={accentTone}
                  priority
                  aspectClassName="aspect-[16/9]"
                  sizes="(max-width: 1200px) 100vw, 1024px"
                />
              )}

              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous frame"
                    onClick={() =>
                      setActiveIndex(
                        (activeIndex - 1 + items.length) % items.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#08242B]/80 text-white hover:border-[#D6F80B] hover:text-[#D6F80B] cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next frame"
                    onClick={() =>
                      setActiveIndex((activeIndex + 1) % items.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#08242B]/80 text-white hover:border-[#D6F80B] hover:text-[#D6F80B] cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {activeItem.caption && (
              <p className="border-t border-white/10 px-6 py-4 text-sm text-white/85">
                {activeItem.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

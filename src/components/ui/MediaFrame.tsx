"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import {
  getCloudinaryImageUrl,
  getCloudinaryVideoPosterUrl,
  getCloudinaryVideoUrl,
} from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

interface MediaFrameProps {
  /** Cloudinary public_id or full https://res.cloudinary.com/... URL */
  publicId: string;
  /** Optional distinct video source when thumbnail differs from video reel */
  videoSource?: string;
  fallbackSrc?: string;
  alt: string;
  mediaType?: "image" | "video";
  accentTone?: "lime" | "green" | "teal";
  priority?: boolean;
  aspectClassName?: string;
  className?: string;
  showVideoBadge?: boolean;
  sizes?: string;
}

const accentGradients = {
  lime: "radial-gradient(circle at 70% 80%, rgba(204,255,0,0.28) 0%, rgba(0,255,135,0.14) 36%, rgba(5,16,18,0.94) 72%, #050507 100%)",
  green:
    "radial-gradient(circle at 30% 82%, rgba(0,255,135,0.3) 0%, rgba(0,194,168,0.16) 40%, rgba(6,18,17,0.95) 75%, #050507 100%)",
  teal: "radial-gradient(circle at 50% 85%, rgba(0,212,184,0.34) 0%, rgba(6,61,58,0.32) 42%, rgba(7,12,14,0.96) 76%, #050507 100%)",
};

export function MediaFrame({
  publicId,
  videoSource,
  fallbackSrc,
  alt,
  mediaType = "image",
  accentTone = "lime",
  priority = false,
  aspectClassName = "aspect-[16/10]",
  className,
  showVideoBadge = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px",
}: MediaFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [videoInView, setVideoInView] = useState(priority);

  const liveVideoUrl =
    mediaType === "video"
      ? getCloudinaryVideoUrl(videoSource ?? publicId, { width: 1280 })
      : null;

  const liveImageUrl =
    getCloudinaryImageUrl(publicId, { width: 1400 }) ??
    (mediaType === "video"
      ? getCloudinaryVideoPosterUrl(videoSource ?? publicId, 1400)
      : null);

  const resolvedImage = !imageFailed ? (liveImageUrl ?? fallbackSrc ?? null) : null;

  // Lazy-hydrate ambient video streams only once near the viewport
  useEffect(() => {
    if (!liveVideoUrl || videoInView) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVideoInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [liveVideoUrl, videoInView]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-[#080B0D]",
        aspectClassName,
        className
      )}
      style={{ backgroundImage: accentGradients[accentTone] }}
    >
      {liveVideoUrl && videoInView ? (
        <video
          src={liveVideoUrl}
          poster={resolvedImage ?? undefined}
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          aria-label={alt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : resolvedImage ? (
        <Image
          src={resolvedImage}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => setImageFailed(true)}
          className={cn(
            "object-cover transition-all duration-700 group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center orbit-grid-bg opacity-70"
        >
          <div className="h-40 w-40 rounded-full border border-[#CCFF00]/25 bg-gradient-to-tr from-[#063D3A]/40 via-transparent to-[#CCFF00]/15 blur-[1px]" />
        </div>
      )}

      {/* Subtle Cinema Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050507]/85 via-[#050507]/15 to-transparent"
      />

      {showVideoBadge && mediaType === "video" && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#08242B]/85 px-3 py-1 font-[family-name:var(--font-tagline)] text-[10px] font-semibold tracking-wider text-[#D6F80B] uppercase backdrop-blur-md">
          <Play className="h-3 w-3 fill-[#D6F80B]" aria-hidden="true" />
          Video
        </span>
      )}
    </div>
  );
}

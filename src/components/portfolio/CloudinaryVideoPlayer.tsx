"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  getCloudinaryImageUrl,
  getCloudinaryVideoPosterUrl,
  getCloudinaryVideoUrl,
} from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

interface CloudinaryVideoPlayerProps {
  /** Cloudinary public_id or full Cloudinary video URL */
  mediaSource: string;
  /** Optional separate Cloudinary thumbnail/poster source */
  thumbnailSource?: string;
  /** Local fallback image when Cloudinary is not configured yet */
  fallbackPosterSrc?: string;
  title: string;
  aspectClassName?: string;
  className?: string;
  autoPlayMuted?: boolean;
}

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const mins = Math.floor(sec / 60);
  const rem = Math.floor(sec % 60);
  return `${mins}:${String(rem).padStart(2, "0")}`;
}

/**
 * Lazy-loaded, accessible Cloudinary video player with custom ORBIT controls.
 * Hydrates the video element only once near the viewport (IntersectionObserver).
 * If Cloudinary is not yet configured, renders the high-res poster cleanly with
 * an honest status label—never simulating fake video playback.
 */
export function CloudinaryVideoPlayer({
  mediaSource,
  thumbnailSource,
  fallbackPosterSrc,
  title,
  aspectClassName = "aspect-[16/9]",
  className,
  autoPlayMuted = false,
}: CloudinaryVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [inView, setInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlayMuted);
  const [isMuted, setIsMuted] = useState(autoPlayMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const liveVideoUrl = getCloudinaryVideoUrl(mediaSource, { width: 1920 });
  const livePosterUrl =
    (thumbnailSource
      ? getCloudinaryImageUrl(thumbnailSource, { width: 1600 })
      : null) ??
    getCloudinaryVideoPosterUrl(mediaSource, 1600) ??
    fallbackPosterSrc ??
    null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative w-full overflow-hidden bg-[#06090B]",
        aspectClassName,
        className
      )}
    >
      {liveVideoUrl && inView ? (
        <>
          <video
            ref={videoRef}
            src={liveVideoUrl}
            poster={livePosterUrl ?? undefined}
            playsInline
            muted={isMuted}
            autoPlay={autoPlayMuted}
            preload="metadata"
            aria-label={title}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            className="h-full w-full cursor-pointer object-cover"
          />

          {/* Center Play Overlay when Paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={`Play video: ${title}`}
              className="absolute inset-0 flex items-center justify-center bg-[#050507]/35 transition-colors hover:bg-[#050507]/20 cursor-pointer"
            >
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#CCFF00] text-[#050507] shadow-[0_0_40px_rgba(204,255,0,0.6)] transition-transform duration-200 hover:scale-105 sm:h-20 sm:w-20">
                <Play className="ml-1 h-7 w-7 fill-[#050507]" aria-hidden="true" />
              </span>
            </button>
          )}

          {/* Custom Accessible Control Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050507]/95 via-[#050507]/70 to-transparent px-4 pt-8 pb-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause video" : "Play video"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#0A0E10]/90 text-[#F4F7F6] hover:border-[#CCFF00] hover:text-[#CCFF00] cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
                )}
              </button>

              {/* Progress Scrubber */}
              <div className="flex flex-1 items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  aria-label="Seek video timeline"
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#CCFF00]"
                  style={{
                    background: `linear-gradient(to right, #CCFF00 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                  }}
                />
                <span className="hidden font-[family-name:var(--font-mono)] text-[11px] text-[#C6D2CF] sm:inline">
                  {formatSeconds(currentTime)} / {formatSeconds(duration)}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#0A0E10]/90 text-[#F4F7F6] hover:border-[#CCFF00] hover:text-[#CCFF00] cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                aria-label="Toggle fullscreen"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#0A0E10]/90 text-[#F4F7F6] hover:border-[#CCFF00] hover:text-[#CCFF00] cursor-pointer"
              >
                <Maximize className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Poster Preview State (while offscreen or before Cloudinary video stream is connected) */
        <>
          {livePosterUrl && (
            <Image
              src={livePosterUrl}
              alt={title}
              fill
              priority={!liveVideoUrl}
              sizes="(max-width: 1200px) 100vw, 1152px"
              className="object-cover"
            />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050507]/85 via-[#050507]/20 to-transparent"
          />
          {!liveVideoUrl && (
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[#050507]/85 px-4 py-3 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#CCFF00]/15 text-[#CCFF00]">
                  <Play className="h-3.5 w-3.5 fill-[#CCFF00]" aria-hidden="true" />
                </span>
                <span className="text-xs text-[#D6E0DD]">
                  <strong className="font-semibold text-white">
                    Cloudinary Video Ready
                  </strong>{" "}
                  — Connect <code className="font-semibold text-[#D6F80B]">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> or provide a Cloudinary video URL to stream this reel natively.
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

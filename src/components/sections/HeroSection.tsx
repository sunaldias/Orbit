"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HorizonGlow } from "@/components/ui/HorizonGlow";

const HERO_METRICS = [
  { value: "11", label: "Integrated Creative Disciplines" },
  { value: "4K–6K", label: "Cinema Capture & LED Visuals" },
  { value: "24h", label: "Live Press & Social Turnaround" },
  { value: "Global", label: "Festivals, Tours & Brand Launches" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F5F8F8] pt-32 sm:pt-36 lg:pt-44">
      {/* Architectural Crosshair Grid matching Brand Identity */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 orbit-grid-bg opacity-90 [mask-image:radial-gradient(ellipse_at_50%_38%,black_40%,transparent_88%)]"
      />

      {/* Soft Ambient Emerald + Lime Studio Glow */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-[-100px] h-[360px] w-[720px] -translate-x-1/2 rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(214,248,11,0.22) 0%, rgba(57,169,89,0.14) 45%, rgba(7,78,91,0.06) 72%, rgba(245,248,248,0) 90%)",
        }}
      />

      {/* Subtle Rotating Architectural Orbital Ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 54, repeat: Infinity, ease: "linear" }}
          className="h-[520px] w-[520px] rounded-full border border-[#074E5B]/[0.08] sm:h-[680px] sm:w-[680px]"
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#074E5B] via-[#39A959] to-[#D6F80B] shadow-[0_0_16px_rgba(184,233,28,0.85)]" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Signature Tagline Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#074E5B]/15 bg-white/90 px-5 py-2 shadow-sm backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39A959] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39A959]" />
            </span>
            <span className="font-[family-name:var(--font-tagline)] text-[11px] font-medium tracking-[0.3em] text-[#074E5B] uppercase">
              Every Detail, Intended .
            </span>
          </motion.div>

          {/* Bold Geometric Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-8 font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.04] tracking-tight text-[#08242B] sm:text-6xl lg:text-7xl"
          >
            Visual Worlds Engineered{" "}
            <span className="text-gradient-orbit">For Unforgettable Events</span>
          </motion.h1>

          {/* Lead Copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#486369] sm:text-lg lg:text-xl"
          >
            ORBIT is a creative production agency uniting cinema-grade event
            videography, kinetic motion flyers, LED stage visuals, event
            branding, and creative direction under one roof.
          </motion.p>

          {/* Primary & Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button href="/booking" size="lg" className="w-full sm:w-auto">
              Book a Project
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              href="/portfolio"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Play className="h-4 w-4 text-[#2D9B59]" aria-hidden="true" />
              Explore Portfolio
            </Button>
          </motion.div>
        </div>

        {/* Elevated Frosted White Metrics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="relative z-20 mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 rounded-3xl p-5 orbit-glass sm:grid-cols-4 sm:gap-6 sm:p-6 lg:mt-20"
        >
          {HERO_METRICS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-start border-l border-[#074E5B]/12 pl-4 first:border-l-0 first:pl-1"
            >
              <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-gradient-teal sm:text-3xl">
                {item.value}
              </span>
              <span className="mt-1 text-xs leading-snug text-[#486369] sm:text-sm">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Signature Glowing Teal-to-Lime Curved ORBIT Horizon */}
      <div className="-mt-6 sm:-mt-10 lg:-mt-12">
        <HorizonGlow variant="hero" />
      </div>

      {/* Subtle Wide-Tracked Scroll Indicator */}
      <div className="pointer-events-none relative z-10 -mt-10 flex justify-center pb-8">
        <span className="inline-flex items-center gap-2 font-[family-name:var(--font-tagline)] text-[10px] font-medium tracking-[0.32em] text-[#6C848A] uppercase">
          <Sparkles className="h-3.5 w-3.5 text-[#39A959]" aria-hidden="true" />
          Scroll to Enter Orbit
        </span>
      </div>
    </section>
  );
}

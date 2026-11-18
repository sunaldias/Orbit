import type { Metadata } from "next";
import { Compass, Cpu, Film, Globe, ShieldCheck, Zap } from "lucide-react";
import { CtaHorizonSection } from "@/components/sections/CtaHorizonSection";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "About ORBIT",
  description:
    "Discover ORBIT's creative vision, event production standards, and multidisciplinary team crafting visual worlds for live experiences.",
};

const ETHOS_PILLARS = [
  {
    icon: Compass,
    title: "Unified Creative Direction",
    description:
      "Most events fragment their visuals across five disconnected freelancers. ORBIT unifies flyer art, motion trailers, LED stage visuals, and live cinema coverage under one art direction.",
  },
  {
    icon: Zap,
    title: "Built For Live Velocity",
    description:
      "Live events move fast. Our embedded on-site editing and photo desks deliver press selects within minutes and vertical social hype cuts before attendees wake up.",
  },
  {
    icon: Film,
    title: "Cinema-Grade Aesthetics",
    description:
      "From low-light anamorphic concert lenses to precision DaVinci color pipelines and 60fps 3D motion graphics, every output is mastered to international agency standards.",
  },
  {
    icon: Cpu,
    title: "Stage & Screen Architecture",
    description:
      "We design specifically for real-world lighting, giant LED aspect ratios, and physical print textures—never generic templates that fall flat on stage.",
  },
  {
    icon: Globe,
    title: "Global Production Mobility",
    description:
      "Whether producing remote motion flyer campaigns or deploying multi-cam crews internationally for arenas and launches, our workflows scale across time zones.",
  },
  {
    icon: ShieldCheck,
    title: "Confidential & Reliable",
    description:
      "Unannounced product unveils, private VIP galas, and embargoed lineups are handled with strict NDA readiness and secure cloud media delivery.",
  },
];

const INDUSTRIES = [
  "Electronic & Live Music Festivals",
  "Global Technology Summits & Keynotes",
  "Luxury Automotive & Product Unveils",
  "Nightlife, Club Tours & Concert Promoters",
  "Esports Championships & Arena Broadcasts",
  "Fashion Pop-Ups & Cultural Exhibitions",
];

export default function AboutPage() {
  return (
    <>
      <section className="relative bg-[#F5F8F8] pt-32 pb-20 sm:pt-40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[400px] orbit-grid-bg opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="About ORBIT"
            title="A Creative Production Studio Obsessed With Live Energy"
            description="ORBIT bridges the gap between bold visual identity, live event cinema, and stage visual engineering. Every detail, intended."
          />

          {/* Manifesto Card */}
          <div className="mt-14 grid gap-8 rounded-3xl border border-[#074E5B]/12 bg-white p-8 shadow-[0_16px_44px_-28px_rgba(7,78,91,0.18)] sm:p-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.26em] text-[#074E5B] uppercase">
                Our Philosophy
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#08242B]">
                Every event begins long before doors open—and lives on forever
                through its visuals.
              </h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-[#486369] lg:col-span-7">
              <p>
                A great event isn&rsquo;t just a night on the calendar—it&rsquo;s
                an atmosphere people anticipate for months and replay for years.
                That atmosphere is built through unmistakable flyers,
                scroll-stopping motion announcements, dramatic stage visuals,
                and cinema-grade documentation.
              </p>
              <p>
                At ORBIT, directors, cinematographers, motion designers, graphic
                artists, and live visual operators collaborate as one cohesive
                unit. The result is an elevated visual signature that sells
                tickets, amplifies sponsors, and positions your brand at an
                international tier.
              </p>
            </div>
          </div>

          {/* 6 Ethos Cards */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ETHOS_PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={idx * 0.06}>
                  <div className="h-full rounded-3xl border border-[#074E5B]/12 bg-white p-7 shadow-sm orbit-card-glow">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#074E5B] via-[#2B9362] to-[#A9E41E] text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#486369]">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Event Sectors */}
          <div className="mt-20 rounded-3xl border border-[#074E5B]/12 bg-[#EDF3F3] p-8 sm:p-10">
            <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.24em] text-[#074E5B] uppercase">
              Where We Operate
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[#08242B] sm:text-3xl">
              Event Sectors &amp; Live Formats
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INDUSTRIES.map((sector) => (
                <div
                  key={sector}
                  className="flex items-center gap-3 rounded-2xl border border-[#074E5B]/10 bg-white px-4 py-3.5 text-sm font-medium text-[#08242B] shadow-xs"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-tr from-[#074E5B] via-[#39A959] to-[#D6F80B]"
                    aria-hidden="true"
                  />
                  {sector}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaHorizonSection />
    </>
  );
}

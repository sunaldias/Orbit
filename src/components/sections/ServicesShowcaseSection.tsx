import Link from "next/link";
import { ArrowUpRight, Film, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SERVICE_PILLARS, SERVICES } from "@/data/services";
import type { ServicePillar } from "@/types/database";

const PILLAR_ICONS: Record<ServicePillar, typeof Film> = {
  "motion-film": Film,
  "capture-visuals": Sparkles,
  "brand-design": Layers,
};

export function ServicesShowcaseSection() {
  const pillars = Object.values(SERVICE_PILLARS);

  return (
    <section className="relative border-y border-[#074E5B]/10 bg-[#EDF3F3] py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 orbit-grid-bg opacity-45"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeader
            eyebrow="11 Integrated Capabilities"
            title="One Agency For Every Visual Touchpoint"
            description="From pre-event launch trailers and motion flyers to on-site cinema crews, stage LED visuals, and post-event aftermovies—zero handoff friction."
          />
          <Button href="/services" variant="outline" size="md">
            Explore All 11 Services
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar, idx) => {
            const Icon = PILLAR_ICONS[pillar.id];
            const pillarServices = SERVICES.filter((s) => s.pillar === pillar.id);

            return (
              <Reveal key={pillar.id} delay={idx * 0.1}>
                <div className="flex h-full flex-col justify-between rounded-3xl border border-[#074E5B]/12 bg-white p-7 shadow-[0_14px_40px_-28px_rgba(7,78,91,0.18)] orbit-card-glow sm:p-8">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#074E5B] via-[#2B9362] to-[#A9E41E] text-white shadow-sm">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#6C848A]">
                        PILLAR {pillar.code}
                      </span>
                    </div>

                    <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-[#08242B]">
                      {pillar.label}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#486369]">
                      {pillar.description}
                    </p>

                    <ul className="mt-6 space-y-2 border-t border-[#074E5B]/10 pt-6">
                      {pillarServices.map((service) => (
                        <li key={service.slug}>
                          <Link
                            href={`/booking?service=${service.slug}`}
                            className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[#08242B] transition-colors hover:bg-[#F2F7F7] hover:text-[#074E5B]"
                          >
                            <span>{service.name}</span>
                            <ArrowUpRight
                              className="h-4 w-4 text-[#6C848A] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#39A959]"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4">
                    <Link
                      href={`/services#${pillar.id}`}
                      className="inline-flex items-center gap-1.5 font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-wider text-[#074E5B] uppercase hover:text-[#2D965A]"
                    >
                      View deliverables
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

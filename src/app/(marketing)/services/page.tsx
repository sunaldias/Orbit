import type { Metadata } from "next";
import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { CtaHorizonSection } from "@/components/sections/CtaHorizonSection";
import { FaqAccordion } from "@/components/services/FaqAccordion";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/data/navigation";
import { SERVICE_PILLARS, SERVICES } from "@/data/services";
import { serializeJsonLd } from "@/lib/security";

export const metadata: Metadata = {
  title: "Creative Services",
  description:
    "Explore ORBIT's 11 specialized event creative services: Event Videography, Video Editing, Event Photography, Graphic Design, Flyer Design, Motion Flyers, Promotional Videos, Motion Graphics, Event Branding, Creative Direction, and Event Visual Production.",
};

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "ORBIT Creative Services",
  itemListElement: SERVICES.map((service, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@type": "Service",
      name: service.name,
      description: service.shortDescription,
      provider: {
        "@type": "Organization",
        name: SITE_CONFIG.legalName,
      },
    },
  })),
};

export default function ServicesPage() {
  const pillars = Object.values(SERVICE_PILLARS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(servicesJsonLd) }}
      />

      {/* Hero Header */}
      <section className="relative bg-[#F5F8F8] pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[380px] orbit-grid-bg opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Full-Spectrum Event Production"
            title="11 Specialized Services. One Seamless Creative Engine."
            description="Book a single high-impact deliverable—like a 3D motion flyer or keynote photography—or combine disciplines into a complete end-to-end event production suite."
          />

          {/* Quick Jump Anchors */}
          <div className="mt-8 flex flex-wrap gap-3">
            {pillars.map((pillar) => (
              <a
                key={pillar.id}
                href={`#${pillar.id}`}
                className="rounded-full border border-[#074E5B]/15 bg-white px-4 py-2 font-[family-name:var(--font-tagline)] text-xs font-semibold text-[#074E5B] shadow-xs transition-colors hover:border-[#39A959] hover:bg-[#074E5B] hover:text-white"
              >
                {pillar.code} · {pillar.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grouped by Pillar */}
      <div className="space-y-24 bg-[#F5F8F8] pb-24">
        {pillars.map((pillar) => {
          const items = SERVICES.filter((s) => s.pillar === pillar.id);
          return (
            <section
              key={pillar.id}
              id={pillar.id}
              className="scroll-mt-28 mx-auto max-w-7xl px-5 sm:px-8"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-[#074E5B]/12 pb-6 md:flex-row md:items-end">
                <div>
                  <span className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.24em] text-[#074E5B] uppercase">
                    Pillar {pillar.code}
                  </span>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#08242B] sm:text-4xl">
                    {pillar.label}
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-[#486369]">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((service, idx) => (
                  <Reveal key={service.slug} delay={idx * 0.06}>
                    <div className="flex h-full flex-col justify-between rounded-3xl border border-[#074E5B]/12 bg-white p-7 shadow-sm orbit-card-glow">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-[family-name:var(--font-display)] text-sm font-extrabold text-gradient-teal">
                            {String(service.sortOrder).padStart(2, "0")}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#39A959]/25 bg-[#F1F9F5] px-3 py-1 font-[family-name:var(--font-tagline)] text-[11px] font-medium text-[#074E5B]">
                            <Clock className="h-3 w-3 text-[#39A959]" aria-hidden="true" />
                            {service.turnaround}
                          </span>
                        </div>

                        <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-[#08242B]">
                          {service.name}
                        </h3>
                        <p className="mt-2 text-xs font-semibold text-[#1B7E6B]">
                          {service.tagline}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-[#486369]">
                          {service.shortDescription}
                        </p>

                        <ul className="mt-6 space-y-2.5 border-t border-[#074E5B]/10 pt-5">
                          {service.deliverables.map((deliverable) => (
                            <li
                              key={deliverable}
                              className="flex items-start gap-2.5 text-xs text-[#2D484E]"
                            >
                              <CheckCircle2
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#39A959]"
                                aria-hidden="true"
                              />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-7 pt-2">
                        <Button
                          href={`/booking?service=${service.slug}`}
                          variant="secondary"
                          size="sm"
                          className="w-full"
                        >
                          Book {service.name}
                          <ArrowUpRight className="h-3.5 w-3.5 text-[#074E5B]" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* FAQ Section */}
      <section className="border-t border-[#074E5B]/10 bg-[#EDF3F3] py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Production FAQ"
            title="Common Questions Before Booking"
            align="center"
          />
          <div className="mt-12">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <CtaHorizonSection />
    </>
  );
}

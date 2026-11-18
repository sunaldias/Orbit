import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
} from "lucide-react";
import { CtaHorizonSection } from "@/components/sections/CtaHorizonSection";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/data/navigation";
import { SERVICES } from "@/data/services";

export const metadata: Metadata = {
  title: "Contact ORBIT",
  description:
    "Connect directly with ORBIT's creative production desk for event inquiries, agency partnerships, press requests, and international bookings.",
};

const COLLABORATION_DESKS = [
  {
    code: "01",
    title: "Event Production & Bookings",
    description:
      "Have an upcoming festival, launch, tour, conference, or campaign? Submit a full project brief with your dates and required disciplines.",
    ctaLabel: "Open Booking Brief",
    ctaHref: "/booking",
  },
  {
    code: "02",
    title: "Agency & Promoter Partnerships",
    description:
      "We partner with event management houses, talent agencies, and hospitality groups for recurring multi-event creative direction and visuals.",
    ctaLabel: "Email Partnerships",
    ctaHref: `mailto:${SITE_CONFIG.email}?subject=ORBIT%20Agency%20Partnership%20Inquiry`,
    external: true,
  },
  {
    code: "03",
    title: "Press, Media & Private Reels",
    description:
      "Request private NDA-protected stage reels, press imagery, or studio credentials for upcoming global productions.",
    ctaLabel: "Request Private Reel",
    ctaHref: `mailto:${SITE_CONFIG.email}?subject=ORBIT%20Private%20Showreel%20Request`,
    external: true,
  },
];

const PRODUCTION_HUBS = [
  {
    city: "Los Angeles",
    region: "North America Hub",
    hours: "Mon–Fri · 09:00–19:00 PT",
  },
  {
    city: "London",
    region: "Europe & UK Hub",
    hours: "Mon–Fri · 09:00–19:00 GMT",
  },
  {
    city: "Global Touring Unit",
    region: "On-Site Worldwide",
    hours: "24/7 Active Show-Day Desk",
  },
];

export default function ContactPage() {
  const isPlaceholderContact = SITE_CONFIG.email.endsWith(".example");

  return (
    <>
      <section className="relative bg-[#F5F8F8] pt-32 pb-20 sm:pt-40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[380px] orbit-grid-bg opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Contact & Direct Desk"
            title="Connect With The ORBIT Production Team"
            description="Reach our studio directly for general inquiries, partnerships, or press—or jump straight into our structured Booking brief to scope an upcoming event."
          />

          {/* Primary Direct Contact Cards */}
          <div className="mt-14 grid gap-6 lg:grid-cols-12">
            {/* Direct Email & Phone */}
            <div className="rounded-3xl border border-[#074E5B]/12 bg-white p-7 shadow-sm sm:p-9 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
                  Direct Channels
                </p>
                {isPlaceholderContact && (
                  <span className="rounded-full border border-[#074E5B]/15 bg-[#F5F8F8] px-3 py-1 font-[family-name:var(--font-tagline)] text-[10px] tracking-wider text-[#6C848A] uppercase">
                    Placeholder Contact · Set via Env
                  </span>
                )}
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="group rounded-2xl border border-[#074E5B]/12 bg-[#F5F8F8] p-5 transition-colors hover:border-[#39A959] hover:bg-white"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#074E5B] text-[#D6F80B]">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-wider text-[#6C848A] uppercase">
                    Business Email
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-[#08242B] group-hover:text-[#074E5B]">
                    {SITE_CONFIG.email}
                  </p>
                </a>

                <a
                  href={`tel:${SITE_CONFIG.phone.replace(/[^+\d]/g, "")}`}
                  className="group rounded-2xl border border-[#074E5B]/12 bg-[#F5F8F8] p-5 transition-colors hover:border-[#39A959] hover:bg-white"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#074E5B] text-[#D6F80B]">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-[family-name:var(--font-tagline)] text-[11px] font-semibold tracking-wider text-[#6C848A] uppercase">
                    Production Line
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#08242B] group-hover:text-[#074E5B]">
                    {SITE_CONFIG.phone}
                  </p>
                </a>
              </div>

              {/* Response SLA + Socials */}
              <div className="mt-7 flex flex-col justify-between gap-5 border-t border-[#074E5B]/10 pt-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5 text-xs text-[#486369]">
                  <Clock className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
                  <span>Response SLA: Within 24 business hours</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {SITE_CONFIG.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-[#074E5B]/14 bg-[#F5F8F8] px-3 py-1.5 font-[family-name:var(--font-tagline)] text-[11px] font-semibold text-[#074E5B] transition-colors hover:border-[#39A959] hover:bg-[#074E5B] hover:text-white"
                    >
                      {social.label}
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Fast-Track Booking Card (Signature Deep Teal Brand Panel) */}
            <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#074E5B] via-[#0E6B6E] to-[#1D8C67] p-7 text-white shadow-[0_24px_56px_-26px_rgba(7,78,91,0.5)] sm:p-9 lg:col-span-5">
              <div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D6F80B] text-[#072B33]">
                  <MessageSquare className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
                  Ready To Scope A Project?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  Use our dedicated Booking form to pick exact services, enter
                  your event date and venue, and receive an instant booking
                  reference code.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <Button href="/booking" variant="lime" size="lg" className="w-full">
                  Launch Project Booking Form
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <p className="text-center font-[family-name:var(--font-tagline)] text-[11px] text-white/75">
                  No upfront checkout · Tailored proposal within 24h
                </p>
              </div>
            </div>
          </div>

          {/* Collaboration Desks */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {COLLABORATION_DESKS.map((desk, idx) => (
              <Reveal key={desk.code} delay={idx * 0.08}>
                <div className="flex h-full flex-col justify-between rounded-3xl border border-[#074E5B]/12 bg-white p-7 shadow-sm orbit-card-glow">
                  <div>
                    <span className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#39A959]">
                      DESK {desk.code}
                    </span>
                    <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
                      {desk.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#486369]">
                      {desk.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4">
                    {desk.external ? (
                      <a
                        href={desk.ctaHref}
                        className="inline-flex items-center gap-1.5 font-[family-name:var(--font-tagline)] text-xs font-semibold text-[#074E5B] uppercase hover:text-[#39A959]"
                      >
                        {desk.ctaLabel}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        href={desk.ctaHref}
                        className="inline-flex items-center gap-1.5 font-[family-name:var(--font-tagline)] text-xs font-semibold text-[#074E5B] uppercase hover:text-[#39A959]"
                      >
                        {desk.ctaLabel}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Global Hubs + Quick Service Jump */}
          <div className="mt-14 grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl border border-[#074E5B]/12 bg-[#EDF3F3] p-7 sm:p-8 lg:col-span-5">
              <div className="flex items-center gap-2 font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
                <Globe className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
                Global Presence
              </div>
              <div className="mt-6 space-y-5">
                {PRODUCTION_HUBS.map((hub) => (
                  <div
                    key={hub.city}
                    className="border-b border-[#074E5B]/12 pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#08242B]">
                      {hub.city}
                    </p>
                    <p className="text-xs font-semibold text-[#074E5B]">
                      {hub.region}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-tagline)] text-[11px] text-[#486369]">
                      {hub.hours}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#074E5B]/12 bg-white p-7 shadow-sm sm:p-8 lg:col-span-7">
              <div className="flex items-center gap-2 font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
                <Sparkles className="h-4 w-4 text-[#39A959]" aria-hidden="true" />
                Start By Service
              </div>
              <p className="mt-3 text-sm text-[#486369]">
                Select any discipline to jump straight to our Booking brief with
                that service pre-selected.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {SERVICES.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/booking?service=${service.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#074E5B]/15 bg-[#F5F8F8] px-4 py-2 text-xs font-semibold text-[#08242B] transition-all hover:border-[#074E5B] hover:bg-[#074E5B] hover:text-white"
                  >
                    {service.name}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaHorizonSection />
    </>
  );
}

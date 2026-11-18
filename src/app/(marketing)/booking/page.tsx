import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarCheck2, Clock, FileText, ShieldCheck } from "lucide-react";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Book a Project — Event Production Inquiry",
  description:
    "Submit a structured project booking brief for ORBIT event videography, visual production, motion flyers, event branding, photography, or creative direction.",
};

const BOOKING_STEPS = [
  {
    icon: FileText,
    step: "01",
    title: "Submit Your Brief",
    text: "Select required creative services, share your event dates, venue, and estimated budget.",
  },
  {
    icon: Clock,
    step: "02",
    title: "24-Hour Director Review",
    text: "Our production directors review feasibility, crew availability, and creative direction.",
  },
  {
    icon: CalendarCheck2,
    step: "03",
    title: "Tailored Proposal & Schedule",
    text: "Receive an itemized scope, timeline, and visual treatment—no online payment required upfront.",
  },
];

export default function BookingPage() {
  return (
    <section className="relative bg-[#F5F8F8] pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px] orbit-grid-bg opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Booking Inquiry"
          title="Submit Your Event Production Brief"
          description="Select your required services and share your project vision. Submitting an inquiry initiates director review and a tailored proposal—it is not an automatic booking confirmation and requires no online payment."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          {/* Primary Booking Brief Form */}
          <div className="lg:col-span-8">
            <Suspense
              fallback={
                <div className="h-[640px] animate-pulse rounded-3xl border border-[#074E5B]/10 bg-white" />
              }
            >
              <InquiryForm />
            </Suspense>
          </div>

          {/* Booking Process & Assurance Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-[#074E5B]/12 bg-white p-7 shadow-sm">
              <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#074E5B] uppercase">
                How Booking Works
              </p>
              <ol className="mt-6 space-y-6">
                {BOOKING_STEPS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.step} className="flex gap-4">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#074E5B] via-[#2B9362] to-[#A9E41E] text-white">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-[family-name:var(--font-tagline)] text-[11px] font-semibold text-[#6C848A]">
                          STEP {item.step}
                        </p>
                        <h2 className="mt-0.5 font-[family-name:var(--font-display)] text-base font-bold text-[#08242B]">
                          {item.title}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-[#486369]">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="rounded-3xl border border-[#39A959]/25 bg-[#F1F9F5] p-7">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#074E5B] text-[#D6F80B]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold text-[#08242B]">
                Protected &amp; Confidential
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#486369]">
                Protected by Zod schema validation, Cloudflare Turnstile,
                Upstash rate limiting, and Supabase Row Level Security. Read our{" "}
                <Link href="/privacy" className="font-semibold text-[#074E5B] hover:underline">
                  Privacy Policy
                </Link>{" "}
                or visit{" "}
                <Link href="/contact" className="font-semibold text-[#074E5B] hover:underline">
                  Contact
                </Link>{" "}
                for general press &amp; partnership inquiries.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

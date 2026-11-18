import type { Metadata } from "next";
import { SITE_CONFIG } from "@/data/navigation";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ORBIT Creative Agency collects, protects, and retains project inquiry information.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-36 pb-24 sm:px-8">
      <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.26em] text-[#074E5B] uppercase">
        Legal &amp; Security
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-[#08242B]">
        Privacy Policy
      </h1>
      <p className="mt-3 text-xs text-[#6C848A]">
        Last updated: November 2026
      </p>

      <div className="mt-10 space-y-8 rounded-3xl border border-[#074E5B]/12 bg-white p-7 text-sm leading-relaxed text-[#486369] shadow-sm sm:p-10">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
            1. Information We Collect
          </h2>
          <p className="mt-2">
            When you submit a project inquiry through our website, we collect
            only the information you voluntarily provide: your name, email
            address, optional phone number, company or organization, requested
            creative services, event details, budget range, and project brief.
          </p>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
            2. How We Use &amp; Protect Your Data
          </h2>
          <p className="mt-2">
            We use your inquiry strictly to evaluate your event requirements,
            prepare creative proposals, and communicate with you regarding your
            booking. Submissions are transmitted over HTTPS, protected against
            abuse using Cloudflare Turnstile and Upstash rate limiting, and
            stored in an access-restricted PostgreSQL database protected by Row
            Level Security. We hash IP addresses with a salted cryptographic
            digest solely for abuse prevention and never sell or share your data
            with third-party marketers.
          </p>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
            3. Data Retention &amp; Deletion Requests
          </h2>
          <p className="mt-2">
            Project inquiries are retained only as long as necessary to manage
            booking communications and production records. You may request
            access to or deletion of your inquiry data at any time by emailing{" "}
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="font-semibold text-[#074E5B] hover:underline"
            >
              {SITE_CONFIG.email}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

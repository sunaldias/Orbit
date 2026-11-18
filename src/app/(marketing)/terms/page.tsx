import type { Metadata } from "next";
import { SITE_CONFIG } from "@/data/navigation";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing the use of the ORBIT Creative Agency website.",
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-36 pb-24 sm:px-8">
      <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.26em] text-[#074E5B] uppercase">
        Legal
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-[#08242B]">
        Terms of Service
      </h1>
      <p className="mt-3 text-xs text-[#6C848A]">
        Last updated: November 2026
      </p>

      <div className="mt-10 space-y-8 rounded-3xl border border-[#074E5B]/12 bg-white p-7 text-sm leading-relaxed text-[#486369] shadow-sm sm:p-10">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
            1. Scope &amp; Inquiries
          </h2>
          <p className="mt-2">
            Submitting a project inquiry on this website does not create a
            binding production contract or reservation. All project timelines,
            deliverables, licensing rights, and fees are finalized in a separate
            written creative agreement signed by both parties.
          </p>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
            2. Intellectual Property
          </h2>
          <p className="mt-2">
            All portfolio photography, films, motion graphics, flyers, brand
            identities, copy, and visual designs displayed on this website are
            the intellectual property of {SITE_CONFIG.legalName} or its
            respective clients and may not be reproduced or redistributed
            without written permission.
          </p>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
            3. Acceptable Use
          </h2>
          <p className="mt-2">
            Automated scraping, spam submissions, or attempts to bypass security
            controls on this website are strictly prohibited.
          </p>
        </div>
      </div>
    </section>
  );
}

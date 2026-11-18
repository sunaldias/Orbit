"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How far in advance should we book ORBIT for an event?",
    a: "For full-scale festivals, multi-day conferences, or stage visual production, we recommend reaching out 4–8 weeks ahead. For flyers, motion flyers, and rapid promo trailers, we can often kick off within 48 hours.",
  },
  {
    q: "Can we bundle multiple services like Event Branding, Motion Flyers, and Live Videography?",
    a: "Yes—in fact, most clients book integrated packages so their pre-event campaign flyers, on-site LED stage visuals, and post-event aftermovie share one cohesive creative direction.",
  },
  {
    q: "Do you travel internationally for on-site event production?",
    a: "Absolutely. Our cinema crews, photographers, and visual directors travel worldwide for festivals, tours, corporate keynotes, and private brand activations.",
  },
  {
    q: "How quickly do you deliver edited press photos and social teasers?",
    a: "We offer live on-site media desk workflows capable of delivering retouched press stills in under 30 minutes and vertical 9:16 recap reels within 12–24 hours of your event.",
  },
  {
    q: "How does pricing and booking work?",
    a: "Because every event has unique scale and deliverables, we do not charge fixed online checkout fees. Submit a project inquiry with your scope and dates, and we will send a tailored creative treatment and itemized proposal within 24 business hours.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[#074E5B]/10 rounded-3xl border border-[#074E5B]/12 bg-white shadow-sm">
      {FAQS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.q} className="px-6 py-5 sm:px-8">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
            >
              <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[#08242B]">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-[#074E5B] transition-transform duration-200",
                  isOpen && "rotate-180 text-[#39A959]"
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <p className="mt-3 pr-8 text-sm leading-relaxed text-[#486369]">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

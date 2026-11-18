import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HorizonGlow } from "@/components/ui/HorizonGlow";
import { Reveal } from "@/components/ui/Reveal";

interface CtaHorizonSectionProps {
  heading?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function CtaHorizonSection({
  heading = "Ready To Put Your Next Event In Orbit?",
  description = "Share your event date, venue, and creative goals. Our production directors respond to every booking inquiry within 24 business hours.",
  ctaLabel = "Book a Project",
  ctaHref = "/booking",
}: CtaHorizonSectionProps) {
  return (
    <section className="relative overflow-hidden border-t border-[#074E5B]/10 bg-[#F5F8F8] pt-20 sm:pt-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 orbit-grid-bg opacity-70 [mask-image:radial-gradient(ellipse_at_50%_40%,black_30%,transparent_85%)]"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-[family-name:var(--font-tagline)] text-xs font-medium tracking-[0.3em] text-[#074E5B] uppercase">
            Every Detail, Intended .
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[#08242B] sm:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#486369] sm:text-lg">
            {description}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={ctaHref} size="lg" className="w-full sm:w-auto">
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              href="/services"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Browse Services
            </Button>
          </div>
        </Reveal>
      </div>

      <div className="-mt-4 sm:-mt-6">
        <HorizonGlow variant="cta" />
      </div>
    </section>
  );
}

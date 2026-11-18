import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery & Creative Brief",
    description:
      "We align on your event scale, venue architecture, audience profile, target launch timeline, and deliverable formats.",
  },
  {
    step: "02",
    title: "Direction & Visual Systems",
    description:
      "Our directors build visual moodboards, lighting & color language, flyer key art, motion styleframes, and shot plans.",
  },
  {
    step: "03",
    title: "Production & Live Capture",
    description:
      "Cinema camera units, editorial photographers, and LED visual operators execute seamlessly on site or in studio.",
  },
  {
    step: "04",
    title: "Post-Production & Rollout",
    description:
      "Rapid press selects, color-graded aftermovies, kinetic motion flyers, and multi-platform cuts delivered ready to publish.",
  },
];

export function ProcessSection() {
  return (
    <section className="relative bg-[#F5F8F8] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Production Methodology"
          title="Built For High-Stakes Deadlines & Live Precision"
          description="Events don't get second takes. Our four-stage pipeline keeps creative direction sharp and every deliverable locked ahead of showtime."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((item, idx) => (
            <Reveal key={item.step} delay={idx * 0.08}>
              <div className="relative h-full rounded-3xl border border-[#074E5B]/12 bg-white p-7 shadow-[0_14px_38px_-28px_rgba(7,78,91,0.16)] orbit-card-glow">
                <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-gradient-teal">
                  {item.step}
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold text-[#08242B]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#486369]">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

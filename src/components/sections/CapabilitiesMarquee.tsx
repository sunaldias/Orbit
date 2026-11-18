import { SERVICES } from "@/data/services";

export function CapabilitiesMarquee() {
  const repeated = [...SERVICES, ...SERVICES];

  return (
    <div
      aria-label="ORBIT creative services ticker"
      className="relative overflow-hidden border-y border-[#074E5B]/10 bg-white py-4"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent"
      />

      <div className="animate-orbit-marquee items-center gap-8">
        {repeated.map((service, idx) => (
          <span
            key={`${service.slug}-${idx}`}
            className="inline-flex items-center gap-8 font-[family-name:var(--font-tagline)] text-xs font-medium tracking-[0.24em] text-[#074E5B] uppercase"
          >
            <span>{service.name}</span>
            <span
              className="h-2 w-2 rounded-full bg-gradient-to-tr from-[#074E5B] via-[#39A959] to-[#D6F80B]"
              aria-hidden="true"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface HorizonGlowProps {
  variant?: "hero" | "cta" | "subtle";
  className?: string;
}

/**
 * Signature ORBIT glowing curved planetary horizon matching the uploaded brand identity:
 * Crisp Deep Teal (#074E5B) rim crowned by a luminous Emerald (#28DA56) -> Acid Lime (#D6F80B)
 * crest radiating cleanly onto the bright architectural canvas (#F5F8F8).
 */
export function HorizonGlow({
  variant = "hero",
  className,
}: HorizonGlowProps) {
  const heightClass =
    variant === "hero"
      ? "h-[200px] sm:h-[250px] lg:h-[300px]"
      : variant === "cta"
        ? "h-[160px] sm:h-[210px]"
        : "h-[110px]";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative w-full overflow-hidden select-none",
        heightClass,
        className
      )}
    >
      {/* Luminous Emerald + Acid Lime Crest Bloom above the Horizon */}
      <div
        className="absolute left-1/2 top-[22%] h-[120px] w-[520px] -translate-x-1/2 rounded-full blur-[44px] opacity-90 sm:w-[740px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(214,248,11,0.72) 0%, rgba(52,216,96,0.44) 36%, rgba(7,120,124,0.22) 64%, rgba(245,248,248,0) 82%)",
        }}
      />

      {/* Crisp Curved Planetary Horizon SVG */}
      <svg
        viewBox="0 0 1440 280"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`horizonOuter-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#074E5B" stopOpacity="0" />
            <stop offset="16%" stopColor="#0A6472" stopOpacity="0.85" />
            <stop offset="38%" stopColor="#18A86B" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#D6F80B" stopOpacity="1" />
            <stop offset="62%" stopColor="#18A86B" stopOpacity="0.95" />
            <stop offset="84%" stopColor="#0A6472" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#074E5B" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`horizonRim-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#074E5B" stopOpacity="0" />
            <stop offset="18%" stopColor="#074E5B" stopOpacity="0.92" />
            <stop offset="44%" stopColor="#1B8F6B" stopOpacity="1" />
            <stop offset="50%" stopColor="#E4FF2B" stopOpacity="1" />
            <stop offset="56%" stopColor="#1B8F6B" stopOpacity="1" />
            <stop offset="82%" stopColor="#074E5B" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#074E5B" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`horizonMaskFill-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5F8F8" stopOpacity="0.96" />
            <stop offset="40%" stopColor="#F5F8F8" stopOpacity="1" />
            <stop offset="100%" stopColor="#F5F8F8" stopOpacity="1" />
          </linearGradient>

          <filter id={`horizonAurora-${variant}`} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>

        {/* Soft Glowing Aurora Band */}
        <path
          d="M 40 230 Q 720 35 1400 230"
          stroke={`url(#horizonOuter-${variant})`}
          strokeWidth="22"
          filter={`url(#horizonAurora-${variant})`}
          opacity="0.72"
        />

        {/* Bright Canvas Body cleanly clipping the lower half of the aurora like the logo */}
        <path
          d="M -60 236 Q 720 44 1500 236 L 1500 290 L -60 290 Z"
          fill={`url(#horizonMaskFill-${variant})`}
        />

        {/* Crisp Architectural Rim Curve */}
        <path
          d="M 20 236 Q 720 42 1420 236"
          stroke={`url(#horizonRim-${variant})`}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Subtle Inner Specular Highlight at Apex */}
        <path
          d="M 380 156 Q 720 82 1060 156"
          stroke="#EEFF66"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

import { useId } from "react";
import { cn } from "@/lib/utils";

interface OrbitLogoProps {
  className?: string;
  showSubtext?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Authentic ORBIT infinity-loop wordmark ("∞rbit") featuring the signature
 * Deep Teal (#074E5B) -> Emerald (#42A856) -> Acid Lime (#D6F80B) gradient
 * and optional glowing curved horizon + "EVERY DETAIL, INTENDED ." tagline.
 */
export function OrbitLogo({
  className,
  showSubtext = false,
  size = "md",
}: OrbitLogoProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `orbitWordGrad-${uid}`;
  const arcId = `orbitArcGrad-${uid}`;

  const iconHeight =
    size === "lg" ? "h-12" : size === "sm" ? "h-6" : "h-7";
  const textSize =
    size === "lg"
      ? "text-4xl sm:text-5xl"
      : size === "sm"
        ? "text-xl"
        : "text-[26px]";

  return (
    <span className={cn("inline-flex flex-col items-start", className)}>
      <span className="inline-flex items-center gap-[1px] leading-none">
        {/* Iconic Infinity-Loop Double-O Glyph */}
        <svg
          viewBox="0 0 76 42"
          fill="none"
          aria-hidden="true"
          className={cn(iconHeight, "w-auto shrink-0")}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id={gradId}
              x1="0"
              y1="21"
              x2="76"
              y2="18"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#074E5B" />
              <stop offset="48%" stopColor="#1F766F" />
              <stop offset="100%" stopColor="#56A954" />
            </linearGradient>
          </defs>
          <path
            d="M20.5 9C13.6 9 8.5 14.4 8.5 21C8.5 27.6 13.6 33 20.5 33C27.2 33 32.2 27.6 38 21C43.8 14.4 48.8 9 55.5 9C62.4 9 67.5 14.4 67.5 21C67.5 27.6 62.4 33 55.5 33C48.8 33 43.8 27.6 38 21C32.2 14.4 27.2 9 20.5 9Z"
            stroke={`url(#${gradId})`}
            strokeWidth="10.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Bold Geometric Lowercase "rbit" in Emerald -> Acid Lime Gradient */}
        <span
          className={cn(
            "font-[family-name:var(--font-display)] font-extrabold tracking-[-0.04em] leading-none",
            textSize
          )}
          style={{
            background:
              "linear-gradient(92deg, #4DA656 0%, #86CF32 48%, #CEF50E 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          rbit
        </span>
      </span>

      {showSubtext && (
        <span className="mt-1.5 flex w-full flex-col items-start">
          <svg
            viewBox="0 0 180 14"
            fill="none"
            aria-hidden="true"
            className="h-2.5 w-36"
          >
            <defs>
              <linearGradient id={arcId} x1="0" y1="10" x2="180" y2="10" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#074E5B" stopOpacity="0.1" />
                <stop offset="22%" stopColor="#0A6672" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#B8ED18" stopOpacity="1" />
                <stop offset="78%" stopColor="#0A6672" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#074E5B" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M4 12 Q 90 1 176 12"
              stroke={`url(#${arcId})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="mt-1 font-[family-name:var(--font-tagline)] text-[9.5px] font-normal tracking-[0.34em] text-[#486369] uppercase">
            Every Detail, Intended .
          </span>
        </span>
      )}
    </span>
  );
}

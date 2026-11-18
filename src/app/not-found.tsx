import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HorizonGlow } from "@/components/ui/HorizonGlow";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F5F8F8] px-5 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 orbit-grid-bg opacity-70"
      />
      <div className="relative z-10 max-w-lg">
        <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.28em] text-[#074E5B] uppercase">
          Error 404 · Signal Lost
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-extrabold text-[#08242B] sm:text-6xl">
          Out of Orbit
        </h1>
        <p className="mt-4 text-base text-[#486369]">
          The page or case study you requested doesn&rsquo;t exist or has been
          moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/" size="md">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return Home
          </Button>
          <Button href="/portfolio" variant="secondary" size="md">
            Explore Portfolio
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <HorizonGlow variant="cta" />
      </div>
    </div>
  );
}

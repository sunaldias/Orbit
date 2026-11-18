"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F8F8] px-5 text-center">
      <p className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.26em] text-[#074E5B] uppercase">
        Unexpected Interruption
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold text-[#08242B]">
        Something Went Off Track
      </h1>
      <p className="mt-3 max-w-md text-sm text-[#486369]">
        A temporary error occurred while rendering this view. Please try again.
      </p>
      <div className="mt-7 flex gap-3">
        <Button type="button" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
        <Button href="/" variant="secondary">
          Go Home
        </Button>
      </div>
    </div>
  );
}

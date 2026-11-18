import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p className="inline-flex items-center gap-2.5 font-[family-name:var(--font-tagline)] text-xs font-medium tracking-[0.28em] text-[#074E5B] uppercase">
        <span
          className="h-2 w-2 rounded-full bg-gradient-to-tr from-[#074E5B] via-[#39A959] to-[#D6F80B]"
          aria-hidden="true"
        />
        {eyebrow}
      </p>
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[#08242B] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-[#486369] sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OrbitLogo } from "@/components/ui/OrbitLogo";
import { NAV_LINKS, SITE_CONFIG } from "@/data/navigation";
import { SERVICES } from "@/data/services";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#074E5B]/12 bg-white">
      {/* Subtle Signature Teal -> Lime Top Accent Line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#39A959] to-transparent opacity-70"
      />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <OrbitLogo showSubtext />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#486369]">
              Creative event production agency crafting cinema-grade coverage,
              live stage visual worlds, kinetic motion flyers, and unmistakable
              event identities worldwide.
            </p>
            <div className="mt-6 flex flex-col gap-1.5 font-[family-name:var(--font-tagline)] text-xs text-[#486369]">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="font-semibold text-[#074E5B] transition-colors hover:text-[#2D965A]"
              >
                {SITE_CONFIG.email}
              </a>
              <span>{SITE_CONFIG.location}</span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <h3 className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#08242B] uppercase">
              Agency
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#486369]">
              <li>
                <Link href="/" className="transition-colors hover:text-[#074E5B]">
                  Home
                </Link>
              </li>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-[#074E5B]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-1 font-semibold text-[#074E5B] hover:text-[#2E9D58]"
                >
                  Booking
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Quick Index */}
          <div className="lg:col-span-4">
            <h3 className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#08242B] uppercase">
              Core Capabilities
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-[#486369]">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/booking?service=${service.slug}`}
                    className="transition-colors hover:text-[#074E5B]"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials Column */}
          <div className="lg:col-span-2">
            <h3 className="font-[family-name:var(--font-tagline)] text-xs font-semibold tracking-[0.22em] text-[#08242B] uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#486369]">
              {SITE_CONFIG.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-[#074E5B]"
                  >
                    {social.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#074E5B]/10 pt-8 text-xs text-[#6C848A] sm:flex-row sm:items-center">
          <p>
            © {year} {SITE_CONFIG.legalName}. Every Detail, Intended.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-[#08242B]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#08242B]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

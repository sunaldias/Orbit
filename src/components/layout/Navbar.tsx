"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OrbitLogo } from "@/components/ui/OrbitLogo";
import { NAV_LINKS, SITE_CONFIG } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[#074E5B]/10 bg-white/88 shadow-[0_10px_30px_-24px_rgba(7,78,91,0.35)] backdrop-blur-xl"
          : "bg-[#F5F8F8]/75 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="ORBIT Home"
          className="rounded-xl py-1 focus-visible:outline-[#074E5B]"
        >
          <OrbitLogo />
        </Link>

        {/* Desktop & Tablet Navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-[#074E5B] font-semibold"
                    : "text-[#486369] hover:bg-[#074E5B]/6 hover:text-[#08242B]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="orbit-nav-active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 -z-10 rounded-full border border-[#39A959]/30 bg-[#074E5B]/[0.07]"
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href="/booking" size="sm">
            Book a Project
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="orbit-mobile-menu"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#074E5B]/15 bg-white text-[#08242B] shadow-sm transition-colors hover:border-[#39A959] md:hidden cursor-pointer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="orbit-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-20 bottom-0 z-40 flex flex-col justify-between overflow-y-auto border-t border-[#074E5B]/10 bg-[#F5F8F8]/98 px-6 py-8 backdrop-blur-2xl md:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile links">
              <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className={cn(
                  "rounded-2xl px-4 py-3.5 font-[family-name:var(--font-display)] text-2xl font-bold transition-colors",
                  pathname === "/"
                    ? "bg-[#074E5B]/10 text-[#074E5B]"
                    : "text-[#08242B]"
                )}
              >
                Home
              </Link>
              {NAV_LINKS.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-2xl px-4 py-3.5 font-[family-name:var(--font-display)] text-2xl font-bold transition-colors",
                      active
                        ? "bg-[#074E5B]/10 text-[#074E5B]"
                        : "text-[#08242B]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/booking"
                aria-current={pathname === "/booking" ? "page" : undefined}
                className={cn(
                  "rounded-2xl px-4 py-3.5 font-[family-name:var(--font-display)] text-2xl font-bold transition-colors",
                  pathname === "/booking"
                    ? "bg-[#074E5B]/10 text-[#074E5B]"
                    : "text-[#1E8A64]"
                )}
              >
                Booking
              </Link>
            </nav>

            <div className="mt-8 space-y-5 border-t border-[#074E5B]/12 pt-6">
              <Button href="/booking" size="lg" className="w-full">
                Book a Project
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <div className="flex flex-col gap-1 font-[family-name:var(--font-tagline)] text-xs text-[#486369]">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="font-semibold text-[#074E5B] hover:underline"
                >
                  {SITE_CONFIG.email}
                </a>
                <span>{SITE_CONFIG.location}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

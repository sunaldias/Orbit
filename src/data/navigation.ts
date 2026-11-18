export const NAV_LINKS = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const SITE_CONFIG = {
  name: "ORBIT",
  legalName: "ORBIT Creative Agency",
  tagline: "Every Detail, Intended.",
  description:
    "ORBIT is a creative agency specializing in event videography, visual production, motion design, event branding, and creative direction. Every detail, intended.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_AGENCY_EMAIL || "bookings@orbitagency.example",
  phone: process.env.NEXT_PUBLIC_AGENCY_PHONE || "+1 (555) 014-8920",
  location:
    process.env.NEXT_PUBLIC_AGENCY_LOCATION || "Los Angeles · London · Worldwide",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Vimeo", href: "https://vimeo.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Behance", href: "https://behance.net" },
  ],
} as const;

export const BUDGET_RANGES = [
  { value: "under-3k", label: "Under $3,000" },
  { value: "3k-7k", label: "$3,000 – $7,500" },
  { value: "7k-15k", label: "$7,500 – $15,000" },
  { value: "15k-35k", label: "$15,000 – $35,000" },
  { value: "35k-plus", label: "$35,000+" },
  { value: "custom", label: "Not sure yet / Custom scope" },
] as const;

export const BUDGET_VALUES = BUDGET_RANGES.map((b) => b.value) as [
  string,
  ...string[],
];

export function getBudgetLabel(value: string): string {
  return BUDGET_RANGES.find((b) => b.value === value)?.label ?? value;
}

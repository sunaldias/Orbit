import type { ServiceItem, ServicePillar } from "../types/database.ts";

export const SERVICE_PILLARS: Record<
  ServicePillar,
  {
    id: ServicePillar;
    label: string;
    code: string;
    description: string;
  }
> = {
  "motion-film": {
    id: "motion-film",
    label: "Motion & Film",
    code: "01",
    description:
      "Cinema-grade live capture, kinetic trailers, motion flyers, and precision post-production engineered to build momentum.",
  },
  "capture-visuals": {
    id: "capture-visuals",
    label: "Capture & Live Visuals",
    code: "02",
    description:
      "Editorial event photography and timecoded LED stage visual systems designed for arena and festival scale.",
  },
  "brand-design": {
    id: "brand-design",
    label: "Brand & Direction",
    code: "03",
    description:
      "Cohesive event identity systems, key art flyers, graphic collateral, and unified creative direction from concept to curtain.",
  },
};

export const SERVICES: ServiceItem[] = [
  {
    slug: "event-videography",
    name: "Event Videography",
    pillar: "motion-film",
    tagline: "Cinema-grade multi-cam capture engineered for live energy.",
    shortDescription:
      "Full-scale cinema coverage for festivals, conferences, brand launches, and concerts—capturing stage dynamics, crowd electricity, and backstage craft in 4K/6K.",
    deliverables: [
      "Multi-cam 4K/6K cinema capture",
      "Gimbal & dynamic stage coverage",
      "Synchronized board & ambient audio",
      "Same-day vertical social teasers",
    ],
    turnaround: "3–10 business days",
    sortOrder: 1,
  },
  {
    slug: "video-editing",
    name: "Video Editing",
    pillar: "motion-film",
    tagline: "Rhythm-driven post-production that commands attention.",
    shortDescription:
      "Precision offline/online editing, bespoke sound design, cinema color grading, and multi-aspect masters engineered for broadcast, LED screens, and social feeds.",
    deliverables: [
      "Flagship aftermovies & highlight reels",
      "Cinema DaVinci Resolve color grading",
      "Bespoke SFX & mastered audio mix",
      "16:9, 9:16 & 4:5 platform exports",
    ],
    turnaround: "3–7 business days",
    sortOrder: 2,
  },
  {
    slug: "event-photography",
    name: "Event Photography",
    pillar: "capture-visuals",
    tagline: "Editorial stills with atmospheric lighting and razor-sharp timing.",
    shortDescription:
      "High-impact documentary and editorial photography crafted for press kits, sponsor recaps, artist portfolios, and real-time social coverage during live shows.",
    deliverables: [
      "Live press-ready selects on site",
      "Editorial keynote & performance stills",
      "VIP, artist & sponsor portraits",
      "Curated high-resolution delivery gallery",
    ],
    turnaround: "24–72 hours",
    sortOrder: 3,
  },
  {
    slug: "graphic-design",
    name: "Graphic Design",
    pillar: "brand-design",
    tagline: "Bold visual systems crafted for digital and physical impact.",
    shortDescription:
      "Cohesive event collateral, social launch kits, stage credentials, merchandise graphics, and sponsor assets designed with modern futuristic clarity.",
    deliverables: [
      "Social launch & countdown kits",
      "Passes, wristbands & venue signage",
      "Sponsor & partnership deck systems",
      "Print-ready & vector master files",
    ],
    turnaround: "3–7 business days",
    sortOrder: 4,
  },
  {
    slug: "flyer-design",
    name: "Flyer Design",
    pillar: "brand-design",
    tagline: "High-conversion posters and digital flyers built to sell out rooms.",
    shortDescription:
      "Custom typographic compositions and art-directed event posters crafted for headline club nights, tours, brand activations, and festival announcements.",
    deliverables: [
      "Hero key art poster composition",
      "Instagram Feed & Story formats",
      "Print-ready CMYK poster files",
      "Lineup & talent spotlight variants",
    ],
    turnaround: "2–5 business days",
    sortOrder: 5,
  },
  {
    slug: "motion-flyers",
    name: "Motion Flyers",
    pillar: "motion-film",
    tagline: "Kinetic digital announcements engineered to stop the scroll.",
    shortDescription:
      "Animated 2D/3D event flyers combining kinetic typography, atmospheric lighting, and punchy audio risers designed to maximize ticket clicks and shares.",
    deliverables: [
      "9:16 Reels / TikTok / Stories loop",
      "4:5 & 1:1 Feed cutdowns",
      "Custom sound design & beat sync",
      "Modular date & venue swap versions",
    ],
    turnaround: "3–6 business days",
    sortOrder: 6,
  },
  {
    slug: "promotional-videos",
    name: "Promotional Videos",
    pillar: "motion-film",
    tagline: "Launch trailers and hype films that turn curiosity into ticket sales.",
    shortDescription:
      "Concept-to-delivery promo films, teaser trailers, and countdown spots blending live footage, motion graphics, and original soundscapes for campaign velocity.",
    deliverables: [
      "30s–90s hero launch trailer",
      "Paid social ad cutdowns (6s / 15s)",
      "Concept script & pacing treatment",
      "Captioned social-first exports",
    ],
    turnaround: "5–12 business days",
    sortOrder: 7,
  },
  {
    slug: "motion-graphics",
    name: "Motion Graphics",
    pillar: "motion-film",
    tagline: "Futuristic 2D/3D visual systems in constant motion.",
    shortDescription:
      "Bespoke lower thirds, title sequences, kinetic logo reveals, data visualizations, and looping visual packages built for broadcast and live screens.",
    deliverables: [
      "Animated title & opener packages",
      "3D emblem & logo stings",
      "Broadcast lower thirds & bumpers",
      "Seamless ambient motion loops",
    ],
    turnaround: "5–14 business days",
    sortOrder: 8,
  },
  {
    slug: "event-branding",
    name: "Event Branding",
    pillar: "brand-design",
    tagline: "Complete visual worlds that make every touchpoint unmistakable.",
    shortDescription:
      "End-to-end event identity systems—from custom wordmarks, typography, and color architecture to environmental wayfinding, stage graphics, and digital presence.",
    deliverables: [
      "Event logotype & visual identity",
      "Comprehensive brand guidelines",
      "Environmental & stage graphic system",
      "Reusable campaign asset library",
    ],
    turnaround: "10–21 business days",
    sortOrder: 9,
  },
  {
    slug: "creative-direction",
    name: "Creative Direction",
    pillar: "brand-design",
    tagline: "Unified artistic leadership from first spark to final curtain.",
    shortDescription:
      "Strategic visual direction aligning stage architecture, lighting palettes, camera language, talent styling, and campaign rollout into one cohesive narrative.",
    deliverables: [
      "Visual moodboards & treatment decks",
      "Art direction & lighting palette",
      "On-site creative supervision",
      "Cross-channel campaign alignment",
    ],
    turnaround: "Custom scope",
    sortOrder: 10,
  },
  {
    slug: "event-visual-production",
    name: "Event Visual Production",
    pillar: "capture-visuals",
    tagline: "Live LED visuals, stage screens, and synchronized show aesthetics.",
    shortDescription:
      "Timecoded visual packs, ultra-wide LED canvas content, opening show sequences, and real-time stage graphics engineered for arena and festival architecture.",
    deliverables: [
      "Custom ultra-wide LED stage visuals",
      "Timecoded show-opener sequences",
      "Artist & keynote screen packages",
      "Media-server ready DXV / ProRes renders",
    ],
    turnaround: "10–21 business days",
    sortOrder: 11,
  },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug) as [string, ...string[]];

export const SERVICE_BY_SLUG = new Map<string, ServiceItem>(
  SERVICES.map((service) => [service.slug, service])
);

export function getServiceName(slug: string): string {
  return SERVICE_BY_SLUG.get(slug)?.name ?? slug;
}

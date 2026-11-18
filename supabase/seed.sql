-- =============================================================================
-- ORBIT Creative Agency — Seed Data (11 Core Services + Sample Case Studies)
-- Run in Supabase SQL Editor after 0001 and 0002 migrations.
-- Replace Cloudinary public_ids with your production uploads when ready.
-- =============================================================================

insert into public.services (slug, name, pillar, tagline, short_description, deliverables, turnaround, sort_order)
values
  (
    'event-videography',
    'Event Videography',
    'motion-film',
    'Cinema-grade multi-cam capture engineered for live energy.',
    'Full-scale cinema coverage for festivals, conferences, launches, and concerts—capturing stage dynamics, crowd electricity, and intimate backstage moments in 4K/6K.',
    '["Multi-cam 4K/6K cinema capture", "Gimbal & aerial coverage", "Synchronized live audio recording", "Same-day vertical teasers"]'::jsonb,
    '3–10 business days',
    1
  ),
  (
    'video-editing',
    'Video Editing',
    'motion-film',
    'Rhythm-driven post-production that commands attention.',
    'Precision offline/online editing, bespoke sound design, cinema color grading, and multi-aspect exports tailored for broadcast, stage LEDs, and social distribution.',
    '["Aftermovies & highlight reels", "Cinema DaVinci color grading", "Bespoke SFX & audio mixing", "16:9, 9:16 & 1:1 deliverables"]'::jsonb,
    '3–7 business days',
    2
  ),
  (
    'event-photography',
    'Event Photography',
    'capture-visuals',
    'Editorial stills with atmospheric lighting and razor-sharp timing.',
    'High-impact documentary and editorial photography built for press releases, sponsor decks, artist portfolios, and real-time social feeds during live shows.',
    '["Live press-ready selects", "Editorial keynote & stage stills", "VIP & talent portraits", "Curated high-res Cloudinary gallery"]'::jsonb,
    '24–72 hours',
    3
  ),
  (
    'graphic-design',
    'Graphic Design',
    'brand-design',
    'Bold visual systems crafted for digital and physical impact.',
    'Cohesive event collateral, social campaign kits, stage credentials, merchandise graphics, and sponsor assets designed with modern futuristic restraint.',
    '["Social launch & countdown kits", "Stage passes, wristbands & signage", "Sponsor & pitch deck layouts", "Print-ready & vector source files"]'::jsonb,
    '3–7 business days',
    4
  ),
  (
    'flyer-design',
    'Flyer Design',
    'brand-design',
    'High-conversion posters and digital flyers built to sell out rooms.',
    'Custom typographic compositions and art-directed event posters crafted for club nights, music tours, brand pop-ups, and headline announcements.',
    '["Hero key art poster", "Instagram Feed & Story formats", "Print-ready CMYK poster files", "Lineup & artist spotlight variants"]'::jsonb,
    '2–5 business days',
    5
  ),
  (
    'motion-flyers',
    'Motion Flyers',
    'motion-film',
    'Kinetic digital announcements engineered to stop the scroll.',
    'Animated 2D/3D event flyers combining kinetic typography, atmospheric lighting, and punchy audio risers designed to maximize ticket clicks and shares.',
    '["9:16 Reels / TikTok / Stories loop", "4:5 & 1:1 Feed variations", "Custom sound design & audio sync", "Editable lineup update versions"]'::jsonb,
    '3–6 business days',
    6
  ),
  (
    'promotional-videos',
    'Promotional Videos',
    'motion-film',
    'Launch trailers and hype films that turn curiosity into ticket sales.',
    'Concept-to-delivery promo films, teaser trailers, and countdown spots blending live footage, motion graphics, and original soundscapes for maximum campaign velocity.',
    '["30s–90s hero launch trailer", "Paid ad cutdowns (6s / 15s)", "Script, storyboard & pacing map", "Captioned social-first exports"]'::jsonb,
    '5–12 business days',
    7
  ),
  (
    'motion-graphics',
    'Motion Graphics',
    'motion-film',
    'Futuristic 2D/3D visual systems in constant motion.',
    'Bespoke lower thirds, title sequences, kinetic logo reveals, data visualizations, and looping LED screen animations built for modern stage and broadcast screens.',
    '["Animated title & intro packages", "3D emblem & logo stings", "Broadcast lower thirds & bumpers", "Seamless LED backdrop loops"]'::jsonb,
    '5–14 business days',
    8
  ),
  (
    'event-branding',
    'Event Branding',
    'brand-design',
    'Complete visual worlds that make every touchpoint unmistakable.',
    'End-to-end event identity systems—from custom wordmarks, typography, and color architecture to environmental wayfinding, stage graphics, and digital presence.',
    '["Event visual identity & logotype", "Comprehensive brand styleguide", "Environmental & stage graphics", "Digital campaign templates"]'::jsonb,
    '10–21 business days',
    9
  ),
  (
    'creative-direction',
    'Creative Direction',
    'brand-design',
    'Unified artistic leadership from first spark to final curtain.',
    'Strategic visual direction aligning stage design, lighting palettes, camera language, talent styling, and campaign rollout into one cohesive, world-class narrative.',
    '["Visual moodboards & treatment decks", "Art direction & lighting palette", "On-site creative supervision", "Multi-channel campaign alignment"]'::jsonb,
    'Custom project scope',
    10
  ),
  (
    'event-visual-production',
    'Event Visual Production',
    'capture-visuals',
    'Live LED visuals, stage screens, and synchronized show aesthetics.',
    'Timecoded visual packs, real-time stage graphics, opening show sequences, and widescreen LED canvas production engineered for arena and festival architecture.',
    '["Custom ultra-wide LED stage visuals", "Timecoded show-opener animations", "Artist & keynote screen packages", "Resolume / media-server ready renders"]'::jsonb,
    '10–21 business days',
    11
  )
on conflict (slug) do update set
  name = excluded.name,
  pillar = excluded.pillar,
  tagline = excluded.tagline,
  short_description = excluded.short_description,
  deliverables = excluded.deliverables,
  turnaround = excluded.turnaround,
  sort_order = excluded.sort_order,
  is_active = true;

-- =============================================================================
-- ORBIT Creative Agency — 0003 Dynamic Portfolio Categories & Media URLs
-- Enables adding new portfolio projects purely via Supabase (with Cloudinary
-- public_ids or full Cloudinary URLs) without touching frontend code.
-- =============================================================================

alter table public.portfolio_projects
  add column if not exists category text not null default 'event-experiences'
    check (category in (
      'videography',
      'photography',
      'graphic-design',
      'motion-graphics',
      'event-experiences'
    )),
  add column if not exists thumbnail_url text,
  add column if not exists media_url text,
  add column if not exists aspect_ratio text not null default 'landscape'
    check (aspect_ratio in ('landscape', 'portrait', 'square', 'wide'));

create index if not exists idx_portfolio_category_published
  on public.portfolio_projects (status, category, is_featured desc, event_date desc);

comment on column public.portfolio_projects.category is
  'Primary portfolio category: videography | photography | graphic-design | motion-graphics | event-experiences';
comment on column public.portfolio_projects.thumbnail_url is
  'Cloudinary public_id or full https://res.cloudinary.com/... image URL used for portfolio thumbnails';
comment on column public.portfolio_projects.media_url is
  'Cloudinary public_id or full https://res.cloudinary.com/... image/video URL rendered on the project page';
comment on column public.portfolio_projects.aspect_ratio is
  'Masonry card aspect hint: landscape (16:10), portrait (4:5), square (1:1), wide (16:9)';

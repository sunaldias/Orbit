-- =============================================================================
-- ORBIT Creative Agency — 0001 Initial Database Schema
-- Target: Supabase PostgreSQL 15+
-- =============================================================================

create extension if not exists "pgcrypto";

-- Reusable updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1. Services
-- -----------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  pillar text not null check (pillar in ('motion-film', 'capture-visuals', 'brand-design')),
  tagline text not null,
  short_description text not null,
  deliverables jsonb not null default '[]'::jsonb,
  turnaround text not null default '5–14 business days',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_services_active_order
  on public.services (is_active, sort_order);

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Portfolio Projects
-- -----------------------------------------------------------------------------
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client_name text not null,
  event_type text not null,
  location text,
  summary text not null,
  challenge text not null,
  solution text not null,
  cover_public_id text not null,
  showreel_public_id text,
  primary_media_type text not null default 'image' check (primary_media_type in ('image', 'video')),
  accent_tone text not null default 'lime' check (accent_tone in ('lime', 'green', 'teal')),
  event_date date,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  highlights jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_portfolio_published_featured
  on public.portfolio_projects (status, is_featured desc, published_at desc);

create trigger trg_portfolio_projects_updated_at
  before update on public.portfolio_projects
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Project Media Gallery (Cloudinary references)
-- -----------------------------------------------------------------------------
create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  cloudinary_public_id text not null,
  resource_type text not null default 'image' check (resource_type in ('image', 'video')),
  alt_text text not null,
  caption text,
  width integer not null default 1600 check (width > 0),
  height integer not null default 1000 check (height > 0),
  duration_sec integer check (duration_sec is null or duration_sec >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_media_project_order
  on public.project_media (project_id, sort_order);

-- -----------------------------------------------------------------------------
-- 4. Project <-> Service Join Table
-- -----------------------------------------------------------------------------
create table if not exists public.project_services (
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (project_id, service_id)
);

create index if not exists idx_project_services_service_id
  on public.project_services (service_id);

-- -----------------------------------------------------------------------------
-- 5. Booking / Project Inquiries (Strictly Server-Only Write/Read)
-- -----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  company_name text check (company_name is null or char_length(company_name) <= 140),
  selected_services text[] not null check (cardinality(selected_services) between 1 and 11),
  event_name text not null check (char_length(event_name) between 2 and 160),
  event_date date,
  event_location text check (event_location is null or char_length(event_location) <= 160),
  budget_range text not null,
  project_details text not null check (char_length(project_details) between 15 and 3000),
  source_page text check (source_page is null or char_length(source_page) <= 200),
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'booked', 'archived')),
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_error text,
  ip_hash text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_inquiries_status_created
  on public.inquiries (status, created_at desc);

create index if not exists idx_inquiries_email
  on public.inquiries (email);

create trigger trg_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

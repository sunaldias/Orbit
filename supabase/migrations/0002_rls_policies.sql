-- =============================================================================
-- ORBIT Creative Agency — 0002 Row Level Security (RLS) Policies
-- Principle: Default Deny on all tables. Public anon role gets read-only
-- access ONLY to active/published showcase content. Inquiries are strictly
-- isolated to server-side service_role operations.
-- =============================================================================

-- Enable RLS on every table
alter table public.services enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.project_media enable row level security;
alter table public.project_services enable row level security;
alter table public.inquiries enable row level security;

-- Force RLS even for table owners where appropriate (service_role bypasses RLS by design)
alter table public.inquiries force row level security;

-- Revoke broad write grants from public/anon/authenticated roles explicitly
revoke all on public.inquiries from anon, authenticated;
revoke insert, update, delete on public.services from anon, authenticated;
revoke insert, update, delete on public.portfolio_projects from anon, authenticated;
revoke insert, update, delete on public.project_media from anon, authenticated;
revoke insert, update, delete on public.project_services from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Public Read-Only Policies (Portfolio & Services)
-- -----------------------------------------------------------------------------
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
  on public.services
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read published portfolio projects" on public.portfolio_projects;
create policy "Public can read published portfolio projects"
  on public.portfolio_projects
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Public can read media of published projects" on public.project_media;
create policy "Public can read media of published projects"
  on public.project_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.portfolio_projects p
      where p.id = project_media.project_id
        and p.status = 'published'
    )
  );

drop policy if exists "Public can read service tags of published projects" on public.project_services;
create policy "Public can read service tags of published projects"
  on public.project_services
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.portfolio_projects p
      where p.id = project_services.project_id
        and p.status = 'published'
    )
  );

-- -----------------------------------------------------------------------------
-- Inquiries Table: ZERO policies for anon or authenticated.
-- All inserts & status updates MUST go through Next.js API Route using
-- SUPABASE_SERVICE_ROLE_KEY after Rate Limiting + Turnstile + Zod validation.
-- -----------------------------------------------------------------------------

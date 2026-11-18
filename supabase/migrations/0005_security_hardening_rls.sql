-- =============================================================================
-- ORBIT Creative Agency — 0005 Defense-in-Depth PostgreSQL & RLS Hardening
-- Explicitly strips default `public` role privileges on sensitive tables and
-- helper functions. Only server-side `service_role` may read/write inquiries.
-- =============================================================================

revoke all on public.inquiries from public, anon, authenticated;
revoke insert, update, delete, truncate on public.services from public, anon, authenticated;
revoke insert, update, delete, truncate on public.portfolio_projects from public, anon, authenticated;
revoke insert, update, delete, truncate on public.project_media from public, anon, authenticated;
revoke insert, update, delete, truncate on public.project_services from public, anon, authenticated;

-- Restrict trigger helper execution from public API roles
revoke execute on function public.set_updated_at() from public, anon, authenticated;

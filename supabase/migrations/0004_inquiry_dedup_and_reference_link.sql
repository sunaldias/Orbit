-- =============================================================================
-- ORBIT Creative Agency — 0004 Inquiry Reference Link & Duplicate Prevention
-- Adds reference_link, idempotency_key, submission_fingerprint, and
-- client_ack_status to public.inquiries (RLS remains strict default-deny).
-- =============================================================================

alter table public.inquiries
  add column if not exists reference_link text
    check (reference_link is null or char_length(reference_link) <= 500),
  add column if not exists idempotency_key text,
  add column if not exists submission_fingerprint text,
  add column if not exists client_ack_status text not null default 'pending'
    check (client_ack_status in ('pending', 'sent', 'failed'));

-- Enforce unique idempotency keys when supplied (prevents double-click / retry duplicates)
create unique index if not exists idx_inquiries_idempotency_key
  on public.inquiries (idempotency_key)
  where idempotency_key is not null;

-- Index fingerprint + created_at for fast duplicate-submission window checks
create index if not exists idx_inquiries_fingerprint_created
  on public.inquiries (submission_fingerprint, created_at desc)
  where submission_fingerprint is not null;

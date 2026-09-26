-- Admin login throttling: failed password attempts and magic-link sends.
-- Written and read only by server code (service role); RLS on with no policies.

create table if not exists public.admin_login_attempts (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('password_fail', 'link_sent')),
  -- Salted hash of the client IP; the raw IP is never stored.
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_kind_created_idx
  on public.admin_login_attempts (kind, created_at desc);

alter table public.admin_login_attempts enable row level security;

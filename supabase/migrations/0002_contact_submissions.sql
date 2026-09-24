-- Contact form submissions.
-- Written only by the server (service role) from the contact form's server action, after
-- validation, honeypot and rate-limit checks. RLS is enabled with no policies, so the public
-- anon key can neither read nor write this table. The owner reads it from the admin console (Phase 4).

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  company text check (char_length(company) <= 120),
  requirement_type text not null check (char_length(requirement_type) <= 120),
  message text not null check (char_length(message) between 1 and 5000),
  -- SHA-256 of the sender IP plus a server secret; used only for rate limiting.
  ip_hash text,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_ip_hash_created_at_idx
  on public.contact_submissions (ip_hash, created_at desc);

alter table public.contact_submissions enable row level security;

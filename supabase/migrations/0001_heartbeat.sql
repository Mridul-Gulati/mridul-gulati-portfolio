-- Keep-alive heartbeat.
-- Supabase pauses free-tier projects after a period of inactivity. A daily Vercel cron
-- (/api/keep-alive, scheduled in vercel.json) writes to this table so the project stays warm.
-- Do not delete this table or the cron without replacing them.

create table if not exists public.heartbeat (
  id smallint primary key default 1 check (id = 1),
  pinged_at timestamptz not null default now()
);

alter table public.heartbeat enable row level security;

-- Anyone may read the single timestamp row; /api/health uses this to prove the
-- public (anon key) connection works. Only the service role writes to it.
create policy "heartbeat is publicly readable"
  on public.heartbeat for select
  to anon, authenticated
  using (true);

insert into public.heartbeat (id) values (1) on conflict (id) do nothing;

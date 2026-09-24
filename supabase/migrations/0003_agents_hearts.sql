-- Agent catalogue and hearts.
-- Public (anon key) can read published agents only. Every write (hearts, view counts, agent
-- edits) goes through server code using the service role, so hearts has no public policies.

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  persona text not null,
  problem text not null,
  description text not null default '',
  tags text[] not null default '{}',
  thumbnail text,
  demo_type text not null default 'video' check (demo_type in ('video', 'live')),
  youtube_id text check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  published boolean not null default false,
  sort_order integer not null default 0,
  views integer not null default 0,
  -- Maintained by the trigger below; never written directly.
  hearts_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists agents_published_sort_idx on public.agents (published, sort_order);

alter table public.agents enable row level security;

create policy "published agents are publicly readable"
  on public.agents for select
  to anon, authenticated
  using (published);

-- One heart per visitor per agent, enforced by the primary key.
-- visitor_hash: salted SHA-256 of a random per-browser cookie id.
-- ip_hash: salted SHA-256 of the IP, used only to cap heart spam per network.
create table if not exists public.hearts (
  agent_id uuid not null references public.agents (id) on delete cascade,
  visitor_hash text not null,
  ip_hash text,
  created_at timestamptz not null default now(),
  primary key (agent_id, visitor_hash)
);

create index if not exists hearts_visitor_idx on public.hearts (visitor_hash);
create index if not exists hearts_ip_created_idx on public.hearts (ip_hash, created_at desc);

alter table public.hearts enable row level security;

-- Keep agents.hearts_count in sync.
create or replace function public.sync_agent_hearts_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update agents set hearts_count = hearts_count + 1 where id = new.agent_id;
  elsif tg_op = 'DELETE' then
    update agents set hearts_count = greatest(hearts_count - 1, 0) where id = old.agent_id;
  end if;
  return null;
end;
$$;

drop trigger if exists hearts_count_sync on public.hearts;
create trigger hearts_count_sync
  after insert or delete on public.hearts
  for each row execute function public.sync_agent_hearts_count();

-- Atomic view counter, called by the server (service role) when a demo is opened.
create or replace function public.increment_agent_views(p_slug text)
returns void
language sql
set search_path = public
as $$
  update agents set views = views + 1 where slug = p_slug and published;
$$;

revoke execute on function public.increment_agent_views(text) from public, anon, authenticated;
revoke execute on function public.sync_agent_hearts_count() from public, anon, authenticated;

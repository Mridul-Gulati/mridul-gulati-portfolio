-- Blog posts and the public media bucket.
-- Public (anon key) can read published posts whose publish date has passed. All writes go
-- through admin server actions (service role) after an owner check, so there are no write policies.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  body text not null default '',
  cover_image text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_idx on public.posts (status, published_at desc);

alter table public.posts enable row level security;

create policy "published posts are publicly readable"
  on public.posts for select
  to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- Atomic view counter, called by the server (service role) when a post is read.
create or replace function public.increment_post_views(p_slug text)
returns void
language sql
set search_path = public
as $$
  update posts set views = views + 1
  where slug = p_slug and status = 'published' and published_at <= now();
$$;

revoke execute on function public.increment_post_views(text) from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Public bucket for blog images, cover images and agent thumbnails.
-- Files are publicly readable by URL; uploads happen only via the service role (admin actions).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do nothing;

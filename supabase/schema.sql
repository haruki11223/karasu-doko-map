create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  lat         double precision not null check (lat between -90 and 90),
  lng         double precision not null check (lng between -180 and 180),
  place_name  text check (char_length(place_name) <= 100),
  crow_count  integer check (crow_count between 0 and 1000),
  observed_at timestamptz not null default now(),
  note        text check (char_length(note) <= 500),
  photo_url   text
);

-- 新しい順に並べて取得するための索引
create index posts_observed_at_idx on public.posts (observed_at desc);

-- RLS（行レベルセキュリティ）を有効にする
alter table public.posts enable row level security;

-- 誰でも投稿を読める
create policy "誰でも投稿を読める"
  on public.posts for select
  to anon, authenticated
  using (true);

-- 誰でも投稿できる（ログイン機能はMVPでは後回しのため）
create policy "誰でも投稿できる"
  on public.posts for insert
  to anon, authenticated
  with check (true);
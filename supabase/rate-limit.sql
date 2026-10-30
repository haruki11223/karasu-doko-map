-- 投稿の制限（荒らし対策）
-- 実行場所：SupabaseのSQL Editor

-- 直近の投稿数を数えるときに速くするための索引
create index if not exists posts_created_at_idx
  on public.posts (created_at desc);

-- これまでの「誰でも投稿できる」ポリシーを、制限つきのものに置き換える
drop policy if exists "誰でも投稿できる" on public.posts;

create policy "制限つきで誰でも投稿できる"
  on public.posts for insert
  to anon, authenticated
  with check (
    -- 1. サイト全体で、直近1分に20件まで
    (select count(*) from public.posts
       where created_at > now() - interval '1 minute') < 20
    -- 2. サイト全体で、直近1時間に200件まで
    and (select count(*) from public.posts
       where created_at > now() - interval '1 hour') < 200
    -- 3. 写真のURLは、このSupabaseの post-photos バケットのものだけ（なしもOK）
    and (
      photo_url is null
      or photo_url like 'https://%.supabase.co/storage/v1/object/public/post-photos/%'
    )
    -- 4. 見かけた時刻は、未来の日時にできない（時計のずれを考えて5分は許す）
    and observed_at <= now() + interval '5 minutes'
  );
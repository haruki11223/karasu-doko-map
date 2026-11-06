-- 管理者用の投稿削除RPC
-- Supabase SQL Editorで実行する。管理者PINは別途、ハッシュ化して登録する。

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_delete_pin (
  singleton boolean primary key default true check (singleton),
  pin_hash text not null
);

alter table public.admin_delete_pin enable row level security;
revoke all on table public.admin_delete_pin from public, anon, authenticated;

create table if not exists public.admin_delete_photo_paths (
  object_path text primary key,
  expires_at timestamptz not null
);

alter table public.admin_delete_photo_paths enable row level security;
revoke all on table public.admin_delete_photo_paths from public, anon, authenticated;

create table if not exists public.admin_delete_pin_attempts (
  ip_hash text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists admin_delete_pin_attempts_lookup_idx
  on public.admin_delete_pin_attempts (ip_hash, attempted_at desc);

alter table public.admin_delete_pin_attempts enable row level security;
revoke all on table public.admin_delete_pin_attempts from public, anon, authenticated;

create or replace function public.verify_admin_delete_pin(p_pin text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request_headers jsonb;
  v_client_ip text;
  v_ip_hash text;
  v_attempt_count integer;
  v_pin_is_valid boolean;
begin
  v_request_headers := coalesce(
    nullif(current_setting('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );
  v_client_ip := coalesce(
    nullif(v_request_headers ->> 'cf-connecting-ip', ''),
    split_part(nullif(v_request_headers ->> 'x-forwarded-for', ''), ',', 1),
    'unknown'
  );
  v_ip_hash := encode(
    extensions.digest(v_client_ip, 'sha256'),
    'hex'
  );

  delete from public.admin_delete_pin_attempts
  where attempted_at < now() - interval '1 day';

  select count(*) into v_attempt_count
  from public.admin_delete_pin_attempts as attempt
  where attempt.ip_hash = v_ip_hash
    and attempt.attempted_at > now() - interval '15 minutes';

  if v_attempt_count >= 5 then
    return false;
  end if;

  select coalesce(
    (
      select extensions.crypt(p_pin, settings.pin_hash) = settings.pin_hash
      from public.admin_delete_pin as settings
      where settings.singleton = true
    ),
    false
  ) into v_pin_is_valid;

  if not v_pin_is_valid then
    insert into public.admin_delete_pin_attempts (ip_hash) values (v_ip_hash);
  end if;

  return v_pin_is_valid;
end;
$$;

create or replace function public.can_delete_admin_photo(p_object_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_delete_photo_paths as authorized_path
    where authorized_path.object_path = p_object_path
      and authorized_path.expires_at > now()
  );
$$;

create or replace function public.authorize_admin_photo_delete(p_post_id uuid, p_pin text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_photo_url text;
  v_object_path text;
begin
  if not public.verify_admin_delete_pin(p_pin) then
    raise exception '管理者パスワードが違います';
  end if;

  select post.photo_url into v_photo_url
  from public.posts as post
  where post.id = p_post_id;

  if not found then
    raise exception '投稿が見つかりません';
  end if;

  if v_photo_url is null then
    return null;
  end if;

  v_object_path := split_part(v_photo_url, '/storage/v1/object/public/post-photos/', 2);
  if v_object_path = '' or v_object_path = v_photo_url then
    raise exception '写真URLを確認できません';
  end if;

  delete from public.admin_delete_photo_paths where expires_at <= now();
  insert into public.admin_delete_photo_paths (object_path, expires_at)
  values (v_object_path, now() + interval '1 minute')
  on conflict (object_path) do update set expires_at = excluded.expires_at;

  return v_object_path;
end;
$$;

create or replace function public.admin_delete_post(p_post_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_photo_url text;
  v_object_path text;
begin
  if not public.verify_admin_delete_pin(p_pin) then
    raise exception '管理者パスワードが違います';
  end if;

  select post.photo_url into v_photo_url
  from public.posts as post
  where post.id = p_post_id;

  if not found then
    raise exception '投稿が見つかりません';
  end if;

  if v_photo_url is not null then
    v_object_path := split_part(v_photo_url, '/storage/v1/object/public/post-photos/', 2);
    if exists (
      select 1 from storage.objects as photo
      where photo.bucket_id = 'post-photos'
        and photo.name = v_object_path
    ) then
      raise exception '写真を先に削除してください';
    end if;
  end if;

  delete from public.posts where id = p_post_id;

  if v_photo_url is not null then
    delete from public.admin_delete_photo_paths as authorized_path
    where authorized_path.object_path = v_object_path;
  end if;

  return true;
end;
$$;

revoke all on function public.verify_admin_delete_pin(text) from public, anon, authenticated;
revoke all on function public.can_delete_admin_photo(text) from public, anon, authenticated;
revoke all on function public.authorize_admin_photo_delete(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_delete_post(uuid, text) from public, anon, authenticated;
grant execute on function public.verify_admin_delete_pin(text) to anon, authenticated;
grant execute on function public.can_delete_admin_photo(text) to anon, authenticated;
grant execute on function public.authorize_admin_photo_delete(uuid, text) to anon, authenticated;
grant execute on function public.admin_delete_post(uuid, text) to anon, authenticated;

drop policy if exists "管理者が承認した写真を削除できる" on storage.objects;
create policy "管理者が承認した写真を削除できる"
  on storage.objects for delete
  to anon, authenticated
  using (
    bucket_id = 'post-photos'
    and public.can_delete_admin_photo(name)
  );

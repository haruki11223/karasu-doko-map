-- 写真用ストレージの設定（Supabase の SQL Editor で実行する）

-- バケット（Storage 画面で作成済み）
--   名前：post-photos
--   公開バケット：オン
--   ファイルサイズの上限：500 KB
--   許可する形式：image/jpeg, image/webp

-- 誰でも写真をアップロードできる（上書き・削除は許可しない）
create policy "誰でも写真をアップロードできる"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'post-photos');
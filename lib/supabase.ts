import { createClient } from "@supabase/supabase-js";

// .env.local に書いた値を読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 値が入っていないときは、原因が分かるエラーを出す
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    ".env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください"
  );
}

// アプリ全体で使うSupabaseへの接続
export const supabase = createClient(supabaseUrl, supabaseKey);
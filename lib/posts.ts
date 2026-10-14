import { supabase } from "@/lib/supabase";

// データベースから取得した投稿1件の形
export type Post = {
  id: string;
  created_at: string;
  lat: number;
  lng: number;
  place_name: string | null;
  crow_count: number | null;
  observed_at: string;
  note: string | null;
  photo_url: string | null;
};

// 新しく投稿するときに渡すデータの形（? が付いている項目は省略できる）
export type NewPost = {
  lat: number;
  lng: number;
  place_name?: string;
  crow_count?: number;
  observed_at?: string; // 省略すると投稿した時刻になる
  note?: string;
  photo_url?: string; // Bさんの uploadPhoto() が返すURL
};

// 投稿の一覧を、見かけた時刻が新しい順に取得する（地図にピンを立てる用）
export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("observed_at", { ascending: false })
    .limit(200); // 転送量を抑えるため、最大200件まで

  if (error) {
    throw new Error(`投稿の取得に失敗しました: ${error.message}`);
  }
  return data ?? [];
}

// 投稿を1件保存して、保存されたデータを返す
export async function createPost(post: NewPost): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single();

  if (error) {
    throw new Error(`投稿の保存に失敗しました: ${error.message}`);
  }
  return data;
}
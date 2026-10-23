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

// 地図の表示範囲（南西〜北東の緯度・経度）
export type Bounds = {
  south: number; // 南端の緯度
  west: number; // 西端の経度
  north: number; // 北端の緯度
  east: number; // 東端の経度
};

// 表示範囲内の投稿だけを、見かけた時刻が新しい順に取得する（地図を動かしたときの再取得用）
export async function getPostsInBounds(bounds: Bounds): Promise<Post[]> {
  const { south, west, north, east } = bounds;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .gte("lat", south)
    .lte("lat", north)
    .gte("lng", west)
    .lte("lng", east)
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
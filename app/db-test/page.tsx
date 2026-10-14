// 動作確認用のページ（確認が終わったら削除する）
import { Suspense } from "react";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { getPosts, createPost } from "@/lib/posts";

// 「テスト投稿する」ボタンを押したときに動く処理
async function addTestPost() {
  "use server";
  await createPost({
    lat: 36.5613,
    lng: 136.6562,
    place_name: "テスト投稿",
    crow_count: 1,
    note: "createPost の動作確認",
  });
  revalidatePath("/db-test");
}

// データベースから投稿を取得して一覧を表示する部分
async function PostList() {
  await connection(); // アクセスのたびに最新のデータを取得する
  const posts = await getPosts();

  return (
    <>
      <p>取得した投稿：{posts.length}件</p>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.place_name ?? "（場所名なし）"}／{post.crow_count ?? "?"}羽／
            {new Date(post.observed_at).toLocaleString("ja-JP")}／{post.note}
          </li>
        ))}
      </ul>
    </>
  );
}

export default function DbTestPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>DB接続テスト</h1>

      <form action={addTestPost}>
        <button type="submit">テスト投稿する</button>
      </form>

      <Suspense fallback={<p>読み込み中...</p>}>
        <PostList />
      </Suspense>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { type Post } from "@/lib/posts";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPostDetail() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error("詳細情報の取得に失敗しました", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPostDetail();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>読み込み中...</div>;
  }

  if (!post) {
    return <div style={{ padding: "40px", textAlign: "center" }}>情報が見つかりませんでした。</div>;
  }

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "20px" }}>
        <Link href="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          ← マップに戻る
        </Link>
      </header>

      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px" }}>
          {post.place_name || "カラス目撃情報"}
        </h1>

        {post.photo_url && (
          <div style={{ marginBottom: "20px", borderRadius: "8px", overflow: "hidden", maxHeight: "300px", background: "#f3f4f6" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.photo_url} alt="目撃写真" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
          </div>
        )}

        <div style={{ display: "grid", gap: "10px", fontSize: "15px", color: "#4b5563" }}>
          <p><strong>見かけた羽数:</strong> {post.crow_count ?? "不明"} 羽</p>
          <p><strong>見かけた日時:</strong> {post.observed_at ? new Date(post.observed_at).toLocaleString("ja-JP") : "不明"}</p>
          {post.note && (
            <div style={{ marginTop: "10px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
              <strong style={{ display: "block", marginBottom: "4px", color: "#111" }}>メモ:</strong>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{post.note}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
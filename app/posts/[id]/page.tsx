
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/posts";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 投稿詳細を取得
  useEffect(() => {
    let cancelled = false;

    async function fetchPostDetail() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (!cancelled) {
          setPost(data as Post);
        }
      } catch (error) {
        console.error("詳細情報の取得に失敗しました", error);

        if (!cancelled) {
          setErrorMessage(
            "投稿情報を取得できませんでした。"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchPostDetail();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 読み込み中
  if (loading) {
    return (
      <main style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7f4",
      }}>
        読み込み中...
      </main>
    );
  }

  // 投稿が見つからない場合
  if (!post) {
    return (
      <main style={{
        padding: "40px 20px",
        textAlign: "center",
        background: "#f5f7f4",
        minHeight: "100vh",
      }}>
        <p>
          {errorMessage || "投稿情報が見つかりませんでした。"}
        </p>

        <Link href="/" style={{
          color: "#315b45",
          fontWeight: "bold",
          textDecoration: "none",
        }}>
          ← マップに戻る
        </Link>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f7f4",
      padding: "30px 20px",
      fontFamily: '"DM Sans", "Noto Sans JP", sans-serif',
    }}>
      <div style={{
        maxWidth: "640px",
        margin: "0 auto",
      }}>

        {/* ヘッダー */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}>
          <Link href="/" style={{
            color: "#315b45",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "bold",
          }}>
            ← マップに戻る
          </Link>

          <span style={{
            fontSize: "12px",
            color: "#738078",
          }}>
            SIGHTING REPORT
          </span>
        </header>

        {/* 投稿詳細 */}
        <section style={{
          padding: "28px",
          background: "#fff",
          border: "1px solid #e5eae5",
          borderRadius: "16px",
          boxShadow: "0 8px 28px rgb(32 54 40 / 5%)",
        }}>

          {/* 場所 */}
          <h1 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1e2b25",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e5eae5",
          }}>
            {post.place_name || "カラス目撃情報"}
          </h1>

          {/* 写真 */}
          {post.photo_url && (
            <div style={{
              marginBottom: "24px",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#f3f4f6",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.photo_url}
                alt="カラスの目撃写真"
                style={{
                  display: "block",
                  width: "100%",
                  maxHeight: "350px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          {/* 羽数 */}
          <div style={{
            padding: "16px 0",
            borderBottom: "1px solid #edf0ed",
            color: "#4b5563",
            fontSize: "15px",
          }}>
            <strong style={{ color: "#1e2b25" }}>
              見かけた羽数
            </strong>

            <p style={{ marginTop: "8px" }}>
              {post.crow_count ?? "不明"} 羽
            </p>
          </div>

          {/* 日時 */}
          <div style={{
            padding: "16px 0",
            borderBottom: "1px solid #edf0ed",
            color: "#4b5563",
            fontSize: "15px",
          }}>
            <strong style={{ color: "#1e2b25" }}>
              見かけた日時
            </strong>

            <p style={{ marginTop: "8px" }}>
              {post.observed_at
                ? new Date(post.observed_at).toLocaleString("ja-JP")
                : "不明"}
            </p>
          </div>

          {/* メモ */}
          <div style={{
            padding: "16px 0",
            color: "#4b5563",
            fontSize: "15px",
          }}>
            <strong style={{ color: "#1e2b25" }}>
              メモ
            </strong>

            <div style={{
              marginTop: "10px",
              padding: "16px",
              borderRadius: "9px",
              background: "#f5f7f4",
              minHeight: "60px",
              whiteSpace: "pre-wrap",
              lineHeight: "1.8",
            }}>
              {post.note || "メモはありません。"}
            </div>
          </div>
        </section>

        {/* マップに戻るボタン */}
        <div style={{
          marginTop: "24px",
          textAlign: "center",
        }}>
          <Link href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 28px",
            borderRadius: "9px",
            background: "#315b45",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "bold",
            textDecoration: "none",
          }}>
            マップに戻る
          </Link>
        </div>

      </div>
    </main>
  );
}


"use client";

import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { getPosts, type Post } from "@/lib/posts";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 投稿日時を表示する関数
function formatObservedAt(dateString: string | null): string {
  if (!dateString) return "不明";

  const targetDate = new Date(dateString);

  if (isNaN(targetDate.getTime())) return "不明";

  const now = new Date();

  // 日付部分のみを比較
  const targetDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const diffTime = today.getTime() - targetDay.getTime();

  const diffDays = Math.round(
    diffTime / (1000 * 60 * 60 * 24)
  );

  // 日付の表示
  let dayLabel = "";

  if (diffDays === 0) {
    dayLabel = "今日";
  } else if (diffDays === 1) {
    dayLabel = "昨日";
  } else if (diffDays > 1) {
    dayLabel = `${diffDays}日前`;
  } else {
    dayLabel = `${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
  }

  // 時間帯の判定
  const hour = targetDate.getHours();

  let timeLabel = "";

  if (hour >= 4 && hour < 10) {
    timeLabel = "朝";
  } else if (hour >= 10 && hour < 16) {
    timeLabel = "昼";
  } else if (hour >= 16 && hour < 19) {
    timeLabel = "夕方";
  } else {
    timeLabel = "夜";
  }

  return `${dayLabel} (${timeLabel})`;
}

// マップ画面
export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const router = useRouter();

  // 投稿情報を取得
  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const data = await getPosts();

        if (!cancelled) {
          setPosts(data);
        }
      } catch (error) {
        console.error("投稿の取得に失敗しました", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Google Maps APIキー
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // 金沢市の初期表示位置
  const defaultCenter = {
    lat: 36.5613,
    lng: 136.6562,
  };

  return (
    <main
      className="app-shell"
      style={{
        height: "100vh",
        minHeight: "500px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ヘッダー */}
      <header
        className="topbar"
        style={{
          flex: "0 0 68px",
        }}
      >
        <Link
          className="brand"
          href="/"
          aria-label="カラスどこマップ ホーム"
        >
          <span className="brand-mark" aria-hidden="true">
            烏
          </span>

          <span>カラスどこマップ</span>
        </Link>

        <span className="topbar-note">
          金沢のカラス情報を共有
        </span>
      </header>

      {/* マップ表示エリア */}
      <section
        aria-label="金沢市カラス目撃マップ"
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          padding: "12px 16px 8px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: 0,
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #e5eae5",
            boxShadow: "0 8px 28px rgb(32 54 40 / 5%)",
            position: "relative",
          }}
        >
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={13}
              style={{
                width: "100%",
                height: "100%",
              }}

              // Googleマップの標準操作ボタンを非表示
              disableDefaultUI={true}

              // 地図のドラッグ・拡大縮小操作は維持
              gestureHandling="greedy"

              // 地図をクリックしたら情報ウィンドウを閉じる
              onClick={() => setSelectedPost(null)}
            >
              {/* 投稿されたカラス情報のピン */}
              {posts.map((post) => (
                <Marker
                  key={post.id}
                  position={{
                    lat: post.lat,
                    lng: post.lng,
                  }}
                  title={post.place_name || "カラス目撃情報"}
                  clickable={true}
                  onClick={(event) => {
                    if (event.domEvent) {
                      event.domEvent.stopPropagation();
                    }

                    setSelectedPost(post);
                  }}
                />
              ))}

              {/* ピンを押したときの詳細情報 */}
              {selectedPost && (
                <InfoWindow
                  position={{
                    lat: selectedPost.lat,
                    lng: selectedPost.lng,
                  }}
                  onCloseClick={() => setSelectedPost(null)}
                  pixelOffset={[0, -35]}
                >
                  <div
                    style={{
                      padding: "6px",
                      maxWidth: "220px",
                      fontSize: "13px",
                      color: "#333",
                    }}
                  >
                    {/* 投稿写真 */}
                    {selectedPost.photo_url && (
                      <div
                        style={{
                          marginBottom: "8px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          maxHeight: "120px",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedPost.photo_url}
                          alt="目撃された写真"
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}

                    {/* 場所 */}
                    <h3
                      style={{
                        fontWeight: "bold",
                        marginBottom: "4px",
                        fontSize: "14px",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: "3px",
                      }}
                    >
                      {selectedPost.place_name || "カラス目撃情報"}
                    </h3>

                    {/* 羽数 */}
                    <p style={{ margin: "2px 0" }}>
                      <strong>羽数:</strong>{" "}
                      {selectedPost.crow_count ?? "不明"} 羽
                    </p>

                    {/* 目撃日時 */}
                    <p style={{ margin: "2px 0" }}>
                      <strong>日時:</strong>{" "}
                      {formatObservedAt(selectedPost.observed_at)}
                    </p>

                    {/* 個別投稿詳細ページへの移動 */}
                    <div
                      style={{
                        marginTop: "8px",
                        textAlign: "right",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/posts/${selectedPost.id}`);
                        }}
                        style={{
                          backgroundColor: "#315b45",
                          color: "#fff",
                          border: "none",
                          padding: "5px 11px",
                          borderRadius: "5px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        詳細を見る →
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* 読み込み中の表示 */}
          {loading && (
            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow text-sm text-gray-600 z-10">
              地図上のピンを読み込み中...
            </div>
          )}

          {/* 投稿がない場合 */}
          {!loading && posts.length === 0 && (
            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow text-sm text-gray-600 z-10">
              まだカラスの目撃情報はありません。
            </div>
          )}
        </div>
      </section>

      {/* 画面下部の投稿ボタン */}
      <div
        style={{
          flex: "0 0 auto",
          padding: "10px 16px 18px",
          background: "#f5f7f4",
        }}
      >
        <Link
          href="/post"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "640px",
            minHeight: "50px",
            margin: "0 auto",
            borderRadius: "10px",
            background: "#315b45",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgb(32 54 40 / 12%)",
          }}
        >
          ＋ 目撃情報を投稿
        </Link>
      </div>
    </main>
  );
}

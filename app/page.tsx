

"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
} from "@vis.gl/react-google-maps";

import { getPosts, type Post } from "@/lib/posts";
import {
  unlockAdminDelete,
  verifyAdminDeletePin,
} from "@/lib/admin-delete";

import Link from "next/link";
import { useRouter } from "next/navigation";

// ========================================
// 投稿日時を表示する関数
// ========================================
function formatObservedAt(dateString: string | null): string {
  if (!dateString) return "不明";

  const targetDate = new Date(dateString);

  if (Number.isNaN(targetDate.getTime())) {
    return "不明";
  }

  const now = new Date();

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

  const diffDays = Math.round(
    (today.getTime() - targetDay.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  let dayLabel: string;

  if (diffDays === 0) {
    dayLabel = "今日";
  } else if (diffDays === 1) {
    dayLabel = "昨日";
  } else if (diffDays > 1) {
    dayLabel = `${diffDays}日前`;
  } else {
    dayLabel = `${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
  }

  const hour = targetDate.getHours();

  let timeLabel: string;

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

// ========================================
// マップ表示コンポーネント
// ========================================
function CrowMapSection({
  posts,
  loading,
}: {
  posts: Post[];
  loading: boolean;
}) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const router = useRouter();

  // Google Maps APIキー
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // 金沢市の初期表示位置
  const defaultCenter = {
    lat: 36.5613,
    lng: 136.6562,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "450px",
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
          gestureHandling="greedy"
          disableDefaultUI={true}
          style={{
            width: "100%",
            height: "100%",
          }}
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

          {/* ピンを選択したときの詳細情報 */}
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

                {/* 投稿詳細ページへの移動 */}
                <div
                  style={{
                    marginTop: "8px",
                    textAlign: "right",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/posts/${selectedPost.id}`)
                    }
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

      {/* 投稿情報の読み込み中 */}
      {loading && (
        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow text-sm text-gray-600 z-10">
          地図上のピンを読み込み中...
        </div>
      )}

      {/* 投稿情報がない場合 */}
      {!loading && posts.length === 0 && (
        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow text-sm text-gray-600 z-10">
          まだカラスの目撃情報はありません。
        </div>
      )}
    </div>
  );
}

// ========================================
// ホーム画面
// ========================================
export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const adminTapCount = useRef(0);
  const adminTapTimer = useRef<number | null>(null);

  // ========================================
  // 管理者モードの起動
  // ========================================
  async function handleAdminTriggerClick() {
    adminTapCount.current += 1;

    if (adminTapTimer.current !== null) {
      window.clearTimeout(adminTapTimer.current);
    }

    if (adminTapCount.current < 3) {
      adminTapTimer.current = window.setTimeout(() => {
        adminTapCount.current = 0;
        adminTapTimer.current = null;
      }, 1500);

      return;
    }

    adminTapCount.current = 0;
    adminTapTimer.current = null;

    const pin = window.prompt(
      "管理者パスワード（4桁）を入力してください"
    );

    if (pin === null) return;

    if (!/^\d{4}$/.test(pin)) {
      window.alert(
        "パスワードは4桁の数字で入力してください。"
      );
      return;
    }

    try {
      if (!(await verifyAdminDeletePin(pin))) {
        window.alert("パスワードが違います。");
        return;
      }

      unlockAdminDelete(pin);

      window.alert(
        "管理者モードを有効にしました。投稿の詳細画面に削除ボタンが表示されます。"
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "管理者設定を確認できませんでした。"
      );
    }
  }

  // ========================================
  // 投稿情報の取得・自動更新
  // ========================================
  useEffect(() => {
    let isActive = true;
    let isLoadingPosts = false;

    async function loadPosts() {
      if (isLoadingPosts) return;

      isLoadingPosts = true;

      try {
        const data = await getPosts();

        if (isActive) {
          setPosts(data);
        }
      } catch (error) {
        console.error(
          "投稿の取得に失敗しました",
          error
        );
      } finally {
        isLoadingPosts = false;

        if (isActive) {
          setPostsLoading(false);
        }
      }
    }

    // 初回読み込み
    void loadPosts();

    // ページが表示されたときに再取得
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void loadPosts();
      }
    }

    // 60秒ごとに更新
    const refreshInterval = window.setInterval(
      refreshWhenVisible,
      60_000
    );

    // タブが再び表示されたときにも更新
    document.addEventListener(
      "visibilitychange",
      refreshWhenVisible
    );

    return () => {
      isActive = false;

      window.clearInterval(refreshInterval);

      document.removeEventListener(
        "visibilitychange",
        refreshWhenVisible
      );

      if (adminTapTimer.current !== null) {
        window.clearTimeout(adminTapTimer.current);
      }
    };
  }, []);

  // ========================================
  // 画面表示
  // ========================================
  return (
    <main className="app-shell">
      {/* ヘッダー */}
      <header className="topbar">
        <Link
          className="brand"
          href="/"
          aria-label="カラスどこマップ ホーム"
          onClick={handleAdminTriggerClick}
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

      <div className="page-content" id="top">
        {/* 説明部分 */}
        <section
          className="intro"
          aria-labelledby="page-title"
        >
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            SIGHTING REPORT
          </p>

          <h1 id="page-title">
            カラスを見かけましたか
          </h1>

          <p className="intro-copy">
            目撃情報を共有して、地域のカラス被害を減らすために役立てましょう。
          </p>
        </section>

        {/* マップ表示エリア */}
        <section
          aria-labelledby="map-title"
          className="mb-8"
        >
          <h2
            id="map-title"
            className="sr-only"
          >
            金沢市カラス目撃マップ
          </h2>

          <Suspense
            fallback={
              <div
                style={{
                  width: "100%",
                  height: "450px",
                }}
                className="flex items-center justify-center bg-gray-100 rounded-xl"
              >
                地図を読み込み中...
              </div>
            }
          >
            <CrowMapSection
              posts={posts}
              loading={postsLoading}
            />
          </Suspense>
        </section>
      </div>

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

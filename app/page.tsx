
"use client";

import {
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";

import type { CSSProperties } from "react";

import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";

import { getPosts, type Post } from "@/lib/posts";

import {
  unlockAdminDelete,
  verifyAdminDeletePin,
} from "@/lib/admin-delete";

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
// 地図操作ボタン
// ========================================
function MapControls() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  // 拡大
  function handleZoomIn() {
    if (!map) return;

    map.setZoom((map.getZoom() ?? 13) + 1);
  }

  // 縮小
  function handleZoomOut() {
    if (!map) return;

    map.setZoom((map.getZoom() ?? 13) - 1);
  }

  // 現在地
  function handleCurrentLocation() {
    if (!map) return;

    if (!navigator.geolocation) {
      window.alert("このブラウザでは現在地を取得できません。");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        map.setZoom(16);
        setIsLocating(false);
      },
      (error) => {
        console.error("現在地の取得に失敗しました", error);

        setIsLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          window.alert("位置情報の使用が許可されていません。");
        } else {
          window.alert("現在地を取得できませんでした。");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  const buttonStyle: CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    background: "#ffffff",
    color: "#333333",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    cursor: "pointer",
    padding: 0,
  };

  return (
    <div
      style={{
        position: "absolute",
        right: "16px",
        top: "42%",
        transform: "translateY(-50%)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <button
        type="button"
        aria-label="地図を拡大"
        onClick={handleZoomIn}
        style={buttonStyle}
      >
        +
      </button>

      <button
        type="button"
        aria-label="地図を縮小"
        onClick={handleZoomOut}
        style={buttonStyle}
      >
        −
      </button>

      <button
        type="button"
        aria-label="現在地を表示"
        onClick={handleCurrentLocation}
        disabled={isLocating}
        style={{
          ...buttonStyle,
          color: "#1677e8",
          fontSize: "23px",
          opacity: isLocating ? 0.6 : 1,
        }}
      >
        {isLocating ? "…" : "➤"}
      </button>
    </div>
  );
}

// ========================================
// 投稿一覧・選択した投稿の詳細
// ========================================
function PostBottomSheet({
  posts,
  selectedPost,
  onSelectPost,
  onClose,
}: {
  posts: Post[];
  selectedPost: Post;
  onSelectPost: (post: Post) => void;
  onClose: () => void;
}) {
  const map = useMap();

  // 選択中の投稿を先頭にする
  const sortedPosts = [
    ...posts.filter((post) => post.id === selectedPost.id),
    ...posts.filter((post) => post.id !== selectedPost.id),
  ];

  // 一覧から投稿を選択
  function handleSelect(post: Post) {
    onSelectPost(post);

    map?.panTo({
      lat: post.lat,
      lng: post.lng,
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        height: "min(65dvh, 600px)",
        minHeight: "300px",
        background: "#ffffff",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 上部のつまみ */}
      <div
        style={{
          padding: "10px 0 6px",
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "42px",
            height: "5px",
            borderRadius: "10px",
            background: "#d5d5d5",
          }}
        />
      </div>

      {/* 一覧のタイトル */}
      <div
        style={{
          padding: "8px 18px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eeeeee",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#333333",
            }}
          >
            カラス目撃情報
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "12px",
              color: "#888888",
            }}
          >
            {posts.length}件の投稿
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="一覧を閉じる"
          style={{
            width: "36px",
            height: "36px",
            border: "none",
            borderRadius: "50%",
            background: "#f1f1f1",
            color: "#555555",
            fontSize: "23px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {/* 投稿一覧 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
        {sortedPosts.map((post) => {
          const isSelected = post.id === selectedPost.id;

          return (
            <div
              key={post.id}
              onClick={() => handleSelect(post)}
              style={{
                padding: "15px 16px",
                borderBottom: "1px solid #dddddd",
                background: isSelected ? "#edf4ff" : "#ffffff",
                cursor: "pointer",
              }}
            >
              {/* 場所・日時・羽数 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#333333",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.place_name || "場所不明"}
                  </div>

                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "13px",
                      color: "#66809a",
                    }}
                  >
                    {formatObservedAt(post.observed_at)}
                    {"　"}
                    {post.crow_count ?? "不明"}羽
                  </div>
                </div>

                {isSelected && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#315b45",
                      fontWeight: 700,
                    }}
                  >
                    選択中
                  </span>
                )}
              </div>

              {/* 選択した投稿だけ詳細を表示 */}
              {isSelected && (
                <div
                  style={{
                    marginTop: "13px",
                    paddingTop: "12px",
                    borderTop: "1px solid #d9e3ef",
                  }}
                >
                  {/* 写真が登録されている場合だけ表示 */}
                  {post.photo_url && (
                    <div
                      style={{
                        width: "100%",
                        marginBottom: "12px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#f0f0f0",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.photo_url}
                        alt="カラスの目撃写真"
                        style={{
                          display: "block",
                          width: "100%",
                          maxHeight: "240px",
                          aspectRatio: "16 / 9",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#444444",
                      marginBottom: "10px",
                    }}
                  >
                    目撃日時：
                    {formatObservedAt(post.observed_at)}
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#444444",
                      marginBottom: "12px",
                    }}
                  >
                    羽数：
                    {post.crow_count ?? "不明"} 羽
                  </div>

                  {/* 詳細ページへ移動 */}
                  <a
                    href={`/posts/${post.id}`}
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      minHeight: "42px",
                      borderRadius: "8px",
                      background: "#315b45",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    詳細を見る →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// マップ表示コンポーネント
// ========================================
function CrowMapSection({
  posts,
}: {
  posts: Post[];
}) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        border: "none",
        borderRadius: 0,
        overflow: "hidden",
      }}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={true}
          clickableIcons={false}
          style={{
            width: "100%",
            height: "100%",
          }}
          onClick={() => setSelectedPost(null)}
        >
          {/* カラスの目撃情報のピン */}
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
                event.domEvent?.stopPropagation();
                setSelectedPost(post);
              }}
            />
          ))}
        </Map>

        {/* 地図操作ボタン */}
        <MapControls />

        {/* ピン選択時の投稿一覧 */}
        {selectedPost && (
          <PostBottomSheet
            posts={posts}
            selectedPost={selectedPost}
            onSelectPost={setSelectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </APIProvider>
    </div>
  );
}

// ========================================
// ホーム画面
// ========================================
export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  const adminTapCount = useRef(0);
  const adminTapTimer = useRef<number | null>(null);

  // ========================================
  // 管理者モード
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
      window.alert("パスワードは4桁の数字で入力してください。");
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
  // 投稿情報の取得・60秒ごとの更新
  // ========================================
  useEffect(() => {
    let isActive = true;
    let isLoadingPosts = false;

    async function loadPosts() {
      if (!isActive || isLoadingPosts) return;

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
        adminTapTimer.current = null;
      }
    };
  }, []);

  // ========================================
  // 画面表示
  // ========================================
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",
        height: "100dvh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "#ffffff",
        border: "none",
        borderRadius: 0,
        boxShadow: "none",
        isolation: "isolate",
      }}
    >
      {/* 全画面マップ */}
      <Suspense
        fallback={
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
            }}
          >
            地図を読み込み中...
          </div>
        }
      >
        <CrowMapSection posts={posts} />
      </Suspense>

      {/* 投稿画面へ移動するボタン */}
      <a
        href="/post"
        aria-label="目撃情報を投稿する"
        style={{
          position: "absolute",
          left: "16px",
          right: "16px",
          bottom: "max(20px, env(safe-area-inset-bottom))",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "58px",
          border: "none",
          borderRadius: "12px",
          background: "#315b45",
          color: "#ffffff",
          fontSize: "16px",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        ＋ 目撃情報を投稿
      </a>

      {/* 管理者モード起動用の透明なクリック領域 */}
      <button
        type="button"
        aria-label="管理者モード"
        onClick={handleAdminTriggerClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "44px",
          height: "44px",
          opacity: 0,
          border: "none",
          padding: 0,
          zIndex: 40,
          cursor: "default",
        }}
      />
    </main>
  );
}

"use client";

import { ChangeEvent, FormEvent, useEffect, useState, Suspense } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { getPosts, type Post } from "@/lib/posts";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MAX_PHOTO_SIZE = 300 * 1024;

// 日時を「今日」「昨日」「○日前」および「朝・昼・夕方・夜」に変換する関数
function formatObservedAt(dateString: string | null): string {
  if (!dateString) return "不明";

  const targetDate = new Date(dateString);
  if (isNaN(targetDate.getTime())) return "不明";

  const now = new Date();

  // 日付部分のみを比較するための計算（時刻を0:00:00に揃える）
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = today.getTime() - targetDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

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

function compressPhoto(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("写真を読み込めませんでした。別の画像をお試しください。"));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.82;

      const exportJpeg = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("写真を圧縮できませんでした。"));
              return;
            }
            if (blob.size > MAX_PHOTO_SIZE && quality > 0.4) {
              quality -= 0.1;
              exportJpeg();
              return;
            }
            if (blob.size > MAX_PHOTO_SIZE) {
              reject(new Error("写真が大きすぎます。小さい画像をお選びください。"));
              return;
            }
            resolve(new File([blob], "crow-sighting.jpg", { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality,
        );
      };

      exportJpeg();
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("写真を読み込めませんでした。別の画像をお試しください。"));
    };
    image.src = objectUrl;
  });
}

function CrowMapSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        console.error("投稿の取得に失敗しました", err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const defaultCenter = { lat: 36.5613, lng: 136.6562 };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <div style={{ width: "100%", height: "450px" }} className="rounded-xl overflow-hidden shadow-md mb-8 border border-gray-200 relative">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          style={{ width: "100%", height: "100%" }}
          onClick={() => setSelectedPost(null)}
        >
          {posts.map((post) => (
            <Marker
              key={post.id}
              position={{ lat: post.lat, lng: post.lng }}
              title={post.place_name || "カラス目撃情報"}
              clickable={true}
              onClick={(e) => {
                if (e.domEvent) {
                  e.domEvent.stopPropagation();
                }
                setSelectedPost(post);
              }}
            />
          ))}

          {selectedPost && (
            <InfoWindow
              position={{ lat: selectedPost.lat, lng: selectedPost.lng }}
              onCloseClick={() => setSelectedPost(null)}
              pixelOffset={[0, -35]}
            >
              <div style={{ padding: "6px", maxWidth: "220px", fontSize: "13px", color: "#333" }}>
                {selectedPost.photo_url && (
                  <div style={{ marginBottom: "8px", borderRadius: "6px", overflow: "hidden", maxHeight: "120px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedPost.photo_url}
                      alt="目撃された写真"
                      style={{ width: "100%", height: "auto", objectFit: "cover" }}
                    />
                  </div>
                )}
                <h3 style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "14px", borderBottom: "1px solid #ccc", paddingBottom: "3px" }}>
                  {selectedPost.place_name || "カラス目撃情報"}
                </h3>
                <p style={{ margin: "2px 0" }}>
                  <strong>羽数:</strong> {selectedPost.crow_count ?? "不明"} 羽
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>日時:</strong> {formatObservedAt(selectedPost.observed_at)}
                </p>
                <div style={{ marginTop: "8px", textAlign: "right" }}>
                  <button
                    onClick={() => router.push(`/posts/${selectedPost.id}`)}
                    style={{
                      backgroundColor: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
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
      {loading && (
        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow text-sm text-gray-600 z-10">
          地図上のピンを読み込み中...
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [crowCount, setCrowCount] = useState("");
  const [observedAt, setObservedAt] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  function setObservedDate(daysAgo: number) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const datePart = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    const timePart = observedAt.split("T")[1] ?? "08:00";
    setObservedAt(`${datePart}T${timePart}`);
  }

  function setObservedTime(hour: number) {
    const datePart = observedAt.split("T")[0] ?? "";
    const date = datePart || (() => {
      const today = new Date();
      return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
    })();
    setObservedAt(`${date}T${String(hour).padStart(2, "0")}:00`);
  }

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    setPhotoError("");
    setPhoto(null);
    setPhotoPreview("");
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setPhotoError("画像ファイルを選択してください。");
      event.target.value = "";
      return;
    }

    try {
      const compressed = await compressPhoto(selectedFile);
      setPhoto(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "写真を処理できませんでした。");
      event.target.value = "";
    }
  }

  function fillCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("このブラウザーでは現在地を取得できません。場所を入力してください。");
      return;
    }
    setIsLocating(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const locationInput = document.getElementById("place") as HTMLInputElement | null;
        if (locationInput) {
          locationInput.value = `現在地（${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}）`;
        }
        setLocationMessage("現在地を場所欄に入力しました。必要に応じて場所の名前に書き換えてください。");
        setIsLocating(false);
      },
      () => {
        setLocationMessage("現在地を取得できませんでした。場所を入力してください。");
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setNotice("入力内容を確認しました。投稿の保存機能は準備中です。");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="カラスどこマップ ホーム">
          <span className="brand-mark" aria-hidden="true">烏</span>
          <span>カラスどこマップ</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="topbar-note">金沢のカラス情報を共有</span>
          <Link
            href="/post"
            style={{ background: "#dc2626", color: "#fff", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", textDecoration: "none" }}
          >
            ＋ 投稿画面へ
          </Link>
        </div>
      </header>

      <div className="page-content" id="top">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow"><span className="eyebrow-dot" /> SIGHTING REPORT</p>
          <h1 id="page-title">カラスを見かけましたか？</h1>
          <p className="intro-copy">目撃情報を共有して、地域のカラス被害を減らすために役立てましょう。</p>
        </section>

        {/* 地図表示エリア */}
        <section aria-labelledby="map-title" className="mb-8">
          <h2 id="map-title" className="sr-only">金沢市カラス目撃マップ</h2>
          <Suspense fallback={<div style={{ width: "100%", height: "450px" }} className="flex items-center justify-center bg-gray-100 rounded-xl">地図を読み込み中...</div>}>
            <CrowMapSection />
          </Suspense>
        </section>

        <section className="form-card" aria-labelledby="form-title">
          <div className="card-heading">
            <div>
              <h2 id="form-title">目撃情報を投稿</h2>
              <p>わかる範囲で入力してください。</p>
            </div>
            <span className="required-note"><span>*</span> 必須項目</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="place">場所 <span className="required-mark">*</span></label>
              <div className="location-row">
                <input id="place" name="place" type="text" placeholder="例：金沢城公園 石川門付近" required maxLength={100} />
                <button className="location-button" type="button" onClick={fillCurrentLocation} disabled={isLocating}>
                  <span aria-hidden="true">⌖</span>{isLocating ? "取得中…" : "現在地"}
                </button>
              </div>
              <p className="field-hint">住所や目印など、場所がわかる情報を入力してください。</p>
              {locationMessage && <p className="inline-message" role="status">{locationMessage}</p>}
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="crow-count">見かけた羽数 <span className="required-mark">*</span></label>
                <div className="count-control">
                  <button className="count-stepper" type="button" aria-label="羽数を1羽減らす" disabled={!crowCount || Number(crowCount) <= 1} onClick={() => setCrowCount(String(Math.max(1, Number(crowCount) - 1)))}>−</button>
                  <div className="count-input-wrap">
                    <input id="crow-count" name="crow_count" type="number" min="1" max="9999" placeholder="例：5" value={crowCount} onChange={(event) => setCrowCount(event.target.value)} required />
                    <span>羽</span>
                  </div>
                  <button className="count-stepper" type="button" aria-label="羽数を1羽増やす" disabled={Number(crowCount) >= 9999} onClick={() => setCrowCount(String(Math.min(9999, (Number(crowCount) || 0) + 1)))}>＋</button>
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="observed-at">見かけた日時 <span className="required-mark">*</span></label>
                <div className="quick-picks" aria-label="日付を簡単に入力">
                  {[{ label: "今日", days: 0 }, { label: "昨日", days: 1 }, { label: "2日前", days: 2 }, { label: "3日前", days: 3 }, { label: "7日前", days: 7 }].map(({ label, days }) => (
                    <button className="quick-pick" key={label} type="button" onClick={() => setObservedDate(days)}>{label}</button>
                  ))}
                </div>
                <div className="quick-picks time-picks" aria-label="時間帯を簡単に入力">
                  {[{ label: "朝", hour: 8 }, { label: "昼", hour: 12 }, { label: "夜", hour: 20 }].map(({ label, hour }) => (
                    <button className="quick-pick" key={label} type="button" onClick={() => setObservedTime(hour)}>{label} <span>{String(hour).padStart(2, "0")}:00</span></button>
                  ))}
                </div>
                <input id="observed-at" name="observed_at" type="datetime-local" value={observedAt} onChange={(event) => setObservedAt(event.target.value)} required />
                <p className="field-hint">ボタンでおおよその日時を選び、必要なら下の欄で調整できます。</p>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="note">メモ <span className="optional-label">任意</span></label>
              <textarea id="note" name="note" rows={4} maxLength={500} placeholder="カラスの様子や周辺の被害などを入力してください。" />
              <p className="field-hint">個人が特定できる情報は入力しないでください。</p>
            </div>

            <div className="field-group">
              <label htmlFor="photo">写真 <span className="optional-label">任意</span></label>
              <label className="upload-box" htmlFor="photo">
                {photoPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="photo-preview" src={photoPreview} alt="選択した写真のプレビュー" />
                    <span className="upload-change">写真を変更</span>
                  </>
                ) : (
                  <>
                    <span className="upload-icon" aria-hidden="true">＋</span>
                    <span className="upload-title">写真を選択</span>
                    <span className="upload-hint">JPG・PNG / 300KB以下に自動調整</span>
                  </>
                )}
                <input id="photo" name="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
              </label>
              {photo && <p className="field-hint">準備できました（{Math.max(1, Math.round(photo.size / 1024))}KB）。位置情報を含む画像情報は除去しています。</p>}
              {photoError && <p className="error-message" role="alert">{photoError}</p>}
            </div>

            {notice && <p className="submit-notice" role="status">{notice}</p>}
            <button className="submit-button" type="submit">投稿内容を確認 <span aria-hidden="true">→</span></button>
            <p className="privacy-note"><span aria-hidden="true">◇</span> 投稿地点は安全のため、おおまかな位置での表示を予定しています。</p>
          </form>
        </section>
        <footer className="page-footer">カラスどこマップ <span>·</span> 金沢市内の目撃情報共有プロジェクト</footer>
      </div>
    </main>
  );
}
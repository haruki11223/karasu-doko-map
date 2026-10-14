"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const MAX_PHOTO_SIZE = 300 * 1024;

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
        <span className="topbar-note">金沢のカラス情報を共有</span>
      </header>

      <div className="page-content" id="top">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow"><span className="eyebrow-dot" /> SIGHTING REPORT</p>
          <h1 id="page-title">カラスを見かけましたか？</h1>
          <p className="intro-copy">目撃情報を共有して、地域のカラス被害を減らすために役立てましょう。</p>
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

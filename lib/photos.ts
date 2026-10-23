import { supabase } from "@/lib/supabase";

const BUCKET = "post-photos";
const MAX_INPUT_BYTES = 20 * 1024 * 1024; // 選べる写真は20MBまで
const MAX_SIDE = 1280; // 長いほうの辺の最大ピクセル数
const TARGET_BYTES = 300 * 1024; // 目安は300KB以下（バケットの上限は500KB）
const QUALITIES = [0.8, 0.7, 0.6, 0.5, 0.4];

type Encoded = { blob: Blob; ext: "webp" | "jpg" };

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// webp を優先し、ブラウザが対応していなければ jpeg にする
async function encode(canvas: HTMLCanvasElement, quality: number): Promise<Encoded> {
  const webp = await canvasToBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };

  const jpeg = await canvasToBlob(canvas, "image/jpeg", quality);
  if (jpeg && jpeg.type === "image/jpeg") return { blob: jpeg, ext: "jpg" };

  throw new Error("写真を変換できませんでした");
}

// 縮小・圧縮して、位置情報（EXIF）を含まない新しい画像を作る
async function compressImage(file: File): Promise<Encoded> {
  let bitmap: ImageBitmap;
  try {
    // from-image: 写真の向きを反映する（EXIFが消えても横向きにならない）
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("この写真は読み込めません。jpeg、png、webp の写真を選んでください");
  }

  try {
    let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

    for (let round = 0; round < 4; round++) {
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("写真を処理できませんでした");
      ctx.drawImage(bitmap, 0, 0, width, height); // 描き直すので、EXIFは引き継がれない

      for (const quality of QUALITIES) {
        const result = await encode(canvas, quality);
        if (result.blob.size <= TARGET_BYTES) return result;
      }
      scale *= 0.8; // まだ大きければ、画像のサイズを小さくしてやり直す
    }
  } finally {
    bitmap.close();
  }

  throw new Error("写真を小さくできませんでした。別の写真を選んでください");
}

// 写真を保存して、公開URL（文字列）を返す。createPost の photo_url に渡す
// ブラウザ上（ボタンを押したときなど）で呼ぶこと
export async function uploadPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("画像ファイルを選んでください");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("写真のサイズが大きすぎます（20MBまで）");
  }

  const { blob, ext } = await compressImage(file);

  const path = `${crypto.randomUUID()}.${ext}`; // 毎回ランダムな名前
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) {
    throw new Error(`写真のアップロードに失敗しました: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
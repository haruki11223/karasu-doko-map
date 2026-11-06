import { supabase } from "@/lib/supabase";

let verifiedPin: string | null = null;

export async function verifyAdminDeletePin(pin: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("verify_admin_delete_pin", {
    p_pin: pin,
  });

  if (error) {
    throw new Error(`管理者設定を確認できませんでした: ${error.message}`);
  }

  return data === true;
}

export function unlockAdminDelete(pin: string) {
  verifiedPin = pin;
}

export function isAdminDeleteUnlocked() {
  return verifiedPin !== null;
}

export async function deletePostAsAdmin(postId: string): Promise<void> {
  if (!verifiedPin) {
    throw new Error("管理者モードが有効ではありません。もう一度パスワードを入力してください。");
  }

  const { data: photoPath, error: authorizationError } = await supabase.rpc("authorize_admin_photo_delete", {
    p_post_id: postId,
    p_pin: verifiedPin,
  });

  if (authorizationError) {
    throw new Error(`投稿の削除を許可できませんでした: ${authorizationError.message}`);
  }

  if (typeof photoPath === "string" && photoPath.length > 0) {
    const { error: photoError } = await supabase.storage.from("post-photos").remove([photoPath]);
    if (photoError) {
      throw new Error(`写真を削除できませんでした。投稿はまだ残っています: ${photoError.message}`);
    }
  }

  const { error } = await supabase.rpc("admin_delete_post", {
    p_post_id: postId,
    p_pin: verifiedPin,
  });

  if (error) {
    throw new Error(`投稿を削除できませんでした: ${error.message}`);
  }

  verifiedPin = null;
}

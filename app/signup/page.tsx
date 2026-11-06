 "use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import "../login/login.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("確認用パスワードが一致しません。");
      return;
    }

    if (password.length < 8) {
      setMessage("パスワードは8文字以上で入力してください。");
      return;
    }

    setMessage("メールを送信しました。確認してください。");
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Link className="login-brand" href="/" aria-label="ホームに戻る">
          <span className="login-brand-mark" aria-hidden="true">烏</span>
          <span>カラス被害どこマップ</span>
        </Link>
        <span className="login-header-note">金沢のカラス情報を共有</span>
      </header>

      <section className="login-content">
        <div className="login-intro">
          <span className="login-eyebrow"><span className="login-eyebrow-dot" />CROW DAMAGE MAP</span>
          <h1>アカウントを作成</h1>
          <p>アカウントを作成して、カラスの目撃情報を共有しましょう。</p>
        </div>

        <section className="login-card" aria-labelledby="signup-card-title">
          <div className="login-card-heading">
            <div>
              <h2 id="signup-card-title">新規アカウント登録</h2>
              <p>以下の情報を入力してください。</p>
            </div>
            <span className="login-required"><span>*</span> 必須</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="signup-name">ニックネーム <span>*</span></label>
              <input id="signup-name" type="text" value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="表示する名前" autoComplete="nickname" maxLength={30} required />
            </div>

            <div className="login-field">
              <label htmlFor="signup-email">メールアドレス <span>*</span></label>
              <input id="signup-email" type="email" value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com" autoComplete="email" required />
            </div>

            <div className="login-field">
              <label htmlFor="signup-password">パスワード <span>*</span></label>
              <div className="login-password-wrap">
                <input id="signup-password" type={showPassword ? "text" : "password"}
                  value={password} onChange={(event) => setPassword(event.target.value)}
                  placeholder="8文字以上で入力" autoComplete="new-password" minLength={8} required />
                <button className="login-password-toggle" type="button"
                  onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? "隠す" : "表示"}
                </button>
              </div>
              <p className="login-field-hint">パスワードは8文字以上で設定してください。</p>
            </div>

            <div className="login-field">
              <label htmlFor="signup-confirm-password">パスワード（確認） <span>*</span></label>
              <input id="signup-confirm-password" type={showPassword ? "text" : "password"}
                value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="もう一度パスワードを入力" autoComplete="new-password" minLength={8} required />
            </div>

            {message && <p className="login-message" role="status">{message}</p>}
            <button className="login-submit" type="submit">アカウントを作成 <span aria-hidden="true">→</span></button>
          </form>

          <p className="login-switch">
            すでにアカウントをお持ちですか？ <Link href="/login">ログインはこちら</Link>
          </p>
        </section>

        <p className="login-back"><Link href="/">← 地図ページに戻る</Link></p>
        <footer className="login-footer">カラス被害どこマップ <span>｜</span> 金沢市</footer>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.73 7.18l7.64 5.93c4.46-4.12 7.13-10.2 7.13-17.58Z"/>
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.64-5.93c-2.12 1.42-4.84 2.27-8.26 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/>
    </svg>
  );
}

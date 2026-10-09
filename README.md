# カラス被害どこマップ

プロジェクトデザイン実践 CCCA403-6 の試作アプリです。
テーマ：金沢市内におけるカラス二次被害防止の提案

## 使う技術

- Next.js（フロントエンド）
- Vercel（公開）
- Supabase（データベース・画像の保存）
- Google Maps API（地図の表示）

## はじめかた

Node.js（バージョン20以上）が必要です。

```bash
git clone <このリポジトリのURL>
cd karasu-doko-map
npm install
cp .env.example .env.local   # キーは .env.local に書く
npm run dev
```

ブラウザで http://localhost:3000 を開くと画面が表示されます。

## チームのルール

- APIキーなどの秘密情報は `.env.local` に書き、絶対にコミットしない
- `main` ブランチに直接 push せず、自分のブランチを作ってプルリクエストを出す
  - 例：`git checkout -b feature/map`
- push する前に `npm run build` が通ることを確認する

## フォルダ構成

```
app/          画面（page.tsx がトップページ）
public/       画像などの静的ファイル
.env.example  環境変数の見本
```

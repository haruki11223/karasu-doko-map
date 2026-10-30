# AI引き継ぎ用コンテキスト（カラス被害どこマップ）

このファイルは、チームの開発ルールと、AIアシスタントに伝えるプロジェクトの現状をまとめたものです。
**開発する人は、作業を始める前に必ずこのファイルの「開発ルール」を確認してください。**

---

# 開発ルール（全員必ず守る）

## ルール1：AIを使うときは、最初にこのファイルを読ませる

AIと作業を始めるときは、どんな作業でも最初にこのファイルを読ませてから質問する。読ませないと、AIはこれまでの決定事項（使う技術、テーブルの形、無料枠の方針など）を知らないまま答えてしまう。

**最初に送る文の例**

```
これからチーム開発を手伝ってください。
添付した AI_CONTEXT.md を読んで、プロジェクトの現状とルールを把握してください。
今日の私の担当は「◯◯」で、やりたいことは「◯◯」です。
```

**AIへのファイルの渡し方**

| 使っているAI | 渡し方 |
|---|---|
| ブラウザやアプリのClaude（claude.ai） | VS Codeのファイルを直接読めないので、`AI_CONTEXT.md` をチャット欄にドラッグ＆ドロップして添付する（または中身をコピーして貼り付ける） |
| ClaudeのGitHub連携 | チャット欄の **＋ → Add from GitHub** でリポジトリの `AI_CONTEXT.md` を選ぶ（プロジェクトに登録した場合は **Sync** で最新版に更新する） |
| VS CodeのClaude Code | フォルダ内のファイルを直接読めるので、「AI_CONTEXT.md を読んで」と伝えるだけでよい |

- 必ず **最新のmainを取り込んだ後のファイル** を渡すこと（古いファイルを渡すと、AIが古い前提で答える）
- プロジェクトファイルをAIに渡すときは、`node_modules` と `.env.local` は絶対に渡さない

## ルール2：開発を始めるときのコマンド

VS Codeのターミナル（PowerShell）で、プロジェクトのフォルダを開いた状態で実行する。

**新しい作業を始めるとき**

```ターミナル
git checkout main                # mainに移動
git pull                         # 最新のmainを取り込む
git checkout -b feature/作業名    # 新しいブランチを作って移動
npm install                      # 他の人が追加したライブラリを入れる
npm run dev                      # アプリを起動（http://localhost:3000）
```

**前回の続きの作業をするとき**

```ターミナル
git checkout main                # mainに移動
git pull                         # 最新のmainを取り込む
git checkout feature/作業名       # 自分のブランチに戻る
git merge main                   # 最新のmainを自分のブランチに合体
npm install
npm run dev
```

- 迷ったら、まず `git status` を打って「今どのブランチにいるか」を確認する
- **`main` ブランチのまま作業しない**（必ず自分のブランチに移動してから編集する）

## ルール3：作業中のルール

**ブランチ**
- `main` に直接pushしない。作業ごとにブランチを作り、プルリクエストで `main` に入れる
- 名前は `種類/作業内容` の形で、半角小文字とハイフンだけを使う
  - `feature/`：新しい機能（例：`feature/map`、`feature/post-form`）
  - `fix/`：バグの修正（例：`fix/map-markers`）
  - `docs/`：説明の修正（例：`docs/readme`）
- 1つのブランチでは1つの作業だけをする。マージしたらそのブランチは削除する

**ファイル**
- コンフリクトを防ぐため、担当ごとに触るファイルを分ける（担当表は下の変更履歴を参照）
- `app/page.tsx`、`app/layout.tsx`、`package.json` など全員が使うファイルを変えるときは、事前にLINEなどでチームに一声かける

**秘密情報（APIキー）**
- APIキーは `.env.local` だけに書く。コードやREADME、このファイルには書かない
- `.env.local` は `.env.example` を **コピー** して作る（名前の変更で作ると `.env.example` の削除がコミットされてしまう。消してしまったら `git restore .env.example` で戻す）
- Supabaseの `service_role` キーや Secret key は管理者用なので、どこにも書かない
- キーの受け渡しはLINEのDMなどで直接行う

## ルール4：開発を終えるときのコマンド

`npm run dev` を **Ctrl + C** で止めてから実行する。

```powershell
npm run build                          # エラーがないか確認（エラーが出たら直してから次へ）
git status                             # 上げるファイルを確認（.env.local や node_modules が入っていないこと）
git add .
git commit -m "何をしたか"
git push -u origin feature/作業名       # 初回のみ。2回目からは git push だけでOK
```

プッシュしたら、GitHubのリポジトリページで **Compare & pull request** を押してプルリクエストを出す。

## ルール5：作業を終えたら、このファイルに追記する

その日の作業が終わったら、**このファイルの一番下の「変更履歴」に追記** してから、上のルール4のコミットとプッシュをする。次に作業する人やAIが、最新の状態を把握できるようにするため。

**書き方**

```
## 2026/MM/DD　変更者：名前

### やったこと
- 
### 決まったこと・変わったこと
- 
### 残っている作業・次の人への連絡
- 
```

- 日付と名前は必ず書く
- 新しい記録は **一番下に追加** する（古いものは消さない）
- 内容が上の「プロジェクトの現状」と変わった場合（例：地図サービスが決まった）は、その部分も直してよい
- AIに「今日の作業内容を、AI_CONTEXT.md の変更履歴の形でまとめて」と頼むと楽

---

# プロジェクトの現状

最終更新：2026年10月14日

## 1. プロジェクトの概要

- 授業：プロジェクトデザイン実践（大学2年、チーム CCCA403-6、5人）
- テーマ：金沢市内におけるカラス二次被害防止の提案
- 背景：金沢市はテグスや波動装置でカラス対策をしているが、追い払われたカラスが別の場所へ移動し、移動先で同じ被害（糞害、ごみ荒らしなど）が起きている
- 作るもの：**カラス被害どこマップ**
  - カラスの居場所や被害の情報を地図上で共有するWebアプリ
  - 利用者がカラスを見つけたら、場所・羽数・時刻・メモ・写真を投稿する
  - 地図上の赤いピンをタップすると、投稿の詳細（写真、場所、メモ、時刻、羽数）がポップアップで表示され、×で閉じる
  - 地図の中心は現在地
  - 将来の構想：GPSを付けたカラスの位置表示、通知、情報提供者への報酬、公共機関への情報提供

## 2. 技術構成

| 役割 | 使うもの | 状態 |
|---|---|---|
| フロントエンド | Next.js 16.4（App Router）＋ React 19.3 ＋ TypeScript | ひな形のみ作成済み |
| スタイル | 素のCSS（Tailwindは未導入） | 未着手 |
| 公開 | Vercel（Hobby＝無料プラン） | これから登録 |
| DB・画像保存 | Supabase（Freeプラン、リージョンは東京） | これから登録 |
| 地図 | Google Maps JavaScript API | 検討中（下記参照） |
| ソース管理 | GitHub（リポジトリ名 `karasu-doko-map`） | 作成・初回プッシュ済み |

### 未決定・注意事項

- **地図サービス**：Google Mapsは無料枠内でもクレジットカードの登録が必要。カードを用意できない場合は、OpenStreetMap＋Leaflet（登録不要・無料）に切り替える可能性がある
- **リポジトリの公開設定**：VercelのHobbyプランでは、Privateリポジトリに持ち主以外がコミットするとデプロイがブロックされる。そのため、Publicにする方向で検討中
- **カラスへのGPS装着**：鳥獣保護管理法により捕獲には許可が必要。試作ではダミーデータで代用する

## 3. 現在のファイル構成

```
karasu-doko-map/
├── app/
│   ├── page.tsx        トップページ（タイトルと説明文を表示するだけ）
│   ├── layout.tsx      共通レイアウト（lang="ja"、タイトル設定）
│   ├── globals.css     最小限のリセットCSS
│   └── favicon.ico
├── public/.gitkeep
├── .env.example        環境変数の見本（中身は空）
├── .gitignore          node_modules、.next、.env* を除外（.env.example だけ例外）
├── README.md           セットアップ手順とチームのルール
├── package.json / package-lock.json
├── tsconfig.json / next.config.ts / eslint.config.mjs
└── AGENTS.md           Next.jsが自動生成するAI向けメモ
```

### 環境変数（`.env.local` に書く。絶対にコミットしない）

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 4. 最初に作る範囲（MVP）

**必須**
1. 地図の表示（中心は現在地。取得できない場合は金沢城公園付近）
2. 地図上に投稿のピンを表示
3. 投稿フォーム（場所、羽数、時刻、メモ、写真）
4. ピンをタップすると詳細ポップアップ

**後回し**
ログイン、通知、カラスのGPS連携、報酬

### 投稿データの案（Supabaseのテーブル `posts`）

| カラム | 型 | 内容 |
|---|---|---|
| id | uuid | 主キー |
| created_at | timestamptz | 投稿日時 |
| lat / lng | float8 | 緯度・経度 |
| place_name | text | 場所の名前（任意） |
| crow_count | int | 羽数（だいたい） |
| observed_at | timestamptz | 見かけた時刻 |
| note | text | メモ |
| photo_url | text | Supabase Storage上の写真URL |

## 5. 守ってほしい方針

### 無料枠を超えない
- Supabase Free：DB 500MB、ストレージ 1GB、転送量 5GB/月。1週間アクセスがないと一時停止する
- Google Maps：Dynamic Maps は月10,000回まで無料。APIキーにはサイト制限とAPI制限をかけ、1日の上限も設定する
- Vercel Hobby：非商用の個人利用に限られる。画像最適化は月5,000回まで
- **写真はアップロード前にブラウザ側で縮小・圧縮する（目安300KB以下）**。地図にはサムネイルだけを表示する

### 安全・セキュリティ
- APIキーはソースコードに直接書かない。`.env.local` と Vercel の環境変数で管理する
- 写真の位置情報（EXIF）は投稿前に削除する。投稿地点の表示は大まかにする
- Supabaseのテーブルには Row Level Security（RLS）を設定する

## 6. AIへのお願い（回答のしかた）

- メンバーはアプリ開発の初心者で、Windows＋VS Code＋を使っている。vscode内でのコマンドで動く形で示してほしい
- 日本語の「ですます調」で、手順は1つずつ順番に説明してほしい
- コードを変えるときは、どのファイルのどこを変えるかを明確にしてほしい
- Next.js 16 は以前のバージョンと仕様が違う部分があるので、`AGENTS.md` の指示に従い、`node_modules/next/dist/docs/` の公式ドキュメントを確認してからコードを書いてほしい
- 新しいライブラリを追加するときは、理由と、無料枠や安全面への影響を説明してほしい
- 上の「開発ルール」を守った手順で案内してほしい（ブランチを切る、mainに直接pushしない、など）
- 作業が終わったら、このファイルの「変更履歴」に追記する内容を、ルール5の書き方で提案してほしい

---

# 変更履歴

新しい記録は一番下に追加する（書き方はルール5を参照）。

## 2026/10/09　変更者：（初版）

- プロジェクトのひな形（Next.js）を作成し、GitHubに初回プッシュ
- このファイルの初版を作成

## 2026/10/14　変更者：takoyaki

### やったこと
- バックエンド2人の担当を決めた
- Bさんが Supabase のプロジェクト `karasu-doko-map` を作成した
- Aさん（takoyaki）が `posts` テーブルのSQLを作成し、`supabase/schema.sql` に保存（ブランチ `feature/supabase-posts`）
- 開発ルール（このファイルの一番上）を作成した

### 決まったこと・変わったこと

**バックエンドの担当**

| | Aさん（takoyaki）：データ担当 | Bさん：写真・外部サービス担当 |
|---|---|---|
| サービス | Supabaseのデータベース | Supabaseのストレージ、Google Maps API、Vercel |
| 主な作業 | `posts` テーブル、RLS、ダミーデータ | 写真用バケットとルール、Maps APIキーの発行・制限・上限設定、Vercelの環境変数登録、各サービスのアカウント登録 |
| 作る関数 | `getPosts()`、`createPost()` | `uploadPhoto()`（圧縮と位置情報の削除を含む） |
| 触るファイル | `lib/supabase.ts`、`lib/posts.ts`、`supabase/schema.sql` | `lib/photos.ts` |
| 使用量の管理 | DBの容量 | ストレージ・転送量・Mapsの使用量、キーの共有 |

**2人の関数のつなぎ目（約束）**

```
uploadPhoto(写真ファイル) → 写真のURL（文字列）を返す
createPost({ ...投稿データ, photo_url: そのURL }) → posts に保存する
```

- `lib/supabase.ts`（Supabaseへの接続設定）は2人とも使うので、**Aさんが先に作ってプッシュし、Bさんはそれを取り込んでから使う**

**サービスの状況**

- **Supabase**：プロジェクト作成済み
  - メンバーはログイン情報を共有せず、組織の Team ページから各自のアカウントを招待する（ロールは Administrator を推奨）
  - `.env.local` に書くのは Project URL と `anon` キー（新しい画面では `sb_publishable_` で始まる Publishable key）
- **Google Maps API**：Bさんが準備中（キーの発行、サイト制限・API制限、1日の上限設定）
- **Vercel**：未着手

**`posts` テーブルの定義**（`supabase/schema.sql`）

```sql
-- 投稿テーブル
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  lat         double precision not null check (lat between -90 and 90),
  lng         double precision not null check (lng between -180 and 180),
  place_name  text check (char_length(place_name) <= 100),
  crow_count  integer check (crow_count between 0 and 1000),
  observed_at timestamptz not null default now(),
  note        text check (char_length(note) <= 500),
  photo_url   text
);

-- 新しい順に並べて取得するための索引
create index posts_observed_at_idx on public.posts (observed_at desc);

-- RLS（行レベルセキュリティ）を有効にする
alter table public.posts enable row level security;

-- 誰でも投稿を読める
create policy "誰でも投稿を読める"
  on public.posts for select
  to anon, authenticated
  using (true);

-- 誰でも投稿できる（ログイン機能はMVPでは後回しのため）
create policy "誰でも投稿できる"
  on public.posts for insert
  to anon, authenticated
  with check (true);
```

- check制約で、緯度・経度の範囲、場所名100文字・メモ500文字まで、羽数0〜1000を制限している
- RLSで許可しているのは「読む」と「投稿する」だけ。**アプリからの編集・削除はできない**（いたずら防止）

**ファイル構成の追加**

```
supabase/
└── schema.sql     データベースの定義（チームで共有するSQL）
AI_CONTEXT.md      開発ルールとプロジェクトの現状（このファイル）
```

### 残っている作業・次の人への連絡

**Aさん（takoyaki）の作業の進み具合**

- [x] Supabaseのプロジェクトへの参加、`.env.local` の準備
- [x] ブランチ `feature/supabase-posts` の作成
- [ ] `posts` テーブルの作成とRLSの設定（Supabase上で実行）
- [ ] ダミーデータの投入（金沢市内に10件ほど）
- [ ] `@supabase/supabase-js` の導入と `lib/supabase.ts` の作成
- [ ] `lib/posts.ts`（`getPosts`、`createPost`）の作成
- [ ] 動作確認とプルリクエスト

**Bさんへ**
- `lib/supabase.ts` はAさんがプルリクエストを出すので、マージされたら `git merge main` で取り込んでから `lib/photos.ts` を作る
- Maps APIキーができたら、メンバーにLINEのDMなどで共有する

## 2026/10/14　変更者：tanka

### やったこと
- Google Maps API のキーを取得し、HTTPリファラー制限とAPI制限を設定した
- Supabase に写真用バケット `post-photos` を作成した（公開、500KBまで、jpeg/webpのみ）
- 写真のアップロードルールを `supabase/storage.sql` に保存した（ブランチ `feature/photos`）

### 決まったこと・変わったこと
- アップロードのみ許可し、アプリからの上書き・削除はできない
- ファイル名は重ならないよう、`uploadPhoto()` で毎回ランダムな名前にする

### 残っている作業・次の人への連絡
- Google Maps API の1日の上限と予算アラートは未設定（無料トライアル中のため設定できなかった。アップグレード前に設定する）
- `lib/photos.ts`（`uploadPhoto()`）は、Aさんの `lib/supabase.ts` がマージされてから作る
- Vercel の登録と環境変数の登録は未着手

## 2026/10/14　変更者：takoyaki（2回目）

### やったこと
- SupabaseのSQL Editorで `posts` テーブルの作成とRLSの設定を実行した（`supabase/schema.sql`）
- ダミーデータ10件（金沢城公園、兼六園、金沢駅など金沢市内）を投入した（`supabase/seed.sql`）
- `@supabase/supabase-js` を導入し、`lib/supabase.ts`（Supabaseへの接続設定）を作成した
- `lib/posts.ts`（`getPosts`、`createPost`）を作成した
- 確認用ページで、ダミーデータの取得とテスト投稿の保存ができることを確認した（確認用ページとテスト投稿は削除済み）
- 上記をブランチ `feature/supabase-client` でプルリクエストに出した

### 決まったこと・変わったこと

**ファイル構成の追加**

```
lib/
├── supabase.ts     Supabaseへの接続設定（全員がここから import する）
└── posts.ts        投稿の取得・保存の関数（getPosts、createPost）
supabase/
└── seed.sql        テスト用のダミー投稿10件（実行するたびに10件増えるので注意）
```

**バックエンドが用意した関数（`lib/posts.ts`）**

| 関数 | 使い道 | 戻り値 |
|---|---|---|
| `getPosts()` | 地図にピンを立てるための投稿一覧（見かけた時刻が新しい順、最大200件） | `Post[]` |
| `createPost(データ)` | 投稿を1件保存する | 保存された `Post` |

```ts
import { getPosts, createPost, type Post, type NewPost } from "@/lib/posts";

const posts = await getPosts();

await createPost({
  lat: 36.565,         // 必須
  lng: 136.659,        // 必須
  place_name: "金沢城公園",  // 以下は省略可
  crow_count: 5,
  observed_at: new Date().toISOString(),  // 省略すると投稿時刻
  note: "電線に並んでいる",
  photo_url: "https://...",  // uploadPhoto() が返すURL
});
```

- 最大200件にしているのは、Supabaseの転送量（無料枠5GB/月）を抑えるため

**Next.js 16 の注意（Cache Components）**

このプロジェクトのNext.js 16では Cache Components が最初から有効になっている。**データベースからデータを読み込むコンポーネントは `<Suspense>` で囲まないとビルドエラーになる**（エラー文：`Next.js encountered uncached or runtime data during prerendering`）。

```tsx
import { Suspense } from "react";
import { connection } from "next/server";
import { getPosts } from "@/lib/posts";

async function PostList() {
  await connection();          // アクセスのたびに最新のデータを取得する
  const posts = await getPosts();
  return <p>{posts.length}件</p>;
}

export default function Page() {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <PostList />
    </Suspense>
  );
}
```

**環境変数の書き方の注意**

- `NEXT_PUBLIC_SUPABASE_URL` は `https://プロジェクトID.supabase.co` の形だけを書く。後ろに `/rest/v1/` や `/` を付けると「Invalid path specified in request URL」というエラーになる
- `.env.local` を書き換えたら、`npm run dev` を Ctrl + C で止めて起動し直す（起動時にしか読み込まれない）

**今日つまずいたこと（同じミスを防ぐため）**

- `.env.local` を名前の変更で作り、`.env.example` が消えた → `git restore .env.example` で復旧
- 新しいPCでコミットしたら `Author identity unknown` → `git config --global user.name "GitHubのユーザー名"` と `git config --global user.email "GitHubのメールアドレス"` を設定していなかった。**新しいPCでは最初に必ず設定する**
- `getPosts` で `Invalid path specified in request URL` → `.env.local` のSupabaseのURLに余計な部分が付いていた
- 確認用ページのビルドで Cache Components のエラー → `<Suspense>` で囲んで解決

### 残っている作業・次の人への連絡

**Aさん（takoyaki）の作業の進み具合**

- [x] `posts` テーブルの作成とRLSの設定（Supabase上で実行）
- [x] ダミーデータの投入（金沢市内に10件）
- [x] `@supabase/supabase-js` の導入と `lib/supabase.ts` の作成
- [x] `lib/posts.ts`（`getPosts`、`createPost`）の作成
- [x] 動作確認とプルリクエスト（`feature/supabase-client`）

**Aさんの次の作業（予定）**
- フロント担当（地図・投稿画面）と、`getPosts`・`createPost` の使い方をすり合わせる
- 必要に応じて、地図の表示範囲内だけを取得する関数や、カラスのGPS位置用のダミーデータを検討する
- DBの容量を定期的に確認する
- 「プロジェクトの現状」の技術構成やファイル構成が古いままなので、次回まとめて更新する

**Bさん（tanka）への今後の指示（この順番で進める）**

1. **`lib/supabase.ts` を取り込む**
   - `feature/supabase-client` がmainにマージされたら、次を実行する
   ```ターミナル
   git checkout main
   git pull
   git checkout feature/photos
   git merge main
   npm install      # @supabase/supabase-js が追加されたため
   ```
2. **`lib/photos.ts` に `uploadPhoto()` を作る**
   - `lib/supabase.ts` の `supabase` を import して使う（新しく接続設定を作らない）
   - 受け取った写真をブラウザ側で縮小・圧縮してから保存する。バケットの上限が500KBなので、目安は300KB以下
   - バケットは jpeg と webp だけ許可しているので、PNGなど他の形式の写真も jpeg か webp に変換してから保存する
   - 画像を描き直して保存し直すと、位置情報（EXIF）も消える。必ずこの処理を通してから保存する
   - ファイル名は決めたとおり毎回ランダムにする（例：`crypto.randomUUID()` を使う）
   - `post-photos` バケットに保存し、公開URL（文字列）を返す。このURLを `createPost({ ..., photo_url })` に渡す約束
3. **動作確認をする**
   - 確認用のページ（例：`app/photo-test`）を一時的に作り、写真を選ぶ → `uploadPhoto()` → `createPost()` まで通るか試す。確認が終わったらページは削除し、テストで保存したデータと写真も消す
   - 写真が500KB以下になっているか、SupabaseのStorage画面でサイズを確認する
4. **Google Maps のキーをメンバーに共有する**
   - LINEのDMなどで送り、各自が `.env.local` の `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=` に書く。GitHubやこのファイルには書かない
5. **Google Maps の1日の上限と予算アラート**
   - 無料トライアルから有料アカウントにアップグレードする前に、必ず設定する（1日のリクエスト上限を小さめに、予算アラートは少額で）
   - 予算アラートは通知だけで、自動では止まらないことに注意
6. **Vercel の準備（リポジトリの公開設定が決まってから）**
   - リポジトリは現在 Private。VercelのHobbyプランでは、Privateリポジトリに持ち主以外がコミットするとデプロイがブロックされるため、持ち主（haruki11223）と相談して Public にするか決める
   - Vercel に `karasu-doko-map` をインポートし、Settings → Environment Variables に `.env.local` と同じ3つの値を登録する
   - 公開URLができたら、Google Maps のキーのHTTPリファラー制限にそのURLを追加する

**フロント担当（地図・投稿画面）へ**
- `getPosts`・`createPost` が使えるようになった（使い方は上の「バックエンドが用意した関数」を参照）
- データを読み込むコンポーネントは `<Suspense>` で囲む（上の「Next.js 16 の注意」を参照）
- 地図の表示を試すときは、Supabaseにダミーデータが10件入っているのでそれを使える
- 写真のアップロードは、Bさんの `uploadPhoto()` ができてから使う

## 2026/10/14　変更者：tanka

### やったこと
- リポジトリを Public にした
- Vercel にプロジェクトを登録し、環境変数を設定した

### 残っている作業・次の人への連絡
- Vercel のデプロイが Blocked になる問題を確認中

## 2026/10/14　変更者：トキダ

### やったこと
- 投稿フォーム作成の変更をPull Request #5で `main` にマージした
- フォームに場所、羽数、見かけた日時、メモ、写真の入力欄を追加した
- 見かけた日時に「今日・昨日・○日前」「朝・昼・夜」の入力補助を追加した
- 羽数に「＋」「−」ボタンを追加した

### 決まったこと・変わったこと
- 投稿フォームの変更は `main` に反映済み
- Pull Request画面ではVercelのデプロイが失敗と表示された

### 残っている作業・次の人への連絡
- VercelのBuild Logsを確認し、デプロイ失敗の原因を調べる
- Supabaseへの投稿保存と写真アップロードを接続する
- 現在地から都道府県・市区町村を自動入力する機能は未実装
## 2026/10/23　変更者：tanka

### やったこと
- Vercel のデプロイが Ready になった（原因は、Vercel に Supabase の環境変数が登録されていなかったこと）
- Vercel の環境変数3つを作り直した（種類は通常のまま。NEXT_PUBLIC_ の変数は、ブラウザに公開される値のため）
- 公開 URL を Google Maps のキーのリファラー制限に追加した

### 決まったこと・変わったこと
- Vercel の公開 URL：（ここに URL を書く）
- Vercel は「Public にしたあと、環境変数を登録して再デプロイ」で動いた
- 環境変数を追加・変更したら、再デプロイしないと反映されない

### 残っている作業・次の人への連絡
- Google Maps API の1日の上限と予算アラートは未設定（アップグレード前に設定する）
- `lib/photos.ts`（`uploadPhoto()`）は、`feature/supabase-client` が main にマージされてから作る

## 2026/10/23　変更者：takoyaki

### やったこと
- `lib/posts.ts` に `getPostsInBounds()` を追加した（ブランチ `feature/posts-in-bounds`）
- 確認用ページで、範囲の広さによって件数が変わることを確認した（確認用ページは削除済み）
- Supabaseのプロジェクトが1週間アクセスがなく一時停止していたので、Restore projectで復活させた

### 決まったこと・変わったこと

**追加した関数（`lib/posts.ts`）**

| 関数 | 使い道 | 戻り値 |
|---|---|---|
| `getPostsInBounds(bounds)` | 地図の表示範囲内の投稿だけを取得する（見かけた時刻が新しい順、最大200件） | `Post[]` |

```ts
import { getPostsInBounds } from "@/lib/posts";

const b = map.getBounds()!;
const sw = b.getSouthWest();
const ne = b.getNorthEast();
const posts = await getPostsInBounds({
  south: sw.lat(),
  west: sw.lng(),
  north: ne.lat(),
  east: ne.lng(),
});
```

- 経度180度をまたぐ範囲には対応していない（金沢周辺では不要）
- 投稿が数千件に増えたら、緯度・経度に索引を追加する

**Supabaseの一時停止について**
- 無料プランは1週間アクセスがないと停止する。`fetch failed` というエラーが出たら、まずSupabaseのダッシュボードで停止していないか確認する
- 停止していたら **Restore project** で復活できる（データは消えない）

**Node.jsの更新**
- 2026/10/21にNode.jsのセキュリティリリースがあった。各自、`node -v` で確認し、24.x なら v24.22.1 以上に更新する

### 残っている作業・次の人への連絡
- VercelのBuild Failedは、環境変数（`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`）が届いていないことが原因だった。Bさんが登録（Production・Preview）と再デプロイを確認する
- `app/db-test` はmainに残っているので、消す必要がある（トキダさんに確認してから）

## 2026/10/23　変更者：tanka

### やったこと
- `lib/photos.ts` に `uploadPhoto()` を作成した（ブランチ `feature/photo-upload`）
- 確認用ページで、保存と公開URLの取得、サイズ、位置情報の削除を確認した（確認用ページとテスト写真は削除済み）

### 決まったこと・変わったこと
- 写真は、ブラウザ側で長い辺を最大1280ピクセルに縮小し、300KB前後まで圧縮してから保存する
- 形式は webp（非対応のブラウザでは jpeg）。ファイル名は毎回ランダム

### 残っている作業・次の人への連絡
- フロント担当へ：`uploadPhoto(file)` が写真のURL（文字列）を返すので、`createPost({ ..., photo_url })` に渡す
- ブラウザ上（ボタンを押したとき）で呼ぶこと
- Next.js 16.4.0 に重大な脆弱性があり、16.4.2 への更新が必要（別ブランチで行う。事前にチームに連絡する）
- Google Maps の1日の上限と予算アラートは未設定

## 2026/10/23　変更者：トキダ

### やったこと
- 投稿フォームを `createPost()` に接続し、投稿をSupabaseに保存するようにした
- 投稿保存後に `getPosts()` で投稿一覧を再取得するようにした
- メモ欄に残り文字数を表示し、写真欄に人物や個人情報への配慮を促す注意書きを追加した
- 日付・時間ボタンの選択状態、必須項目、送信エラー、写真欄、スマートフォン表示を段階的に調整した
- 押せる要素の見た目を揃え、入力欄や補足文と区別しやすくした

### 決まったこと・変わったこと
- 写真のアップロード機能は未接続のため、選択した写真は投稿データに保存されない

### 残っている作業・次の人への連絡
- Bさんの `uploadPhoto()` ができたら、写真を投稿保存処理に接続する

## 2026/10/30　変更者：takoyaki

### やったこと
- 投稿の荒らし対策として、`posts` のRLSポリシーに制限を追加した（`supabase/rate-limit.sql`、ブランチ `feature/post-rate-limit`）
- SupabaseのSQL Editorで実行し、`set local role anon` で4パターンのテストを行った（投稿は保存されない形で確認）
- 10/23の記録の状況を更新した（下の「解決済み」を参照）

### 決まったこと・変わったこと

**投稿の制限（ポリシー「制限つきで誰でも投稿できる」）**

| 条件 | 内容 |
|---|---|
| 頻度（1分） | サイト全体で直近1分に20件まで |
| 頻度（1時間） | サイト全体で直近1時間に200件まで |
| 写真のURL | `post-photos` バケットのURLだけ許可（写真なしもOK） |
| 見かけた時刻 | 未来の日時は不可（5分までの時計のずれは許す） |

- 以前のポリシー「誰でも投稿できる」（`with check (true)`）は削除して置き換えた。`supabase/schema.sql` の該当部分は古いままなので、DBを作り直すときは `rate-limit.sql` も続けて実行する
- ログインがないので、誰が投稿したかは区別できない。荒らしが上限まで投稿すると、一時的に一般の人も投稿できなくなる。数字は `rate-limit.sql` を書き換えて再実行すれば調整できる
- テスト結果：26件の連続投稿は21件目で拒否、外部の写真URLは拒否、未来の時刻は拒否、普通の投稿は成功

**写真URLの条件について**
- `uploadPhoto()` が返すURLが `https://〜.supabase.co/storage/v1/object/public/post-photos/〜` の形であることが前提。写真つきの投稿が拒否されるときは、この形を確認する

**解決済み（10/23の記録の更新）**
- VercelのBuild Failedは、環境変数が届いていないことが原因で、Bさんの対応で解決済み（Bさんの10/23の記録を参照）
- `app/db-test` は削除済み

### 残っている作業・次の人への連絡
- 写真つきの投稿の通しテスト（トキダさんが `uploadPhoto()` をフォームにつないだあと、本番で確認する）
- Next.js 16.4.0 → 16.4.1以降（できれば最新の修正版）への更新。重大な脆弱性があるため、事前にチームに連絡してから別ブランチで行う
- ストレージへのアップロード（`supabase/storage.sql`）にも頻度制限が必要かどうか、Bさんと相談する
- テスト用に保存された投稿の整理（Supabaseの Table Editor）
- Supabaseは1週間アクセスがないと停止する。誰かが定期的にアクセスする運用を決める
- Vercelの公開URLが10/23の記録で未記入（Bさんが記入する）
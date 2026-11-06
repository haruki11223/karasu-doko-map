# AI_CONTEXT（カラス被害どこマップ）

このファイルは、AIアシスタント（claude.ai、ChatGPTなど）に読み込ませて、チーム開発を手伝ってもらうためのものです。
**作業を始めるときは、このファイルをAIのチャット欄に添付して「読んで」と送るだけで大丈夫です。**

最終更新：2026年11月06日（takoyaki が全体を整理）

---

## 0. このファイルを読み込んだAIへ（最初に必ず従うこと）

### 0-1. 最初の返答でやること

このファイルを読み込んだら、**長い説明はせず、最初の返答では次の2つだけを質問してください。**

```
こんにちは。カラス被害どこマップの開発を手伝います。
① あなたは誰ですか？（番号で答えてください）
   1. takoyaki　2. tanka　3. トキダ　4. Oji　5. 姫野
② 今日の作業はどれですか？
   A. 前回の続き　B. 新しい作業を始める　C. まだ決めていない（おすすめを教えてほしい）
```

### 0-2. 名前が分かったら、次の順で案内する

1. **作業を始めるコマンド**（3章）を、その人の答え（A／B／C）に合わせて表示する。ブランチ名は、その人の「今やること」から具体的な候補を出す（例：`fix/admin-link`）
2. その人の欄（8章）の **「takoyakiからの依頼」と「今やること」** を、未完了のものだけ、重要な順に一覧にする
3. どれから始めるかを1つ提案し、本人の返事を待つ
4. 作業中は、4章のルールを守った手順で案内する
5. 本人が「終わる」と言ったら、**作業を終えるコマンド**（5章）を表示し、その人の欄の **更新文**（書き換え後の全文）を作る

### 0-3. 回答のしかた

- メンバーはアプリ開発の初心者。Windows ＋ VS Code（ターミナルは PowerShell）を使っている。コマンドは PowerShell でそのまま動く形で示す
- 日本語の「ですます調」で、手順は1つずつ区切って示す。本人が「次」と言ったら次へ進む
- **AIはリポジトリの中身を直接見られない。** コードを変える前に、該当するファイルの中身を貼ってもらう。推測で書き換えない
- コードを変えるときは、どのファイルの何行目あたりをどう変えるかを明確にする。長いファイルは、変える部分だけ示す
- Next.js 16 は、以前のバージョンと書き方が違う部分がある。確信のないAPIは使わず、不明な点は公式ドキュメントで確認するよう伝える
- 新しいライブラリを追加するときは、理由と、無料枠・安全面への影響を説明し、チームの了承を取るよう伝える
- **他の人の担当ファイル**（2章の担当表）を変える必要があるときは、先にその担当者へ連絡するよう伝える
- エラーが出たら、まず6章「困ったとき」に同じものがないか確認する

---

## 1. プロジェクトの概要

- 授業：プロジェクトデザイン実践（大学2年、チーム CCCA403-6、5人）
- テーマ：金沢市内におけるカラス二次被害防止の提案
- 背景：金沢市はテグスや波動装置でカラス対策をしているが、追い払われたカラスが別の場所へ移動し、移動先で同じ被害（糞害、ごみ荒らしなど）が起きている
- 作るもの：**カラス被害どこマップ**（カラスの目撃情報を地図で共有するWebアプリ）
  - 地図に目撃情報のピンを表示し、タップすると一覧と詳細が出る
  - 目撃したら、場所・羽数・日時・メモ・写真を投稿する
  - 将来の構想：ログイン、GPSを付けたカラスの位置表示、通知、情報提供者への報酬、公共機関への情報提供
- 公開URL：https://karasu-doko-map.vercel.app/
- リポジトリ：GitHub `haruki11223/karasu-doko-map`（Public）

---

## 2. メンバーと担当

| 表示名 | GitHub | 担当 | 主に触るファイル |
|---|---|---|---|
| takoyaki | 74ky519 | バックエンド（データベース） | `lib/posts.ts`、`lib/supabase.ts`、`supabase/schema.sql`、`supabase/rate-limit.sql`、`supabase/seed.sql`、このファイルの整理 |
| tanka | haruki11223 | バックエンド（写真・外部サービス）、リポジトリの持ち主 | `lib/photos.ts`、`supabase/storage.sql`、Vercel、Google Maps APIキー、`README.md` |
| トキダ | lxkcnnldak1234（コミット名は ChanChin） | フロントエンド（投稿フォーム・管理者削除） | `app/post/page.tsx`、`lib/admin-delete.ts`、`supabase/admin-delete.sql` |
| Oji | 1546509 | フロントエンド（ログイン・新規登録） | `app/login/`、`app/signup/` |
| 姫野 | Kakeasdd | フロントエンド（地図画面・詳細画面） | `app/page.tsx`、`app/posts/[id]/page.tsx` |

- 全員が使うファイル：`app/layout.tsx`、`app/globals.css`、`package.json`、`package-lock.json`、`AI_CONTEXT.md`。変えるときは、事前にLINEで一声かける
- 他の人の担当ファイルを変えるときは、必ず先に担当者へ連絡する

---

## 3. 作業を始めるとき

VS Code でプロジェクトのフォルダを開き、ターミナル（PowerShell）で実行する。

### 3-1. 新しいパソコンで初めて作業するとき（1回だけ）

1. Git と Node.js（LTS版、v24）をインストールする
2. Git に名前とメールを登録する（GitHubと同じもの）
   ```
   git config --global user.name "GitHubのユーザー名"
   git config --global user.email "GitHubのメールアドレス"
   ```
3. リポジトリを取ってきて、準備する
   ```
   git clone https://github.com/haruki11223/karasu-doko-map.git
   cd karasu-doko-map
   npm install
   Copy-Item .env.example .env.local
   ```
4. `.env.local` に、LINEのDMでもらった3つのキーを書く（7-6を参照）

### 3-2. A. 前回の続きをするとき

```
git status                        # 今どのブランチか、未保存の変更がないか確認
git checkout main
git pull                          # 最新のmainを取り込む
git checkout 自分のブランチ名
git merge main                    # 最新のmainを自分のブランチに取り込む
npm install                       # 他の人が追加したライブラリを入れる
npm run dev                       # http://localhost:3000 で確認
```

### 3-3. B. 新しい作業を始めるとき

```
git status
git checkout main
git pull
git checkout -b 種類/作業内容      # 例：fix/admin-link、feature/mypage
npm install
npm run dev
```

- `git status` で `modified:` が出ていたら、先に6章の「Your local changes would be overwritten」の手順で片付ける
- ブランチ名は `feature/`（新機能）、`fix/`（修正）、`docs/`（説明の修正）＋半角小文字とハイフン
- 作ったら、`git branch --show-current` で、名前が合っているか確認する（1文字違うとプッシュで失敗する）

---

## 4. 作業中のルール（これまでのトラブルから決めたもの）

### 4-1. Git

- `main` で直接作業しない、`main` に直接プッシュしない。ブランチ → プルリクエスト → マージの順で入れる
- 1つのブランチでは1つの作業だけ。マージしたら、そのブランチは削除する
- **`git add .` を使わない。** `git add ファイル名` で、上げるファイルを指定する
- コミットメッセージは、内容が分かる文にする（「修正」「何をしたか」「コミットメッセージ」などの見本のままにしない）
- `git reset --hard`、`git push --force` は使わない（他の人の作業が消える）
- PowerShell で `stash@{0}` を使うときは、`'stash@{0}'` のようにシングルクォートで囲む

### 4-2. コンフリクトとマージ

- コンフリクトを解消するときは、**相手の変更を消さない**。分からなければ、担当者に聞いてから解消する（11/06、マージで投稿フォームが消える事故があった）
- 解消したら、ファイル内を `<<<<<<<`、`=======`、`>>>>>>>` で検索し、0件になったことを確認する
- マージしたあとは、`main` で 4-4 の動作確認をする

### 4-3. AI_CONTEXT.md（このファイル）

- **自分の欄（8章）だけを書き換える。** ほかの章や他人の欄は、takoyaki に相談してから変える
- AIが作った文章で、ファイル全体を置き換えない（11/06、ファイルが34行に上書きされる事故があった）
- takoyaki からの依頼の文は消さない。終わったら、行の先頭に「✅（日付）」を付ける
- コミット前に `git diff --stat` を見て、AI_CONTEXT.md の行が大量に減っていないか確認する

### 4-4. マージ前・マージ後の動作確認

`npm run dev` で、次がすべて動くことを確認する。

1. トップページ（`/`）に地図とピンが出る
2. ピンをタップすると一覧が出て、「詳細を見る →」で詳細ページ（`/posts/[id]`）に移動できる
3. 「＋ 目撃情報を投稿」で投稿フォーム（`/post`）が開く
4. 自分が触った機能が動く

### 4-5. 秘密情報（APIキー）

- キーは `.env.local` だけに書く。コード、README、このファイル、コミット、チャットに書かない
- `.env.local` は `.env.example` を**コピー**して作る（名前の変更で作ると `.env.example` が消える）
- Supabase の `service_role` キーや Secret key は使わない。管理者削除のPINも、どこにも書かない
- キーの受け渡しは LINE の DM で行う

---

## 5. 作業を終えるとき

`npm run dev` を **Ctrl + C** で止めてから実行する。

```
npm run build                     # ビルドが通るか（エラーが出たら直してから次へ）
npm run lint                      # ESLint のエラーが0件か（ビルドでは確認されない）
git status                        # 変更したファイルを確認（.env.local、node_modules がないこと）
git diff --stat                   # 行数が不自然に減っているファイルがないか
git add 変更したファイル名         # 例：git add app/post/page.tsx AI_CONTEXT.md
git commit -m "何をしたかが分かる文"
git push -u origin 自分のブランチ名   # 2回目からは git push だけ
```

1. GitHub で **Compare & pull request → Create pull request**
2. Vercel のチェックが緑になっているのを確認して、**Merge pull request → Confirm merge**
3. **Delete branch** を押す
4. 手元を片付ける
   ```
   git checkout main
   git pull
   git branch -d 自分のブランチ名
   ```
5. 自分の欄（8章）を更新して、上と同じ手順でコミットする（作業と同じブランチに入れてもよい）
6. LINE で「〇〇を main に入れました」と一言連絡する

---

## 6. 困ったとき（これまでに起きたエラーと直し方）

| 症状・エラー | 原因 | 直し方 |
|---|---|---|
| `Your local changes ... would be overwritten by checkout` | 保存していない変更がある | `git stash push -m "メモ" -- ファイル名` → ブランチを移動 → `git stash pop` |
| `Author identity unknown` | 新しいPCで Git の名前が未設定 | 3-1 の `git config` を実行 |
| `src refspec ... does not match any` | ブランチ名が違う | `git branch --show-current` で確認し、その名前でプッシュ |
| マージしたのに手元にファイルがない | 手元の main が古い | `git checkout main` → `git pull`。GitHub の PR が「Merged」か確認 |
| `git add .` で余計なファイルを入れた | — | `git restore --staged ファイル名`（変更は残る） |
| コミットを取り消したい（プッシュ前） | — | `git reset HEAD~1`（変更は残る）。プッシュ後は使わない |
| `git diff` に出ないのにビルドが変わった | `git checkout コミット -- ファイル` は add 済みになる | `git diff --staged` で確認 |
| `This branch has conflicts` | 同じ場所を2人が変えた | 4-2 のとおり両方の変更を残して解消 |
| `.env.example` が消えた | 名前の変更で `.env.local` を作った | `git restore .env.example` |
| `Invalid path specified in request URL` | Supabase の URL に余計な部分がある | `https://プロジェクトID.supabase.co` だけにする |
| `.env.local に NEXT_PUBLIC_SUPABASE_URL と ... を設定してください` | 環境変数が空 | `.env.local` を確認し、`npm run dev` を起動し直す。Vercel なら 7-6 を確認 |
| `fetch failed` | Supabase が一時停止している（無料プランは7日アクセスがないと停止） | Supabase のダッシュボードで **Restore project**（データは消えない） |
| `Next.js encountered uncached or runtime data during prerendering` | サーバー側でDBを読む部分が `<Suspense>` で囲まれていない | 7-3 の書き方にする |
| 地図が出ず `RefererNotAllowedMapError` | APIキーの許可URLにそのURLがない | tanka に連絡（Google Cloud の キーの「ウェブサイトの制限」に追加） |
| 投稿すると英語の `violates row-level security policy` | 投稿の制限（7-4）にかかった：頻度、未来の日時、写真URL | 時間をおく、日時を見直す |
| Vercel が Error | 環境変数の不足、または重複プロジェクト | Vercel の環境変数を Production と Preview の両方に登録し、Redeploy。プロジェクトのインポートは1回だけ |
| `npm run build` は通るが `npm run lint` がエラー | ビルドは ESLint を実行しない | エラーの行を直す |

---

## 7. 技術構成と現状（2026/11/06 時点）

### 7-1. 使っているもの

| 役割 | 使うもの | 状態 |
|---|---|---|
| フロントエンド | Next.js 16.4.5（App Router、Turbopack、Cache Components 有効）＋ React 19.3 ＋ TypeScript | 動作中 |
| 地図 | Google Maps JavaScript API（`@vis.gl/react-google-maps`） | 動作中。キーにはサイト制限・API制限あり。1日の上限は未設定（画面で編集できず保留） |
| DB・画像保存 | Supabase（Free、東京） | 動作中 |
| 公開 | Vercel（Hobby） | 動作中。重複していた `karasu-doko-map-f17d` は削除済み |
| ソース管理 | GitHub（Public） | — |

### 7-2. ページ構成

| URL | ファイル | 内容 | 担当 |
|---|---|---|---|
| `/` | `app/page.tsx` | 全画面の地図、ピン、下から出る一覧、投稿ボタン、管理者モードの入口 | 姫野 |
| `/post` | `app/post/page.tsx` | 投稿フォーム（場所、現在地、羽数、日時、メモ、写真） | トキダ |
| `/posts/[id]` | `app/posts/[id]/page.tsx` | 投稿の詳細（写真、メモ全文）、管理者モード時は削除ボタン | 姫野（削除部分はトキダ） |
| `/login`、`/signup` | `app/login/page.tsx`、`app/signup/page.tsx` | ログイン・新規登録の画面だけ（認証は未接続） | Oji |

### 7-3. ファイル構成と関数

```
app/            画面（上の表）、globals.css（共通の見た目）、login/login.css
lib/
├── supabase.ts      Supabase への接続（全員ここから import する）
├── posts.ts         getPosts()、getPostsInBounds()、createPost()
├── photos.ts        uploadPhoto()
└── admin-delete.ts  管理者削除（PIN確認、削除）
supabase/       データベースの設定（SQL Editor で実行するもの）
├── schema.sql       posts テーブル
├── rate-limit.sql   投稿の制限（schema.sql の投稿ポリシーを置き換える）
├── storage.sql      写真のバケットのルール
├── admin-delete.sql 管理者削除の関数と表
└── seed.sql         ダミー投稿10件（実行するたびに10件増える）
```

- DB を作り直すときは、`schema.sql` → `rate-limit.sql` → `storage.sql` → `admin-delete.sql` → `seed.sql` の順に実行する

| 関数（ファイル） | 使い道 | 戻り値 |
|---|---|---|
| `getPosts()`（posts.ts） | 地図の一覧。見かけた時刻の新しい順、最大200件 | `PostSummary[]` |
| `getPostsInBounds(bounds)`（posts.ts） | 地図の表示範囲内だけ取得（今は未使用） | `PostSummary[]` |
| `createPost(データ)`（posts.ts） | 投稿を1件保存 | `Post` |
| `uploadPhoto(file)`（photos.ts） | 写真を縮小・圧縮して保存し、公開URLを返す。ブラウザ側で呼ぶ | URL（文字列） |
| `verifyAdminDeletePin`、`unlockAdminDelete`、`isAdminDeleteUnlocked`、`deletePostAsAdmin`（admin-delete.ts） | 管理者削除 | — |

- `PostSummary` は一覧用の型で、`id`、`lat`、`lng`、`place_name`、`crow_count`、`observed_at`、`photo_url` の7列だけ。メモ（`note`）が必要な画面は `Post` 型と全列を使う（詳細ページ）
- 写真の保存と投稿の保存はこの順：`uploadPhoto(写真)` → 返ったURLを `createPost({ ..., photo_url })` に渡す
- サーバー側で DB を読むコンポーネントは `<Suspense>` で囲み、中で `await connection()`（`next/server`）を呼ぶ。今の画面は `"use client"` のブラウザ側で読んでいるので不要

### 7-4. データベース（Supabase）

**`posts` テーブル**

| 列 | 型 | 制限 |
|---|---|---|
| id | uuid | 自動 |
| created_at | timestamptz | 自動 |
| lat / lng | double precision | 必須、緯度経度の範囲内 |
| place_name | text | 100文字まで |
| crow_count | integer | 0〜1000 |
| observed_at | timestamptz | 必須、未来は不可（5分までのずれは許す） |
| note | text | 500文字まで |
| photo_url | text | `post-photos` バケットのURLだけ |

**アクセスのルール（RLS）**
- 読む：誰でも可
- 投稿：誰でも可。ただしサイト全体で **1分に20件、1時間に200件まで**（ログインがないので、荒らしが上限まで投稿すると一般の人も一時的に投稿できない）
- 編集：不可。削除：管理者削除（下）だけ

**写真（Storage のバケット `post-photos`）**
- 公開、1ファイル500KBまで、jpeg と webp だけ。アップロードのみ可（上書き・削除は管理者削除だけ）
- `uploadPhoto()` が長い辺1280px・300KB前後に縮小し、位置情報（EXIF）を消し、ランダムな名前で保存する

**管理者削除**
- トップページ左上の見えないボタン（44px四方）を1.5秒以内に3回押す → 4桁のPINを入力 → 投稿の詳細ページに削除ボタンが出る
- PIN はDBにハッシュで保存。間違いはIPごとに15分で5回まで
- 管理者モードの状態はメモリにだけ保存されるので、ページを読み込み直すと消える
- 4桁PINは仮運用。本格的な公開ではログイン（Supabase Auth）の管理者に移行する

### 7-5. 無料枠と方針

- Supabase Free：DB 500MB、Storage 1GB、転送量 5GB/月。**7日アクセスがないと一時停止する**
- Google Maps：地図の表示は月10,000回まで無料
- Vercel Hobby：非商用のみ
- 一覧は必要な7列だけ取得し、60秒ごと（画面が見えているときだけ）に再取得している。投稿が100件を超えるか、転送量が無料枠の半分を超えたら、取得方法を見直す
- 投稿地点は個人の特定を防ぐため、大まかにする（現在地は小数第3位＝約100mに丸めている）

### 7-6. 環境変数

`.env.local`（各自のPC）と Vercel の Settings → Environment Variables（**Production と Preview の両方**）に、同じ3つを登録する。Vercel は変更後に Redeploy が必要。

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=          # https://プロジェクトID.supabase.co の形だけ
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # anon（Publishable）キー
```

`.env.local` を書き換えたら、`npm run dev` を止めて起動し直す。

### 7-7. 未決定・保留中のこと

- Supabase の一時停止を防ぐ方法（定期アクセス。GitHub Actions を検討中）
- Google Maps の1日の上限・予算アラート（設定画面で編集できず保留。有料アカウントにする前に必ず設定する）
- ログイン（Supabase Auth）を入れるか、入れるなら投稿のルールをどう変えるか
- `/login`、`/signup` への入り口をどこに置くか

---

## 8. メンバー別の欄

**各メンバーは、自分の欄だけを書き換える。**「最新の状況」は書き換え、「takoyakiからの依頼」は消さずに、終わった行の先頭に「✅（日付）」を付ける。新しい予定は「今やること」に足す。

### takoyaki（74ky519）

**最新の状況（11/06）**
- Next.js を 16.4.5 に更新した。一覧で取得する列を7列に絞った（`PostSummary`）
- 投稿の制限（`supabase/rate-limit.sql`）を入れた
- 投稿フォームが消えた件、AI_CONTEXT.md が上書きされた件を復旧した
- このファイルを、読み込ませるだけで作業を始められる形に整理した

**takoyakiからの依頼（自分の分）**
1. `createPost()` のエラーを日本語にする（`lib/posts.ts`）
   - 今は、頻度制限や未来の日時でデータベースが拒否すると、`new row violates row-level security policy` という英語がそのまま画面に出る
✅（11/06）2. このファイルの「プロジェクトの現状」（最終更新が10/14のまま）を、今の技術構成・ページ構成・担当に合わせて書き直す
✅（11/06）3. 11/06の自分の記録にある誤字（「（Bさん）git」）を直す
4. Supabaseの停止対策（定期アクセス）の方法を決める

**今やること**
- 上の未完了の依頼

### tanka（haruki11223）

**最新の状況（11/06 時点で分かっていること）**
- Vercel を動く状態にした（環境変数を作り直し、公開URLを Google Maps のキーの許可リストに追加）
- `lib/photos.ts`（`uploadPhoto()`）を作成した
- 重複していた Vercel プロジェクト `karasu-doko-map-f17d` を削除した

**takoyakiからの依頼**
1. GitHubの Settings → Environments で、削除済みのVercelプロジェクトの記録「Preview – karasu-doko-map-f17d」と「Production – karasu-doko-map-f1…」を消す（本物の `karasu-doko-map` の記録は消さない）
2. 投稿の保存に失敗したときに、写真だけがStorageに残っていないか、ときどき確認する（アプリからは削除できないため）。調べるSQLが必要なら、takoyakiが作る

**今やること**
- 上の依頼

### トキダ（lxkcnnldak1234）

**最新の状況（11/06）**
- 投稿フォームを地図画面から分離し、`/post` に移した
- マイページのプロトタイプを作った（GitHub には未反映。保存機能は未実装）
- 10/30：写真のアップロード、60秒ごとの再取得、管理者削除機能を作った

**takoyakiからの依頼**
1. 【重要】「現在地」を押さないと、座標が金沢城公園のまま保存される（`app/post/page.tsx` 22行目）
   - 座標の初期値が `36.565, 136.659`（金沢城公園）になっている。場所の欄に「兼六園」と入力しても、ピンは金沢城公園に立つ
   - 「現在地」を押すまで送信できないようにする、または地図をタップして位置を選べるようにする
2. 羽数の上限をデータベースに合わせる（192行目と195行目）
   - 画面は9999羽まで入力できるが、データベースは0〜1000羽まで。`max="1000"` と、＋ボタンの上限を1000にする
3. 見かけた日時に、未来の日時を入れられないようにする（211行目）
   - データベースは未来の時刻を拒否するので、入力欄に `max`（今の日時）を付ける
4. 送信ボタンの文字を「投稿する」に変える（247行目）
   - 今は「投稿内容を確認」だが、確認画面はなく、押すとすぐに保存される
5. 248行目の「おおまかな位置での表示を予定しています」の文を、1を直したあとに見直す（現在地は、すでに小数第3位＝約100mに丸めている）
6. `app/posts/[id]/page.tsx` 23行目のESLintエラー（`setIsAdminMode` を effect の中で直接呼んでいる）を直す
   - 管理者モードの状態はブラウザ側にしかないので、単純に `useState` の初期値に入れる方法は使えない。直し方に迷ったら、takoyakiに相談する
7. 11/06の記録にある「マイページのプロトタイプ」が、GitHubにまだ入っていない。プッシュするか、まだ手元だけにあることを追記する
8. `supabase/admin-delete.sql` を実行済みかどうかを追記する（10/30の記録では「まだ実行していない」のまま）

**今やること**
- 上の依頼
- ログイン画面ができたら、マイページをプロフィール画面として接続する

### Oji（1546509）

**最新の状況（11/06）**
- ログイン画面（`/login`）と新規登録画面（`/signup`）の見た目を作った。認証（Supabase Auth）にはまだ接続していない
- ログイン方式は、メールアドレスとパスワードにする

**takoyakiからの依頼**
1. 使っていない `GoogleMark` を消すか使う（`app/login/page.tsx` 86行目、`app/signup/page.tsx` 110行目。ESLintの警告）
2. `/login` と `/signup` には、まだどの画面からも移動できない。どこに入り口を置くかを、姫野さんと決める

**今やること**
- 上の依頼
- Supabase Auth の接続（新規登録、メール確認、ログイン状態の保持、ログアウト、パスワード再設定の検討）。始める前に takoyaki と tanka に相談する

### 姫野（Kakeasdd）

**最新の状況（11/06）**
- トップページを全画面の地図に作り直し、ピンをタップすると下から一覧が出る形にした
- 地図画面（`/`）、投稿画面（`/post`）、詳細画面（`/posts/[id]`）を別ページにする構成を整理した
- 詳細画面には、投稿情報の表示と管理者による削除を残す方針にした

**takoyakiからの依頼**
1. 【重要】管理者モードで削除ボタンが出ない（`app/page.tsx` 466行目）
   - 「詳細を見る →」が `<a href>` になっているため、移動するときにページ全体が読み込み直される。管理者モードの状態（`lib/admin-delete.ts` の `verifiedPin`）はメモリにしか保存されないので、そこで消えてしまう
   - `next/link` の `<Link>` に変える。746行目の「＋ 目撃情報を投稿」も、同じく `<Link>` にそろえるとよい
   - 直したら、管理者モードを有効にした状態で詳細ページを開き、削除ボタンが出ることを確認する
2. `app/posts/[id]/page.tsx` 61行目のESLintエラー（`setLoading(false)` を effect の中で直接呼んでいる）を直す
   - このページでは `id` が必ずあるので、`else { setLoading(false); }` の部分は削除してよい
3. 管理者モードの開き方が変わったことを、このファイルに書き直す
   - 10/30の記録では「『カラスを見かけましたか？』の『？』を3回押す」になっているが、今のトップページには「？」がない。今は「画面左上の見えないボタン（44px四方）を1.5秒以内に3回押す」

**今やること**
- 上の依頼
- 投稿が Supabase に保存され、地図と詳細画面に正しく出るかを確認する

### 全員への依頼（takoyakiから）

- コミット前に `npm run build` と `npm run lint` の両方を実行する
- AI_CONTEXT.md は、AIが作った文章でファイル全体を置き換えず、一番下に追記するだけにする。コミット前に `git diff --stat` で、行が大量に減っていないか確認する
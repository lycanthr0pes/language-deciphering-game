# K班・班共有リポジトリへのpush手順

## 1. 目的

この手順書は、GitHubで管理しているNext.jsゲームを静的ファイルへ変換し、授業サーバの個人作業用リポジトリからK班共有用リポジトリへpushするまでの流れをまとめたものである。

講義資料 `PC3R8b.pdf`、`PC4R8.pdf`、`PC5R8b.pdf` のGit共同開発・提出方法を基準とする。

## 2. 3つの場所を区別する

この提出作業では、次の3つを別々に扱う。

| 場所 | パス・URL | 用途 |
| --- | --- | --- |
| GitHubから取得したゲームソース | `~/game-source` | Next.jsの編集・ビルド |
| 個人作業用リポジトリ | `~/public_html/pcr8/K` | ビルド結果の確認・commit・push |
| K班共有用リポジトリ | `/home/apc/public_html/r8/K` | `git push`の送信先・正式な班提出物 |

ブラウザのURLは次のとおり。

```text
個人用課題ページ:
http://165.242.90.60/~k20061/pcr8

K班共有用ページ:
http://165.242.90.60/~apc/r8/K/
```

重要:

- 作業するフォルダは `pcr8/K`。
- `git push`の送信先は `r8/K`。
- `pcr8`から`r8`へpushされる構成が正しい。
- `/home/apc/public_html/r8/K`を直接編集しない。

構成を図にすると次のようになる。

```text
GitHub
  ↓ git pull
~/game-source
  ↓ npm run build
~/game-source/out
  ↓ コピー
~/public_html/pcr8/K
  ↓ git commit / git push
/home/apc/public_html/r8/K
  ↓ 公開
http://165.242.90.60/~apc/r8/K/
```

## 3. 作業前の確認

班共有用へpushする担当者を1人に決める。複数人が同時にpushすると、`non-fast-forward`や競合が発生しやすい。

VS Code Remote SSHで授業サーバへ接続する。

```text
k20061@165.242.90.60
```

リモートターミナルで接続先を確認する。

```bash
hostname
pwd
```

## 4. GitHubの最新版を取得する

提出するソースは、原則としてPM確認済みのGitHub `main`を使う。

```bash
cd ~/game-source
git switch main
git pull
git status
git log --oneline -5
```

`git status`が次の状態であることを確認する。

```text
nothing to commit, working tree clean
```

初回で `~/game-source` が存在しない場合のみcloneする。

```bash
cd ~
git clone https://github.com/lycanthr0pes/language-deciphering-game.git game-source
cd ~/game-source
```

## 5. Next.jsの提出設定を確認する

`next.config.ts`では、静的出力とK班共有用の`basePath`が必要である。

確認する主な設定:

```ts
const basePath =
  process.env.NODE_ENV === "production"
    ? "/~apc/r8/K"
    : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
};
```

`basePath`はサーバ上の作業フォルダ`pcr8/K`ではなく、ブラウザで公開する`/~apc/r8/K`を指定する。

## 6. 依存関係と動作を確認する

このリポジトリのNext.js 16.2.9にはNode.js 20.9.0以上が必要である。

```bash
cd ~/game-source
node -v
npm -v
```

初回、または`package-lock.json`が変更された場合は依存関係をインストールする。

```bash
npm ci
```

提出前にlintと開発画面を確認する。

```bash
npm run lint
npm run dev
```

VS Codeでポート3000を転送し、次を開く。

```text
http://localhost:3000
```

確認後、開発サーバは `Ctrl+C` で停止する。

## 7. 個人作業用リポジトリを先に更新する

ビルド結果をコピーする前に、班共有用の最新版を個人作業用へ取り込む。

```bash
. pcd
cd K
pwd
git status
git pull --no-rebase
```

`pwd`は次の場所になる。

```text
/home/k20061/public_html/pcr8/K
```

未コミットの変更がある場合は、内容を確認せずにpull、reset、削除をしない。必要な変更をcommitするか、班員へ確認してから進める。

## 8. 静的ファイルを作成する

ゲームソースへ戻り、ビルドする。

```bash
cd ~/game-source
npm run build
```

成功後、`out`を確認する。

```bash
ls ~/game-source/out
ls ~/game-source/out/index.html
ls ~/game-source/out/_next
```

最低限、次が生成されていることを確認する。

```text
out/
├── index.html
├── _next/
└── assets/
```

`docs`、`src`、`node_modules`などのソース一式は`out`に含まれない。`public`内の音声・画像などは`out`へコピーされる。

## 9. ビルド結果を個人作業用へコピーする

`out`フォルダそのものではなく、`out`の中身をコピーする。

```bash
cp -r ~/game-source/out/. ~/public_html/pcr8/K/
```

コピー後に確認する。

```bash
cd ~/public_html/pcr8/K
ls
git status
```

正しい配置:

```text
~/public_html/pcr8/K/
├── index.html
├── _next/
└── assets/
```

誤った配置:

```text
~/public_html/pcr8/K/out/index.html
```

現在のビルドには班共有用の`basePath`である`/~apc/r8/K`が埋め込まれる。そのため、push前の個人用URLでは、JavaScriptやCSSが現在の班共有用ページから読み込まれる場合がある。ゲームそのものの事前確認は、`npm run dev`とポート転送で行うのが確実である。

## 10. 提出ファイルをcommitする

操作対象が`game-source`ではなく、個人作業用の`pcr8/K`であることを確認する。

```bash
cd ~/public_html/pcr8/K
pwd
git remote -v
git status
```

`git remote -v`の送信先が、次のK班共有用リポジトリであることを確認する。

```text
/home/apc/public_html/r8/K
```

変更をステージする。

```bash
git add -A
git status
```

`Changes to be committed`の内容を確認してcommitする。

```bash
git commit -m "途中提出版を更新"
```

commit後に確認する。

```bash
git status
git log --oneline -3
```

## 11. K班共有用へpushする

```bash
cd ~/public_html/pcr8/K
git push
```

次の表示がなければ、通常はpush成功である。

```text
[rejected]
non-fast-forward
```

push先として次が表示されるのは正しい。

```text
To /home/apc/public_html/r8/K
```

## 12. pushが拒否された場合

`non-fast-forward`は、別の班員が先にK班共有用へpushしたことを表す。

次の操作は禁止する。

```bash
git push --force
git reset --hard origin/main
```

講義資料どおり、共有側の変更を取り込んで統合する。

```bash
cd ~/public_html/pcr8/K
git pull --no-rebase
```

### 競合がない場合

自動マージされた内容を確認し、必要なら再度ビルド結果をコピーする。

```bash
cp -r ~/game-source/out/. ~/public_html/pcr8/K/
git status
git add -A
git commit -m "班共有の変更を統合"
git push
```

commitする変更がなければ、commitを追加せずそのままpushする。

### 競合がある場合

競合ファイルを確認する。

```bash
git status
```

競合箇所には次の記号が入る。

```text
<<<<<<<
=======
>>>>>>>
```

班員と、どちらの内容を最終提出版にするか確認してから編集する。今回の`~/game-source/out`を最終提出版として採用することが決まった場合は、該当するビルドファイルを`out`から再コピーし、競合を解消する。

競合記号が残っていないことを確認する。

```bash
grep -R -n -E '^(<<<<<<<|=======|>>>>>>>)' . --exclude-dir=.git
git status
```

問題がなければ、統合結果をcommitしてpushする。

```bash
git add -A
git commit -m "班共有の変更を統合"
git push
```

## 13. push完了を確認する

ローカルのcommitと班共有用のcommitを確認する。

```bash
cd ~/public_html/pcr8/K
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

2つのcommitハッシュが同じであれば、pushしたcommitは班共有用へ届いている。

ブラウザでK班共有用ページを開く。

```text
http://165.242.90.60/~apc/r8/K/
```

開発者ツールを開き、キャッシュを無効にして再読み込みする。

```text
Ctrl + Shift + J
Network → Disable cache
```

確認項目:

- ページが表示される。
- 左クリックで会話が進む。
- Consoleに赤いエラーがない。
- Networkに404がない。
- `_next`、画像、音声が読み込まれる。
- `<<<<<<<`、`=======`、`>>>>>>>`が表示されない。

## 14. 最短手順

初期設定と動作確認が済んでいる場合は、次の順番で行う。

```bash
# 1. GitHubの最新版
cd ~/game-source
git switch main
git pull

# 2. 班共有の最新版を個人作業用へ取り込む
. pcd
cd K
git status
git pull --no-rebase

# 3. 最終ビルド
cd ~/game-source
npm run lint
npm run build

# 4. 個人作業用へコピー
cp -r ~/game-source/out/. ~/public_html/pcr8/K/

# 5. commitとpush
cd ~/public_html/pcr8/K
git status
git add -A
git commit -m "途中提出版を更新"
git push
```

pushが拒否された場合は、強制pushやresetをせず、12章の手順で共有側の変更をマージする。


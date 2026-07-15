# GitHubリポジトリ管理方針

## 目的

本ドキュメントは、一人称視点の暗号推理ゲーム開発におけるGitHubリポジトリの最小ルールを定める。

最終決定者はPMの `@ly` とする。

## 基本方針

- `main` を開発の中心にする。
- `develop` や `release` などの長期ブランチは作らない。
- Git操作はVS CodeのSource Controlで行う。
- ターミナルは `npm install`、`npm run dev` などの開発コマンドに使う。
- GitHub/Next.js基本課題でも、Git操作はターミナルではなくVS CodeのSource Controlで行う。
- 変更はPull Requestで共有し、PMが確認してから `main` に入れる。
- 迷ったらPMに確認する。

## メンバー

| メンバー | 役割 |
| --- | --- |
| `@ly` | PM、音 |
| `@ささかまぼこ。` | UI、絵 |
| `@かまぼこ(本物)` | 実装 |
| `@ほっそー` | 実装 |

## ブランチ運用

使うブランチは以下だけにする。

| ブランチ | 用途 |
| --- | --- |
| `main` | PM確認済みの最新版 |
| `work/担当者-作業内容` | 各自の作業用ブランチ |

ブランチ名の例:

```text
work/kamaboko-dialogue
work/hosso-notebook
work/sasakamaboko-ui
work/ly-sound
work/kamaboko-training
work/hosso-training
```

ルール:

- 作業前にVS Codeで `main` に切り替えてPullする。
- 作業は `main` から作った `work/*` ブランチで行う。
- `main` に直接pushしない。
- 作業が終わったらPull Requestを作る。
- マージ済みの作業ブランチは削除する。

## commitメッセージ規則

commitメッセージは、何をしたかがわかる日本語にする。

形式:

```text
種類: 変更内容
```

使う種類は最小限にする。

| 種類 | 用途 |
| --- | --- |
| `add` | 機能、画面、素材などの追加 |
| `fix` | バグ修正 |
| `update` | 既存内容の変更 |
| `docs` | ドキュメント変更 |

例:

```text
add: 会話送りを追加
add: 仮面の男の画像を追加
fix: 時間切れ判定を修正
update: 手帳画面の見た目を調整
docs: READMEに起動方法を追加
```

避ける例:

```text
修正
いろいろ変更
作業中
```

## Pull Requestルール

Pull Requestは1つの作業ごとに作る。

タイトル例:

```text
add: 会話送りを追加
update: 手帳画面を調整
fix: ゲームオーバー判定を修正
```

本文には以下だけ書く。

```markdown
## やったこと

- 変更内容を書く

## 確認したこと

- `npm run dev` で画面を確認した

## PMに確認してほしいこと

- 仕様、文章、見た目など確認してほしい点を書く
```

UI、絵、演出を変更した場合は、スクリーンショットまたは動画を付ける。

## レビューとマージの流れ

1. 担当者が作業する。
2. VS Codeでcommitする。
3. VS CodeでPublish BranchまたはSync Changesを実行する。
4. Pull Requestを作る。
5. PMが確認する。
6. 修正があれば同じブランチで修正する。
7. PMが承認する。
8. PMが `main` にマージする。
9. マージ後、作業ブランチを削除する。

確認すること:

- 仕様と合っているか。
- ゲームが動くか。
- UIや演出が雰囲気に合っているか。
- 不要なファイルが入っていないか。

## READMEに書く内容

READMEには最低限、以下を書く。

- ゲーム概要
- メンバーと役割
- 使用技術
- 必要な環境
- セットアップ方法
- 起動方法
- 関連ドキュメント

起動方法の例:

```bash
npm install
npm run dev
```

関連ドキュメント:

- `project-flow.md`
- `github-policy.md`
- `task-sheet-template.md`
- `ui-spec.md`
- `implementation-spec.md`
- `training-task.md`
- `implementation-step-guide.md`
- `AI-guide.md`

## 初心者向けの作業手順

### 初回だけ行うこと

1. GitHubアカウントを作る。
2. PMからリポジトリに招待してもらう。
3. Git、Node.js、VS Codeをインストールする。
4. VS CodeでGitHubにログインする。
5. VS Codeでリポジトリをcloneする。
6. VS Codeでプロジェクトを開く。
7. ターミナルで `npm install` を実行する。
8. ターミナルで `npm run dev` を実行する。
9. ブラウザで画面が出るか確認する。

### 毎回の作業

1. スプレッドシートで自分のタスクを確認する。
2. VS Code左下のブランチ名から `main` に切り替える。
3. Source ControlでPullする。
4. `work/担当者-作業内容` のブランチを作る。
5. 作業する。
6. `npm run dev` で確認する。
7. Source Controlで変更内容を見る。
8. commitメッセージを書いてCommitする。
9. Publish BranchまたはSync Changesを押す。
10. Pull Requestを作る。
11. PMに確認してもらう。
12. 修正があれば直して再度commitする。
13. PMにマージしてもらう。

## 最小ルールまとめ

- `main` を中心にする。
- 作業前に `main` をPullする。
- 作業は `work/*` ブランチで行う。
- Git操作はVS Codeで行う。
- commitメッセージは内容がわかるように書く。
- Pull Requestを出す。
- PMが確認してからマージする。

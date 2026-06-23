
# 一人称視点の暗号推理ゲーム

## 概要

このプロジェクトは、Next.js / Reactで制作する一人称視点の暗号推理ゲームです。

プレイヤーは椅子に縛られた状態で目を覚まし、謎の男が提示する暗号文と日本語訳の例文を手がかりに、暗号単語の意味を推理して解答します。

## 使用技術

- Next.js
- React
- TypeScript
- CSS Modules

## 必要な環境

- Node.js
- npm
- Git

## セットアップ

初回のみ、以下を実行します。

```bash
npm install
```

## 起動方法

開発サーバを起動します。

``` bash
npm run dev
```

起動後、ブラウザで以下を開きます。

``` bash
http://localhost:3000
```

## 開発ルール
- main に直接pushしない
- 作業は work/担当者-作業内容 ブランチで行う
- 変更はPull Requestで共有する

## commitメッセージ

以下の形式にします。

```
種類: 変更内容
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

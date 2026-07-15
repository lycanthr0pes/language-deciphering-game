# 初心者向け実装手順書

担当: @かまぼこ(本物), @ほっそー  
最終決定: @ly(らい) / PM

## 1. 目的

このドキュメントは、Next.jsに触れたことがない実装担当者が、一人称視点の暗号推理ゲームを段階的に作れるようにするための手順書である。

`implementation-spec.md`は完成形の仕様書である。  
この`implementation-step-guide.md`は、初心者が迷わず作業できるように、作る順番、作るファイル、確認方法を具体的に示す。

## 2. この手順書の考え方

最初から完成形を作ろうとしない。

まずは以下の順で、小さい成功を積み重ねる。

1. 黒いゲーム画面を表示する。
2. 会話文を1行表示する。
3. 左クリックで会話を進める。
4. コンポーネントに分ける。
5. 選択肢をクリックできるようにする。
6. 正誤判定を入れる。
7. 手帳、タイマー、演出、効果音を後から足す。

画像、音声、暗号のランダム生成は後回しでよい。  
最初は仮テキスト、仮背景、仮データで動くものを作る。

## 3. 作業前の前提

### 必要なもの

| 必要なもの | 用途 |
| --- | --- |
| VS Code | コードを書く |
| Node.js | Next.jsを動かす |
| npm | ライブラリを入れる、開発サーバーを起動する |
| Git | 変更履歴を管理する |
| GitHubアカウント | Pull Requestを出す |

### 使う技術

| 技術 | このプロジェクトでの使い方 |
| --- | --- |
| Next.js | 1ページのゲーム画面を表示する |
| React | 画面部品と状態管理を作る |
| TypeScript | propsやstateの形を明確にする |
| CSS Modules | コンポーネントごとにCSSを書く |

## 4. 最初に知っておく言葉

### `page.tsx`

Next.jsで画面を表示する入口のファイル。

`src/app/page.tsx`に書いた内容が、ブラウザで`http://localhost:3000`を開いたときに表示される。

### コンポーネント

画面の部品。

例:

```text
GameScreen   ゲーム画面全体
DialogueBox  会話表示欄
ChoiceList   選択肢一覧
Notebook     手帳
```

### props

親コンポーネントから子コンポーネントに渡す値。

例:

```tsx
<DialogueBox text="ここは・・・？" />
```

この例では、`text`がpropsである。

### state

画面の中で変化する値。

例:

```tsx
const [dialogueIndex, setDialogueIndex] = useState(0);
```

この例では、今何番目の会話を表示しているかをstateで管理している。

### `onClick`

クリックされたときに実行する処理。

例:

```tsx
<button onClick={() => alert("クリックされた")}>選ぶ</button>
```

### `use client`

Next.jsの`app`フォルダでは、ファイルは基本的にサーバー側のコンポーネントとして扱われる。

`useState`、`useEffect`、`onClick`、キーボード入力を使うコンポーネントには、ファイルの一番上に`"use client";`を書く必要がある。

このゲームでは`GameScreen.tsx`に必ず書く。

```tsx
"use client";
```

## 5. プロジェクト作成手順

すでにPMがNext.jsプロジェクトを作成済みの場合、この章は確認だけでよい。

### 新しく作る場合

ターミナルで以下を実行する。

```bash
npx create-next-app@latest
```

質問には以下のように答える。

| 質問 | 回答案 |
| --- | --- |
| What is your project named? | PMが決めたプロジェクト名 |
| Would you like to use TypeScript? | Yes |
| Would you like to use ESLint? | Yes |
| Would you like to use Tailwind CSS? | No |
| Would you like your code inside a `src/` directory? | Yes |
| Would you like to use App Router? | Yes |
| Would you like to use Turbopack? | YesでもNoでも可 |
| Would you like to customize the import alias? | No |

### 起動確認

```bash
npm install
npm run dev
```

ブラウザで以下を開く。

```text
http://localhost:3000
```

Next.jsの初期画面が表示されれば成功。

## 6. 推奨する作業ブランチ

GitHub運用は`github-policy.md`に従う。

初心者向けには、以下のように機能ごとに小さく分ける。

| PR | ブランチ名例 | 内容 |
| --- | --- | --- |
| 1 | `work/kamaboko-basic-screen` | 画面表示、GameScreen、DialogueBox |
| 2 | `work/kamaboko-choice-judge` | ChoiceList、選択肢、正誤判定 |
| 3 | `work/hosso-cipher-data` | 暗号データ、例文、問題生成 |
| 4 | `work/hosso-notebook-timer` | 手帳、タイマー |
| 5 | `work/hosso-cutscene-sound` | 演出、効果音、リザルト |

1つのPRで全部作らないこと。

## 7. 最終的なファイル構成

完成時は以下を目指す。

```text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    GameScreen.tsx
    GameScreen.module.css
    DialogueBox.tsx
    DialogueBox.module.css
    ChoiceList.tsx
    ChoiceList.module.css
    Notebook.tsx
    Notebook.module.css
    TimerDisplay.tsx
    TimerDisplay.module.css
    CutsceneScreen.tsx
    CutsceneScreen.module.css
    ResultScreen.tsx
    ResultScreen.module.css
  data/
    introDialogues.ts
    wordPools.ts
    exampleTemplates.ts
  lib/
    gameConfig.ts
    gameTypes.ts
    cipherGenerator.ts
    judgeAnswer.ts
    sound.ts
  utils/
    formatTime.ts
public/
  assets/
    images/
    sounds/
    fonts/
```

ただし、最初から全部作らなくてよい。

### コンポーネント入出力の見方

Reactコンポーネントは、親からpropsを受け取り、画面にJSXを描画する。

クリックなどの操作結果は、戻り値として返すのではなく、callback関数を呼んで親へ知らせる。

初心者は、各コンポーネントを見るときに以下の3つを確認する。

| 確認すること | 意味 | 例 |
| --- | --- | --- |
| 入力 | 親から受け取るprops | `line`, `tokens`, `timeLeft` |
| 描画するもの | 画面に表示するJSX | 会話文、暗号単語、手帳、残り時間 |
| 親へ返す通知 | クリック時に呼ぶcallback | `onNext()`, `onSelectWord()`, `onSubmit()` |

### コンポーネント別の入出力

| コンポーネント | 入力 | 親へ返す通知 | 描画するもの |
| --- | --- | --- | --- |
| `GameScreen` | なし | なし | ゲーム画面全体 |
| `DialogueBox` | 会話行、操作案内 | `onNext()` | 会話文、暗号文、日本語訳 |
| `ChoiceList` | 暗号単語、選択中トークン用の日本語候補、選択済み解答 | `onSelectToken()`, `onSelectWord()`, `onSubmit()` | 暗号単語、日本語単語ボタン、`解答する`ボタン |
| `Notebook` | 例文履歴、推測メモ、表示モード、ページ番号 | `onSelectMemoWord()`, `onClose()` | 例文メモ、推測メモ、中央単語リスト |
| `TimerDisplay` | 残り時間、警告時間、間違い可能回数 | なし | 残り時間、間違い可能回数 |
| `CutsceneScreen` | 演出種類、シーン番号 | なし | 銃を抜く、銃を向ける、暗転などの演出 |
| `ResultScreen` | クリア時間、正解回数、失敗回数 | `onRetry()` | リザルト画面 |

### stateの置き場所

ゲーム進行に関わるstateは、基本的に`GameScreen`に置く。

子コンポーネントは、stateを直接変更しない。

子コンポーネントでクリックされたら、callbackで`GameScreen`に知らせる。

```tsx
<ChoiceList
  tokens={sampleQuestion.tokens}
  choices={getActiveChoices()}
  selectedAnswers={selectedAnswers}
  activeTokenId={activeTokenId}
  canSubmit={canSubmitAnswer}
  onSelectToken={handleSelectToken}
  onSelectWord={handleSelectWord}
  onSubmit={handleSubmitAnswer}
/>
```

この例では、`ChoiceList`は選択状態を自分で管理しない。

`getActiveChoices()`は、選択中の暗号単語に対応する候補だけを返す関数である。具体的な作り方は後のStep 11で扱う。

`ChoiceList`は、クリックされたら`onSelectToken`や`onSelectWord`を呼ぶ。

実際に`selectedAnswers`を更新するのは、親の`GameScreen`である。

## 8. Step 1: 黒いゲーム画面を表示する

### 目的

Next.jsで自分たちのゲーム画面を表示できるようにする。

### 作るファイル

```text
src/app/page.tsx
src/components/GameScreen.tsx
src/components/GameScreen.module.css
```

### `src/app/page.tsx`

```tsx
import { GameScreen } from "@/components/GameScreen";

export default function Page() {
  return <GameScreen />;
}
```

### `src/components/GameScreen.tsx`

```tsx
"use client";

import styles from "./GameScreen.module.css";

export function GameScreen() {
  return (
    <main className={styles.screen}>
      <p className={styles.text}>暗号推理ゲーム</p>
    </main>
  );
}
```

### `src/components/GameScreen.module.css`

```css
.screen {
  min-height: 100vh;
  background: #050505;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text {
  font-size: 32px;
}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| `npm run dev` | エラーが出ない |
| ブラウザ表示 | 黒背景に「暗号推理ゲーム」と表示される |

## 9. Step 2: 会話文を表示する

### 目的

導入会話の最初の1行を画面に出す。

### 変更するファイル

```text
src/components/GameScreen.tsx
src/components/GameScreen.module.css
```

### 実装すること

`GameScreen.tsx`に会話配列を作る。

```tsx
const introDialogues = [
  "ここは・・・？",
  "目を覚ますと、知らない場所にいた。",
  "どうやら、椅子に縛られて動けないようだ。",
  "目の前の机には手帳とペンが置いてあり、その奥には仮面を付けた男が座っている。",
  "男が話しかけてきた・・・",
];
```

まずは1行目だけ表示する。

```tsx
<p className={styles.dialogue}>{introDialogues[0]}</p>
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| ブラウザ表示 | `ここは・・・？` が表示される |
| CSS | 会話文が読める大きさで表示される |

## 10. Step 3: stateで会話番号を管理する

### 目的

何番目の会話を表示しているかをReactのstateで管理する。

### 変更するファイル

```text
src/components/GameScreen.tsx
```

### 実装すること

`useState`を使う。

```tsx
import { useState } from "react";
```

```tsx
const [dialogueIndex, setDialogueIndex] = useState(0);
const currentDialogue = introDialogues[dialogueIndex];
```

表示部分を変更する。

```tsx
<p className={styles.dialogue}>{currentDialogue}</p>
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| ブラウザ表示 | 1行目の会話が表示される |
| エラー | `useState`のエラーが出ない |

## 11. Step 4: 左クリックで会話を進める

### 目的

画面をクリックすると次の会話に進むようにする。

### 変更するファイル

```text
src/components/GameScreen.tsx
```

### 実装すること

```tsx
function handleNextDialogue() {
  const nextIndex = dialogueIndex + 1;

  if (nextIndex < introDialogues.length) {
    setDialogueIndex(nextIndex);
  }
}
```

`main`に`onClick`を追加する。

```tsx
<main className={styles.screen} onClick={handleNextDialogue}>
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 左クリック | 会話が1行ずつ進む |
| 最後の行 | それ以上クリックしてもエラーにならない |

## 12. Step 5: キーボード入力の基本を知る

### 目的

後で手帳操作に使うため、キーボード入力をReactで受け取れるようにする。

UI仕様では、会話送りは左クリックで行う。

キーボードは主に手帳操作で使う。

### 変更するファイル

```text
src/components/GameScreen.tsx
```

### 実装すること

`useEffect`を追加する。

```tsx
import { useEffect, useState } from "react";
```

```tsx
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.code === "Space") {
      event.preventDefault();
      console.log("あとで手帳を開閉する");
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

### 注意

`useEffect`は、画面表示後にキーボード入力などを登録するために使う。

`return`の中でイベントを解除することで、同じイベントが何重にも登録されるのを防ぐ。

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| Spaceキー | コンソールに確認用ログが出る |
| 左クリック | 今まで通り会話が進む |

## 13. Step 6: `DialogueBox`に分ける

### 目的

会話表示を`GameScreen`から切り出す。

初心者は、まず「親から子にpropsを渡す」ことをここで覚える。

### 作るファイル

```text
src/components/DialogueBox.tsx
src/components/DialogueBox.module.css
```

### `DialogueBox.tsx`

```tsx
import styles from "./DialogueBox.module.css";

type DialogueBoxProps = {
  text: string;
  instruction: string;
};

export function DialogueBox({ text, instruction }: DialogueBoxProps) {
  return (
    <div className={styles.box}>
      <p className={styles.text}>{text}</p>
      <p className={styles.instruction}>{instruction}</p>
    </div>
  );
}
```

### `DialogueBox.module.css`

```css
.box {
  width: min(900px, 90vw);
  min-height: 160px;
  padding: 24px;
  background: rgba(0, 0, 0, 0.78);
  border: 1px solid #777777;
  color: #ffffff;
}

.text {
  font-size: 24px;
  line-height: 1.8;
}

.instruction {
  margin-top: 24px;
  font-size: 14px;
  color: #bbbbbb;
}
```

### `GameScreen.tsx`で使う

```tsx
import { DialogueBox } from "./DialogueBox";
```

```tsx
<DialogueBox
  text={currentDialogue}
  instruction="左クリックで進む"
/>
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 表示 | 会話ボックスが表示される |
| props | `GameScreen`から渡した文章が表示される |
| 操作 | 左クリックで会話が進む |

## 14. Step 7: 会話データに色の種類を持たせる

### 目的

通常会話は白、暗号文は赤、日本語訳は青で表示できるようにする。

### 作るファイル

```text
src/lib/gameTypes.ts
src/data/introDialogues.ts
```

### `gameTypes.ts`

```ts
export type DialogueType = "normal" | "cipher" | "translation" | "answer";

export type DialogueLine = {
  id: string;
  text: string;
  type: DialogueType;
};
```

### `introDialogues.ts`

```ts
import type { DialogueLine } from "@/lib/gameTypes";

export const INTRO_DIALOGUES: DialogueLine[] = [
  { id: "intro-1", text: "ここは・・・？", type: "normal" },
  { id: "intro-2", text: "目を覚ますと、知らない場所にいた。", type: "normal" },
  { id: "intro-3", text: "どうやら、椅子に縛られて動けないようだ。", type: "normal" },
  {
    id: "intro-4",
    text: "目の前の机には手帳とペンが置いてあり、その奥には仮面を付けた男が座っている。",
    type: "normal",
  },
  { id: "intro-5", text: "男が話しかけてきた・・・", type: "normal" },
];
```

### `DialogueBox.tsx`を変更する

```tsx
import type { DialogueLine } from "@/lib/gameTypes";
import styles from "./DialogueBox.module.css";

type DialogueBoxProps = {
  line: DialogueLine;
  instruction: string;
};

export function DialogueBox({ line, instruction }: DialogueBoxProps) {
  return (
    <div className={styles.box}>
      <p className={`${styles.text} ${styles[line.type]}`}>{line.text}</p>
      <p className={styles.instruction}>{instruction}</p>
    </div>
  );
}
```

### `DialogueBox.module.css`に色を追加する

```css
.normal {
  color: #ffffff;
}

.cipher {
  color: #ff5555;
}

.translation,
.answer {
  color: #66aaff;
}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 通常会話 | 白で表示される |
| 暗号文データを追加した場合 | 赤で表示される |
| 日本語訳データを追加した場合 | 青で表示される |

## 15. Step 8: `gamePhase`を作る

### 目的

今が導入会話なのか、問題中なのか、リザルトなのかを管理する。

### 変更するファイル

```text
src/lib/gameTypes.ts
src/components/GameScreen.tsx
```

### `gameTypes.ts`に追加する

```ts
export type GamePhase =
  | "introDialogue"
  | "question"
  | "answering"
  | "result";
```

### `GameScreen.tsx`に追加する

```tsx
const [gamePhase, setGamePhase] = useState<GamePhase>("introDialogue");
```

最初は4種類だけでよい。

後から以下を追加する。

```ts
"opening"
"exampleDialogue"
"correctWait"
"clearCutscene"
"gameOverCutscene"
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 初期状態 | `introDialogue`から始まる |
| 会話終了後 | 次のフェーズに移動する準備ができている |

## 16. Step 9: 仮の問題を表示する

### 目的

導入会話が終わったあと、暗号問題を表示する。

この段階ではランダム生成しない。仮の固定問題でよい。

### `GameScreen.tsx`に仮データを作る

```tsx
const sampleQuestion = {
  cipherText: "rami humi",
  tokens: [
    { id: "token-1", cipher: "rami", category: "color", correctJa: "青い" },
    { id: "token-2", cipher: "humi", category: "humanNoun", correctJa: "女" },
  ],
  correctAnswers: {
    "token-1": "青い",
    "token-2": "女",
  },
  choiceCandidatesByTokenId: {
    "token-1": ["赤い", "青い"],
    "token-2": ["男", "女"],
  },
};
```

### 会話終了後に問題へ進める

```tsx
function handleNextDialogue() {
  const nextIndex = dialogueIndex + 1;

  if (nextIndex < INTRO_DIALOGUES.length) {
    setDialogueIndex(nextIndex);
    return;
  }

  setGamePhase("question");
}
```

### 問題表示

```tsx
{gamePhase === "question" ? (
  <p className={styles.cipherText}>問題: {sampleQuestion.cipherText}</p>
) : null}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 導入会話の最後でクリック | 問題文が表示される |
| 問題文 | 暗号文字列が表示される |

## 17. Step 10: `ChoiceList`を作る

### 目的

問題文の暗号単語、日本語単語リスト、`解答する`ボタンを表示する。

UI仕様では、品詞ラベルを表示しない。

### 作るファイル

```text
src/components/ChoiceList.tsx
src/components/ChoiceList.module.css
```

### `ChoiceList.tsx`

```tsx
import styles from "./ChoiceList.module.css";

type QuestionToken = {
  id: string;
  cipher: string;
};

type ChoiceListProps = {
  tokens: QuestionToken[];
  // 選択中の暗号単語に対応する内部カテゴリ内の候補だけを受け取る。
  choices: string[];
  selectedAnswers: Partial<Record<string, string>>;
  activeTokenId: string | null;
  canSubmit: boolean;
  onSelectToken: (tokenId: string) => void;
  onSelectWord: (tokenId: string, value: string) => void;
  onSubmit: () => void;
};

export function ChoiceList({
  tokens,
  choices,
  selectedAnswers,
  activeTokenId,
  canSubmit,
  onSelectToken,
  onSelectWord,
  onSubmit,
}: ChoiceListProps) {
  return (
    <div className={styles.list} onClick={(event) => event.stopPropagation()}>
      <div className={styles.tokens}>
        {tokens.map((token) => {
          const isActive = activeTokenId === token.id;
          const answer = selectedAnswers[token.id];

          return (
            <button
              key={token.id}
              className={isActive ? styles.activeToken : styles.token}
              type="button"
              onClick={() => onSelectToken(token.id)}
            >
              <span className={styles.cipher}>{token.cipher}</span>
              <span className={styles.answer}>{answer ?? "未選択"}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.words}>
        {choices.map((choice) => (
          <button
            key={choice}
            className={styles.wordButton}
            type="button"
            disabled={activeTokenId === null}
            onClick={() => {
              if (activeTokenId === null) return;
              onSelectWord(activeTokenId, choice);
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      <button
        className={canSubmit ? styles.submitButton : styles.disabledSubmitButton}
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        解答する
      </button>
    </div>
  );
}
```

### `ChoiceList.module.css`

```css
.list {
  position: absolute;
  left: 50%;
  bottom: 220px;
  width: min(900px, 90vw);
  transform: translateX(-50%);
  padding: 20px;
  background: rgba(0, 0, 0, 0.72);
  border: 1px solid #555555;
}

.tokens,
.words {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.token,
.activeToken {
  display: grid;
  gap: 8px;
  min-width: 100px;
  padding: 10px 12px;
  color: #ffffff;
  background: #111111;
  border: 1px solid #666666;
  cursor: pointer;
}

.activeToken {
  border-color: #66aaff;
  box-shadow: 0 0 8px rgba(102, 170, 255, 0.8);
}

.cipher {
  color: #ff5555;
}

.answer {
  color: #66aaff;
}

.wordButton,
.submitButton,
.disabledSubmitButton {
  padding: 8px 16px;
  color: #dceeff;
  background: #111111;
  border: 1px solid #666666;
  cursor: pointer;
}

.submitButton {
  border-color: #66aaff;
}

.disabledSubmitButton {
  color: #777777;
  cursor: not-allowed;
}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 問題中 | 暗号単語と日本語単語リストが表示される |
| 暗号単語をクリック | 選択中の見た目になる |
| 日本語単語をクリック | 選択中の暗号単語の下に日本語が表示される |
| 全て選択済み | `解答する`ボタンが有効になる |
| ボタンクリック | 会話送りが同時に発生しない |

## 18. Step 11: 暗号単語と日本語単語の選択をstateで管理する

### 目的

プレイヤーが、どの暗号単語にどの日本語単語を選んだかを保存する。

### `GameScreen.tsx`に追加する

```tsx
const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
const [selectedAnswers, setSelectedAnswers] = useState<Partial<Record<string, string>>>({});
```

```tsx
function handleSelectToken(tokenId: string) {
  setActiveTokenId(tokenId);
}

function handleSelectWord(tokenId: string, value: string) {
  setSelectedAnswers((prev) => ({
    ...prev,
    [tokenId]: value,
  }));
}
```

`解答する`ボタンを有効にできるか判定する。

```tsx
const canSubmitAnswer = sampleQuestion.tokens.every((token) => {
  return selectedAnswers[token.id];
});
```

選択中の暗号単語に対応する候補だけを取り出す。

```tsx
function getActiveChoices() {
  if (activeTokenId === null) return [];

  return sampleQuestion.choiceCandidatesByTokenId[activeTokenId] ?? [];
}
```

### `ChoiceList`を表示する

```tsx
{gamePhase === "question" ? (
  <ChoiceList
    tokens={sampleQuestion.tokens}
    choices={getActiveChoices()}
    selectedAnswers={selectedAnswers}
    activeTokenId={activeTokenId}
    canSubmit={canSubmitAnswer}
    onSelectToken={handleSelectToken}
    onSelectWord={handleSelectWord}
    onSubmit={() => alert("あとで正誤判定する")}
  />
) : null}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 暗号単語を選ぶ | 選択中の暗号単語が変わる |
| 日本語単語を選ぶ | 暗号単語の下に日本語が表示される |
| 同じ暗号単語で別の日本語を押す | 選択が上書きされる |

## 19. Step 12: 正誤判定を作る

### 目的

選択された答えが正しいか判定する。

### 作るファイル

```text
src/lib/judgeAnswer.ts
```

### `judgeAnswer.ts`

```ts
type Question = {
  tokens: { id: string }[];
  correctAnswers: Record<string, string>;
};

type SelectedAnswers = Partial<Record<string, string>>;

export function judgeAnswer(question: Question, selectedAnswers: SelectedAnswers) {
  return question.tokens.every((token) => {
    return selectedAnswers[token.id] === question.correctAnswers[token.id];
  });
}
```

### `GameScreen.tsx`で使う

```tsx
import { judgeAnswer } from "@/lib/judgeAnswer";
```

`解答する`ボタンが押された時だけ判定する。

```tsx
function handleSubmitAnswer() {
  const isComplete = sampleQuestion.tokens.every((token) => {
    return selectedAnswers[token.id];
  });

  if (!isComplete) return;

  const isCorrect = judgeAnswer(sampleQuestion, selectedAnswers);

  if (isCorrect) {
    alert("正解");
  } else {
    alert("不正解");
  }
}
```

Step 11で仮に書いた`onSubmit={() => alert("あとで正誤判定する")}`は、以下に差し替える。

```tsx
onSubmit={handleSubmitAnswer}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 正しい組み合わせを選ぶ | `正解` と表示される |
| 間違った組み合わせを選ぶ | `不正解` と表示される |
| 未選択が残っている | `解答する`ボタンを押せない |
| 単語選択中 | まだ判定されない |

## 20. Step 13: 正解回数と失敗回数を管理する

### 目的

正解回数、失敗回数をstateで管理する。

### `GameScreen.tsx`に追加する

```tsx
const [correctCount, setCorrectCount] = useState(0);
const [mistakeCount, setMistakeCount] = useState(0);
const [mistakesRemaining, setMistakesRemaining] = useState(1);
const [difficultyLevel, setDifficultyLevel] = useState(1);
```

正解時:

```tsx
setCorrectCount((prev) => prev + 1);
setSelectedAnswers({});
setActiveTokenId(null);
```

不正解時:

```tsx
setMistakeCount((prev) => prev + 1);
setMistakesRemaining((prev) => Math.max(prev - 1, 0));
setSelectedAnswers({});
setActiveTokenId(null);
```

### 画面に仮表示する

```tsx
<div className={styles.status}>
  正解 {correctCount} / 失敗 {mistakeCount} / 間違い可能 {mistakesRemaining}
</div>
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 正解 | 正解回数が1増える |
| 不正解 | 失敗回数が1増え、間違い可能回数が1減る |
| 判定後 | 選択状態がリセットされる |

## 21. Step 14: ゲームオーバーとクリアを作る

### 目的

Lv8の問題に正解したらクリア、間違い可能回数がなくなった状態でさらに間違えたらゲームオーバーにする。

### 作るファイル

```text
src/lib/gameConfig.ts
```

### `gameConfig.ts`

```ts
export const GAME_CONFIG = {
  finalLevel: 8,
  safeMistakeCount: 1,
} as const;
```

### 正解時の処理

```tsx
const nextCorrectCount = correctCount + 1;
setCorrectCount(nextCorrectCount);

if (difficultyLevel >= GAME_CONFIG.finalLevel) {
  setGamePhase("result");
  return;
}

setDifficultyLevel((prev) => prev + 1);
setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
```

### 不正解時の処理

```tsx
const nextMistakeCount = mistakeCount + 1;
setMistakeCount(nextMistakeCount);

if (mistakesRemaining <= 0) {
  setGamePhase("result");
  return;
}

setMistakesRemaining((prev) => Math.max(prev - 1, 0));
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| Lv8で正解 | リザルト状態へ進む |
| 間違い可能0の状態でさらに不正解 | リザルト状態へ進む |

## 22. Step 15: `ResultScreen`を作る

### 目的

終了後に結果を表示し、リトライできるようにする。

### 作るファイル

```text
src/components/ResultScreen.tsx
src/components/ResultScreen.module.css
```

### `ResultScreen.tsx`

```tsx
import styles from "./ResultScreen.module.css";

type ResultScreenProps = {
  correctCount: number;
  mistakeCount: number;
  onRetry: () => void;
};

export function ResultScreen({
  correctCount,
  mistakeCount,
  onRetry,
}: ResultScreenProps) {
  return (
    <div className={styles.result}>
      <h1>RESULT</h1>
      <p>正解回数: {correctCount}</p>
      <p>失敗回数: {mistakeCount}</p>
      <button type="button" onClick={onRetry}>
        リトライ
      </button>
      <p className={styles.instruction}>左クリックでリトライ</p>
    </div>
  );
}
```

### リトライ処理

```tsx
function resetGame() {
  setGamePhase("introDialogue");
  setDialogueIndex(0);
  setSelectedAnswers({});
  setActiveTokenId(null);
  setCorrectCount(0);
  setMistakeCount(0);
  setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
  setDifficultyLevel(1);
}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| リザルト表示 | 正解回数と失敗回数が表示される |
| リトライ | 最初の会話に戻る |

## 23. Step 16: 暗号例文を表示する

### 目的

男が暗号文と日本語訳を交互に提示する流れを作る。

### 最初は固定データでよい

```ts
const exampleDialogues = [
  { id: "ex-1-cipher", text: "raka huka", type: "cipher" },
  { id: "ex-1-ja", text: "赤い 男", type: "translation" },
  { id: "ex-2-cipher", text: "rami huka", type: "cipher" },
  { id: "ex-2-ja", text: "青い 男", type: "translation" },
  { id: "ex-3-cipher", text: "raka humi", type: "cipher" },
  { id: "ex-3-ja", text: "赤い 女", type: "translation" },
] as const;
```

導入会話が終わったら、いきなり問題に行かず、例文表示へ進める。

```tsx
setDialogueLines(exampleDialogues);
setDialogueIndex(0);
setGamePhase("exampleDialogue");
```

例文会話が終わったら問題へ進める。

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 導入後 | 暗号例文が赤で表示される |
| 次のクリック | 日本語訳が青で表示される |
| 例文終了後 | 問題へ進む |

## 24. Step 17: 手帳を作る

### 目的

過去に出た例文を確認できるようにする。

### 作るファイル

```text
src/components/Notebook.tsx
src/components/Notebook.module.css
```

### 最初の仕様

最初は以下だけ表示できればよい。

| 項目 | 内容 |
| --- | --- |
| 表示方法 | 画面上に重ねる |
| 開く操作 | Spaceキー |
| 表示内容 | 暗号文、日本語訳 |
| 閉じる操作 | Spaceキー、閉じるボタン |
| メモ切替 | 手帳表示中にTabキー |
| ページ移動 | 手帳表示中にAキー、Dキー |

### `GameScreen.tsx`のstate

```tsx
const [isNotebookOpen, setIsNotebookOpen] = useState(false);
const [notebookMode, setNotebookMode] = useState<"examples" | "memos">("examples");
const [notebookPage, setNotebookPage] = useState(0);
```

### 開閉処理

```tsx
function toggleNotebook() {
  setIsNotebookOpen((prev) => !prev);
}
```

### メモ切替処理

```tsx
function toggleNotebookMode() {
  setNotebookMode((prev) => (prev === "examples" ? "memos" : "examples"));
  setNotebookPage(0);
}
```

### ページ移動処理

```tsx
function moveNotebookPage(direction: -1 | 1) {
  setNotebookPage((prev) => Math.max(prev + direction, 0));
}
```

### キーボード処理

```tsx
if (event.code === "Space") {
  event.preventDefault();
  toggleNotebook();
}

if (isNotebookOpen && event.key === "Tab") {
  event.preventDefault();
  toggleNotebookMode();
}

if (isNotebookOpen && (event.key === "a" || event.key === "A")) {
  moveNotebookPage(-1);
}

if (isNotebookOpen && (event.key === "d" || event.key === "D")) {
  moveNotebookPage(1);
}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| Spaceキー | 手帳が開閉する |
| 手帳表示中のTabキー | 例文メモと推測メモが切り替わる |
| 手帳表示中のA/Dキー | ページが移動する |
| 手帳内クリック | 会話送りが発生しない |

## 25. Step 18: 手帳の推測メモを作る

### 目的

プレイヤーが「この暗号はこの日本語かもしれない」とメモできるようにする。

### state

```tsx
const [noteMappings, setNoteMappings] = useState<
  Partial<Record<string, string>>
>({});
```

### メモ選択処理

```tsx
function handleSelectMemo(cipherWord: string, value: string) {
  setNoteMappings((prev) => ({
    ...prev,
    [cipherWord]: value,
  }));
}
```

例:

```text
rami → 青い
huka → 男
humi → 女
```

### 注意

手帳のメモは、プレイヤーの推測を残すだけである。

正誤判定には使わない。

正誤判定に使うのは、問題画面で選んだ`selectedAnswers`だけである。

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| メモを選ぶ | 手帳内に選択内容が残る |
| 手帳を閉じて開く | メモが残っている |
| 解答判定 | 手帳メモではなく選択肢の解答で判定される |

## 26. Step 19: タイマーを作る

### 目的

問題中に残り時間を表示する。

### 作るファイル

```text
src/components/TimerDisplay.tsx
src/components/TimerDisplay.module.css
src/utils/formatTime.ts
```

### `formatTime.ts`

```ts
export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
}
```

### `GameScreen.tsx`のstate

```tsx
const [timeLeft, setTimeLeft] = useState(90);
const [isTimedOut, setIsTimedOut] = useState(false);
```

### タイマー処理

```tsx
useEffect(() => {
  if (gamePhase !== "question" && gamePhase !== "answering") return;

  if (timeLeft <= 0) {
    setIsTimedOut(true);
    return;
  }

  const timerId = window.setTimeout(() => {
    setTimeLeft((prev) => Math.max(prev - 1, 0));
  }, 1000);

  return () => window.clearTimeout(timerId);
}, [gamePhase, timeLeft]);
```

### 注意

時間切れだけでは即ゲームオーバーにしない。

時間切れ後に次に1回間違えたらゲームオーバーにする。

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 問題中 | 残り時間が減る |
| 残り時間が少ない | 赤文字になる |
| 0秒 | `isTimedOut`が`true`になる |
| 0秒後に不正解 | ゲームオーバーに進む |

## 27. Step 20: 暗号データ生成を作る

### 目的

固定問題ではなく、暗号単語と日本語単語の対応を使って問題を作る。

### 作るファイル

```text
src/data/wordPools.ts
src/lib/cipherGenerator.ts
```

### 最初はランダムにしすぎない

初心者が混乱しないよう、最初は以下の順に作る。

1. 固定の単語リストを作る。
2. Lv1では色と人系名詞だけ使う。
3. Lv2以降で動物系名詞、性質、数量、動詞を順番に追加する。
4. 動くことを確認してからランダム要素を増やす。

内部ではカテゴリを使ってもよいが、画面上には`色`、`性質`、`人系名詞`などのラベルを表示しない。

### `wordPools.ts`の例

```ts
export const WORD_POOLS = {
  color: [
    { ja: "赤い", cipher: "raka" },
    { ja: "青い", cipher: "rami" },
  ],
  quality: [
    { ja: "大きな", cipher: "doka" },
    { ja: "小さな", cipher: "domi" },
  ],
  quantity: [
    { ja: "いくつかの", cipher: "taka" },
    { ja: "たくさんの", cipher: "tami" },
  ],
  verb: [
    { ja: "見る", cipher: "vika" },
    { ja: "追う", cipher: "vimi" },
  ],
  humanNoun: [
    { ja: "男", cipher: "huka" },
    { ja: "女", cipher: "humi" },
  ],
  animalNoun: [
    { ja: "犬", cipher: "keka" },
    { ja: "猫", cipher: "kemi" },
  ],
} as const;
```

`raka`などの暗号表記は仮例である。最終的な表記はPM確認後に差し替える。

### 注意

ランダム生成はReactのreturn内で行わない。

悪い例:

```tsx
return <p>{generateRound()}</p>;
```

よい例:

```tsx
function startRound() {
  const round = generateRound(difficultyLevel);
  setCurrentQuestion(round.question);
}
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 新しい問題開始 | 問題データが作られる |
| 難易度上昇 | 内部データ上で使う品詞や文章量が増える |
| 正誤判定 | 生成された正解データで判定される |

## 28. Step 21: 紙芝居演出を作る

### 目的

失敗時とクリア時に、銃を使った演出を表示する。

### 作るファイル

```text
src/components/CutsceneScreen.tsx
src/components/CutsceneScreen.module.css
```

### 最初は画像なしでよい

素材が未完成の場合は、文字だけでシーンを切り替える。

| シーン | ゲームオーバー | クリア |
| --- | --- | --- |
| 0 | 男が銃を抜く | 男が銃を抜く |
| 1 | 男が銃をこちらに向ける | 男が銃を自分に向ける |
| 2 | 撃たれて暗転 | 撃って暗転 |

### state

```tsx
const [cutsceneStep, setCutsceneStep] = useState(0);
```

### 自動進行

```tsx
useEffect(() => {
  if (gamePhase !== "gameOverCutscene" && gamePhase !== "clearCutscene") return;

  const timerId = window.setTimeout(() => {
    if (cutsceneStep >= 2) {
      setGamePhase("result");
      return;
    }

    setCutsceneStep((prev) => prev + 1);
  }, 1200);

  return () => window.clearTimeout(timerId);
}, [gamePhase, cutsceneStep]);
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| ゲームオーバー | 3シーンが順番に表示される |
| クリア | 銃の向きが自分向きになる |
| 演出終了 | リザルト画面へ進む |

## 29. Step 22: 効果音を追加する

### 目的

会話送り、男が喋る音、書き留め、銃、発砲に効果音を入れる。

### 作るファイル

```text
src/lib/sound.ts
public/assets/sounds/
```

### `sound.ts`

```ts
type SoundKey = "dialogueNext" | "manTalk" | "writeNote" | "drawGun" | "gunShot";

const SOUND_PATHS: Record<SoundKey, string> = {
  dialogueNext: "/assets/sounds/dialogue-next.mp3",
  manTalk: "/assets/sounds/man-talk.mp3",
  writeNote: "/assets/sounds/write-note.mp3",
  drawGun: "/assets/sounds/draw-gun.mp3",
  gunShot: "/assets/sounds/gun-shot.mp3",
};

export function playSound(key: SoundKey) {
  const audio = new Audio(SOUND_PATHS[key]);
  audio.volume = 0.8;
  void audio.play();
}
```

### 注意

ブラウザの仕様で、ユーザーがクリックやキー入力をする前の音声は再生されないことがある。

そのため、開始直後に音が鳴らなくてもバグとは限らない。

まずは会話送りや単語クリック後の音で確認する。

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 会話送り | 効果音が鳴る |
| 男のセリフ表示 | 暗号例文、日本語訳、問題文の表示時に男が喋る音が鳴る |
| 問題提示 | 手帳のNEW表示と同じタイミングで書き留め音が鳴る |
| 銃を抜く | 銃を抜く音が鳴る |
| 発砲 | 銃声が鳴る |

## 30. Step 23: 画像素材を差し替える

### 目的

仮表示から、UI・絵担当が作った素材へ差し替える。

### 置き場所

```text
public/assets/images/
```

### 画像の使い方

CSSの背景画像として使う例:

```css
.screen {
  background-image: url("/assets/images/background-room.png");
  background-size: cover;
  background-position: center;
}
```

`img`タグで使う例:

```tsx
<img src="/assets/images/man-normal.png" alt="仮面の男" />
```

### 注意

Next.jsの`public`フォルダに置いたファイルは、パスの先頭を`/`にして参照する。

例:

```text
public/assets/images/man-normal.png
```

コードでは以下のように書く。

```text
/assets/images/man-normal.png
```

### 完成条件

| 確認 | 期待結果 |
| --- | --- |
| 背景 | 暗い部屋の画像が表示される |
| 男 | 通常、銃差分の画像が表示される |
| 手帳 | 手帳素材が表示される |

## 31. Step 24: 完成前の整理

### 目的

仮コードを整理し、仕様書に近い構成にする。

### 整理すること

| 項目 | 内容 |
| --- | --- |
| 型定義 | `src/lib/gameTypes.ts`にまとめる |
| 設定値 | `src/lib/gameConfig.ts`にまとめる |
| 導入会話 | `src/data/introDialogues.ts`にまとめる |
| 暗号単語 | `src/data/wordPools.ts`にまとめる |
| 正誤判定 | `src/lib/judgeAnswer.ts`にまとめる |
| 効果音 | `src/lib/sound.ts`にまとめる |

### 注意

動いているコードを一気に大きく書き換えない。

整理するときも、1ファイルずつ移動して、そのたびに`npm run dev`で確認する。

## 32. 作業分担の具体案

### @かまぼこ(本物)

| 順番 | 作業 |
| --- | --- |
| 1 | Step 1からStep 6までの基本画面と会話送り |
| 2 | Step 7からStep 12までの色分け、選択肢、正誤判定 |
| 3 | Step 13からStep 15までの正解回数、失敗回数、リザルト |
| 4 | 他機能との接続、最終調整 |

### @ほっそー

| 順番 | 作業 |
| --- | --- |
| 1 | Step 16の暗号例文表示 |
| 2 | Step 17からStep 18までの手帳 |
| 3 | Step 19のタイマー |
| 4 | Step 20の暗号データ生成 |
| 5 | Step 21からStep 23までの演出、効果音、画像差し替え |

## 33. 初心者が詰まりやすいポイント

### `useState`を使ったらエラーになる

`GameScreen.tsx`の一番上に`"use client";`があるか確認する。

### importのパスが分からない

同じ`components`フォルダ内なら以下のように書ける。

```tsx
import { DialogueBox } from "./DialogueBox";
```

`src`からの絶対パスなら以下のように書ける。

```tsx
import { judgeAnswer } from "@/lib/judgeAnswer";
```

### ボタンを押したら会話も進んでしまう

選択肢や手帳の一番外側で`event.stopPropagation()`を使う。

```tsx
<div onClick={(event) => event.stopPropagation()}>
```

### Spaceを押しても手帳が開かない

`event.code === "Space"`で判定しているか確認する。

```tsx
if (event.code === "Space") {
  event.preventDefault();
  toggleNotebook();
}
```

### stateを更新したのにすぐ反映されない

Reactのstate更新はすぐに変数へ反映されるとは限らない。

次の値を使いたい場合は、先に`nextAnswers`や`nextMistakeCount`のような変数を作って使う。

### ランダム生成結果が毎回変わってしまう

Reactのreturn内でランダム生成している可能性がある。

問題開始時だけ生成して、stateに保存する。

## 34. Pull Request前の確認リスト

PRを出す前に、担当者自身で確認する。

| 確認項目 | 期待結果 |
| --- | --- |
| `npm run dev` | エラーなく起動する |
| ブラウザ表示 | ゲーム画面が表示される |
| 左クリック | 会話またはリトライが動く |
| Spaceキー | 手帳が開閉する |
| 手帳表示中のTabキー | 例文メモと推測メモが切り替わる |
| 手帳表示中のA/Dキー | 手帳ページが移動する |
| 暗号単語クリック | 選択中の暗号単語が切り替わる |
| 日本語単語クリック | 解答が選ばれる |
| 解答するボタン | 全て解答済みの時だけ正誤判定が動く |
| 正解 | 正解回数が増える |
| 不正解 | 失敗回数が増え、間違い可能回数が減る |
| 時間切れ | 次の不正解で終了する |
| クリア | クリア演出かリザルトに進む |
| ゲームオーバー | 失敗演出かリザルトに進む |
| リトライ | 最初からやり直せる |

## 35. 最小完成ライン

PM確認用の最小完成ラインは以下とする。

| 機能 | 最小完成の条件 |
| --- | --- |
| 画面 | 黒背景と会話ボックスが表示される |
| 会話 | 左クリックで進む |
| 暗号例文 | 赤の暗号文、青の日本語訳が表示される |
| 問題 | 暗号文と選択肢が表示される |
| 解答 | 暗号単語を選び、日本語単語を割り当てられる |
| 判定 | `解答する`ボタンで正解、不正解を判定できる |
| 失敗 | 間違い可能0の状態でさらに間違えると終了する |
| クリア | Lv8の問題に正解すると終了する |
| リザルト | 正解回数、失敗回数が表示される |
| リトライ | 最初から再開できる |

手帳、タイマー、画像、効果音、紙芝居演出は、最小完成後に追加してよい。

## 36. PMに確認するタイミング

以下のタイミングでは、自己判断で進めすぎずPMに確認する。

| タイミング | 確認内容 |
| --- | --- |
| 会話送りが動いた | 操作感が問題ないか |
| 選択肢が出た | 品詞ラベルを出さずに選びやすいか |
| 正誤判定が動いた | 判定条件が仕様通りか |
| タイマーが入った | 制限時間と警告ラインが妥当か |
| 手帳が入った | 表示内容と操作方法が分かりやすいか |
| 演出が入った | 失敗演出とクリア演出の流れが合っているか |
| 効果音が入った | 音のタイミングが合っているか |

## 37. 最終的に`implementation-spec.md`へ寄せる

この手順書では、初心者が理解しやすいように最初は簡略化している。

最小実装が動いたら、最終的には`implementation-spec.md`に書かれている以下の構成へ寄せる。

| 項目 | 最終形 |
| --- | --- |
| 親コンポーネント | `GameScreen` |
| 会話表示 | `DialogueBox` |
| 選択肢 | `ChoiceList` |
| 手帳 | `Notebook` |
| タイマー | `TimerDisplay` |
| 演出 | `CutsceneScreen` |
| リザルト | `ResultScreen` |
| 型定義 | `gameTypes.ts` |
| 設定値 | `gameConfig.ts` |
| 正誤判定 | `judgeAnswer.ts` |
| 暗号生成 | `cipherGenerator.ts` |

完成形を最初から目指すのではなく、動く最小実装を作ってから、少しずつ整理する。

## 38. 最終統合手順

### 目的

@かまぼこ(本物) と @ほっそー が別々に作った機能を、最終的に1つのゲーム画面として動く状態に統合する。

統合の中心は`GameScreen`とする。

各コンポーネントは、`GameScreen`からpropsを受け取り、必要な操作が発生したら`GameScreen`にイベントを返す。

### 統合の基本方針

- `GameScreen`が親コンポーネントになる。
- `DialogueBox`、`ChoiceList`、`Notebook`、`TimerDisplay`、`CutsceneScreen`、`ResultScreen`は子コンポーネントとして使う。
- ゲーム進行に関わるstateは原則として`GameScreen`に置く。
- 子コンポーネントは、表示とクリック通知だけを担当する。
- 最初は固定データで統合し、動作確認後に暗号生成へ差し替える。
- 統合時に`GameScreen.tsx`を触る人は原則1人にする。

### 統合前に各担当が終わらせること

| 担当 | 統合前に終わらせるもの |
| --- | --- |
| @かまぼこ(本物) | `GameScreen`、`DialogueBox`、`ChoiceList`、正誤判定、リザルトの最小実装 |
| @ほっそー | `Notebook`、`TimerDisplay`、暗号データ生成、`CutsceneScreen`、効果音処理の単体実装 |

単体実装とは、仮データでもよいので、そのコンポーネントだけを画面に出して動作確認できている状態を指す。

### 推奨する統合順

1. `GameScreen`と`DialogueBox`を統合する。
2. 導入会話を左クリックで進められるようにする。
3. 固定問題で`ChoiceList`を統合する。
4. `selectedAnswers`と`judgeAnswer`を接続する。
5. 正解回数、失敗回数、リザルトを接続する。
6. `Notebook`を接続する。
7. Spaceキーで手帳を開閉し、Tabキーでメモ切替、A/Dキーでページ移動できるようにする。
8. `TimerDisplay`を接続する。
9. 時間切れ後の不正解でゲームオーバーになる処理を接続する。
10. 固定問題を`cipherGenerator.ts`の生成データへ差し替える。
11. `CutsceneScreen`を接続する。
12. クリア演出、失敗演出からリザルトへ進むようにする。
13. 効果音を接続する。
14. 画像素材、CSS、レイアウトを調整する。
15. 全体を通してプレイし、PMレビューに出す。

### PRのマージ順

初心者同士でコンフリクトを減らすため、以下の順番を推奨する。

| 順番 | PR内容 | 理由 |
| --- | --- | --- |
| 1 | 基本画面、`GameScreen`、`DialogueBox` | 親画面がないと他機能を接続できない |
| 2 | `ChoiceList`、正誤判定 | ゲームの中心動作を先に固める |
| 3 | `ResultScreen` | 終了とリトライを先に確認できる |
| 4 | `Notebook` | ゲーム本体に重ねる補助UIとして追加する |
| 5 | `TimerDisplay` | 解答中の状態に接続する |
| 6 | 暗号データ生成 | 固定問題から生成問題へ差し替える |
| 7 | `CutsceneScreen` | 正解、失敗の分岐後に追加する |
| 8 | 効果音、画像、最終UI調整 | 動作が固まってから見た目と音を入れる |

### 統合時に触るファイル

統合時に主に変更するファイルは以下とする。

| ファイル | 変更内容 |
| --- | --- |
| `src/components/GameScreen.tsx` | state、props接続、進行処理を統合する |
| `src/lib/gameTypes.ts` | コンポーネント間で共有する型を揃える |
| `src/lib/gameConfig.ts` | PM決定値、仮設定値をまとめる |
| `src/lib/cipherGenerator.ts` | 固定問題から生成問題へ差し替える |
| `src/lib/judgeAnswer.ts` | 正誤判定の共通処理を使う |

`GameScreen.tsx`はコンフリクトが起きやすい。

同じタイミングで2人が大きく編集しないようにする。

### `GameScreen`に集約するstate

最終統合時、以下のstateは`GameScreen`に置く。

| state | 接続先 |
| --- | --- |
| `gamePhase` | 全コンポーネントの表示切り替え |
| `dialogueLines` | `DialogueBox` |
| `dialogueIndex` | `DialogueBox` |
| `currentQuestion` | `DialogueBox`、`ChoiceList` |
| `selectedAnswers` | `ChoiceList` |
| `activeAnswerTokenId` | `ChoiceList` |
| `examples` | `Notebook` |
| `noteMappings` | `Notebook` |
| `correctCount` | `ResultScreen` |
| `mistakeCount` | `ResultScreen` |
| `mistakesRemaining` | `TimerDisplay` |
| `timeLeft` | `TimerDisplay` |
| `isTimedOut` | 不正解処理 |
| `isNotebookOpen` | `Notebook` |
| `notebookMode` | `Notebook` |
| `notebookExamplePage` | `Notebook` |
| `notebookMemoPage` | `Notebook` |
| `activeMemoCipherWord` | `Notebook` |
| `cutsceneStep` | `CutsceneScreen` |
| `resultStatus` | `ResultScreen` |

子コンポーネント側で同じ意味のstateを重複して持たない。

例えば、`ChoiceList`の中で`selectedAnswers`を持つのではなく、`GameScreen`からpropsで受け取る。

### props接続の最終形

統合時のprops接続は以下を目安にする。

```tsx
<DialogueBox
  line={currentDialogueLine}
  instruction="左クリックで進む"
/>

{gamePhase === "answering" && currentQuestion ? (
  <ChoiceList
    tokens={currentQuestion.tokens}
    choices={getActiveAnswerChoices()}
    selectedAnswers={selectedAnswers}
    activeTokenId={activeAnswerTokenId}
    canSubmit={canSubmitAnswer()}
    onSelectToken={handleSelectAnswerToken}
    onSelectWord={handleSelectAnswerWord}
    onSubmit={handleSubmitAnswer}
  />
) : null}

<Notebook
  isOpen={isNotebookOpen}
  examples={examples}
  noteMappings={noteMappings}
  mode={notebookMode}
  examplePage={notebookExamplePage}
  memoPage={notebookMemoPage}
  memoChoices={memoChoices}
  activeMemoCipherWord={activeMemoCipherWord}
  onSelectMemoWord={handleSelectMemoWord}
  onSelectMemoCipherWord={setActiveMemoCipherWord}
  onClose={() => setIsNotebookOpen(false)}
/>

<TimerDisplay
  timeLeft={timeLeft}
  warningTime={15}
  mistakesRemaining={mistakesRemaining}
/>

{gamePhase === "clearCutscene" || gamePhase === "gameOverCutscene" ? (
  <CutsceneScreen type={resultStatus} step={cutsceneStep} />
) : null}

{gamePhase === "result" ? (
  <ResultScreen
    correctCount={correctCount}
    mistakeCount={mistakeCount}
    onRetry={resetGame}
  />
) : null}
```

実際のprops名は、各コンポーネントの実装に合わせて調整してよい。

ただし、同じ意味のprops名はなるべく統一する。

### 固定データから生成データへ差し替える手順

最初は`sampleQuestion`のような固定問題で統合する。

固定問題で以下が動くことを確認してから、`generateRound`へ差し替える。

- 問題文が表示される。
- 選択肢が表示される。
- 正解判定が動く。
- 不正解判定が動く。
- 正解回数と失敗回数が増える。
- リザルトへ進む。

差し替え後は、問題開始処理を以下の流れにする。

1. `generateRound(difficultyLevel)`を呼ぶ。
2. 返ってきた`dialogueLines`を`setDialogueLines`する。
3. 返ってきた`question`を`setCurrentQuestion`する。
4. 返ってきた`examples`を`setExamples`で追加する。
5. `selectedAnswers`を空にする。
6. `gamePhase`を`exampleDialogue`にする。

この段階ではまだNEW表示と書き留め音は出さない。例文表示が終わって問題提示へ切り替わる瞬間に、手帳のNEW表示と書き留め音を出す。

### コンフリクトが出やすい場所

以下のファイルは2人で同時に編集すると衝突しやすい。

| ファイル | 理由 |
| --- | --- |
| `GameScreen.tsx` | 全機能の接続先になるため |
| `gameTypes.ts` | 型名やprops型を両者が追加するため |
| `gameConfig.ts` | 設定値を両者が追加するため |
| `globals.css` | 全体CSSを両者が変更する可能性があるため |

対策:

- `GameScreen.tsx`の統合作業は、できれば1人が担当する。
- もう1人は子コンポーネントや`lib`、`data`側を作る。
- 型や設定値を追加したい場合は、PR本文に明記する。
- コンフリクトした場合は自分だけで判断せず、PMまたはもう1人の実装担当に確認する。

### 統合後の確認リスト

統合が終わったら、以下を上から順に確認する。

| 確認 | 期待結果 |
| --- | --- |
| 起動 | `npm run dev`でエラーが出ない |
| 初期画面 | 暗いゲーム画面が表示される |
| 導入会話 | 左クリックで進む |
| 暗号例文 | 暗号文が赤、日本語訳が青で表示される |
| 問題表示 | 暗号問題と選択肢が表示される |
| 選択肢 | 暗号単語を選び、日本語単語を割り当てられる |
| 正解 | 正解回数が増え、次の問題へ進む |
| 不正解 | 失敗回数が増え、間違い可能回数が減る |
| 間違い可能0でさらに不正解 | ゲームオーバー演出へ進む |
| タイマー | 問題中だけ残り時間が減る |
| 時間切れ | 次の不正解でゲームオーバーになる |
| 手帳 | Spaceキーで開閉できる |
| 手帳操作 | Tabキーでメモ切替、A/Dキーでページ移動できる |
| 手帳内容 | 例文履歴と推測メモが表示される |
| クリア条件 | Lv8で正解するとクリア演出へ進む |
| 演出 | 失敗演出、クリア演出が順番に表示される |
| リザルト | クリア時間、正解回数、失敗回数が表示される |
| リトライ | 左クリックで最初から再開できる |

### PMレビューに出す前の最小統合ライン

PMレビューに出す最低条件は以下とする。

- `npm run dev`で起動できる。
- 導入会話が進む。
- 暗号例文が表示される。
- 問題と選択肢が表示される。
- 正解、不正解が判定できる。
- 失敗回数と正解回数が変化する。
- クリアまたはゲームオーバーでリザルトへ進む。
- リトライできる。

手帳、タイマー、画像、効果音、演出が未完成の場合は、PR本文に未完成項目として明記する。

### 統合担当の決め方

統合作業は、PMがどちらか1人を主担当に決めることを推奨する。

主担当は以下を行う。

- `GameScreen.tsx`への接続作業を行う。
- props名と型名を揃える。
- 統合後の動作確認を行う。
- PR本文に動作確認結果と未完成項目を書く。

もう1人は以下を行う。

- 子コンポーネント側の修正を行う。
- データ生成、CSS、効果音、画像差し替えを担当する。
- 主担当のPRを確認し、動作確認を手伝う。

最終的な仕様判断、演出判断、マージ判断はPMが行う。

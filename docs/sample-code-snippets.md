# 実装用サンプルコード集

最終決定: @ly(らい) / PM
最終更新: 2026-07-20

## 1. 使い方

このファイルは理解の補助資料であり、完成仕様ではない。サンプルをそのまま貼り付けず、`game-rule.md`、`mende-kikakui-font-guide.md`、`sound-change-spec.md`、`implementation-spec.md`と現行コードへ合わせる。

## 2. 共有型

```ts
export type InternalCategory =
  | "color"
  | "quality"
  | "quantity"
  | "verb"
  | "humanNoun"
  | "animalNoun";

export type CandidateIndex = 1 | 2;
export type CipherId = `${InternalCategory}-${CandidateIndex}`;

export type GamePhase =
  | "opening"
  | "introDialogue"
  | "exampleDialogue"
  | "question"
  | "answering"
  | "answerFeedback"
  | "clearCutscene"
  | "gameOverCutscene"
  | "endTitle"
  | "result";

export type CipherToken = {
  id: string;
  cipherId: CipherId;
  glyphText: string;
  category: InternalCategory;
  correctJa: string;
};

export type ExampleRecord = {
  id: string;
  tokens: CipherToken[];
  translation: string;
};

export type SelectedAnswers = Partial<Record<string, string>>;
export type TokenJudgement = "correct" | "incorrect";

export type AnswerJudgement = {
  isCorrect: boolean;
  correctWordCount: number;
  totalWordCount: number;
  tokenResults: Record<string, TokenJudgement>;
};

export type ResultStatus = "clear" | "gameOver";
```

## 3. 設定値

```ts
export const GAME_CONFIG = {
  finalLevel: 8,
  safeMistakeCount: 1,
  timeLimitSeconds: 90,
  warningTimeSeconds: 15,
  examplesPerNotebookPage: 2,
  newAnimationHalfCycleMs: 900,
  answerFeedbackMs: 1400,
  openingBlinkMs: 2300,
  reducedMotionOpeningMs: 300,
  openingAssetTimeoutMs: 5000,
  animationFallbackBufferMs: 250,
  shotFlashMs: 100,
  gameOverTitleMs: 2300,
  gameClearTitleMs: 2400,
  reducedMotionEndTitleMs: 1500,
} as const;
```

90秒と15秒は変更可能な既定値。他の承認値もここからCSSカスタムプロパティへ渡し、重複定義しない。

## 4. Mendeフォント

### `src/app/fonts.ts`

```ts
import localFont from "next/font/local";

export const mendeCipherFont = localFont({
  src: "../assets/fonts/NotoSansMendeKikakui-Regular.woff2",
  display: "block",
  preload: true,
  variable: "--font-mende-cipher",
});
```

### `src/data/cipherGlyphs.ts`

```ts
import type {
  CandidateIndex,
  CipherId,
  InternalCategory,
} from "@/lib/gameTypes";

const CATEGORY_CODE_POINTS: Record<InternalCategory, number> = {
  color: 0x1e800,
  quality: 0x1e801,
  quantity: 0x1e802,
  verb: 0x1e803,
  humanNoun: 0x1e804,
  animalNoun: 0x1e805,
};

const CANDIDATE_CODE_POINTS: Record<CandidateIndex, number> = {
  1: 0x1e806,
  2: 0x1e807,
};

export function createGlyphText(
  category: InternalCategory,
  candidateIndex: CandidateIndex,
) {
  return String.fromCodePoint(
    CATEGORY_CODE_POINTS[category],
    CANDIDATE_CODE_POINTS[candidateIndex],
  );
}

export function createCipherId(
  category: InternalCategory,
  candidateIndex: CandidateIndex,
): CipherId {
  return `${category}-${candidateIndex}`;
}
```

### `CipherText.tsx`

```tsx
import type { ReactNode } from "react";
import styles from "./CipherText.module.css";

type CipherTextProps = {
  children: ReactNode;
  ariaLabel: string;
};

export function CipherText({ children, ariaLabel }: CipherTextProps) {
  return (
    <span
      className={styles.cipherWord}
      lang="men-Mend"
      dir="rtl"
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}
```

```css
.cipherSentence {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  direction: ltr;
}

.cipherWord {
  direction: rtl;
  unicode-bidi: isolate;
  font-family: var(--font-mende-cipher);
}
```

## 5. basePath付き素材

```ts
export function assetPath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
```

## 6. 効果音

```ts
import { assetPath } from "./assetPath";

export type SoundKey =
  | "dialogueNext"
  | "manTalk"
  | "writeNote"
  | "drawGun"
  | "gunShot"
  | "end"
  | "closeNote";

const SOUND_FILES: Record<SoundKey, string> = {
  dialogueNext: "/assets/sounds/dialogue-next.mp3",
  manTalk: "/assets/sounds/man-talk.mp3",
  writeNote: "/assets/sounds/write-note.mp3",
  drawGun: "/assets/sounds/draw-gun.mp3",
  gunShot: "/assets/sounds/gun-shot.mp3",
  end: "/assets/sounds/end.mp3",
  closeNote: "/assets/sounds/close-note.mp3",
};

export function playSound(key: SoundKey) {
  const audio = new Audio(assetPath(SOUND_FILES[key]));
  audio.volume = key === "closeNote" ? 0.7 : 0.8;
  void audio.play().catch(() => {});
}
```

## 7. 正誤判定

```ts
export function judgeAnswer(
  question: Question,
  selectedAnswers: SelectedAnswers,
): AnswerJudgement {
  const tokenResults = Object.fromEntries(
    question.tokens.map((token) => [
      token.id,
      selectedAnswers[token.id] === question.correctAnswers[token.id]
        ? "correct"
        : "incorrect",
    ]),
  ) as Record<string, TokenJudgement>;

  const correctWordCount = Object.values(tokenResults).filter(
    (result) => result === "correct",
  ).length;

  return {
    isCorrect: correctWordCount === question.tokens.length,
    correctWordCount,
    totalWordCount: question.tokens.length,
    tokenResults,
  };
}
```

## 8. 解答変更時の判定解除

```ts
function handleSelectAnswerWord(tokenId: string, value: string) {
  const previousValue = selectedAnswers[tokenId];

  setSelectedAnswers((previous) => ({
    ...previous,
    [tokenId]: value,
  }));

  if (previousValue !== value) {
    setAnswerJudgement(null);
  }
}
```

送信可能条件には`answerJudgement === null`と`gamePhase === "answering"`も含める。

## 9. 判定後遷移

```ts
useEffect(() => {
  if (gamePhase !== "answerFeedback" || answerJudgement === null) return;

  const timeoutId = window.setTimeout(() => {
    if (answerJudgement.isCorrect) {
      handleCorrectAnswer();
      return;
    }

    handleWrongAnswer();
  }, GAME_CONFIG.answerFeedbackMs);

  return () => window.clearTimeout(timeoutId);
}, [answerJudgement, gamePhase]);
```

継続可能な誤答では`selectedAnswers`と`answerJudgement`を消さずに`answering`へ戻す。

## 10. 例文専用手帳

```tsx
type NotebookProps = {
  isOpen: boolean;
  examples: ExampleRecord[];
  page: number;
  pageCount: number;
  examplesPerPage: number;
  newAnimationHalfCycleMs: number;
  showNew: boolean;
};

export function Notebook({
  isOpen,
  examples,
  page,
  pageCount,
  examplesPerPage,
  newAnimationHalfCycleMs,
  showNew,
}: NotebookProps) {
  if (!isOpen) {
    return showNew ? (
      <div
        className={styles.newNotice}
        style={{
          "--new-half-cycle": `${newAnimationHalfCycleMs}ms`,
        } as React.CSSProperties}
      >
        <span aria-hidden="true">↓</span>
        <span>NEW</span>
      </div>
    ) : null;
  }

  const start = page * examplesPerPage;
  const visibleExamples = examples.slice(start, start + examplesPerPage);

  return (
    <section className={styles.overlay} onClick={(event) => event.stopPropagation()}>
      <article className={styles.notebook}>
        <h2>手帳</h2>
        {visibleExamples.map((example) => (
          <div key={example.id}>
            <div className={styles.cipherSentence} dir="ltr">
              {example.tokens.map((token, index) => (
                <CipherText
                  key={token.id}
                  ariaLabel={`暗号単語${index + 1}`}
                >
                  {token.glyphText}
                </CipherText>
              ))}
            </div>
            <p>{example.translation}</p>
          </div>
        ))}
        <p>{page + 1} / {pageCount}</p>
      </article>
      <p>Spaceで閉じる / A・Dでページ移動</p>
    </section>
  );
}
```

手帳内に閉じるボタンを作らない。開閉とページstateは`GameScreen`が持つ。

## 11. 手帳操作

```ts
const pageCount = Math.max(
  1,
  Math.ceil(examples.length / GAME_CONFIG.examplesPerNotebookPage),
);

function openNotebook() {
  setNotebookPage(pageCount - 1);
  setIsNotebookOpen(true);
  setHasUnreadExamples(false);
}

function closeNotebook() {
  if (!isNotebookOpen) return;
  setIsNotebookOpen(false);
  playSound("closeNote");
}

function moveNotebookPage(direction: -1 | 1) {
  setNotebookPage((previous) =>
    Math.min(Math.max(previous + direction, 0), pageCount - 1),
  );
}
```

## 12. キーボード入力

```ts
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    const target = event.target;
    const isInteractiveTarget =
      target instanceof HTMLElement &&
      target.matches("button, input, select, textarea, [contenteditable='true']");

    if (isInteractiveTarget) return;

    if (event.code === "Space") {
      event.preventDefault();
      if (event.repeat || !canToggleNotebook(gamePhase)) return;
      isNotebookOpen ? closeNotebook() : openNotebook();
      return;
    }

    if (!isNotebookOpen) return;
    if (event.code === "KeyA") moveNotebookPage(-1);
    if (event.code === "KeyD") moveNotebookPage(1);
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [gamePhase, isNotebookOpen, pageCount]);
```

Tabを分岐へ追加せず、ブラウザ標準のフォーカス移動を維持する。

## 13. NEWの既読処理

```ts
function notifyNewExamples() {
  const latestPage = Math.max(
    0,
    Math.ceil(examples.length / GAME_CONFIG.examplesPerNotebookPage) - 1,
  );

  if (isNotebookOpen) {
    setNotebookPage(latestPage);
    setHasUnreadExamples(false);
    return;
  }

  setHasUnreadExamples(true);
}
```

## 14. タイマー

```ts
useEffect(() => {
  if (gamePhase !== "answering" || isNotebookOpen || timeLeft <= 0) return;

  const timeoutId = window.setTimeout(() => {
    setTimeLeft((previous) => Math.max(previous - 1, 0));
  }, 1000);

  return () => window.clearTimeout(timeoutId);
}, [gamePhase, isNotebookOpen, timeLeft]);
```

0になったら`isTimedOut`を`true`にするが、ゲームオーバーへ直接遷移しない。

## 15. 一度きりの演出完了

```ts
function createCompletionGuard(onComplete: () => void) {
  let completed = false;

  return () => {
    if (completed) return;
    completed = true;
    onComplete();
  };
}
```

実際のReact実装ではrefまたはstateを使い、`animationend`とフォールバックtimeoutが同じガードを共有する。cleanupでtimeoutを解除する。

## 16. 終了時刻

```ts
function captureEndedAt(judgedAt: number) {
  setEndedAt((previous) => previous ?? judgedAt);
}
```

`handleSubmitAnswer()`の判定直前に`judgedAt = Date.now()`を取得し、Lv8正解または終了条件となる誤答が確定した同じ送信処理内で呼ぶ。1400msの判定表示、発砲演出、終了タイトルでは更新しない。

## 17. ResultScreen

```tsx
type ResultScreenProps = {
  elapsedSeconds: number;
  correctCount: number;
  mistakeCount: number;
  onRetry: () => void;
};

export function ResultScreen({
  elapsedSeconds,
  correctCount,
  mistakeCount,
  onRetry,
}: ResultScreenProps) {
  return (
    <section onClick={(event) => event.stopPropagation()}>
      <h1>RESULT</h1>
      <p>経過時間: {formatTime(elapsedSeconds)}</p>
      <p>正解回数: {correctCount}</p>
      <p>失敗回数: {mistakeCount}</p>
      <button type="button" onClick={onRetry}>リトライ</button>
      <p>左クリックでリトライ</p>
    </section>
  );
}
```

画面全体の左クリックでも同じ`onRetry`へ接続し、二重実行を防ぐ。

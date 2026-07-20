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

export type NotebookSpread = {
  left: ExampleRecord[];
  right: ExampleRecord[];
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
export type FontStatus = "loading" | "ready" | "error";
export type AssetStatus = "loading" | "ready" | "error";

export type SoundKey =
  | "dialogueNext"
  | "manTalk"
  | "writeNote"
  | "drawGun"
  | "gunShot"
  | "end"
  | "closeNote"
  | "openNote"
  | "wrongAnswer";
```

## 3. 設定値

```ts
export const GAME_CONFIG = {
  finalLevel: 8,
  safeMistakeCount: 1,
  timeLimitSeconds: 90,
  warningTimeSeconds: 15,
  examplesPerNotebookSpread: 6,
  newAnimationHalfCycleMs: 900,
  answerFeedbackMs: 1400,
  openingBlinkMs: 2300,
  reducedMotionOpeningMs: 300,
  openingAssetTimeoutMs: 5000,
  animationFallbackBufferMs: 250,
  cutsceneStepMs: 1200,
  shotFlashMs: 100,
  gameOverTitleMs: 2300,
  gameClearTitleMs: 2400,
  reducedMotionEndTitleMs: 1500,
  openingAssetPaths: [] as readonly string[],
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
  adjustFontFallback: false,
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
  color: 0x1e865,
  quality: 0x1e822,
  quantity: 0x1e8a3,
  verb: 0x1e83d,
  humanNoun: 0x1e845,
  animalNoun: 0x1e83a,
};

const CANDIDATE_CODE_POINTS: Record<CandidateIndex, number> = {
  1: 0x1e854,
  2: 0x1e827,
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
import type { SoundKey } from "./gameTypes";

const SOUND_PATHS: Record<SoundKey, string> = {
  dialogueNext: assetPath("/assets/sounds/dialogue-next.mp3"),
  manTalk: assetPath("/assets/sounds/man-talk.mp3"),
  writeNote: assetPath("/assets/sounds/write-note.mp3"),
  drawGun: assetPath("/assets/sounds/draw-gun.mp3"),
  gunShot: assetPath("/assets/sounds/gun-shot.mp3"),
  end: assetPath("/assets/sounds/end.mp3"),
  closeNote: assetPath("/assets/sounds/close-note.mp3"),
  openNote: assetPath("/assets/sounds/open-note.mp3"),
  wrongAnswer: assetPath("/assets/sounds/wrong-answer.mp3"),
};

export function preloadSounds() {
  (Object.keys(SOUND_PATHS) as SoundKey[]).forEach((key) => {
    getAudioPool(key).forEach(({ audio }) => audio.load());
  });
}

export function playSound(key: SoundKey) {
  const pool = getAudioPool(key); // SoundKeyごとに3要素
  const entry =
    pool.find(({ audio, isPlaying }) => !isPlaying || audio.ended) ??
    pool.reduce((oldest, candidate) =>
      candidate.startedAt < oldest.startedAt ? candidate : oldest,
    );
  entry.isPlaying = true;
  entry.audio.pause();
  entry.audio.currentTime = 0;
  entry.startedAt = Date.now();
  void entry.audio.play().catch(() => {
    entry.isPlaying = false;
  });
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

送信handlerでは判定結果を保存する前に誤答音を1回だけ鳴らす。

```ts
const judgement = judgeAnswer(currentQuestion, selectedAnswers);

if (judgement.isCorrect) {
  const answeredQuestion: ExampleRecord = {
    id: `answered-${currentQuestion.id}`,
    tokens: currentQuestion.tokens,
    translation: currentQuestion.tokens
      .map((token) => selectedAnswers[token.id] ?? currentQuestion.correctAnswers[token.id])
      .join(" "),
  };

  setExamples((previous) =>
    previous.some((record) => record.id === answeredQuestion.id)
      ? previous
      : [...previous, answeredQuestion],
  );
} else {
  playSound("wrongAnswer");
}

setAnswerJudgement(judgement);
setGamePhase("answerFeedback");
```

正答履歴は通常例文と同じ形式で描画する。追加時に`hasUnreadExamples`と`writeNote`は変更しない。

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

## 10. 提示例文・正答履歴専用手帳

```tsx
type NotebookProps = {
  isOpen: boolean;
  spread: NotebookSpread;
  page: number;
  pageCount: number;
  newAnimationHalfCycleMs: number;
  showNew: boolean;
};

export function Notebook({
  isOpen,
  spread,
  page,
  pageCount,
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

  const visibleExamples = [...spread.left, ...spread.right];
  const isCompact =
    visibleExamples.length >= 5 ||
    visibleExamples.some((example) => example.tokens.length >= 5);

  return (
    <section className={styles.overlay} onClick={(event) => event.stopPropagation()}>
      <article
        className={`${styles.notebook} ${isCompact ? styles.compact : ""}`}
      >
        <h2>手帳</h2>
        <div className={styles.spread}>
          <NotebookPage examples={spread.left} side="left" />
          <NotebookPage examples={spread.right} side="right" />
        </div>
        <p>見開き {page + 1} / {pageCount}</p>
      </article>
      <p>Spaceで閉じる / A・Dで見開き移動</p>
    </section>
  );
}
```

手帳内に閉じるボタンを作らない。開閉と見開きstateは`GameScreen`が持つ。

```ts
export function buildNotebookSpreads(
  examples: ExampleRecord[],
  maxExamplesPerSpread: number,
): NotebookSpread[] {
  const capacity = Math.max(2, Math.floor(maxExamplesPerSpread));
  const leftPageCapacity = Math.ceil(capacity / 2);

  if (examples.length === 0) return [{ left: [], right: [] }];

  return Array.from(
    { length: Math.ceil(examples.length / capacity) },
    (_, spreadIndex) => {
      const start = spreadIndex * capacity;
      const spreadExamples = examples.slice(start, start + capacity);
      return {
        left: spreadExamples.slice(0, leftPageCapacity),
        right: spreadExamples.slice(leftPageCapacity),
      };
    },
  );
}
```

設定値6件では左3件、右3件を埋めてから次の見開きへ進み、後続追加で過去の見開きを再配分しない。

## 11. 手帳操作

```ts
const notebookSpreads = buildNotebookSpreads(
  examples,
  GAME_CONFIG.examplesPerNotebookSpread,
);
const pageCount = notebookSpreads.length;

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

    if (isInteractiveTarget || gamePhase !== "answering") return;

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
function enterAnswering() {
  const recordedIds = new Set(examples.map((example) => example.id));
  const newExamples = roundExamples.filter(
    (example) => !recordedIds.has(example.id),
  );

  if (newExamples.length > 0) {
    setExamples((previous) => [...previous, ...newExamples]);
    setHasUnreadExamples(true);
    playSound("writeNote");
  }

  setGamePhase("answering");
}
```

問題文をクリックした時だけ`enterAnswering()`を呼ぶ。例文会話中と問題提示中は履歴を更新せず、手帳操作も受け付けない。

## 14. タイマー

```ts
useEffect(() => {
  if (gamePhase !== "answering" || timeLeft <= 0) return;

  const timeoutId = window.setTimeout(() => {
    const nextTimeLeft = Math.max(timeLeft - 1, 0);
    setTimeLeft(nextTimeLeft);

    if (nextTimeLeft === 0) {
      startTerminalCutscene("gameOver", Date.now());
    }
  }, 1000);

  return () => window.clearTimeout(timeoutId);
}, [gamePhase, timeLeft]);
```

表示条件はカウント条件と分け、問題単独提示中はステータスを隠し、判定中は値を残す。

```tsx
const showAnswerDialog =
  (gamePhase === "answering" || gamePhase === "answerFeedback") &&
  currentQuestion !== null;

{showAnswerDialog ? (
  <TimerDisplay
    timeLeft={timeLeft}
    warningTime={GAME_CONFIG.warningTimeSeconds}
    mistakesRemaining={mistakesRemaining}
  />
) : null}
```

手帳の開閉を依存値へ含めないため、開閉しても進行中の1秒はリセットされない。手帳表示中に0になった場合も、同じタイマー処理で`endedAt`を保存して手帳を閉じ、誤答回数と誤答音を変更せずゲームオーバー演出へ進む。

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

`handleSubmitAnswer()`の判定直前に`judgedAt = Date.now()`を取得し、Lv8正解または終了条件となる誤答が確定した同じ送信処理内で呼ぶ。時間切れではタイマーコールバックの時刻を渡す。判定表示、発砲演出、終了タイトルでは更新しない。

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

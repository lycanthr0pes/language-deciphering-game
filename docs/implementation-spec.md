# 実装仕様書

担当: @かまぼこ(本物), @ほっそー  
最終決定: @ly(らい) / PM

## 1. 目的

一人称視点の暗号推理ゲームをNext.js / Reactで実装するための、ファイル構成、コンポーネント構成、props、state管理、クリック処理、正誤判定を定義する。

この仕様書は実装担当向けのたたき台であり、数値条件、演出内容、素材採用、最終的な仕様判断はPMが行う。

## 2. 実装方針

- Next.jsの1ページゲームとして実装する。
- サーバー処理、DB、高度なルーティングは扱わない。
- Reactの`useState`、`useEffect`、props、`onClick`、キーボード入力で進行を管理する。
- 画面全体の親コンポーネントは`GameScreen`とする。
- `GameScreen`がゲーム進行のstateを持ち、子コンポーネントへpropsで渡す。
- UI素材、画像、音声は`public/assets`配下に配置する。
- CSSはCSS Modulesを基本案とする。
- TypeScriptを基本案とする。

## 3. Next.jsのファイル構成

App Routerを使う前提の構成案とする。

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
      background-room.png
      man-normal.png
      man-draw-gun.png
      man-aim-player.png
      man-aim-self.png
      notebook.png
    sounds/
      dialogue-next.mp3
      man-talk.mp3
      write-note.mp3
      draw-gun.mp3
      gun-shot.mp3
    fonts/
      cipher-font.woff2
```

### 各ファイルの役割

| ファイル | 役割 |
| --- | --- |
| `src/app/page.tsx` | `GameScreen`を表示するページ |
| `GameScreen.tsx` | ゲーム全体の親コンポーネント、state管理、入力処理 |
| `DialogueBox.tsx` | 会話、暗号、日本語訳、操作案内を表示 |
| `ChoiceList.tsx` | 暗号単語、日本語単語リスト、解答ボタンを表示し、クリック選択を受け取る |
| `Notebook.tsx` | 手帳オーバーレイ、例文履歴、推測メモを表示 |
| `TimerDisplay.tsx` | 残り時間を表示し、警告時は赤文字にする |
| `CutsceneScreen.tsx` | 失敗演出、クリア演出の紙芝居表示 |
| `ResultScreen.tsx` | クリア時間、正解回数、失敗回数、リトライ案内を表示 |
| `gameTypes.ts` | 型定義をまとめる |
| `gameConfig.ts` | 制限時間、間違い可能回数、Lv8クリア条件などの定数 |
| `cipherGenerator.ts` | 暗号例文、問題、選択中トークン用の候補を生成する |
| `judgeAnswer.ts` | 正誤判定を行う |
| `sound.ts` | 効果音再生処理をまとめる |

## 4. 作成するコンポーネント

### 必須コンポーネント

| コンポーネント | 担当案 | 役割 |
| --- | --- | --- |
| `GameScreen` | @かまぼこ(本物) | ゲーム全体の進行管理 |
| `DialogueBox` | @かまぼこ(本物) | 会話文、暗号文、日本語訳の表示 |
| `ChoiceList` | @かまぼこ(本物) | 暗号単語クリック、日本語単語選択、解答ボタンのクリック処理 |
| `Notebook` | @ほっそー | 手帳の開閉、例文履歴、推測メモ |
| `TimerDisplay` | @ほっそー | 残り時間の表示 |
| `CutsceneScreen` | @ほっそー | 失敗演出、クリア演出 |
| `ResultScreen` | @かまぼこ(本物) | 結果表示、リトライ受付 |

### 補助ロジック

| ロジック | 担当案 | 役割 |
| --- | --- | --- |
| `cipherGenerator.ts` | @ほっそー | 暗号、例文、問題、選択肢の生成 |
| `judgeAnswer.ts` | @かまぼこ(本物) | 選択済み解答と正解の比較 |
| `sound.ts` | @ほっそー | 効果音の再生 |
| `gameConfig.ts` | @かまぼこ(本物) | PM決定値を定数化 |

### コンポーネント入出力一覧

Reactコンポーネントは、親からpropsを受け取り、画面にJSXを描画する。

クリックなどの操作結果は、戻り値として返すのではなく、propsで受け取ったcallback関数を呼んで親コンポーネントへ通知する。

| コンポーネント | 入力 | 親へ返す通知 | 描画するもの |
| --- | --- | --- | --- |
| `GameScreen` | なし | なし | ゲーム画面全体 |
| `DialogueBox` | `line`, `canAdvance`, `instruction`, `showNotebookHint` | `onNext()` | 会話文、暗号文、日本語訳、操作案内 |
| `ChoiceList` | `tokens`, `choices`, `selectedAnswers`, `activeTokenId`, `canSubmit`, `disabled` | `onSelectToken(tokenId)`, `onSelectWord(tokenId, value)`, `onSubmit()` | 暗号単語、選択中トークン用の日本語候補、選択済み日本語、`解答する`ボタン |
| `Notebook` | `isOpen`, `examples`, `noteMappings`, `mode`, `examplePage`, `memoPage`, `memoChoices`, `activeMemoCipherWord`, `showNew` | `onSelectMemoCipherWord(cipherWord)`, `onSelectMemoWord(cipherWord, value)`, `onClose()` | 例文メモ、推測メモ、中央単語リスト、NEW表示 |
| `TimerDisplay` | `timeLeft`, `warningTime`, `mistakesRemaining` | なし | 残り時間、間違い可能回数 |
| `CutsceneScreen` | `type`, `step` | なし | 失敗演出、クリア演出の紙芝居シーン |
| `ResultScreen` | `status`, `clearTimeSeconds`, `correctCount`, `mistakeCount` | `onRetry()` | リザルト、クリア時間、正解回数、失敗回数、リトライ案内 |

### stateを持つ場所

ゲーム進行に関わるstateは、原則として`GameScreen`が持つ。

子コンポーネントは、受け取ったpropsを表示し、クリックされたらcallbackで`GameScreen`へ通知する。

| state | 持つ場所 | 子コンポーネント側で持たない理由 |
| --- | --- | --- |
| `gamePhase` | `GameScreen` | 画面全体の表示切り替えに使うため |
| `dialogueLines`, `dialogueIndex` | `GameScreen` | 会話終了後に次フェーズへ進むため |
| `currentQuestion` | `GameScreen` | `DialogueBox`と`ChoiceList`の両方で使うため |
| `selectedAnswers`, `activeAnswerTokenId` | `GameScreen` | 正誤判定と解答UIの両方で使うため |
| `examples`, `noteMappings` | `GameScreen` | 問題が変わっても手帳内容を保持するため |
| `timeLeft`, `isTimedOut` | `GameScreen` | 時間切れ後の失敗判定に使うため |
| `correctCount`, `mistakeCount`, `mistakesRemaining` | `GameScreen` | リザルトとゲームオーバー判定で使うため |

### 各コンポーネントの責務

| コンポーネント | やること | やらないこと |
| --- | --- | --- |
| `DialogueBox` | 渡された会話行を色分けして表示する | 次の会話行を自分で決めない |
| `ChoiceList` | 暗号単語と日本語単語リストを表示し、クリックを通知する | 正誤判定をしない |
| `Notebook` | 例文メモ、推測メモ、単語リストを表示する | 問題画面の解答を変更しない |
| `TimerDisplay` | 残り時間と間違い可能回数を表示する | タイマーを減らさない |
| `CutsceneScreen` | 現在の演出シーンを表示する | 演出の進行タイミングを決めない |
| `ResultScreen` | 結果を表示し、リトライ操作を通知する | ゲーム状態を直接初期化しない |

## 5. 型定義

`src/lib/gameTypes.ts`にまとめる。

```ts
export type GamePhase =
  | "opening"
  | "introDialogue"
  | "exampleDialogue"
  | "question"
  | "answering"
  | "correctWait"
  | "clearCutscene"
  | "gameOverCutscene"
  | "result";

export type DialogueType = "normal" | "cipher" | "translation" | "answer";

export type Speaker = "narration" | "player" | "man";

export type InternalCategory =
  | "color"
  | "quality"
  | "quantity"
  | "verb"
  | "humanNoun"
  | "animalNoun";

export type CipherToken = {
  id: string;
  cipher: string;
  category: InternalCategory;
  correctJa: string;
};

export type DialogueLine = {
  id: string;
  speaker: Speaker;
  text: string;
  type: DialogueType;
};

export type ExampleRecord = {
  id: string;
  cipherText: string;
  translation: string;
  tokens: CipherToken[];
};

export type Question = {
  id: string;
  cipherText: string;
  tokens: CipherToken[];
  correctAnswers: Record<string, string>;
  choiceCandidatesByTokenId: Record<string, string[]>;
};

export type SelectedAnswers = Partial<Record<string, string>>;

export type NoteMappings = Partial<Record<string, string>>;

export type NotebookMode = "examples" | "memos";

export type ResultStatus = "clear" | "gameOver";
```

## 6. 設定値

`src/lib/gameConfig.ts`に定義する。

`finalLevel`と`safeMistakeCount`は`game-rule.md`の確定値とする。制限時間や演出待ち時間は初期案であり、PMが最終決定する。

```ts
export const GAME_CONFIG = {
  finalLevel: 8,
  safeMistakeCount: 1,
  timeLimitSeconds: 90,
  warningTimeSeconds: 15,
  correctWaitMs: 900,
  cutsceneStepMs: 1200,
} as const;
```

## 7. `page.tsx`

`page.tsx`ではゲーム画面を表示するだけにする。

```tsx
import { GameScreen } from "@/components/GameScreen";

export default function Page() {
  return <GameScreen />;
}
```

## 8. `GameScreen`

### 役割

`GameScreen`はゲーム全体の親コンポーネントとする。

以下を担当する。

- 現在のゲーム状態を管理する。
- 会話送りを管理する。
- 暗号例文と問題を生成する。
- 暗号単語クリック、日本語単語クリック時の解答状態を管理する。
- 正誤判定を呼び出す。
- タイマーを管理する。
- 手帳の開閉を管理する。
- 失敗演出、クリア演出、リザルトへの遷移を管理する。

### props定義

`GameScreen`は基本的にpropsなしでよい。

```ts
export type GameScreenProps = Record<string, never>;
```

将来的にデバッグ用の初期値が必要になった場合のみ、PM確認後にpropsを追加する。

### state定義

```ts
const [gamePhase, setGamePhase] = useState<GamePhase>("opening");
const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
const [dialogueIndex, setDialogueIndex] = useState(0);
const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
const [examples, setExamples] = useState<ExampleRecord[]>([]);
const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
const [activeAnswerTokenId, setActiveAnswerTokenId] = useState<string | null>(null);
const [noteMappings, setNoteMappings] = useState<NoteMappings>({});
const [correctCount, setCorrectCount] = useState(0);
const [mistakeCount, setMistakeCount] = useState(0);
const [mistakesRemaining, setMistakesRemaining] = useState(GAME_CONFIG.safeMistakeCount);
const [difficultyLevel, setDifficultyLevel] = useState(1);
const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.timeLimitSeconds);
const [isTimedOut, setIsTimedOut] = useState(false);
const [isNotebookOpen, setIsNotebookOpen] = useState(false);
const [notebookMode, setNotebookMode] = useState<NotebookMode>("examples");
const [notebookExamplePage, setNotebookExamplePage] = useState(0);
const [notebookMemoPage, setNotebookMemoPage] = useState(0);
const [activeMemoCipherWord, setActiveMemoCipherWord] = useState<string | null>(null);
const [showNotebookNew, setShowNotebookNew] = useState(false);
const [cutsceneStep, setCutsceneStep] = useState(0);
const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null);
const [startedAt, setStartedAt] = useState<number | null>(null);
const [endedAt, setEndedAt] = useState<number | null>(null);
```

### stateの意味

| state | 内容 |
| --- | --- |
| `gamePhase` | 現在の進行状態 |
| `dialogueLines` | 現在表示する会話配列 |
| `dialogueIndex` | 現在表示中の会話番号 |
| `currentQuestion` | 現在の問題データ |
| `examples` | 手帳に保存される例文履歴 |
| `selectedAnswers` | 暗号単語IDごとにプレイヤーが選んだ日本語 |
| `activeAnswerTokenId` | 現在、日本語を割り当てようとしている暗号単語ID |
| `noteMappings` | 手帳に書き留めた `暗号単語 → 日本語単語` の推測メモ |
| `correctCount` | 正解回数 |
| `mistakeCount` | 失敗回数 |
| `mistakesRemaining` | 間違い可能回数の残り表示 |
| `difficultyLevel` | 現在のレベル。Lv1からLv8まで順番に進む |
| `timeLeft` | 残り時間 |
| `isTimedOut` | 時間切れ後かどうか |
| `isNotebookOpen` | 手帳を開いているかどうか |
| `notebookMode` | 手帳の表示モード。例文メモか推測メモか |
| `notebookExamplePage` | 例文メモの現在ページ |
| `notebookMemoPage` | 推測メモの現在ページ |
| `activeMemoCipherWord` | 推測メモで日本語を割り当てようとしている暗号単語 |
| `showNotebookNew` | 手帳NEW表示を出すかどうか |
| `cutsceneStep` | 紙芝居演出の現在シーン |
| `resultStatus` | クリアかゲームオーバーか |
| `startedAt` | ゲーム開始時刻 |
| `endedAt` | 終了時刻 |

### 初期化処理

リトライ時も同じ初期化関数を使う。

```ts
function resetGame() {
  setGamePhase("opening");
  setDialogueLines([]);
  setDialogueIndex(0);
  setCurrentQuestion(null);
  setExamples([]);
  setSelectedAnswers({});
  setActiveAnswerTokenId(null);
  setNoteMappings({});
  setCorrectCount(0);
  setMistakeCount(0);
  setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
  setDifficultyLevel(1);
  setTimeLeft(GAME_CONFIG.timeLimitSeconds);
  setIsTimedOut(false);
  setIsNotebookOpen(false);
  setNotebookMode("examples");
  setNotebookExamplePage(0);
  setNotebookMemoPage(0);
  setActiveMemoCipherWord(null);
  setShowNotebookNew(false);
  setCutsceneStep(0);
  setResultStatus(null);
  setStartedAt(Date.now());
  setEndedAt(null);
}
```

## 9. `DialogueBox`

### 役割

会話文、暗号文、日本語訳、プレイヤーの解答表示を行う。

表示色は`line.type`で切り替える。

| `type` | 表示色 |
| --- | --- |
| `normal` | 白 |
| `cipher` | 赤 |
| `translation` | 青 |
| `answer` | 青 |

### props定義

```ts
import type { DialogueLine } from "@/lib/gameTypes";

export type DialogueBoxProps = {
  line: DialogueLine | null;
  canAdvance: boolean;
  instruction: string;
  showNotebookHint: boolean;
  onNext: () => void;
};
```

### 使用例

```tsx
<DialogueBox
  line={currentDialogueLine}
  canAdvance={canAdvanceDialogue}
  instruction="左クリックで進む"
  showNotebookHint={gamePhase !== "opening"}
  onNext={handleNextDialogue}
/>
```

### onClick処理

`DialogueBox`内をクリックした場合は`onNext`を呼ぶ。

```tsx
function handleClick() {
  if (!canAdvance) return;
  onNext();
}
```

ただし、選択肢や手帳をクリックしたときに会話送りが同時に発生しないよう、子要素側で`event.stopPropagation()`を使う。

## 10. `ChoiceList`

### 役割

問題中に、男が出題した暗号文、日本語単語リスト、`解答する`ボタンを表示する。

プレイヤーは暗号単語を左クリックして選択し、その後に日本語単語リストから対応する日本語を左クリックで選ぶ。

品詞ラベルはUIに表示しない。

日本語単語リストには、選択中の暗号単語に対応する内部カテゴリ内の候補だけを表示する。

### props定義

```ts
import type { CipherToken, SelectedAnswers } from "@/lib/gameTypes";

export type ChoiceListProps = {
  tokens: CipherToken[];
  // 選択中の暗号単語に対応する内部カテゴリ内の候補だけを渡す。
  choices: string[];
  selectedAnswers: SelectedAnswers;
  activeTokenId: string | null;
  canSubmit: boolean;
  disabled: boolean;
  onSelectToken: (tokenId: string) => void;
  onSelectWord: (tokenId: string, value: string) => void;
  onSubmit: () => void;
};
```

### 表示仕様

- 暗号文は暗号単語ごとにクリックできる見た目にする。
- 選択中の暗号単語は青い枠線、または青い発光で示す。
- 各暗号単語の下に、選択済みの日本語単語を青で表示する。
- 未選択の場合は`未選択`、空欄、または薄い横線を表示する。
- 日本語単語リストには、選択中の暗号単語に対応する内部カテゴリ内の候補だけを出す。
- 日本語単語リストには品詞見出しやカテゴリ見出しを出さない。
- 暗号単語が未選択の場合、日本語単語リストは空にするか「暗号単語を選んでください」と表示する。
- 全ての暗号単語に日本語が選ばれるまで、`解答する`ボタンは無効に見せる。
- 合否判定は単語選択時ではなく、`解答する`ボタンを押した時だけ行う。

### onClick処理

```tsx
function handleTokenClick(tokenId: string) {
  if (disabled) return;
  onSelectToken(tokenId);
}

function handleWordClick(value: string) {
  if (disabled || activeTokenId === null) return;
  onSelectWord(activeTokenId, value);
}

function handleSubmitClick() {
  if (disabled || !canSubmit) return;
  onSubmit();
}
```

`ChoiceList`内のクリックでは、画面全体の左クリック進行を発火させない。

```tsx
<div onClick={(event) => event.stopPropagation()}>
  {/* 暗号単語、日本語単語リスト、解答するボタン */}
</div>
```

## 11. `Notebook`

### 役割

手帳をオーバーレイ表示し、過去の例文とプレイヤーの推測メモを表示する。

### props定義

```ts
import type { ExampleRecord, NoteMappings, NotebookMode } from "@/lib/gameTypes";

export type NotebookProps = {
  isOpen: boolean;
  examples: ExampleRecord[];
  noteMappings: NoteMappings;
  mode: NotebookMode;
  examplePage: number;
  memoPage: number;
  memoChoices: string[];
  activeMemoCipherWord: string | null;
  showNew: boolean;
  onSelectMemoWord: (cipherWord: string, value: string) => void;
  onSelectMemoCipherWord: (cipherWord: string) => void;
  onClose: () => void;
};
```

### onClick処理

- 推測メモで暗号単語をクリックすると`onSelectMemoCipherWord(cipherWord)`を呼ぶ。
- 中央単語リストで日本語単語をクリックすると`onSelectMemoWord(cipherWord, value)`を呼ぶ。
- 閉じるボタンを置く場合は`onClose()`を呼ぶ。
- 手帳内クリックではゲーム画面側の左クリック進行を止める。

手帳内では品詞ラベルを表示しない。

推測メモは `暗号単語 → 推測した日本語単語` の対応表として表示する。

## 12. `TimerDisplay`

### 役割

画面右上に残り時間を表示する。

残り時間が警告ライン以下なら赤文字にする。

### props定義

```ts
export type TimerDisplayProps = {
  timeLeft: number;
  warningTime: number;
  mistakesRemaining: number;
};
```

### 表示仕様

```text
残り時間 01:20
間違い可能 1
```

## 13. `CutsceneScreen`

### 役割

失敗演出とクリア演出を紙芝居形式で表示する。

### props定義

```ts
export type CutsceneType = "clear" | "gameOver";

export type CutsceneScreenProps = {
  type: CutsceneType;
  step: number;
};
```

### シーン仕様

| type | step | 表示内容 |
| --- | --- | --- |
| `gameOver` | 0 | 男が銃を抜く |
| `gameOver` | 1 | 男が銃をこちらに向ける |
| `gameOver` | 2 | 発砲後に暗転 |
| `clear` | 0 | 男が銃を抜く |
| `clear` | 1 | 男が銃を自分に向ける |
| `clear` | 2 | 発砲後に暗転 |

## 14. `ResultScreen`

### 役割

終了後に結果を表示し、左クリックでリトライさせる。

### props定義

```ts
import type { ResultStatus } from "@/lib/gameTypes";

export type ResultScreenProps = {
  status: ResultStatus;
  clearTimeSeconds: number;
  correctCount: number;
  mistakeCount: number;
  onRetry: () => void;
};
```

## 15. 会話送り処理

### 対象操作

| 操作 | 処理 |
| --- | --- |
| 左クリック | 会話を次へ進める |
| リザルト中の左クリック | リトライ |

### `handleNextDialogue`

```ts
function handleNextDialogue() {
  if (!canAdvanceDialogue()) return;

  playSound("dialogueNext");

  const nextIndex = dialogueIndex + 1;

  if (nextIndex < dialogueLines.length) {
    setDialogueIndex(nextIndex);
    playManTalkIfNeeded(dialogueLines[nextIndex]);
    return;
  }

  moveToNextPhaseAfterDialogue();
}
```

男のセリフ行が表示された瞬間には、会話送り効果音とは別に男が喋る効果音を鳴らす。

```ts
function playManTalkIfNeeded(line: DialogueLine | undefined) {
  if (line?.speaker !== "man") return;

  playSound("manTalk");
}
```

### `canAdvanceDialogue`

```ts
function canAdvanceDialogue() {
  return (
    gamePhase === "introDialogue" ||
    gamePhase === "exampleDialogue" ||
    gamePhase === "question"
  );
}
```

## 16. キーボード入力

`GameScreen`で`keydown`を監視する。

UI仕様では、会話送りとリトライは左クリックを基本にする。

キーボードは手帳操作に使う。

```ts
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.code === "Space") {
      event.preventDefault();
      toggleNotebook();
    }

    if (!isNotebookOpen) return;

    if (event.key === "Tab") {
      event.preventDefault();
      toggleNotebookMode();
    }

    if (event.key === "a" || event.key === "A") {
      moveNotebookPage(-1);
    }

    if (event.key === "d" || event.key === "D") {
      moveNotebookPage(1);
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isNotebookOpen, notebookMode, notebookExamplePage, notebookMemoPage]);
```

実装時は依存配列で古いstateを参照しないよう注意する。

## 17. 未使用操作

UI仕様では、コンテキストメニュー操作は使わない。

手帳は`Space`で開閉する。

ブラウザ標準メニューを無理に制御する必要はない。

## 18. 左クリック処理

画面全体の左クリックは、会話送りまたはリトライに使う。

```tsx
function handleScreenClick() {
  if (gamePhase === "result") {
    resetGame();
    return;
  }

  handleNextDialogue();
}
```

選択肢、手帳、ボタンのクリックでは`event.stopPropagation()`を使い、画面全体クリックと競合しないようにする。

## 19. 暗号データ生成

### 方針

- 暗号と日本語の対応は、`game-rule.md`の内部カテゴリと候補1/候補2を基準に作る。
- ただし、画面上には品詞ラベルやカテゴリラベルを表示しない。
- ランダム生成はrender中に行わない。
- 新しい問題を作るタイミングで`cipherGenerator.ts`の関数を呼ぶ。
- Lv1からLv8へ進むほど、内部データ上の登場カテゴリ、例文数、暗号語数を増やす。

### `wordPools.ts`の例

```ts
import type { InternalCategory } from "@/lib/gameTypes";

export type WordEntry = {
  category: InternalCategory;
  ja: string;
  cipher: string;
  candidateIndex: 1 | 2;
};

export const WORD_POOLS: Record<InternalCategory, WordEntry[]> = {
  color: [
    { category: "color", ja: "赤い", cipher: "raka", candidateIndex: 1 },
    { category: "color", ja: "青い", cipher: "rami", candidateIndex: 2 },
  ],
  quality: [
    { category: "quality", ja: "大きな", cipher: "doka", candidateIndex: 1 },
    { category: "quality", ja: "小さな", cipher: "domi", candidateIndex: 2 },
  ],
  quantity: [
    { category: "quantity", ja: "いくつかの", cipher: "taka", candidateIndex: 1 },
    { category: "quantity", ja: "たくさんの", cipher: "tami", candidateIndex: 2 },
  ],
  verb: [
    { category: "verb", ja: "見る", cipher: "vika", candidateIndex: 1 },
    { category: "verb", ja: "追う", cipher: "vimi", candidateIndex: 2 },
  ],
  humanNoun: [
    { category: "humanNoun", ja: "男", cipher: "huka", candidateIndex: 1 },
    { category: "humanNoun", ja: "女", cipher: "humi", candidateIndex: 2 },
  ],
  animalNoun: [
    { category: "animalNoun", ja: "犬", cipher: "keka", candidateIndex: 1 },
    { category: "animalNoun", ja: "猫", cipher: "kemi", candidateIndex: 2 },
  ],
};
```

`raka`などの暗号表記は仮例とする。最終的な暗号表記はPM確認後に差し替える。

### 生成結果の形

```ts
export type GeneratedRound = {
  dialogueLines: DialogueLine[];
  examples: ExampleRecord[];
  question: Question;
};
```

## 20. 問題開始処理

新しい問題を開始するときは以下を行う。

1. `difficultyLevel`に応じて例文と問題を生成する。
2. 生成された例文を`examples`に追加する。
3. `dialogueLines`に暗号例文と日本語訳をセットする。
4. `currentQuestion`を更新する。
5. `selectedAnswers`を空にする。
6. `timeLeft`を初期値に戻す。
7. `isTimedOut`を`false`にする。
8. `showNotebookNew`を`false`にする。
9. `gamePhase`を`exampleDialogue`にする。

この時点ではまだ問題提示ではないため、NEW表示と書き留め効果音は出さない。NEW表示と書き留め効果音は、例文表示が終わり、問題文を表示する瞬間に発生させる。

```ts
function startRound(nextDifficulty: number) {
  const round = generateRound(nextDifficulty);

  setDialogueLines(round.dialogueLines);
  setDialogueIndex(0);
  setCurrentQuestion(round.question);
  setExamples((prev) => [...prev, ...round.examples]);
  setSelectedAnswers({});
  setActiveAnswerTokenId(null);
  setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
  setTimeLeft(GAME_CONFIG.timeLimitSeconds);
  setIsTimedOut(false);
  setShowNotebookNew(false);
  setGamePhase("exampleDialogue");
  playManTalkIfNeeded(round.dialogueLines[0]);
}
```

## 21. 解答UIのクリック処理

暗号単語をクリックすると、その暗号単語が選択中になる。

日本語単語をクリックすると、選択中の暗号単語に日本語を割り当てる。

この時点では正誤判定しない。

全ての暗号単語に日本語が割り当てられた後、`解答する`ボタンをクリックした時だけ正誤判定する。

### 暗号単語クリック

```ts
function handleSelectAnswerToken(tokenId: string) {
  if (!currentQuestion) return;
  if (gamePhase !== "answering") return;

  setActiveAnswerTokenId(tokenId);
}
```

### 選択中トークン用の候補取得

```ts
function getActiveAnswerChoices() {
  if (!currentQuestion || activeAnswerTokenId === null) return [];

  return currentQuestion.choiceCandidatesByTokenId[activeAnswerTokenId] ?? [];
}
```

### 日本語単語クリック

```ts
function handleSelectAnswerWord(tokenId: string, value: string) {
  if (!currentQuestion) return;
  if (gamePhase !== "answering") return;

  setSelectedAnswers((prev) => ({
    ...prev,
    [tokenId]: value,
  }));
}
```

### 解答ボタンクリック

```ts
function canSubmitAnswer() {
  if (!currentQuestion) return false;

  return currentQuestion.tokens.every((token) => selectedAnswers[token.id]);
}

function handleSubmitAnswer() {
  if (!currentQuestion) return;
  if (!canSubmitAnswer()) return;

  checkAnswer(selectedAnswers);
}
```

## 22. 正誤判定

### 判定方針

正解条件は、問題に出ている全ての暗号単語について、選択された日本語が`correctAnswers`と一致していること。

余計な値が`selectedAnswers`に入っていても、`question.tokens`に含まれる暗号単語だけで判定する。

### `judgeAnswer.ts`

```ts
import type { Question, SelectedAnswers } from "@/lib/gameTypes";

export function judgeAnswer(question: Question, selectedAnswers: SelectedAnswers) {
  return question.tokens.every((token) => {
    return selectedAnswers[token.id] === question.correctAnswers[token.id];
  });
}
```

### `checkAnswer`

```ts
function checkAnswer(nextAnswers: SelectedAnswers) {
  if (!currentQuestion) return;

  const isCorrect = judgeAnswer(currentQuestion, nextAnswers);

  if (isCorrect) {
    handleCorrectAnswer();
    return;
  }

  handleWrongAnswer();
}
```

## 23. 正解処理

正解した場合は正解回数を増やす。

Lv8で正解したらクリア演出へ進む。

満たしていない場合は少し待って次の問題へ進む。

```ts
function handleCorrectAnswer() {
  const nextCorrectCount = correctCount + 1;

  setCorrectCount(nextCorrectCount);
  setGamePhase("correctWait");

  if (difficultyLevel >= GAME_CONFIG.finalLevel) {
    window.setTimeout(() => {
      startClearCutscene();
    }, GAME_CONFIG.correctWaitMs);
    return;
  }

  window.setTimeout(() => {
    const nextDifficulty = difficultyLevel + 1;
    setDifficultyLevel(nextDifficulty);
    startRound(nextDifficulty);
  }, GAME_CONFIG.correctWaitMs);
}
```

## 24. 不正解処理

時間切れ後に1回間違えた場合は即ゲームオーバーにする。

時間切れ前の場合、間違い可能回数が残っていれば失敗回数を増やし、間違い可能回数を1減らす。

`間違い可能 0`の状態でさらに間違えたらゲームオーバーにする。

```ts
function handleWrongAnswer() {
  const nextMistakeCount = mistakeCount + 1;
  setMistakeCount(nextMistakeCount);

  if (isTimedOut) {
    startGameOverCutscene();
    return;
  }

  if (mistakesRemaining <= 0) {
    startGameOverCutscene();
    return;
  }

  setMistakesRemaining((prev) => Math.max(prev - 1, 0));

  setSelectedAnswers({});
  setActiveAnswerTokenId(null);
  setGamePhase("answering");
}
```

不正解時に赤く光らせる演出を入れる場合は、別途`wrongFlash`のようなstateを追加する。

## 25. タイマー処理

タイマーは`answering`中だけ減らす。

`timeLeft`が0になったら`isTimedOut`を`true`にする。

時間切れだけでは即ゲームオーバーにしない。

```ts
useEffect(() => {
  if (gamePhase !== "answering") return;
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

## 26. 手帳処理

### 開閉

```ts
function toggleNotebook() {
  setIsNotebookOpen((prev) => !prev);
  setShowNotebookNew(false);
}
```

### メモ切り替え

```ts
function toggleNotebookMode() {
  setNotebookMode((prev) => (prev === "examples" ? "memos" : "examples"));
}
```

### ページ移動

```ts
function moveNotebookPage(direction: -1 | 1) {
  if (notebookMode === "examples") {
    setNotebookExamplePage((prev) => Math.max(prev + direction, 0));
    return;
  }

  setNotebookMemoPage((prev) => Math.max(prev + direction, 0));
}
```

### 推測メモの選択

```ts
function handleSelectMemoWord(cipherWord: string, value: string) {
  setNoteMappings((prev) => ({
    ...prev,
    [cipherWord]: value,
  }));
}
```

手帳の推測メモは正誤判定には直接使わない。

実際の正誤判定は、問題画面で選んだ`selectedAnswers`だけを見る。

## 27. 進行状態の切り替え

### 導入開始

`opening`の演出が終わったら、導入会話をセットして`introDialogue`へ進む。

```ts
function startIntroDialogue() {
  setDialogueLines(INTRO_DIALOGUES);
  setDialogueIndex(0);
  setGamePhase("introDialogue");
}
```

### 会話終了後の遷移

```ts
function moveToNextPhaseAfterDialogue() {
  if (gamePhase === "introDialogue") {
    startRound(1);
    return;
  }

  if (gamePhase === "exampleDialogue") {
    const questionLines: DialogueLine[] = [
      {
        id: "question-line",
        speaker: "man",
        text: currentQuestion?.cipherText ?? "",
        type: "cipher",
      },
    ];

    setDialogueLines(questionLines);
    setDialogueIndex(0);
    setShowNotebookNew(true);
    setGamePhase("question");
    playSound("writeNote");
    playManTalkIfNeeded(questionLines[0]);
    return;
  }

  if (gamePhase === "question") {
    setGamePhase("answering");
  }
}
```

## 28. 演出処理

### 失敗演出

```ts
function startGameOverCutscene() {
  setResultStatus("gameOver");
  setCutsceneStep(0);
  setGamePhase("gameOverCutscene");
  playSound("drawGun");
}
```

### クリア演出

```ts
function startClearCutscene() {
  setResultStatus("clear");
  setCutsceneStep(0);
  setGamePhase("clearCutscene");
  playSound("drawGun");
}
```

### 紙芝居の進行

```ts
useEffect(() => {
  const isCutscene =
    gamePhase === "clearCutscene" || gamePhase === "gameOverCutscene";

  if (!isCutscene) return;

  const timerId = window.setTimeout(() => {
    if (cutsceneStep === 1) {
      playSound("gunShot");
    }

    if (cutsceneStep >= 2) {
      setEndedAt(Date.now());
      setGamePhase("result");
      return;
    }

    setCutsceneStep((prev) => prev + 1);
  }, GAME_CONFIG.cutsceneStepMs);

  return () => window.clearTimeout(timerId);
}, [gamePhase, cutsceneStep]);
```

## 29. 効果音処理

### 再生タイミング

| タイミング | sound key |
| --- | --- |
| 会話を送る | `dialogueNext` |
| 男が喋る | `manTalk` |
| 問題提示に切り替わる | `writeNote` |
| 銃を抜く | `drawGun` |
| 発砲 | `gunShot` |

### `sound.ts`

```ts
export type SoundKey =
  | "dialogueNext"
  | "manTalk"
  | "writeNote"
  | "drawGun"
  | "gunShot";

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

ブラウザ仕様により、ユーザー操作前の音声再生はブロックされる場合がある。

このゲームでは左クリックまたはSpaceキーなど、ユーザー操作後の再生を基本にする。

`manTalk`は、`speaker`が`"man"`の会話行が表示された瞬間に鳴らす。対象は暗号例文、対応する日本語訳、問題提示の行とする。導入文や地の文では鳴らさない。

`writeNote`は、例文が生成・保存された時点では鳴らさず、問題提示に切り替わり、手帳のNEW表示を出す瞬間に鳴らす。

## 30. リザルト計算

`startedAt`と`endedAt`からクリア時間を計算する。

```ts
const clearTimeSeconds =
  startedAt !== null && endedAt !== null
    ? Math.floor((endedAt - startedAt) / 1000)
    : 0;
```

ゲームオーバー時も、終了までにかかった時間として同じ値を表示する。

## 31. `GameScreen`の描画方針

```tsx
return (
  <main
    className={styles.screen}
    onClick={handleScreenClick}
  >
    <TimerDisplay
      timeLeft={timeLeft}
      warningTime={GAME_CONFIG.warningTimeSeconds}
      mistakesRemaining={mistakesRemaining}
    />

    {isCutscenePhase ? (
      <CutsceneScreen type={cutsceneType} step={cutsceneStep} />
    ) : null}

    {gamePhase !== "result" ? (
      <DialogueBox
        line={currentDialogueLine}
        canAdvance={canAdvanceDialogue()}
        instruction="左クリックで進む"
        showNotebookHint={true}
        onNext={handleNextDialogue}
      />
    ) : null}

    {gamePhase === "answering" && currentQuestion ? (
      <ChoiceList
        tokens={currentQuestion.tokens}
        choices={getActiveAnswerChoices()}
        selectedAnswers={selectedAnswers}
        activeTokenId={activeAnswerTokenId}
        canSubmit={canSubmitAnswer()}
        disabled={false}
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
      showNew={showNotebookNew}
      onSelectMemoWord={handleSelectMemoWord}
      onSelectMemoCipherWord={setActiveMemoCipherWord}
      onClose={() => setIsNotebookOpen(false)}
    />

    {gamePhase === "result" && resultStatus ? (
      <ResultScreen
        status={resultStatus}
        clearTimeSeconds={clearTimeSeconds}
        correctCount={correctCount}
        mistakeCount={mistakeCount}
        onRetry={resetGame}
      />
    ) : null}
  </main>
);
```

実装時は、`isCutscenePhase`、`cutsceneType`、`currentDialogueLine`、`memoChoices`を`GameScreen`内で計算する。

## 32. 担当分担案

### @かまぼこ(本物)

| 優先 | 作業 |
| --- | --- |
| 1 | Next.js初期構成、`page.tsx`、`GameScreen`作成 |
| 2 | `DialogueBox`作成 |
| 3 | 左クリックで会話送り |
| 4 | `ChoiceList`作成 |
| 5 | 暗号単語クリック、日本語単語クリック、`selectedAnswers`更新 |
| 6 | `judgeAnswer.ts`、正解、不正解、失敗回数の処理 |
| 7 | `ResultScreen`作成 |

### @ほっそー

| 優先 | 作業 |
| --- | --- |
| 1 | `gameTypes.ts`、`gameConfig.ts`整備 |
| 2 | `wordPools.ts`、`exampleTemplates.ts`作成 |
| 3 | `cipherGenerator.ts`作成 |
| 4 | `Notebook`作成 |
| 5 | Spaceで手帳開閉、Tabでメモ切替、A/Dでページ移動 |
| 6 | `TimerDisplay`、時間切れ処理 |
| 7 | `CutsceneScreen`、効果音再生処理 |

## 33. 実装順序

1. `GameScreen`だけで黒背景を表示する。
2. 導入会話を`DialogueBox`で表示する。
3. 左クリックで会話送りを実装する。
4. 暗号例文と日本語訳を表示する。
5. `ChoiceList`で選択肢を表示する。
6. 暗号単語クリック、日本語単語クリックで`selectedAnswers`を更新する。
7. 全暗号単語が選ばれたら`解答する`ボタンを有効にし、クリック時に正誤判定する。
8. 正解時に次の問題へ進む。
9. 不正解時に失敗回数を増やし、間違い可能回数を減らす。
10. タイマーと時間切れ後の分岐を入れる。
11. 手帳をSpaceで開閉し、Tabでメモ切替、A/Dでページ移動できるようにする。
12. 失敗演出、クリア演出を入れる。
13. リザルト画面とリトライを入れる。
14. 効果音と素材を差し替える。

## 34. 動作確認項目

実装担当はPull Request前に以下を確認する。

| 確認項目 | 期待結果 |
| --- | --- |
| `npm run dev` | ゲーム画面が表示される |
| 左クリック | 会話が進む |
| Spaceキー | 手帳が開閉する |
| 手帳表示中のTabキー | 例文メモと推測メモが切り替わる |
| 手帳表示中のA/Dキー | 手帳ページが移動する |
| 暗号単語クリック | 選択中の暗号単語が切り替わる |
| 日本語単語クリック | 選択中の暗号単語に日本語が入る |
| 解答するボタン | 全暗号単語が解答済みの時だけ正誤判定が実行される |
| 正解 | 正解回数が増え、次の問題へ進む |
| 不正解 | 失敗回数が増え、間違い可能回数が減る |
| 間違い可能0でさらに不正解 | 失敗演出へ進む |
| 時間切れ | `isTimedOut`が`true`になり、次の不正解で終了する |
| クリア条件到達 | クリア演出へ進む |
| リザルト | クリア時間、正解回数、失敗回数が表示される |
| リトライ | 初期状態から再開できる |

## 35. PM決定待ち項目

実装前、または仮値で実装後にPMが最終決定する。

| 項目 | 初期案 |
| --- | --- |
| クリア条件 | Lv8の問題に正解 |
| 間違い可能回数 | 各問題開始時1。0の状態でさらに間違えるとゲームオーバー |
| 制限時間 | 1問90秒 |
| 警告ライン | 残り15秒 |
| 出題レベル | `game-rule.md`のLv1からLv8 |
| 日本語語彙 | 色、性質、人系名詞、動物系名詞、数量、動詞の各2候補 |
| 選択肢数 | 選択中の暗号単語に対応する内部カテゴリ内の候補のみ |
| 暗号表現 | `raka`などは仮例。最終表記は未確定 |
| 会話表示 | 半透明の黒い会話ボックス |
| 手帳表示 | オーバーレイ形式 |
| 失敗演出 | 3シーン |
| クリア演出 | 3シーン |

## 36. 実装上の注意

- ランダム生成はrender中に行わない。
- state更新直後の値をそのまま参照しない。
- 暗号単語、日本語単語、手帳内のクリックと画面クリックが同時に発火しないようにする。
- 手帳の推測メモと問題画面の解答選択は別のstateにする。
- UI上では品詞ラベルを表示しない。
- 正誤判定は日本語単語選択時ではなく、`解答する`ボタン押下時だけ行う。
- 時間切れだけではゲームオーバーにしない。
- PM未決定の数値は`gameConfig.ts`に集約し、後から変更しやすくする。
- 画像や音声が未完成でも、仮の背景色、仮テキスト、仮SEなしで動く状態を先に作る。
- PRは会話、選択肢、手帳、タイマー、演出のように機能単位で分ける。

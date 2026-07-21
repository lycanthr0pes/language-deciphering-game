# 実装仕様書

担当: @かまぼこ(本物), @ほっそー
最終決定: @ly(らい) / PM
最終更新: 2026-07-21
ステータス: 仕様承認済み・実装未完了

## 1. 目的

一人称視点の暗号推理ゲームをNext.js 16.2.9、React 19.2.4、TypeScript、CSS Modulesで実装するための完成形を定義する。

Next.jsのAPI、規約、ファイル構成を変更する前に、`node_modules/next/dist/docs/`の該当ガイドを読む。暗号文字は`mende-kikakui-font-guide.md`を正とし、音の再生条件は`game-rule.md`、実装インターフェースは本書を正とする。

## 2. 実装方針

- App Routerの1ページゲームとし、DB、サーバー処理、高度なルーティングは使わない。
- `page.tsx`は`GameScreen`を表示するだけのServer Componentとする。
- ゲーム進行、タイマー、入力、判定後遷移、リトライに関わるstateは`GameScreen`へ集約する。
- 子コンポーネントはpropsを描画し、操作をcallbackで親へ通知する。
- 正誤判定とデータ生成は副作用のない関数へ分離する。
- コンポーネント固有スタイルはCSS Modulesへ置く。
- 静的出力と`basePath`付き授業サーバの両方で素材を読み込めるようにする。

## 3. ファイル構成

```text
src/
  app/
    fonts.ts
    globals.css
    layout.tsx
    page.tsx
  assets/
    fonts/
      NotoSansMendeKikakui-Regular.woff2
  components/
    GameScreen.tsx
    SceneCeilingLight.tsx
    DialogueBox.tsx
    ChoiceList.tsx
    CipherText.tsx
    Notebook.tsx
    TimerDisplay.tsx
    OpeningBlink.tsx
    CutsceneScreen.tsx
    EndTitleScreen.tsx
    ResultScreen.tsx
    *.module.css
  data/
    introDialogues.ts
    wordPools.ts
    exampleTemplates.ts
    cipherGlyphs.ts
  lib/
    assetPath.ts
    cipherGenerator.ts
    gameConfig.ts
    gameTypes.ts
    judgeAnswer.ts
    loadCipherFont.ts
    loadOpeningAssets.ts
    sound.ts
  utils/
    formatTime.ts
public/
  assets/
    images/
      masked-man-normal.png
      masked-man-draw.png
      masked-man-aim-player.png
      masked-man-aim-self.png
      scene-ceiling-light.svg
      desk-notebook-pen.png
      notebook-open-spread.png
    sounds/
      dialogue-next.mp3
      man-talk.mp3
      write-note.mp3
      draw-gun.mp3
      gun-shot.mp3
      end.mp3
      close-note.mp3
      open-note.mp3
      wrong-answer.mp3      # 素材未配置
  licenses/
    NotoSansMendeKikakui-OFL.txt
```

Figmaは配置、寸法、照明の正本とし、人物4差分、机・手帳・ペン、開いた見開き背景は`public/assets/images`の現行ファイルを実画像の正本とする。照明は`SceneCeilingLight`へ集約し、読込、開始、会話、問題、解答、判定、手帳、発砲、終了タイトル、リザルトの全場面へ同じ素材と配置で描画する。配置済み画像またはフォントファイルを読めない場合は別表記へフォールバックせず、読込エラーとして解答を停止する。

人物4差分は1254×1254の透過PNGとし、`masked-man-aim-self.png`のローポリゴン面、ほぼ黒のスーツ、暗いえんじ色を画風基準にする。通常、抜銃、プレイヤー照準の各PNGにも同じ色調を焼き込み、差分ごとのCSSフィルターは使用しない。`desk-notebook-pen.png`は1291×617の透過PNGとし、机、フクロウ、閉じた手帳、ペンを人物と同じ面構成と陰影に統一する。

## 4. 共有型

```ts
export type DialogueType = "normal" | "cipher" | "translation" | "answer";
export type Speaker = "narration" | "man";

export type DialogueLine = {
  id: string;
  text: string;
  type: DialogueType;
  speaker: Speaker;
};

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

export type InternalCategory =
  | "color"
  | "quality"
  | "quantity"
  | "verb"
  | "humanNoun"
  | "animalNoun";

export type CandidateIndex = 1 | 2;
export type CipherId = `${InternalCategory}-${CandidateIndex}`;

export type CipherGlyphEntry = {
  cipherId: CipherId;
  glyphText: string;
};

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

export type Question = {
  id: string;
  level: number;
  tokens: CipherToken[];
  correctAnswers: Record<string, string>;
  choiceCandidatesByTokenId: Record<string, string[]>;
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

暗号表示は`CipherToken.glyphText`から組み立てる。表示用全文を別の正本として重複保持しない。手帳の別モードやプレイヤー入力の対応表を表す型は作らない。

## 5. 設定値

```ts
const SCENE_ASSETS = {
  ceilingLight: "/assets/images/scene-ceiling-light.svg",
  maskedManNormal: "/assets/images/masked-man-normal.png",
  maskedManDraw: "/assets/images/masked-man-draw.png",
  maskedManAimPlayer: "/assets/images/masked-man-aim-player.png",
  maskedManAimSelf: "/assets/images/masked-man-aim-self.png",
  deskNotebookPen: "/assets/images/desk-notebook-pen.png",
  notebookOpenSpread: "/assets/images/notebook-open-spread.png",
} as const;

export const GAME_CONFIG = {
  finalLevel: 8,
  safeMistakeCount: 1,
  timeLimitSeconds: 90,
  warningTimeSeconds: 15,
  examplesPerNotebookSpread: 6,
  newAnimationHalfCycleMs: 900,
  answerFeedbackMs: 1400,
  wrongAnswerShakeMs: 320,
  openingBlinkMs: 2300,
  reducedMotionOpeningMs: 300,
  openingAssetTimeoutMs: 5000,
  animationFallbackBufferMs: 250,
  cutsceneStepMs: 1200,
  shotFlashMs: 100,
  gameOverTitleMs: 2300,
  gameClearTitleMs: 2400,
  reducedMotionEndTitleMs: 1500,
  sceneAssets: SCENE_ASSETS,
  openingAssetPaths: Object.values(SCENE_ASSETS) as readonly string[],
} as const;
```

- 90秒と15秒は変更可能な既定値とする。
- アニメーション時間をCSSへ重複記述せず、CSSカスタムプロパティで渡す。
- 正式な進行完了は`animationend`で通知し、設定値はフォールバックタイマーにも使う。

## 6. コンポーネント責務

| コンポーネント | 責務 | 持たない責務 |
| --- | --- | --- |
| `GameScreen` | state、入力、データ生成、遷移、効果音の開始 | 子UI固有の見た目 |
| `SceneCeilingLight` | Figma node `13:66`由来の照明SVGと共通配置 | 場面固有の暗転、フラッシュ、進行 |
| `DialogueBox` | 通常会話、例文、問題単独提示の中央揃え本文・色・操作案内・`next→` / `answer→`。話者名と括弧は描画しない | 次の会話行の決定、解答UI、発話主体の表示 |
| `CipherText` | Mende文字、RTL、分離、読み上げラベル | 日本語の意味や判定 |
| `ChoiceList` | 透明な解答UIコンテナ内に、問題文とトークン直下の解答枠だけを持つ大枠、個別候補、操作案内、正答数、送信ボタンを分けて描画し、誤答時は大枠だけを揺らす | 正誤判定、誤答回数更新 |
| `Notebook` | 見出しなしの左右見開き、提示例文・正答履歴、見開き画像外の操作案内 | 閉じる操作、NEW通知、別タブ、推理入力 |
| `NotebookIndicator` | `answering`中の表示専用手帳アイコンとNEW通知 | 手帳の開閉、未読stateの更新 |
| `TimerDisplay` | 残り時間、警告、間違い可能回数 | カウント処理 |
| `OpeningBlink` | CSSまばたきと完了通知 | ゲーム開始処理 |
| `CutsceneScreen` | 発砲までの人物差分とフラッシュ | 終了種別の決定 |
| `EndTitleScreen` | 終了タイトルと完了通知 | リザルト計算 |
| `ResultScreen` | 経過時間、回数、リトライ案内 | 全stateの初期化 |

## 7. 主要props

```ts
export type DialogueBoxProps = {
  line: DialogueLine;
  instruction: string;
  actionCue: "next→" | "answer→";
};

export type ChoiceListProps = {
  tokens: CipherToken[];
  choices: string[];
  selectedAnswers: SelectedAnswers;
  activeTokenId: string | null;
  instruction: string;
  canSubmit: boolean;
  disabled: boolean;
  judgement: AnswerJudgement | null;
  clearedJudgementTokenIds: ReadonlySet<string>;
  wrongShakeSequence: number;
  onSelectToken: (tokenId: string) => void;
  onSelectWord: (tokenId: string, value: string) => void;
  onSubmit: () => void;
};

export type NotebookProps = {
  isOpen: boolean;
  spread: NotebookSpread;
  page: number;
  pageCount: number;
};

export type NotebookIndicatorProps = {
  newAnimationHalfCycleMs: number;
  showNew: boolean;
};

export type OpeningBlinkProps = {
  reducedMotion: boolean;
  onComplete: () => void;
};

export type EndTitleScreenProps = {
  status: ResultStatus;
  reducedMotion: boolean;
  onComplete: () => void;
};

export type ResultScreenProps = {
  status: ResultStatus;
  elapsedSeconds: number;
  correctCount: number;
  mistakeCount: number;
  onRetry: () => void;
};
```

`GameScreen`は`question`までは`DialogueBox`で問題を単独表示する。`DialogueBox`は`line.speaker`にかかわらず本文だけを横方向の中央揃えで描画し、話者名と括弧を付けない。クリック操作案内は会話枠のDOMと視覚領域から分離して枠外の中央下へ置く。`answering`と`answerFeedback`では`DialogueBox`を描画せず、`ChoiceList`へ問題文と解答UIをまとめて渡す。`ChoiceList`の外側は枠と背景を持たない`解答UI`グループとし、内側の`問題と解答欄`グループだけへ半透明黒の背景と枠を付ける。日本語候補、解答ボタン、操作案内、`正答 n / N`は内側グループの外へ置く。`showTimer`はこの解答UIと同じ表示条件にし、判定中も値を表示したままタイマー更新だけを止める。`Notebook`へ閉じるcallbackを渡さず、手帳の開閉は`GameScreen`がSpace入力から行う。

1920×1080では、通常会話枠を`x=96, y=824, w=1728, h=144`へ置く。解答時の外側コンテナは`x=96, y=608, w=1728, h=440`、判定時は`x=96, y=590, w=1728, h=458`とする。解答時の内側パネルは上部約190pxを使い、トークン列を相対`x=106, y=22, w=1510, h=166`、候補を`y=214`、送信ボタンを`y=296`、案内を`y=390`へ置く。判定時は正答数を内側パネル上へ置き、候補を`y=250`、送信ボタンを`y=326`、案内を`y=414`へ置く。狭幅ではこのDOM順を維持した縦フローへ切り替え、必要な時だけ外側コンテナをスクロールさせる。

会話枠外の中央下へ操作案内、枠内の右下へ会話送りの`next→`または問題単独提示から解答受付へ入る`answer→`を分離して描画する。解答受付中に`ChoiceList`へ渡す操作案内は`Spaceで手帳を開く`だけとする。

## 8. GameScreenのstate

```ts
const [gamePhase, setGamePhase] = useState<GamePhase>("opening");
const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
const [dialogueIndex, setDialogueIndex] = useState(0);
const [currentLevel, setCurrentLevel] = useState(1);
const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
const [roundExamples, setRoundExamples] = useState<ExampleRecord[]>([]);
const [examples, setExamples] = useState<ExampleRecord[]>([]);
const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
const [activeAnswerTokenId, setActiveAnswerTokenId] = useState<string | null>(null);
const [answerJudgement, setAnswerJudgement] = useState<AnswerJudgement | null>(null);
const [clearedJudgementTokenIds, setClearedJudgementTokenIds] = useState<ReadonlySet<string>>(new Set());
const [wrongShakeSequence, setWrongShakeSequence] = useState(0);
const [correctCount, setCorrectCount] = useState(0);
const [mistakeCount, setMistakeCount] = useState(0);
const [mistakesRemaining, setMistakesRemaining] = useState(1);
const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.timeLimitSeconds);
const [isNotebookOpen, setIsNotebookOpen] = useState(false);
const [notebookPage, setNotebookPage] = useState(0);
const [hasUnreadExamples, setHasUnreadExamples] = useState(false);
const [fontStatus, setFontStatus] = useState<FontStatus>("loading");
const [openingAssetStatus, setOpeningAssetStatus] = useState<AssetStatus>("loading");
const [cutsceneStep, setCutsceneStep] = useState(0);
const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null);
const [startedAt, setStartedAt] = useState<number | null>(null);
const [endedAt, setEndedAt] = useState<number | null>(null);
const terminalTransitionStartedRef = useRef(false);
```

前の値に依存する更新には関数形式のsetterを使う。問題と例文はラウンド開始時に一度生成してstateへ保存し、render中に生成しない。

## 9. 初期化

`resetGame()`は全stateを初期値へ戻し、開始時刻を保存して`opening`へ進む。

```ts
function resetGame() {
  terminalTransitionStartedRef.current = false;
  setGamePhase("opening");
  setDialogueLines([]);
  setDialogueIndex(0);
  setCurrentLevel(1);
  setCurrentQuestion(null);
  setExamples([]);
  setSelectedAnswers({});
  setActiveAnswerTokenId(null);
  setAnswerJudgement(null);
  setCorrectCount(0);
  setMistakeCount(0);
  setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
  setTimeLeft(GAME_CONFIG.timeLimitSeconds);
  setIsNotebookOpen(false);
  setNotebookPage(0);
  setHasUnreadExamples(false);
  setCutsceneStep(0);
  setResultStatus(null);
  setStartedAt(Date.now());
  setEndedAt(null);
}
```

フォント読込stateとクリティカル画像の読込stateは、再試行方法に合わせて初期化する。現行の画風統一済み人物4差分、机画像、開いた見開き背景をすべて読み込み、5000ms以内に完了しない場合は素材エラーへ進む。

## 10. Mendeフォント

### 読込

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

- `layout.tsx`の`html`へ`lang="ja"`と`mendeCipherFont.variable`を付ける。
- 手動の`@font-face`を定義しない。
- アプリからGoogle Fontsへ実行時通信しない。
- `document.fonts.load()`で実際のcomputed font-familyと必須8文字を読み込み、1件以上のFontFaceが返った時だけ`ready`とする。
- ビルド前チェックでWOFF2のcmapに承認済みの8コードポイントがあることを確認する。
- `ready`まで暗号を描画しない。`error`では`暗号フォントを読み込めません`と再読み込み案内を表示し、解答を停止する。

### 文字データ

```ts
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
```

### 表示

```tsx
export function CipherText({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <span lang="men-Mend" dir="rtl" aria-label={ariaLabel}>
      {children}
    </span>
  );
}
```

暗号文コンテナは`direction: ltr`、単語は`direction: rtl`と`unicode-bidi: isolate`を指定する。React配列順は日本語の正解語順と一致させる。

## 11. ラウンド開始

`startRound(level)`は次を1回だけ行う。

1. レベル定義から新しい例文と問題を生成する。
2. 追加例文を未提示のラウンドデータとして保持する。
3. 問題、解答state、判定stateを初期化する。
4. `mistakesRemaining`を1、時間を90秒へ戻す。
5. 追加例文の会話行を設定し、`exampleDialogue`へ進む。

例文会話中は現在レベルの例文を`roundExamples`へ保持し、手帳履歴にはまだ追加しない。例文会話終了後に問題会話を表示する。問題行を左クリックして`answering`へ入る瞬間に、`roundExamples`をIDで重複排除して履歴へ一括追加し、追加がある場合だけ`hasUnreadExamples`を`true`にして書き留め音を1回鳴らす。

## 12. 会話送り

- `introDialogue`、`exampleDialogue`、`question`だけで左クリック進行を受け付ける。
- 手帳、判定、演出、リザルト中は会話を進めない。
- 会話送り時に`dialogueNext`を鳴らす。
- `speaker === "man"`の行を表示した時に`manTalk`を鳴らす。
- `speaker`は音の分岐にだけ使い、`DialogueBox`へ話者名や括弧を描画させない。
- 最後の行ではフェーズ別の次処理を呼ぶ。

## 13. 解答選択

- 暗号トークン選択では`activeAnswerTokenId`だけを更新し、判定しない。
- 候補は`choiceCandidatesByTokenId[activeAnswerTokenId]`から取得する。
- 日本語選択時は`selectedAnswers`をイミュータブルに更新する。
- 前回判定後に値が実際に変わった場合は、そのトークンIDだけ`clearedJudgementTokenIds`へ追加する。`answerJudgement`自体は残し、未変更欄の色分けと直前の正答数を維持する。
- 全トークンに値があり、操作可能な時だけ送信できる。判定結果が残っていても再送信できる。
- 選択肢、トークン、解答ボタンでは`stopPropagation()`し、背景の会話送りを発火させない。
- 候補ごとに独立した`button`を使い、候補群には共通の大枠を付けない。各候補は150×54px相当、`#111`背景、`#666`の2px枠、4px角丸、20px相当の文字とし、ホバー・フォーカス・無効状態は枠色と明度で示す。

## 14. 正誤判定

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

送信時は`judgedAt = Date.now()`を取得して判定する。Lv8の全問正答、またはゲームオーバー条件を満たす誤答なら、この送信処理内で未設定の`endedAt`へ`judgedAt`を保存する。時間切れは送信処理を通さず、タイマーが0になったコールバック内で時刻を保存する。回答結果は`answerJudgement`へ保存し、正答だけ`answerFeedback`へ進む。継続可能な誤答は`answering`を維持し、終了条件となる誤答は`gameOverCutscene`へ直行する。`ChoiceList`は`answering`と正答の`answerFeedback`で解答UIを描画し、`answerFeedback`中だけ`disabled`にする。誤答アニメーション用の`dialogRef`は内側の問題・解答パネルを参照し、候補、送信ボタン、案内を揺らさない。`TimerDisplay`も両フェーズで描画するが、カウント処理は`answering`だけで動かす。`aria-live="polite"`で正答数を通知する。

## 15. 判定後遷移

全問正答では1400msのtimeoutを設定し、cleanupで解除する。継続可能な誤答と終了条件となる誤答ではtimeoutを作らない。

### 全問正答

- 現在の問題トークンと、トークン順に並べた送信済み日本語解答から`ExampleRecord`を作る。IDは`answered-${question.id}`とし、関数形式のsetter内で既存IDを確認して履歴末尾へ1回だけ追加する。
- 正答履歴の追加では`hasUnreadExamples`を変更せず、`writeNote`も鳴らさない。通常例文と同じく、発話者名と括弧を付けず暗号文と日本語訳だけを描画する。
- `correctCount`を1増やす。
- Lv1〜Lv7なら次レベルへ進み、ラウンドを開始する。
- Lv8なら`resultStatus`を`clear`にし、送信時に保存済みの`endedAt`を変更せず`clearCutscene`へ進む。

### 誤答

- `mistakeCount`を1増やす。
- 判定前の`mistakesRemaining`が0なら、`wrongShakeSequence`を増やさず、`startTerminalCutscene("gameOver", judgedAt)`で判定表示を挟まず`gameOverCutscene`へ進む。
- 継続可能なら`mistakesRemaining`を1減らし、選択と色分けを保持したまま`answering`を続ける。タイマーと操作は即時再開し、同じ解答も再送信できる。
- 継続可能な1回目の誤答だけ`wrongShakeSequence`を増やす。`ChoiceList`は連番の変更時に左右約10px、減衰付き320msのCSSアニメーションを発火し、終了条件となる2回目は揺らさない。モーション低減時は動かさない。

## 16. タイマー

- `answering`中は、手帳の開閉状態に関係なく1秒ごとに減らす。手帳開閉をeffectの依存値へ含めず、開閉で進行中の1秒をリセットしない。
- `answerFeedback`、会話、開始・終了演出、リザルト中は減らさない。
- 残り1秒のtimeoutコールバックで0へ更新すると同時に`endedAt`を保存し、`mistakeCount`と誤答音を変更せず`gameOverCutscene`へ進む。
- 手帳表示中に0になった場合も`startTerminalCutscene()`で手帳を閉じ、同じ失敗演出へ一度だけ進む。
- `terminalTransitionStartedRef`で時間切れ、誤答終了、クリアの終端演出を多重開始しない。
- timeoutは`useEffect`のcleanupで解除する。

## 17. 手帳とNEW

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
```

- ゲームステージへ`user-select: none`と`-webkit-user-select: none`を設定し、左クリックやドラッグで文字を範囲選択させない。
- `Space`は編集可能要素を除き、全フェーズで`keydown`と`keyup`の既定動作を抑止する。フォーカス中のボタンは`blur()`して押下と選択表示を発生させない。そのうえで`answering`中だけ、開いていれば`closeNotebook()`、閉じていれば`openNotebook()`を呼ぶ。
- `A` / `D`は手帳が開いている時だけ見開きを範囲内で更新する。
- `Tab`と`Enter`は処理せず、既定のフォーカス移動とボタン操作を維持する。
- キーボード処理は`answering`中だけ有効にし、導入、例文、問題提示、判定中は手帳を開かない。
- `question`から`answering`へ入る時に現在レベルの例文を一括追加し、新規追加がある場合だけ未読にする。
- 正答時は問題と送信済み解答を通常例文と同じ`ExampleRecord`として無通知で追加する。誤答と時間切れでは追加しない。
- `buildNotebookSpreads()`は履歴を時系列順に6件ずつ固定分割し、各見開きの先頭3件を左、残り3件を右へ置く。過去の見開きを後続追加で再配分しない。
- 1920×1080では左ページ枠を`x=330`、右ページ枠を`x=974`へ置いて見開き画像の紙面中央へ合わせる。各620px相当のページ枠内で、560px相当の履歴要素を30px相当の左右余白で中央揃えにする。
- `手帳`の見出しは描画しない。履歴にも話者名と括弧を付けず、暗号文と日本語訳だけを紙色の半透明背景付きで描画する。ページ内は3行グリッドを維持し、履歴背景の高さだけを内容に合わせて翻訳下の空白を作らない。
- ページ番号は`a/b`だけとし、暗色の背景付き、最大24px相当で見開き画像の上側にあるオーバーレイ余白へ描画する。縮小画面では画像と重ならないよう文字と内側余白を縮小する。`Spaceで閉じる`と`A / Dでページを移動`はページ数に関係なく同じ案内コンテナ内へ横並びで描画し、見開き画像の下側余白へ置く。狭幅時だけ各案内を分割せず行単位で折り返す。
- 暗号文と日本語訳は通常表示で従来より大きく、太く表示する。5〜6件表示または5単語例文を含む見開きは収まる範囲のコンパクト文字サイズへ切り替え、スクロールなしで表示する。
- `NotebookIndicator`は`answering`かつ手帳を閉じている時だけ、時間表示直下へ表示する。インラインSVGの手帳アイコンは表示専用とし、クリック処理を持たせない。
- 未読時はアイコン上の矢印なし`NEW`だけを`transform`で動かし、モーション低減時は停止する。`answerFeedback`と手帳表示中はインジケーターを描画しない。

## 18. 開始演出

- 初期`GamePhase`はNavigation Timingと`sessionStorage`から決定する。新規タブの初回だけ`opening`、同一タブのブラウザ再読込または開始演出を表示済みの再マウントでは`introDialogue`とし、素材読込後に全面暗転を再マウントしない。ゲーム内の`resetGame()`は明示的に`opening`へ戻す。
- 画風統一済みの人物4差分、机・手帳・ペン、開いた見開き背景と、node `13:66`由来の照明SVGを画像で表示し、部屋だけCSSで補完する。照明SVGは粒状フィルターを適用せず、形状と縦グラデーションを維持する。照明は`SceneCeilingLight`を使い、1920×1080基準のnode枠`x=612, y=-112.5, w=696, h=1020`と、枠内の左右7.4%・上1.78%・下25%インセットを使う。画像は`object-fit: fill`で枠に合わせる。
- 人物画像はFigmaの横位置とサイズを維持し、縦位置だけを基準より28px上げる。1920×1080では通常人物を`x=636, y=0, w=648, h=648`、発砲時の3差分を`x=600, y=-48, w=720, h=720`へ配置する。
- 対象パスを`assetPath()`で解決し、すべての読込完了後に`OpeningBlink`をマウントする。
- 設定済み画像が5000ms以内に読めない場合、`ゲーム素材を読み込めません`と再読み込み案内を表示する。
- `OpeningBlink`は上まぶた、下まぶた、暗転レイヤーをCSSで描く。
- 最外要素の完了通知専用アニメーションだけを監視し、`onComplete()`を1回だけ呼ぶ。
- `animationend`不達時は演出時間+250msのフォールバックを同じ完了ガードへ接続する。
- 通常2300ms、モーション低減300msとする。
- 完了後に導入会話を初期化して`introDialogue`へ進む。

## 19. 発砲演出と終了タイトル

- `clearCutscene`と`gameOverCutscene`で`CutsceneScreen`を表示する。
- `CutsceneScreen`と`EndTitleScreen`でも通常進行と同じ`SceneCeilingLight`を描画する。まばたき、発砲フラッシュ、発砲直後の暗転が一時的に照明を覆うことは演出として許容する。
- 銃を抜く時に`drawGun`、発砲時に`gunShot`を鳴らす。
- 発砲フラッシュは最大100msとする。
- Figmaの状態名・タイミング注釈と発砲内容の説明字幕は、`CutsceneScreen`の画面へ描画しない。
- 暗転完了後に`endTitle`へ進み、同時に`end`を1回だけ鳴らす。
- `EndTitleScreen`は結果に応じて`GAME CLEAR`または`GAME OVER`を描画する。
- 通常時はクリア2400ms、失敗2300ms、モーション低減時は1500msとする。
- 最外要素の完了通知と演出時間+250msのフォールバックを同じ完了ガードへ接続する。
- 完了後は`endedAt`を変更せず、`result`へ1回だけ進む。

## 20. 音声と素材パス

```ts
import type { SoundKey } from "./gameTypes";

export function assetPath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
```

`SOUND_PATHS`は`/assets/...`を直接`Audio`へ渡さず、`assetPath()`で解決する。`preloadSounds()`は全SoundKeyを3要素ずつ生成して`load()`し、ゲーム起動を待たせない。`playSound()`は空き要素を優先し、すべて再生中なら開始時刻が最も古い要素を停止して先頭から再生する。`load()`と`play()`の失敗はcatchし、ゲーム進行を止めない。再描画する`useEffect`ではなく、状態遷移を開始するイベントから各音を1回だけ再生する。

- `openNote`はSpaceで手帳を開いた時と、A/Dで見開き番号が変わった時だけ鳴らす。
- `wrongAnswer`は`handleSubmitAnswer()`で`judgement.isCorrect === false`が確定した直後に鳴らし、継続可能／終了条件のどちらの誤答でも1送信につき1回とする。時間切れでは鳴らさない。
- `wrong-answer.mp3`は`public/assets/sounds`へ配置する。未配置中は実音確認未完了として扱う。

## 21. リザルト

```ts
const elapsedSeconds =
  startedAt !== null && endedAt !== null
    ? Math.floor((endedAt - startedAt) / 1000)
    : 0;
```

- 経過時間、正解回数、失敗回数を表示する。
- 背景は`#020202`で不透明にし、共通の`SceneCeilingLight`だけを表示する。背面の人物、机、手帳、ビネットは隠し、リザルト固有の照明CSSや別素材は持たない。
- `endedAt`は終了条件の判定確定時または時間切れ確定後に変更せず、判定表示、発砲、終了タイトルの時間を含めない。時間切れは失敗回数へ加算しない。
- 左クリックで`resetGame()`を呼ぶ。
- リトライ時は開始演出から再開する。

## 22. 入力可否

| 状態 | 左クリック | Space | A / D | Tab |
| --- | --- | --- | --- | --- |
| `opening` | 無効 | 無効 | 無効 | 標準動作 |
| `introDialogue` / `exampleDialogue` | 会話送り | 無効 | 無効 | 標準動作 |
| `question` | 解答受付へ進む | 無効 | 無効 | 標準動作 |
| `answering` | 解答UI | 手帳開閉 | 手帳中のみ | 標準動作 |
| `answerFeedback` | 無効 | 無効 | 無効 | 標準動作 |
| cutscene / `endTitle` | 無効 | 無効 | 無効 | 標準動作 |
| `result` | リトライ | 無効 | 無効 | 標準動作 |

編集可能要素へフォーカス中はゲーム用キー入力を処理しない。キーボードlistenerは1つにまとめ、依存値を正しく指定してcleanupする。

## 23. 動作確認

- 導入、各レベルの例文、問題、解答がLv1〜Lv8の順で進む。
- 提示例文10件と正答履歴最大8件が時系列順に保持され、各見開きが左3件、右3件の順で埋まる。
- SpaceとA/Dが動き、Tabはブラウザ標準動作を保つ。
- 問題文のクリック後に例文が一括追加され、NEWが出て、最初の手帳表示で消える。
- 正答時だけ問題と解答が重複なく追加され、その追加ではNEWと書き留め音が発生しない。
- 導入、例文、問題単独提示中はステータスを表示せず、問題文クリック後に内外を分けた解答UIとステータスが同時に表示される。
- 解答中と判定中は問題文が二重表示されず、各Mende単語と直下の解答枠だけが大枠内にあり、候補、送信ボタン、操作案内、判定数は大枠外に表示される。
- 会話と問題では話者名と括弧が表示されず、通常会話枠は1920×1080基準の`y=824`へ配置される。日本語候補は共通の大枠を持たず、各候補が`#111`背景の独立した枠になる。
- 手帳に見出しがなく、操作案内が見開き画像外の下側余白に表示される。
- 判定中も残り時間と間違い可能回数を表示したまま、カウントと解答操作だけが止まる。
- Mende文字が全画面で同じ対応になり、単語順と内部方向が正しい。
- 未回答送信と判定中操作ができない。継続可能な誤答後は同一解答も再送信できる。
- 継続可能な1回目の誤答だけ問題・解答パネルが320ms揺れ、パネル外の候補、ボタン、案内は揺れない。2回目は揺れと判定表示なしでゲームオーバー演出へ進む。単語別結果は可視ラベルなしの緑・赤だけで表示され、モーション低減時は揺らさない。
- 1回目と2回目の誤答、時間切れ即終了が正しく分岐する。
- 手帳表示中もタイマーが進み、0秒で手帳を閉じて失敗演出へ進む。
- 開始演出、両発砲演出、両終了タイトル、リザルト、リトライが1回ずつ遷移する。
- 同一タブのブラウザ再読込では開始暗転を省略し、ゲーム内リトライでは開始演出を再生する。
- モーション低減、フォント・素材エラー、`basePath`付き配信で成立する。
- listener、timeout、音声が多重登録・多重再生されない。

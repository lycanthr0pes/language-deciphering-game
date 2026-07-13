# コメント付きサンプルコード集

担当: @かまぼこ(本物), @ほっそー  
最終決定: @ly(らい) / PM

## 1. 目的

このドキュメントは、一人称視点の暗号推理ゲームで使うサンプルコードを、初心者が各行の意味を追えるようにコメント付きでまとめたものである。

JSXは同じ行に`//`コメントを書くと壊れやすいため、JSX部分では各コード行の直前に`{/* コメント */}`を置く。

このファイルのコードは学習用である。実装へコピーする場合は、JSXの外側に置いた説明コメントを減らし、必要に応じてReact Fragmentで囲んでから使う。

実装時は、コメントを必要に応じて減らしてよい。

## 2. `src/lib/gameTypes.ts`

```ts
// ゲームの進行状態として使える文字列を定義する。
export type GamePhase =
  // 導入会話を表示している状態。
  | "introDialogue"
  // 暗号例文を表示している状態。
  | "exampleDialogue"
  // 男が問題文を提示している状態。
  | "question"
  // プレイヤーが解答を選んでいる状態。
  | "answering"
  // クリア演出を表示している状態。
  | "clearCutscene"
  // ゲームオーバー演出を表示している状態。
  | "gameOverCutscene"
  // リザルト画面を表示している状態。
  | "result";

// 会話行の表示種類を定義する。
export type DialogueType = "normal" | "cipher" | "translation" | "answer";

// 会話を誰が話しているかを定義する。
export type Speaker = "narration" | "man" | "player";

// 暗号単語を内部で分類するカテゴリを定義する。
export type InternalCategory = "color" | "quality" | "quantity" | "verb" | "humanNoun" | "animalNoun";

// 会話1行分のデータ形を定義する。
export type DialogueLine = {
  // Reactのkeyや管理用に使うID。
  id: string;
  // 話者を表す。
  speaker: Speaker;
  // 実際に画面へ表示する文章。
  text: string;
  // 白、赤、青のどれで表示するか決める種類。
  type: DialogueType;
};

// 問題文に含まれる暗号単語1つ分のデータ形を定義する。
export type CipherToken = {
  // 暗号単語を識別するID。
  id: string;
  // 画面に表示する暗号単語。
  cipher: string;
  // 内部カテゴリ。画面には表示しない。
  category: InternalCategory;
  // この暗号単語の正しい日本語。
  correctJa: string;
};

// 問題データの形を定義する。
export type Question = {
  // 問題を識別するID。
  id: string;
  // 男が提示する暗号文全体。
  cipherText: string;
  // 暗号文を単語ごとに分けた配列。
  tokens: CipherToken[];
  // token IDごとの正解日本語。
  correctAnswers: Record<string, string>;
  // token IDごとの日本語候補リスト。
  choiceCandidatesByTokenId: Record<string, string[]>;
};

// 手帳に保存する例文データの形を定義する。
export type ExampleRecord = {
  // 例文を識別するID。
  id: string;
  // 暗号文。
  cipherText: string;
  // 日本語訳。
  translation: string;
  // 例文内の暗号単語データ。
  tokens: CipherToken[];
};

// 問題画面で選んだ解答を保存する形を定義する。
export type SelectedAnswers = Partial<Record<string, string>>;

// 手帳の推測メモを保存する形を定義する。
export type NoteMappings = Partial<Record<string, string>>;

// 手帳の表示モードを定義する。
export type NotebookMode = "examples" | "memos";

// リザルトがクリアかゲームオーバーかを定義する。
export type ResultStatus = "clear" | "gameOver";
```

## 3. `src/lib/gameConfig.ts`

```ts
// ゲーム内で使う設定値を1か所にまとめる。
export const GAME_CONFIG = {
  // 何レベル目を最後にするか。
  finalLevel: 8,
  // 何回まで間違えてもセーフにするか。
  safeMistakeCount: 1,
  // 1問あたりの制限時間を秒で指定する。
  timeLimitSeconds: 90,
  // 残り何秒からタイマーを赤くするか。
  warningTimeSeconds: 15,
  // 紙芝居演出の1シーンあたりの表示時間。
  cutsceneStepMs: 1200,
// 設定値を読み取り専用に近い扱いにする。
} as const;
```

## 4. `src/lib/judgeAnswer.ts`

```ts
// Question型とSelectedAnswers型を読み込む。
import type { Question, SelectedAnswers } from "@/lib/gameTypes";

// プレイヤーの解答が正しいか判定する関数を定義する。
export function judgeAnswer(question: Question, selectedAnswers: SelectedAnswers) {
  // 全ての暗号単語が正解しているか確認する。
  return question.tokens.every((token) => {
    // 選択した日本語と正解日本語が一致しているかを返す。
    return selectedAnswers[token.id] === question.correctAnswers[token.id];
  // everyの処理を閉じる。
  });
// 関数を閉じる。
}
```

## 5. `src/utils/formatTime.ts`

```ts
// 秒数を01:20のような表示に変換する関数を定義する。
export function formatTime(seconds: number) {
  // 分を計算する。
  const minutes = Math.floor(seconds / 60);
  // 秒の余りを計算する。
  const restSeconds = seconds % 60;

  // 分と秒を2桁にそろえて文字列として返す。
  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
// 関数を閉じる。
}
```

## 補足: `src/lib/sound.ts`

```ts
// 再生する効果音の種類を定義する。
export type SoundKey = "dialogueNext" | "manTalk" | "writeNote" | "drawGun" | "gunShot";

// 効果音のファイルパスをまとめる。
const SOUND_PATHS: Record<SoundKey, string> = {
  dialogueNext: "/assets/sounds/dialogue-next.mp3",
  manTalk: "/assets/sounds/man-talk.mp3",
  writeNote: "/assets/sounds/write-note.mp3",
  drawGun: "/assets/sounds/draw-gun.mp3",
  gunShot: "/assets/sounds/gun-shot.mp3",
};

// 指定された効果音を再生する。
export function playSound(key: SoundKey) {
  const audio = new Audio(SOUND_PATHS[key]);
  audio.volume = 0.8;
  void audio.play();
}
```

## 6. `src/data/introDialogues.ts`

```ts
// DialogueLine型を読み込む。
import type { DialogueLine } from "@/lib/gameTypes";

// 導入会話の配列を定義する。
export const INTRO_DIALOGUES: DialogueLine[] = [
  // 1行目の導入文を定義する。
  { id: "intro-1", speaker: "narration", text: "ここは・・・？", type: "normal" },
  // 2行目の導入文を定義する。
  { id: "intro-2", speaker: "narration", text: "目を覚ますと、知らない場所にいた。", type: "normal" },
  // 3行目の導入文を定義する。
  { id: "intro-3", speaker: "narration", text: "どうやら、椅子に縛られて動けないようだ。", type: "normal" },
  // 4行目の導入文を定義する。
  { id: "intro-4", speaker: "narration", text: "目の前の机には手帳とペンが置いてあり、その奥には仮面を付けた男が座っている。", type: "normal" },
  // 5行目の導入文を定義する。
  { id: "intro-5", speaker: "narration", text: "男が話しかけてきた・・・", type: "normal" },
// 配列を閉じる。
];
```

## 7. `src/data/sampleRound.ts`

```ts
// 会話、例文、問題の型を読み込む。
import type { CipherToken, DialogueLine, ExampleRecord, Question } from "@/lib/gameTypes";

// サンプル問題で使う暗号単語を定義する。
const tokens: CipherToken[] = [
  // 1つ目の暗号単語を定義する。
  { id: "token-1", cipher: "rami", category: "color", correctJa: "青い" },
  // 2つ目の暗号単語を定義する。
  { id: "token-2", cipher: "humi", category: "humanNoun", correctJa: "女" },
// 配列を閉じる。
];

// 暗号例文として表示する会話行を定義する。
export const SAMPLE_EXAMPLE_LINES: DialogueLine[] = [
  // 暗号文を赤で表示する行。
  { id: "ex-1-cipher", speaker: "man", text: "raka huka", type: "cipher" },
  // 日本語訳を青で表示する行。
  { id: "ex-1-ja", speaker: "man", text: "赤い 男", type: "translation" },
  // 暗号文を赤で表示する行。
  { id: "ex-2-cipher", speaker: "man", text: "rami huka", type: "cipher" },
  // 日本語訳を青で表示する行。
  { id: "ex-2-ja", speaker: "man", text: "青い 男", type: "translation" },
  // 暗号文を赤で表示する行。
  { id: "ex-3-cipher", speaker: "man", text: "raka humi", type: "cipher" },
  // 日本語訳を青で表示する行。
  { id: "ex-3-ja", speaker: "man", text: "赤い 女", type: "translation" },
// 配列を閉じる。
];

// 手帳に保存する例文データを定義する。
export const SAMPLE_EXAMPLES: ExampleRecord[] = [
  // 例文1件分のデータを定義する。
  { id: "example-1", cipherText: "raka huka", translation: "赤い 男", tokens: [
    { id: "ex-1-token-1", cipher: "raka", category: "color", correctJa: "赤い" },
    { id: "ex-1-token-2", cipher: "huka", category: "humanNoun", correctJa: "男" },
  ] },
  // 例文1件分のデータを定義する。
  { id: "example-2", cipherText: "rami huka", translation: "青い 男", tokens: [
    { id: "ex-2-token-1", cipher: "rami", category: "color", correctJa: "青い" },
    { id: "ex-2-token-2", cipher: "huka", category: "humanNoun", correctJa: "男" },
  ] },
  // 例文1件分のデータを定義する。
  { id: "example-3", cipherText: "raka humi", translation: "赤い 女", tokens: [
    { id: "ex-3-token-1", cipher: "raka", category: "color", correctJa: "赤い" },
    { id: "ex-3-token-2", cipher: "humi", category: "humanNoun", correctJa: "女" },
  ] },
// 配列を閉じる。
];

// サンプル問題を定義する。
export const SAMPLE_QUESTION: Question = {
  // 問題IDを定義する。
  id: "question-1",
  // 男が提示する暗号文を定義する。
  cipherText: "rami humi",
  // 問題に含まれる暗号単語を指定する。
  tokens,
  // token IDごとの正解を定義する。
  correctAnswers: {
    // token-1の正解を定義する。
    "token-1": "青い",
    // token-2の正解を定義する。
    "token-2": "女",
  // 正解オブジェクトを閉じる。
  },
  // token IDごとの日本語候補リストを定義する。
  choiceCandidatesByTokenId: {
    // token-1を選んだ時は色の候補だけを出す。
    "token-1": ["赤い", "青い"],
    // token-2を選んだ時は人系名詞の候補だけを出す。
    "token-2": ["男", "女"],
  // 候補オブジェクトを閉じる。
  },
// 問題オブジェクトを閉じる。
};
```

## 8. `src/app/page.tsx`

```tsx
// GameScreenコンポーネントを読み込む。
import { GameScreen } from "@/components/GameScreen";

// Next.jsのトップページを定義する。
export default function Page() {
  // ゲーム画面全体を表示する。
  return <GameScreen />;
// Page関数を閉じる。
}
```

## 9. `src/components/DialogueBox.tsx`

```tsx
// DialogueLine型を読み込む。
import type { DialogueLine } from "@/lib/gameTypes";
// このコンポーネント用のCSSを読み込む。
import styles from "./DialogueBox.module.css";

// DialogueBoxが親から受け取るpropsを定義する。
type DialogueBoxProps = {
  // 表示する会話行を受け取る。
  line: DialogueLine | null;
  // 操作案内の文字列を受け取る。
  instruction: string;
  // 会話を次へ進める関数を受け取る。
  onNext: () => void;
// props定義を閉じる。
};

// DialogueBoxコンポーネントを定義する。
export function DialogueBox({ line, instruction, onNext }: DialogueBoxProps) {
  // 表示する会話行がない場合は何も表示しない。
  if (!line) return null;

  // 会話ボックスのJSXを返す。
  return (
    {/* 会話ボックス全体をクリックすると会話を進める。 */}
    <section className={styles.box} onClick={onNext}>
      {/* 会話の種類に応じて色を切り替えて本文を表示する。 */}
      <p className={`${styles.text} ${styles[line.type]}`}>{line.text}</p>
      {/* 操作案内を表示する。 */}
      <p className={styles.instruction}>{instruction}</p>
    {/* 会話ボックスを閉じる。 */}
    </section>
  // returnを閉じる。
  );
// コンポーネントを閉じる。
}
```

## 10. `src/components/ChoiceList.tsx`

```tsx
// 暗号単語と解答状態の型を読み込む。
import type { CipherToken, SelectedAnswers } from "@/lib/gameTypes";
// このコンポーネント用のCSSを読み込む。
import styles from "./ChoiceList.module.css";

// ChoiceListが親から受け取るpropsを定義する。
type ChoiceListProps = {
  // 問題文に含まれる暗号単語一覧を受け取る。
  tokens: CipherToken[];
  // 選択中の暗号単語に対応する日本語候補だけを受け取る。
  choices: string[];
  // 暗号単語IDごとの選択済み日本語を受け取る。
  selectedAnswers: SelectedAnswers;
  // 現在選択中の暗号単語IDを受け取る。
  activeTokenId: string | null;
  // 解答ボタンを押せるかどうかを受け取る。
  canSubmit: boolean;
  // 暗号単語がクリックされたことを親へ通知する関数を受け取る。
  onSelectToken: (tokenId: string) => void;
  // 日本語単語がクリックされたことを親へ通知する関数を受け取る。
  onSelectWord: (tokenId: string, value: string) => void;
  // 解答ボタンがクリックされたことを親へ通知する関数を受け取る。
  onSubmit: () => void;
// props定義を閉じる。
};

// ChoiceListコンポーネントを定義する。
export function ChoiceList({ tokens, choices, selectedAnswers, activeTokenId, canSubmit, onSelectToken, onSelectWord, onSubmit }: ChoiceListProps) {
  // 解答UIのJSXを返す。
  return (
    {/* 解答UI内のクリックが画面全体クリックに伝わらないようにする。 */}
    <section className={styles.list} onClick={(event) => event.stopPropagation()}>
      {/* 暗号単語を並べる領域を作る。 */}
      <div className={styles.tokens}>
        {/* 暗号単語の数だけボタンを作る。 */}
        {tokens.map((token) => {
          // この暗号単語が現在選択中か判定する。
          const isActive = activeTokenId === token.id;
          // この暗号単語に選ばれている日本語を取得する。
          const answer = selectedAnswers[token.id];

          // 暗号単語ボタンを返す。
          return (
            {/* 暗号単語ボタンを表示する。 */}
            <button key={token.id} className={isActive ? styles.activeToken : styles.token} type="button" onClick={() => onSelectToken(token.id)}>
              {/* 暗号単語を赤で表示する。 */}
              <span className={styles.cipher}>{token.cipher}</span>
              {/* 選択済み日本語または未選択表示を青で表示する。 */}
              <span className={styles.answer}>{answer ?? "未選択"}</span>
            {/* 暗号単語ボタンを閉じる。 */}
            </button>
          // returnを閉じる。
          );
        // mapの処理を閉じる。
        })}
      {/* 暗号単語領域を閉じる。 */}
      </div>

      {/* 日本語単語リストを表示する領域を作る。 */}
      <div className={styles.words}>
        {/* 日本語単語の数だけボタンを作る。 */}
        {choices.map((choice) => (
          {/* 日本語単語ボタンを表示する。 */}
          <button key={choice} className={styles.wordButton} type="button" disabled={activeTokenId === null} onClick={() => activeTokenId !== null && onSelectWord(activeTokenId, choice)}>
            {/* 日本語単語を表示する。 */}
            {choice}
          {/* 日本語単語ボタンを閉じる。 */}
          </button>
        // mapの処理を閉じる。
        ))}
      {/* 日本語単語リスト領域を閉じる。 */}
      </div>

      {/* 解答するボタンを表示する。 */}
      <button className={canSubmit ? styles.submitButton : styles.disabledSubmitButton} type="button" disabled={!canSubmit} onClick={onSubmit}>
        {/* ボタンの文字を表示する。 */}
        解答する
      {/* 解答するボタンを閉じる。 */}
      </button>
    {/* 解答UI全体を閉じる。 */}
    </section>
  // returnを閉じる。
  );
// コンポーネントを閉じる。
}
```

## 11. `src/components/TimerDisplay.tsx`

```tsx
// 秒数を表示用の文字列に変換する関数を読み込む。
import { formatTime } from "@/utils/formatTime";
// このコンポーネント用のCSSを読み込む。
import styles from "./TimerDisplay.module.css";

// TimerDisplayが親から受け取るpropsを定義する。
type TimerDisplayProps = {
  // 残り時間を秒で受け取る。
  timeLeft: number;
  // 警告表示に切り替える秒数を受け取る。
  warningTime: number;
  // 間違い可能回数を受け取る。
  mistakesRemaining: number;
// props定義を閉じる。
};

// TimerDisplayコンポーネントを定義する。
export function TimerDisplay({ timeLeft, warningTime, mistakesRemaining }: TimerDisplayProps) {
  // 残り時間が警告ライン以下か判定する。
  const isWarning = timeLeft <= warningTime;
  // 間違い可能回数が0以下か判定する。
  const isDanger = mistakesRemaining <= 0;

  // タイマー表示のJSXを返す。
  return (
    {/* タイマー全体を表示する。 */}
    <div className={styles.timer}>
      {/* 残り時間を表示する。 */}
      <p className={isWarning ? styles.warning : styles.normal}>残り時間 {formatTime(timeLeft)}</p>
      {/* 間違い可能回数を表示する。 */}
      <p className={isDanger ? styles.warning : styles.subText}>間違い可能 {mistakesRemaining}</p>
    {/* タイマー全体を閉じる。 */}
    </div>
  // returnを閉じる。
  );
// コンポーネントを閉じる。
}
```

## 12. `src/components/Notebook.tsx`

```tsx
// 手帳で使う型を読み込む。
import type { ExampleRecord, NoteMappings, NotebookMode } from "@/lib/gameTypes";
// このコンポーネント用のCSSを読み込む。
import styles from "./Notebook.module.css";

// Notebookが親から受け取るpropsを定義する。
type NotebookProps = {
  // 手帳が開いているかを受け取る。
  isOpen: boolean;
  // 手帳に記録された例文一覧を受け取る。
  examples: ExampleRecord[];
  // 暗号単語から日本語への推測メモを受け取る。
  noteMappings: NoteMappings;
  // 例文メモと推測メモのどちらを表示するか受け取る。
  mode: NotebookMode;
  // 推測メモで選べる日本語単語一覧を受け取る。
  memoChoices: string[];
  // 推測メモで現在選択中の暗号単語を受け取る。
  activeMemoCipherWord: string | null;
  // NEW表示を出すかどうかを受け取る。
  showNew: boolean;
  // 推測メモの暗号単語クリックを親へ通知する関数を受け取る。
  onSelectMemoCipherWord: (cipherWord: string) => void;
  // 推測メモの日本語単語クリックを親へ通知する関数を受け取る。
  onSelectMemoWord: (cipherWord: string, value: string) => void;
  // 手帳を閉じる操作を親へ通知する関数を受け取る。
  onClose: () => void;
// props定義を閉じる。
};

// Notebookコンポーネントを定義する。
export function Notebook({ isOpen, examples, noteMappings, mode, memoChoices, activeMemoCipherWord, showNew, onSelectMemoCipherWord, onSelectMemoWord, onClose }: NotebookProps) {
  // 手帳が閉じていてNEW表示が必要な場合だけNEWを表示する。
  if (!isOpen) return showNew ? <div className={styles.newBadge}>NEW ↓</div> : null;

  // 例文に出てきた暗号単語を重複なしで集める。
  const cipherWords = Array.from(new Set(examples.flatMap((example) => example.tokens.map((token) => token.cipher))));

  // 手帳のJSXを返す。
  return (
    {/* 手帳内クリックが画面全体クリックに伝わらないようにする。 */}
    <section className={styles.overlay} onClick={(event) => event.stopPropagation()}>
      {/* 手帳本体を表示する。 */}
      <div className={styles.notebook}>
        {/* 手帳を閉じるボタンを表示する。 */}
        <button className={styles.closeButton} type="button" onClick={onClose}>閉じる</button>

        {/* 例文メモと推測メモを切り替えて表示する。 */}
        {mode === "examples" ? (
          {/* 例文メモを表示する。 */}
          <div>
            {/* 例文メモの見出しを表示する。 */}
            <h2>手帳: 例文メモ</h2>
            {/* 保存済み例文を1つずつ表示する。 */}
            {examples.map((example) => (
              {/* 例文1件分を表示する。 */}
              <div key={example.id} className={styles.exampleItem}>
                {/* 暗号文を表示する。 */}
                <p className={styles.cipher}>男「{example.cipherText}」</p>
                {/* 日本語訳を表示する。 */}
                <p className={styles.translation}>男「{example.translation}」</p>
              {/* 例文1件分を閉じる。 */}
              </div>
            // mapの処理を閉じる。
            ))}
          {/* 例文メモを閉じる。 */}
          </div>
        ) : (
          {/* 推測メモを表示する。 */}
          <div>
            {/* 推測メモの見出しを表示する。 */}
            <h2>手帳: 推測メモ</h2>
            {/* 暗号単語を1つずつ表示する。 */}
            {cipherWords.map((cipherWord) => (
              {/* 暗号単語と推測済み日本語を表示する。 */}
              <button key={cipherWord} className={styles.memoRow} type="button" onClick={() => onSelectMemoCipherWord(cipherWord)}>
                {/* 暗号単語から日本語への対応を表示する。 */}
                {cipherWord} → {noteMappings[cipherWord] ?? "未選択"}
              {/* 推測メモ行を閉じる。 */}
              </button>
            // mapの処理を閉じる。
            ))}
          {/* 推測メモを閉じる。 */}
          </div>
        // 条件分岐を閉じる。
        )}
      {/* 手帳本体を閉じる。 */}
      </div>

      {/* 推測メモで暗号単語が選択中なら中央単語リストを表示する。 */}
      {activeMemoCipherWord ? (
        {/* 中央単語リストを表示する。 */}
        <div className={styles.wordPanel}>
          {/* 何に対応する日本語を選ぶか表示する。 */}
          <p>{activeMemoCipherWord} に対応する日本語を選ぶ</p>
          {/* 日本語単語ボタンを並べる。 */}
          <div className={styles.wordButtons}>
            {/* 日本語単語の数だけボタンを作る。 */}
            {memoChoices.map((choice) => (
              {/* 日本語単語ボタンを表示する。 */}
              <button key={choice} type="button" onClick={() => onSelectMemoWord(activeMemoCipherWord, choice)}>{choice}</button>
            // mapの処理を閉じる。
            ))}
          {/* ボタン領域を閉じる。 */}
          </div>
        {/* 中央単語リストを閉じる。 */}
        </div>
      ) : null}
    {/* 手帳オーバーレイを閉じる。 */}
    </section>
  // returnを閉じる。
  );
// コンポーネントを閉じる。
}
```

## 13. `src/components/GameScreen.tsx` の主要処理

```tsx
// このファイルでstateやクリック処理を使えるようにする。
"use client";

// ReactからuseEffectとuseStateを読み込む。
import { useEffect, useState } from "react";
// 導入会話データを読み込む。
import { INTRO_DIALOGUES } from "@/data/introDialogues";
// サンプルの例文、手帳データ、問題データを読み込む。
import { SAMPLE_EXAMPLE_LINES, SAMPLE_EXAMPLES, SAMPLE_QUESTION } from "@/data/sampleRound";
// ゲーム設定値を読み込む。
import { GAME_CONFIG } from "@/lib/gameConfig";
// ゲームで使う型を読み込む。
import type { DialogueLine, ExampleRecord, GamePhase, NotebookMode, NoteMappings, Question, ResultStatus, SelectedAnswers } from "@/lib/gameTypes";
// 正誤判定関数を読み込む。
import { judgeAnswer } from "@/lib/judgeAnswer";
// 効果音再生関数を読み込む。
import { playSound } from "@/lib/sound";

// GameScreenコンポーネントを定義する。
export function GameScreen() {
  // 現在のゲーム状態を管理する。
  const [gamePhase, setGamePhase] = useState<GamePhase>("introDialogue");
  // 現在表示する会話行一覧を管理する。
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>(INTRO_DIALOGUES);
  // 何番目の会話を表示しているか管理する。
  const [dialogueIndex, setDialogueIndex] = useState(0);
  // 現在の問題データを管理する。
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  // 手帳に保存する例文履歴を管理する。
  const [examples, setExamples] = useState<ExampleRecord[]>([]);
  // 問題画面で選んだ解答を管理する。
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  // 現在選択中の暗号単語IDを管理する。
  const [activeAnswerTokenId, setActiveAnswerTokenId] = useState<string | null>(null);
  // 手帳の推測メモを管理する。
  const [noteMappings, setNoteMappings] = useState<NoteMappings>({});
  // 正解回数を管理する。
  const [correctCount, setCorrectCount] = useState(0);
  // 失敗回数を管理する。
  const [mistakeCount, setMistakeCount] = useState(0);
  // 間違い可能回数を管理する。
  const [mistakesRemaining, setMistakesRemaining] = useState(GAME_CONFIG.safeMistakeCount);
  // 現在のレベルを管理する。
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  // 残り時間を管理する。
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.timeLimitSeconds);
  // 時間切れ後かどうかを管理する。
  const [isTimedOut, setIsTimedOut] = useState(false);
  // 手帳が開いているか管理する。
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  // 手帳の表示モードを管理する。
  const [notebookMode, setNotebookMode] = useState<NotebookMode>("examples");
  // 推測メモで選択中の暗号単語を管理する。
  const [activeMemoCipherWord, setActiveMemoCipherWord] = useState<string | null>(null);
  // 手帳NEW表示を出すか管理する。
  const [showNotebookNew, setShowNotebookNew] = useState(false);
  // 演出のシーン番号を管理する。
  const [cutsceneStep, setCutsceneStep] = useState(0);
  // 結果がクリアかゲームオーバーか管理する。
  const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null);

  // 現在表示する会話行を取り出す。
  const currentDialogueLine = dialogueLines[dialogueIndex] ?? null;
  // 手帳で選べる日本語単語リストを作る。
  const memoChoices = ["赤い", "青い", "大きな", "小さな", "男", "女", "犬", "猫", "いくつかの", "たくさんの", "見る", "追う"];

  // 選択中の暗号単語に対応する日本語候補だけを取り出す。
  function getActiveAnswerChoices() {
    // 問題がない、または暗号単語が選ばれていなければ空配列を返す。
    if (!currentQuestion || activeAnswerTokenId === null) return [];

    // token IDに対応する候補だけを返す。
    return currentQuestion.choiceCandidatesByTokenId[activeAnswerTokenId] ?? [];
  // 関数を閉じる。
  }

  // 男のセリフ行が表示されたときだけ、男が喋る効果音を鳴らす。
  function playManTalkIfNeeded(line: DialogueLine | undefined) {
    // 男のセリフでなければ何もしない。
    if (line?.speaker !== "man") return;
    // 男が喋る効果音を鳴らす。
    playSound("manTalk");
  // 関数を閉じる。
  }

  // 暗号例文パートを開始する関数を定義する。
  function startExampleDialogue() {
    // 暗号例文の会話行をセットする。
    setDialogueLines(SAMPLE_EXAMPLE_LINES);
    // 会話番号を最初に戻す。
    setDialogueIndex(0);
    // 現在の問題をセットする。
    setCurrentQuestion(SAMPLE_QUESTION);
    // 手帳に例文を追加する。
    setExamples((prev) => [...prev, ...SAMPLE_EXAMPLES]);
    // 問題画面の解答を空にする。
    setSelectedAnswers({});
    // 選択中の暗号単語を解除する。
    setActiveAnswerTokenId(null);
    // 例文表示開始時点では、まだ問題提示ではないためNEW表示を出さない。
    setShowNotebookNew(false);
    // 間違い可能回数を1に戻す。
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    // ゲーム状態を暗号例文表示にする。
    setGamePhase("exampleDialogue");
    // 最初の例文行が男のセリフなら、男が喋る効果音を鳴らす。
    playManTalkIfNeeded(SAMPLE_EXAMPLE_LINES[0]);
  // 関数を閉じる。
  }

  // 会話を次へ進める関数を定義する。
  function handleNextDialogue() {
    // 会話送り効果音を鳴らす。
    playSound("dialogueNext");
    // 次の会話番号を作る。
    const nextIndex = dialogueIndex + 1;

    // 次の会話がある場合の処理をする。
    if (nextIndex < dialogueLines.length) {
      // 会話番号を次へ進める。
      setDialogueIndex(nextIndex);
      // 次に表示される行が男のセリフなら、男が喋る効果音を鳴らす。
      playManTalkIfNeeded(dialogueLines[nextIndex]);
      // ここで処理を終える。
      return;
    }

    // 導入会話が終わった場合の処理をする。
    if (gamePhase === "introDialogue") {
      // 暗号例文パートを開始する。
      startExampleDialogue();
      // ここで処理を終える。
      return;
    }

    // 暗号例文が終わった場合の処理をする。
    if (gamePhase === "exampleDialogue") {
      // 問題文だけの会話行を作る。
      const questionLines: DialogueLine[] = [{ id: "question-line", speaker: "man", text: SAMPLE_QUESTION.cipherText, type: "cipher" }];
      // 問題文だけを会話行としてセットする。
      setDialogueLines(questionLines);
      // 会話番号を最初に戻す。
      setDialogueIndex(0);
      // 問題提示に切り替わった瞬間に手帳NEW表示を出す。
      setShowNotebookNew(true);
      // ゲーム状態を問題提示にする。
      setGamePhase("question");
      // 問題提示に切り替わった瞬間に書き留め効果音を鳴らす。
      playSound("writeNote");
      // 問題文は男のセリフなので、男が喋る効果音を鳴らす。
      playManTalkIfNeeded(questionLines[0]);
      // ここで処理を終える。
      return;
    }

    // 問題提示が終わった場合の処理をする。
    if (gamePhase === "question") {
      // ゲーム状態を解答中にする。
      setGamePhase("answering");
    }
  // 関数を閉じる。
  }

  // 解答ボタンを押せるか判定する関数を定義する。
  function canSubmitAnswer() {
    // 現在の問題がなければfalseを返す。
    if (!currentQuestion) return false;
    // 全ての暗号単語に日本語が選ばれているか返す。
    return currentQuestion.tokens.every((token) => selectedAnswers[token.id]);
  // 関数を閉じる。
  }

  // 暗号単語クリック時の処理を定義する。
  function handleSelectAnswerToken(tokenId: string) {
    // 選択中の暗号単語IDを更新する。
    setActiveAnswerTokenId(tokenId);
  // 関数を閉じる。
  }

  // 日本語単語クリック時の処理を定義する。
  function handleSelectAnswerWord(tokenId: string, value: string) {
    // 指定した暗号単語IDに日本語を保存する。
    setSelectedAnswers((prev) => ({ ...prev, [tokenId]: value }));
  // 関数を閉じる。
  }

  // 解答するボタンの処理を定義する。
  function handleSubmitAnswer() {
    // 問題がない、または未選択がある場合は何もしない。
    if (!currentQuestion || !canSubmitAnswer()) return;
    // 正解なら正解処理を実行する。
    if (judgeAnswer(currentQuestion, selectedAnswers)) return handleCorrectAnswer();
    // 不正解なら不正解処理を実行する。
    handleWrongAnswer();
  // 関数を閉じる。
  }

  // 正解時の処理を定義する。
  function handleCorrectAnswer() {
    // 次の正解回数を作る。
    const nextCorrectCount = correctCount + 1;
    // 正解回数を更新する。
    setCorrectCount(nextCorrectCount);
    // 解答をリセットする。
    setSelectedAnswers({});
    // 選択中の暗号単語を解除する。
    setActiveAnswerTokenId(null);
    // Lv8で正解したか確認する。
    if (difficultyLevel >= GAME_CONFIG.finalLevel) {
      // 結果をクリアにする。
      setResultStatus("clear");
      // 演出の最初のシーンにする。
      setCutsceneStep(0);
      // クリア演出へ進める。
      setGamePhase("clearCutscene");
      // ここで処理を終える。
      return;
    }
    // まだクリアでなければ次のレベルへ進める。
    setDifficultyLevel((prev) => prev + 1);
    // まだクリアでなければ次の暗号例文パートへ進む。
    startExampleDialogue();
  // 関数を閉じる。
  }

  // 不正解時の処理を定義する。
  function handleWrongAnswer() {
    // 失敗回数を1増やす。
    setMistakeCount((prev) => prev + 1);
    // 時間切れ後、または間違い可能回数が0ならゲームオーバーにする。
    if (isTimedOut || mistakesRemaining <= 0) {
      // 結果をゲームオーバーにする。
      setResultStatus("gameOver");
      // 演出の最初のシーンにする。
      setCutsceneStep(0);
      // ゲームオーバー演出へ進める。
      setGamePhase("gameOverCutscene");
      // ここで処理を終える。
      return;
    }
    // 間違い可能回数を1減らす。
    setMistakesRemaining((prev) => Math.max(prev - 1, 0));
    // 解答をリセットする。
    setSelectedAnswers({});
    // 選択中の暗号単語を解除する。
    setActiveAnswerTokenId(null);
  // 関数を閉じる。
  }
// GameScreenの例はここまで。
}
```

## 14. `GameScreen`で使うキーボード入力サンプル

```tsx
// キーボード入力を登録する。
useEffect(() => {
  // キーが押されたときの処理を定義する。
  function handleKeyDown(event: KeyboardEvent) {
    // Spaceキーが押されたか確認する。
    if (event.code === "Space") {
      // ブラウザ標準のスクロールなどを止める。
      event.preventDefault();
      // 手帳を開閉する。
      toggleNotebook();
    }

    // 手帳が開いていなければここで処理を止める。
    if (!isNotebookOpen) return;

    // Tabキーが押されたか確認する。
    if (event.key === "Tab") {
      // ブラウザ標準のフォーカス移動を止める。
      event.preventDefault();
      // 手帳の表示モードを切り替える。
      toggleNotebookMode();
    }
  // キー処理関数を閉じる。
  }

  // windowにキー入力イベントを登録する。
  window.addEventListener("keydown", handleKeyDown);
  // コンポーネントが不要になったらイベントを解除する。
  return () => window.removeEventListener("keydown", handleKeyDown);
// isNotebookOpenが変わったときに登録し直す。
}, [isNotebookOpen]);
```

## 15. `GameScreen`で使うタイマーサンプル

```tsx
// 解答中だけタイマーを減らす。
useEffect(() => {
  // 解答中でなければ何もしない。
  if (gamePhase !== "answering") return;

  // 残り時間が0以下なら時間切れにする。
  if (timeLeft <= 0) {
    // 時間切れフラグをtrueにする。
    setIsTimedOut(true);
    // ここで処理を終える。
    return;
  }

  // 1秒後に残り時間を1減らすタイマーを作る。
  const timerId = window.setTimeout(() => {
    // 残り時間を1減らし、0未満にはしない。
    setTimeLeft((prev) => Math.max(prev - 1, 0));
  // 1000ミリ秒後に実行する。
  }, 1000);

  // 不要になったタイマーを解除する。
  return () => window.clearTimeout(timerId);
// gamePhaseまたはtimeLeftが変わったら実行する。
}, [gamePhase, timeLeft]);
```

## 16. CSS Modulesのコメント付き例

```css
/* 画面全体の見た目を指定する。 */
.screen {
  /* 子要素の絶対配置の基準にする。 */
  position: relative;
  /* 画面の高さを最低でもブラウザ全体にする。 */
  min-height: 100vh;
  /* はみ出した部分を隠す。 */
  overflow: hidden;
  /* 文字色を白にする。 */
  color: #ffffff;
  /* 暗い背景色を指定する。 */
  background: #050505;
/* screenクラスを閉じる。 */
}

/* 選択中の暗号単語の見た目を指定する。 */
.activeToken {
  /* 枠線を青くする。 */
  border-color: #66aaff;
  /* 青く光って見える影を付ける。 */
  box-shadow: 0 0 8px rgba(102, 170, 255, 0.8);
/* activeTokenクラスを閉じる。 */
}
```

## 17. 重要な注意

- JSX内のコメントは`{/* コメント */}`を使う。
- TypeScriptの通常行は`// コメント`を使う。
- CSSでは`/* コメント */`を使う。
- このファイルのコードは学習用なので、実装時はコメントを減らしてよい。
- 仕様判断はこのファイルではなく、`ui-spec.md`と`implementation-spec.md`を優先する。

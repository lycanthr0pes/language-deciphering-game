# 初心者向けコードチートシート

担当: @かまぼこ(本物), @ほっそー
最終決定: @ly(らい) / PM
最終更新: 2026-07-21

## 1. 目的

このドキュメントは、一人称視点の暗号推理ゲームをNext.js / Reactで実装するときによく使う関数、構文、考え方を初心者向けにまとめたものである。

実装中に分からなくなったら、まずこのファイルを確認する。

詳細な仕様は以下を参照する。

| ファイル | 内容 |
| --- | --- |
| `implementation-spec.md` | 完成形の実装仕様 |
| `implementation-step-guide.md` | 初心者向けの実装手順 |
| `ui-spec.md` | 画面、UI、操作仕様 |
| `mende-kikakui-font-guide.md` | 暗号フォント、Unicode、文字方向 |
| `game-rule.md` | ゲームルールと効果音の再生条件 |

## 2. このプロダクトでよく使う考え方

このゲームでは、以下の流れをReactで作る。

| やりたいこと | Reactで使うもの |
| --- | --- |
| 今どの画面か管理する | `useState` |
| 会話を進める | `onClick`、state更新 |
| 手帳をSpaceで開く | `useEffect`、`keydown` |
| 暗号単語を選ぶ | `onClick`、callback props |
| 日本語単語を選ぶ | `onClick`、`selectedAnswers`更新 |
| 解答する | `onSubmit`相当のクリック処理 |
| 正誤判定する | `every`、比較処理 |
| タイマーを減らす | `useEffect`、`setTimeout` |
| 見た目を切り替える | 条件分岐、CSS Modules |

## 3. `"use client";`

### 何のために使うか

Next.jsの`app`フォルダでは、ファイルは基本的にサーバー側で扱われる。

`useState`、`useEffect`、`onClick`、キーボード入力を使うコンポーネントでは、ファイルの一番上に`"use client";`を書く。

### 例

```tsx
"use client";

import { useState } from "react";

export function GameScreen() {
  const [dialogueIndex, setDialogueIndex] = useState(0);

  return <main>ゲーム画面</main>;
}
```

### このプロダクトで使う場所

| ファイル | 必要な理由 |
| --- | --- |
| `GameScreen.tsx` | state、クリック、キーボード入力を使うため |
| `ChoiceList.tsx` | ボタンのクリックを扱うため |
| `NotebookIndicator.tsx` | 解答中の手帳アイコンとNEWのCSSアニメーションを描画する場合 |

## 4. `useState`

### 何のために使うか

画面の中で変わる値を保存するために使う。

### 基本形

```tsx
const [値, 値を変える関数] = useState(初期値);
```

### 例: 会話番号

```tsx
const [dialogueIndex, setDialogueIndex] = useState(0);
```

`dialogueIndex`は現在の値。
`setDialogueIndex`は値を変える関数。

### 例: 手帳が開いているか

```tsx
const [isNotebookOpen, setIsNotebookOpen] = useState(false);
```

`false`なら閉じている。
`true`なら開いている。

### よく使うstate

| state | 内容 |
| --- | --- |
| `gamePhase` | 今のゲーム状態 |
| `dialogueIndex` | 何番目の会話を表示しているか |
| `selectedAnswers` | 暗号単語IDごとの解答 |
| `activeAnswerTokenId` | 今選択中の暗号単語ID |
| `isNotebookOpen` | 手帳が開いているか |
| `timeLeft` | 残り時間 |
| `mistakesRemaining` | 間違い可能回数 |

## 5. state更新の基本

### 直接代入はしない

悪い例:

```tsx
dialogueIndex = dialogueIndex + 1;
```

よい例:

```tsx
setDialogueIndex(dialogueIndex + 1);
```

### 前の値を使って更新する

```tsx
setMistakesRemaining((prev) => Math.max(prev - 1, 0));
```

`prev`は更新前の値。

この例では、間違い可能回数を1減らすが、0より小さくならないようにしている。

### オブジェクトを更新する

```tsx
setSelectedAnswers((prev) => ({
  ...prev,
  [tokenId]: value,
}));
```

`...prev`は、前の内容をコピーする構文。

`[tokenId]: value`は、指定した暗号単語IDに日本語を入れる構文。

## 6. `useEffect`

### 何のために使うか

画面表示後に、キーボード入力、タイマー、効果音などの処理を登録するために使う。

### 基本形

```tsx
useEffect(() => {
  // 実行したい処理

  return () => {
    // 後片付け
  };
}, [依存する値]);
```

## 7. キーボード入力

### このプロダクトで使うキー

| キー | 処理 |
| --- | --- |
| `Space` | `answering`中だけ手帳を開閉する |
| `A` | 手帳表示中に前の見開きへ移動する |
| `D` | 手帳表示中に次の見開きへ移動する |

`Tab`はゲーム操作に使わず、ブラウザ標準のフォーカス移動に使う。

### 例

```tsx
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    const target = event.target;
    const isEditable =
      target instanceof HTMLElement &&
      target.matches("input, select, textarea, [contenteditable='true']");

    if (isEditable) return;

    if (event.code === "Space") {
      event.preventDefault();
      if (gamePhase !== "answering") return;
      toggleNotebook();
      return;
    }

    if (gamePhase !== "answering" || !isNotebookOpen) return;

    if (event.code === "KeyA") {
      moveNotebookPage(-1);
    }

    if (event.code === "KeyD") {
      moveNotebookPage(1);
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [gamePhase, isNotebookOpen]);
```

### `event.preventDefault()`

ブラウザ標準の動きを止める。

このゲームでは、`Space`による画面スクロールとフォーカス中ボタンの押下を止めるために使う。実装では`keyup`側も同様に抑止する。`Tab`や`Enter`では呼ばず、標準のフォーカス移動とボタン操作を維持する。ゲームステージには`user-select: none`も設定し、左クリックやドラッグで文字を範囲選択させない。

## 8. `onClick`

### 何のために使うか

クリックされたときに処理を実行するために使う。

### 基本形

```tsx
<button type="button" onClick={handleClick}>
  ボタン
</button>
```

### 引数を渡したい場合

```tsx
<button type="button" onClick={() => onSelectToken(token.id)}>
  <CipherText ariaLabel="暗号単語1">{token.glyphText}</CipherText>
</button>
```

この書き方は、「クリックされたら`onSelectToken(token.id)`を実行する」という意味。

## 9. `event.stopPropagation()`

### 何のために使うか

子要素をクリックしたときに、親要素のクリック処理まで動かないようにする。

このゲームでは、画面全体の左クリックで会話が進む。
そのため、選択肢や手帳をクリックしたときに会話まで進まないようにする必要がある。

### 例

```tsx
<div onClick={(event) => event.stopPropagation()}>
  <button type="button">日本語単語</button>
</div>
```

## 10. props

### 何のために使うか

親コンポーネントから子コンポーネントへ値や関数を渡すために使う。

### 例: 親から渡す

```tsx
<DialogueBox
  line={currentDialogueLine}
  instruction="左クリックで進む"
  actionCue="next→"
/>
```

### 例: 子で受け取る

```tsx
type DialogueBoxProps = {
  line: DialogueLine;
  instruction: string;
  actionCue: "next→" | "answer→";
};

export function DialogueBox({ line, instruction, actionCue }: DialogueBoxProps) {
  return (
    <div>
      <p>{line.text}</p>
      <p>{instruction}</p>
      <p>{actionCue}</p>
    </div>
  );
}
```

会話送りは親の`GameScreen`が背景クリックを受けて行い、`DialogueBox`は表示だけを担当する。

## 11. callback props

### 何のために使うか

子コンポーネントで起きた操作を、親コンポーネントへ知らせるために使う。

### 例: `ChoiceList`

```tsx
<ChoiceList
  tokens={currentQuestion.tokens}
  choices={getActiveAnswerChoices()}
  selectedAnswers={selectedAnswers}
  activeTokenId={activeAnswerTokenId}
  instruction="Spaceで手帳を開く"
  canSubmit={canSubmitAnswer()}
  onSelectToken={handleSelectAnswerToken}
  onSelectWord={handleSelectAnswerWord}
  onSubmit={handleSubmitAnswer}
/>
```

この例では、`ChoiceList`はstateを直接変えない。

`getActiveAnswerChoices()`は、選択中の暗号単語に対応する日本語候補だけを返す関数である。

クリックされたら、`onSelectToken`、`onSelectWord`、`onSubmit`を呼んで親に知らせる。

## 12. 条件付き表示

### 何のために使うか

今のゲーム状態によって、表示するコンポーネントを変えるために使う。

### 例

```tsx
{(gamePhase === "answering" || gamePhase === "answerFeedback") &&
currentQuestion ? (
  <ChoiceList
    tokens={currentQuestion.tokens}
    choices={getActiveAnswerChoices()}
    selectedAnswers={selectedAnswers}
    activeTokenId={activeAnswerTokenId}
    instruction={instruction}
    canSubmit={canSubmitAnswer()}
    disabled={gamePhase === "answerFeedback"}
    judgement={answerJudgement}
    onSelectToken={handleSelectAnswerToken}
    onSelectWord={handleSelectAnswerWord}
    onSubmit={handleSubmitAnswer}
  />
) : null}
```

意味:

```text
gamePhaseがansweringまたはanswerFeedbackで、currentQuestionがあるならChoiceListを表示する。
そうでなければ何も表示しない。
```

この`ChoiceList`は、透明な解答UIコンテナの中で問題文、暗号単語、その直下の解答枠だけを大枠に入れ、候補、解答ボタン、判定数、操作案内を大枠の外へ表示する。同じ条件で`TimerDisplay`も表示し、`question`では従来の`DialogueBox`だけを表示する。

## 13. `map`

### 何のために使うか

配列の中身を1つずつ画面に表示するために使う。

### 例: 暗号単語を表示する

```tsx
{tokens.map((token) => (
  <button key={token.id} type="button" onClick={() => onSelectToken(token.id)}>
    <CipherText ariaLabel="暗号単語">{token.glyphText}</CipherText>
  </button>
))}
```

### `key`とは

Reactがリストを管理するために必要な値。

`map`でJSXを作るときは、必ず`key`を書く。

## 14. `every`

### 何のために使うか

配列の全ての要素が条件を満たしているか確認する。

このゲームでは、全暗号単語が解答済みか、全暗号単語が正解かを判定するときに使う。

### 例: 全て解答済みか

```tsx
function canSubmitAnswer() {
  if (!currentQuestion) return false;

  return currentQuestion.tokens.every((token) => selectedAnswers[token.id]);
}
```

### 例: 全て正解か

```ts
export function judgeAnswer(question: Question, selectedAnswers: SelectedAnswers) {
  return question.tokens.every((token) => {
    return selectedAnswers[token.id] === question.correctAnswers[token.id];
  });
}
```

## 15. `if`と`return`

### 何のために使うか

条件に合わないときに処理を止める。

### 例

```tsx
function handleSubmitAnswer() {
  if (!currentQuestion) return;
  if (!canSubmitAnswer()) return;

  checkAnswer(selectedAnswers);
}
```

意味:

```text
問題がなければ何もしない。
全て解答済みでなければ何もしない。
条件を満たしたら正誤判定する。
```

## 16. `? :` 三項演算子

### 何のために使うか

条件によって表示やclassNameを変える。

### 例

```tsx
className={isActive ? styles.activeToken : styles.token}
```

意味:

```text
isActiveがtrueならactiveTokenの見た目にする。
falseならtokenの見た目にする。
```

## 17. `?.` オプショナルチェーン

### 何のために使うか

値が`null`や`undefined`かもしれないとき、安全に中身を見るために使う。

### 例

```tsx
<p>{line?.text}</p>
```

`line`があれば`line.text`を表示する。
`line`が`null`ならエラーにしない。

## 18. `??` null合体演算子

### 何のために使うか

値が`null`や`undefined`のとき、代わりの値を使う。

### 例

```tsx
<span>{answer ?? "未選択"}</span>
```

`answer`があればそれを表示する。
なければ`未選択`を表示する。

## 19. TypeScriptの`type`

### 何のために使うか

データの形を決めるために使う。

### 例

```ts
type DialogueLine = {
  id: string;
  text: string;
  type: "normal" | "cipher" | "translation" | "answer";
};
```

この例では、会話データには`id`、`text`、`type`が必要。

## 20. ユニオン型

### 何のために使うか

決まった文字列だけを使えるようにする。

### 例

```ts
type GamePhase =
  | "opening"
  | "introDialogue"
  | "exampleDialogue"
  | "question"
  | "answering"
  | "result";
```

この例では、`gamePhase`に入れられる文字列を制限している。

## 21. `Record`

### 何のために使うか

キーと値の組み合わせを表す。

### 例

```ts
type SelectedAnswers = Partial<Record<string, string>>;
```

この例では、以下のようなデータを表す。

```ts
const selectedAnswers = {
  "token-1": "青い",
  "token-2": "女",
};
```

## 22. `Partial`

### 何のために使うか

全部の値がそろっていなくてもよいデータを表す。

### 例

```ts
type SelectedAnswers = Partial<Record<string, string>>;
```

解答中は、まだ全ての暗号単語に日本語が入っていないことがある。

そのため、`Partial`を使う。

## 23. 配列とオブジェクト

### 配列

順番のあるデータ。

```ts
const choices = ["赤い", "青い"];
```

### オブジェクト

名前付きのデータ。

```ts
const question = {
  id: "question-1",
  tokens: [
    { id: "token-1", cipherId: "color-2" },
    { id: "token-2", cipherId: "humanNoun-2" },
  ],
  choiceCandidatesByTokenId: {
    "token-1": ["赤い", "青い"],
    "token-2": ["男", "女"],
  },
};
```

## 24. `import`と`export`

### `export`

他のファイルから使えるようにする。

```ts
export function judgeAnswer() {
  // 処理
}
```

### `import`

他のファイルから読み込む。

```ts
import { judgeAnswer } from "@/lib/judgeAnswer";
```

## 25. CSS Modules

### 何のために使うか

コンポーネントごとにCSSを書くために使う。

### 例

```tsx
import styles from "./ChoiceList.module.css";

export function ChoiceList() {
  return <div className={styles.list}>選択肢</div>;
}
```

CSS側:

```css
.list {
  background: rgba(0, 0, 0, 0.72);
  color: #ffffff;
}
```

## 26. classNameの切り替え

### 例

```tsx
const isActive = activeTokenId === token.id;

<button className={isActive ? styles.activeToken : styles.token}>
  <CipherText ariaLabel="暗号単語">{token.glyphText}</CipherText>
</button>
```

選択中の暗号単語だけ見た目を変えるときに使う。

## 27. タイマー処理

### 例

```tsx
useEffect(() => {
  if (gamePhase !== "answering" || timeLeft <= 0) return;

  const timerId = window.setTimeout(() => {
    const nextTimeLeft = Math.max(timeLeft - 1, 0);
    setTimeLeft(nextTimeLeft);

    if (nextTimeLeft === 0) {
      startTerminalCutscene("gameOver", Date.now());
    }
  }, 1000);

  return () => window.clearTimeout(timerId);
}, [gamePhase, timeLeft]);
```

### 重要ポイント

| 処理 | 意味 |
| --- | --- |
| `setTimeout` | 1秒後に処理する |
| `clearTimeout` | 不要になったタイマーを止める |
| `Math.max(prev - 1, 0)` | 0より小さくしない |

手帳の開閉状態を条件や依存値に入れないため、手帳を開いている間も時間が進み、開閉で1秒の途中経過もリセットされない。

## 28. 時間表示

### 例

```ts
export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
}
```

### 使い方

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

問題単独提示中は時間と間違い可能回数を表示しない。判定中は`TimerDisplay`を残すが、タイマー更新処理は`answering`だけで動かす。

## 29. 効果音

### 例

```ts
export function preloadSounds() {
  (Object.keys(SOUND_PATHS) as SoundKey[]).forEach((key) => {
    getAudioPool(key).forEach(({ audio }) => audio.load());
  });
}

export function playSound(key: SoundKey) {
  const pool = getAudioPool(key);
  const entry =
    pool.find(({ audio, isPlaying }) => !isPlaying || audio.ended) ??
    pool.reduce((oldest, candidate) =>
      candidate.startedAt < oldest.startedAt ? candidate : oldest,
    );
  entry.isPlaying = true;
  entry.audio.currentTime = 0;
  void entry.audio.play().catch(() => {
    entry.isPlaying = false;
  });
}
```

### 使い方

```ts
playSound("dialogueNext");
```

### 注意

ブラウザの仕様で、ユーザーがクリックやキー入力をする前の音は鳴らないことがある。

会話送りやボタンクリック後に鳴るか確認する。

このゲームでは音のキーとパスを`src/lib/sound.ts`へ集約し、起動時に各音を3要素ずつ先読みする。誤答音は`handleSubmitAnswer()`で判定が誤答になった直後に`playSound("wrongAnswer")`を1回だけ呼び、時間切れ、表示コンポーネント、再描画される`useEffect`からは鳴らさない。

## 30. `public`フォルダの画像と音声

### 置き場所

```text
public/assets/images/background-room.png
public/assets/sounds/dialogue-next.mp3
```

### コードで使うパス

```text
/assets/images/background-room.png
/assets/sounds/dialogue-next.mp3
```

`public`はパスに書かない。

## 31. よくあるミス

| ミス | 原因 | 対処 |
| --- | --- | --- |
| `useState`でエラー | `"use client";`がない | ファイル先頭に追加する |
| ボタンを押すと会話も進む | `stopPropagation`がない | 選択肢や手帳の外側に追加する |
| stateがすぐ変わらない | Reactのstate更新は即時反映ではない | `nextValue`を作って使う |
| リスト表示で警告が出る | `key`がない | `map`の中に`key`を書く |
| Tabでフォーカス移動しない | Tabをゲーム入力として止めている | Tabの分岐と`preventDefault()`を削除する |
| 画像が表示されない | `public`をパスに含めている | `/assets/...`で指定する |

## 32. このプロダクトで特に重要なルール

- ゲーム進行のstateは基本的に`GameScreen`に置く。
- 子コンポーネントは表示とクリック通知を担当する。
- Figma node `13:66`の照明は`SceneCeilingLight`へまとめ、読込からリザルトまで同じ素材と配置を使う。各画面に照明用CSSを複製しない。
- 開始まばたきは新規タブの初回とゲーム内リトライだけで再生し、同一タブのブラウザ再読込では`sessionStorage`とNavigation Timingを使って省略する。
- `ChoiceList`は正誤判定しない。
- `DialogueBox`は通常会話・例文・問題単独提示を本文だけで描画し、右下に会話送りの`next→`または解答開始の`answer→`を表示する。`ChoiceList`は外側の透明な配置コンテナと、問題文・解答欄だけを収める内側パネルに分ける。候補、解答ボタン、案内、判定数は内側パネル外とし、候補は共通の大枠を持たない`#111`背景の独立ボタンにする。
- 正誤判定は`解答する`ボタンを押した時だけ行う。
- UI上では品詞ラベルを表示しない。
- 手帳には見出し、発話者名、括弧を付けず、提示例文と正答した問題・解答を暗号文／日本語訳の同じ形式で記録する。履歴に内容高の半透明背景を付けて文字を大きくし、画像と重ならない拡大`a/b`は見開き画像の上側外、操作案内は下側外へ置く。提示例文は`question`から`answering`へ入る時、正答履歴は正答確定時に無通知で追加する。1見開きは左3件、右3件の順で埋め、開閉と見開きstateは`GameScreen`に置く。
- 判定時は正答数とトークン別結果を返す。単語別結果は緑・赤だけで描画し、継続可能な誤答では選択と色分けを残して即時再開する。変更した解答欄だけ色を解除し、他欄の色と正答数を維持する。同じ解答も再送信できる。
- 継続可能な1回目の誤答だけ連番を増やしてダイアログを320ms揺らす。終了条件となる2回目は連番を増やさずゲームオーバー演出へ直行し、モーション低減時は1回目も揺らさない。
- 暗号はMende Kikakuiの実Unicode文字で表示し、字形では判定しない。
- タイマーが0になった瞬間に、失敗回数を増やさずゲームオーバー演出へ進む。
- 手帳を開いている間もタイマーを進める。
- 残り時間と間違い可能回数は解答中と判定中だけ表示し、判定中は値を保ったままカウントを止める。
- 間違い可能回数が0の状態でさらに間違えたらゲームオーバーにする。
- ランダム生成はReactの`return`内で行わない。
- 画像や音声が未完成でも、仮表示で動く状態を先に作る。

## 33. Pythonで書くとどうなるか

この章は、TypeScript / ReactのコードをPythonの考え方に置き換えて理解するための補助である。

注意点として、Reactの`useState`、`useEffect`、`onClick`、JSXはブラウザ画面を作るための仕組みなので、Pythonに完全に同じものはない。

ただし、変数、関数、条件分岐、リスト処理、辞書処理として考えると対応させやすい。

### 33.1 `useState`に近い考え方

TypeScript / React:

```tsx
const [dialogueIndex, setDialogueIndex] = useState(0);

setDialogueIndex(dialogueIndex + 1);
```

Pythonで書くと:

```python
dialogue_index = 0

dialogue_index = dialogue_index + 1
```

違い:

| React | Python |
| --- | --- |
| `setDialogueIndex`で値を変える | 変数に直接代入する |
| 値が変わると画面が再描画される | 普通は画面の再描画は起きない |
| UIの状態管理に使う | 通常の変数として使う |

### 33.2 booleanのstate

TypeScript / React:

```tsx
const [isNotebookOpen, setIsNotebookOpen] = useState(false);

setIsNotebookOpen(true);
```

Pythonで書くと:

```python
is_notebook_open = False

is_notebook_open = True
```

TypeScriptでは`true` / `false`、Pythonでは`True` / `False`と大文字が違う。

### 33.3 前の値を使って更新する

TypeScript / React:

```tsx
setMistakesRemaining((prev) => Math.max(prev - 1, 0));
```

Pythonで書くと:

```python
mistakes_remaining = max(mistakes_remaining - 1, 0)
```

どちらも「1減らすが、0より小さくしない」という意味。

### 33.4 オブジェクト更新

TypeScript / React:

```tsx
setSelectedAnswers((prev) => ({
  ...prev,
  [tokenId]: value,
}));
```

Pythonで書くと:

```python
selected_answers[token_id] = value
```

Pythonでコピーしてから更新するなら:

```python
selected_answers = {
    **selected_answers,
    token_id: value,
}
```

対応:

| TypeScript | Python |
| --- | --- |
| オブジェクト | 辞書 |
| `{ ...prev }` | `{ **selected_answers }` |
| `[tokenId]: value` | `token_id: value` |

### 33.5 関数定義

TypeScript:

```ts
function handleSelectAnswerToken(tokenId: string) {
  setActiveAnswerTokenId(tokenId);
}
```

Pythonで書くと:

```python
def handle_select_answer_token(token_id: str):
    active_answer_token_id = token_id
```

注意:

Pythonでは関数の中で外側の変数を書き換える場合、実際には`global`やクラスの`self`などが必要になることがある。

単純な対応としては、「関数で値を変更する」と理解すればよい。

### 33.6 `if`と`return`

TypeScript:

```ts
function handleSubmitAnswer() {
  if (!currentQuestion) return;
  if (!canSubmitAnswer()) return;

  checkAnswer(selectedAnswers);
}
```

Pythonで書くと:

```python
def handle_submit_answer():
    if not current_question:
        return

    if not can_submit_answer():
        return

    check_answer(selected_answers)
```

対応:

| TypeScript | Python |
| --- | --- |
| `!currentQuestion` | `not current_question` |
| `{}`でブロックを書く | インデントでブロックを書く |
| `return;` | `return` |

### 33.7 配列とリスト

TypeScript:

```ts
const choices = ["赤い", "青い"];
```

Pythonで書くと:

```python
choices = ["赤い", "青い"]
```

配列の書き方はかなり似ている。

### 33.8 オブジェクトと辞書

TypeScript:

```ts
const question = {
  id: "question-1",
  tokens: [
    { id: "token-1", cipherId: "color-2" },
    { id: "token-2", cipherId: "humanNoun-2" },
  ],
  choiceCandidatesByTokenId: {
    "token-1": ["赤い", "青い"],
    "token-2": ["男", "女"],
  },
};
```

Pythonで書くと:

```python
question = {
    "id": "question-1",
    "tokens": [
        {"id": "token-1", "cipher_id": "color-2"},
        {"id": "token-2", "cipher_id": "humanNoun-2"},
    ],
    "choice_candidates_by_token_id": {
        "token-1": ["赤い", "青い"],
        "token-2": ["男", "女"],
    },
}
```

違い:

| TypeScript | Python |
| --- | --- |
| `id: "question-1"` | `"id": "question-1"` |
| 最後の`;`を書くことがある | `;`は基本書かない |
| `cipherId`のようなcamelCaseが多い | `cipher_id`のようなsnake_caseが多い |

### 33.9 `map`

TypeScript / React:

```tsx
{tokens.map((token) => (
  <button key={token.id} type="button">
    <CipherText ariaLabel="暗号単語">{token.glyphText}</CipherText>
  </button>
))}
```

Pythonで処理だけ書くと:

```python
for token in tokens:
    print(token["cipher_id"])
```

Pythonで新しいリストを作るなら:

```python
cipher_ids = [token["cipher_id"] for token in tokens]
```

Reactの`map`は、配列からJSXを作って画面に並べるために使う。

Pythonの`for`は、リストの中身を1つずつ処理するために使う。

### 33.10 `every`

TypeScript:

```ts
const isComplete = currentQuestion.tokens.every((token) => {
  return selectedAnswers[token.id];
});
```

Pythonで書くと:

```python
is_complete = all(selected_answers.get(token["id"]) for token in current_question["tokens"])
```

対応:

| TypeScript | Python |
| --- | --- |
| `every` | `all` |
| `selectedAnswers[token.id]` | `selected_answers.get(token["id"])` |

### 33.11 正誤判定

TypeScript:

```ts
export function judgeAnswer(question: Question, selectedAnswers: SelectedAnswers) {
  return question.tokens.every((token) => {
    return selectedAnswers[token.id] === question.correctAnswers[token.id];
  });
}
```

Pythonで書くと:

```python
def judge_answer(question, selected_answers):
    return all(
        selected_answers.get(token["id"]) == question["correct_answers"][token["id"]]
        for token in question["tokens"]
    )
```

このゲームで特に重要な処理。

意味:

```text
全ての暗号単語について、選んだ日本語が正解と一致していればTrue。
1つでも違えばFalse。
```

### 33.12 三項演算子

TypeScript:

```tsx
const className = isActive ? styles.activeToken : styles.token;
```

Pythonで書くと:

```python
class_name = active_token if is_active else token
```

対応:

| TypeScript | Python |
| --- | --- |
| `条件 ? trueの値 : falseの値` | `trueの値 if 条件 else falseの値` |

### 33.13 `??` null合体演算子

TypeScript:

```tsx
const displayText = answer ?? "未選択";
```

Pythonで近い書き方:

```python
display_text = answer if answer is not None else "未選択"
```

注意:

Pythonで以下のようにも書ける。

```python
display_text = answer or "未選択"
```

ただし、`answer`が空文字`""`の場合も`未選択`になってしまう。
`None`だけを判定したいなら`is not None`を使う。

### 33.14 `?.` オプショナルチェーン

TypeScript:

```tsx
const text = line?.text;
```

Pythonで書くと:

```python
text = line["text"] if line is not None else None
```

オブジェクトの場合は:

```python
text = line.text if line is not None else None
```

### 33.15 `Record<string, string>`

TypeScript:

```ts
type SelectedAnswers = Partial<Record<string, string>>;
```

Pythonで近い考え方:

```python
selected_answers: dict[str, str] = {}
```

例:

```python
selected_answers = {
    "token-1": "青い",
    "token-2": "女",
}
```

### 33.16 ユニオン型

TypeScript:

```ts
type GamePhase = "opening" | "introDialogue" | "answering" | "result";
```

Pythonで近い書き方:

```python
from typing import Literal

GamePhase = Literal["opening", "introDialogue", "answering", "result"]
```

ただし、初心者のうちはPythonでここまで厳密に書かなくてもよい。

単純に書くなら:

```python
game_phase = "opening"
```

### 33.17 `import`と`export`

TypeScript:

```ts
export function judgeAnswer() {
  // 処理
}
```

```ts
import { judgeAnswer } from "@/lib/judgeAnswer";
```

Pythonで書くと:

```python
def judge_answer():
    pass
```

別ファイルから読み込む:

```python
from judge_answer import judge_answer
```

### 33.18 `setTimeout`

TypeScript:

```ts
const timerId = window.setTimeout(() => {
  setTimeLeft((prev) => Math.max(prev - 1, 0));
}, 1000);
```

Pythonで処理だけ書くと:

```python
import time

time.sleep(1)
time_left = max(time_left - 1, 0)
```

違い:

| TypeScript / React | Python |
| --- | --- |
| 画面を止めずに1秒後に実行する | `sleep`は処理を止める |
| UI向き | 単純な処理向き |

ReactのタイマーとPythonの`sleep`は完全に同じではない。

### 33.19 CSS Modules

TypeScript / React:

```tsx
<button className={styles.activeToken}>
  <CipherText ariaLabel="暗号単語1">{token.glyphText}</CipherText>
</button>
```

Pythonには、ReactのCSS Modulesに直接対応する標準機能はない。

PythonでHTML文字列を作るなら近い形はこうなる。

```python
html = '<button class="activeToken">暗号単語の字形</button>'
```

このプロジェクトでは、見た目の実装はTypeScript / React / CSS Modulesで行う。

### 33.20 `onClick`

TypeScript / React:

```tsx
<button type="button" onClick={() => onSelectToken(token.id)}>
  <CipherText ariaLabel="暗号単語1">{token.glyphText}</CipherText>
</button>
```

Pythonの普通のプログラムには、Reactの`onClick`に直接対応する標準構文はない。

処理だけ書くなら:

```python
def on_select_token(token_id):
    print(f"選択された暗号単語: {token_id}")

on_select_token("token-1")
```

ブラウザ上のクリック処理は、React側で実装する。

### 33.21 callback props

TypeScript / React:

```tsx
<ChoiceList onSubmit={handleSubmitAnswer} />
```

Pythonで関数を渡す考え方:

```python
def handle_submit_answer():
    print("解答する")

def choice_list(on_submit):
    on_submit()

choice_list(handle_submit_answer)
```

「関数を別の関数に渡す」という考え方はPythonにもある。

### 33.22 このゲームの問題データをPythonで書く

TypeScript:

```ts
const sampleQuestion = {
  id: "question-1",
  tokens: [
    { id: "token-1", cipherId: "color-2", correctJa: "青い" },
    { id: "token-2", cipherId: "humanNoun-2", correctJa: "女" },
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

Pythonで書くと:

```python
sample_question = {
    "id": "question-1",
    "tokens": [
        {"id": "token-1", "cipher_id": "color-2", "correct_ja": "青い"},
        {"id": "token-2", "cipher_id": "humanNoun-2", "correct_ja": "女"},
    ],
    "correct_answers": {
        "token-1": "青い",
        "token-2": "女",
    },
    "choice_candidates_by_token_id": {
        "token-1": ["赤い", "青い"],
        "token-2": ["男", "女"],
    },
}
```

### 33.23 このゲームの正誤判定をPythonで試す

```python
sample_question = {
    "tokens": [
        {"id": "token-1", "cipher_id": "color-2"},
        {"id": "token-2", "cipher_id": "humanNoun-2"},
    ],
    "correct_answers": {
        "token-1": "青い",
        "token-2": "女",
    },
}

selected_answers = {
    "token-1": "青い",
    "token-2": "女",
}

def judge_answer(question, selected_answers):
    return all(
        selected_answers.get(token["id"]) == question["correct_answers"][token["id"]]
        for token in question["tokens"]
    )

print(judge_answer(sample_question, selected_answers))
```

出力:

```text
True
```

間違えた場合:

```python
selected_answers = {
    "token-1": "男",
    "token-2": "女",
}

print(judge_answer(sample_question, selected_answers))
```

出力:

```text
False
```

## 34. TypeScriptとPythonの対応早見表

| TypeScript / React | Python | 意味 |
| --- | --- | --- |
| `const x = 1` | `x = 1` | 変数を作る |
| `true` / `false` | `True` / `False` | 真偽値 |
| `null` | `None` | 値がない |
| `if (!value)` | `if not value:` | 値がない、またはfalseなら |
| `array.map(...)` | `for item in list:` | リストを順番に処理 |
| `array.every(...)` | `all(...)` | 全て条件を満たすか |
| `{ ...obj }` | `{ **dict }` | 辞書をコピー |
| `obj[key]` | `dict[key]` | キーで値を取る |
| `obj[key] ?? "未選択"` | `dict.get(key) or "未選択"` | 値がなければ代替表示 |
| `function name() {}` | `def name():` | 関数定義 |
| `return value;` | `return value` | 値を返す |
| `===` | `==` | 等しいか比較 |
| `&&` | `and` | かつ |
| `||` | `or` | または |
| `!` | `not` | 否定 |

## 35. Pythonとの違いで注意すること

- Reactはstateが変わると画面が再描画される。
- Pythonの普通の変数は、変えてもブラウザ画面は変わらない。
- Reactの`onClick`はブラウザ上のイベント処理。
- Pythonの関数呼び出しは、基本的に自分で呼んだタイミングで実行される。
- ReactのJSXはHTMLに近い見た目だが、JavaScript / TypeScriptの構文である。
- Pythonではインデントが重要。
- TypeScriptでは`{}`と`;`がよく出る。
- このプロジェクトの実装はTypeScript / Reactで行う。Python例は理解補助であり、実装に使うコードではない。

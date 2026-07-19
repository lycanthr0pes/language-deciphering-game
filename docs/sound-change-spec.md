# テスト版 音仕様変更

作成日: 2026-07-17  
最終決定: @ly(らい) / PM  
ステータス: PMレビュー案

今回追加する新規音声ファイルは`end.mp3`と`close-note.mp3`の2つのみとする。既存の会話音、書き留め音、銃声などは変更しない。

## 1. 終了タイトルの共通音

- `GAME OVER`と`GAME CLEAR`の両方で`end.mp3`を使用する。
- 終了タイトルの表示アニメーションが始まる瞬間に再生する。
- `GAME OVER`と`GAME CLEAR`で音声ファイルを分けない。
- どちらの場合も`end.mp3`を1回だけ再生する。
- 発砲音とは別の音として扱い、タイトル表示前に重複再生しない。

| 音 | 推奨ファイル名 |
| --- | --- |
| 終了タイトル共通音 | `end.mp3` |

```ts
playSound("end");
```

## 2. メモを置く音

- 手帳を閉じ、机の上へ戻す瞬間に1回再生する。
- `Space`で手帳を閉じた場合だけ再生する。
- 手帳に閉じるボタンは配置しない。
- 手帳を開く時、ページ移動時、`NEW`表示時には再生しない。
- 連続入力で多重再生しない。

| 音 | 推奨ファイル名 |
| --- | --- |
| メモを置く音 | `close-note.mp3` |

```ts
function closeNotebook() {
  if (!isNotebookOpen) return;

  setIsNotebookOpen(false);
  playSound("closeNote");
}
```

## 3. サンプルコード

### `src/lib/sound.ts`

```ts
export type SoundKey =
  | "dialogueNext"
  | "manTalk"
  | "writeNote"
  | "drawGun"
  | "gunShot"
  | "end"
  | "closeNote";

const SOUND_PATHS: Record<SoundKey, string> = {
  dialogueNext: "/assets/sounds/dialogue-next.mp3",
  manTalk: "/assets/sounds/man-talk.mp3",
  writeNote: "/assets/sounds/write-note.mp3",
  drawGun: "/assets/sounds/draw-gun.mp3",
  gunShot: "/assets/sounds/gun-shot.mp3",
  end: "/assets/sounds/end.mp3",
  closeNote: "/assets/sounds/close-note.mp3",
};

const SOUND_VOLUMES: Partial<Record<SoundKey, number>> = {
  end: 0.8,
  closeNote: 0.7,
};

export function playSound(key: SoundKey) {
  const audio = new Audio(SOUND_PATHS[key]);
  audio.volume = SOUND_VOLUMES[key] ?? 0.8;

  void audio.play().catch(() => {
    // ブラウザの自動再生制限などで失敗した場合もゲーム進行は止めない。
  });
}

```

授業サーバで`basePath`が必要な場合は、`SOUND_PATHS`へ直接絶対パスを書かず、既存の素材パス生成関数を通す。

### 終了タイトルへの接続

```ts
import { playSound } from "@/lib/sound";

function startEndTitle(status: "clear" | "gameOver") {
  setResultStatus(status);
  playSound("end");
  setGamePhase("endTitle");
}
```

発砲演出が完了した時点で`startEndTitle(resultStatus)`を1回だけ呼ぶ。`EndTitleScreen`の再描画や`useEffect`では再生せず、Reactの再描画による多重再生を防ぐ。

```ts
function finishCutscene() {
  if (!resultStatus) return;

  setCutsceneStep(0);
  startEndTitle(resultStatus);
}
```

### 手帳を閉じる処理への接続

```ts
import { playSound } from "@/lib/sound";

function closeNotebook() {
  if (!isNotebookOpen) return;

  setIsNotebookOpen(false);
  playSound("closeNote");
}
```

Spaceキーの入力から`toggleNotebook()`を呼び、手帳が開いている場合だけ`closeNotebook()`で音を再生する。

```ts
function toggleNotebook() {
  if (isNotebookOpen) {
    closeNotebook();
    return;
  }

  openNotebook();
}
```

```tsx
if (event.code === "Space") {
  event.preventDefault();
  toggleNotebook();
}
```

### 閉じるボタン実装の削除

`Notebook`から閉じるボタン、`onClose` props、`closeButton`用CSSを削除する。手帳を閉じる操作は`GameScreen`が受け取るSpaceキーだけに統一する。

削除対象の例:

```tsx
type NotebookProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Notebook({ isOpen, onClose }: NotebookProps) {
  return (
    <section>
      <button type="button" onClick={onClose}>
        閉じる
      </button>
    </section>
  );
}
```

変更後の例:

```tsx
type NotebookProps = {
  isOpen: boolean;
};

export function Notebook({ isOpen }: NotebookProps) {
  if (!isOpen) return null;

  return (
    <section onClick={(event) => event.stopPropagation()}>
      {/* 例文履歴とページ表示だけを描画する。 */}
    </section>
  );
}
```

`GameScreen`から渡していた`onClose`も削除する。

```tsx
<Notebook
  isOpen={isNotebookOpen}
  examples={examples}
  page={notebookPage}
/>
```

削除するもの:

- `NotebookProps.onClose`
- `Notebook`の引数にある`onClose`
- `onClick={onClose}`を持つ閉じるボタン
- `.closeButton`のCSS
- `<Notebook onClose={...} />`のprops指定

### 必要な音声ファイル

```text
public/
  assets/
    sounds/
      end.mp3
      close-note.mp3
```

## 4. 担当者

| 作業 | 担当 |
| --- | --- |
| 音素材の選定・最終確認 | @ly(らい) |
| 音声ファイルの配置 | @ほっそー |
| 再生処理の実装 | @ほっそー |
| 閉じるボタンと`onClose`の削除 | @ほっそー |
| 終了画面との接続確認 | @かまぼこ(本物) |

## 5. 完了条件

- 両終了タイトルで同じ`end.mp3`が1回だけ鳴る。
- 手帳を閉じた時だけメモを置く音が鳴る。
- 手帳内に閉じるボタンが表示されない。
- `Notebook`に`onClose` propsと`.closeButton`が残っていない。
- 各音が1回の操作または演出で多重再生されない。
- @ly(らい)が音量と再生タイミングを承認している。

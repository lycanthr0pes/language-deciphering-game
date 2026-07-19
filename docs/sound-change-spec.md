# テスト版 音仕様

作成日: 2026-07-17
最終決定: @ly(らい) / PM
最終更新: 2026-07-20
ステータス: 仕様承認済み・実装未完了
承認日: 2026-07-20

## 1. 目的

テスト版で使用する効果音、再生タイミング、重複再生防止、`basePath`対応を定義する。

今回追加する音声ファイルは`end.mp3`と`close-note.mp3`の2つとし、既存の会話、発話、書き留め、銃、発砲の音は維持する。

## 2. 音声一覧

| sound key | ファイル | 再生タイミング |
| --- | --- | --- |
| `dialogueNext` | `dialogue-next.mp3` | 左クリックで会話を進めた時 |
| `manTalk` | `man-talk.mp3` | 男の暗号例文、日本語訳、問題文を表示した時 |
| `writeNote` | `write-note.mp3` | 問題提示とNEW通知を開始した時 |
| `drawGun` | `draw-gun.mp3` | クリア／失敗の発砲演出を開始した時 |
| `gunShot` | `gun-shot.mp3` | 発砲した時 |
| `end` | `end.mp3` | `GAME CLEAR`／`GAME OVER`の表示を開始した時 |
| `closeNote` | `close-note.mp3` | Spaceで開いている手帳を閉じた時 |

## 3. 終了タイトル音

- `GAME CLEAR`と`GAME OVER`の両方で`end.mp3`を使う。
- 発砲音とは分け、終了タイトルの表示開始時に1回だけ再生する。
- クリアと失敗で音声ファイルを分けない。
- `EndTitleScreen`の再描画や汎用`useEffect`から再生しない。
- 発砲演出から`endTitle`へ遷移させるイベントで`playSound("end")`を1回呼ぶ。

```ts
function startEndTitle(status: ResultStatus) {
  setResultStatus(status);
  playSound("end");
  setGamePhase("endTitle");
}
```

## 4. 手帳を閉じる音

- `close-note.mp3`は、開いている手帳をSpaceで閉じた瞬間だけ1回再生する。
- 手帳を開く時、A/Dページ移動時、NEW表示時には再生しない。
- 閉じている状態でSpace以外の入力をしても再生しない。
- 手帳内に閉じるボタンを置かない。
- 連続入力で同じ閉じる処理を多重実行しない。

```ts
function closeNotebook() {
  if (!isNotebookOpen) return;

  setIsNotebookOpen(false);
  playSound("closeNote");
}

function toggleNotebook() {
  if (isNotebookOpen) {
    closeNotebook();
    return;
  }

  openNotebook();
}
```

`Notebook`は閉じるcallbackを受け取らない。Space入力を管理する`GameScreen`だけが`closeNotebook()`を呼ぶ。

## 5. 実装インターフェース

```ts
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

const SOUND_VOLUMES: Partial<Record<SoundKey, number>> = {
  end: 0.8,
  closeNote: 0.7,
};
```

## 6. basePath対応

授業サーバでは`basePath`が付くため、`SOUND_FILES`の値を直接`Audio`へ渡さない。

```ts
export function assetPath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

export function playSound(key: SoundKey) {
  const audio = new Audio(assetPath(SOUND_FILES[key]));
  audio.volume = SOUND_VOLUMES[key] ?? 0.8;

  void audio.play().catch(() => {
    // 自動再生制限などで失敗してもゲーム進行は止めない。
  });
}
```

画像も同じ`assetPath()`を使い、素材URLの組み立てを重複させない。

## 7. 多重再生防止

- 音は状態遷移を開始する関数またはユーザー操作handlerから再生する。
- render中に再生しない。
- 再描画される子コンポーネントから進行音を再生しない。
- `animationend`とフォールバックtimeoutが競合する場合は完了ガードを共有し、終了タイトル音を再度鳴らさない。
- Spaceのkeydown repeat中に手帳を開閉し続けないよう、必要に応じて`event.repeat`を無視する。

## 8. 素材

```text
public/assets/sounds/
  dialogue-next.mp3
  man-talk.mp3
  write-note.mp3
  draw-gun.mp3
  gun-shot.mp3
  end.mp3
  close-note.mp3
```

## 9. 完了条件

- 両終了タイトルで`end.mp3`が1回だけ鳴る。
- Spaceで手帳を閉じた時だけ`close-note.mp3`が1回鳴る。
- 手帳内に閉じるボタンがなく、`Notebook`に閉じるcallbackがない。
- ローカルと`basePath`付き授業サーバで全音声がHTTP 200になる。
- 再描画、連続入力、フォールバック処理で多重再生しない。
- 再生失敗がゲーム進行を止めない。

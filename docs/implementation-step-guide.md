# 初心者向け実装手順書

担当: @かまぼこ(本物), @ほっそー
最終決定: @ly(らい) / PM
最終更新: 2026-07-20
ステータス: 仕様承認済み・実装未完了

## 1. 目的

現行リポジトリを、導入からLv8、両終了分岐、リトライまで動くテスト版へ段階的に仕上げる手順を示す。

完成仕様は`game-rule.md`、`mende-kikakui-font-guide.md`、`sound-change-spec.md`、`test-version-change-spec.md`、`implementation-spec.md`を正とする。本書のコードは説明用であり、そのまま貼り付けず現行コードへ合わせる。

## 2. 作業前

1. 依頼外の変更がないか`git status --short`で確認する。
2. `node_modules/next/dist/docs/`から、変更するNext.js機能のガイドを読む。
3. `npm install`済みであることを確認する。
4. `npm run dev`で現状を確認する。
5. ユーザーから指定がなければcommit、push、ブランチ切り替えをしない。

## 3. 最終構成

```text
src/
  app/
    fonts.ts
    layout.tsx
    page.tsx
  assets/fonts/
    NotoSansMendeKikakui-Regular.woff2
  components/
    GameScreen.tsx
    DialogueBox.tsx
    ChoiceList.tsx
    CipherText.tsx
    Notebook.tsx
    TimerDisplay.tsx
    OpeningBlink.tsx
    CutsceneScreen.tsx
    EndTitleScreen.tsx
    ResultScreen.tsx
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
    sound.ts
  utils/
    formatTime.ts
public/
  assets/images/
  assets/sounds/
  licenses/NotoSansMendeKikakui-OFL.txt
```

## 4. Step 1: 基盤を確認する

### 実装

- `page.tsx`は`GameScreen`だけを表示する。
- `GameScreen`だけへ必要な`"use client"`を付ける。
- 画面全体のstateを子コンポーネントへ重複させない。
- CSS Modulesで黒い全画面と16:9の基準レイアウトを作る。

### 完成条件

- `/`だけでゲーム画面が開く。
- 静的ビルドが成功する。
- `page.tsx`にゲーム進行ロジックがない。

## 5. Step 2: 型と設定値を整える

### 型

- `GamePhase`へ`opening`、会話3種、`answering`、`answerFeedback`、両cutscene、`endTitle`、`result`を定義する。
- `InternalCategory`、`CipherId`、`CipherToken`、`ExampleRecord`、`Question`を定義する。
- `AnswerJudgement`へ正否、正答数、総数、トークン別結果を持たせる。
- `ResultStatus`、`FontStatus`、`AssetStatus`を定義する。

### 設定値

- Lv8、誤答猶予1、90秒、警告15秒を`gameConfig.ts`へ置く。
- 手帳2件、NEW半周期900ms、判定1400ms、開始2300ms、素材timeout 5000msを置く。
- 発砲100ms、失敗タイトル2300ms、クリアタイトル2400ms、低減時1500msを置く。

### 完成条件

- 同じ数値をTypeScriptとCSSへ重複定義していない。
- 以前の値に依存するstate更新が関数形式になっている。

## 6. Step 3: 導入会話を完成させる

### 実装

- `introDialogues.ts`の5行を地の文として表示する。
- `DialogueBox`へ行、話者、進行可能状態、案内をpropsで渡す。
- 左クリックは会話フェーズだけ進める。
- 会話送り音をクリック時、男の発話音を男の行の表示時だけ鳴らす。
- 選択肢や手帳のクリックで背景会話を進めない。

### 完成条件

- 導入はすべて白で、男の発話音が鳴らない。
- 最終行の次にLv1の例文へ進む。

## 7. Step 4: Mendeフォントを導入する

### 素材

- WOFF2を`src/assets/fonts/NotoSansMendeKikakui-Regular.woff2`へ置く。
- OFLを`public/licenses/NotoSansMendeKikakui-OFL.txt`へ置く。
- Figmaへ同じソースのTTF/OTFを導入する。

### 実装

- `fonts.ts`で`next/font/local`を設定し、`--font-mende-cipher`を有効にする。
- `cipherGlyphs.ts`へ`U+1E800`〜`U+1E807`の対応を一度だけ定義する。
- `CipherText`へ`lang="men-Mend"`、`dir="rtl"`、順序だけの`aria-label`を付ける。
- 文コンテナはLTR、単語はRTLと`unicode-bidi: isolate`にする。
- `document.fonts.load()`とcmap検査を実装する。

### 完成条件

- 仮英字、Private Use Area、暗号画像が表示されない。
- 2、3、5単語の順序と境界が分かる。
- 読込失敗時はエラーになり、別表記で解答を続けない。
- ローカルと`basePath`付きURLでフォントがHTTP 200になる。

## 8. Step 5: 語彙・例文・問題を生成する

### 実装

- 日本語語彙を`wordPools.ts`へ一度だけ定義する。
- 内部カテゴリと候補番号から`cipherId`と`glyphText`を生成する。
- `exampleTemplates.ts`へLv別の例文構成を定義する。
- Lv1で3件、Lv2〜8で各1件、累計10件になるよう生成する。
- Lv別問題は`game-rule.md`の内部確認用構成と一致させる。
- ラウンド開始時に一度生成し、stateへ保存する。

### 完成条件

- renderのたびに問題が変わらない。
- 日本語正解、候補、暗号表示が同じトークン定義から作られる。
- 画面に内部カテゴリIDが出ない。

## 9. Step 6: 例文と問題会話を接続する

### 実装

1. `startRound(level)`で例文と問題を生成する。
2. 例文を手帳履歴へ追加する。
3. 暗号例文を赤、日本語訳を青で交互に表示する。
4. 最後に問題を赤で表示する。
5. 問題提示時にNEWを未読にし、書き留め音を鳴らす。
6. 問題会話を進めた後に`answering`へ入る。

### 完成条件

- 男の行だけ発話音が鳴る。
- 例文追加時ではなく問題提示時にNEWと書き留め音が出る。

## 10. Step 7: 解答UIを作る

### 実装

- `ChoiceList`は暗号トークン、日本語候補、選択済み日本語、送信ボタンを描画する。
- 暗号トークン選択時は`activeAnswerTokenId`だけを更新する。
- 候補は選択中トークンの内部カテゴリ2件だけを表示する。
- 候補選択時に該当トークンの日本語を更新する。
- 全トークン回答済みの時だけ送信できる。
- 選択しただけでは判定しない。

### 完成条件

- カテゴリ名が見えない。
- 選択中トークンと選択済み日本語が分かる。
- ChoiceList内のクリックで背景会話が進まない。

## 11. Step 8: 判定とフィードバックを作る

### `judgeAnswer`

- 副作用のない関数とする。
- booleanではなく`AnswerJudgement`を返す。
- 各トークンを`correct`／`incorrect`に分類し、正答数を数える。

### 表示

- 送信時に`answerFeedback`へ進む。
- `正答 n / N`を`aria-live="polite"`で表示する。
- 正答は緑とラベル、誤答は赤とラベルで示す。
- 1400msはタイマーと全解答操作を止める。

### 継続可能な誤答

- 選択と判定結果を保持して`answering`へ戻す。
- 日本語を実際に変更した時だけ判定結果を消す。
- 判定結果が残る間は同じ解答を再送信できない。

### 完成条件

- 単語選択ではなく送信時だけ判定する。
- Lv8の5単語でも全結果が読める。

## 12. Step 9: 誤答ルールを接続する

### 実装

- 各問題の`mistakesRemaining`を1から始める。
- 誤答のたびに`mistakeCount`を増やす。
- 1回目は残数を0にして続行する。
- 判定前の残数が0ならゲームオーバーへ進む。
- 次問題で残数を1へ戻す。

### 完成条件

- 1回目と2回目の誤答が別の遷移になる。
- 判定表示後に遷移する。

## 13. Step 10: 手帳とNEWを作る

### 手帳

- `Notebook`は例文履歴とページだけを描画する。
- 1ページ2件、開いた直後は最新ページとする。
- Spaceで開閉し、A/Dで範囲内を移動する。
- 閉じるボタンと閉じるcallbackを作らない。
- Tabをゲーム処理せず、標準のフォーカス移動を維持する。
- Spaceで閉じた時だけ`closeNote`を鳴らす。

### NEW

- `hasUnreadExamples`で未読を管理する。
- 問題提示時に未読にし、最初の手帳表示で既読にする。
- 上下4px、半周期900msの`transform`アニメーションにする。
- モーション低減時は静止する。

### 完成条件

- 履歴が次レベルでも残る。
- 先頭・末尾を越えない。
- 同じレベルでNEWが再表示されない。

## 14. Step 11: タイマーを作る

### 実装

- `answering`かつ手帳が閉じている時だけ1秒ごとに減らす。
- 0で`isTimedOut`を`true`にするが、即終了しない。
- 時間切れ後の誤答でゲームオーバーへ進む。
- 次レベルで時間と時間切れを初期化する。
- timeoutをcleanupする。

### 完成条件

- 判定、手帳、会話、演出中に減らない。
- 15秒以下の警告色が動く。

## 15. Step 12: 開始まばたきを作る

### 実装

- 背景と通常人物を`assetPath()`で読み込む。
- 読込完了後に`OpeningBlink`を表示する。
- 上下まぶたと暗転をCSSで描く。
- 通常2300ms、モーション低減300msとする。
- 完了通知専用`animationend`と+250msフォールバックを一度きりのガードへ接続する。
- 5000msで素材エラーへ切り替える。

### 完成条件

- まばたき画像を使わない。
- 演出中に入力できない。
- リトライ時も再生する。

## 16. Step 13: 発砲演出と終了タイトルを作る

### 発砲

- クリアは銃を自分へ、失敗はプレイヤーへ向ける。
- 銃を抜く音、発砲音、最大100msのフラッシュ、暗転を順に実行する。
- 終了条件を判定した送信処理内で、`answerFeedback`へ進む前に`endedAt`を未設定の場合だけ保存する。

### 終了タイトル

- 暗転後に`endTitle`へ進み、`end`を1回鳴らす。
- `GAME CLEAR`は2400ms、`GAME OVER`は2300ms。
- モーション低減時は1500msのフェード。
- 完了後に1回だけ`result`へ進む。

### 完成条件

- 終了演出時間が経過時間に含まれない。
- `animationend`とフォールバックが競合しても二重遷移・二重再生しない。

## 17. Step 14: リザルトとリトライを作る

### 実装

- `startedAt`と`endedAt`から秒数を計算する。
- `RESULT`、経過時間、正解回数、失敗回数を表示する。
- 左クリックで全stateを初期化する。
- リトライ後は`opening`から始める。

### 完成条件

- クリアとゲームオーバーの両方から到達できる。
- 手帳、NEW、時間、回数、結果、会話が初期化される。

## 18. Step 15: 音とbasePathを統合する

### 実装

- `assetPath()`で`NEXT_PUBLIC_BASE_PATH`を付ける。
- 画像と音のパス生成を共通化する。
- `SoundKey`へ`end`と`closeNote`を含める。
- `play()`失敗をcatchし、進行を止めない。
- 状態遷移を開始するhandlerから音を1回だけ鳴らす。

### 完成条件

- ローカルと授業サーバで全素材が取得できる。
- renderや子コンポーネント再描画で音が増えない。

## 19. 統合順

1. 型と設定値
2. Mendeフォントと暗号データ
3. Lv別例文・問題生成
4. 会話と解答UI
5. 判定フィードバックと誤答処理
6. 手帳とNEW
7. タイマー
8. 開始演出
9. 発砲・終了タイトル
10. 音、リザルト、リトライ

`GameScreen.tsx`を複数人で同時に大きく編集しない。各機能を小さく統合し、動作確認してから次へ進む。

## 20. PR前確認

```bash
npm run lint
npm run build
npm run dev
```

- 開始、導入、Lv1〜Lv8、クリアを通せる。
- 1回目、2回目、時間切れ後の誤答を確認した。
- Space、A/D、標準Tab、背景クリック抑止を確認した。
- NEW、判定表示、選択保持、同一解答再送信禁止を確認した。
- Mende文字、RTL、フォントエラー、`basePath`を確認した。
- 両終了タイトル、`end`、`closeNote`、リザルト、リトライを確認した。
- 通常とモーション低減の両方を確認した。
- listener、timeout、音声の多重登録がない。

実行できなかった確認はPR本文へ明記する。

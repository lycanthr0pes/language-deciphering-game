# プロダクト全体フロー図

最終更新: 2026-07-20
ステータス: 仕様承認済み・実装未完了

## 1. 目的

ゲーム起動からリトライまでの画面状態、会話、例文、手帳、解答、判定、終了演出の関係を定義する。

## 2. 前提

- Next.js App Routerの1ページゲームとし、サーバー処理、DB、移動操作を使わない。
- 主な入力は左クリック、Space、A/D。Tabはゲーム操作に使わない。
- 暗号はMende Kikakuiの実Unicode文字で表示する。
- Lv1からLv8まで進み、各レベルで例文提示、問題提示、解答を行う。
- 各問題の誤答猶予は1回。時間切れだけでは即終了しない。

## 3. 全体フロー

```mermaid
flowchart TD
    A[ゲームstateを初期化] --> B[背景と人物素材を読み込む]
    B -->|成功| C[CSSまばたき演出]
    B -->|失敗・5000ms超過| X[読込エラーと再読込案内]
    C --> D[導入会話]
    D --> E[現在Lvの暗号例文を提示]
    E --> F[例文を手帳履歴へ追加]
    F --> G[問題提示・NEW・書き留め音]
    G --> H[解答受付]
    H --> I[解答する]
    I --> J[正答数と単語別結果を1400ms表示]
    J --> K{全単語正解か}
    K -->|はい・Lv1〜7| L[次Lvへ]
    L --> E
    K -->|はい・Lv8| M[クリア発砲演出]
    K -->|いいえ・継続可| H
    K -->|いいえ・終了条件| N[ゲームオーバー発砲演出]
    M --> O[GAME CLEAR]
    N --> P[GAME OVER]
    O --> Q[RESULT]
    P --> Q
    Q -->|左クリック| A
```

## 4. gamePhase

```mermaid
stateDiagram-v2
    [*] --> opening
    opening --> introDialogue
    introDialogue --> exampleDialogue
    exampleDialogue --> question
    question --> answering
    answering --> answerFeedback: 解答する
    answerFeedback --> exampleDialogue: 正解・Lv1〜7
    answerFeedback --> answering: 継続可能な誤答
    answerFeedback --> clearCutscene: Lv8正解
    answerFeedback --> gameOverCutscene: 2回目または時間切れ後の誤答
    clearCutscene --> endTitle
    gameOverCutscene --> endTitle
    endTitle --> result
    result --> opening: 左クリックでリトライ
```

## 5. 開始演出

```mermaid
flowchart TD
    A[起動・リトライ] --> B[startedAtを保存]
    B --> C[フォント・背景・通常人物を読み込む]
    C --> D{クリティカル素材が5000ms以内に読めたか}
    D -->|いいえ| E[エラーと再読込案内]
    D -->|はい| F{モーション低減か}
    F -->|いいえ| G[2300msのCSSまばたき]
    F -->|はい| H[300msフェード]
    G --> I[完了通知]
    H --> I
    I --> J[導入会話開始]
```

演出中は会話、手帳、解答を受け付けない。完了は専用`animationend`と+250msのフォールバックを同じ一度きりのガードへ接続する。

## 6. 会話表示

| 種類 | 話者 | 色 | 内容 |
| --- | --- | --- | --- |
| 通常 | 地の文 | 白 | 導入、状況説明 |
| 暗号 | 男 | 赤 | 暗号例文、問題文 |
| 日本語訳 | 男 | 青 | 例文の日本語訳 |
| 解答 | プレイヤー | 青 | 判定前の選択済み日本語 |

```mermaid
flowchart TD
    A[会話行を表示] --> B{話者は男か}
    B -->|はい| C[男の発話音]
    B -->|いいえ| D[発話音なし]
    C --> E[左クリック待ち]
    D --> E
    E --> F[会話送り音]
    F --> G{次行があるか}
    G -->|はい| A
    G -->|いいえ| H[フェーズ別の次処理]
```

導入会話の本文と順番は`src/data/introDialogues.ts`を正とし、全行を地の文として扱う。

## 7. ラウンド

```mermaid
flowchart TD
    A[startRound] --> B[Lv定義を取得]
    B --> C[例文と問題を一度だけ生成]
    C --> D[例文を履歴へ追加]
    D --> E[暗号例文を赤で提示]
    E --> F[日本語訳を青で提示]
    F --> G{追加例文をすべて提示したか}
    G -->|いいえ| E
    G -->|はい| H[問題文を赤で提示]
    H --> I[NEWを未読にする]
    I --> J[書き留め音]
    J --> K[問題会話を進める]
    K --> L[解答受付]
```

問題提示時に手帳がすでに開いている場合は、最新ページへ移動し、NEWを既読のままにする。

## 8. 手帳とNEW

```mermaid
flowchart TD
    A[通常画面] --> B{Space}
    B -->|閉じている| C[最新ページで手帳を開く]
    C --> D[NEWを既読にする]
    D --> E[例文履歴を表示]
    E --> F{A / D}
    F -->|A| G[範囲内で前ページ]
    F -->|D| H[範囲内で次ページ]
    G --> E
    H --> E
    E --> I{Space}
    I --> J[手帳を閉じる]
    J --> K[close-noteを1回再生]
    K --> A
```

- 1ページに例文を2件表示する。
- 履歴はレベルをまたいで保持する。
- 別タブ、推理入力、中央候補リスト、閉じるボタンはない。
- Tabはブラウザ標準のフォーカス移動を行う。
- NEWは上下4px、1往復1800msで動き、モーション低減時は静止する。

## 9. 暗号表示

```mermaid
flowchart LR
    A[Noto Sans Mende Kikakuiを読み込む] --> B{必須8文字を利用できるか}
    B -->|いいえ| X[エラー表示・解答進行を停止]
    B -->|はい| C[InternalCategory]
    D[CandidateIndex] --> E[cipherId]
    C --> E
    E --> F[glyphTextを生成]
    F --> G[CipherTextでRTL表示]
    E --> H[正解・候補データ]
```

- カテゴリ6文字は`U+1E800`〜`U+1E805`、候補2文字は`U+1E806`と`U+1E807`。
- 1単語はカテゴリ文字と候補文字の2文字。
- 文中のトークン配列は左から右、各単語内部は右から左。
- 正誤判定は`cipherId`とトークンIDで行い、字形を比較しない。
- フォントが`ready`になるまで暗号を描画せず、読込失敗時は仮英字などへ切り替えない。

## 10. 解答

```mermaid
flowchart TD
    A[暗号単語をクリック] --> B[activeTokenIdを更新]
    B --> C[同カテゴリの日本語候補2件だけ表示]
    C --> D[日本語候補をクリック]
    D --> E[暗号単語の下へ青で表示]
    E --> F{全トークン回答済みか}
    F -->|いいえ| A
    F -->|はい| G[解答するを有効化]
    G --> H[解答するをクリック]
    H --> I[judgeAnswer]
```

カテゴリ名は表示しない。前回の判定から内容を変更していない場合は`解答する`を無効にする。

## 11. 判定フィードバック

```mermaid
flowchart TD
    A[judgeAnswer] --> A1{誤答か}
    A1 -->|はい| A4[wrongAnswerを1回再生]
    A1 -->|いいえ| A2{終了条件が確定したか}
    A4 --> A2
    A2 -->|はい| A3[endedAtへ送信時刻を1回だけ保存]
    A2 -->|いいえ| B[AnswerJudgementを保存]
    A3 --> B
    B --> C[answerFeedback]
    C --> D[正答 n / Nと単語別結果を表示]
    D --> E[タイマーと操作を1400ms停止]
    E --> F{結果}
    F -->|全問正答| G[正解処理]
    F -->|誤答・継続可| H[選択と結果を保持してanswering]
    F -->|誤答・終了| I[ゲームオーバー処理]
    H --> J[日本語を変更]
    J --> K[判定表示を消す]
```

正答は緑と`正答`ラベル、誤答は赤と`誤答`ラベルで表示する。
誤答音は継続可否に関係なく送信handlerで1回だけ鳴らし、判定表示の再描画では鳴らさない。

## 12. 誤答と時間切れ

```mermaid
flowchart TD
    A[誤答] --> B[mistakeCountを1増やす]
    B --> C{時間切れか}
    C -->|はい| G[ゲームオーバー確定]
    C -->|いいえ| D{判定前のmistakesRemainingは0か}
    D -->|はい| G
    D -->|いいえ| E[mistakesRemainingを1減らす]
    E --> F[解答続行]
    G --> H[送信時に保存済みのendedAtを維持]
    H --> I[失敗演出]
```

タイマーは`answering`中だけ減る。0になっても即終了せず、次の誤答で終了する。次レベルでは90秒と時間切れ状態を初期化する。

## 13. 正解

```mermaid
flowchart TD
    A[全問正答] --> B[correctCountを1増やす]
    B --> C{Lv8か}
    C -->|いいえ| D[次Lvへ]
    D --> E[誤答猶予と時間を初期化]
    E --> F[次Lvの例文]
    C -->|はい| G[送信時に保存済みのendedAtを維持]
    G --> H[クリア演出]
```

## 14. 終了演出

```mermaid
flowchart TD
    A{終了種別} -->|clear| B[銃を抜く]
    A -->|gameOver| B
    B --> C[draw-gun]
    C --> D{終了種別}
    D -->|clear| E[男が自分へ銃を向ける]
    D -->|gameOver| F[男がプレイヤーへ銃を向ける]
    E --> G[発砲・100ms以内のフラッシュ]
    F --> G
    G --> H[gun-shot・暗転]
    H --> I[endを1回再生]
    I --> J{終了種別}
    J -->|clear| K[GAME CLEAR]
    J -->|gameOver| L[GAME OVER]
    K --> M[完了後RESULT]
    L --> M
```

- 通常時の`GAME CLEAR`は2400ms、`GAME OVER`は2300ms。
- モーション低減時は1500msのフェード。
- `endedAt`は送信時の判定確定時刻のまま変更せず、1400msの判定表示と終了演出の時間を経過時間へ含めない。

## 15. リザルトとリトライ

```mermaid
flowchart TD
    A[RESULT] --> B[経過時間]
    B --> C[正解回数]
    C --> D[失敗回数]
    D --> E[左クリックでリトライ]
    E --> F[全stateを初期化]
    F --> G[開始演出]
```

## 16. 設定値

| 項目 | 値 |
| --- | --- |
| 最終レベル | 8 |
| 誤答猶予 | 1 |
| 制限時間の変更可能な既定値 | 90秒 |
| 警告開始の変更可能な既定値 | 15秒 |
| 手帳1ページ | 例文2件 |
| NEW | 上下4px、1往復1800ms |
| 判定表示 | 1400ms |
| 開始演出 | 2300ms |
| 開始演出・モーション低減 | 300ms |
| 素材読込タイムアウト | 5000ms |
| 発砲フラッシュ | 最大100ms |
| GAME OVER | 2300ms |
| GAME CLEAR | 2400ms |
| 終了タイトル・モーション低減 | 1500ms |

## 17. 通し確認

- 開始演出から導入、Lv1〜Lv8、クリアまで進める。
- 1回目の誤答、2回目の誤答、時間切れ後の誤答を確認する。
- 手帳履歴、NEW既読、ページ境界、Space、A/D、標準Tabを確認する。
- Mende文字、文字方向、フォントエラーを確認する。
- 判定中の停止、選択保持、同一解答の再送信禁止を確認する。
- 両発砲演出、終了タイトル、音、リザルト、リトライを確認する。
- listener、timeout、効果音が多重登録・多重再生されないことを確認する。

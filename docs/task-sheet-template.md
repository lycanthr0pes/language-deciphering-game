# タスク管理用 Google スプレッドシート設計

最終更新: 2026-07-20

このファイルは現行仕様をもとにした進捗管理テンプレートであり、プロダクト仕様の根拠にはしない。仕様は`game-rule.md`、`mende-kikakui-font-guide.md`、`sound-change-spec.md`、`test-version-change-spec.md`、`implementation-spec.md`を参照する。

## 1. 列

```tsv
タスクID	カテゴリ	タスク名	担当者	補助担当	優先度	ステータス	成果物	関連ファイル	依存タスク	PM確認	メモ	PR/URL
```

## 2. 参照文書

```tsv
ファイル	反映内容
game-rule.md	語彙、Lv1〜8、例文数、判定、誤答、時間、手帳、終了条件
mende-kikakui-font-guide.md	Mendeフォント、Unicode、文字方向、ライセンス
sound-change-spec.md	終了タイトル音、手帳を閉じる音、basePath
test-version-change-spec.md	NEW、手帳簡素化、判定表示、開始・終了演出
ui-spec.md	画面、色、Figma、素材、モーション
implementation-spec.md	型、state、props、コンポーネント、処理責務
project-flow.md	ゲーム状態と画面遷移
implementation-step-guide.md	実装順と統合確認
github-policy.md	Git、commit、Pull Request
```

## 3. タスク一覧

```tsv
タスクID	カテゴリ	タスク名	担当者	補助担当	優先度	ステータス	成果物	関連ファイル	依存タスク	PM確認	メモ	PR/URL
T001	PM	C01〜C07を正式仕様化	@ly	全員	高	完了	承認済み仕様	本書以外の全仕様		承認	2026-07-20承認
T002	PM	Mendeフォント仕様を確定	@ly	@ささかまぼこ。, @ほっそー	高	完了	Mendeフォント仕様	mende-kikakui-font-guide.md		承認	M01〜M08承認
T003	PM	音仕様を確定	@ly	@ほっそー	中	完了	音仕様	sound-change-spec.md		承認	end、closeNote、openNote、wrongAnswerを承認。誤答音素材は未配置
T004	UI/絵	通常ゲーム画面を作成	@ささかまぼこ。	@ly	高	未着手	Figmaフレーム	ui-spec.md	T001	未確認	16:9、男、机、会話、時間
T005	UI/絵	Mende暗号表示を作成	@ささかまぼこ。	@ほっそー	高	未着手	2・3・5単語フレーム	mende-kikakui-font-guide.md	T002	未確認	Webと同じUnicode対応
T006	UI/絵	例文専用手帳とNEWを作成	@ささかまぼこ。	@ほっそー	高	未着手	手帳・NEWフレーム	ui-spec.md, test-version-change-spec.md	T004	未確認	別タブと閉じるボタンなし
T007	UI/絵	判定状態を作成	@ささかまぼこ。	@かまぼこ(本物)	高	未着手	判定差分	ui-spec.md, test-version-change-spec.md	T004	未確認	正答数、緑、赤、ラベル
T008	UI/絵	開始・終了タイトルを作成	@ささかまぼこ。	@ほっそー	中	未着手	演出確認フレーム	ui-spec.md	T004	未確認	まばたき画像とタイトル画像は不要
T009	実装	共有型と設定値を整備	@ほっそー	@かまぼこ(本物)	高	未着手	gameTypes/gameConfig	implementation-spec.md	T001	未確認	GamePhase、AnswerJudgement、全時間
T010	実装	Mendeフォントと暗号データを実装	@ほっそー	@ささかまぼこ。	高	未着手	fonts/CipherText/cipherGlyphs	mende-kikakui-font-guide.md	T002,T009	未確認	U+1E800〜U+1E807、LTR/RTL
T011	実装	Lv別例文・問題生成を実装	@ほっそー	@かまぼこ(本物)	高	未着手	wordPools/templates/generator	game-rule.md, implementation-spec.md	T009,T010	未確認	累計10例文、Lv1〜8
T012	実装	会話と解答UIを接続	@かまぼこ(本物)	@ほっそー	高	未着手	DialogueBox/ChoiceList	implementation-spec.md	T011	未確認	カテゴリ名を表示しない
T013	実装	正答数と単語別判定を実装	@かまぼこ(本物)	@ほっそー	高	未着手	judgeAnswer/判定UI	implementation-spec.md	T012	未確認	1400ms、選択保持、再送信禁止
T014	実装	誤答・時間切れを実装	@かまぼこ(本物)	@ほっそー	高	未着手	誤答分岐/TimerDisplay	game-rule.md, implementation-spec.md	T013	未確認	1回猶予、時間切れ後の誤答
T015	実装	例文専用手帳とNEWを実装	@ほっそー	@かまぼこ(本物)	高	未着手	Notebook/未読state	implementation-spec.md	T006,T011	未確認	Space、A/D、2件、1800ms
T016	実装	CSSまばたきを実装	@ほっそー	@ささかまぼこ。	中	未着手	OpeningBlink	implementation-spec.md	T008,T009	未確認	2300ms、低減300ms、素材エラー
T017	実装	発砲・終了タイトルを実装	@ほっそー	@ささかまぼこ。	中	未着手	Cutscene/EndTitle	implementation-spec.md	T008,T009	未確認	両終了分岐、完了ガード
T018	実装	音とbasePathを実装	@ほっそー	@かまぼこ(本物)	中	作業中	sound/assetPath	sound-change-spec.md	T003,T015,T017	未確認	end、closeNote、openNote、wrongAnswer。誤答音素材は未配置
T019	実装	リザルトとリトライを実装	@かまぼこ(本物)	@ほっそー	高	未着手	ResultScreen/reset	implementation-spec.md	T014,T017	未確認	endedAtは判定確定時
T020	全体	GameScreenへ統合	@かまぼこ(本物)	@ほっそー	高	未着手	統合PR	implementation-spec.md	T010,T011,T012,T013,T014,T015,T016,T017,T018,T019	未確認	同時編集を避ける
T021	全体	PCブラウザ通し確認	@かまぼこ(本物), @ほっそー	@ly	高	未着手	確認記録	全仕様	T020	未確認	通常・低減・エラー・basePath
T022	全体	PM最終プレイ	@ly	全員	高	未着手	承認結果	全仕様	T021	未確認	開始から両終了・リトライ
```

## 4. 入力規則

```tsv
種類	選択肢	説明
ステータス	未着手	まだ開始していない
ステータス	仕様確認中	決定待ちまたは不明点がある
ステータス	作業中	担当者が実装・制作している
ステータス	PM確認待ち	成果物をPMへ提出済み
ステータス	修正中	レビュー結果を反映している
ステータス	完了	成果物と必要な確認が完了した
ステータス	保留	依存タスクや外部要因で停止中
優先度	高	ゲーム成立または依存元になる
優先度	中	品質上重要だが高優先度の後でよい
優先度	低	余裕があれば対応する
PM確認	未確認	まだ確認していない
PM確認	確認中	確認中
PM確認	修正依頼	修正が必要
PM確認	承認	PMが承認した
```

## 5. PM確認表

```tsv
カテゴリ	確認項目	見る対象	判定	メモ
仕様	Lv1〜Lv8、例文累計10件が正しいか	ゲーム通しプレイ
フォント	Mende実Unicodeだけが表示されるか	通常、問題、手帳
フォント	文はLTR、単語内部はRTLか	2・3・5単語問題
手帳	例文履歴だけでSpace・A/Dが動くか	手帳
NEW	問題提示時に出て最初の手帳表示で消えるか	NEW
判定	正答数、単語別結果、選択保持が正しいか	解答UI
誤答	1回目、2回目、時間切れ後が正しく分岐するか	ゲーム進行
演出	開始、両発砲、両終了タイトルが1回ずつ進むか	演出
音	end、closeNote、openNote、wrongAnswerが条件どおり1回鳴るか	音
配信	フォント・画像・音がbasePathで取得できるか	Network
リザルト	判定表示・終了演出を含めない経過時間と回数が出るか	RESULT
```

## 6. 運用

- 仕様変更時は関連するタスクの説明、依存、PM確認欄を更新する。
- PR提出時はURL、やったこと、確認したこと、PM確認点を記録する。
- `GameScreen.tsx`の大きな編集は主担当を1人にする。
- 実行できなかった確認、素材不足、既知の問題をメモへ残す。
- 担当者の作業完了だけでなく、必要なレビューと確認が済んだ時に完了へする。

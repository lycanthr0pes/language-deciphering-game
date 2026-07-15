# タスク管理用 Google スプレッドシート設計

このファイルは、現在のプロジェクト内Markdownをもとにしたタスク管理スプレッドシート用テンプレートです。
各コードブロックはTSV形式のため、そのままGoogleスプレッドシートに貼り付けて使用できます。

タスク一覧シートの列は、以下の13列のみとします。

```tsv
タスクID	カテゴリ	タスク名	担当者	補助担当	優先度	ステータス	成果物	関連ファイル	依存タスク	PM確認	メモ	PR/URL
```

## 確認したMarkdown

```tsv
ファイル	反映内容
project-flow.md	ゲーム全体フロー、Lv1〜Lv8、誤答ルール、手帳、リザルト、効果音、実装優先順
game-rule.md	日本語語彙、暗号仮ルール、レベル構成、解答判定、手帳操作、誤答ルール
ui-spec.md	UI/絵、Figma制作物、手帳、解答UI、時間表示、演出素材、PM決定項目
implementation-spec.md	Next.js/React構成、コンポーネント、state、props、判定、タイマー、効果音
implementation-step-guide.md	初心者向け実装順、分担、統合手順、PR前確認
github-policy.md	GitHub運用、ブランチ、PR、README方針
training-task.md	GitHub/Next.js基本操作確認課題
pm-preparation-checklist.md	PM準備、決定事項、GitHub、README、UI/実装/音の準備
AI-guide.md	AI利用ルール、PR前チェック、禁止事項、報告方法
beginner-code-cheatsheet.md	初心者向けReact/TypeScript/CSS Modules補助資料
sample-code-snippets.md	実装用サンプルコード、型、コンポーネント、タイマー、手帳
```

## 推奨シート構成

```tsv
シート名	用途
タスク一覧	日々のタスク管理本体。列は指定13列のみ
入力規則	ステータス・優先度・担当者などの選択肢管理
進捗確認ログ	定例・進捗確認の記録
PM確認項目	PMがレビュー時に見るチェックリスト
ゲームルール確認	game-rule.md と他仕様の確定・未確定事項確認
運用ルール	チーム内でのタスク管理ルール
```

## タスク一覧

```tsv
タスクID	カテゴリ	タスク名	担当者	補助担当	優先度	ステータス	成果物	関連ファイル	依存タスク	PM確認	メモ	PR/URL
T001	PM	全体フロー図の確認・更新	@ly		高	完了	project-flow.md	project-flow.md		未確認	現在のゲーム進行、Lv1〜Lv8、誤答ルールを反映済み	
T002	PM	ゲームルール仕様の確認・更新	@ly		高	完了	game-rule.md	game-rule.md	T001	未確認	日本語語彙、Lv構成、誤答ルールは確定。暗号表記は未確定	
T003	PM	UI仕様書の確認・更新	@ly	@ささかまぼこ。	高	完了	ui-spec.md	ui-spec.md, game-rule.md	T002	未確認	時間表示と間違い可能回数表示あり。制限時間の数値はPM最終決定	
T004	PM	実装仕様書の確認・更新	@ly	@かまぼこ(本物), @ほっそー	高	完了	implementation-spec.md	implementation-spec.md, game-rule.md	T002	未確認	TimerDisplay、timeLimitSeconds 90、warningTimeSeconds 15 は初期案	
T005	PM	GitHub管理方針の確認・更新	@ly		高	完了	github-policy.md	github-policy.md		未確認	VS Code Source Control中心、work/*、PR経由	
T006	PM	実装手順書・補助資料の共有	@ly	@かまぼこ(本物), @ほっそー	中	完了	implementation-step-guide.md, beginner-code-cheatsheet.md, sample-code-snippets.md	implementation-step-guide.md, beginner-code-cheatsheet.md, sample-code-snippets.md		未確認	初心者向け作業順とサンプルコード	
T007	PM	AI利用ガイドの共有	@ly	@かまぼこ(本物), @ほっそー	中	完了	AI-guide.md	AI-guide.md		未確認	AIに任せてよい範囲と禁止事項を共有	
T008	PM	タスク管理シートを更新	@ly		高	完了	task-sheet-template.md	task-sheet-template.md	T001,T002,T003,T004	未確認	指定13列のみに整理済み	
T009	PM	GitHubリポジトリを作成	@ly		高	未着手	リポジトリURL	github-policy.md, pm-preparation-checklist.md	T005	未確認	メンバーに共有できるURLを用意	
T010	PM	メンバーをGitHubに招待	@ly		高	未着手	招待完了	github-policy.md, pm-preparation-checklist.md	T009	未確認	@ささかまぼこ。、@かまぼこ(本物)、@ほっそーを招待	
T011	PM	連絡場所・提出先を決定	@ly		高	未着手	Discordチャンネル/提出先	pm-preparation-checklist.md, training-task.md		未確認	練習課題、PR、素材提出の場所を決める	
T012	PM	READMEを作成	@ly		中	未着手	README.md	github-policy.md, pm-preparation-checklist.md	T009	未確認	ゲーム概要、起動方法、関連資料を書く	
T013	PM	PM決定事項を確定	@ly	@ささかまぼこ。, @かまぼこ(本物), @ほっそー	高	仕様確認中	決定メモ	pm-preparation-checklist.md, ui-spec.md, implementation-spec.md	T002,T003,T004	未確認	制限時間、警告ライン、暗号表現、照明、仮面、会話表示、手帳、演出枚数	
T014	PM	暗号表記の最終方針を決定	@ly	@ささかまぼこ。, @かまぼこ(本物)	高	仕様確認中	暗号表記方針	game-rule.md, ui-spec.md, implementation-spec.md	T002	未確認	存在しない英単語風か暗号フォントか	
T015	PM	制限時間・警告ラインの数値を確定	@ly	@かまぼこ(本物), @ほっそー	高	仕様確認中	決定メモ/gameConfig更新	game-rule.md, implementation-spec.md, ui-spec.md	T013	未確認	時間制限は採用。90秒/15秒を初期案としてPMが最終決定する	
T016	教育	GitHub/Next.js基本課題の期限・提出先を確定	@ly		高	未着手	training-task.md	training-task.md, pm-preparation-checklist.md	T009,T011	未確認	training-task.mdのPM記入欄を埋める	
T017	教育	基本課題を実施	@かまぼこ(本物)	@ly	高	未着手	PR/スクリーンショット	training-task.md	T016	未確認	clone、npm install、npm run dev、README/page.tsx変更	
T018	教育	基本課題を実施	@ほっそー	@ly	高	未着手	PR/スクリーンショット	training-task.md	T016	未確認	clone、npm install、npm run dev、README/page.tsx変更	
T019	UI/絵	Figmaファイルと初回提出範囲を準備	@ly	@ささかまぼこ。	高	未着手	Figma URL	pm-preparation-checklist.md, ui-spec.md	T011,T013	未確認	通常画面、問題画面、手帳、リザルトのラフ	
T020	UI/絵	通常ゲーム画面レイアウトを作成	@ささかまぼこ。	@ly	高	未着手	画面レイアウト	ui-spec.md	T003,T019	未確認	暗い部屋、仮面の男、机、手帳、ペン、操作案内	
T021	UI/絵	暗号文・会話ボックスの見た目を作成	@ささかまぼこ。	@ly	高	未着手	会話UI	ui-spec.md, project-flow.md	T020	未確認	白/赤/青の表示色、半透明ボックスまたは文字のみ	
T022	UI/絵	問題・解答UIを作成	@ささかまぼこ。	@かまぼこ(本物)	高	未着手	解答UI	ui-spec.md, game-rule.md	T020	未確認	品詞ラベルを出さない、暗号単語クリックと日本語候補リスト	
T023	UI/絵	手帳UIとNEW表示を作成	@ささかまぼこ。	@ほっそー	高	未着手	手帳UI	ui-spec.md, game-rule.md	T020	未確認	例文メモ、推測メモ、中央単語リスト、Space/Tab/A-D案内	
T024	UI/絵	時間表示・間違い可能回数表示を作成	@ささかまぼこ。	@ほっそー	中	未着手	状態表示UI	ui-spec.md, implementation-spec.md	T013,T015,T020	未確認	残り時間、警告色、間違い可能0の赤表示	
T025	UI/絵	仮面の男と背景素材を作成	@ささかまぼこ。	@ly	高	未着手	背景/男素材	ui-spec.md	T020,T013	未確認	照明、仮面、机、手帳、ペン、ビネット	
T026	UI/絵	失敗・クリア演出素材を作成	@ささかまぼこ。	@ly	中	未着手	演出素材	ui-spec.md, project-flow.md	T013,T025	未確認	失敗は銃をこちら、クリアは銃を自分へ向ける	
T027	UI/絵	リザルト画面を作成	@ささかまぼこ。	@ほっそー	中	未着手	リザルトUI	ui-spec.md	T020	未確認	クリア時間、正解回数、失敗回数、左クリックでリトライ	
T028	UI/絵	素材書き出し・命名ルールを確定	@ささかまぼこ。	@かまぼこ(本物)	中	未着手	画像素材一式	ui-spec.md, implementation-spec.md, pm-preparation-checklist.md	T025,T026,T027	未確認	public/assets/imagesで使いやすい名前にする	
T029	実装	Next.js初期環境を構築	@かまぼこ(本物)	@ほっそー	高	未着手	Next.js環境	implementation-spec.md, implementation-step-guide.md, github-policy.md	T009,T017,T018	未確認	TypeScript、App Router、CSS Modules想定	
T030	実装	GameScreen基本画面とstate基盤を実装	@かまぼこ(本物)	@ほっそー	高	未着手	GameScreen	implementation-spec.md, implementation-step-guide.md	T029	未確認	gamePhase、currentLevel、正解/失敗回数などの親state	
T031	実装	DialogueBoxと導入会話・会話送りを実装	@かまぼこ(本物)	@ほっそー	高	未着手	DialogueBox	implementation-spec.md, project-flow.md	T030	未確認	左クリック進行、白/赤/青表示、男の発話効果音連携	
T032	実装	gameTypes・gameConfigを整備	@ほっそー	@かまぼこ(本物)	高	未着手	gameTypes.ts/gameConfig.ts	implementation-spec.md, game-rule.md	T013,T015,T030	未確認	finalLevel、safeMistakeCount、timeLimitSecondsなど	
T033	実装	暗号語彙・例文・問題生成を実装	@ほっそー	@かまぼこ(本物)	高	未着手	wordPools/exampleTemplates/cipherGenerator	implementation-spec.md, game-rule.md	T014,T032	未確認	Lv1〜Lv8、累計例文10個、暗号表記は仮例対応	
T034	実装	ChoiceListと暗号単語選択式解答UIを実装	@かまぼこ(本物)	@ほっそー	高	未着手	ChoiceList	implementation-spec.md, ui-spec.md, game-rule.md	T022,T030,T033	未確認	選択中カテゴリ内候補のみ表示、品詞ラベル非表示	
T035	実装	正誤判定・正解/不正解処理を実装	@かまぼこ(本物)	@ほっそー	高	未着手	judgeAnswer/判定処理	implementation-spec.md, game-rule.md	T034	未確認	解答ボタン押下時だけ全単語まとめて判定	
T036	実装	誤答回数・ゲームオーバー条件を実装	@かまぼこ(本物)	@ほっそー	高	未着手	誤答判定	implementation-spec.md, game-rule.md	T035	未確認	各問題1回セーフ、0でさらに誤答なら失敗演出	
T037	実装	手帳開閉・例文メモ・推測メモを実装	@ほっそー	@かまぼこ(本物)	高	未着手	Notebook	implementation-spec.md, ui-spec.md, game-rule.md	T023,T030,T033	未確認	Space開閉、Tab切替、A/Dページ移動、内容持ち越し	
T038	実装	TimerDisplayと時間切れ処理を実装	@ほっそー	@かまぼこ(本物)	中	仕様確認中	TimerDisplay	implementation-spec.md, ui-spec.md	T015,T032,T036	未確認	制限時間採用時のみ。時間切れだけでは即終了しない	
T039	実装	CutsceneScreenを実装	@ほっそー	@ささかまぼこ。	中	未着手	CutsceneScreen	implementation-spec.md, ui-spec.md	T026,T036	未確認	失敗/クリア3シーン、演出後リザルト	
T040	実装	ResultScreenとクリア時間計測を実装	@かまぼこ(本物)	@ほっそー	高	未着手	ResultScreen/formatTime	implementation-spec.md, ui-spec.md	T027,T035,T038	未確認	クリア時間、正解回数、失敗回数、左クリックリトライ	
T041	音	効果音素材を準備	@ly	@ほっそー	中	未着手	音素材一式	pm-preparation-checklist.md, ui-spec.md, implementation-spec.md	T013	未確認	dialogue-next、man-talk、write-note、draw-gun、gun-shot	
T042	実装	効果音再生処理を実装	@ほっそー	@ly	中	未着手	sound.ts	implementation-spec.md	T031,T039,T041	未確認	ユーザー操作後に再生。男のセリフと書き留めタイミング注意	
T043	実装	画像素材を実装へ差し替え	@ほっそー	@ささかまぼこ。	中	未着手	画像差し替え	implementation-step-guide.md, ui-spec.md	T028,T030	未確認	public/assets/imagesを参照	
T044	全体	機能統合とコンフリクト管理	@かまぼこ(本物)	@ほっそー	高	未着手	統合PR	implementation-step-guide.md, implementation-spec.md	T031,T033,T034,T035,T037,T038,T039,T040	未確認	GameScreen統合は主担当を決める	
T045	全体	Pull Request前チェックを実施	@かまぼこ(本物), @ほっそー	@ly	高	未着手	動作確認メモ	implementation-spec.md, implementation-step-guide.md, github-policy.md	T044	未確認	npm run dev、操作、判定、手帳、タイマー、リザルト確認	
T046	全体	PM通しプレイ確認	@ly	全員	高	未着手	PMレビュー結果	project-flow.md, game-rule.md, ui-spec.md, implementation-spec.md	T045	未確認	Lv1〜Lv8、ゲームオーバー、クリア、リトライまで確認	
T047	全体	PMレビュー修正対応	@かまぼこ(本物), @ほっそー	@ly	高	未着手	修正PR	PMレビュー結果	T046	未確認	仕様違い、UI違和感、操作不具合を修正	
```

## 入力規則

```tsv
種類	選択肢	説明
ステータス	未着手	まだ作業を開始していない
ステータス	仕様確認中	仕様が曖昧、またはPM決定待ち
ステータス	作業中	担当者が作業している
ステータス	PM確認待ち	成果物・PR・画面確認をPMに依頼している
ステータス	修正中	PM確認やレビュー後の修正中
ステータス	完了	PM確認まで終わっている、または成果物作成済み
ステータス	保留	依存タスクや判断待ちで止めている
ステータス	中止	今回は対応しない
優先度	高	ゲーム成立、開発開始、または他タスクの前提になる
優先度	中	体験品質や運用に重要だが、高優先度の後でよい
優先度	低	余裕があれば対応する
PM確認	未確認	まだPMが確認していない
PM確認	確認中	PMが確認している
PM確認	修正依頼	修正が必要
PM確認	承認	PMが完了扱いにしてよいと判断した
カテゴリ	PM	仕様・管理・方針・決定事項
カテゴリ	教育	GitHub/Next.js練習課題、補助資料
カテゴリ	UI/絵	画面設計・素材・演出絵
カテゴリ	実装	Next.js/React実装
カテゴリ	音	効果音・音方針
カテゴリ	全体	結合確認・通し確認
担当者	@ly	PM、音
担当者	@ささかまぼこ。	UI、絵
担当者	@かまぼこ(本物)	実装
担当者	@ほっそー	実装
担当者	全員	全メンバー対象
```

## 進捗確認ログ

```tsv
日付	確認者	対象担当者	確認タスクID	現在ステータス	進捗内容	困っていること	次アクション	PM判断
	@ly	@ささかまぼこ。					UIラフと素材範囲を確認する	
	@ly	@かまぼこ(本物)					GameScreen、ChoiceList、判定、PR予定を確認する	
	@ly	@ほっそー					暗号データ、手帳、タイマー、演出、効果音を確認する	
```

## 進捗確認時の使い方

```tsv
タイミング	見る場所	確認すること	PMの判断
作業開始前	タスク一覧	担当者、補助担当、優先度、依存タスクが入っているか	不足があればPMが追記する
毎回の進捗確認	タスク一覧	ステータスが最新か	古ければ担当者に更新してもらう
毎回の進捗確認	メモ	終わったこと、残っていること、困っていることが書かれているか	次アクションをメモに追記する
仕様確認時	ステータス	仕様確認中のタスクが止まっていないか	PMが決定するか、保留にする
PR提出時	PR/URL	PRリンクが貼られているか	ステータスをPM確認待ちに変更する
PM確認時	PM確認	承認、修正依頼、確認中のどれかにする	完了可否を決める
完了時	成果物	成果物名、関連ファイル、PR/URLが入っているか	ステータスを完了にする
遅延・詰まり時	メモ	止まっている理由が書かれているか	担当変更、スコープ調整、仕様決定を行う
```

## PM確認項目

```tsv
確認カテゴリ	確認項目	見る対象	判定	メモ
仕様	Lv1からLv8までの進行が仕様通りか	project-flow.md, game-rule.md, implementation-spec.md		
仕様	日本語語彙、暗号仮ルール、例文追加数が反映されているか	game-rule.md, implementation-spec.md		
仕様	暗号表記の最終方針が決まっているか	game-rule.md, ui-spec.md, implementation-spec.md		
仕様	制限時間と警告ラインの数値が決まっているか	pm-preparation-checklist.md, ui-spec.md, implementation-spec.md		
UI/絵	暗い・不気味・閉鎖的な雰囲気になっているか	ui-spec.md, Figma		
UI/絵	品詞名・カテゴリ名をプレイヤーに見せないUIになっているか	解答UI, 手帳UI		
UI/絵	手帳、NEW表示、時間表示、間違い可能回数表示が見やすいか	ui-spec.md, Figma		
UI/絵	失敗演出とクリア演出で銃の向きが区別できるか	演出素材		
実装	左クリック、Space、Tab、A/Dが仕様通り動くか	ゲーム画面		
実装	解答ボタン押下時だけ全単語をまとめて判定するか	ChoiceList, judgeAnswer		
実装	各問題1回だけ誤答セーフ、2回目誤答でゲームオーバーになるか	誤答判定		
実装	時間切れだけでは終了せず、次の不正解で終了するか	TimerDisplay, 誤答判定		
実装	Lv8正解後にクリア演出へ進むか	ゲーム進行		
実装	リザルトにクリア時間、正解回数、失敗回数が表示されるか	ResultScreen		
音	会話送り、男の発話、書き留め、銃、発砲の効果音が適切か	sound.ts, 音素材		
GitHub	PR本文にやったこと、確認したこと、PM確認点が書かれているか	Pull Request		
進行	高優先度タスクが先に進んでいるか	タスク一覧		
進行	依存タスクで止まっている作業がないか	依存タスク, メモ		
```

## ゲームルール確認

```tsv
確認項目	現在の内容	状態	PM判断	関連タスクID	メモ
日本語語彙	色、性質、人系名詞、動物系名詞、数量、動詞の各2候補は確定	確定		T002,T033,T034	
暗号表記	存在しないアルファベット単語にするか、暗号フォントにするか未確定	未確定		T014	`raka` などは仮例
レベル構成	Lv1からLv8まで順番に進み、Lv8正解でクリア	確定		T002,T033,T046	
例文追加数	Lv1で3個、Lv2以降は各1個追加し、累計10個	確定		T033,T037	
解答UI	暗号単語を左クリックし、対応カテゴリ内の日本語候補だけを表示する	確定		T022,T034	品詞名・カテゴリ名は表示しない
解答判定	全単語に解答後、解答するボタンを押した時だけまとめて判定する	確定		T035	
誤答ルール	各問題で1回だけ誤答セーフ。2回目の誤答でゲームオーバー	確定		T036	次の問題では間違い可能回数を1に戻す
手帳操作	Spaceで開閉、Tabでメモ切替、A/Dでページ移動	確定		T023,T037	
手帳内容	例文メモと推測メモは次の問題へ持ち越し、正解後もリセットしない	確定		T037	
制限時間	時間制限は採用。初期案は1問90秒、警告15秒。時間切れ後の誤答でゲームオーバー	数値未確定		T015,T024,T038	90秒/15秒で確定するかPM判断が必要
リトライ	リザルト画面から左クリックでリトライ	確定		T040	
将来拡張	日本語単語数追加、暗号単語数追加、OK/NG問題追加	保留			余裕があれば対応
```

## 運用ルール

```tsv
ルール	内容
ステータス更新	担当者は作業前後にステータスを更新する
PM確認待ち	成果物やPRを出したらステータスをPM確認待ちにする
完了条件	担当者の作業完了だけでは完了にせず、PM承認後に完了にする
メモ運用	期限、詰まり、未完成項目、相談事項はメモ列に書く
優先度	高はゲーム成立・開発開始・依存元、中は体験品質や運用、低は余裕があれば対応
進捗確認	確認時は「終わったこと」「次にやること」「困っていること」を必ず見る
PR確認	実装タスクは可能な限りPR/URL欄にリンクを貼る
仕様更新	game-rule.md、ui-spec.md、implementation-spec.md のどれかを変更した場合は関連タスクも確認する
```

# 完成版実装サンプルコード

最終更新: 2026-07-21
ステータス: 完成版仕様案・PM承認待ち

## 1. この文書の扱い

この文書は`final-version-spec-and-roles.md`を実装へ落とし込むための非規範サンプルである。完成仕様の正本ではない。

- PM承認前に現行コードへコピーしない。
- 実装時は現行コード、Next.js 16.2.9の`node_modules/next/dist/docs/`、既存メイン資料を再確認する。
- 型名やファイル分割は既存コードとの統合時に整理してよいが、挙動とデータは仕様書から変更しない。
- タスクと担当は`final-version-task-sheet.md`を参照する。

## 2. 共有型

```ts
export type Difficulty = "easy" | "hard";
export type MenuView = "root" | "guide" | "difficulty";

export type GamePhase =
  | "menu"
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

export type WordCategory =
  | "color"
  | "quality"
  | "quantity"
  | "noun"
  | "verb";

export type NounKind = "human" | "animal" | "object";
export type CipherSlotIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type ShortCipherSlotIndex = 1 | 2 | 3 | 4;

export type CipherId =
  | `color-${ShortCipherSlotIndex}`
  | `quality-${ShortCipherSlotIndex}`
  | `quantity-${ShortCipherSlotIndex}`
  | `noun-${CipherSlotIndex}`
  | `verb-${ShortCipherSlotIndex}`;

export type WordId =
  | "color-red" | "color-blue" | "color-black" | "color-white"
  | "quality-large" | "quality-small" | "quality-old" | "quality-broken"
  | "quantity-some" | "quantity-many" | "quantity-one-human" | "quantity-one-animal"
  | "noun-man" | "noun-woman" | "noun-dog" | "noun-cat"
  | "noun-bird" | "noun-fish" | "noun-chair" | "noun-door"
  | "verb-see" | "verb-chase" | "verb-sleep" | "verb-creak";

export type WordEntry = {
  wordId: WordId;
  category: WordCategory;
  ja: string;
  nounKind?: NounKind;
  allowedNounKinds?: readonly NounKind[];
};

export type DifficultyConfig = {
  timeLimitSeconds: number | null;
  warningTimeSeconds: number | null;
  safeMistakeCount: 0 | 1;
};

export type SentencePattern = readonly WordCategory[];

export type StageGenerationRule = {
  level: number;
  exampleCount: number;
  pattern: SentencePattern;
  unknownWordCount: 0 | 1 | 2;
  choiceCount: 4 | 6 | 8 | 10;
  fallbackSeed: string;
};

export type WordAssignments = Readonly<Record<CipherId, WordId>>;

export type GeneratedStage = {
  level: number;
  examples: readonly (readonly WordId[])[];
  question: readonly WordId[];
  unknownWordIds: readonly WordId[];
  choiceCount: 4 | 6 | 8 | 10;
  choiceCandidatesByTokenId: Readonly<Record<string, readonly string[]>>;
};

export type RunDefinition = {
  runSeed: string;
  wordAssignments: WordAssignments;
  stages: readonly GeneratedStage[];
};
```

`timeLimitSeconds: null`はタイマーを停止するのではなく、タイマー自体を生成・表示しない意味にする。

## 3. 難易度設定

```ts
export const DIFFICULTY_CONFIG = {
  easy: {
    timeLimitSeconds: null,
    warningTimeSeconds: null,
    safeMistakeCount: 1,
  },
  hard: {
    timeLimitSeconds: 90,
    warningTimeSeconds: 15,
    safeMistakeCount: 0,
  },
} as const satisfies Record<Difficulty, DifficultyConfig>;
```

EASYとHARDでステージデータは分けない。違いは誤答猶予、時間、右上表示だけにする。

## 4. Mende暗号再割当

```ts
const CATEGORY_CODE_POINTS: Record<WordCategory, number> = {
  color: 0x1e800,
  quality: 0x1e801,
  quantity: 0x1e802,
  noun: 0x1e803,
  verb: 0x1e804,
};

const WORD_CODE_POINTS: Record<CipherSlotIndex, number> = {
  1: 0x1e805,
  2: 0x1e806,
  3: 0x1e807,
  4: 0x1e808,
  5: 0x1e809,
  6: 0x1e80a,
  7: 0x1e80b,
  8: 0x1e80c,
};

export function createGlyphText(
  category: WordCategory,
  slotIndex: CipherSlotIndex,
) {
  return String.fromCodePoint(
    CATEGORY_CODE_POINTS[category],
    WORD_CODE_POINTS[slotIndex],
  );
}

export const REQUIRED_MENDE_GLYPHS = [
  ...Object.values(CATEGORY_CODE_POINTS),
  ...Object.values(WORD_CODE_POINTS),
]
  .map((codePoint) => String.fromCodePoint(codePoint))
  .join("");
```

`glyphText`は分類文字、単語文字の論理順で作る。見た目のRTLは`CipherText`のCSSだけで制御し、配列を反転させない。

## 5. 24語と意味属性

```ts
const ALL_NOUN_KINDS = ["human", "animal", "object"] as const;
const ANIMATE_NOUN_KINDS = ["human", "animal"] as const;

export const WORDS = [
  { wordId: "color-red", category: "color", ja: "赤い", allowedNounKinds: ALL_NOUN_KINDS },
  { wordId: "color-blue", category: "color", ja: "青い", allowedNounKinds: ALL_NOUN_KINDS },
  { wordId: "color-black", category: "color", ja: "黒い", allowedNounKinds: ALL_NOUN_KINDS },
  { wordId: "color-white", category: "color", ja: "白い", allowedNounKinds: ALL_NOUN_KINDS },

  { wordId: "quality-large", category: "quality", ja: "大きな", allowedNounKinds: ALL_NOUN_KINDS },
  { wordId: "quality-small", category: "quality", ja: "小さな", allowedNounKinds: ALL_NOUN_KINDS },
  { wordId: "quality-old", category: "quality", ja: "古い", allowedNounKinds: ALL_NOUN_KINDS },
  { wordId: "quality-broken", category: "quality", ja: "壊れた", allowedNounKinds: ["object"] },

  { wordId: "quantity-some", category: "quantity", ja: "いくつかの", allowedNounKinds: ALL_NOUN_KINDS },
  { wordId: "quantity-many", category: "quantity", ja: "たくさんの", allowedNounKinds: ALL_NOUN_KINDS },
  { wordId: "quantity-one-human", category: "quantity", ja: "ひとりの", allowedNounKinds: ["human"] },
  { wordId: "quantity-one-animal", category: "quantity", ja: "一匹の", allowedNounKinds: ["animal"] },

  { wordId: "noun-man", category: "noun", ja: "男", nounKind: "human" },
  { wordId: "noun-woman", category: "noun", ja: "女", nounKind: "human" },
  { wordId: "noun-dog", category: "noun", ja: "犬", nounKind: "animal" },
  { wordId: "noun-cat", category: "noun", ja: "猫", nounKind: "animal" },
  { wordId: "noun-bird", category: "noun", ja: "鳥", nounKind: "animal" },
  { wordId: "noun-fish", category: "noun", ja: "魚", nounKind: "animal" },
  { wordId: "noun-chair", category: "noun", ja: "椅子", nounKind: "object" },
  { wordId: "noun-door", category: "noun", ja: "扉", nounKind: "object" },

  { wordId: "verb-see", category: "verb", ja: "見る", allowedNounKinds: ANIMATE_NOUN_KINDS },
  { wordId: "verb-chase", category: "verb", ja: "追う", allowedNounKinds: ANIMATE_NOUN_KINDS },
  { wordId: "verb-sleep", category: "verb", ja: "眠る", allowedNounKinds: ANIMATE_NOUN_KINDS },
  { wordId: "verb-creak", category: "verb", ja: "軋む", allowedNounKinds: ["object"] },
] as const satisfies readonly WordEntry[];

export const WORD_BY_ID: ReadonlyMap<WordId, WordEntry> = new Map(
  WORDS.map((word) => [word.wordId, word]),
);

export const WORD_BY_JA: ReadonlyMap<string, WordEntry> = new Map(
  WORDS.map((word) => [word.ja, word]),
);
```

日本語は24件すべて異なる値にする。`WordEntry`は固定語彙だけを表し、暗号との対応はプレイ開始時の`WordAssignments`へ分離する。

## 6. 語順と意味相性

```ts
const CATEGORY_ORDER: Record<WordCategory, number> = {
  quantity: 0,
  quality: 1,
  color: 2,
  noun: 3,
  verb: 4,
};

export function isSemanticallyValid(words: readonly WordEntry[]) {
  const nouns = words.filter((word) => word.category === "noun");
  if (nouns.length !== 1) return false;

  const nounKind = nouns[0].nounKind;
  if (!nounKind) return false;

  const categories = words.map((word) => word.category);
  if (new Set(categories).size !== categories.length) return false;

  const followsEnglishOrder = words.every((word, index) => {
    if (index === 0) return true;
    return (
      CATEGORY_ORDER[words[index - 1].category] <
      CATEGORY_ORDER[word.category]
    );
  });
  if (!followsEnglishOrder) return false;

  return words.every((word) => {
    if (word.category === "noun") return true;
    return word.allowedNounKinds?.includes(nounKind) ?? false;
  });
}
```

確認例:

```ts
isSemanticallyValid([
  WORD_BY_ID.get("quantity-one-animal")!,
  WORD_BY_ID.get("quality-small")!,
  WORD_BY_ID.get("color-blue")!,
  WORD_BY_ID.get("noun-dog")!,
  WORD_BY_ID.get("verb-sleep")!,
]); // true: 一匹の 小さな 青い 犬 眠る

isSemanticallyValid([
  WORD_BY_ID.get("quantity-one-human")!,
  WORD_BY_ID.get("noun-dog")!,
]); // false: ひとりの 犬
```

## 7. ランダムステージ条件と固定フォールバック

通常プレイでは固定文型から単語を抽選する。日本語内容を固定するのは生成失敗時のフォールバックだけとする。

```ts
export const STAGE_RULES = [
  { level: 1, exampleCount: 3, pattern: ["color", "noun"], unknownWordCount: 0, choiceCount: 4, fallbackSeed: "stage-01" },
  { level: 2, exampleCount: 2, pattern: ["quality", "noun"], unknownWordCount: 1, choiceCount: 4, fallbackSeed: "stage-02" },
  { level: 3, exampleCount: 2, pattern: ["quantity", "noun"], unknownWordCount: 1, choiceCount: 4, fallbackSeed: "stage-03" },
  { level: 4, exampleCount: 2, pattern: ["noun", "verb"], unknownWordCount: 1, choiceCount: 6, fallbackSeed: "stage-04" },
  { level: 5, exampleCount: 2, pattern: ["quality", "color", "noun"], unknownWordCount: 1, choiceCount: 6, fallbackSeed: "stage-05" },
  { level: 6, exampleCount: 2, pattern: ["quantity", "quality", "noun"], unknownWordCount: 1, choiceCount: 6, fallbackSeed: "stage-06" },
  { level: 7, exampleCount: 2, pattern: ["color", "noun", "verb"], unknownWordCount: 1, choiceCount: 8, fallbackSeed: "stage-07" },
  { level: 8, exampleCount: 2, pattern: ["quantity", "noun", "verb"], unknownWordCount: 1, choiceCount: 8, fallbackSeed: "stage-08" },
  { level: 9, exampleCount: 1, pattern: ["quality", "color", "noun", "verb"], unknownWordCount: 1, choiceCount: 8, fallbackSeed: "stage-09" },
  { level: 10, exampleCount: 1, pattern: ["quantity", "quality", "color", "noun"], unknownWordCount: 1, choiceCount: 10, fallbackSeed: "stage-10" },
  { level: 11, exampleCount: 1, pattern: ["quantity", "quality", "noun", "verb"], unknownWordCount: 1, choiceCount: 10, fallbackSeed: "stage-11" },
  { level: 12, exampleCount: 1, pattern: ["quantity", "quality", "color", "noun", "verb"], unknownWordCount: 2, choiceCount: 10, fallbackSeed: "stage-12" },
] as const satisfies readonly StageGenerationRule[];
```

固定フォールバックは`WordId`で保持し、使用時にそのrunの`WordAssignments`から`CipherId`へ変換する。

```ts
export const FALLBACK_STAGES = [
  { level: 1, examples: [["color-red", "noun-man"], ["color-blue", "noun-man"], ["color-red", "noun-woman"]], question: ["color-blue", "noun-woman"], unknownWordIds: [] },
  { level: 2, examples: [["quality-large", "noun-dog"], ["quality-small", "noun-cat"]], question: ["quality-large", "noun-bird"], unknownWordIds: ["noun-bird"] },
  { level: 3, examples: [["quantity-some", "noun-man"], ["quantity-many", "noun-dog"]], question: ["quantity-one-human", "noun-woman"], unknownWordIds: ["quantity-one-human"] },
  { level: 4, examples: [["noun-man", "verb-see"], ["noun-dog", "verb-chase"]], question: ["noun-cat", "verb-sleep"], unknownWordIds: ["verb-sleep"] },
  { level: 5, examples: [["quality-large", "color-red", "noun-man"], ["quality-small", "color-blue", "noun-dog"]], question: ["quality-large", "color-black", "noun-bird"], unknownWordIds: ["color-black"] },
  { level: 6, examples: [["quantity-some", "quality-large", "noun-dog"], ["quantity-many", "quality-small", "noun-cat"]], question: ["quantity-many", "quality-old", "noun-woman"], unknownWordIds: ["quality-old"] },
  { level: 7, examples: [["color-red", "noun-man", "verb-see"], ["color-blue", "noun-dog", "verb-chase"]], question: ["color-red", "noun-fish", "verb-see"], unknownWordIds: ["noun-fish"] },
  { level: 8, examples: [["quantity-some", "noun-bird", "verb-sleep"], ["quantity-many", "noun-dog", "verb-chase"]], question: ["quantity-one-animal", "noun-dog", "verb-sleep"], unknownWordIds: ["quantity-one-animal"] },
  { level: 9, examples: [["quality-old", "color-black", "noun-bird", "verb-sleep"]], question: ["quality-small", "color-white", "noun-cat", "verb-sleep"], unknownWordIds: ["color-white"] },
  { level: 10, examples: [["quantity-one-animal", "quality-small", "color-white", "noun-dog"]], question: ["quantity-some", "quality-large", "color-black", "noun-chair"], unknownWordIds: ["noun-chair"] },
  { level: 11, examples: [["quantity-some", "quality-old", "noun-bird", "verb-sleep"]], question: ["quantity-many", "quality-old", "noun-chair", "verb-creak"], unknownWordIds: ["verb-creak"] },
  { level: 12, examples: [["quantity-one-animal", "quality-small", "color-blue", "noun-dog", "verb-sleep"]], question: ["quantity-some", "quality-broken", "color-white", "noun-door", "verb-creak"], unknownWordIds: ["quality-broken", "noun-door"] },
] as const;
```

`generateStage()`は規則ごとに最大100回、意味成立、同一run内の文重複、未提示語数、後続レベル用の未提示語予約、候補を含む一意解を検査する。Lv12正答後に24語すべてが公開済みになることもrun全体で検査する。成立しなければ同じlevelの`FALLBACK_STAGES`を使い、それも不成立なら不正な問題を表示せず開始を止める。

## 8. seed、暗号割当、候補抽選

### 8.1 乱数を差し替えられるshuffle

```ts
export type RandomSource = () => number;

export function shuffle<T>(
  source: readonly T[],
  random: RandomSource,
) {
  const result = [...source];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seedText: string): RandomSource {
  let value = hashSeed(seedText);

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
```

通常プレイのseedは`START`イベント内で作る。render中には呼ばない。

```ts
export function createRunSeed() {
  const values = crypto.getRandomValues(new Uint32Array(4));
  return Array.from(values, (value) => value.toString(16).padStart(8, "0"))
    .join("");
}
```

### 8.2 品詞内の1対1割当

```ts
const CIPHER_IDS_BY_CATEGORY = {
  color: ["color-1", "color-2", "color-3", "color-4"],
  quality: ["quality-1", "quality-2", "quality-3", "quality-4"],
  quantity: ["quantity-1", "quantity-2", "quantity-3", "quantity-4"],
  noun: ["noun-1", "noun-2", "noun-3", "noun-4", "noun-5", "noun-6", "noun-7", "noun-8"],
  verb: ["verb-1", "verb-2", "verb-3", "verb-4"],
} as const satisfies Record<WordCategory, readonly CipherId[]>;

export function createWordAssignments(random: RandomSource): WordAssignments {
  const pairs = Object.entries(CIPHER_IDS_BY_CATEGORY).flatMap(
    ([category, cipherIds]) => {
      const wordIds = WORDS
        .filter((word) => word.category === category)
        .map((word) => word.wordId);
      if (wordIds.length !== cipherIds.length) {
        throw new Error(`Cipher/word count mismatch: ${category}`);
      }
      const shuffledWordIds = shuffle(wordIds, random);
      return cipherIds.map((cipherId, index) => [
        cipherId,
        shuffledWordIds[index],
      ] as const);
    },
  );

  return Object.fromEntries(pairs) as WordAssignments;
}
```

分類をまたぐshuffleは行わない。同じ`RandomSource`の系列から、暗号割当、Lv1〜Lv12、候補を順に生成する。

### 8.3 候補配列の生成

```ts
type QuestionToken = {
  id: string;
  cipherId: CipherId;
  category: WordCategory;
  correctWordId: WordId;
  correctJa: string;
};

type ChoiceMap = Record<string, string[]>;
type KnownMeanings = ReadonlyMap<CipherId, WordId>;

function drawChoiceMap(
  tokens: readonly QuestionToken[],
  choiceCount: number,
  random: RandomSource,
): ChoiceMap {
  return Object.fromEntries(
    tokens.map((token) => {
      const distractors = shuffle(
        WORDS.filter((word) => word.ja !== token.correctJa),
        random,
      ).slice(0, choiceCount - 1);

      return [
        token.id,
        shuffle(
          [token.correctJa, ...distractors.map((word) => word.ja)],
          random,
        ),
      ];
    }),
  );
}
```

抽選元は選択中トークンと同じ分類へ限定しない。正解以外の全23語を対象にする。

## 9. 一意解検査

### 9.1 成立する割当の列挙

```ts
function findValidAnswerSignatures(
  tokens: readonly QuestionToken[],
  choicesByTokenId: ChoiceMap,
  knownMeanings: KnownMeanings,
  limit = 2,
) {
  const signatures: string[] = [];
  const assignedMeaning = new Map<CipherId, WordId>(knownMeanings);
  const usedMeanings = new Map<WordCategory, Set<WordId>>();

  for (const wordId of knownMeanings.values()) {
    const word = WORD_BY_ID.get(wordId);
    if (!word) continue;
    const used = usedMeanings.get(word.category) ?? new Set<WordId>();
    used.add(wordId);
    usedMeanings.set(word.category, used);
  }

  function visit(index: number, sentence: WordEntry[]) {
    if (signatures.length >= limit) return;

    if (index >= tokens.length) {
      if (isSemanticallyValid(sentence)) {
        signatures.push(sentence.map((word) => word.ja).join("\u0000"));
      }
      return;
    }

    const token = tokens[index];
    const fixedMeaning = assignedMeaning.get(token.cipherId);

    for (const ja of choicesByTokenId[token.id] ?? []) {
      const word = WORD_BY_JA.get(ja);
      if (!word || word.category !== token.category) continue;
      if (fixedMeaning && fixedMeaning !== word.wordId) continue;

      const used = usedMeanings.get(token.category) ?? new Set<WordId>();
      const isNewAssignment = fixedMeaning === undefined;
      if (isNewAssignment && used.has(word.wordId)) continue;

      if (isNewAssignment) {
        assignedMeaning.set(token.cipherId, word.wordId);
        used.add(word.wordId);
        usedMeanings.set(token.category, used);
      }

      visit(index + 1, [...sentence, word]);

      if (isNewAssignment) {
        assignedMeaning.delete(token.cipherId);
        used.delete(word.wordId);
      }
    }
  }

  visit(0, []);
  return signatures;
}

function hasUniqueCorrectAnswer(
  tokens: readonly QuestionToken[],
  choicesByTokenId: ChoiceMap,
  knownMeanings: KnownMeanings,
) {
  const validAnswers = findValidAnswerSignatures(
    tokens,
    choicesByTokenId,
    knownMeanings,
  );
  const correctSignature = tokens
    .map((token) => token.correctJa)
    .join("\u0000");

  return validAnswers.length === 1 && validAnswers[0] === correctSignature;
}
```

この検査はゲーム内部で使うだけで、分類や成立理由をプレイヤー画面へ表示しない。

### 9.2 最大100回と決定的フォールバック

```ts
function buildFallbackChoiceMap(
  stage: StageGenerationRule,
  tokens: readonly QuestionToken[],
  knownMeanings: KnownMeanings,
  runSeed: string,
): ChoiceMap {
  const knownWordIds = new Set(knownMeanings.values());

  return Object.fromEntries(
    tokens.map((token, tokenIndex) => {
      const knownSameCategory = WORDS.filter(
        (word) =>
          word.ja !== token.correctJa &&
          word.category === token.category &&
          knownWordIds.has(word.wordId),
      );
      const differentCategory = WORDS.filter(
        (word) =>
          word.ja !== token.correctJa && word.category !== token.category,
      );
      const safeDistractors = [
        ...knownSameCategory,
        ...differentCategory,
      ];
      const selected = safeDistractors.slice(0, stage.choiceCount - 1);

      if (selected.length !== stage.choiceCount - 1) {
        throw new Error(`Not enough fallback choices: ${token.id}`);
      }

      return [
        token.id,
        shuffle(
          [token.correctJa, ...selected.map((word) => word.ja)],
          createSeededRandom(
            `${runSeed}:${stage.fallbackSeed}:${tokenIndex}`,
          ),
        ),
      ];
    }),
  );
}

export function createStableChoiceMap(
  stage: StageGenerationRule,
  tokens: readonly QuestionToken[],
  knownMeanings: KnownMeanings,
  runSeed: string,
  random: RandomSource,
) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const choices = drawChoiceMap(tokens, stage.choiceCount, random);
    if (hasUniqueCorrectAnswer(tokens, choices, knownMeanings)) {
      return choices;
    }
  }

  const fallback = buildFallbackChoiceMap(
    stage,
    tokens,
    knownMeanings,
    runSeed,
  );
  if (!hasUniqueCorrectAnswer(tokens, fallback, knownMeanings)) {
    throw new Error(`Stage ${stage.level} has no safe fallback`);
  }
  return fallback;
}
```

`createStableChoiceMap()`は`RunDefinition`生成中に各問題につき1回だけ呼び、返り値を`Question.choiceCandidatesByTokenId`へ保存する。未公開の`WordAssignments`全体を`knownMeanings`として渡してはならない。

## 10. メニューとリトライ

```tsx
const [gamePhase, setGamePhase] = useState<GamePhase>("menu");
const [menuView, setMenuView] = useState<MenuView>("root");
const [pendingDifficulty, setPendingDifficulty] =
  useState<Difficulty | null>(null);
const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
const [runDefinition, setRunDefinition] =
  useState<RunDefinition | null>(null);
const [startedAt, setStartedAt] = useState<number | null>(null);

function handleStart() {
  if (!pendingDifficulty) return;

  const runSeed = createRunSeed();
  const random = createSeededRandom(runSeed);
  const wordAssignments = createWordAssignments(random);
  const stages = generateStages({
    rules: STAGE_RULES,
    fallbackStages: FALLBACK_STAGES,
    wordAssignments,
    random,
    runSeed,
  });
  const nextRun = { runSeed, wordAssignments, stages };

  resetRunState();
  setRunDefinition(nextRun);
  setDifficulty(pendingDifficulty);
  setStartedAt(Date.now());
  setGamePhase("opening");
}

function handleResultClick() {
  resetRunState();
  setDifficulty(null);
  setRunDefinition(null);
  setPendingDifficulty(null);
  setMenuView("difficulty");
  setStartedAt(null);
  setGamePhase("menu");
}
```

```tsx
{gamePhase === "menu" ? (
  <MainMenu
    view={menuView}
    selectedDifficulty={pendingDifficulty}
    onOpenGuide={() => setMenuView("guide")}
    onOpenDifficulty={() => setMenuView("difficulty")}
    onBack={() => setMenuView("root")}
    onSelectDifficulty={setPendingDifficulty}
    onStart={handleStart}
  />
) : null}
```

- 素材読込完了後も`menu`から自動遷移しない。
- ブラウザ再読込判定用の開始演出省略処理は完成版メニューへ置き換える。
- `generateStages()`は仕様書7章の生成、検査、フォールバックを担当する純粋関数とし、同じ引数から同じ`GeneratedStage[]`を返す。
- `RunDefinition`の生成に成功してから`startedAt`を保存する。生成と検査に失敗した場合は開始演出へ進まない。
- リザルトの左クリックは`handleResultClick()`へ接続し、専用ボタンは追加しない。

## 11. EASY/HARDの開始値

```ts
function prepareStage(selectedDifficulty: Difficulty) {
  const config = DIFFICULTY_CONFIG[selectedDifficulty];
  setMistakesRemaining(config.safeMistakeCount);
  setTimeLeft(config.timeLimitSeconds);
}
```

`timeLeft`は`number | null`へ変更する。EASYで仮の90秒を保持しない。

### 誤答分岐

```ts
function handleIncorrectAnswer(
  judgedAt: number,
  judgement: AnswerJudgement,
) {
  if (!difficulty) return;

  playSound("wrongAnswer");
  setMistakeCount((count) => count + 1);

  if (difficulty === "hard" || mistakesRemaining <= 0) {
    startTerminalCutscene("gameOver", judgedAt);
    return;
  }

  // EASYの継続可能な1回目だけ現行フィードバックを使う。
  setAnswerJudgement(judgement);
  setWrongShakeSequence((sequence) => sequence + 1);
  setMistakesRemaining(0);
  setFeedbackOutcome(null);
}
```

HARDでは`setAnswerJudgement()`と`setWrongShakeSequence()`を呼ばないため、正答数、色分け、揺れを出さず終了する。

### HARDだけ進むタイマー

```ts
useEffect(() => {
  if (difficulty !== "hard" || gamePhase !== "answering") return;

  const intervalId = window.setInterval(() => {
    setTimeLeft((current) =>
      current === null ? null : Math.max(current - 1, 0),
    );
  }, 1000);

  return () => window.clearInterval(intervalId);
}, [difficulty, gamePhase]);

useEffect(() => {
  if (
    difficulty === "hard" &&
    gamePhase === "answering" &&
    timeLeft === 0
  ) {
    startTerminalCutscene("gameOver", Date.now());
  }
}, [difficulty, gamePhase, timeLeft]);
```

実装時は`startTerminalCutscene`を安定したcallbackまたはref経由で呼び、現行の終端遷移ガードを維持する。手帳の開閉状態は停止条件へ加えない。

## 12. 難易度と右上ステータス

```tsx
const showDifficulty =
  difficulty !== null &&
  [
    "introDialogue",
    "exampleDialogue",
    "question",
    "answering",
    "answerFeedback",
  ].includes(gamePhase);

const showGameStatus =
  difficulty !== null &&
  (gamePhase === "answering" || gamePhase === "answerFeedback");

{showDifficulty ? <DifficultyBadge difficulty={difficulty} /> : null}

{showGameStatus ? (
  difficulty === "easy" ? (
    <MistakeStatus mistakesRemaining={mistakesRemaining} />
  ) : timeLeft !== null ? (
    <TimerDisplay
      timeLeft={timeLeft}
      warningTime={DIFFICULTY_CONFIG.hard.warningTimeSeconds}
    />
  ) : null
) : null}
```

手帳は`GameScreen`上で`answering`のまま重なるため、手帳表示中も左上難易度と右上ステータスを維持する。

## 13. メニューProps例

```ts
export type MainMenuProps = {
  view: MenuView;
  selectedDifficulty: Difficulty | null;
  onOpenGuide: () => void;
  onOpenDifficulty: () => void;
  onBack: () => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onStart: () => void;
};

export type DifficultyBadgeProps = {
  difficulty: Difficulty;
};
```

すべてのメニュー・ゲーム内ボタンは、既存の会話送り音を共通の押下音として使う。

```ts
import { playSound } from "@/lib/sound";

export function playButtonPressSound() {
  playSound("dialogueNext");
}
```

```tsx
<button
  type="button"
  disabled={selectedDifficulty === null}
  onClick={() => {
    playButtonPressSound();
    onStart();
  }}
>
  START
</button>
```

有効なnative `button`の`onClick`から処理callbackの直前に1回だけ呼ぶ。マウスと標準の`Enter`操作を対象とし、無効ボタン、`Space`、ボタン以外の背景クリックでは呼ばない。

GUIDEの本文は配列化してもよいが、語頭、語順、意味相性、未知語の説明を混ぜない。

## 14. タイトルフォント

実装前にNext.js 16.2.9のローカルガイドを確認する。

```ts
import { Cinzel_Decorative } from "next/font/google";

export const titleFont = Cinzel_Decorative({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-title",
});
```

```css
.title {
  font-family: var(--font-title), serif;
  font-weight: 700;
}
```

タイトル文字列は設定値または`MainMenu`の定数へ1回だけ定義し、複数コンポーネントへ重複させない。

## 15. リザルトから難易度選択へ

```tsx
<p>左クリックで難易度選択へ</p>
```

リザルト画面は現行どおり専用ボタンを持たない。親の左クリックで`handleResultClick()`を呼び、メニューの難易度選択パネルを表示する。

## 16. 実装時の確認例

```ts
if (WORDS.length !== 24) {
  throw new Error("The final vocabulary must contain 24 words");
}

if (STAGE_RULES.length !== 12 || FALLBACK_STAGES.length !== 12) {
  throw new Error("The final game must contain 12 stages");
}

for (const stage of FALLBACK_STAGES) {
  for (const sentence of [...stage.examples, stage.question]) {
    const words = sentence.map((wordId) => WORD_BY_ID.get(wordId)!);
    if (!isSemanticallyValid(words)) {
      throw new Error(`Invalid sentence in stage ${stage.level}`);
    }
  }
}

const seed = "fixed-test-seed";
const firstRandom = createSeededRandom(seed);
const firstAssignments = createWordAssignments(firstRandom);
const firstRun = generateStages({
  rules: STAGE_RULES,
  fallbackStages: FALLBACK_STAGES,
  wordAssignments: firstAssignments,
  random: firstRandom,
  runSeed: seed,
});

const secondRandom = createSeededRandom(seed);
const secondAssignments = createWordAssignments(secondRandom);
const secondRun = generateStages({
  rules: STAGE_RULES,
  fallbackStages: FALLBACK_STAGES,
  wordAssignments: secondAssignments,
  random: secondRandom,
  runSeed: seed,
});

if (
  JSON.stringify([firstAssignments, firstRun]) !==
  JSON.stringify([secondAssignments, secondRun])
) {
  throw new Error("The same seed must reproduce the same run");
}
```

暗号割当と出題生成はseedを固定して反復できるようにし、少なくとも次を検査する。

- 24暗号枠と24語が同じ分類内で1対1に対応する。
- 同じseedで暗号割当、例文、問題、候補が完全一致する。
- 例文が21件、問題が12件で、各Lvの文型と未提示語数を満たす。
- 後続レベル用の未提示語が不足せず、Lv12正答後に24語すべてが公開済みになる。
- 同一run内に同じ日本語単語列の文が重複しない。
- すべてのランダム文とフォールバック文が意味相性を満たす。
- Lv別に4、6、8、10件である。
- 正解を1件含む。
- 同じ日本語が重複しない。
- 成立する問題全体の割当が正解1通りだけである。
- 生成後の候補をトークン切替や再描画で作り直さない。
- 100回失敗時のフォールバックも一意解になる。

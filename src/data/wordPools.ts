import type {
  CipherId,
  WordAssignments,
  WordCategory,
  WordEntry,
  WordId,
} from "@/lib/gameTypes";

const ALL_NOUN_KINDS = ["human", "animal", "object"] as const;
const ANIMATE_NOUN_KINDS = ["human", "animal"] as const;

export const WORDS = [
  {
    wordId: "color-red",
    category: "color",
    ja: "赤い",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "color-blue",
    category: "color",
    ja: "青い",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "color-black",
    category: "color",
    ja: "黒い",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "color-white",
    category: "color",
    ja: "白い",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "quality-large",
    category: "quality",
    ja: "大きな",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "quality-small",
    category: "quality",
    ja: "小さな",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "quality-old",
    category: "quality",
    ja: "古い",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "quality-broken",
    category: "quality",
    ja: "壊れた",
    allowedNounKinds: ["object"],
  },
  {
    wordId: "quantity-some",
    category: "quantity",
    ja: "いくつかの",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "quantity-many",
    category: "quantity",
    ja: "たくさんの",
    allowedNounKinds: ALL_NOUN_KINDS,
  },
  {
    wordId: "quantity-one-human",
    category: "quantity",
    ja: "ひとりの",
    allowedNounKinds: ["human"],
  },
  {
    wordId: "quantity-one-animal",
    category: "quantity",
    ja: "一匹の",
    allowedNounKinds: ["animal"],
  },
  {
    wordId: "noun-man",
    category: "noun",
    ja: "男",
    nounKind: "human",
  },
  {
    wordId: "noun-woman",
    category: "noun",
    ja: "女",
    nounKind: "human",
  },
  {
    wordId: "noun-dog",
    category: "noun",
    ja: "犬",
    nounKind: "animal",
  },
  {
    wordId: "noun-cat",
    category: "noun",
    ja: "猫",
    nounKind: "animal",
  },
  {
    wordId: "noun-bird",
    category: "noun",
    ja: "鳥",
    nounKind: "animal",
  },
  {
    wordId: "noun-fish",
    category: "noun",
    ja: "魚",
    nounKind: "animal",
  },
  {
    wordId: "noun-chair",
    category: "noun",
    ja: "椅子",
    nounKind: "object",
  },
  {
    wordId: "noun-door",
    category: "noun",
    ja: "扉",
    nounKind: "object",
  },
  {
    wordId: "verb-see",
    category: "verb",
    ja: "見る",
    allowedNounKinds: ANIMATE_NOUN_KINDS,
  },
  {
    wordId: "verb-chase",
    category: "verb",
    ja: "追う",
    allowedNounKinds: ANIMATE_NOUN_KINDS,
  },
  {
    wordId: "verb-sleep",
    category: "verb",
    ja: "眠る",
    allowedNounKinds: ANIMATE_NOUN_KINDS,
  },
  {
    wordId: "verb-creak",
    category: "verb",
    ja: "軋む",
    allowedNounKinds: ["object"],
  },
] as const satisfies readonly WordEntry[];

export const WORD_BY_ID: ReadonlyMap<WordId, WordEntry> = new Map(
  WORDS.map((word) => [word.wordId, word]),
);

export const WORD_BY_JA: ReadonlyMap<string, WordEntry> = new Map(
  WORDS.map((word) => [word.ja, word]),
);

export const WORDS_BY_CATEGORY: Readonly<
  Record<WordCategory, readonly WordEntry[]>
> = {
  color: WORDS.filter((word) => word.category === "color"),
  quality: WORDS.filter((word) => word.category === "quality"),
  quantity: WORDS.filter((word) => word.category === "quantity"),
  noun: WORDS.filter((word) => word.category === "noun"),
  verb: WORDS.filter((word) => word.category === "verb"),
};

const DEFAULT_ASSIGNMENTS: WordAssignments = {
  "color-1": "color-red",
  "color-2": "color-blue",
  "color-3": "color-black",
  "color-4": "color-white",
  "quality-1": "quality-large",
  "quality-2": "quality-small",
  "quality-3": "quality-old",
  "quality-4": "quality-broken",
  "quantity-1": "quantity-some",
  "quantity-2": "quantity-many",
  "quantity-3": "quantity-one-human",
  "quantity-4": "quantity-one-animal",
  "noun-1": "noun-man",
  "noun-2": "noun-woman",
  "noun-3": "noun-dog",
  "noun-4": "noun-cat",
  "noun-5": "noun-bird",
  "noun-6": "noun-fish",
  "noun-7": "noun-chair",
  "noun-8": "noun-door",
  "verb-1": "verb-see",
  "verb-2": "verb-chase",
  "verb-3": "verb-sleep",
  "verb-4": "verb-creak",
};

export const DEFAULT_WORD_ASSIGNMENTS: WordAssignments = DEFAULT_ASSIGNMENTS;

export function getWordForCipher(
  cipherId: CipherId,
  assignments: WordAssignments = DEFAULT_WORD_ASSIGNMENTS,
): WordEntry {
  const wordId = assignments[cipherId];
  const word = WORD_BY_ID.get(wordId);
  if (!word) {
    throw new Error(`Unknown word id for cipher ${cipherId}: ${wordId}`);
  }
  return word;
}

export function getCategoryChoices(category: WordCategory): string[] {
  return WORDS_BY_CATEGORY[category].map((word) => word.ja);
}

import type {
  NounKind,
  SentencePattern,
  WordCategory,
  WordEntry,
  WordId,
} from "@/lib/gameTypes";

const CATEGORY_ORDER: Record<WordCategory, number> = {
  quantity: 0,
  quality: 1,
  color: 2,
  noun: 3,
  verb: 4,
};

function hasExactlyOneNounWithKind(words: readonly WordEntry[]): boolean {
  const nouns = words.filter((word) => word.category === "noun");
  if (nouns.length !== 1) {
    return false;
  }
  return nouns[0].nounKind !== undefined;
}

function hasUniqueCategories(words: readonly WordEntry[]): boolean {
  const categories = words.map((word) => word.category);
  return new Set(categories).size === categories.length;
}

export function followsEnglishCategoryOrder(
  words: readonly WordEntry[],
): boolean {
  return words.every((word, index) => {
    if (index === 0) {
      return true;
    }
    return (
      CATEGORY_ORDER[words[index - 1].category] <
      CATEGORY_ORDER[word.category]
    );
  });
}

function isCompatibleWithNounKind(
  words: readonly WordEntry[],
  nounKind: NounKind,
): boolean {
  return words.every((word) => {
    if (word.category === "noun") {
      return true;
    }
    return word.allowedNounKinds?.includes(nounKind) ?? false;
  });
}

export function matchesSentencePattern(
  words: readonly WordEntry[],
  pattern: SentencePattern,
): boolean {
  if (words.length !== pattern.length) {
    return false;
  }
  return words.every((word, index) => word.category === pattern[index]);
}

export function isSemanticallyValid(words: readonly WordEntry[]): boolean {
  if (!hasExactlyOneNounWithKind(words)) {
    return false;
  }
  if (!hasUniqueCategories(words)) {
    return false;
  }
  if (!followsEnglishCategoryOrder(words)) {
    return false;
  }

  const nounKind = words.find((word) => word.category === "noun")!.nounKind!;
  return isCompatibleWithNounKind(words, nounKind);
}

export function isSemanticallyValidWordIds(
  wordIds: readonly WordId[],
  lookup: (wordId: WordId) => WordEntry | undefined,
): boolean {
  const words: WordEntry[] = [];
  for (const wordId of wordIds) {
    const word = lookup(wordId);
    if (!word) {
      return false;
    }
    words.push(word);
  }
  return isSemanticallyValid(words);
}

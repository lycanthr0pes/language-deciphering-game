import { WORD_BY_ID } from "../src/data/wordPools";
import { isSemanticallyValid } from "../src/lib/semanticValidation";
import type { WordId } from "../src/lib/gameTypes";

function sentence(...wordIds: WordId[]) {
  return wordIds.map((wordId) => {
    const word = WORD_BY_ID.get(wordId);
    if (!word) {
      throw new Error(`Missing word: ${wordId}`);
    }
    return word;
  });
}

const cases: { label: string; expected: boolean; wordIds: WordId[] }[] = [
  {
    label: "一匹の 小さな 青い 犬 眠る",
    expected: true,
    wordIds: [
      "quantity-one-animal",
      "quality-small",
      "color-blue",
      "noun-dog",
      "verb-sleep",
    ],
  },
  {
    label: "いくつかの 壊れた 白い 扉 軋む",
    expected: true,
    wordIds: [
      "quantity-some",
      "quality-broken",
      "color-white",
      "noun-door",
      "verb-creak",
    ],
  },
  {
    label: "ひとりの 犬",
    expected: false,
    wordIds: ["quantity-one-human", "noun-dog"],
  },
  {
    label: "壊れた 男",
    expected: false,
    wordIds: ["quality-broken", "noun-man"],
  },
  {
    label: "椅子 追う",
    expected: false,
    wordIds: ["noun-chair", "verb-chase"],
  },
  {
    label: "猫 軋む",
    expected: false,
    wordIds: ["noun-cat", "verb-creak"],
  },
];

let failed = 0;
for (const testCase of cases) {
  const actual = isSemanticallyValid(sentence(...testCase.wordIds));
  if (actual !== testCase.expected) {
    console.error(`FAIL: ${testCase.label} expected ${testCase.expected}, got ${actual}`);
    failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log(`OK: ${cases.length} semantic validation cases`);

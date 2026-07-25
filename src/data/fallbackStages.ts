import type { FallbackStageDefinition } from "@/lib/gameTypes";

export const FALLBACK_STAGES = [
  {
    level: 1,
    examples: [
      ["color-red", "noun-man"],
      ["color-blue", "noun-man"],
      ["color-red", "noun-woman"],
    ],
    question: ["color-blue", "noun-woman"],
    unknownWordIds: [],
  },
  {
    level: 2,
    examples: [
      ["quality-large", "noun-dog"],
      ["quality-small", "noun-cat"],
    ],
    question: ["quality-large", "noun-bird"],
    unknownWordIds: ["noun-bird"],
  },
  {
    level: 3,
    examples: [
      ["quantity-some", "noun-man"],
      ["quantity-many", "noun-dog"],
    ],
    question: ["quantity-one-human", "noun-woman"],
    unknownWordIds: ["quantity-one-human"],
  },
  {
    level: 4,
    examples: [
      ["noun-man", "verb-see"],
      ["noun-dog", "verb-chase"],
    ],
    question: ["noun-cat", "verb-sleep"],
    unknownWordIds: ["verb-sleep"],
  },
  {
    level: 5,
    examples: [
      ["quality-large", "color-red", "noun-man"],
      ["quality-small", "color-blue", "noun-dog"],
    ],
    question: ["quality-large", "color-black", "noun-bird"],
    unknownWordIds: ["color-black"],
  },
  {
    level: 6,
    examples: [
      ["quantity-some", "quality-large", "noun-dog"],
      ["quantity-many", "quality-small", "noun-cat"],
    ],
    question: ["quantity-many", "quality-old", "noun-woman"],
    unknownWordIds: ["quality-old"],
  },
  {
    level: 7,
    examples: [
      ["color-red", "noun-man", "verb-see"],
      ["color-blue", "noun-dog", "verb-chase"],
    ],
    question: ["color-red", "noun-fish", "verb-see"],
    unknownWordIds: ["noun-fish"],
  },
  {
    level: 8,
    examples: [
      ["quantity-some", "noun-bird", "verb-sleep"],
      ["quantity-many", "noun-dog", "verb-chase"],
    ],
    question: ["quantity-one-animal", "noun-dog", "verb-sleep"],
    unknownWordIds: ["quantity-one-animal"],
  },
  {
    level: 9,
    examples: [
      ["quality-old", "color-black", "noun-bird", "verb-sleep"],
    ],
    question: ["quality-small", "color-white", "noun-cat", "verb-sleep"],
    unknownWordIds: ["color-white"],
  },
  {
    level: 10,
    examples: [
      ["quantity-one-animal", "quality-small", "color-white", "noun-dog"],
    ],
    question: ["quantity-some", "quality-large", "color-black", "noun-chair"],
    unknownWordIds: ["noun-chair"],
  },
  {
    level: 11,
    examples: [
      ["quantity-some", "quality-old", "noun-bird", "verb-sleep"],
    ],
    question: ["quantity-many", "quality-old", "noun-chair", "verb-creak"],
    unknownWordIds: ["verb-creak"],
  },
  {
    level: 12,
    examples: [
      [
        "quantity-one-animal",
        "quality-small",
        "color-blue",
        "noun-dog",
        "verb-sleep",
      ],
    ],
    question: [
      "quantity-some",
      "quality-broken",
      "color-white",
      "noun-door",
      "verb-creak",
    ],
    unknownWordIds: ["quality-broken", "noun-door"],
  },
] as const satisfies readonly FallbackStageDefinition[];

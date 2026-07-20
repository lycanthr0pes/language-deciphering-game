import type { CipherId } from "@/lib/gameTypes";

export type LevelDefinition = {
  examples: readonly (readonly CipherId[])[];
  question: readonly CipherId[];
};

export const LEVEL_DEFINITIONS = {
  1: {
    examples: [
      ["color-1", "humanNoun-1"],
      ["color-2", "humanNoun-1"],
      ["color-1", "humanNoun-2"],
    ],
    question: ["color-2", "humanNoun-2"],
  },
  2: {
    examples: [["color-1", "animalNoun-2"]],
    question: ["color-1", "animalNoun-2"],
  },
  3: {
    examples: [["quality-1", "animalNoun-1"]],
    question: ["quality-1", "animalNoun-1"],
  },
  4: {
    examples: [["quantity-2", "animalNoun-2"]],
    question: ["quantity-2", "animalNoun-2"],
  },
  5: {
    examples: [["humanNoun-1", "verb-2"]],
    question: ["humanNoun-1", "verb-2"],
  },
  6: {
    examples: [["color-1", "quality-2", "humanNoun-2"]],
    question: ["color-1", "quality-2", "humanNoun-2"],
  },
  7: {
    examples: [["quantity-1", "humanNoun-1", "verb-1"]],
    question: ["quantity-1", "humanNoun-1", "verb-1"],
  },
  8: {
    examples: [
      [
        "quantity-2",
        "color-2",
        "quality-2",
        "animalNoun-1",
        "verb-2",
      ],
    ],
    question: [
      "quantity-2",
      "color-2",
      "quality-2",
      "animalNoun-1",
      "verb-2",
    ],
  },
} as const satisfies Record<number, LevelDefinition>;

export function getLevelDefinition(level: number): LevelDefinition {
  return (
    LEVEL_DEFINITIONS[level as keyof typeof LEVEL_DEFINITIONS] ??
    LEVEL_DEFINITIONS[1]
  );
}

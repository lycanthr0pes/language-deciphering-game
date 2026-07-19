import { getGlyphTextForWord } from "@/data/cipherGlyphs";
import {
  getExampleTemplatesForLevel,
} from "@/data/exampleTemplates";
import { WORD_POOLS } from "@/data/wordPools";
import type {
  CipherToken,
  DialogueLine,
  ExampleRecord,
  InternalCategory,
  Question,
} from "@/lib/gameTypes";

export type GeneratedRound = {
  dialogueLines: DialogueLine[];
  examples: ExampleRecord[];
  question: Question;
};

type WordEntry = {
  category: InternalCategory;
  ja: string;
  cipher: string;
};

type QuestionSlot = InternalCategory | "anyNoun";

const LEVEL_QUESTION_SLOTS: Record<number, QuestionSlot[]> = {
  1: ["color", "humanNoun"],
  2: ["color", "anyNoun"],
  3: ["quality", "anyNoun"],
  4: ["quantity", "anyNoun"],
  5: ["anyNoun", "verb"],
  6: ["color", "quality", "anyNoun"],
  7: ["quantity", "anyNoun", "verb"],
  8: ["quantity", "color", "quality", "anyNoun", "verb"],
};

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function resolveCategory(slot: QuestionSlot): InternalCategory {
  if (slot !== "anyNoun") {
    return slot;
  }

  return pickRandom(["humanNoun", "animalNoun"] as const);
}

function pickRandomWord(category: InternalCategory): WordEntry {
  const entries = WORD_POOLS[category] as readonly { ja: string; cipher: string }[];
  const entry = pickRandom(entries);
  return {
    category,
    ja: entry.ja,
    cipher: entry.cipher,
  };
}

function findWord(cipher: string): WordEntry {
  for (const [category, entries] of Object.entries(WORD_POOLS)) {
    const entry = entries.find((word) => word.cipher === cipher);
    if (entry) {
      return {
        category: category as InternalCategory,
        ja: entry.ja,
        cipher: entry.cipher,
      };
    }
  }

  throw new Error(`Unknown cipher word: ${cipher}`);
}

function getCategoryChoices(category: InternalCategory): string[] {
  return WORD_POOLS[category].map((entry) => entry.ja);
}

function makeToken(id: string, cipher: string): CipherToken {
  const word = findWord(cipher);
  const poolCiphers = WORD_POOLS[word.category].map((entry) => entry.cipher);
  return {
    id,
    cipher: word.cipher,
    glyphText: getGlyphTextForWord(word.category, word.cipher, poolCiphers),
    category: word.category,
    correctJa: word.ja,
  };
}

function buildExampleRecord(id: string, ciphers: string[]): ExampleRecord {
  const tokens = ciphers.map((cipher, index) =>
    makeToken(`${id}-token-${index + 1}`, cipher),
  );

  return {
    id,
    cipherText: tokens.map((token) => token.glyphText).join(" "),
    translation: tokens.map((token) => token.correctJa).join(" "),
    tokens,
  };
}

function buildDialogueLines(examples: ExampleRecord[]): DialogueLine[] {
  return examples.flatMap((example) => [
    {
      id: `${example.id}-cipher`,
      text: example.cipherText,
      type: "cipher" as const,
    },
    {
      id: `${example.id}-ja`,
      text: example.translation,
      type: "translation" as const,
    },
  ]);
}

function buildQuestion(level: number, ciphers: string[]): Question {
  const tokens = ciphers.map((cipher, index) =>
    makeToken(`token-${index + 1}`, cipher),
  );
  const correctAnswers = Object.fromEntries(
    tokens.map((token) => [token.id, token.correctJa]),
  );
  const choiceCandidatesByTokenId = Object.fromEntries(
    tokens.map((token) => [token.id, getCategoryChoices(token.category)]),
  );

  return {
    id: `question-${level}-${Date.now()}`,
    cipherText: tokens.map((token) => token.glyphText).join(" "),
    tokens,
    correctAnswers,
    choiceCandidatesByTokenId,
  };
}

function generateQuestionCiphers(level: number): string[] {
  const slots = LEVEL_QUESTION_SLOTS[level] ?? LEVEL_QUESTION_SLOTS[1];

  return slots.map((slot) => {
    const category = resolveCategory(slot);
    return pickRandomWord(category).cipher;
  });
}

export function generateRound(level: number): GeneratedRound {
  const exampleTemplates = getExampleTemplatesForLevel(level);
  const examples = exampleTemplates.map((ciphers, index) =>
    buildExampleRecord(`example-${level}-${index + 1}`, ciphers),
  );

  return {
    dialogueLines: buildDialogueLines(examples),
    examples,
    question: buildQuestion(level, generateQuestionCiphers(level)),
  };
}

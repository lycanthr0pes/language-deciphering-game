import { getCipherGlyph } from "@/data/cipherGlyphs";
import { getLevelDefinition } from "@/data/exampleTemplates";
import { WORD_POOLS } from "@/data/wordPools";
import type {
  CipherId,
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
  cipherId: CipherId;
  ja: string;
};

function findWord(cipherId: CipherId): WordEntry {
  for (const [category, entries] of Object.entries(WORD_POOLS)) {
    const entry = entries.find((word) => word.cipherId === cipherId);
    if (entry) {
      return {
        category: category as InternalCategory,
        cipherId: entry.cipherId,
        ja: entry.ja,
      };
    }
  }

  throw new Error(`Unknown cipher id: ${cipherId}`);
}

function getCategoryChoices(category: InternalCategory): string[] {
  return WORD_POOLS[category].map((entry) => entry.ja);
}

function makeToken(id: string, cipherId: CipherId): CipherToken {
  const word = findWord(cipherId);
  return {
    id,
    cipherId,
    glyphText: getCipherGlyph(cipherId).glyphText,
    category: word.category,
    correctJa: word.ja,
  };
}

function buildExampleRecord(
  id: string,
  cipherIds: readonly CipherId[],
): ExampleRecord {
  const tokens = cipherIds.map((cipherId, index) =>
    makeToken(`${id}-token-${index + 1}`, cipherId),
  );

  return {
    id,
    translation: tokens.map((token) => token.correctJa).join(" "),
    tokens,
  };
}

function getGlyphSentence(tokens: CipherToken[]) {
  return tokens.map((token) => token.glyphText).join(" ");
}

function buildDialogueLines(examples: ExampleRecord[]): DialogueLine[] {
  return examples.flatMap((example) => [
    {
      id: `${example.id}-cipher`,
      text: getGlyphSentence(example.tokens),
      type: "cipher" as const,
      speaker: "man" as const,
    },
    {
      id: `${example.id}-translation`,
      text: example.translation,
      type: "translation" as const,
      speaker: "man" as const,
    },
  ]);
}

function buildQuestion(level: number, cipherIds: readonly CipherId[]): Question {
  const tokens = cipherIds.map((cipherId, index) =>
    makeToken(`question-${level}-token-${index + 1}`, cipherId),
  );

  return {
    id: `question-${level}`,
    level,
    tokens,
    correctAnswers: Object.fromEntries(
      tokens.map((token) => [token.id, token.correctJa]),
    ),
    choiceCandidatesByTokenId: Object.fromEntries(
      tokens.map((token) => [
        token.id,
        getCategoryChoices(token.category),
      ]),
    ),
  };
}

export function generateRound(level: number): GeneratedRound {
  const definition = getLevelDefinition(level);
  const examples = definition.examples.map((cipherIds, index) =>
    buildExampleRecord(`example-${level}-${index + 1}`, cipherIds),
  );

  return {
    dialogueLines: buildDialogueLines(examples),
    examples,
    question: buildQuestion(level, definition.question),
  };
}

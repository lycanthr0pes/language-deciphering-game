import { getCipherGlyph } from "@/data/cipherGlyphs";
import { getLevelDefinition } from "@/data/exampleTemplates";
import {
  DEFAULT_WORD_ASSIGNMENTS,
  getCategoryChoices,
  getWordForCipher,
} from "@/data/wordPools";
import type {
  CipherId,
  CipherToken,
  DialogueLine,
  ExampleRecord,
  Question,
  WordAssignments,
} from "@/lib/gameTypes";

export type GeneratedRound = {
  dialogueLines: DialogueLine[];
  examples: ExampleRecord[];
  question: Question;
};

function makeToken(
  id: string,
  cipherId: CipherId,
  assignments: WordAssignments = DEFAULT_WORD_ASSIGNMENTS,
): CipherToken {
  const word = getWordForCipher(cipherId, assignments);
  return {
    id,
    cipherId,
    wordId: word.wordId,
    glyphText: getCipherGlyph(cipherId).glyphText,
    category: word.category,
    correctJa: word.ja,
  };
}

function buildExampleRecord(
  id: string,
  cipherIds: readonly CipherId[],
  assignments: WordAssignments = DEFAULT_WORD_ASSIGNMENTS,
): ExampleRecord {
  const tokens = cipherIds.map((cipherId, index) =>
    makeToken(`${id}-token-${index + 1}`, cipherId, assignments),
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

function buildQuestion(
  level: number,
  cipherIds: readonly CipherId[],
  assignments: WordAssignments = DEFAULT_WORD_ASSIGNMENTS,
): Question {
  const tokens = cipherIds.map((cipherId, index) =>
    makeToken(`question-${level}-token-${index + 1}`, cipherId, assignments),
  );

  return {
    id: `question-${level}`,
    level,
    tokens,
    correctAnswers: Object.fromEntries(
      tokens.map((token) => [token.id, token.correctJa]),
    ),
    choiceCandidatesByTokenId: Object.fromEntries(
      tokens.map((token) => [token.id, getCategoryChoices(token.category)]),
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

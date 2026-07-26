import { getCipherGlyph } from "@/data/cipherGlyphs";
import { WORD_BY_ID } from "@/data/wordPools";
import type {
  CipherToken,
  DialogueLine,
  ExampleRecord,
  GeneratedStage,
  Question,
  WordAssignments,
  WordId,
} from "@/lib/gameTypes";
import {
  buildQuestionTokens,
  cipherIdForWordId,
} from "@/lib/questionToken";

export type AdaptedStage = {
  dialogueLines: DialogueLine[];
  examples: ExampleRecord[];
  question: Question;
};

function makeTokenFromWordId(
  id: string,
  wordId: WordId,
  assignments: WordAssignments,
): CipherToken {
  const word = WORD_BY_ID.get(wordId);
  if (!word) {
    throw new Error(`Unknown word id: ${wordId}`);
  }

  const cipherId = cipherIdForWordId(wordId, assignments);
  return {
    id,
    cipherId,
    wordId,
    glyphText: getCipherGlyph(cipherId).glyphText,
    category: word.category,
    correctJa: word.ja,
  };
}

function buildExampleRecord(
  id: string,
  wordIds: readonly WordId[],
  assignments: WordAssignments,
): ExampleRecord {
  const tokens = wordIds.map((wordId, index) =>
    makeTokenFromWordId(`${id}-token-${index + 1}`, wordId, assignments),
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

function cloneChoiceCandidates(
  choiceCandidatesByTokenId: GeneratedStage["choiceCandidatesByTokenId"],
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(choiceCandidatesByTokenId).map(([tokenId, choices]) => [
      tokenId,
      [...choices],
    ]),
  );
}

export function adaptStage(
  stage: GeneratedStage,
  assignments: WordAssignments,
): AdaptedStage {
  const examples = stage.examples.map((wordIds, index) =>
    buildExampleRecord(
      `example-${stage.level}-${index + 1}`,
      wordIds,
      assignments,
    ),
  );

  const questionTokens = buildQuestionTokens(
    stage.level,
    stage.question,
    assignments,
  );
  const tokens: CipherToken[] = questionTokens.map((token) => ({
    id: token.id,
    cipherId: token.cipherId,
    wordId: token.correctWordId,
    glyphText: getCipherGlyph(token.cipherId).glyphText,
    category: token.category,
    correctJa: token.correctJa,
  }));

  const question: Question = {
    id: `question-${stage.level}`,
    level: stage.level,
    tokens,
    correctAnswers: Object.fromEntries(
      tokens.map((token) => [token.id, token.correctJa]),
    ),
    choiceCandidatesByTokenId: cloneChoiceCandidates(
      stage.choiceCandidatesByTokenId,
    ),
  };

  return {
    dialogueLines: buildDialogueLines(examples),
    examples,
    question,
  };
}

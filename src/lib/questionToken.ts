import { WORD_BY_ID } from "@/data/wordPools";
import type {
  CipherId,
  KnownMeanings,
  WordAssignments,
  WordCategory,
  WordId,
} from "@/lib/gameTypes";

export type QuestionToken = {
  id: string;
  cipherId: CipherId;
  category: WordCategory;
  correctWordId: WordId;
  correctJa: string;
};

export function cipherIdForWordId(
  wordId: WordId,
  assignments: WordAssignments,
): CipherId {
  for (const [cipherId, assignedWordId] of Object.entries(assignments)) {
    if (assignedWordId === wordId) {
      return cipherId as CipherId;
    }
  }
  throw new Error(`No cipher assigned to word: ${wordId}`);
}

export function buildQuestionTokens(
  level: number,
  questionWordIds: readonly WordId[],
  wordAssignments: WordAssignments,
): QuestionToken[] {
  return questionWordIds.map((wordId, index) => {
    const word = WORD_BY_ID.get(wordId);
    if (!word) {
      throw new Error(`Unknown word id: ${wordId}`);
    }
    return {
      id: `question-${level}-token-${index + 1}`,
      cipherId: cipherIdForWordId(wordId, wordAssignments),
      category: word.category,
      correctWordId: wordId,
      correctJa: word.ja,
    };
  });
}

export function buildKnownMeaningsAfterExamples(
  priorKnownMeanings: KnownMeanings,
  examples: readonly (readonly WordId[])[],
  wordAssignments: WordAssignments,
): Map<CipherId, WordId> {
  const known = new Map(priorKnownMeanings);
  for (const example of examples) {
    for (const wordId of example) {
      known.set(cipherIdForWordId(wordId, wordAssignments), wordId);
    }
  }
  return known;
}

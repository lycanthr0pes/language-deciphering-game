import { WORD_BY_ID, WORD_BY_JA } from "@/data/wordPools";
import type { KnownMeanings, WordCategory, WordEntry, WordId } from "@/lib/gameTypes";
import { isSemanticallyValid } from "@/lib/semanticValidation";
import type { QuestionToken } from "@/lib/questionToken";

export type ChoiceMap = Record<string, string[]>;

export function findValidAnswerSignatures(
  tokens: readonly QuestionToken[],
  choicesByTokenId: ChoiceMap,
  knownMeanings: KnownMeanings,
  limit = 2,
): string[] {
  const signatures: string[] = [];
  const assignedMeaning = new Map(knownMeanings);
  const usedMeanings = new Map<WordCategory, Set<WordId>>();

  for (const wordId of knownMeanings.values()) {
    const word = WORD_BY_ID.get(wordId);
    if (!word) {
      continue;
    }
    const used = usedMeanings.get(word.category) ?? new Set<WordId>();
    used.add(wordId);
    usedMeanings.set(word.category, used);
  }

  function visit(index: number, sentence: WordEntry[]) {
    if (signatures.length >= limit) {
      return;
    }

    if (index >= tokens.length) {
      if (isSemanticallyValid(sentence)) {
        signatures.push(sentence.map((word) => word.ja).join("\u0000"));
      }
      return;
    }

    const token = tokens[index];
    const fixedMeaning = assignedMeaning.get(token.cipherId);

    for (const ja of choicesByTokenId[token.id] ?? []) {
      const word = WORD_BY_JA.get(ja);
      if (!word || word.category !== token.category) {
        continue;
      }
      if (fixedMeaning && fixedMeaning !== word.wordId) {
        continue;
      }

      const used = usedMeanings.get(token.category) ?? new Set<WordId>();
      const isNewAssignment = fixedMeaning === undefined;
      if (isNewAssignment && used.has(word.wordId)) {
        continue;
      }

      if (isNewAssignment) {
        assignedMeaning.set(token.cipherId, word.wordId);
        used.add(word.wordId);
        usedMeanings.set(token.category, used);
      }

      visit(index + 1, [...sentence, word]);

      if (isNewAssignment) {
        assignedMeaning.delete(token.cipherId);
        used.delete(word.wordId);
      }
    }
  }

  visit(0, []);
  return signatures;
}

export function hasUniqueCorrectAnswer(
  tokens: readonly QuestionToken[],
  choicesByTokenId: ChoiceMap,
  knownMeanings: KnownMeanings,
): boolean {
  const validAnswers = findValidAnswerSignatures(
    tokens,
    choicesByTokenId,
    knownMeanings,
  );
  const correctSignature = tokens.map((token) => token.correctJa).join("\u0000");

  return validAnswers.length === 1 && validAnswers[0] === correctSignature;
}

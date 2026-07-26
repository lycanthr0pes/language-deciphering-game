import { WORDS } from "@/data/wordPools";
import type { KnownMeanings, StageGenerationRule } from "@/lib/gameTypes";
import type { ChoiceMap } from "@/lib/solutionValidator";
import { hasUniqueCorrectAnswer } from "@/lib/solutionValidator";
import type { QuestionToken } from "@/lib/questionToken";
import { createSeededRandom, shuffle, type RandomSource } from "@/lib/random";

export function drawChoiceMap(
  tokens: readonly QuestionToken[],
  choiceCount: number,
  random: RandomSource,
): ChoiceMap {
  return Object.fromEntries(
    tokens.map((token) => {
      const distractors = shuffle(
        WORDS.filter((word) => word.ja !== token.correctJa),
        random,
      ).slice(0, choiceCount - 1);

      return [
        token.id,
        shuffle(
          [token.correctJa, ...distractors.map((word) => word.ja)],
          random,
        ),
      ];
    }),
  );
}

export function buildFallbackChoiceMap(
  stage: StageGenerationRule,
  tokens: readonly QuestionToken[],
  knownMeanings: KnownMeanings,
  runSeed: string,
): ChoiceMap {
  const knownWordIds = new Set(knownMeanings.values());

  return Object.fromEntries(
    tokens.map((token, tokenIndex) => {
      const knownSameCategory = WORDS.filter(
        (word) =>
          word.ja !== token.correctJa &&
          word.category === token.category &&
          knownWordIds.has(word.wordId),
      );
      const differentCategory = WORDS.filter(
        (word) =>
          word.ja !== token.correctJa && word.category !== token.category,
      );
      const safeDistractors = [...knownSameCategory, ...differentCategory];
      const selected = safeDistractors.slice(0, stage.choiceCount - 1);

      if (selected.length !== stage.choiceCount - 1) {
        throw new Error(`Not enough fallback choices: ${token.id}`);
      }

      return [
        token.id,
        shuffle(
          [token.correctJa, ...selected.map((word) => word.ja)],
          createSeededRandom(`${runSeed}:${stage.fallbackSeed}:${tokenIndex}`),
        ),
      ];
    }),
  );
}

export function createStableChoiceMap(
  stage: StageGenerationRule,
  tokens: readonly QuestionToken[],
  knownMeanings: KnownMeanings,
  runSeed: string,
  random: RandomSource,
): ChoiceMap {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const choices = drawChoiceMap(tokens, stage.choiceCount, random);
    if (hasUniqueCorrectAnswer(tokens, choices, knownMeanings)) {
      return choices;
    }
  }

  const fallback = buildFallbackChoiceMap(
    stage,
    tokens,
    knownMeanings,
    runSeed,
  );
  if (!hasUniqueCorrectAnswer(tokens, fallback, knownMeanings)) {
    throw new Error(`Stage ${stage.level} has no safe fallback choices`);
  }
  return fallback;
}

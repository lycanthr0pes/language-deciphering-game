import { STAGE_RULES } from "../src/data/stageGenerationRules";
import type { CipherId, WordId } from "../src/lib/gameTypes";
import { createRunDefinition } from "../src/lib/runGenerator";
import {
  buildKnownMeaningsAfterExamples,
  buildQuestionTokens,
  cipherIdForWordId,
} from "../src/lib/questionToken";
import { hasUniqueCorrectAnswer } from "../src/lib/solutionValidator";

function publishSentence(
  knownMeanings: Map<CipherId, WordId>,
  wordIds: readonly WordId[],
  wordAssignments: ReturnType<typeof createRunDefinition>["wordAssignments"],
) {
  for (const wordId of wordIds) {
    knownMeanings.set(cipherIdForWordId(wordId, wordAssignments), wordId);
  }
}

const seed = "fixed-test-seed";
const run = createRunDefinition(seed);

if (run.stages.length !== 12) {
  throw new Error(`Expected 12 stages, got ${run.stages.length}`);
}

const knownMeanings = new Map<CipherId, WordId>();

for (const rule of STAGE_RULES) {
  const stage = run.stages.find((entry) => entry.level === rule.level);
  if (!stage) {
    throw new Error(`Missing stage for level ${rule.level}`);
  }

  const knownAfterExamples = buildKnownMeaningsAfterExamples(
    knownMeanings,
    stage.examples,
    run.wordAssignments,
  );

  const tokens = buildQuestionTokens(
    stage.level,
    stage.question,
    run.wordAssignments,
  );

  const choiceMap = Object.fromEntries(
    tokens.map((token) => {
      const choices = stage.choiceCandidatesByTokenId[token.id];
      if (!choices) {
        throw new Error(`Missing choices for ${token.id} on level ${stage.level}`);
      }
      return [token.id, [...choices]];
    }),
  );

  for (const token of tokens) {
    const choices = choiceMap[token.id];
    if (choices.length !== stage.choiceCount) {
      throw new Error(
        `Level ${stage.level} ${token.id}: expected ${stage.choiceCount} choices, got ${choices.length}`,
      );
    }
    if (!choices.includes(token.correctJa)) {
      throw new Error(`Level ${stage.level} ${token.id}: missing correct answer`);
    }
    if (new Set(choices).size !== choices.length) {
      throw new Error(`Level ${stage.level} ${token.id}: duplicate choices`);
    }
  }

  if (!hasUniqueCorrectAnswer(tokens, choiceMap, knownAfterExamples)) {
    throw new Error(`Level ${stage.level}: choices are not uniquely solvable`);
  }

  for (const example of stage.examples) {
    publishSentence(knownMeanings, example, run.wordAssignments);
  }
  publishSentence(knownMeanings, stage.question, run.wordAssignments);
}

const run2 = createRunDefinition(seed);
if (JSON.stringify(run) !== JSON.stringify(run2)) {
  throw new Error("The same seed must reproduce the same run including choices");
}

console.log("OK: FV005 choice generation checks passed");

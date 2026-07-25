import { FALLBACK_STAGES } from "../src/data/fallbackStages";
import { STAGE_RULES } from "../src/data/stageGenerationRules";
import { WORDS, WORD_BY_ID } from "../src/data/wordPools";
import { createSeededRandom } from "../src/lib/random";
import {
  createRunDefinition,
  createWordAssignments,
  generateStages,
} from "../src/lib/runGenerator";
import { isSemanticallyValid } from "../src/lib/semanticValidation";

if (WORDS.length !== 24) {
  throw new Error("The final vocabulary must contain 24 words");
}

if (STAGE_RULES.length !== 12 || FALLBACK_STAGES.length !== 12) {
  throw new Error("The final game must contain 12 stages");
}

for (const stage of FALLBACK_STAGES) {
  for (const sentence of [...stage.examples, stage.question]) {
    const words = sentence.map((wordId) => WORD_BY_ID.get(wordId)!);
    if (!isSemanticallyValid(words)) {
      throw new Error(`Invalid sentence in fallback stage ${stage.level}`);
    }
  }
}

const seed = "fixed-test-seed";
const firstRandom = createSeededRandom(seed);
const firstAssignments = createWordAssignments(firstRandom);
const firstStages = generateStages({
  rules: STAGE_RULES,
  fallbackStages: FALLBACK_STAGES,
  wordAssignments: firstAssignments,
  random: firstRandom,
  runSeed: seed,
});

const secondRandom = createSeededRandom(seed);
const secondAssignments = createWordAssignments(secondRandom);
const secondStages = generateStages({
  rules: STAGE_RULES,
  fallbackStages: FALLBACK_STAGES,
  wordAssignments: secondAssignments,
  random: secondRandom,
  runSeed: seed,
});

if (
  JSON.stringify([firstAssignments, firstStages]) !==
  JSON.stringify([secondAssignments, secondStages])
) {
  throw new Error("The same seed must reproduce the same run");
}

const exampleCount = firstStages.reduce(
  (total, stage) => total + stage.examples.length,
  0,
);
if (exampleCount !== 21) {
  throw new Error(`Expected 21 examples, got ${exampleCount}`);
}

if (firstStages.length !== 12) {
  throw new Error(`Expected 12 stages, got ${firstStages.length}`);
}

const run = createRunDefinition(seed);
if (run.stages.length !== 12) {
  throw new Error("createRunDefinition must return 12 stages");
}

console.log("OK: FV004 run generation checks passed");

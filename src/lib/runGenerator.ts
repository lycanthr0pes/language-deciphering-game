import { FALLBACK_STAGES } from "@/data/fallbackStages";
import { STAGE_RULES } from "@/data/stageGenerationRules";
import {
  WORDS,
  WORDS_BY_CATEGORY,
  WORD_BY_ID,
} from "@/data/wordPools";
import type {
  CipherId,
  FallbackStageDefinition,
  GeneratedStage,
  RunDefinition,
  SentencePattern,
  StageGenerationRule,
  StageWordContent,
  WordAssignments,
  WordCategory,
  WordEntry,
  WordId,
} from "@/lib/gameTypes";
import {
  createRunSeed,
  createSeededRandom,
  shuffle,
  type RandomSource,
} from "@/lib/random";
import {
  isSemanticallyValid,
  matchesSentencePattern,
} from "@/lib/semanticValidation";

export type GenerateStagesParams = {
  rules: readonly StageGenerationRule[];
  fallbackStages: readonly FallbackStageDefinition[];
  wordAssignments: WordAssignments;
  random: RandomSource;
  runSeed: string;
};

const CIPHER_IDS_BY_CATEGORY = {
  color: ["color-1", "color-2", "color-3", "color-4"],
  quality: ["quality-1", "quality-2", "quality-3", "quality-4"],
  quantity: ["quantity-1", "quantity-2", "quantity-3", "quantity-4"],
  noun: [
    "noun-1",
    "noun-2",
    "noun-3",
    "noun-4",
    "noun-5",
    "noun-6",
    "noun-7",
    "noun-8",
  ],
  verb: ["verb-1", "verb-2", "verb-3", "verb-4"],
} as const satisfies Record<WordCategory, readonly CipherId[]>;

const ALL_CIPHER_IDS = Object.values(CIPHER_IDS_BY_CATEGORY).flat();

export function createWordAssignments(random: RandomSource): WordAssignments {
  const pairs = (
    Object.entries(CIPHER_IDS_BY_CATEGORY) as [
      WordCategory,
      readonly CipherId[],
    ][]
  ).flatMap(([category, cipherIds]) => {
    const wordIds = WORDS.filter((word) => word.category === category).map(
      (word) => word.wordId,
    );
    if (wordIds.length !== cipherIds.length) {
      throw new Error(`Cipher/word count mismatch: ${category}`);
    }
    const shuffledWordIds = shuffle(wordIds, random);
    return cipherIds.map(
      (cipherId, index) => [cipherId, shuffledWordIds[index]] as const,
    );
  });

  return Object.fromEntries(pairs) as WordAssignments;
}

function cipherIdForWordId(
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

function wordIdsToEntries(wordIds: readonly WordId[]): WordEntry[] {
  return wordIds.map((wordId) => {
    const word = WORD_BY_ID.get(wordId);
    if (!word) {
      throw new Error(`Unknown word id: ${wordId}`);
    }
    return word;
  });
}

function sentenceKey(wordIds: readonly WordId[]): string {
  return wordIds.map((wordId) => WORD_BY_ID.get(wordId)!.ja).join("\u0000");
}

function cloneKnownMeanings(
  knownMeanings: ReadonlyMap<CipherId, WordId>,
): Map<CipherId, WordId> {
  return new Map(knownMeanings);
}

function publishSentence(
  knownMeanings: Map<CipherId, WordId>,
  wordIds: readonly WordId[],
  assignments: WordAssignments,
) {
  for (const wordId of wordIds) {
    knownMeanings.set(cipherIdForWordId(wordId, assignments), wordId);
  }
}

function getUnknownWordIds(
  question: readonly WordId[],
  knownAfterExamples: ReadonlyMap<CipherId, WordId>,
  assignments: WordAssignments,
): WordId[] {
  return question.filter(
    (wordId) =>
      !knownAfterExamples.has(cipherIdForWordId(wordId, assignments)),
  );
}

function countUnpublishedCiphers(
  knownMeanings: ReadonlyMap<CipherId, WordId>,
): number {
  return ALL_CIPHER_IDS.filter((cipherId) => !knownMeanings.has(cipherId))
    .length;
}

function futureUnknownNeed(
  rules: readonly StageGenerationRule[],
  afterLevel: number,
): number {
  return rules
    .filter((rule) => rule.level > afterLevel)
    .reduce((total, rule) => total + rule.unknownWordCount, 0);
}

function pickRandomSentence(
  pattern: SentencePattern,
  random: RandomSource,
  usedSentenceKeys: ReadonlySet<string>,
): readonly WordId[] | null {
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const wordIds = pattern.map((category) => {
      const pool = WORDS_BY_CATEGORY[category];
      const index = Math.floor(random() * pool.length);
      return pool[index].wordId;
    });
    const words = wordIdsToEntries(wordIds);
    if (!matchesSentencePattern(words, pattern)) {
      continue;
    }
    if (!isSemanticallyValid(words)) {
      continue;
    }
    const key = sentenceKey(wordIds);
    if (usedSentenceKeys.has(key)) {
      continue;
    }
    return wordIds;
  }
  return null;
}

function toGeneratedStage(
  content: StageWordContent,
  rule: StageGenerationRule,
): GeneratedStage {
  return {
    ...content,
    choiceCount: rule.choiceCount,
    choiceCandidatesByTokenId: {},
  };
}

function validateStageContent(
  content: StageWordContent,
  rule: StageGenerationRule,
  knownMeanings: ReadonlyMap<CipherId, WordId>,
  assignments: WordAssignments,
  usedSentenceKeys: ReadonlySet<string>,
  rules: readonly StageGenerationRule[],
): boolean {
  if (content.examples.length !== rule.exampleCount) {
    return false;
  }

  for (const sentence of [...content.examples, content.question]) {
    const words = wordIdsToEntries(sentence);
    if (!matchesSentencePattern(words, rule.pattern)) {
      return false;
    }
    if (!isSemanticallyValid(words)) {
      return false;
    }
    if (usedSentenceKeys.has(sentenceKey(sentence))) {
      return false;
    }
  }

  const knownAfterExamples = cloneKnownMeanings(knownMeanings);
  for (const example of content.examples) {
    publishSentence(knownAfterExamples, example, assignments);
  }

  const unknownWordIds = getUnknownWordIds(
    content.question,
    knownAfterExamples,
    assignments,
  );
  if (unknownWordIds.length !== rule.unknownWordCount) {
    return false;
  }

  const knownAfterLevel = cloneKnownMeanings(knownAfterExamples);
  publishSentence(knownAfterLevel, content.question, assignments);

  const unpublished = countUnpublishedCiphers(knownAfterLevel);
  if (unpublished < futureUnknownNeed(rules, rule.level)) {
    return false;
  }

  return true;
}

function tryGenerateStage(
  rule: StageGenerationRule,
  params: {
    assignments: WordAssignments;
    random: RandomSource;
    knownMeanings: ReadonlyMap<CipherId, WordId>;
    usedSentenceKeys: ReadonlySet<string>;
    rules: readonly StageGenerationRule[];
  },
): StageWordContent | null {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const examples: WordId[][] = [];
    let failed = false;

    for (let index = 0; index < rule.exampleCount; index += 1) {
      const keysWithExamples = new Set(params.usedSentenceKeys);
      for (const example of examples) {
        keysWithExamples.add(sentenceKey(example));
      }
      const example = pickRandomSentence(
        rule.pattern,
        params.random,
        keysWithExamples,
      );
      if (!example) {
        failed = true;
        break;
      }
      examples.push([...example]);
    }
    if (failed) {
      continue;
    }

    const keysBeforeQuestion = new Set(params.usedSentenceKeys);
    for (const example of examples) {
      keysBeforeQuestion.add(sentenceKey(example));
    }
    const question = pickRandomSentence(
      rule.pattern,
      params.random,
      keysBeforeQuestion,
    );
    if (!question) {
      continue;
    }

    const knownAfterExamples = cloneKnownMeanings(params.knownMeanings);
    for (const example of examples) {
      publishSentence(knownAfterExamples, example, params.assignments);
    }
    const unknownWordIds = getUnknownWordIds(
      question,
      knownAfterExamples,
      params.assignments,
    );

    const content: StageWordContent = {
      level: rule.level,
      examples,
      question: [...question],
      unknownWordIds,
    };

    if (
      !validateStageContent(
        content,
        rule,
        params.knownMeanings,
        params.assignments,
        params.usedSentenceKeys,
        params.rules,
      )
    ) {
      continue;
    }

    return content;
  }

  return null;
}

function materializeFallbackStage(
  template: FallbackStageDefinition,
  knownMeanings: ReadonlyMap<CipherId, WordId>,
  assignments: WordAssignments,
): StageWordContent {
  const knownAfterExamples = cloneKnownMeanings(knownMeanings);
  for (const example of template.examples) {
    publishSentence(knownAfterExamples, example, assignments);
  }

  return {
    level: template.level,
    examples: template.examples,
    question: template.question,
    unknownWordIds: getUnknownWordIds(
      template.question,
      knownAfterExamples,
      assignments,
    ),
  };
}

function commitStage(
  stage: GeneratedStage,
  wordAssignments: WordAssignments,
  knownMeanings: Map<CipherId, WordId>,
  usedSentenceKeys: Set<string>,
) {
  for (const example of stage.examples) {
    usedSentenceKeys.add(sentenceKey(example));
    publishSentence(knownMeanings, example, wordAssignments);
  }
  usedSentenceKeys.add(sentenceKey(stage.question));
  publishSentence(knownMeanings, stage.question, wordAssignments);
}

function attemptRandomStages(params: GenerateStagesParams): GeneratedStage[] | null {
  const { rules, wordAssignments, random } = params;
  const stages: GeneratedStage[] = [];
  const knownMeanings = new Map<CipherId, WordId>();
  const usedSentenceKeys = new Set<string>();

  for (const rule of rules) {
    const content = tryGenerateStage(rule, {
      assignments: wordAssignments,
      random,
      knownMeanings,
      usedSentenceKeys,
      rules,
    });
    if (!content) {
      return null;
    }
    if (
      !validateStageContent(
        content,
        rule,
        knownMeanings,
        wordAssignments,
        usedSentenceKeys,
        rules,
      )
    ) {
      return null;
    }

    const stage = toGeneratedStage(content, rule);
    stages.push(stage);
    commitStage(stage, wordAssignments, knownMeanings, usedSentenceKeys);
  }

  if (knownMeanings.size !== ALL_CIPHER_IDS.length) {
    return null;
  }

  return stages;
}

function generateFallbackStages(params: GenerateStagesParams): GeneratedStage[] {
  const { rules, fallbackStages, wordAssignments } = params;
  const stages: GeneratedStage[] = [];
  const knownMeanings = new Map<CipherId, WordId>();
  const usedSentenceKeys = new Set<string>();

  for (const rule of rules) {
    const fallbackTemplate = fallbackStages.find(
      (stage) => stage.level === rule.level,
    );
    if (!fallbackTemplate) {
      throw new Error(`Missing fallback stage for level ${rule.level}`);
    }

    const content = materializeFallbackStage(
      fallbackTemplate,
      knownMeanings,
      wordAssignments,
    );
    if (
      !validateStageContent(
        content,
        rule,
        knownMeanings,
        wordAssignments,
        usedSentenceKeys,
        rules,
      )
    ) {
      throw new Error(`Stage ${rule.level} has no safe fallback`);
    }

    const stage = toGeneratedStage(content, rule);
    stages.push(stage);
    commitStage(stage, wordAssignments, knownMeanings, usedSentenceKeys);
  }

  if (knownMeanings.size !== ALL_CIPHER_IDS.length) {
    throw new Error(
      `Fallback run did not publish all cipher mappings: ${knownMeanings.size}/${ALL_CIPHER_IDS.length}`,
    );
  }

  return stages;
}

export function generateStages(params: GenerateStagesParams): GeneratedStage[] {
  return attemptRandomStages(params) ?? generateFallbackStages(params);
}

export function createRunDefinition(runSeed = createRunSeed()): RunDefinition {
  const random = createSeededRandom(runSeed);
  const wordAssignments = createWordAssignments(random);
  const stages = generateStages({
    rules: STAGE_RULES,
    fallbackStages: FALLBACK_STAGES,
    wordAssignments,
    random,
    runSeed,
  });

  return {
    runSeed,
    wordAssignments,
    stages,
  };
}

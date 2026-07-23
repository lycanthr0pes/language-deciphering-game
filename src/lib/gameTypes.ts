export type Difficulty = "easy" | "hard";
export type MenuView = "root" | "guide" | "difficulty";

export type DialogueType = "normal" | "cipher" | "translation" | "answer";
export type Speaker = "narration" | "man";

export type DialogueLine = {
  id: string;
  text: string;
  type: DialogueType;
  speaker: Speaker;
};

export type WordCategory =
  | "color"
  | "quality"
  | "quantity"
  | "noun"
  | "verb";

export type NounKind = "human" | "animal" | "object";
export type CipherSlotIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type ShortCipherSlotIndex = 1 | 2 | 3 | 4;

export type CipherId =
  | `color-${ShortCipherSlotIndex}`
  | `quality-${ShortCipherSlotIndex}`
  | `quantity-${ShortCipherSlotIndex}`
  | `noun-${CipherSlotIndex}`
  | `verb-${ShortCipherSlotIndex}`;

export type WordId =
  | "color-red"
  | "color-blue"
  | "color-black"
  | "color-white"
  | "quality-large"
  | "quality-small"
  | "quality-old"
  | "quality-broken"
  | "quantity-some"
  | "quantity-many"
  | "quantity-one-human"
  | "quantity-one-animal"
  | "noun-man"
  | "noun-woman"
  | "noun-dog"
  | "noun-cat"
  | "noun-bird"
  | "noun-fish"
  | "noun-chair"
  | "noun-door"
  | "verb-see"
  | "verb-chase"
  | "verb-sleep"
  | "verb-creak";

export type WordEntry = {
  wordId: WordId;
  category: WordCategory;
  ja: string;
  nounKind?: NounKind;
  allowedNounKinds?: readonly NounKind[];
};

export type CipherGlyphEntry = {
  cipherId: CipherId;
  glyphText: string;
};

export type CipherToken = {
  id: string;
  cipherId: CipherId;
  wordId: WordId;
  glyphText: string;
  category: WordCategory;
  correctJa: string;
};

export type Question = {
  id: string;
  level: number;
  tokens: CipherToken[];
  correctAnswers: Record<string, string>;
  choiceCandidatesByTokenId: Record<string, string[]>;
};

export type ExampleRecord = {
  id: string;
  translation: string;
  tokens: CipherToken[];
};

export type NotebookSpread = {
  left: ExampleRecord[];
  right: ExampleRecord[];
};

export type SelectedAnswers = Partial<Record<string, string>>;

export type TokenJudgement = "correct" | "incorrect";

export type AnswerJudgement = {
  isCorrect: boolean;
  correctWordCount: number;
  totalWordCount: number;
  tokenResults: Record<string, TokenJudgement>;
};

export type GamePhase =
  | "menu"
  | "opening"
  | "introDialogue"
  | "exampleDialogue"
  | "question"
  | "answering"
  | "answerFeedback"
  | "clearCutscene"
  | "gameOverCutscene"
  | "endTitle"
  | "result";

export type ResultStatus = "clear" | "gameOver";
export type FontStatus = "loading" | "ready" | "error";
export type AssetStatus = "loading" | "ready" | "error";

export type SoundKey =
  | "dialogueNext"
  | "manTalk"
  | "writeNote"
  | "drawGun"
  | "gunShot"
  | "end"
  | "closeNote"
  | "openNote"
  | "wrongAnswer";

export type DifficultyConfig = {
  timeLimitSeconds: number | null;
  warningTimeSeconds: number | null;
  safeMistakeCount: 0 | 1;
};

export type SentencePattern = readonly WordCategory[];

export type StageGenerationRule = {
  level: number;
  exampleCount: number;
  pattern: SentencePattern;
  unknownWordCount: 0 | 1 | 2;
  choiceCount: 4 | 6 | 8 | 10;
  fallbackSeed: string;
};

export type WordAssignments = Readonly<Record<CipherId, WordId>>;

export type GeneratedStage = {
  level: number;
  examples: readonly (readonly WordId[])[];
  question: readonly WordId[];
  unknownWordIds: readonly WordId[];
  choiceCount: 4 | 6 | 8 | 10;
  choiceCandidatesByTokenId: Readonly<Record<string, readonly string[]>>;
};

export type RunDefinition = {
  runSeed: string;
  wordAssignments: WordAssignments;
  stages: readonly GeneratedStage[];
};

export type MainMenuProps = {
  view: MenuView;
  selectedDifficulty: Difficulty | null;
  onOpenGuide: () => void;
  onOpenDifficulty: () => void;
  onBack: () => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onStart: () => void;
};

export type DifficultyBadgeProps = {
  difficulty: Difficulty;
};

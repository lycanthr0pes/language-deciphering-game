export type DialogueType = "normal" | "cipher" | "translation" | "answer";
export type Speaker = "narration" | "man";

export type DialogueLine = {
  id: string;
  text: string;
  type: DialogueType;
  speaker: Speaker;
};

export type InternalCategory =
  | "color"
  | "quality"
  | "quantity"
  | "verb"
  | "humanNoun"
  | "animalNoun";

export type CandidateIndex = 1 | 2;
export type CipherId = `${InternalCategory}-${CandidateIndex}`;

export type CipherGlyphEntry = {
  cipherId: CipherId;
  glyphText: string;
};

export type CipherToken = {
  id: string;
  cipherId: CipherId;
  glyphText: string;
  category: InternalCategory;
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

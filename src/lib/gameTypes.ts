export type DialogueType = "normal" | "cipher" | "translation" | "answer";

export type DialogueLine = {
  id: string;
  text: string;
  type: DialogueType;
};

export type InternalCategory =
  | "color"
  | "quality"
  | "quantity"
  | "verb"
  | "humanNoun"
  | "animalNoun";

export type CipherToken = {
  id: string;
  /** 内部ID用の仮ラテン暗号（プール照合・判定にはこちらを使う） */
  cipher: string;
  /** 画面表示用の Mende Kikakui 2文字 */
  glyphText: string;
  category: InternalCategory;
  correctJa: string;
};

export type Question = {
  id: string;
  cipherText: string;
  tokens: CipherToken[];
  correctAnswers: Record<string, string>;
  choiceCandidatesByTokenId: Record<string, string[]>;
};

export type ExampleRecord = {
  id: string;
  cipherText: string;
  translation: string;
  tokens: CipherToken[];
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

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
  cipher: string;
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

export type GamePhase =
  | "introDialogue"
  | "exampleDialogue"
  | "question"
  | "answering"
  | "result";

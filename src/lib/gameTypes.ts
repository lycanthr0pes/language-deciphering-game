export type DialogueType = "normal" | "cipher" | "translation" | "answer";

export type DialogueLine = {
  id: string;
  text: string;
  type: DialogueType;
};

export type GamePhase =
  | "introDialogue"
  | "question"
  | "answering"
  | "result";

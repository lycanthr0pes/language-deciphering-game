"use client";

import { useEffect, useState } from "react";
import { ChoiceList } from "./ChoiceList";
import { DialogueBox } from "./DialogueBox";
import { INTRO_DIALOGUES } from "@/data/introDialogues";
import type { GamePhase } from "@/lib/gameTypes";
import { judgeAnswer } from "@/lib/judgeAnswer";
import styles from "./GameScreen.module.css";

const sampleQuestion = {
  cipherText: "rami humi",
  tokens: [
    { id: "token-1", cipher: "rami", category: "color", correctJa: "青い" },
    { id: "token-2", cipher: "humi", category: "humanNoun", correctJa: "女" },
  ],
  correctAnswers: {
    "token-1": "青い",
    "token-2": "女",
  },
  choiceCandidatesByTokenId: {
    "token-1": ["赤い", "青い"],
    "token-2": ["男", "女"],
  },
};

export function GameScreen() {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>("introDialogue");
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Partial<Record<string, string>>
  >({});

  const currentDialogue = INTRO_DIALOGUES[dialogueIndex];

  const canSubmitAnswer = sampleQuestion.tokens.every((token) => {
    return selectedAnswers[token.id];
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        event.preventDefault();
        console.log("あとで手帳を開閉する");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleNextDialogue() {
    if (gamePhase !== "introDialogue") return;

    const nextIndex = dialogueIndex + 1;

    if (nextIndex < INTRO_DIALOGUES.length) {
      setDialogueIndex(nextIndex);
      return;
    }

    setGamePhase("question");
  }

  function handleSelectToken(tokenId: string) {
    setActiveTokenId(tokenId);
  }

  function handleSelectWord(tokenId: string, value: string) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [tokenId]: value,
    }));
  }

  function getActiveChoices() {
    if (activeTokenId === null) return [];

    const candidatesByTokenId: Record<string, string[]> =
      sampleQuestion.choiceCandidatesByTokenId;

    return candidatesByTokenId[activeTokenId] ?? [];
  }

  function handleSubmitAnswer() {
    const isComplete = sampleQuestion.tokens.every((token) => {
      return selectedAnswers[token.id];
    });

    if (!isComplete) return;

    const isCorrect = judgeAnswer(sampleQuestion, selectedAnswers);

    if (isCorrect) {
      alert("正解");
    } else {
      alert("不正解");
    }
  }

  return (
    <main className={styles.screen} onClick={handleNextDialogue}>
      {gamePhase === "introDialogue" ? (
        <DialogueBox line={currentDialogue} instruction="左クリックで進む" />
      ) : null}
      {gamePhase === "question" ? (
        <>
          <p className={styles.cipherText}>問題: {sampleQuestion.cipherText}</p>
          <ChoiceList
            tokens={sampleQuestion.tokens}
            choices={getActiveChoices()}
            selectedAnswers={selectedAnswers}
            activeTokenId={activeTokenId}
            canSubmit={canSubmitAnswer}
            onSelectToken={handleSelectToken}
            onSelectWord={handleSelectWord}
            onSubmit={handleSubmitAnswer}
          />
        </>
      ) : null}
    </main>
  );
}

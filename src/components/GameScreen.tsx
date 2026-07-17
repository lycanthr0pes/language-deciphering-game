"use client";

import { useState } from "react";
import { ChoiceList } from "./ChoiceList";
import { DialogueBox } from "./DialogueBox";
import { ResultScreen } from "./ResultScreen";
import { INTRO_DIALOGUES } from "@/data/introDialogues";
import { generateRound } from "@/lib/cipherGenerator";
import { GAME_CONFIG } from "@/lib/gameConfig";
import type { DialogueLine, GamePhase, Question } from "@/lib/gameTypes";
import { judgeAnswer } from "@/lib/judgeAnswer";
import styles from "./GameScreen.module.css";

export function GameScreen() {
  const [dialogueLines, setDialogueLines] =
    useState<DialogueLine[]>(INTRO_DIALOGUES);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>("introDialogue");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Partial<Record<string, string>>
  >({});
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [mistakesRemaining, setMistakesRemaining] = useState<number>(
    GAME_CONFIG.safeMistakeCount,
  );
  const [difficultyLevel, setDifficultyLevel] = useState(1);

  const currentDialogue = dialogueLines[dialogueIndex] ?? null;

  const canSubmitAnswer =
    currentQuestion?.tokens.every((token) => selectedAnswers[token.id]) ?? false;

  function startRound(level: number) {
    const round = generateRound(level);
    setDialogueLines(round.dialogueLines);
    setDialogueIndex(0);
    setCurrentQuestion(round.question);
    setSelectedAnswers({});
    setActiveTokenId(null);
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    setGamePhase("exampleDialogue");
  }

  function handleNextDialogue() {
    if (gamePhase === "result" || gamePhase === "answering") return;

    const nextIndex = dialogueIndex + 1;

    if (nextIndex < dialogueLines.length) {
      setDialogueIndex(nextIndex);
      return;
    }

    if (gamePhase === "introDialogue") {
      startRound(difficultyLevel);
      return;
    }

    if (gamePhase === "exampleDialogue") {
      if (!currentQuestion) return;

      const questionLines: DialogueLine[] = [
        {
          id: "question-line",
          text: currentQuestion.cipherText,
          type: "cipher",
        },
      ];
      setDialogueLines(questionLines);
      setDialogueIndex(0);
      setGamePhase("question");
      return;
    }

    if (gamePhase === "question") {
      setGamePhase("answering");
    }
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
    if (!currentQuestion || activeTokenId === null) return [];
    return currentQuestion.choiceCandidatesByTokenId[activeTokenId] ?? [];
  }

  function handleSubmitAnswer() {
    if (!currentQuestion || !canSubmitAnswer) return;

    if (judgeAnswer(currentQuestion, selectedAnswers)) {
      handleCorrectAnswer();
      return;
    }

    handleWrongAnswer();
  }

  function handleCorrectAnswer() {
    setCorrectCount((prev) => prev + 1);
    setSelectedAnswers({});
    setActiveTokenId(null);

    if (difficultyLevel >= GAME_CONFIG.finalLevel) {
      setGamePhase("result");
      return;
    }

    const nextLevel = difficultyLevel + 1;
    setDifficultyLevel(nextLevel);
    startRound(nextLevel);
  }

  function handleWrongAnswer() {
    setMistakeCount((prev) => prev + 1);
    setSelectedAnswers({});
    setActiveTokenId(null);

    if (mistakesRemaining <= 0) {
      setGamePhase("result");
      return;
    }

    setMistakesRemaining((prev) => Math.max(prev - 1, 0));
  }

  function resetGame() {
    setGamePhase("introDialogue");
    setDialogueLines(INTRO_DIALOGUES);
    setDialogueIndex(0);
    setCurrentQuestion(null);
    setSelectedAnswers({});
    setActiveTokenId(null);
    setCorrectCount(0);
    setMistakeCount(0);
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    setDifficultyLevel(1);
  }

  function handleMainClick() {
    if (gamePhase === "result") {
      resetGame();
      return;
    }

    handleNextDialogue();
  }

  const instruction =
    gamePhase === "answering"
      ? "暗号単語を選び、日本語を割り当ててください"
      : "左クリックで進む";

  return (
    <main className={styles.screen} onClick={handleMainClick}>
      {gamePhase !== "result" ? (
        <>
          <div className={styles.status}>
            正解 {correctCount} / 失敗 {mistakeCount} / 間違い可能{" "}
            {mistakesRemaining}
          </div>
          {currentDialogue ? (
            <DialogueBox line={currentDialogue} instruction={instruction} />
          ) : null}
          {gamePhase === "answering" && currentQuestion ? (
            <ChoiceList
              tokens={currentQuestion.tokens}
              choices={getActiveChoices()}
              selectedAnswers={selectedAnswers}
              activeTokenId={activeTokenId}
              canSubmit={canSubmitAnswer}
              onSelectToken={handleSelectToken}
              onSelectWord={handleSelectWord}
              onSubmit={handleSubmitAnswer}
            />
          ) : null}
        </>
      ) : (
        <ResultScreen
          correctCount={correctCount}
          mistakeCount={mistakeCount}
          onRetry={resetGame}
        />
      )}
    </main>
  );
}

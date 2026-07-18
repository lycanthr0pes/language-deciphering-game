"use client";

import { useEffect, useState } from "react";
import { ChoiceList } from "./ChoiceList";
import { DialogueBox } from "./DialogueBox";
import { TimerDisplay } from "./TimerDisplay";
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
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [mistakesRemaining, setMistakesRemaining] = useState<number>(
    GAME_CONFIG.safeMistakeCount,
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Partial<Record<string, string>>
  >({});
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.timeLimitSeconds);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const currentDialogue = dialogueLines[dialogueIndex];

  const canSubmitAnswer =
    currentQuestion?.tokens.every((token) => selectedAnswers[token.id]) ?? false;

  function startRound(level: number) {
    const round = generateRound(level);
    setDialogueLines(round.dialogueLines);
    setDialogueIndex(0);
    setCurrentQuestion(round.question);
    setSelectedAnswers({});
    setActiveTokenId(null);
    setTimeLeft(GAME_CONFIG.timeLimitSeconds);
    setIsTimedOut(false);
    setGamePhase("exampleDialogue");
  }

  useEffect(() => {
    if (gamePhase !== "question" && gamePhase !== "answering") return;

    if (timeLeft <= 0) {
      setIsTimedOut(true);
      return;
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [gamePhase, timeLeft]);

  function handleNextDialogue() {
    if (gamePhase === "question" || gamePhase === "result") return;

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
      setGamePhase("question");
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

  function handleCorrectAnswer() {
    const nextCorrectCount = correctCount + 1;
    setCorrectCount(nextCorrectCount);
    setSelectedAnswers({});
    setActiveTokenId(null);

    if (difficultyLevel >= GAME_CONFIG.finalLevel) {
      setGamePhase("result");
      return;
    }

    const nextLevel = difficultyLevel + 1;
    setDifficultyLevel(nextLevel);
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    startRound(nextLevel);
  }

  function handleWrongAnswer() {
    const nextMistakeCount = mistakeCount + 1;
    setMistakeCount(nextMistakeCount);

    if (isTimedOut || mistakesRemaining <= 0) {
      setGamePhase("result");
      return;
    }

    setMistakesRemaining((prev) => Math.max(prev - 1, 0));
    setSelectedAnswers({});
    setActiveTokenId(null);
  }

  function handleSubmitAnswer() {
    if (!currentQuestion || !canSubmitAnswer) return;

    if (judgeAnswer(currentQuestion, selectedAnswers)) {
      handleCorrectAnswer();
      return;
    }

    handleWrongAnswer();
  }

  return (
    <main className={styles.screen} onClick={handleNextDialogue}>
      <div className={styles.status}>
        正解 {correctCount} / 失敗 {mistakeCount} / 間違い可能 {mistakesRemaining}
      </div>
      {gamePhase === "question" || gamePhase === "answering" ? (
        <TimerDisplay
          timeLeft={timeLeft}
          warningTime={GAME_CONFIG.warningTimeSeconds}
          mistakesRemaining={mistakesRemaining}
        />
      ) : null}
      {gamePhase === "result" ? (
        <div className={styles.result}>
          <p>Lv{difficultyLevel >= GAME_CONFIG.finalLevel ? "8 クリア" : "ゲームオーバー"}</p>
          <p>
            正解 {correctCount} / 失敗 {mistakeCount}
          </p>
        </div>
      ) : null}
      {gamePhase !== "result" &&
      (gamePhase === "introDialogue" || gamePhase === "exampleDialogue") ? (
        <DialogueBox line={currentDialogue} instruction="左クリックで進む" />
      ) : null}
      {gamePhase === "question" && currentQuestion ? (
        <>
          <p className={styles.cipherText}>
            問題: {currentQuestion.cipherText}
          </p>
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
        </>
      ) : null}
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { ChoiceList } from "./ChoiceList";
import { CutsceneScreen } from "./CutsceneScreen";
import { DialogueBox } from "./DialogueBox";
import { EndTitleScreen } from "./EndTitleScreen";
import { Notebook } from "./Notebook";
import { OpeningBlink } from "./OpeningBlink";
import { ResultScreen } from "./ResultScreen";
import { TimerDisplay } from "./TimerDisplay";
import { INTRO_DIALOGUES } from "@/data/introDialogues";
import { generateRound } from "@/lib/cipherGenerator";
import { GAME_CONFIG } from "@/lib/gameConfig";
import { OPENING_ASSET_PATHS } from "@/lib/openingAssets";
import { preloadOpeningAssets } from "@/lib/preloadOpeningAssets";
import type {
  DialogueLine,
  ExampleRecord,
  GamePhase,
  Question,
  ResultStatus,
} from "@/lib/gameTypes";
import { judgeAnswer } from "@/lib/judgeAnswer";
import { usePrefersReducedMotion } from "@/utils/usePrefersReducedMotion";
import styles from "./GameScreen.module.css";

export function GameScreen() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [openingAssetStatus, setOpeningAssetStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [openingKey, setOpeningKey] = useState(0);
  const [dialogueLines, setDialogueLines] =
    useState<DialogueLine[]>(INTRO_DIALOGUES);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>("opening");
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
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.timeLimitSeconds);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [examples, setExamples] = useState<ExampleRecord[]>([]);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookPage, setNotebookPage] = useState(0);
  const [hasUnreadExamples, setHasUnreadExamples] = useState(false);
  const [cutsceneStep, setCutsceneStep] = useState(0);
  const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null);

  const currentDialogue = dialogueLines[dialogueIndex] ?? null;

  const pageCount = Math.max(
    1,
    Math.ceil(examples.length / GAME_CONFIG.examplesPerNotebookPage),
  );

  const clearTimeSeconds =
    endedAt !== null
      ? Math.floor((endedAt - startedAt) / 1000)
      : 0;

  const canSubmitAnswer =
    currentQuestion?.tokens.every((token) => selectedAnswers[token.id]) ?? false;

  const startIntroDialogue = useCallback(() => {
    setDialogueLines(INTRO_DIALOGUES);
    setDialogueIndex(0);
    setGamePhase("introDialogue");
  }, []);

  useEffect(() => {
    let cancelled = false;

    void preloadOpeningAssets()
      .then(() => {
        if (!cancelled) {
          setOpeningAssetStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOpeningAssetStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function startRound(level: number) {
    const round = generateRound(level);
    setDialogueLines(round.dialogueLines);
    setDialogueIndex(0);
    setCurrentQuestion(round.question);
    setExamples((prev) => [...prev, ...round.examples]);
    setSelectedAnswers({});
    setActiveTokenId(null);
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    setTimeLeft(GAME_CONFIG.timeLimitSeconds);
    setIsTimedOut(false);
    setGamePhase("exampleDialogue");
  }

  function moveToLatestNotebookPage() {
    setNotebookPage(pageCount - 1);
  }

  function notifyNewExamples() {
    if (isNotebookOpen) {
      moveToLatestNotebookPage();
      setHasUnreadExamples(false);
      return;
    }

    setHasUnreadExamples(true);
  }

  function openNotebook() {
    moveToLatestNotebookPage();
    setHasUnreadExamples(false);
    setIsNotebookOpen(true);
  }

  function closeNotebook() {
    if (!isNotebookOpen) return;

    setIsNotebookOpen(false);
  }

  function toggleNotebook() {
    if (isNotebookOpen) {
      closeNotebook();
      return;
    }

    openNotebook();
  }

  function moveNotebookPage(direction: -1 | 1) {
    setNotebookPage((currentPage) =>
      Math.min(Math.max(currentPage + direction, 0), pageCount - 1),
    );
  }

  function canUseNotebook(phase: GamePhase) {
    return (
      phase === "introDialogue" ||
      phase === "exampleDialogue" ||
      phase === "question" ||
      phase === "answering"
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isInteractiveTarget =
        target instanceof HTMLElement &&
        target.matches(
          "button, input, select, textarea, [contenteditable='true']",
        );

      if (isInteractiveTarget) return;
      if (!canUseNotebook(gamePhase)) return;

      if (event.code === "Space") {
        event.preventDefault();
        toggleNotebook();
        return;
      }

      if (!isNotebookOpen) return;

      if (event.key === "a" || event.key === "A") {
        moveNotebookPage(-1);
        return;
      }

      if (event.key === "d" || event.key === "D") {
        moveNotebookPage(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gamePhase, isNotebookOpen, pageCount]);

  useEffect(() => {
    if (gamePhase !== "question" && gamePhase !== "answering") return;
    if (timeLeft <= 0) return;

    const timerId = window.setTimeout(() => {
      setTimeLeft((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) {
          setIsTimedOut(true);
        }
        return next;
      });
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [gamePhase, timeLeft]);

  useEffect(() => {
    if (gamePhase !== "gameOverCutscene" && gamePhase !== "clearCutscene") {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (cutsceneStep >= 2) {
        setCutsceneStep(0);
        setGamePhase("endTitle");
        return;
      }

      setCutsceneStep((prev) => prev + 1);
    }, GAME_CONFIG.cutsceneStepMs);

    return () => window.clearTimeout(timerId);
  }, [gamePhase, cutsceneStep]);

  function handleNextDialogue() {
    if (
      gamePhase === "opening" ||
      gamePhase === "endTitle" ||
      gamePhase === "clearCutscene" ||
      gamePhase === "gameOverCutscene" ||
      gamePhase === "result"
    ) {
      return;
    }
    if (isNotebookOpen) return;
    if (gamePhase === "answering") return;

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
      notifyNewExamples();
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
      setEndedAt((value) => value ?? Date.now());
      setResultStatus("clear");
      setCutsceneStep(0);
      setGamePhase("clearCutscene");
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

    if (isTimedOut || mistakesRemaining <= 0) {
      setEndedAt((value) => value ?? Date.now());
      setResultStatus("gameOver");
      setCutsceneStep(0);
      setGamePhase("gameOverCutscene");
      return;
    }

    setMistakesRemaining((prev) => Math.max(prev - 1, 0));
  }

  function resetGame() {
    setOpeningKey((key) => key + 1);
    setGamePhase("opening");
    setDialogueLines(INTRO_DIALOGUES);
    setDialogueIndex(0);
    setCurrentQuestion(null);
    setSelectedAnswers({});
    setActiveTokenId(null);
    setCorrectCount(0);
    setMistakeCount(0);
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    setDifficultyLevel(1);
    setTimeLeft(GAME_CONFIG.timeLimitSeconds);
    setIsTimedOut(false);
    setStartedAt(Date.now());
    setEndedAt(null);
    setExamples([]);
    setIsNotebookOpen(false);
    setNotebookPage(0);
    setHasUnreadExamples(false);
    setCutsceneStep(0);
    setResultStatus(null);
  }

  function handleMainClick() {
    if (gamePhase === "result") {
      resetGame();
      return;
    }

    if (
      gamePhase === "opening" ||
      gamePhase === "endTitle" ||
      gamePhase === "clearCutscene" ||
      gamePhase === "gameOverCutscene"
    ) {
      return;
    }

    handleNextDialogue();
  }

  if (openingAssetStatus === "error") {
    return (
      <main className={styles.screen}>
        <p role="alert">ゲーム素材を読み込めません。再読み込みしてください。</p>
      </main>
    );
  }

  if (openingAssetStatus === "loading") {
    return (
      <main className={styles.screen}>
        <p>読み込み中...</p>
      </main>
    );
  }

  const instruction =
    gamePhase === "answering"
      ? "暗号単語を選び、日本語を割り当ててください"
      : "左クリックで進む / Spaceで手帳";

  const showSceneLayer =
    gamePhase === "opening" ||
    gamePhase === "introDialogue" ||
    gamePhase === "exampleDialogue" ||
    gamePhase === "question" ||
    gamePhase === "answering";

  return (
    <main className={styles.screen} onClick={handleMainClick}>
      {showSceneLayer ? (
        <div className={styles.scene} aria-hidden="true">
          <img
            src={OPENING_ASSET_PATHS.backgroundRoom}
            alt=""
            className={styles.backgroundImage}
          />
          <img
            src={OPENING_ASSET_PATHS.manNormal}
            alt=""
            className={styles.manImage}
          />
        </div>
      ) : null}
      {gamePhase === "opening" ? (
        <OpeningBlink
          key={openingKey}
          reducedMotion={prefersReducedMotion}
          onComplete={startIntroDialogue}
        />
      ) : gamePhase === "clearCutscene" || gamePhase === "gameOverCutscene" ? (
        resultStatus ? (
          <CutsceneScreen type={resultStatus} step={cutsceneStep} />
        ) : null
      ) : gamePhase === "endTitle" && resultStatus ? (
        <EndTitleScreen
          status={resultStatus}
          reducedMotion={prefersReducedMotion}
          onComplete={() => setGamePhase("result")}
        />
      ) : gamePhase === "result" ? (
        <ResultScreen
          clearTimeSeconds={clearTimeSeconds}
          correctCount={correctCount}
          mistakeCount={mistakeCount}
          onRetry={resetGame}
        />
      ) : (
        <div className={styles.gameUi}>
          <div className={styles.status}>
            正解 {correctCount} / 失敗 {mistakeCount} / 間違い可能{" "}
            {mistakesRemaining}
          </div>
          {gamePhase === "question" || gamePhase === "answering" ? (
            <TimerDisplay
              timeLeft={timeLeft}
              warningTime={GAME_CONFIG.warningTimeSeconds}
              mistakesRemaining={mistakesRemaining}
            />
          ) : null}
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
          <Notebook
            isOpen={isNotebookOpen}
            examples={examples}
            page={notebookPage}
            pageCount={pageCount}
            examplesPerPage={GAME_CONFIG.examplesPerNotebookPage}
            newAnimationHalfCycleMs={GAME_CONFIG.newAnimationHalfCycleMs}
            showNew={hasUnreadExamples}
          />
        </div>
      )}
    </main>
  );
}

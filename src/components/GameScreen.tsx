"use client";

import { useEffect, useState } from "react";
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
import type {
  AnswerJudgement,
  DialogueLine,
  ExampleRecord,
  GamePhase,
  Question,
  ResultStatus,
} from "@/lib/gameTypes";
import { judgeAnswer } from "@/lib/judgeAnswer";
import { loadMendeCipherFont } from "@/lib/loadCipherFont";
import { playSound } from "@/lib/sound";
import styles from "./GameScreen.module.css";

const EXAMPLES_PER_PAGE = GAME_CONFIG.examplesPerNotebookPage;

type FeedbackOutcome = "nextRound" | "retry" | "clear" | "gameOver";

function getPrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function canUseNotebook(phase: GamePhase) {
  return (
    phase === "introDialogue" ||
    phase === "exampleDialogue" ||
    phase === "question" ||
    phase === "answering"
  );
}

export function GameScreen() {
  const [dialogueLines, setDialogueLines] =
    useState<DialogueLine[]>(INTRO_DIALOGUES);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>("opening");
  const [openingKey, setOpeningKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Partial<Record<string, string>>
  >({});
  const [answerJudgement, setAnswerJudgement] =
    useState<AnswerJudgement | null>(null);
  const [feedbackOutcome, setFeedbackOutcome] =
    useState<FeedbackOutcome | null>(null);
  const [examples, setExamples] = useState<ExampleRecord[]>([]);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookPage, setNotebookPage] = useState(0);
  const [hasUnreadExamples, setHasUnreadExamples] = useState(false);
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
  const [cutsceneStep, setCutsceneStep] = useState(0);
  const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null);
  const [fontStatus, setFontStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const currentDialogue = dialogueLines[dialogueIndex] ?? null;
  const pageCount = Math.max(
    1,
    Math.ceil(examples.length / EXAMPLES_PER_PAGE),
  );

  const clearTimeSeconds =
    endedAt !== null
      ? Math.floor((endedAt - startedAt) / 1000)
      : 0;

  const allTokensAnswered =
    currentQuestion?.tokens.every((token) => selectedAnswers[token.id]) ??
    false;

  const canSubmitAnswer =
    gamePhase === "answering" &&
    allTokensAnswered &&
    answerJudgement === null;

  function moveToLatestNotebookPage(exampleCount = examples.length) {
    const nextPageCount = Math.max(
      1,
      Math.ceil(exampleCount / EXAMPLES_PER_PAGE),
    );
    setNotebookPage(nextPageCount - 1);
  }

  function notifyNewExamples() {
    if (isNotebookOpen) {
      moveToLatestNotebookPage();
      setHasUnreadExamples(false);
      return;
    }

    setHasUnreadExamples(true);
    playSound("writeNote");
  }

  function startRound(level: number) {
    const round = generateRound(level);
    setDialogueLines(round.dialogueLines);
    setDialogueIndex(0);
    setCurrentQuestion(round.question);
    setExamples((prev) => [...prev, ...round.examples]);
    setSelectedAnswers({});
    setActiveTokenId(null);
    setAnswerJudgement(null);
    setFeedbackOutcome(null);
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    setTimeLeft(GAME_CONFIG.timeLimitSeconds);
    setIsTimedOut(false);
    setGamePhase("exampleDialogue");
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncReducedMotion() {
      setReducedMotion(mediaQuery.matches);
    }

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);
    return () => mediaQuery.removeEventListener("change", syncReducedMotion);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadMendeCipherFont()
      .then((loaded) => {
        if (!cancelled) {
          setFontStatus(loaded ? "ready" : "error");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFontStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleOpeningComplete() {
    setDialogueLines(INTRO_DIALOGUES);
    setDialogueIndex(0);
    setGamePhase("introDialogue");
  }

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
        if (isNotebookOpen) {
          setIsNotebookOpen(false);
          playSound("closeNote");
        } else {
          const nextPageCount = Math.max(
            1,
            Math.ceil(examples.length / EXAMPLES_PER_PAGE),
          );
          setNotebookPage(nextPageCount - 1);
          setHasUnreadExamples(false);
          setIsNotebookOpen(true);
          playSound("openNote");
        }
        return;
      }

      if (!isNotebookOpen) return;

      if (event.key === "a" || event.key === "A") {
        event.preventDefault();
        const nextPage = Math.min(Math.max(notebookPage - 1, 0), pageCount - 1);
        if (nextPage !== notebookPage) {
          playSound("openNote");
          setNotebookPage(nextPage);
        }
        return;
      }

      if (event.key === "d" || event.key === "D") {
        event.preventDefault();
        const nextPage = Math.min(Math.max(notebookPage + 1, 0), pageCount - 1);
        if (nextPage !== notebookPage) {
          playSound("openNote");
          setNotebookPage(nextPage);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gamePhase, isNotebookOpen, notebookPage, pageCount, examples.length]);

  useEffect(() => {
    if (gamePhase !== "answerFeedback" || !feedbackOutcome) return;

    const timerId = window.setTimeout(() => {
      if (feedbackOutcome === "retry") {
        setFeedbackOutcome(null);
        setGamePhase("answering");
        return;
      }

      if (feedbackOutcome === "nextRound") {
        const nextLevel = difficultyLevel + 1;
        setDifficultyLevel(nextLevel);
        startRound(nextLevel);
        return;
      }

      const outcome = feedbackOutcome;
      setIsNotebookOpen(false);
      setFeedbackOutcome(null);

      if (outcome === "clear") {
        setResultStatus("clear");
        setCutsceneStep(0);
        setGamePhase("clearCutscene");
        playSound("drawGun");
        return;
      }

      if (outcome === "gameOver") {
        setResultStatus("gameOver");
        setCutsceneStep(0);
        setGamePhase("gameOverCutscene");
        playSound("drawGun");
      }
    }, GAME_CONFIG.answerFeedbackMs);
    return () => window.clearTimeout(timerId);
  }, [feedbackOutcome, gamePhase, difficultyLevel]);

  useEffect(() => {
    if (gamePhase !== "gameOverCutscene" && gamePhase !== "clearCutscene") {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (cutsceneStep === 1) {
        playSound("gunShot");
      }

      if (cutsceneStep >= 2) {
        setCutsceneStep(0);
        playSound("end");
        setGamePhase("endTitle");
        return;
      }

      setCutsceneStep((prev) => prev + 1);
    }, GAME_CONFIG.cutsceneStepMs);

    return () => window.clearTimeout(timerId);
  }, [gamePhase, cutsceneStep]);

  useEffect(() => {    if (!currentDialogue) return;
    if (
      currentDialogue.type === "cipher" ||
      currentDialogue.type === "translation"
    ) {
      playSound("manTalk");
    }
  }, [currentDialogue, gamePhase]);

  function handleNextDialogue() {
    if (
      gamePhase === "opening" ||
      gamePhase === "endTitle" ||
      gamePhase === "clearCutscene" ||
      gamePhase === "gameOverCutscene" ||
      gamePhase === "result" ||
      gamePhase === "answering" ||
      gamePhase === "answerFeedback"
    ) {      return;
    }
    if (isNotebookOpen) return;

    playSound("dialogueNext");

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
    if (gamePhase === "answerFeedback") return;
    setActiveTokenId(tokenId);
  }

  function handleSelectWord(tokenId: string, value: string) {
    if (gamePhase === "answerFeedback") return;
    if (selectedAnswers[tokenId] === value) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [tokenId]: value,
    }));
    setAnswerJudgement(null);
    setFeedbackOutcome(null);
  }

  function getActiveChoices() {
    if (!currentQuestion || activeTokenId === null) return [];
    return currentQuestion.choiceCandidatesByTokenId[activeTokenId] ?? [];
  }

  function handleSubmitAnswer() {
    if (!currentQuestion || !canSubmitAnswer || answerJudgement) return;

    const judgement = judgeAnswer(currentQuestion, selectedAnswers);
    setAnswerJudgement(judgement);
    setGamePhase("answerFeedback");

    if (judgement.isCorrect) {
      setCorrectCount((count) => count + 1);

      if (difficultyLevel >= GAME_CONFIG.finalLevel) {
        setEndedAt((value) => value ?? Date.now());
        setFeedbackOutcome("clear");
        return;
      }

      setFeedbackOutcome("nextRound");
      return;
    }

    playSound("wrongAnswer");
    setMistakeCount((count) => count + 1);

    if (isTimedOut || mistakesRemaining <= 0) {
      setEndedAt((value) => value ?? Date.now());
      setFeedbackOutcome("gameOver");
      return;
    }

    setMistakesRemaining((count) => Math.max(count - 1, 0));
    setFeedbackOutcome("retry");
  }

  function resetGame() {
    setOpeningKey((key) => key + 1);
    setGamePhase("opening");
    setDialogueLines(INTRO_DIALOGUES);
    setDialogueIndex(0);
    setCurrentQuestion(null);
    setSelectedAnswers({});
    setActiveTokenId(null);
    setAnswerJudgement(null);
    setFeedbackOutcome(null);
    setExamples([]);
    setIsNotebookOpen(false);
    setNotebookPage(0);
    setHasUnreadExamples(false);
    setCorrectCount(0);
    setMistakeCount(0);
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    setDifficultyLevel(1);
    setTimeLeft(GAME_CONFIG.timeLimitSeconds);
    setIsTimedOut(false);
    setStartedAt(Date.now());
    setEndedAt(null);
    setCutsceneStep(0);
    setResultStatus(null);
    setReducedMotion(getPrefersReducedMotion());
  }

  function handleMainClick() {
    if (
      gamePhase === "opening" ||
      gamePhase === "endTitle" ||
      gamePhase === "clearCutscene" ||
      gamePhase === "gameOverCutscene" ||
      gamePhase === "answerFeedback"
    ) {
      return;
    }
    if (gamePhase === "result") {
      resetGame();
      return;
    }

    handleNextDialogue();
  }

  const instruction =
    gamePhase === "opening"
      ? ""
      : gamePhase === "answerFeedback"
        ? "判定結果を表示中"
        : gamePhase === "answering"
          ? "暗号単語を選び、日本語を割り当ててください / Spaceで手帳"
          : gamePhase === "introDialogue"
            ? "左クリックで進む"
            : "左クリックで進む / Spaceで手帳を開く";

  const showTimer =
    gamePhase === "question" ||
    gamePhase === "answering" ||
    gamePhase === "answerFeedback";

  const showChoiceList =
    (gamePhase === "answering" || gamePhase === "answerFeedback") &&
    Boolean(currentQuestion);

  if (fontStatus === "error") {
    return (
      <main className={styles.screen}>
        <p className={styles.fontMessage} role="alert">
          暗号フォントを読み込めません。再読み込みしてください。
        </p>
      </main>
    );
  }

  if (fontStatus !== "ready") {
    return (
      <main className={styles.screen}>
        <p className={styles.fontMessage}>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className={styles.screen} onClick={handleMainClick}>
      {gamePhase === "opening" ? (
        <OpeningBlink
          key={openingKey}
          reducedMotion={reducedMotion}
          onComplete={handleOpeningComplete}
        />
      ) : gamePhase === "clearCutscene" || gamePhase === "gameOverCutscene" ? (
        resultStatus ? (
          <CutsceneScreen type={resultStatus} step={cutsceneStep} />
        ) : null
      ) : gamePhase === "endTitle" && resultStatus ? (
        <EndTitleScreen
          status={resultStatus}
          reducedMotion={reducedMotion}
          onComplete={() => setGamePhase("result")}
        />
      ) : gamePhase === "result" ? (
        <ResultScreen
          clearTimeSeconds={clearTimeSeconds}
          correctCount={correctCount}
          mistakeCount={mistakeCount}
          onRetry={resetGame}
        />
      ) : (        <>
          <div className={styles.status}>
            正解 {correctCount} / 失敗 {mistakeCount} / 間違い可能{" "}
            {mistakesRemaining}
          </div>
          {showTimer ? (
            <TimerDisplay
              timeLeft={timeLeft}
              warningTime={GAME_CONFIG.warningTimeSeconds}
              mistakesRemaining={mistakesRemaining}
            />
          ) : null}
          {currentDialogue ? (
            <DialogueBox line={currentDialogue} instruction={instruction} />
          ) : null}
          {showChoiceList && currentQuestion ? (
            <ChoiceList
              tokens={currentQuestion.tokens}
              choices={getActiveChoices()}
              selectedAnswers={selectedAnswers}
              activeTokenId={activeTokenId}
              canSubmit={canSubmitAnswer}
              disabled={gamePhase === "answerFeedback"}
              judgement={answerJudgement}
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
        </>
      )}
    </main>
  );
}

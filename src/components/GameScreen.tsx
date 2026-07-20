"use client";

import { useEffect, useRef, useState } from "react";
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
  AssetStatus,
  DialogueLine,
  ExampleRecord,
  FontStatus,
  GamePhase,
  Question,
  ResultStatus,
} from "@/lib/gameTypes";
import { judgeAnswer } from "@/lib/judgeAnswer";
import { loadMendeCipherFont } from "@/lib/loadCipherFont";
import { loadOpeningAssets } from "@/lib/loadOpeningAssets";
import { buildNotebookSpreads } from "@/lib/notebookSpreads";
import { playSound, preloadSounds } from "@/lib/sound";
import styles from "./GameScreen.module.css";

type FeedbackOutcome = "nextRound" | "retry" | "clear" | "gameOver";

function getPrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function canUseNotebook(phase: GamePhase) {
  return phase === "answering";
}

function SceneBackdrop() {
  return (
    <div className={styles.room} aria-hidden="true">
      <div className={styles.ceilingGlow} />
      <div className={styles.backWall} />
      <div className={styles.man}>
        <div className={styles.head}>
          <div className={styles.mask}>
            <span className={styles.eyeLeft} />
            <span className={styles.eyeRight} />
          </div>
        </div>
        <div className={styles.body} />
      </div>
      <div className={styles.desk}>
        <div className={styles.deskNotebook}>
          <span className={styles.notebookSpine} />
        </div>
        <div className={styles.pen} />
      </div>
    </div>
  );
}

export function GameScreen() {
  const terminalTransitionStartedRef = useRef(false);
  const [dialogueLines, setDialogueLines] =
    useState<DialogueLine[]>(INTRO_DIALOGUES);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>("opening");
  const [openingKey, setOpeningKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [roundExamples, setRoundExamples] = useState<ExampleRecord[]>([]);
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
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [cutsceneStep, setCutsceneStep] = useState(0);
  const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null);
  const [fontStatus, setFontStatus] = useState<FontStatus>("loading");
  const [openingAssetStatus, setOpeningAssetStatus] =
    useState<AssetStatus>("loading");

  const currentDialogue = dialogueLines[dialogueIndex] ?? null;
  const notebookSpreads = buildNotebookSpreads(
    examples,
    GAME_CONFIG.examplesPerNotebookSpread,
  );
  const pageCount = notebookSpreads.length;
  const currentNotebookSpread =
    notebookSpreads[Math.min(notebookPage, pageCount - 1)];
  const clearTimeSeconds =
    endedAt === null ? 0 : Math.floor((endedAt - startedAt) / 1000);
  const allTokensAnswered =
    currentQuestion?.tokens.every((token) => selectedAnswers[token.id]) ??
    false;
  const canSubmitAnswer =
    gamePhase === "answering" &&
    !isNotebookOpen &&
    timeLeft > 0 &&
    allTokensAnswered &&
    answerJudgement === null;

  function startTerminalCutscene(
    status: ResultStatus,
    terminalAt?: number,
  ) {
    if (terminalTransitionStartedRef.current) return;
    terminalTransitionStartedRef.current = true;

    if (terminalAt !== undefined) {
      setEndedAt((value) => value ?? terminalAt);
    }

    setIsNotebookOpen(false);
    setFeedbackOutcome(null);
    setResultStatus(status);
    setCutsceneStep(0);
    setGamePhase(status === "clear" ? "clearCutscene" : "gameOverCutscene");
    playSound("drawGun");
  }

  function recordRoundExamples() {
    const recordedIds = new Set(examples.map((example) => example.id));
    const newExamples = roundExamples.filter(
      (example) => !recordedIds.has(example.id),
    );

    if (newExamples.length === 0) return;

    setExamples((previous) => {
      const previousIds = new Set(previous.map((example) => example.id));
      return [
        ...previous,
        ...newExamples.filter((example) => !previousIds.has(example.id)),
      ];
    });
    setHasUnreadExamples(true);
    playSound("writeNote");
  }

  function recordCorrectAnswer(
    question: Question,
    answers: Partial<Record<string, string>>,
  ) {
    const answeredQuestion: ExampleRecord = {
      id: `answered-${question.id}`,
      tokens: question.tokens,
      translation: question.tokens
        .map((token) => answers[token.id] ?? question.correctAnswers[token.id])
        .join(" "),
    };

    setExamples((previous) =>
      previous.some((example) => example.id === answeredQuestion.id)
        ? previous
        : [...previous, answeredQuestion],
    );
  }

  function startRound(level: number) {
    const round = generateRound(level);
    setDialogueLines(round.dialogueLines);
    setDialogueIndex(0);
    setCurrentQuestion(round.question);
    setRoundExamples(round.examples);
    setSelectedAnswers({});
    setActiveTokenId(null);
    setAnswerJudgement(null);
    setFeedbackOutcome(null);
    setMistakesRemaining(GAME_CONFIG.safeMistakeCount);
    setTimeLeft(GAME_CONFIG.timeLimitSeconds);
    setGamePhase("exampleDialogue");
  }

  useEffect(() => {
    preloadSounds();
  }, []);

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
        if (!cancelled) setFontStatus(loaded ? "ready" : "error");
      })
      .catch(() => {
        if (!cancelled) setFontStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadOpeningAssets(
      GAME_CONFIG.openingAssetPaths,
      GAME_CONFIG.openingAssetTimeoutMs,
    )
      .then((loaded) => {
        if (!cancelled) setOpeningAssetStatus(loaded ? "ready" : "error");
      })
      .catch(() => {
        if (!cancelled) setOpeningAssetStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (gamePhase !== "answering" || timeLeft <= 0) return;

    const timerId = window.setTimeout(() => {
      const nextTimeLeft = Math.max(timeLeft - 1, 0);
      setTimeLeft(nextTimeLeft);

      if (nextTimeLeft === 0) {
        startTerminalCutscene("gameOver", Date.now());
      }
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

      if (isInteractiveTarget || !canUseNotebook(gamePhase)) return;

      if (event.code === "Space") {
        event.preventDefault();
        if (event.repeat) return;

        if (isNotebookOpen) {
          setIsNotebookOpen(false);
          playSound("closeNote");
        } else {
          setNotebookPage(pageCount - 1);
          setHasUnreadExamples(false);
          setIsNotebookOpen(true);
          playSound("openNote");
        }
        return;
      }

      if (!isNotebookOpen) return;

      if (event.key === "a" || event.key === "A") {
        event.preventDefault();
        if (event.repeat) return;

        const nextPage = Math.max(notebookPage - 1, 0);
        if (nextPage !== notebookPage) {
          setNotebookPage(nextPage);
          playSound("openNote");
        }
        return;
      }

      if (event.key === "d" || event.key === "D") {
        event.preventDefault();
        if (event.repeat) return;

        const nextPage = Math.min(notebookPage + 1, pageCount - 1);
        if (nextPage !== notebookPage) {
          setNotebookPage(nextPage);
          playSound("openNote");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gamePhase, isNotebookOpen, notebookPage, pageCount]);

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

      startTerminalCutscene(
        feedbackOutcome === "clear" ? "clear" : "gameOver",
      );
    }, GAME_CONFIG.answerFeedbackMs);

    return () => window.clearTimeout(timerId);
  }, [difficultyLevel, feedbackOutcome, gamePhase]);

  useEffect(() => {
    if (gamePhase !== "gameOverCutscene" && gamePhase !== "clearCutscene") {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (cutsceneStep === 1) playSound("gunShot");

      if (cutsceneStep >= 2) {
        setCutsceneStep(0);
        setGamePhase("endTitle");
        playSound("end");
        return;
      }

      setCutsceneStep((previous) => previous + 1);
    }, GAME_CONFIG.cutsceneStepMs);

    return () => window.clearTimeout(timerId);
  }, [cutsceneStep, gamePhase]);

  useEffect(() => {
    if (currentDialogue?.speaker === "man") playSound("manTalk");
  }, [currentDialogue]);

  function handleOpeningComplete() {
    setDialogueLines(INTRO_DIALOGUES);
    setDialogueIndex(0);
    setGamePhase("introDialogue");
  }

  function handleNextDialogue() {
    if (
      gamePhase === "opening" ||
      gamePhase === "endTitle" ||
      gamePhase === "clearCutscene" ||
      gamePhase === "gameOverCutscene" ||
      gamePhase === "result" ||
      gamePhase === "answering" ||
      gamePhase === "answerFeedback" ||
      isNotebookOpen
    ) {
      return;
    }

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

    if (gamePhase === "exampleDialogue" && currentQuestion) {
      setDialogueLines([
        {
          id: `question-${currentQuestion.level}-dialogue`,
          text: currentQuestion.tokens
            .map((token) => token.glyphText)
            .join(" "),
          type: "cipher",
          speaker: "man",
        },
      ]);
      setDialogueIndex(0);
      setGamePhase("question");
      return;
    }

    if (gamePhase === "question") {
      recordRoundExamples();
      setGamePhase("answering");
    }
  }

  function handleSelectToken(tokenId: string) {
    if (gamePhase !== "answering" || isNotebookOpen || timeLeft <= 0) return;
    setActiveTokenId(tokenId);
  }

  function handleSelectWord(tokenId: string, value: string) {
    if (gamePhase !== "answering" || isNotebookOpen || timeLeft <= 0) return;
    if (selectedAnswers[tokenId] === value) return;

    setSelectedAnswers((previous) => ({
      ...previous,
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

    const judgedAt = Date.now();
    const judgement = judgeAnswer(currentQuestion, selectedAnswers);
    setAnswerJudgement(judgement);
    setGamePhase("answerFeedback");

    if (judgement.isCorrect) {
      recordCorrectAnswer(currentQuestion, selectedAnswers);
      setCorrectCount((count) => count + 1);

      if (difficultyLevel >= GAME_CONFIG.finalLevel) {
        setEndedAt((value) => value ?? judgedAt);
        setFeedbackOutcome("clear");
      } else {
        setFeedbackOutcome("nextRound");
      }
      return;
    }

    playSound("wrongAnswer");
    setMistakeCount((count) => count + 1);

    if (mistakesRemaining <= 0) {
      setEndedAt((value) => value ?? judgedAt);
      setFeedbackOutcome("gameOver");
      return;
    }

    setMistakesRemaining((count) => Math.max(count - 1, 0));
    setFeedbackOutcome("retry");
  }

  function resetGame() {
    terminalTransitionStartedRef.current = false;
    setOpeningKey((key) => key + 1);
    setGamePhase("opening");
    setDialogueLines(INTRO_DIALOGUES);
    setDialogueIndex(0);
    setCurrentQuestion(null);
    setRoundExamples([]);
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
    gamePhase === "answerFeedback"
      ? "判定結果を表示中"
      : gamePhase === "answering"
        ? "暗号単語を選び、日本語を割り当ててください / Spaceで手帳"
        : gamePhase === "question"
          ? "左クリックで解答を開始"
          : "左クリックで進む";
  const showAnswerDialog =
    (gamePhase === "answering" || gamePhase === "answerFeedback") &&
    currentQuestion !== null;
  const showTimer = showAnswerDialog;

  if (fontStatus === "error" || openingAssetStatus === "error") {
    const message =
      fontStatus === "error"
        ? "暗号フォントを読み込めません。再読み込みしてください。"
        : "ゲーム素材を読み込めません。再読み込みしてください。";

    return (
      <main className={styles.screen}>
        <section className={styles.stage}>
          <SceneBackdrop />
          <p className={styles.loadingMessage} role="alert">
            {message}
          </p>
        </section>
      </main>
    );
  }

  if (fontStatus !== "ready" || openingAssetStatus !== "ready") {
    return (
      <main className={styles.screen}>
        <section className={styles.stage}>
          <SceneBackdrop />
          <p className={styles.loadingMessage}>読み込み中...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.screen} onClick={handleMainClick}>
      <section className={styles.stage} aria-label="暗号解読ゲーム">
        <SceneBackdrop />

        {gamePhase === "opening" ? (
          <OpeningBlink
            key={openingKey}
            reducedMotion={reducedMotion}
            onComplete={handleOpeningComplete}
          />
        ) : gamePhase === "clearCutscene" ||
          gamePhase === "gameOverCutscene" ? (
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
        ) : (
          <>
            {showTimer ? (
              <TimerDisplay
                timeLeft={timeLeft}
                warningTime={GAME_CONFIG.warningTimeSeconds}
                mistakesRemaining={mistakesRemaining}
              />
            ) : null}
            {currentDialogue && !showAnswerDialog ? (
              <DialogueBox
                line={currentDialogue}
                instruction={instruction}
              />
            ) : null}
            {showAnswerDialog && currentQuestion ? (
              <ChoiceList
                tokens={currentQuestion.tokens}
                choices={getActiveChoices()}
                selectedAnswers={selectedAnswers}
                activeTokenId={activeTokenId}
                instruction={instruction}
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
              spread={currentNotebookSpread}
              page={notebookPage}
              pageCount={pageCount}
              newAnimationHalfCycleMs={GAME_CONFIG.newAnimationHalfCycleMs}
              showNew={hasUnreadExamples}
            />
          </>
        )}
      </section>
    </main>
  );
}

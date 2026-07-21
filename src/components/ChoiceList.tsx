"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CipherText } from "./CipherText";
import { GAME_CONFIG } from "@/lib/gameConfig";
import type { AnswerJudgement } from "@/lib/gameTypes";
import styles from "./ChoiceList.module.css";

type QuestionToken = {
  id: string;
  glyphText: string;
};

type ChoiceListProps = {
  tokens: QuestionToken[];
  choices: string[];
  selectedAnswers: Partial<Record<string, string>>;
  activeTokenId: string | null;
  instruction: string;
  canSubmit: boolean;
  disabled: boolean;
  judgement: AnswerJudgement | null;
  clearedJudgementTokenIds: ReadonlySet<string>;
  wrongShakeSequence: number;
  onSelectToken: (tokenId: string) => void;
  onSelectWord: (tokenId: string, value: string) => void;
  onSubmit: () => void;
};

export function ChoiceList({
  tokens,
  choices,
  selectedAnswers,
  activeTokenId,
  instruction,
  canSubmit,
  disabled,
  judgement,
  clearedJudgementTokenIds,
  wrongShakeSequence,
  onSelectToken,
  onSelectWord,
  onSubmit,
}: ChoiceListProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const layoutStyle = {
    "--token-count": Math.max(tokens.length, 1),
    "--wrong-answer-shake-duration": `${GAME_CONFIG.wrongAnswerShakeMs}ms`,
  } as CSSProperties;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || wrongShakeSequence === 0) return;
    const activeDialog: HTMLDivElement = dialog;

    activeDialog.classList.remove(styles.wrongShake);
    void activeDialog.offsetWidth;
    activeDialog.classList.add(styles.wrongShake);

    function handleAnimationEnd() {
      activeDialog.classList.remove(styles.wrongShake);
    }

    activeDialog.addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
    return () =>
      activeDialog.removeEventListener("animationend", handleAnimationEnd);
  }, [wrongShakeSequence]);

  return (
    <section
      className={`${styles.list} ${judgement ? styles.feedback : ""} ${disabled ? styles.locked : ""}`}
      style={layoutStyle}
      aria-label="解答UI"
      onClick={(event) => event.stopPropagation()}
    >
      {judgement ? (
        <p className={styles.judgementCount} aria-live="polite">
          正答 {judgement.correctWordCount} / {judgement.totalWordCount}
        </p>
      ) : null}

      <div
        ref={dialogRef}
        className={styles.answerPanel}
        role="group"
        aria-label="問題と解答欄"
      >
        <div className={styles.questionLine}>
          <div className={styles.tokens}>
            {tokens.map((token, index) => {
              const isActive = activeTokenId === token.id;
              const answer = selectedAnswers[token.id];
              const result = clearedJudgementTokenIds.has(token.id)
                ? undefined
                : judgement?.tokenResults[token.id];
              const answerStateClass =
                result === "correct"
                  ? styles.correctAnswer
                  : result === "incorrect"
                    ? styles.incorrectAnswer
                    : answer
                      ? styles.selectedAnswer
                      : styles.unselectedAnswer;

              return (
                <button
                  key={token.id}
                  className={`${styles.token} ${isActive ? styles.activeToken : ""}`}
                  type="button"
                  disabled={disabled}
                  aria-label={`暗号単語${index + 1}、解答${answer ?? "未選択"}${result ? `、${result === "correct" ? "正答" : "誤答"}` : ""}`}
                  onClick={() => onSelectToken(token.id)}
                >
                  <span className={styles.cipherToken}>
                    <CipherText ariaLabel={`暗号単語${index + 1}`}>
                      {token.glyphText}
                    </CipherText>
                  </span>
                  <span className={`${styles.answerFrame} ${answerStateClass}`}>
                    {answer ?? "未選択"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.words}>
        {choices.map((choice) => (
          <button
            key={choice}
            className={styles.wordButton}
            type="button"
            disabled={disabled || activeTokenId === null}
            onClick={() => {
              if (activeTokenId === null) return;
              onSelectWord(activeTokenId, choice);
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      <button
        className={canSubmit ? styles.submitButton : styles.disabledSubmitButton}
        type="button"
        disabled={disabled || !canSubmit}
        onClick={onSubmit}
      >
        解答する
      </button>
      <p className={styles.instruction}>{instruction}</p>
    </section>
  );
}

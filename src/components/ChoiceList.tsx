import { CipherText } from "./CipherText";
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
  canSubmit: boolean;
  disabled: boolean;
  judgement: AnswerJudgement | null;
  onSelectToken: (tokenId: string) => void;
  onSelectWord: (tokenId: string, value: string) => void;
  onSubmit: () => void;
};

export function ChoiceList({
  tokens,
  choices,
  selectedAnswers,
  activeTokenId,
  canSubmit,
  disabled,
  judgement,
  onSelectToken,
  onSelectWord,
  onSubmit,
}: ChoiceListProps) {
  return (
    <div className={styles.list} onClick={(event) => event.stopPropagation()}>
      {judgement ? (
        <p className={styles.judgementCount} aria-live="polite">
          正答 {judgement.correctWordCount} / {judgement.totalWordCount}
        </p>
      ) : null}

      <div className={styles.tokens}>
        {tokens.map((token, index) => {
          const isActive = activeTokenId === token.id;
          const answer = selectedAnswers[token.id];
          const result = judgement?.tokenResults[token.id];
          const answerClass =
            result === "correct"
              ? styles.correctAnswer
              : result === "incorrect"
                ? styles.incorrectAnswer
                : styles.answer;

          return (
            <button
              key={token.id}
              className={isActive ? styles.activeToken : styles.token}
              type="button"
              disabled={disabled}
              onClick={() => onSelectToken(token.id)}
            >
              <CipherText ariaLabel={`暗号単語${index + 1}`}>
                {token.glyphText}
              </CipherText>
              <span className={answerClass}>{answer ?? "未選択"}</span>
              {result ? (
                <span className={styles.resultLabel}>
                  {result === "correct" ? "正答" : "誤答"}
                </span>
              ) : null}
            </button>
          );
        })}
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
    </div>
  );
}

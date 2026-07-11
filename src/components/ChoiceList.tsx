import styles from "./ChoiceList.module.css";

type QuestionToken = {
  id: string;
  cipher: string;
};

type ChoiceListProps = {
  tokens: QuestionToken[];
  // 選択中の暗号単語に対応する内部カテゴリ内の候補だけを受け取る。
  choices: string[];
  selectedAnswers: Partial<Record<string, string>>;
  activeTokenId: string | null;
  canSubmit: boolean;
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
  onSelectToken,
  onSelectWord,
  onSubmit,
}: ChoiceListProps) {
  return (
    <div className={styles.list} onClick={(event) => event.stopPropagation()}>
      <div className={styles.tokens}>
        {tokens.map((token) => {
          const isActive = activeTokenId === token.id;
          const answer = selectedAnswers[token.id];

          return (
            <button
              key={token.id}
              className={isActive ? styles.activeToken : styles.token}
              type="button"
              onClick={() => onSelectToken(token.id)}
            >
              <span className={styles.cipher}>{token.cipher}</span>
              <span className={styles.answer}>{answer ?? "未選択"}</span>
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
            disabled={activeTokenId === null}
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
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        解答する
      </button>
    </div>
  );
}

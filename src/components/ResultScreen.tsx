import { formatTime } from "@/utils/formatTime";
import styles from "./ResultScreen.module.css";

type ResultScreenProps = {
  clearTimeSeconds: number;
  correctCount: number;
  mistakeCount: number;
  onRetry: () => void;
};

export function ResultScreen({
  clearTimeSeconds,
  correctCount,
  mistakeCount,
  onRetry,
}: ResultScreenProps) {
  return (
    <div className={styles.result}>
      <h1>RESULT</h1>
      <p>クリア時間: {formatTime(clearTimeSeconds)}</p>
      <p>正解回数: {correctCount}</p>
      <p>失敗回数: {mistakeCount}</p>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRetry();
        }}
      >
        リトライ
      </button>
      <p className={styles.instruction}>左クリックでリトライ</p>
    </div>
  );
}

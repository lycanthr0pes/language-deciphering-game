import { SceneCeilingLight } from "./SceneCeilingLight";
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
    <div className={styles.root}>
      <SceneCeilingLight />
      <section className={styles.result} aria-labelledby="result-title">
        <h1 id="result-title">RESULT</h1>
        <dl className={styles.metrics}>
          <div>
            <dt>経過時間</dt>
            <dd>{formatTime(clearTimeSeconds)}</dd>
          </div>
          <div>
            <dt>正解回数</dt>
            <dd>{correctCount}</dd>
          </div>
          <div>
            <dt>失敗回数</dt>
            <dd>{mistakeCount}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRetry();
          }}
        >
          もう一度遊ぶ
        </button>
        <p className={styles.instruction}>左クリックでリトライ</p>
      </section>
    </div>
  );
}

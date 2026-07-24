import type { CSSProperties } from "react";
import styles from "./NotebookIndicator.module.css";

type NotebookIndicatorProps = {
  showNew: boolean;
  newAnimationHalfCycleMs: number;
};

export function NotebookIndicator({
  showNew,
  newAnimationHalfCycleMs,
}: NotebookIndicatorProps) {
  const style = {
    "--new-animation-half-cycle": `${newAnimationHalfCycleMs}ms`,
  } as CSSProperties;

  return (
    <div
      className={styles.indicator}
      style={style}
      aria-label={showNew ? "手帳に新しい例文があります" : undefined}
      aria-live={showNew ? "polite" : undefined}
      aria-hidden={showNew ? undefined : true}
    >
      {showNew ? <span className={styles.newLabel}>NEW</span> : null}
      <svg
        className={styles.icon}
        viewBox="0 0 56 64"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M10 3h34a5 5 0 0 1 5 5v51H10a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Z" />
        <path d="M14 3v56M20 16h21M20 25h21M20 34h17" />
        <path d="M5 10h9M5 20h9M5 30h9M5 40h9M5 50h9" />
      </svg>
      <p className={styles.hint}>Spaceで手帳を開く</p>
    </div>
  );
}

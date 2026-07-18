import { formatTime } from "@/utils/formatTime";
import styles from "./TimerDisplay.module.css";

type TimerDisplayProps = {
  timeLeft: number;
  warningTime: number;
  mistakesRemaining: number;
};

export function TimerDisplay({
  timeLeft,
  warningTime,
  mistakesRemaining,
}: TimerDisplayProps) {
  const isWarning = timeLeft <= warningTime;
  const isDanger = mistakesRemaining <= 0;

  return (
    <div className={styles.timer}>
      <p className={isWarning ? styles.warning : styles.normal}>
        残り時間 {formatTime(timeLeft)}
      </p>
      <p className={isDanger ? styles.warning : styles.subText}>
        間違い可能 {mistakesRemaining}
      </p>
    </div>
  );
}
